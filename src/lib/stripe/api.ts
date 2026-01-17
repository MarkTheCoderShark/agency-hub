import { supabase } from '@/lib/supabase/client'

// Note: In production, these functions would call Supabase Edge Functions
// that securely interact with Stripe's server-side API.
// For this implementation, we're setting up the client-side structure.

export interface CreateCheckoutSessionParams {
  agencyId: string
  priceId: string
  successUrl?: string
  cancelUrl?: string
}

export interface CreateCheckoutSessionResponse {
  sessionId: string
  url: string
}

/**
 * Create a Stripe Checkout Session for subscription
 * This should call a Supabase Edge Function that:
 * 1. Validates the user's permissions
 * 2. Creates or retrieves the Stripe customer
 * 3. Creates a checkout session with the specified price
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CreateCheckoutSessionResponse> {
  const { data, error } = await supabase.functions.invoke('create-checkout-session', {
    body: {
      agencyId: params.agencyId,
      priceId: params.priceId,
      successUrl: params.successUrl || `${window.location.origin}/settings/billing?success=true`,
      cancelUrl: params.cancelUrl || `${window.location.origin}/settings/billing?canceled=true`,
    },
  })

  if (error) throw error
  return data as CreateCheckoutSessionResponse
}

export interface CreateBillingPortalParams {
  agencyId: string
  returnUrl?: string
}

export interface CreateBillingPortalResponse {
  url: string
}

/**
 * Create a Stripe Billing Portal session
 * This should call a Supabase Edge Function that:
 * 1. Validates the user is an agency owner
 * 2. Creates a billing portal session for the agency's Stripe customer
 */
export async function createBillingPortalSession(
  params: CreateBillingPortalParams
): Promise<CreateBillingPortalResponse> {
  const { data, error } = await supabase.functions.invoke('create-billing-portal-session', {
    body: {
      agencyId: params.agencyId,
      returnUrl: params.returnUrl || `${window.location.origin}/settings/billing`,
    },
  })

  if (error) throw error
  return data as CreateBillingPortalResponse
}

/**
 * Get subscription details for an agency
 */
export async function getSubscriptionDetails(agencyId: string) {
  const { data, error } = await supabase
    .from('agency_subscriptions')
    .select('*')
    .eq('agency_id', agencyId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

/**
 * Get tier limits from the database
 */
export async function getTierLimits() {
  const { data, error } = await supabase
    .from('tier_limits')
    .select('*')
    .order('monthly_price_cents', { ascending: true })

  if (error) throw error
  return data
}
