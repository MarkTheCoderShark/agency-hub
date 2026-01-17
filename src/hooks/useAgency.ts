import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAgency,
  updateAgency,
  getAgencyStats,
  getAgencyStorageUsage,
  getActiveClientsCount,
  getAgencyMembers,
  inviteStaffMember,
  removeAgencyMember,
  resendStaffInvitation,
} from '@/lib/supabase/database'
import { uploadLogo, deleteLogo } from '@/lib/supabase/storage'
import { useAuth, useUserAgency } from './useAuth'
import type { UpdateAgencyRequest } from '@/types/api.types'
import { toast } from 'sonner'

// Hook for current agency details
export function useAgency() {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id

  return useQuery({
    queryKey: ['agency', 'details', agencyId],
    queryFn: () => getAgency(agencyId!),
    enabled: !!agencyId,
  })
}

// Hook for agency stats
export function useAgencyStats() {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id

  return useQuery({
    queryKey: ['agency', 'stats', agencyId],
    queryFn: () => getAgencyStats(agencyId!),
    enabled: !!agencyId,
  })
}

// Hook for storage usage
export function useStorageUsage() {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id

  return useQuery({
    queryKey: ['agency', 'storage', agencyId],
    queryFn: () => getAgencyStorageUsage(agencyId!),
    enabled: !!agencyId,
  })
}

// Hook for active clients count
export function useActiveClients() {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id

  return useQuery({
    queryKey: ['agency', 'activeClients', agencyId],
    queryFn: () => getActiveClientsCount(agencyId!),
    enabled: !!agencyId,
  })
}

// Hook for agency members (team)
export function useTeam() {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id

  return useQuery({
    queryKey: ['agency', 'members', agencyId],
    queryFn: () => getAgencyMembers(agencyId!),
    enabled: !!agencyId,
  })
}

// Update agency mutation
export function useUpdateAgency() {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateAgencyRequest) => updateAgency(agencyId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency'] })
      toast.success('Agency settings updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update agency')
    },
  })
}

// Upload logo mutation
export function useUploadLogo() {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const result = await uploadLogo(file, agencyId!)
      await updateAgency(agencyId!, { logo_url: result.url })
      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency'] })
      toast.success('Logo uploaded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload logo')
    },
  })
}

// Delete logo mutation
export function useDeleteLogo() {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await deleteLogo(agencyId!)
      await updateAgency(agencyId!, { logo_url: null })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency'] })
      toast.success('Logo removed')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove logo')
    },
  })
}

// Invite staff member mutation
export function useInviteStaff() {
  const { data: agencyData } = useUserAgency()
  const agencyId = agencyData?.id
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (email: string) => inviteStaffMember(agencyId!, email, user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency', 'members'] })
      toast.success('Invitation sent')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send invitation')
    },
  })
}

// Remove team member mutation
export function useRemoveTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: string) => removeAgencyMember(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency', 'members'] })
      toast.success('Team member removed')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove team member')
    },
  })
}

// Resend invitation mutation
export function useResendInvitation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: string) => resendStaffInvitation(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency', 'members'] })
      toast.success('Invitation resent')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to resend invitation')
    },
  })
}
