import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTimeEntries,
  getRequestTotalTime,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from '@/lib/supabase/database'
import { useAuth } from './useAuth'
import { toast } from 'sonner'
import type { CreateTimeEntryRequest, UpdateTimeEntryRequest } from '@/types/api.types'

// Hook for fetching time entries for a request
export function useTimeEntries(requestId: string | undefined) {
  return useQuery({
    queryKey: ['timeEntries', requestId],
    queryFn: () => getTimeEntries(requestId!),
    enabled: !!requestId,
  })
}

// Hook for getting total time spent on a request
export function useRequestTotalTime(requestId: string | undefined) {
  return useQuery({
    queryKey: ['requestTotalTime', requestId],
    queryFn: () => getRequestTotalTime(requestId!),
    enabled: !!requestId,
  })
}

// Create time entry mutation
export function useCreateTimeEntry() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string
      projectId: string
      data: CreateTimeEntryRequest
    }) => createTimeEntry(requestId, user!.id, data),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', requestId] })
      queryClient.invalidateQueries({ queryKey: ['requestTotalTime', requestId] })
      toast.success('Time entry added')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add time entry')
    },
  })
}

// Update time entry mutation
export function useUpdateTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      entryId,
      data,
    }: {
      entryId: string
      requestId: string
      data: UpdateTimeEntryRequest
    }) => updateTimeEntry(entryId, data),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', requestId] })
      queryClient.invalidateQueries({ queryKey: ['requestTotalTime', requestId] })
      toast.success('Time entry updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update time entry')
    },
  })
}

// Delete time entry mutation
export function useDeleteTimeEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      entryId,
    }: {
      entryId: string
      requestId: string
    }) => deleteTimeEntry(entryId),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['timeEntries', requestId] })
      queryClient.invalidateQueries({ queryKey: ['requestTotalTime', requestId] })
      toast.success('Time entry deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete time entry')
    },
  })
}

// Utility function to format duration
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}m`
}

// Utility function to parse duration string (e.g., "1h 30m", "2h", "45m")
export function parseDuration(input: string): number | null {
  const normalized = input.toLowerCase().trim()

  // Match hours and minutes like "1h 30m", "1h30m", "1:30"
  const fullMatch = normalized.match(/^(\d+)\s*[h:]\s*(\d+)\s*m?$/)
  if (fullMatch) {
    return parseInt(fullMatch[1]) * 60 + parseInt(fullMatch[2])
  }

  // Match hours only like "2h"
  const hoursMatch = normalized.match(/^(\d+)\s*h$/)
  if (hoursMatch) {
    return parseInt(hoursMatch[1]) * 60
  }

  // Match minutes only like "45m" or "45"
  const minutesMatch = normalized.match(/^(\d+)\s*m?$/)
  if (minutesMatch) {
    return parseInt(minutesMatch[1])
  }

  // Match decimal hours like "1.5h" or "1.5"
  const decimalMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*h?$/)
  if (decimalMatch) {
    return Math.round(parseFloat(decimalMatch[1]) * 60)
  }

  return null
}
