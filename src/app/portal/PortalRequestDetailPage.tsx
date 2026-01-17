import { useState } from 'react'
import { useParams, useNavigate, useOutletContext } from 'react-router-dom'
import { ArrowLeft, Send, Paperclip, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useRequest, useMessages, useCreateMessage } from '@/hooks/useRequests'
import { formatRelativeTime, formatDateTime, getStatusColor, getTypeColor, getInitials } from '@/lib/utils'

export function PortalRequestDetailPage() {
  const { slug, requestId } = useParams<{ slug: string; requestId: string }>()
  const navigate = useNavigate()
  const [messageContent, setMessageContent] = useState('')
  const { agency } = useOutletContext<any>()

  const { data: request, isLoading } = useRequest(requestId)
  const { data: messages } = useMessages(requestId, false) // false = client view
  const createMessage = useCreateMessage()

  const handleSendMessage = () => {
    if (!messageContent.trim()) return

    createMessage.mutate(
      { requestId: requestId!, content: messageContent },
      { onSuccess: () => setMessageContent('') }
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/2" />
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-muted-foreground">Request not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(`/portal/${slug}/requests`)}>
          Back to Requests
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/portal/${slug}/requests`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{request.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge className={getStatusColor(request.status)}>
              {request.status.replace('_', ' ')}
            </Badge>
            <Badge variant="outline" className={getTypeColor(request.type)}>
              {request.type}
            </Badge>
            {request.priority === 'urgent' && (
              <Badge variant="destructive">Urgent</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Request details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{request.description}</p>

          {/* Attachments */}
          {request.attachments && request.attachments.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {request.attachments.map((att) => (
                  <a
                    key={att.id}
                    href={att.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-muted rounded-md text-sm hover:bg-muted/80"
                  >
                    <Paperclip className="h-3 w-3" />
                    {att.file_name}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Submitted {formatDateTime(request.created_at)}
          </div>
        </CardContent>
      </Card>

      {/* Conversation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[400px] px-6">
            {messages && messages.length > 0 ? (
              <div className="space-y-4 py-4">
                {messages.map((message) => {
                  const isClient = message.user_id === request.created_by

                  return (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${isClient ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={message.user?.avatar_url || undefined} />
                        <AvatarFallback>
                          {isClient
                            ? getInitials(message.user?.name || 'You')
                            : agency?.name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div
                        className={`flex-1 max-w-[80%] ${isClient ? 'text-right' : ''}`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg ${
                            isClient
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap text-left">
                            {message.content}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isClient ? 'You' : agency?.name} · {formatRelativeTime(message.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                No messages yet. Start the conversation below.
              </div>
            )}
          </ScrollArea>

          {/* Message input */}
          <div className="p-4 border-t">
            <Textarea
              placeholder="Type your message..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <Button
                onClick={handleSendMessage}
                disabled={!messageContent.trim() || createMessage.isPending}
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
