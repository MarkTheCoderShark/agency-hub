import { useState } from 'react'
import { Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useCreateTimeEntry, parseDuration, formatDuration } from '@/hooks/useTimeTracking'

interface TimeEntryFormProps {
  requestId: string
  projectId: string
  onSuccess?: () => void
}

export function TimeEntryForm({ requestId, projectId, onSuccess }: TimeEntryFormProps) {
  const [duration, setDuration] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createTimeEntry = useCreateTimeEntry()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const minutes = parseDuration(duration)
    if (minutes === null || minutes <= 0) {
      setError('Please enter a valid duration (e.g., "1h 30m", "2h", "45m", "1.5")')
      return
    }

    createTimeEntry.mutate(
      {
        requestId,
        projectId,
        data: {
          duration_minutes: minutes,
          description: description.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setDuration('')
          setDescription('')
          onSuccess?.()
        },
      }
    )
  }

  const parsedMinutes = parseDuration(duration)
  const previewText = parsedMinutes ? formatDuration(parsedMinutes) : null

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="duration">Time Spent</Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="duration"
            value={duration}
            onChange={(e) => {
              setDuration(e.target.value)
              setError(null)
            }}
            placeholder="e.g., 1h 30m, 2h, 45m, 1.5"
            className="pl-9"
          />
        </div>
        {previewText && (
          <p className="text-xs text-muted-foreground">
            Will log: {previewText}
          </p>
        )}
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you work on?"
          rows={2}
        />
      </div>

      <Button
        type="submit"
        size="sm"
        disabled={createTimeEntry.isPending || !duration.trim()}
        className="w-full"
      >
        {createTimeEntry.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Log Time
      </Button>
    </form>
  )
}
