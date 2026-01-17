import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export function VerifyEmailPage() {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>
          We've sent you a verification link. Click the link in the email to verify
          your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center text-sm text-muted-foreground">
        <p>Didn't receive the email? Check your spam folder or try signing up again.</p>
      </CardContent>
      <CardFooter>
        <Link to="/login" className="w-full">
          <Button variant="outline" className="w-full">
            Back to sign in
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
