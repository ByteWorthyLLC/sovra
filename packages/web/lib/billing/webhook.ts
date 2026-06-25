import type Stripe from 'stripe'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getStripe } from './client'

function stripeTimestampToIso(timestamp: number | null | undefined): string | null {
  return timestamp ? new Date(timestamp * 1000).toISOString() : null
}

function getSubscriptionPeriodEnd(subscription: Stripe.Subscription): string | null {
  return stripeTimestampToIso(subscription.items.data[0]?.current_period_end)
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  const subscription = invoice.parent?.subscription_details?.subscription
  if (!subscription) return null
  return typeof subscription === 'string' ? subscription : subscription.id
}

export function verifyWebhookSignature(
  rawBody: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = getStripe()
  return stripe.webhooks.constructEvent(rawBody, signature, secret)
}

export async function handleWebhookEvent(
  event: Stripe.Event,
  supabase: SupabaseClient
): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const tenantId = session.metadata?.tenant_id
      if (!tenantId || !session.subscription) break

      await supabase.from('subscriptions').upsert({
        stripe_subscription_id: String(session.subscription),
        stripe_customer_id: String(session.customer),
        tenant_id: tenantId,
        plan: session.metadata?.plan ?? 'pro',
        status: 'active',
      })
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({
          status: sub.status === 'active' ? 'active' : sub.status,
          current_period_end: getSubscriptionPeriodEnd(sub),
        })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.paused': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'paused' })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'customer.subscription.resumed': {
      const sub = event.data.object as Stripe.Subscription
      await supabase
        .from('subscriptions')
        .update({ status: 'active' })
        .eq('stripe_subscription_id', sub.id)
      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const subscriptionId = getInvoiceSubscriptionId(invoice)
      if (subscriptionId) {
        await supabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId)
      }
      break
    }

    default:
      // Unhandled event types are expected — Stripe sends many event types
      break
  }
}
