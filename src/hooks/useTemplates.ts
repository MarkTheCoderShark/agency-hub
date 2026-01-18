import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getRequestTemplates,
  getActiveRequestTemplates,
  getRequestTemplate,
  createRequestTemplate,
  updateRequestTemplate,
  deleteRequestTemplate,
} from '@/lib/supabase/database'
import { useAgency } from './useAgency'
import { useAuth } from './useAuth'
import { toast } from 'sonner'
import type { CreateRequestTemplateRequest, UpdateRequestTemplateRequest } from '@/types/api.types'

// Hook for fetching all templates (agency admin view)
export function useRequestTemplates() {
  const { data: agency } = useAgency()
  const agencyId = agency?.id

  return useQuery({
    queryKey: ['requestTemplates', agencyId],
    queryFn: () => getRequestTemplates(agencyId!),
    enabled: !!agencyId,
  })
}

// Hook for fetching only active templates (for client use)
export function useActiveRequestTemplates() {
  const { data: agency } = useAgency()
  const agencyId = agency?.id

  return useQuery({
    queryKey: ['activeRequestTemplates', agencyId],
    queryFn: () => getActiveRequestTemplates(agencyId!),
    enabled: !!agencyId,
  })
}

// Hook for fetching a single template
export function useRequestTemplate(templateId: string | undefined) {
  return useQuery({
    queryKey: ['requestTemplate', templateId],
    queryFn: () => getRequestTemplate(templateId!),
    enabled: !!templateId,
  })
}

// Create template mutation
export function useCreateRequestTemplate() {
  const { user } = useAuth()
  const { data: agency } = useAgency()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRequestTemplateRequest) =>
      createRequestTemplate(agency!.id, user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestTemplates'] })
      queryClient.invalidateQueries({ queryKey: ['activeRequestTemplates'] })
      toast.success('Template created')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create template')
    },
  })
}

// Update template mutation
export function useUpdateRequestTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      templateId,
      data,
    }: {
      templateId: string
      data: UpdateRequestTemplateRequest
    }) => updateRequestTemplate(templateId, data),
    onSuccess: (_, { templateId }) => {
      queryClient.invalidateQueries({ queryKey: ['requestTemplates'] })
      queryClient.invalidateQueries({ queryKey: ['activeRequestTemplates'] })
      queryClient.invalidateQueries({ queryKey: ['requestTemplate', templateId] })
      toast.success('Template updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update template')
    },
  })
}

// Delete template mutation
export function useDeleteRequestTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (templateId: string) => deleteRequestTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requestTemplates'] })
      queryClient.invalidateQueries({ queryKey: ['activeRequestTemplates'] })
      toast.success('Template deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete template')
    },
  })
}
