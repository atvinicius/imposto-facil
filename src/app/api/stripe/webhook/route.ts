import { NextResponse } from "next/server"
import { createStripeClient } from "@/lib/stripe/client"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 }
    )
  }

  const stripe = createStripeClient()

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook signature verification failed:", message)
    return NextResponse.json(
      { error: `Webhook Error: ${message}` },
      { status: 400 }
    )
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const userId = session.metadata?.supabase_user_id

    if (!userId) {
      console.error("No supabase_user_id in session metadata")
      return NextResponse.json(
        { error: "Missing user ID in metadata" },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from("user_profiles")
      .update({
        subscription_tier: "diagnostico",
        diagnostico_purchased_at: new Date().toISOString(),
        stripe_customer_id: session.customer as string,
        diagnostico_runs_remaining: 3,
      })
      .eq("id", userId)

    if (error) {
      console.error("Error updating user profile:", error)
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ received: true })
}
