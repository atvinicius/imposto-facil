import { createClient } from "@/lib/supabase/server"
import { createOpenRouterClient, DEFAULT_MODEL, SYSTEM_PROMPT, isValidModel } from "@/lib/openrouter/client"
import { hybridSearch } from "@/lib/embeddings/search"

export const runtime = "edge"

export async function POST(request: Request) {
  try {
    const { messages, conversationId, model: requestedModel } = await request.json()

    // Validate and use requested model or fall back to default
    const model = requestedModel && isValidModel(requestedModel) ? requestedModel : DEFAULT_MODEL

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Mensagens sao obrigatorias" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Nao autorizado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      )
    }

    // Get user profile for context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: profile } = await (supabase as any)
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single() as { data: { nome?: string; uf?: string; setor?: string; porte_empresa?: string; regime_tributario?: string; faturamento?: string; nivel_experiencia?: string; interesses?: string[]; simulator_result?: { riskLevel?: string; impactRange?: { min: number; max: number } } } | null }

    // Get the last user message for context search
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === "user").pop()

    // Map experience level to difficulty for search filtering
    const difficultyMap: Record<string, string> = {
      "Iniciante": "basico",
      "Basico": "basico",
      "Intermediario": "intermediario",
      "Avancado": "avancado",
      "Especialista": "avancado",
    }

    const searchDifficulty = profile?.nivel_experiencia ? difficultyMap[profile.nivel_experiencia] : undefined

    // Search knowledge base with user profile context
    let knowledgeContext = ""
    let sources: { title: string; category: string; path: string }[] = []

    if (lastUserMessage?.content) {
      const searchResults = await hybridSearch(lastUserMessage.content, {
        limit: 3,
        ...(searchDifficulty ? { difficulty: searchDifficulty } : {}),
      })

      if (searchResults.length > 0) {
        sources = searchResults.map((r) => ({
          title: r.title,
          category: r.category,
          path: r.sourcePath,
        }))

        knowledgeContext = searchResults
          .map((r) => `### ${r.title}\n${r.content}`)
          .join("\n\n---\n\n")
      }
    }

    // Build user context
    let userContext = "Nenhum contexto de usuario disponivel."
    if (profile) {
      const contextParts = []
      if (profile.nome) contextParts.push(`Nome: ${profile.nome}`)
      if (profile.uf) contextParts.push(`Estado (UF): ${profile.uf}`)
      if (profile.setor) contextParts.push(`Setor: ${profile.setor}`)
      if (profile.porte_empresa) contextParts.push(`Porte da empresa: ${profile.porte_empresa}`)
      if (profile.regime_tributario) contextParts.push(`Regime tributario: ${profile.regime_tributario}`)
      if (profile.faturamento) contextParts.push(`Faixa de faturamento: ${profile.faturamento}`)
      if (profile.nivel_experiencia) {
        contextParts.push(`Nivel de experiencia com tributacao: ${profile.nivel_experiencia}`)
        // Add tone guidance based on experience level
        if (profile.nivel_experiencia === "Iniciante" || profile.nivel_experiencia === "Basico") {
          contextParts.push(`INSTRUCAO: Este usuario tem pouca experiencia com tributacao. Use linguagem simples, evite jargao tecnico, e explique siglas (IBS, CBS, etc.) quando mencionadas pela primeira vez.`)
        } else if (profile.nivel_experiencia === "Avancado" || profile.nivel_experiencia === "Especialista") {
          contextParts.push(`INSTRUCAO: Este usuario tem experiencia avancada com tributacao. Pode usar terminologia tecnica livremente e focar em detalhes operacionais e estrategicos.`)
        }
      }
      if (profile.interesses && profile.interesses.length > 0) contextParts.push(`Interesses: ${profile.interesses.join(", ")}`)
      if (profile.simulator_result) {
        const sim = profile.simulator_result
        if (sim.riskLevel) contextParts.push(`Nivel de risco (simulador): ${sim.riskLevel}`)
        if (sim.impactRange) contextParts.push(`Faixa de impacto estimado: R$${sim.impactRange.min} a R$${sim.impactRange.max}`)
      }
      if (contextParts.length > 0) {
        userContext = contextParts.join("\n")
      }
    }

    // Build system prompt
    const systemPrompt = SYSTEM_PROMPT
      .replace("{{USER_CONTEXT}}", userContext)
      .replace(
        "{{KNOWLEDGE_CONTEXT}}",
        knowledgeContext || "Nenhum conteudo relevante encontrado na base de conhecimento."
      )

    // Create OpenRouter client
    const client = createOpenRouterClient()

    // Create streaming response
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 2048,
    })

    // Create a TransformStream to handle the streaming
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = ""

          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ""
            fullContent += content

            // Send the chunk as SSE
            const data = JSON.stringify({ content, sources: sources.length > 0 ? sources : undefined })
            controller.enqueue(encoder.encode(`data: ${data}\n\n`))
          }

          // Save messages to database if conversationId is provided
          if (conversationId && fullContent) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).from("messages").insert([
              {
                conversation_id: conversationId,
                role: "user",
                content: lastUserMessage.content,
              },
              {
                conversation_id: conversationId,
                role: "assistant",
                content: fullContent,
                sources: sources.length > 0 ? sources : null,
              },
            ])

            // Update conversation timestamp
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any)
              .from("conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", conversationId)
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"))
          controller.close()
        } catch (error) {
          console.error("Streaming error:", error)
          controller.error(error)
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({ error: "Erro interno do servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
