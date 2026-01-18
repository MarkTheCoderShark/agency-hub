import { useState } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  useRequestSatisfactionRating,
  useCreateSatisfactionRating,
  useUpdateSatisfactionRating,
  getRatingLabel,
} from '@/hooks/useSatisfactionRating'
import { cn } from '@/lib/utils'

interface SatisfactionRatingProps {
  requestId: string
  isClient: boolean
  isComplete: boolean
}

export function SatisfactionRating({ requestId, isClient, isComplete }: SatisfactionRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null)
  const [selectedRating, setSelectedRating] = useState<number | null>(null)
  const [feedback, setFeedback] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const { data: existingRating, isLoading } = useRequestSatisfactionRating(requestId)
  const createRating = useCreateSatisfactionRating()
  const updateRating = useUpdateSatisfactionRating()

  // Don't show if not complete or not a client
  if (!isComplete) {
    return null
  }

  // Show existing rating view
  if (existingRating && !isEditing) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium mb-2">Client Satisfaction</p>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-5 w-5',
                    star <= existingRating.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  )}
                />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">
                {getRatingLabel(existingRating.rating)}
              </span>
            </div>
            {existingRating.feedback && (
              <p className="mt-2 text-sm text-muted-foreground">
                "{existingRating.feedback}"
              </p>
            )}
          </div>
          {isClient && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedRating(existingRating.rating)
                setFeedback(existingRating.feedback || '')
                setIsEditing(true)
              }}
            >
              Edit
            </Button>
          )}
        </div>
      </div>
    )
  }

  // Show rating form for clients
  if (isClient) {
    const handleSubmit = () => {
      if (!selectedRating) return

      if (existingRating) {
        updateRating.mutate(
          {
            ratingId: existingRating.id,
            requestId,
            data: {
              rating: selectedRating,
              feedback: feedback.trim() || undefined,
            },
          },
          {
            onSuccess: () => setIsEditing(false),
          }
        )
      } else {
        createRating.mutate({
          requestId,
          data: {
            rating: selectedRating,
            feedback: feedback.trim() || undefined,
          },
        })
      }
    }

    const isPending = createRating.isPending || updateRating.isPending

    return (
      <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
        <h4 className="font-medium text-sm mb-3">How satisfied are you with this request?</h4>

        <div className="flex items-center gap-1 mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(null)}
              className="p-1 hover:scale-110 transition-transform"
            >
              <Star
                className={cn(
                  'h-7 w-7 transition-colors',
                  star <= (hoveredRating || selectedRating || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300 hover:text-gray-400'
                )}
              />
            </button>
          ))}
        </div>

        {(hoveredRating || selectedRating) && (
          <p className="text-sm text-muted-foreground mb-3">
            {getRatingLabel(hoveredRating || selectedRating || 0)}
          </p>
        )}

        {selectedRating && (
          <>
            <div className="space-y-2 mb-3">
              <Label htmlFor="feedback" className="text-sm">
                Additional feedback (optional)
              </Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={3}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={isPending}
              >
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {existingRating ? 'Update Rating' : 'Submit Rating'}
              </Button>
              {isEditing && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // Agency members see placeholder when no rating exists
  if (!existingRating && !isLoading) {
    return (
      <div className="p-4 border rounded-lg bg-muted/50">
        <p className="text-sm text-muted-foreground">
          No satisfaction rating yet. The client can rate this request.
        </p>
      </div>
    )
  }

  return null
}
