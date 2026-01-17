import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useAuth, useUserProfile, useUpdateProfile } from '@/hooks/useAuth'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useNotifications'
import { getInitials } from '@/lib/utils'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type ProfileForm = z.infer<typeof profileSchema>

export function PortalSettingsPage() {
  const { user } = useAuth()
  const { data: profile, isLoading } = useUserProfile()
  const updateProfile = useUpdateProfile()
  const { data: preferences } = useNotificationPreferences()
  const updatePreferences = useUpdateNotificationPreferences()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
    },
  })

  const onSubmit = (data: ProfileForm) => {
    updateProfile.mutate(data)
  }

  const handleNotificationToggle = (key: string, value: boolean) => {
    updatePreferences.mutate({ [key]: value })
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted" />
              <div className="h-10 bg-muted rounded" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {profile?.name ? getInitials(profile.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{profile?.name}</p>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>

            <Separator />

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register('name')}
                defaultValue={profile?.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Email (read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={!isDirty || updateProfile.isPending}>
                {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>How you receive updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive updates about your requests via email
              </p>
            </div>
            <Switch
              checked={preferences?.email_enabled ?? true}
              onCheckedChange={(checked) => handleNotificationToggle('email_enabled', checked)}
            />
          </div>

          {preferences?.email_enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Status Updates</p>
                    <p className="text-xs text-muted-foreground">
                      When your request status changes
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_status_change ?? true}
                    onCheckedChange={(checked) => handleNotificationToggle('email_status_change', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">New Replies</p>
                    <p className="text-xs text-muted-foreground">
                      When someone responds to your request
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_new_reply ?? true}
                    onCheckedChange={(checked) => handleNotificationToggle('email_new_reply', checked)}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
