import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useUserAgency } from '@/hooks/useAuth'
import { TIERS } from '@/lib/constants'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Free',
    id: 'free',
    price: 0,
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
    price: 29,
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
    price: 79,
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
    price: 149,
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
  const { data: agency } = useUserAgency()
  const currentTier = agency?.subscription?.tier || 'free'

  const handleUpgrade = (tierId: string) => {
    // TODO: Implement Stripe checkout
    console.log('Upgrade to:', tierId)
  }

  const handleManageBilling = () => {
    // TODO: Implement Stripe billing portal
    console.log('Open billing portal')
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Billing & Plans</h1>
        <p className="text-muted-foreground">Manage your subscription and billing</p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>
            You are currently on the <strong className="text-foreground">{TIERS[currentTier as keyof typeof TIERS]?.name || 'Free'}</strong> plan
          </CardDescription>
        </CardHeader>
        {currentTier !== 'free' && (
          <CardFooter>
            <Button variant="outline" onClick={handleManageBilling}>
              Manage Billing
            </Button>
          </CardFooter>
        )}
      </Card>

      {/* Pricing tiers */}
      <div className="grid gap-6 lg:grid-cols-4">
        {tiers.map((tier) => {
          const isCurrentTier = tier.id === currentTier
          const isDowngrade = tiers.findIndex(t => t.id === tier.id) < tiers.findIndex(t => t.id === currentTier)

          return (
            <Card
              key={tier.id}
              className={cn(
                'relative',
                tier.popular && 'border-primary shadow-md'
              )}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${tier.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
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
                {isCurrentTier ? (
                  <Button className="w-full" variant="outline" disabled>
                    Current Plan
                  </Button>
                ) : isDowngrade ? (
                  <Button className="w-full" variant="outline" disabled>
                    Downgrade
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    variant={tier.popular ? 'default' : 'outline'}
                    onClick={() => handleUpgrade(tier.id)}
                  >
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
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline">Contact Sales</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
