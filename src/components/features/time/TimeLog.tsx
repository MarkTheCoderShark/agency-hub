import { useState } from 'react'
import { Trash2, Edit2, Clock, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  useTimeEntries,
  useRequestTotalTime,
  useUpdateTimeEntry,
  useDeleteTimeEntry,
  formatDuration,
  parseDuration,
} from '@/hooks/useTimeTracking'
import { formatRelativeTime } from '@/lib/utils'
import type { TimeEntryWithUser } from '@/types/api.types'

interface TimeLogProps {
  requestId: string
}

export function TimeLog({ requestId }: TimeLogProps) {
  const { data: entries, isLoading } = useTimeEntries(requestId)
  const { data: totalTime } = useRequestTotalTime(requestId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No time logged yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Total time summary */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <span className="text-sm font-medium">Total Time</span>
        <span className="text-lg font-semibold">
          {formatDuration(totalTime || 0)}
        </span>
      </div>

      {/* Time entries list */}
      <div className="space-y-2">
        {entries.map((entry) => (
          <TimeEntryItem key={entry.id} entry={entry} requestId={requestId} />
        ))}
      </div>
    </div>
  )
}

interface TimeEntryItemProps {
  entry: TimeEntryWithUser
  requestId: string
}

function TimeEntryItem({ entry, requestId }: TimeEntryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editDuration, setEditDuration] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const updateTimeEntry = useUpdateTimeEntry()
  const deleteTimeEntry = useDeleteTimeEntry()

  const handleStartEdit = () => {
    setEditDuration(formatDuration(entry.duration_minutes))
    setEditDescription(entry.description || '')
    setError(null)
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setError(null)
  }

  const handleSaveEdit = () => {
    const minutes = parseDuration(editDuration)
    if (minutes === null || minutes <= 0) {
      setError('Please enter a valid duration')
      return
    }

    updateTimeEntry.mutate(
      {
        entryId: entry.id,
        requestId,
        data: {
          duration_minutes: minutes,
          description: editDescription.trim() || undefined,
        },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    )
  }

  const handleDelete = () => {
    if (confirm('Delete this time entry?')) {
      deleteTimeEntry.mutate({ entryId: entry.id, requestId })
    }
  }

  if (isEditing) {
    return (
      <div className="p-3 border rounded-lg space-y-2 bg-muted/50">
        <div className="space-y-1">
          <Input
            value={editDuration}
            onChange={(e) => {
              setEditDuration(e.target.value)
              setError(null)
            }}
            placeholder="Duration"
            className="h-8"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
        <Textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          placeholder="Description"
          rows={2}
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleSaveEdit}
            disabled={updateTimeEntry.isPending}
          >
            {updateTimeEntry.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancelEdit}
            disabled={updateTimeEntry.isPending}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 border rounded-lg group hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {formatDuration(entry.duration_minutes)}
            </span>
            <span className="text-sm text-muted-foreground">
              by {entry.user?.name || 'Unknown'}
            </span>
          </div>
          {entry.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {entry.description}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {formatRelativeTime(entry.tracked_date || entry.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={handleStartEdit}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deleteTimeEntry.isPending}
          >
            {deleteTimeEntry.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
