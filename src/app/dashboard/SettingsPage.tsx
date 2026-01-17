import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Upload, X, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAgency, useUpdateAgency, useUploadLogo, useDeleteLogo } from '@/hooks/useAgency'
import { useUserAgency } from '@/hooks/useAuth'
import { TIMEZONES } from '@/lib/constants'
import { toast } from 'sonner'

const settingsSchema = z.object({
  name: z.string().min(2, 'Agency name must be at least 2 characters'),
  timezone: z.string(),
  brand_color: z.string().optional(),
})

type SettingsForm = z.infer<typeof settingsSchema>

export function SettingsPage() {
  const { data: agency, isLoading } = useAgency()
  const { data: userAgency } = useUserAgency()
  const updateAgency = useUpdateAgency()
  const uploadLogo = useUploadLogo()
  const deleteLogo = useDeleteLogo()

  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: agency?.name || '',
      timezone: agency?.timezone || 'UTC',
      brand_color: agency?.brand_color || '',
    },
  })

  const subscription = userAgency?.subscription
  const canUseBranding = subscription?.tier !== 'free'

  const onSubmit = (data: SettingsForm) => {
    updateAgency.mutate(data)
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be less than 2MB')
      return
    }

    // Check file type
    if (!['image/png', 'image/jpeg', 'image/svg+xml'].includes(file.type)) {
      toast.error('Logo must be PNG, JPEG, or SVG')
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)

    // Upload
    uploadLogo.mutate(file, {
      onSuccess: () => setLogoPreview(null),
    })
  }

  const handleLogoDelete = () => {
    deleteLogo.mutate()
    setLogoPreview(null)
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4" />
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-4 bg-muted rounded w-1/3" />
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
        <h1 className="text-2xl font-bold">Agency Settings</h1>
        <p className="text-muted-foreground">Manage your agency configuration</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* General settings */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic agency information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agency Name</Label>
              <Input
                id="name"
                {...register('name')}
                defaultValue={agency?.name}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                defaultValue={agency?.timezone || 'UTC'}
                onValueChange={(value) => setValue('timezone', value, { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>
              Customize your client portal appearance
              {!canUseBranding && (
                <span className="text-primary"> (Upgrade to unlock)</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-40 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
                  {logoPreview || agency?.logo_url ? (
                    <img
                      src={logoPreview || agency?.logo_url || undefined}
                      alt="Logo preview"
                      className="max-h-16 max-w-36 object-contain"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!canUseBranding || uploadLogo.isPending}
                      onClick={() => document.getElementById('logo-upload')?.click()}
                    >
                      {uploadLogo.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      Upload
                    </Button>
                    {agency?.logo_url && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleLogoDelete}
                        disabled={deleteLogo.isPending}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPEG, or SVG. Max 2MB. Recommended: 400x100px
                  </p>
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>
            </div>

            {/* Brand color */}
            <div className="space-y-2">
              <Label htmlFor="brand_color">Brand Color</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="brand_color"
                  type="color"
                  className="w-12 h-10 p-1 cursor-pointer"
                  disabled={!canUseBranding}
                  {...register('brand_color')}
                  defaultValue={agency?.brand_color || '#3B82F6'}
                />
                <Input
                  type="text"
                  placeholder="#3B82F6"
                  className="w-28"
                  disabled={!canUseBranding}
                  value={watch('brand_color') || ''}
                  onChange={(e) => setValue('brand_color', e.target.value, { shouldDirty: true })}
                />
              </div>
              {!canUseBranding && (
                <p className="text-sm text-muted-foreground">
                  Brand color is available on Starter plan and above
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={!isDirty || updateAgency.isPending}>
            {updateAgency.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
