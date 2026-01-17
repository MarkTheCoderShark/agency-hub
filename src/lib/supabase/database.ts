import { supabase } from './client'
import type { Database } from '@/types/database.types'
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateRequestFormData,
  UpdateRequestRequest,
  CreateMessageRequest,
  RequestFilters,
  RequestSort,
} from '@/types/api.types'

type Tables = Database['public']['Tables']

// ============================================================================
// AGENCIES
// ============================================================================

export async function getAgency(agencyId: string) {
  const { data, error } = await supabase
    .from('agencies')
    .select(`
      *,
      subscription:agency_subscriptions(*),
      members:agency_members(
        *,
        user:users(*)
      )
    `)
    .eq('id', agencyId)
    .single()

  if (error) throw error
  return data
}

export async function updateAgency(
  agencyId: string,
  data: Partial<Tables['agencies']['Update']>
) {
  const { error } = await supabase
    .from('agencies')
    .update(data)
    .eq('id', agencyId)

  if (error) throw error
}

export async function getAgencyStats(agencyId: string) {
  const { data, error } = await supabase
    .from('agency_stats')
    .select('*')
    .eq('agency_id', agencyId)
    .single()

  if (error) throw error
  return data
}

export async function getAgencyStorageUsage(agencyId: string) {
  const { data, error } = await supabase
    .from('agency_storage_usage')
    .select('*')
    .eq('agency_id', agencyId)
    .single()

  if (error) throw error
  return data
}

export async function getActiveClientsCount(agencyId: string) {
  const { data, error } = await supabase
    .from('active_clients_count')
    .select('*')
    .eq('agency_id', agencyId)
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// TEAM
// ============================================================================

export async function getAgencyMembers(agencyId: string) {
  const { data, error } = await supabase
    .from('agency_members')
    .select(`
      *,
      user:users(*)
    `)
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function inviteStaffMember(agencyId: string, email: string, invitedBy: string) {
  const { data, error } = await supabase
    .from('agency_members')
    .insert({
      agency_id: agencyId,
      invitation_email: email,
      invitation_token: crypto.randomUUID(),
      invitation_expires_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      invited_by: invitedBy,
      invited_at: new Date().toISOString(),
      role: 'staff',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeAgencyMember(memberId: string) {
  const { error } = await supabase
    .from('agency_members')
    .delete()
    .eq('id', memberId)

  if (error) throw error
}

export async function resendStaffInvitation(memberId: string) {
  const { error } = await supabase
    .from('agency_members')
    .update({
      invitation_token: crypto.randomUUID(),
      invitation_expires_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      invited_at: new Date().toISOString(),
    })
    .eq('id', memberId)

  if (error) throw error
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function getProjects(agencyId: string, includeArchived = false) {
  let query = supabase
    .from('projects')
    .select(`
      *,
      project_members(
        *,
        user:users(*)
      )
    `)
    .eq('agency_id', agencyId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })

  if (!includeArchived) {
    query = query.neq('status', 'archived')
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getProject(projectId: string) {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members(
        *,
        user:users(*)
      ),
      agency:agencies(*)
    `)
    .eq('id', projectId)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

export async function createProject(agencyId: string, userId: string, data: CreateProjectRequest) {
  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      agency_id: agencyId,
      created_by: userId,
      ...data,
    })
    .select()
    .single()

  if (error) throw error
  return project
}

export async function updateProject(projectId: string, data: UpdateProjectRequest) {
  const { error } = await supabase
    .from('projects')
    .update(data)
    .eq('id', projectId)

  if (error) throw error
}

export async function archiveProject(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .update({ status: 'archived' })
    .eq('id', projectId)

  if (error) throw error
}

export async function deleteProject(projectId: string) {
  const { error } = await supabase
    .from('projects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) throw error
}

// ============================================================================
// PROJECT MEMBERS
// ============================================================================

export async function getProjectMembers(projectId: string) {
  const { data, error } = await supabase
    .from('project_members')
    .select(`
      *,
      user:users(*)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role: 'lead' | 'staff'
) {
  const { data, error } = await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      user_id: userId,
      role,
      joined_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function inviteClient(
  projectId: string,
  email: string,
  invitedBy: string
) {
  const { data, error } = await supabase
    .from('project_members')
    .insert({
      project_id: projectId,
      role: 'client',
      invitation_email: email,
      invitation_token: crypto.randomUUID(),
      invitation_expires_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      invited_by: invitedBy,
      invited_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeProjectMember(memberId: string) {
  const { error } = await supabase
    .from('project_members')
    .delete()
    .eq('id', memberId)

  if (error) throw error
}

export async function updateProjectMemberRole(
  memberId: string,
  role: 'lead' | 'staff'
) {
  const { error } = await supabase
    .from('project_members')
    .update({ role })
    .eq('id', memberId)

  if (error) throw error
}

// ============================================================================
// REQUESTS
// ============================================================================

export async function getRequests(
  projectId: string,
  filters?: RequestFilters,
  sort?: RequestSort
) {
  let query = supabase
    .from('requests')
    .select(`
      *,
      created_by_user:users!requests_created_by_fkey(*),
      assignments:request_assignments(
        *,
        user:users(*)
      ),
      attachments(*)
    `)
    .eq('project_id', projectId)
    .is('deleted_at', null)

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }
  if (filters?.type && filters.type !== 'all') {
    query = query.eq('type', filters.type)
  }
  if (filters?.priority && filters.priority !== 'all') {
    query = query.eq('priority', filters.priority)
  }
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
  }

  // Apply sorting
  const sortField = sort?.field || 'created_at'
  const sortDir = sort?.direction === 'asc'
  query = query.order(sortField, { ascending: sortDir })

  const { data, error } = await query

  if (error) throw error

  // Filter by assignment if needed
  if (filters?.assigned && filters.assigned !== 'all') {
    if (filters.assigned === 'unassigned') {
      return data.filter((r) => r.assignments.length === 0)
    }
    return data.filter((r) =>
      r.assignments.some((a) => a.user_id === filters.assigned)
    )
  }

  return data
}

export async function getRequest(requestId: string) {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      project:projects(*),
      created_by_user:users!requests_created_by_fkey(*),
      assignments:request_assignments(
        *,
        user:users(*)
      ),
      attachments(*)
    `)
    .eq('id', requestId)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data
}

export async function createRequest(
  projectId: string,
  userId: string,
  data: Omit<CreateRequestFormData, 'attachments'>
) {
  const { data: request, error } = await supabase
    .from('requests')
    .insert({
      project_id: projectId,
      created_by: userId,
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
    })
    .select()
    .single()

  if (error) throw error
  return request
}

export async function updateRequest(requestId: string, data: UpdateRequestRequest) {
  const updateData: Record<string, unknown> = { ...data }

  // If status is changing to complete, set completed_at
  if (data.status === 'complete') {
    updateData.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('requests')
    .update(updateData)
    .eq('id', requestId)

  if (error) throw error
}

export async function deleteRequest(requestId: string) {
  const { error } = await supabase
    .from('requests')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', requestId)

  if (error) throw error
}

// ============================================================================
// REQUEST ASSIGNMENTS
// ============================================================================

export async function assignRequest(
  requestId: string,
  userId: string,
  assignedBy: string
) {
  const { data, error } = await supabase
    .from('request_assignments')
    .insert({
      request_id: requestId,
      user_id: userId,
      assigned_by: assignedBy,
    })
    .select(`
      *,
      user:users(*)
    `)
    .single()

  if (error) throw error
  return data
}

export async function unassignRequest(requestId: string, userId: string) {
  const { error } = await supabase
    .from('request_assignments')
    .delete()
    .eq('request_id', requestId)
    .eq('user_id', userId)

  if (error) throw error
}

// ============================================================================
// MESSAGES
// ============================================================================

export async function getMessages(requestId: string, isAgencyUser: boolean) {
  let query = supabase
    .from('request_messages')
    .select(`
      *,
      user:users(*),
      attachments(*)
    `)
    .eq('request_id', requestId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  // Clients can only see non-internal messages
  if (!isAgencyUser) {
    query = query.eq('is_internal', false)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function createMessage(
  requestId: string,
  userId: string,
  data: Omit<CreateMessageRequest, 'attachments'>
) {
  const { data: message, error } = await supabase
    .from('request_messages')
    .insert({
      request_id: requestId,
      user_id: userId,
      content: data.content,
      is_internal: data.is_internal || false,
    })
    .select(`
      *,
      user:users(*)
    `)
    .single()

  if (error) throw error
  return message
}

export async function updateMessage(messageId: string, content: string) {
  const { error } = await supabase
    .from('request_messages')
    .update({ content })
    .eq('id', messageId)

  if (error) throw error
}

export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('request_messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId)

  if (error) throw error
}

// ============================================================================
// PROJECT NOTES
// ============================================================================

export async function getProjectNotes(projectId: string) {
  const { data, error } = await supabase
    .from('project_notes')
    .select(`
      *,
      user:users(*),
      attachments(*)
    `)
    .eq('project_id', projectId)
    .is('deleted_at', null)
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProjectNote(
  projectId: string,
  userId: string,
  data: { title?: string; content: string }
) {
  const { data: note, error } = await supabase
    .from('project_notes')
    .insert({
      project_id: projectId,
      user_id: userId,
      ...data,
    })
    .select(`
      *,
      user:users(*)
    `)
    .single()

  if (error) throw error
  return note
}

export async function updateProjectNote(
  noteId: string,
  data: { title?: string; content?: string; is_pinned?: boolean }
) {
  const { error } = await supabase
    .from('project_notes')
    .update(data)
    .eq('id', noteId)

  if (error) throw error
}

export async function deleteProjectNote(noteId: string) {
  const { error } = await supabase
    .from('project_notes')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', noteId)

  if (error) throw error
}

// ============================================================================
// NOTIFICATIONS
// ============================================================================

export async function getNotifications(userId: string, unreadOnly = false) {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (unreadOnly) {
    query = query.is('read_at', null)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) throw error
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null)

  if (error) throw error
}

export async function getNotificationPreferences(userId: string) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data
}

export async function updateNotificationPreferences(
  userId: string,
  data: Partial<Tables['notification_preferences']['Update']>
) {
  const { error } = await supabase
    .from('notification_preferences')
    .update(data)
    .eq('user_id', userId)

  if (error) throw error
}

// ============================================================================
// ACTIVITY LOG
// ============================================================================

export async function getRequestActivityLog(requestId: string) {
  const { data, error } = await supabase
    .from('request_activity_log')
    .select(`
      *,
      user:users(*)
    `)
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ============================================================================
// INVITATIONS
// ============================================================================

export async function getInvitationByToken(token: string) {
  // Try agency invitation first
  const { data: agencyInv } = await supabase
    .from('agency_members')
    .select(`
      *,
      agency:agencies(*)
    `)
    .eq('invitation_token', token)
    .single()

  if (agencyInv) {
    return { type: 'staff' as const, invitation: agencyInv }
  }

  // Try project invitation
  const { data: projectInv, error } = await supabase
    .from('project_members')
    .select(`
      *,
      project:projects(
        *,
        agency:agencies(*)
      )
    `)
    .eq('invitation_token', token)
    .single()

  if (error) throw error
  return { type: 'client' as const, invitation: projectInv }
}
