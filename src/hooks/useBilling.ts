import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getStripe, STRIPE_PRICES, TierId, BillingInterval } from '@/lib/stripe/client'
import {
  createCheckoutSession,
  createBillingPortalSession,
  getSubscriptionDetails,
  getTierLimits,
} from '@/lib/stripe/api'
import { useUserAgency } from './useAuth'

/**
 * Hook to get subscription details for the current agency
 */
export function useSubscription() {
  const { data: agency } = useUserAgency()
  const agencyId = agency?.id

  return useQuery({
    queryKey: ['subscription', agencyId],
    queryFn: () => getSubscriptionDetails(agencyId!),
    enabled: !!agencyId,
  })
}

/**
 * Hook to get tier limits
 */
export function useTierLimits() {
  return useQuery({
    queryKey: ['tier-limits'],
    queryFn: getTierLimits,
    staleTime: 1000 * 60 * 60, // 1 hour - tier limits don't change often
  })
}

/**
 * Hook to start a checkout session for upgrading subscription
 */
export function useCheckout() {
  const { data: agency } = useUserAgency()
  const agencyId = agency?.id

  return useMutation({
    mutationFn: async ({
      tierId,
      interval = 'monthly',
    }: {
      tierId: TierId
      interval?: BillingInterval
    }) => {
      if (!agencyId) throw new Error('No agency found')

      const priceId = STRIPE_PRICES[tierId][interval]
      const { url } = await createCheckoutSession({
        agencyId,
        priceId,
      })

      // Get Stripe instance and redirect to checkout
      const stripe = await getStripe()
      if (!stripe) {
        // If Stripe isn't configured, redirect to URL directly
        window.location.href = url
        return
      }

      // Redirect using Stripe.js for better UX
      window.location.href = url
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to start checkout')
    },
  })
}

/**
 * Hook to open the Stripe Billing Portal
 */
export function useBillingPortal() {
  const { data: agency } = useUserAgency()
  const agencyId = agency?.id

  return useMutation({
    mutationFn: async () => {
      if (!agencyId) throw new Error('No agency found')

      const { url } = await createBillingPortalSession({
        agencyId,
      })

      // Redirect to billing portal
      window.location.href = url
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to open billing portal')
    },
  })
}

/**
 * Hook to handle subscription change (upgrade/downgrade)
 */
export function useChangeSubscription() {
  const { data: agency } = useUserAgency()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      tierId,
      interval = 'monthly',
    }: {
      tierId: TierId
      interval?: BillingInterval
    }) => {
      if (!agency?.id) throw new Error('No agency found')

      // If user already has a subscription, use billing portal
      if (agency.subscription?.stripe_subscription_id) {
        const { url } = await createBillingPortalSession({
          agencyId: agency.id,
        })
        window.location.href = url
        return
      }

      // Otherwise, create new checkout session
      const priceId = STRIPE_PRICES[tierId][interval]
      const { url } = await createCheckoutSession({
        agencyId: agency.id,
        priceId,
      })
      window.location.href = url
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
      queryClient.invalidateQueries({ queryKey: ['agency'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to change subscription')
    },
  })
}

/**
 * Check if a feature is available for the current subscription tier
 */
export function useFeatureCheck() {
  const { data: agency } = useUserAgency()
  const tier = agency?.subscription?.tier || 'free'

  const tierFeatures: Record<string, string[]> = {
    free: ['email_notifications', 'client_portal'],
    starter: ['email_notifications', 'client_portal', 'logo_branding', 'basic_activity_log'],
    growth: [
      'email_notifications',
      'client_portal',
      'logo_branding',
      'basic_activity_log',
      'full_branding',
      'advanced_activity_log',
      'realtime_updates',
      'csv_import',
    ],
    scale: [
      'email_notifications',
      'client_portal',
      'logo_branding',
      'basic_activity_log',
      'full_branding',
      'advanced_activity_log',
      'realtime_updates',
      'csv_import',
      'api_access',
      'webhooks',
      'export',
      'priority_support',
    ],
    enterprise: [
      // All features
      'email_notifications',
      'client_portal',
      'logo_branding',
      'basic_activity_log',
      'full_branding',
      'advanced_activity_log',
      'realtime_updates',
      'csv_import',
      'api_access',
      'webhooks',
      'export',
      'priority_support',
      'sso',
      'custom_domain',
      'white_label',
    ],
  }

  return {
    tier,
    hasFeature: (feature: string) => tierFeatures[tier]?.includes(feature) || false,
    features: tierFeatures[tier] || [],
  }
}
