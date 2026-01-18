import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getAutomationRules,
  getActiveAutomationRules,
  getAutomationRule,
  createAutomationRule,
  updateAutomationRule,
  deleteAutomationRule,
} from '@/lib/supabase/database'
import { useAgency } from './useAgency'
import { useAuth } from './useAuth'
import { toast } from 'sonner'
import type { CreateAutomationRuleRequest, UpdateAutomationRuleRequest } from '@/types/api.types'
import type { AutomationTrigger, AutomationAction } from '@/types/database.types'

// Hook for fetching all automation rules
export function useAutomationRules() {
  const { data: agency } = useAgency()
  const agencyId = agency?.id

  return useQuery({
    queryKey: ['automationRules', agencyId],
    queryFn: () => getAutomationRules(agencyId!),
    enabled: !!agencyId,
  })
}

// Hook for fetching active automation rules
export function useActiveAutomationRules(triggerType?: AutomationTrigger) {
  const { data: agency } = useAgency()
  const agencyId = agency?.id

  return useQuery({
    queryKey: ['activeAutomationRules', agencyId, triggerType],
    queryFn: () => getActiveAutomationRules(agencyId!, triggerType),
    enabled: !!agencyId,
  })
}

// Hook for fetching a single automation rule
export function useAutomationRule(ruleId: string | undefined) {
  return useQuery({
    queryKey: ['automationRule', ruleId],
    queryFn: () => getAutomationRule(ruleId!),
    enabled: !!ruleId,
  })
}

// Create automation rule mutation
export function useCreateAutomationRule() {
  const { user } = useAuth()
  const { data: agency } = useAgency()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAutomationRuleRequest) =>
      createAutomationRule(agency!.id, user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] })
      queryClient.invalidateQueries({ queryKey: ['activeAutomationRules'] })
      toast.success('Automation rule created')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create automation rule')
    },
  })
}

// Update automation rule mutation
export function useUpdateAutomationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ruleId,
      data,
    }: {
      ruleId: string
      data: UpdateAutomationRuleRequest
    }) => updateAutomationRule(ruleId, data),
    onSuccess: (_, { ruleId }) => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] })
      queryClient.invalidateQueries({ queryKey: ['activeAutomationRules'] })
      queryClient.invalidateQueries({ queryKey: ['automationRule', ruleId] })
      toast.success('Automation rule updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update automation rule')
    },
  })
}

// Delete automation rule mutation
export function useDeleteAutomationRule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ruleId: string) => deleteAutomationRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automationRules'] })
      queryClient.invalidateQueries({ queryKey: ['activeAutomationRules'] })
      toast.success('Automation rule deleted')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete automation rule')
    },
  })
}

// Utility functions for displaying automation info
export function getTriggerLabel(trigger: AutomationTrigger): string {
  switch (trigger) {
    case 'request_created':
      return 'Request Created'
    case 'request_status_changed':
      return 'Status Changed'
    case 'request_assigned':
      return 'Request Assigned'
    case 'request_overdue':
      return 'Request Overdue'
    default:
      return trigger
  }
}

export function getActionLabel(action: AutomationAction): string {
  switch (action) {
    case 'assign_user':
      return 'Assign User'
    case 'set_priority':
      return 'Set Priority'
    case 'add_tag':
      return 'Add Tag'
    case 'send_notification':
      return 'Send Notification'
    case 'change_status':
      return 'Change Status'
    default:
      return action
  }
}

export const AUTOMATION_TRIGGERS: { value: AutomationTrigger; label: string; description: string }[] = [
  {
    value: 'request_created',
    label: 'Request Created',
    description: 'When a new request is submitted',
  },
  {
    value: 'request_status_changed',
    label: 'Status Changed',
    description: 'When a request status changes',
  },
  {
    value: 'request_assigned',
    label: 'Request Assigned',
    description: 'When a request is assigned to someone',
  },
  {
    value: 'request_overdue',
    label: 'Request Overdue',
    description: 'When a request passes its due date',
  },
]

export const AUTOMATION_ACTIONS: { value: AutomationAction; label: string; description: string }[] = [
  {
    value: 'assign_user',
    label: 'Assign User',
    description: 'Automatically assign a team member',
  },
  {
    value: 'set_priority',
    label: 'Set Priority',
    description: 'Change the request priority',
  },
  {
    value: 'add_tag',
    label: 'Add Tag',
    description: 'Add a tag to the request',
  },
  {
    value: 'send_notification',
    label: 'Send Notification',
    description: 'Notify specific team members',
  },
  {
    value: 'change_status',
    label: 'Change Status',
    description: 'Update the request status',
  },
]
