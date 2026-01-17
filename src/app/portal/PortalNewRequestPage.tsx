import { useNavigate, useParams, useOutletContext } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useCreateRequest } from '@/hooks/useRequests'
import { REQUEST_TYPES, REQUEST_PRIORITIES } from '@/lib/constants'

const requestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  type: z.enum(['bug', 'change', 'feature', 'question']),
  priority: z.enum(['normal', 'urgent']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

type RequestForm = z.infer<typeof requestSchema>

export function PortalNewRequestPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { clientProjects } = useOutletContext<any>()
  const project = clientProjects?.[0]

  const createRequest = useCreateRequest()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      priority: 'normal',
      type: 'bug',
    },
  })

  const onSubmit = (data: RequestForm) => {
    if (!project?.id) return

    createRequest.mutate(
      {
        projectId: project.id,
        data,
      },
      {
        onSuccess: () => navigate(`/portal/${slug}/requests`),
      }
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/portal/${slug}/requests`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Submit New Request</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Details</CardTitle>
          <CardDescription>
            Describe what you need help with. Be as specific as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Brief summary of your request"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Type */}
            <div className="space-y-2">
              <Label>Request Type *</Label>
              <Select
                value={watch('type')}
                onValueChange={(v) => setValue('type', v as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <span className="font-medium">{type.label}</span>
                        <span className="text-muted-foreground ml-2">- {type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">{errors.type.message}</p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-2">
              <Label>Priority</Label>
              <RadioGroup
                value={watch('priority')}
                onValueChange={(v) => setValue('priority', v as any)}
                className="flex gap-4"
              >
                {REQUEST_PRIORITIES.map((priority) => (
                  <div key={priority.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={priority.value} id={priority.value} />
                    <Label htmlFor={priority.value} className="font-normal cursor-pointer">
                      {priority.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Please describe your request in detail. Include any relevant information, steps to reproduce (for bugs), or expected behavior."
                rows={6}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* TODO: File attachments */}

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/portal/${slug}/requests`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createRequest.isPending}>
                {createRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
