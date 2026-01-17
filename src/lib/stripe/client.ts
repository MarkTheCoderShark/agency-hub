import { loadStripe, Stripe } from '@stripe/stripe-js'

let stripePromise: Promise<Stripe | null> | null = null

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    if (!publishableKey) {
      console.warn('Stripe publishable key not configured')
      return Promise.resolve(null)
    }
    stripePromise = loadStripe(publishableKey)
  }
  return stripePromise
}

// Stripe price IDs for each tier (configure in Stripe dashboard)
export const STRIPE_PRICES = {
  starter: {
    monthly: 'price_starter_monthly',
    annual: 'price_starter_annual',
  },
  growth: {
    monthly: 'price_growth_monthly',
    annual: 'price_growth_annual',
  },
  scale: {
    monthly: 'price_scale_monthly',
    annual: 'price_scale_annual',
  },
} as const

export type StripePrice = typeof STRIPE_PRICES
export type TierId = keyof StripePrice
export type BillingInterval = 'monthly' | 'annual'
