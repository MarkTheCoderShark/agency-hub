import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSignIn } from '@/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function PortalLoginPage() {
  const { slug } = useParams<{ slug: string }>()
  const signIn = useSignIn()

  const { data: agency, isLoading: agencyLoading } = useQuery({
    queryKey: ['portal-agency', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agencies')
        .select('*')
        .eq('slug', slug)
        .single()

      if (error) throw error
      return data
    },
    enabled: !!slug,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    signIn.mutate(data)
  }

  if (agencyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="h-16 border-b flex items-center justify-center">
        {agency?.logo_url ? (
          <img
            src={agency.logo_url}
            alt={agency.name}
            className="h-8 max-w-[180px] object-contain"
          />
        ) : (
          <span className="font-semibold text-xl">{agency?.name}</span>
        )}
      </header>

      {/* Login form */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Client Portal</CardTitle>
            <CardDescription>
              Sign in to access your projects with {agency?.name}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={signIn.isPending}>
                {signIn.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>
            </CardContent>
          </form>
        </Card>
      </main>

      {/* Footer */}
      {!agency?.subscription?.white_label_enabled && (
        <footer className="h-12 border-t flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            Powered by AgencyHub
          </p>
        </footer>
      )}
    </div>
  )
}
