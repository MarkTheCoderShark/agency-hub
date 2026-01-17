import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  archiveProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  inviteClient,
  removeProjectMember,
  updateProjectMemberRole,
  getProjectNotes,
  createProjectNote,
  updateProjectNote,
  deleteProjectNote,
} from '@/lib/supabase/database'
import { useAuth, useUserAgency } from './useAuth'
import type { CreateProjectRequest, UpdateProjectRequest } from '@/types/api.types'
import { toast } from 'sonner'

// Hook for all projects
export function useProjects(includeArchived = false) {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id

  return useQuery({
    queryKey: ['projects', agencyId, includeArchived],
    queryFn: () => getProjects(agencyId!, includeArchived),
    enabled: !!agencyId,
  })
}

// Hook for single project
export function useProject(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
  })
}

// Create project mutation
export function useCreateProject() {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectRequest) =>
      createProject(agencyId!, user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project created')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create project')
    },
  })
}

// Update project mutation
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string
      data: UpdateProjectRequest
    }) => updateProject(projectId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success('Project updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update project')
    },
  })
}

// Archive project mutation
export function useArchiveProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => archiveProject(projectId),
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', projectId] })
      toast.success('Project archived')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to archive project')
    },
  })
}

// Delete project mutation
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast.success('Project deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete project')
    },
  })
}

// Hook for project members
export function useProjectMembers(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project', projectId, 'members'],
    queryFn: () => getProjectMembers(projectId!),
    enabled: !!projectId,
  })
}

// Add project member mutation
export function useAddProjectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
      role,
    }: {
      projectId: string
      userId: string
      role: 'lead' | 'staff'
    }) => addProjectMember(projectId, userId, role),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] })
      toast.success('Member added to project')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add member')
    },
  })
}

// Invite client mutation
export function useInviteClient() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, email }: { projectId: string; email: string }) =>
      inviteClient(projectId, email, user!.id),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] })
      toast.success('Client invitation sent')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to invite client')
    },
  })
}

// Remove project member mutation
export function useRemoveProjectMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      memberId,
    }: {
      projectId: string
      memberId: string
    }) => removeProjectMember(memberId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] })
      toast.success('Member removed from project')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })
}

// Update member role mutation
export function useUpdateProjectMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      memberId,
      role,
    }: {
      projectId: string
      memberId: string
      role: 'lead' | 'staff'
    }) => updateProjectMemberRole(memberId, role),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'members'] })
      toast.success('Member role updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update role')
    },
  })
}

// Hook for project notes
export function useProjectNotes(projectId: string | undefined) {
  return useQuery({
    queryKey: ['project', projectId, 'notes'],
    queryFn: () => getProjectNotes(projectId!),
    enabled: !!projectId,
  })
}

// Create note mutation
export function useCreateNote() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string
      data: { title?: string; content: string }
    }) => createProjectNote(projectId, user!.id, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'notes'] })
      toast.success('Note created')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create note')
    },
  })
}

// Update note mutation
export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      noteId,
      projectId,
      data,
    }: {
      noteId: string
      projectId: string
      data: { title?: string; content?: string; is_pinned?: boolean }
    }) => updateProjectNote(noteId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'notes'] })
      toast.success('Note updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update note')
    },
  })
}

// Delete note mutation
export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ noteId, projectId }: { noteId: string; projectId: string }) =>
      deleteProjectNote(noteId),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId, 'notes'] })
      toast.success('Note deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete note')
    },
  })
}
