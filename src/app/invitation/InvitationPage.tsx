import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { getInvitationByToken } from '@/lib/supabase/database'
import { acceptStaffInvitation, acceptClientInvitation } from '@/lib/supabase/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

const acceptSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type AcceptForm = z.infer<typeof acceptSchema>

export function InvitationPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [isAccepting, setIsAccepting] = useState(false)
  const [accepted, setAccepted] = useState(false)

  const { data: invitationData, isLoading, error } = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => getInvitationByToken(token!),
    enabled: !!token,
    retry: false,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptForm>({
    resolver: zodResolver(acceptSchema),
  })

  const invitation = invitationData?.invitation
  const invitationType = invitationData?.type

  // Check if invitation is expired
  const isExpired = invitation?.invitation_expires_at
    ? new Date(invitation.invitation_expires_at) < new Date()
    : false

  // Check if already accepted
  const isAlreadyAccepted = invitation?.user_id !== null

  const onSubmit = async (data: AcceptForm) => {
    if (!token) return

    setIsAccepting(true)
    try {
      if (invitationType === 'staff') {
        await acceptStaffInvitation(token, data.password, data.name)
        toast.success('Welcome to the team!')
        setAccepted(true)
        setTimeout(() => navigate('/'), 2000)
      } else {
        const result = await acceptClientInvitation(token, data.password, data.name)
        toast.success('Account created successfully!')
        setAccepted(true)
        const agency = (result.project as any)?.agency
        setTimeout(() => navigate(`/portal/${agency?.slug || ''}`), 2000)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept invitation')
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid or has been revoked.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Go to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle>Invitation Expired</CardTitle>
            <CardDescription>
              This invitation has expired. Please ask for a new invitation.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/login" className="w-full">
              <Button variant="outline" className="w-full">
                Go to Login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isAlreadyAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Already Accepted</CardTitle>
            <CardDescription>
              This invitation has already been accepted. Please sign in.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link to="/login" className="w-full">
              <Button className="w-full">Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (accepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Welcome!</CardTitle>
            <CardDescription>
              Your account has been created. Redirecting...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const agencyName =
    invitationType === 'staff'
      ? (invitation as any).agency?.name
      : (invitation as any).project?.agency?.name

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {invitationType === 'staff' ? 'Join the Team' : 'Accept Invitation'}
          </CardTitle>
          <CardDescription>
            You've been invited to{' '}
            {invitationType === 'staff' ? 'join' : 'collaborate with'}{' '}
            <strong>{agencyName}</strong>
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isAccepting}>
              {isAccepting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept & Create Account
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
