import { useState } from 'react'
import { Plus, Search, Filter, X, Loader2, Calendar, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DatePicker } from '@/components/ui/date-picker'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRequests, useCreateRequest } from '@/hooks/useRequests'
import { useUserRoles } from '@/hooks/useAuth'
import { formatRelativeTime, getStatusColor, getTypeColor, getPriorityColor, formatDueDate, getDueDateColor, isOverdue, getTagColorClasses, cn } from '@/lib/utils'
import { REQUEST_STATUSES, REQUEST_TYPES, REQUEST_PRIORITIES, DUE_DATE_FILTERS } from '@/lib/constants'
import type { RequestFilters } from '@/types/api.types'
import { RequestSlideOver } from './RequestSlideOver'
import { useTags } from '@/hooks/useTags'
import { TemplateSelector } from '@/components/features/templates'
import type { RequestTemplate } from '@/types/database.types'

interface RequestsTabProps {
  projectId: string
}

const requestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be under 200 characters'),
  type: z.enum(['bug', 'change', 'feature', 'question']),
  priority: z.enum(['normal', 'urgent']),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  due_date: z.string().nullable().optional(),
})

type RequestForm = z.infer<typeof requestSchema>

export function RequestsTab({ projectId }: RequestsTabProps) {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [filters, setFilters] = useState<RequestFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const { data: userRoles } = useUserRoles()
  const { data: requests, isLoading } = useRequests(projectId, {
    ...filters,
    search: searchQuery || undefined,
  })
  const createRequest = useCreateRequest()
  const { data: availableTags = [] } = useTags()

  const isAgencyMember = !!userRoles?.isAgencyMember
  const canCreateRequest = !!userRoles?.isClient && !userRoles?.isAgencyMember

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      priority: 'normal',
      type: 'bug',
    },
  })

  const hasActiveFilters =
    filters.status || filters.type || filters.priority || filters.assigned || filters.due_date || (filters.tags && filters.tags.length > 0)

  const clearFilters = () => {
    setFilters({})
    setSearchQuery('')
  }

  const onSubmit = (data: RequestForm) => {
    createRequest.mutate(
      {
        projectId,
        data,
      },
      {
        onSuccess: () => {
          setCreateDialogOpen(false)
          reset()
        },
      }
    )
  }

  const handleTemplateSelect = (template: RequestTemplate) => {
    // Pre-fill form with template values
    if (template.title_template) {
      setValue('title', template.title_template)
    }
    setValue('type', template.default_type as RequestForm['type'])
    setValue('priority', template.default_priority as RequestForm['priority'])
    setValue('description', template.description_template)
  }

  return (
    <div className="flex h-full">
      {/* Request list */}
      <div className="flex-1 flex flex-col border-r">
        {/* Filters */}
        <div className="p-4 border-b space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search requests"
              />
            </div>
            {canCreateRequest && (
              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Request
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <DialogTitle>Submit New Request</DialogTitle>
                        <DialogDescription>
                          Share the details so the team can help quickly.
                        </DialogDescription>
                      </div>
                      <TemplateSelector onSelect={handleTemplateSelect} />
                    </div>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                    <div className="space-y-2">
                      <Label>Request Type *</Label>
                      <Select
                        value={watch('type')}
                        onValueChange={(value) => setValue('type', value as RequestForm['type'])}
                      >
                      <SelectTrigger aria-label="Request type">
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

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <RadioGroup
                        value={watch('priority')}
                        onValueChange={(value) => setValue('priority', value as RequestForm['priority'])}
                        className="flex gap-4"
                      >
                        {REQUEST_PRIORITIES.map((priority) => (
                          <div key={priority.value} className="flex items-center space-x-2">
                            <RadioGroupItem value={priority.value} id={`priority-${priority.value}`} />
                            <Label htmlFor={`priority-${priority.value}`} className="font-normal cursor-pointer">
                              {priority.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what you need help with and any context."
                        rows={5}
                        {...register('description')}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Due Date (Optional)</Label>
                      <DatePicker
                        value={watch('due_date') ? new Date(watch('due_date')!) : null}
                        onChange={(date) => setValue('due_date', date ? date.toISOString() : null)}
                        placeholder="Set a due date"
                        minDate={new Date()}
                      />
                    </div>

                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createRequest.isPending}>
                        {createRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
            <Button variant="outline" size="icon" aria-label="Filter requests">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Select
              value={filters.status || 'all'}
              onValueChange={(v) => setFilters({ ...filters, status: v === 'all' ? undefined : v as any })}
            >
              <SelectTrigger className="w-[130px]" aria-label="Status filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {REQUEST_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.type || 'all'}
              onValueChange={(v) => setFilters({ ...filters, type: v === 'all' ? undefined : v as any })}
            >
              <SelectTrigger className="w-[130px]" aria-label="Type filter">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {REQUEST_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filters.due_date || 'all'}
              onValueChange={(v) => setFilters({ ...filters, due_date: v === 'all' ? undefined : v as any })}
            >
              <SelectTrigger className="w-[140px]" aria-label="Due date filter">
                <SelectValue placeholder="Due Date" />
              </SelectTrigger>
              <SelectContent>
                {DUE_DATE_FILTERS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {availableTags.length > 0 && (
              <Select
                value={filters.tags && filters.tags.length > 0 ? filters.tags[0] : 'all'}
                onValueChange={(v) => setFilters({ ...filters, tags: v === 'all' ? undefined : [v] })}
              >
                <SelectTrigger className="w-[130px]" aria-label="Tag filter">
                  <SelectValue placeholder="Tags" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tags</SelectItem>
                  {availableTags.map((tag) => {
                    const colors = getTagColorClasses(tag.color)
                    return (
                      <SelectItem key={tag.id} value={tag.id}>
                        <div className="flex items-center gap-2">
                          <div className={cn('w-2 h-2 rounded-full', colors.bg)} />
                          {tag.name}
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            )}

            {isAgencyMember && (
              <Select
                value={filters.assigned || 'all'}
                onValueChange={(v) => setFilters({ ...filters, assigned: v === 'all' ? undefined : v })}
              >
                <SelectTrigger className="w-[140px]" aria-label="Assigned filter">
                  <SelectValue placeholder="Assigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="me">Assigned to me</SelectItem>
                </SelectContent>
              </Select>
            )}

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Request list */}
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-lg animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
                </div>
              ))}
            </div>
          ) : requests && requests.length > 0 ? (
            <div className="p-4 space-y-2">
              {requests.map((request) => (
                <button
                  key={request.id}
                  onClick={() => setSelectedRequestId(request.id)}
                  className={`w-full text-left p-4 border rounded-lg hover:bg-muted transition-colors ${
                    selectedRequestId === request.id ? 'ring-2 ring-primary bg-muted' : ''
                  } ${isOverdue(request.due_date, request.status) ? 'border-red-200' : ''}`}
                  data-testid="request-item"
                  data-request-id={request.id}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{request.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className={getTypeColor(request.type)}>
                          {request.type}
                        </Badge>
                        {request.priority === 'urgent' && (
                          <Badge variant="outline" className={getPriorityColor(request.priority)}>
                            Urgent
                          </Badge>
                        )}
                        {request.due_date && (
                          <Badge variant="outline" className={getDueDateColor(request.due_date, request.status)}>
                            <Calendar className="h-3 w-3 mr-1" />
                            {formatDueDate(request.due_date)}
                            {isOverdue(request.due_date, request.status) && (
                              <AlertCircle className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                        )}
                        {request.tags && request.tags.slice(0, 2).map((tag) => {
                          const colors = getTagColorClasses(tag.color)
                          return (
                            <Badge
                              key={tag.id}
                              variant="outline"
                              className={cn(colors.bg, colors.text, colors.border, 'text-xs')}
                            >
                              {tag.name}
                            </Badge>
                          )
                        })}
                        {request.tags && request.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{request.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                    <span>{formatRelativeTime(request.created_at)}</span>
                    {request.assignments && request.assignments.length > 0 && (
                      <span>
                        {request.assignments.map((a) => a.user?.name).join(', ')}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No requests found</p>
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Request slide-over */}
      {selectedRequestId && (
        <RequestSlideOver
          requestId={selectedRequestId}
          projectId={projectId}
          onClose={() => setSelectedRequestId(null)}
        />
      )}
    </div>
  )
}
