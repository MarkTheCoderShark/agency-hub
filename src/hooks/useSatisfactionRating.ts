import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRequestSatisfactionRating,
  createSatisfactionRating,
  updateSatisfactionRating,
  getAgencySatisfactionStats,
} from '@/lib/supabase/database'
import { useAuth } from './useAuth'
import { useAgency } from './useAgency'
import { toast } from 'sonner'
import type { CreateSatisfactionRatingRequest, UpdateSatisfactionRatingRequest } from '@/types/api.types'

// Hook for fetching a request's satisfaction rating
export function useRequestSatisfactionRating(requestId: string | undefined) {
  return useQuery({
    queryKey: ['satisfactionRating', requestId],
    queryFn: () => getRequestSatisfactionRating(requestId!),
    enabled: !!requestId,
  })
}

// Hook for fetching agency satisfaction stats
export function useAgencySatisfactionStats() {
  const { data: agency } = useAgency()
  const agencyId = agency?.id

  return useQuery({
    queryKey: ['agencySatisfactionStats', agencyId],
    queryFn: () => getAgencySatisfactionStats(agencyId!),
    enabled: !!agencyId,
  })
}

// Create satisfaction rating mutation
export function useCreateSatisfactionRating() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string
      data: CreateSatisfactionRatingRequest
    }) => createSatisfactionRating(requestId, user!.id, data),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['satisfactionRating', requestId] })
      queryClient.invalidateQueries({ queryKey: ['agencySatisfactionStats'] })
      toast.success('Thank you for your feedback!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit rating')
    },
  })
}

// Update satisfaction rating mutation
export function useUpdateSatisfactionRating() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ratingId,
      requestId,
      data,
    }: {
      ratingId: string
      requestId: string
      data: UpdateSatisfactionRatingRequest
    }) => updateSatisfactionRating(ratingId, data),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['satisfactionRating', requestId] })
      queryClient.invalidateQueries({ queryKey: ['agencySatisfactionStats'] })
      toast.success('Rating updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update rating')
    },
  })
}

// Utility to get rating label
export function getRatingLabel(rating: number): string {
  switch (rating) {
    case 1:
      return 'Very Dissatisfied'
    case 2:
      return 'Dissatisfied'
    case 3:
      return 'Neutral'
    case 4:
      return 'Satisfied'
    case 5:
      return 'Very Satisfied'
    default:
      return ''
  }
}

// Utility to get rating emoji
export function getRatingEmoji(rating: number): string {
  switch (rating) {
    case 1:
      return '😞'
    case 2:
      return '😕'
    case 3:
      return '😐'
    case 4:
      return '🙂'
    case 5:
      return '😊'
    default:
      return ''
  }
}
