import { useEffect, useState } from 'react'
import { X, Send, Paperclip, User, Clock, AlertCircle, Calendar, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import {
  useRequest,
  useUpdateRequest,
  useMessages,
  useCreateMessage,
  useAssignRequest,
  useUnassignRequest,
} from '@/hooks/useRequests'
import { useSetRequestTags } from '@/hooks/useTags'
import { useRequestTotalTime } from '@/hooks/useTimeTracking'
import { useTeam } from '@/hooks/useAgency'
import { useUserRoles } from '@/hooks/useAuth'
import { formatRelativeTime, formatDateTime, getStatusColor, getTypeColor, getInitials, formatDueDate, getDueDateColor, isOverdue } from '@/lib/utils'
import { REQUEST_STATUSES } from '@/lib/constants'
import { TagSelector, TagBadge } from '@/components/features/tags/TagSelector'
import { TimeEntryForm, TimeLog } from '@/components/features/time'
import { SatisfactionRating } from '@/components/features/ratings'
import { formatDuration } from '@/hooks/useTimeTracking'
import type { Tag } from '@/types/database.types'

interface RequestSlideOverProps {
  requestId: string
  projectId: string
  onClose: () => void
}

export function RequestSlideOver({ requestId, projectId, onClose }: RequestSlideOverProps) {
  const [messageContent, setMessageContent] = useState('')
  const [activeTab, setActiveTab] = useState('conversation')

  const { data: userRoles } = useUserRoles()
  const isAgencyMember = !!userRoles?.isAgencyMember
  const { data: request, isLoading } = useRequest(requestId)
  const { data: messages } = useMessages(requestId, isAgencyMember)
  const { data: team } = useTeam()
  const { data: totalTimeMinutes } = useRequestTotalTime(requestId)
  const updateRequest = useUpdateRequest()
  const createMessage = useCreateMessage()
  const assignRequest = useAssignRequest()
  const unassignRequest = useUnassignRequest()
  const setRequestTags = useSetRequestTags()

  const handleStatusChange = (status: string) => {
    updateRequest.mutate({
      requestId,
      projectId,
      data: { status: status as any },
    })
  }

  const handleDueDateChange = (date: Date | null) => {
    updateRequest.mutate({
      requestId,
      projectId,
      data: { due_date: date ? date.toISOString() : null },
    })
  }

  const handleTagsChange = (tags: Tag[]) => {
    setRequestTags.mutate({
      requestId,
      projectId,
      tagIds: tags.map((t) => t.id),
    })
  }

  const handleSendMessage = (internal: boolean) => {
    if (!messageContent.trim()) return

    createMessage.mutate(
      {
        requestId,
        content: messageContent,
        isInternal: internal,
      },
      {
        onSuccess: () => setMessageContent(''),
      }
    )
  }

  const handleAssign = (userId: string) => {
    assignRequest.mutate({ requestId, projectId, userId })
  }

  const handleUnassign = (userId: string) => {
    unassignRequest.mutate({ requestId, projectId, userId })
  }

  useEffect(() => {
    if (!isAgencyMember && activeTab === 'internal') {
      setActiveTab('conversation')
    }
  }, [activeTab, isAgencyMember])

  if (isLoading) {
    return (
      <div className="w-[400px] border-l bg-background animate-pulse p-6">
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2 mt-2" />
      </div>
    )
  }

  if (!request) {
    return null
  }

  const publicMessages = messages?.filter((m) => !m.is_internal) ?? []
  const internalMessages = messages?.filter((m) => m.is_internal) ?? []

  return (
    <div className="w-[400px] border-l bg-background flex flex-col" data-testid="request-slide-over">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{request.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className={getTypeColor(request.type)}>
                {request.type}
              </Badge>
              {request.priority === 'urgent' && (
                <Badge variant="destructive">Urgent</Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close request">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Status selector */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            {isAgencyMember ? (
              <Select value={request.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[140px]" aria-label="Status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REQUEST_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Badge className={getStatusColor(request.status)}>
                {request.status.replace('_', ' ')}
              </Badge>
            )}
          </div>

          {/* Assignees */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Assigned</span>
            {isAgencyMember ? (
              <Select onValueChange={handleAssign}>
                <SelectTrigger className="w-[140px]" aria-label="Assign request">
                  <SelectValue placeholder="Add assignee" />
                </SelectTrigger>
                <SelectContent>
                  {team
                    ?.filter((m) => m.user_id && !request.assignments?.some((a) => a.user_id === m.user_id))
                    .map((member) => (
                      <SelectItem key={member.user_id} value={member.user_id!}>
                        {member.user?.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm text-muted-foreground">
                {request.assignments && request.assignments.length > 0
                  ? request.assignments.map((a) => a.user?.name).join(', ')
                  : 'Unassigned'}
              </span>
            )}
          </div>

          {isAgencyMember && request.assignments && request.assignments.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {request.assignments.map((assignment) => (
                <Badge
                  key={assignment.id}
                  variant="secondary"
                  className="gap-1 cursor-pointer hover:bg-destructive/20"
                  onClick={() => handleUnassign(assignment.user_id)}
                >
                  {assignment.user?.name}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}

          {/* Due Date */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-sm text-muted-foreground">Due Date</span>
            {isAgencyMember ? (
              <DatePicker
                value={request.due_date ? new Date(request.due_date) : null}
                onChange={handleDueDateChange}
                placeholder="Set due date"
                className="w-[180px]"
              />
            ) : request.due_date ? (
              <Badge
                variant="outline"
                className={getDueDateColor(request.due_date, request.status)}
              >
                <Calendar className="h-3 w-3 mr-1" />
                {formatDueDate(request.due_date)}
                {isOverdue(request.due_date, request.status) && (
                  <AlertCircle className="h-3 w-3 ml-1" />
                )}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">Not set</span>
            )}
          </div>

          {/* Tags */}
          <div className="mt-3">
            <span className="text-sm text-muted-foreground block mb-2">Tags</span>
            {isAgencyMember ? (
              <TagSelector
                selectedTags={request.tags || []}
                onTagsChange={handleTagsChange}
                placeholder="Add tag"
              />
            ) : request.tags && request.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {request.tags.map((tag) => (
                  <TagBadge key={tag.id} tag={tag} />
                ))}
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">No tags</span>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Created by {request.created_by_user?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formatDateTime(request.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 border-b">
        <h4 className="text-sm font-medium mb-2">Description</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {request.description}
        </p>
        {request.attachments && request.attachments.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {request.attachments.map((att) => (
              <a
                key={att.id}
                href={att.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Paperclip className="h-3 w-3" />
                {att.file_name}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Satisfaction Rating - shown for completed requests */}
      {request.status === 'complete' && (
        <div className="p-4 border-b">
          <SatisfactionRating
            requestId={requestId}
            isClient={!isAgencyMember}
            isComplete={request.status === 'complete'}
          />
        </div>
      )}

      {/* Messages */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b px-4">
          <TabsTrigger value="conversation">
            Conversation ({publicMessages.length})
          </TabsTrigger>
          {isAgencyMember && (
            <TabsTrigger value="internal">
              Internal ({internalMessages.length})
            </TabsTrigger>
          )}
          {isAgencyMember && (
            <TabsTrigger value="time" className="gap-1">
              <Timer className="h-3.5 w-3.5" />
              Time {totalTimeMinutes ? `(${formatDuration(totalTimeMinutes)})` : ''}
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="conversation" className="flex-1 flex flex-col m-0">
          <ScrollArea className="flex-1 p-4">
            {publicMessages.length > 0 ? (
              <div className="space-y-4">
                {publicMessages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.user?.avatar_url || undefined} />
                      <AvatarFallback>
                        {message.user?.name ? getInitials(message.user.name) : '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{message.user?.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-sm">No messages yet</p>
            )}
          </ScrollArea>
        </TabsContent>

        {isAgencyMember && (
          <TabsContent value="internal" className="flex-1 flex flex-col m-0">
            <ScrollArea className="flex-1 p-4">
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Internal notes are only visible to your team</span>
              </div>
              {internalMessages.length > 0 ? (
                <div className="space-y-4">
                  {internalMessages.map((message) => (
                    <div key={message.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.user?.avatar_url || undefined} />
                        <AvatarFallback>
                          {message.user?.name ? getInitials(message.user.name) : '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{message.user?.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(message.created_at)}
                          </span>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm">No internal notes yet</p>
              )}
            </ScrollArea>
          </TabsContent>
        )}

        {isAgencyMember && (
          <TabsContent value="time" className="flex-1 flex flex-col m-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium mb-3">Log Time</h4>
                  <TimeEntryForm requestId={requestId} projectId={projectId} />
                </div>
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium mb-3">Time Log</h4>
                  <TimeLog requestId={requestId} />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        )}

        {/* Message input - hidden on time tab */}
        {activeTab !== 'time' && (
          <div className="p-4 border-t">
            <Textarea
              placeholder={activeTab === 'internal' ? 'Add internal note...' : 'Type your reply...'}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={3}
              aria-label={activeTab === 'internal' ? 'Internal note' : 'Message'}
            />
            <div className="flex items-center justify-between mt-2">
              <Button variant="ghost" size="icon" aria-label="Attach file">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => {
                  handleSendMessage(activeTab === 'internal')
                }}
                disabled={!messageContent.trim() || createMessage.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  )
}
