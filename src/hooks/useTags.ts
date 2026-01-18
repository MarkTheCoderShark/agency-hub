import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  addTagToRequest,
  removeTagFromRequest,
  setRequestTags,
} from '@/lib/supabase/database'
import { useAgency } from './useAgency'
import { toast } from 'sonner'
import type { CreateTagRequest, UpdateTagRequest } from '@/types/api.types'

// Hook for fetching all agency tags
export function useTags() {
  const { agency } = useAgency()

  return useQuery({
    queryKey: ['tags', agency?.id],
    queryFn: () => getTags(agency!.id),
    enabled: !!agency?.id,
  })
}

// Create tag mutation
export function useCreateTag() {
  const { agency } = useAgency()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTagRequest) => createTag(agency!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', agency?.id] })
      toast.success('Tag created')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create tag')
    },
  })
}

// Update tag mutation
export function useUpdateTag() {
  const { agency } = useAgency()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateTagRequest }) =>
      updateTag(tagId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', agency?.id] })
      toast.success('Tag updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update tag')
    },
  })
}

// Delete tag mutation
export function useDeleteTag() {
  const { agency } = useAgency()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tagId: string) => deleteTag(tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags', agency?.id] })
      // Also invalidate requests since they may have had this tag
      queryClient.invalidateQueries({ queryKey: ['requests'] })
      toast.success('Tag deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete tag')
    },
  })
}

// Add tag to request mutation
export function useAddTagToRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, tagId }: { requestId: string; tagId: string; projectId: string }) =>
      addTagToRequest(requestId, tagId),
    onSuccess: (_, { requestId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] })
      queryClient.invalidateQueries({ queryKey: ['requests', projectId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add tag')
    },
  })
}

// Remove tag from request mutation
export function useRemoveTagFromRequest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, tagId }: { requestId: string; tagId: string; projectId: string }) =>
      removeTagFromRequest(requestId, tagId),
    onSuccess: (_, { requestId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] })
      queryClient.invalidateQueries({ queryKey: ['requests', projectId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove tag')
    },
  })
}

// Set all tags for a request mutation
export function useSetRequestTags() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ requestId, tagIds }: { requestId: string; tagIds: string[]; projectId: string }) =>
      setRequestTags(requestId, tagIds),
    onSuccess: (_, { requestId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['request', requestId] })
      queryClient.invalidateQueries({ queryKey: ['requests', projectId] })
      toast.success('Tags updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update tags')
    },
  })
}
