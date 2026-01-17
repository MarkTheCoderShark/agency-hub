import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Check, Loader2, ExternalLink, CreditCard, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUserAgency } from '@/hooks/useAuth'
import { useCheckout, useBillingPortal, useSubscription } from '@/hooks/useBilling'
import type { TierId, BillingInterval } from '@/lib/stripe/client'
import { cn, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface TierConfig {
  name: string
  id: TierId | 'free'
  monthlyPrice: number
  annualPrice: number
  description: string
  popular?: boolean
  features: string[]
}

const tiers: TierConfig[] = [
  {
    name: 'Free',
    id: 'free',
    monthlyPrice: 0,
    annualPrice: 0,
    description: 'For trying out the platform',
    features: [
      '3 active clients',
      '3 projects',
      '2 staff members',
      '1 GB storage',
      'Email notifications',
      'Client portal',
    ],
  },
  {
    name: 'Starter',
    id: 'starter',
    monthlyPrice: 29,
    annualPrice: 290,
    description: 'For freelancers and small agencies',
    features: [
      '10 active clients',
      'Unlimited projects',
      '5 staff members',
      '10 GB storage',
      'Logo branding',
      'Basic activity log',
    ],
  },
  {
    name: 'Growth',
    id: 'growth',
    monthlyPrice: 79,
    annualPrice: 790,
    description: 'Most popular for established agencies',
    popular: true,
    features: [
      '25 active clients',
      'Unlimited projects',
      'Unlimited staff',
      '50 GB storage',
      'Full branding (logo + colors)',
      'Advanced activity log',
      'Realtime updates',
      'CSV import',
    ],
  },
  {
    name: 'Scale',
    id: 'scale',
    monthlyPrice: 149,
    annualPrice: 1490,
    description: 'For larger agencies with high volume',
    features: [
      '50 active clients',
      'Unlimited everything',
      '200 GB storage',
      'Full branding',
      'API access',
      'Webhooks',
      'Export functionality',
      'Priority support + SLA',
    ],
  },
]

export function BillingPage() {
  const [searchParams] = useSearchParams()
  const [billingInterval, setBillingInterval] = useState<BillingInterval>('monthly')

  const { data: agency } = useUserAgency()
  const { data: subscription } = useSubscription()
  const checkout = useCheckout()
  const billingPortal = useBillingPortal()

  const currentTier = subscription?.tier || 'free'

  // Show success/canceled message from URL params
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Subscription updated successfully!')
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Checkout canceled')
    }
  }, [searchParams])

  const handleUpgrade = (tierId: TierId) => {
    checkout.mutate({ tierId, interval: billingInterval })
  }

  const handleManageBilling = () => {
    billingPortal.mutate()
  }

  const getTierIndex = (tierId: string) => {
    return tiers.findIndex((t) => t.id === tierId)
  }

  const isCurrentTier = (tierId: string) => tierId === currentTier
  const isDowngrade = (tierId: string) => getTierIndex(tierId) < getTierIndex(currentTier)

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {/* Current subscription info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                You are currently on the{' '}
                <strong className="text-foreground">
                  {tiers.find((t) => t.id === currentTier)?.name || 'Free'}
                </strong>{' '}
                plan
              </CardDescription>
            </div>
            {subscription?.status && (
              <Badge
                variant={subscription.status === 'active' ? 'default' : 'destructive'}
              >
                {subscription.status}
              </Badge>
            )}
          </div>
        </CardHeader>
        {subscription && currentTier !== 'free' && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {subscription.current_period_end && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Next billing date</p>
                    <p className="font-medium">
                      {formatDate(subscription.current_period_end)}
                    </p>
                  </div>
                </div>
              )}
              {subscription.cancel_at_period_end && (
                <Alert variant="destructive" className="col-span-full">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Subscription ending</AlertTitle>
                  <AlertDescription>
                    Your subscription will end on{' '}
                    {formatDate(subscription.current_period_end!)}.
                    Your plan will revert to Free after this date.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        )}
        <CardFooter className="flex gap-2">
          {currentTier !== 'free' && (
            <Button
              variant="outline"
              onClick={handleManageBilling}
              disabled={billingPortal.isPending}
            >
              {billingPortal.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <CreditCard className="mr-2 h-4 w-4" />
              Manage Billing
            </Button>
          )}
          {subscription?.stripe_subscription_id && (
            <Button
              variant="ghost"
              onClick={handleManageBilling}
              disabled={billingPortal.isPending}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Invoices
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Billing interval toggle */}
      <div className="flex justify-center">
        <Tabs
          value={billingInterval}
          onValueChange={(value) => setBillingInterval(value as BillingInterval)}
        >
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="annual">
              Annual
              <Badge variant="secondary" className="ml-2">
                Save 17%
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Pricing tiers */}
      <div className="grid gap-6 lg:grid-cols-4">
        {tiers.map((tier) => {
          const price =
            billingInterval === 'monthly' ? tier.monthlyPrice : tier.annualPrice
          const perMonth =
            billingInterval === 'monthly'
              ? tier.monthlyPrice
              : Math.round(tier.annualPrice / 12)

          return (
            <Card
              key={tier.id}
              className={cn(
                'relative flex flex-col',
                tier.popular && 'border-primary shadow-md',
                isCurrentTier(tier.id) && 'bg-muted/50'
              )}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              {isCurrentTier(tier.id) && (
                <Badge variant="secondary" className="absolute -top-2 right-4">
                  Current
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${perMonth}</span>
                  <span className="text-muted-foreground">/month</span>
                  {billingInterval === 'annual' && (
                    <p className="text-sm text-muted-foreground mt-1">
                      ${price} billed annually
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isCurrentTier(tier.id) ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : tier.id === 'free' ? (
                  <Button className="w-full" variant="outline" disabled>
                    {isDowngrade(tier.id) ? 'Downgrade via Portal' : 'Free'}
                  </Button>
                ) : isDowngrade(tier.id) ? (
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={handleManageBilling}
                    disabled={billingPortal.isPending}
                  >
                    Manage Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(tier.id as TierId)}
                    disabled={checkout.isPending}
                  >
                    {checkout.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Upgrade
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Enterprise */}
      <Card>
        <CardHeader>
          <CardTitle>Enterprise</CardTitle>
          <CardDescription>
            Need more than 50 active clients or custom requirements?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Unlimited active clients
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              SSO / SAML
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Custom domain
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Dedicated support
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              White-label options
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Custom integrations
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              SLA guarantee
            </li>
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-primary" />
              Volume discounts
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            onClick={() => window.open('mailto:sales@agencyhub.com', '_blank')}
          >
            Contact Sales
          </Button>
        </CardFooter>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Can I change my plan at any time?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade at any time. Upgrades take effect
              immediately, while downgrades take effect at the end of your billing
              cycle.
            </p>
          </div>
          <div>
            <h4 className="font-medium">What counts as an "active client"?</h4>
            <p className="text-sm text-muted-foreground">
              An active client is any client with at least one open (non-completed)
              request in the last 30 days.
            </p>
          </div>
          <div>
            <h4 className="font-medium">What happens if I exceed my limits?</h4>
            <p className="text-sm text-muted-foreground">
              We'll notify you when you're approaching limits. You can either
              upgrade your plan or purchase add-ons for additional capacity.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Do you offer refunds?</h4>
            <p className="text-sm text-muted-foreground">
              We offer a 14-day money-back guarantee for new subscriptions. Contact
              support if you're not satisfied.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
