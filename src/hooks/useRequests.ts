import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRequests,
  getRequest,
  createRequest,
  updateRequest,
  deleteRequest,
  assignRequest,
  unassignRequest,
  getMessages,
  createMessage,
  updateMessage,
  deleteMessage,
  getRequestActivityLog,
} from '@/lib/supabase/database'
import { useAuth } from './useAuth'
import type {
  RequestFilters,
  RequestSort,
  CreateRequestFormData,
  UpdateRequestRequest,
} from '@/types/api.types'
import { toast } from 'sonner'

// Hook for requests list
export function useRequests(
  projectId: string | undefined,
  filters?: RequestFilters,
  sort?: RequestSort
) {
  return useQuery({
    queryKey: ['requests', projectId, filters, sort],
    queryFn: () => getRequests(projectId!, filters, sort),
    enabled: !!projectId,
  })
}

// Hook for single request
export function useRequest(requestId: string | undefined) {
  return useQuery({
    queryKey: ['request', requestId],
    queryFn: () => getRequest(requestId!),
    enabled: !!requestId,
  })
}

// Create request mutation
export function useCreateRequest() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string
      data: Omit<CreateRequestFormData, 'attachments'>
    }) => createRequest(projectId, user!.id, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['requests', projectId] })
      toast.success('Request submitted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to submit request')
    },
  })
}

// Update request mutation
export function useUpdateRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      data,
    }: {
      requestId: string
      projectId: string
      data: UpdateRequestRequest
    }) => updateRequest(requestId, data),
    onSuccess: (_, { requestId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['requests', projectId] })
      queryClient.invalidateQueries({ queryKey: ['request', requestId] })
      toast.success('Request updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update request')
    },
  })
}

// Delete request mutation
export function useDeleteRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      projectId,
    }: {
      requestId: string
      projectId: string
    }) => deleteRequest(requestId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['requests', projectId] })
      toast.success('Request deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete request')
    },
  })
}

// Assign request mutation
export function useAssignRequest() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      userId,
    }: {
      requestId: string
      projectId: string
      userId: string
    }) => assignRequest(requestId, userId, user!.id),
    onSuccess: (_, { requestId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['requests', projectId] })
      queryClient.invalidateQueries({ queryKey: ['request', requestId] })
      toast.success('Staff assigned')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to assign staff')
    },
  })
}

// Unassign request mutation
export function useUnassignRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      userId,
    }: {
      requestId: string
      projectId: string
      userId: string
    }) => unassignRequest(requestId, userId),
    onSuccess: (_, { requestId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['requests', projectId] })
      queryClient.invalidateQueries({ queryKey: ['request', requestId] })
      toast.success('Staff unassigned')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unassign staff')
    },
  })
}

// Hook for request messages
export function useMessages(requestId: string | undefined, isAgencyUser = true) {
  return useQuery({
    queryKey: ['messages', requestId, isAgencyUser],
    queryFn: () => getMessages(requestId!, isAgencyUser),
    enabled: !!requestId,
  })
}

// Create message mutation
export function useCreateMessage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      requestId,
      content,
      isInternal = false,
    }: {
      requestId: string
      content: string
      isInternal?: boolean
    }) =>
      createMessage(requestId, user!.id, {
        content,
        is_internal: isInternal,
      }),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', requestId] })
      toast.success('Message sent')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send message')
    },
  })
}

// Update message mutation
export function useUpdateMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      messageId,
      content,
    }: {
      messageId: string
      requestId: string
      content: string
    }) => updateMessage(messageId, content),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', requestId] })
      toast.success('Message updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update message')
    },
  })
}

// Delete message mutation
export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      messageId,
    }: {
      messageId: string
      requestId: string
    }) => deleteMessage(messageId),
    onSuccess: (_, { requestId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', requestId] })
      toast.success('Message deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete message')
    },
  })
}

// Hook for activity log
export function useRequestActivityLog(requestId: string | undefined) {
  return useQuery({
    queryKey: ['activity', requestId],
    queryFn: () => getRequestActivityLog(requestId!),
    enabled: !!requestId,
  })
}
