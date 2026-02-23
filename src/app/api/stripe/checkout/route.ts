import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createStripeClient } from "@/lib/stripe/client"
import { getURL } from "@/lib/get-url"
import type { Tables } from "@/types/database"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Check if user already has paid tier
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    const profile = data as Tables<"user_profiles"> | null

    if (
      profile?.diagnostico_purchased_at ||
      profile?.subscription_tier === "diagnostico" ||
      profile?.subscription_tier === "pro"
    ) {
      return NextResponse.json(
        { error: "Você já possui o diagnóstico completo" },
        { status: 400 }
      )
    }

    const stripe = createStripeClient()
    const baseUrl = getURL()

    // Create or retrieve Stripe customer
    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      })
      customerId = customer.id

      // Persist stripe_customer_id
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("user_profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id)
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "brl",
            unit_amount: 2900, // R$29.00
            product_data: {
              name: "Diagnóstico Tributário Completo",
              description:
                "Relatório completo com projeções, checklist de adequação e exportação em PDF",
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        supabase_user_id: user.id,
      },
      success_url: `${baseUrl}diagnostico?unlocked=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}checkout`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json(
      { error: "Erro ao criar sessão de pagamento" },
      { status: 500 }
    )
  }
}
