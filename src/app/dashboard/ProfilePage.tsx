import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { useAuth, useUserProfile, useUpdateProfile } from '@/hooks/useAuth'
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useNotifications'
import { getInitials } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type ProfileForm = z.infer<typeof profileSchema>

export function ProfilePage() {
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
      <div className="p-6">
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your personal settings</p>
      </div>

      {/* Profile info */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {profile?.name ? getInitials(profile.name) : 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <Button type="button" variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG or GIF. Max 2MB.
                </p>
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
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
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

      {/* Notification preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifications</p>
              <p className="text-sm text-muted-foreground">
                Receive notifications via email
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
                    <p className="text-sm font-medium">New Requests</p>
                    <p className="text-xs text-muted-foreground">
                      When a client submits a new request
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_new_request ?? true}
                    onCheckedChange={(checked) => handleNotificationToggle('email_new_request', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Status Changes</p>
                    <p className="text-xs text-muted-foreground">
                      When a request status is updated
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
                      When someone replies to a request
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_new_reply ?? true}
                    onCheckedChange={(checked) => handleNotificationToggle('email_new_reply', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Assignments</p>
                    <p className="text-xs text-muted-foreground">
                      When you're assigned to a request
                    </p>
                  </div>
                  <Switch
                    checked={preferences?.email_assignment ?? true}
                    onCheckedChange={(checked) => handleNotificationToggle('email_assignment', checked)}
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
