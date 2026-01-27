import OpenAI from "openai"

export function createEmbeddingsClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const client = createEmbeddingsClient()

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  })

  return response.data[0].embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const client = createEmbeddingsClient()

  const response = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  })

  return response.data.map((d) => d.embedding)
}
