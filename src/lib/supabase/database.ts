import { supabase } from './client'
import type {
  Database,
  AgencyStatsView,
  AgencyStorageUsageView,
  ActiveClientsCountView,
  Agency,
  AgencySubscription,
  AgencyMember,
  User,
  Project,
  ProjectMember,
  ProjectNote,
  Request,
  RequestAssignment,
  RequestMessage,
  Attachment,
  Notification,
  NotificationPreference,
  RequestActivityLog,
} from '@/types/database.types'
import type {
  CreateProjectRequest,
  UpdateProjectRequest,
  CreateRequestFormData,
  UpdateRequestRequest,
  CreateMessageRequest,
  RequestFilters,
  RequestSort,
  AgencyMemberWithUser,
  ProjectWithMembers,
  ProjectMemberWithUser,
  RequestWithDetails,
  RequestMessageWithUser,
  ProjectNoteWithUser,
  CreateTagRequest,
  UpdateTagRequest,
  TimeEntryWithUser,
  CreateTimeEntryRequest,
  UpdateTimeEntryRequest,
  RequestTemplateWithCreator,
  CreateRequestTemplateRequest,
  UpdateRequestTemplateRequest,
  SatisfactionRatingWithUser,
  CreateSatisfactionRatingRequest,
  UpdateSatisfactionRatingRequest,
  AutomationRuleWithCreator,
  CreateAutomationRuleRequest,
  UpdateAutomationRuleRequest,
} from '@/types/api.types'
import type { Tag, TagColor, TimeEntry, RequestTemplate, ClientSatisfactionRating, AutomationRule, AutomationTrigger } from '@/types/database.types'

type Tables = Database['public']['Tables']

// Query result types for complex joins
export type AgencyWithDetails = Agency & {
  subscription: AgencySubscription | null
  members: AgencyMemberWithUser[]
}

export type ProjectWithDetails = Project & {
  project_members: ProjectMemberWithUser[]
  agency?: Agency
}

// ============================================================================
// AGENCIES
// ============================================================================

export async function getAgency(agencyId: string): Promise<AgencyWithDetails> {
  const { data, error } = await supabase
    .from('agencies')
    .select(`
      *,
      subscription:agency_subscriptions(*),
      members:agency_members(
        *,
        user:users!agency_members_user_id_fkey(*)
      )
    `)
    .eq('id', agencyId)
    .single()

  if (error) throw error
  return data as unknown as AgencyWithDetails
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

export async function getAgencyStats(agencyId: string): Promise<AgencyStatsView | null> {
  const { data, error } = await supabase
    .from('agency_stats')
    .select('*')
    .eq('agency_id', agencyId)
    .single()

  if (error) {
    // View might not have data for this agency yet
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as AgencyStatsView
}

export async function getAgencyStorageUsage(agencyId: string): Promise<AgencyStorageUsageView | null> {
  const { data, error } = await supabase
    .from('agency_storage_usage')
    .select('*')
    .eq('agency_id', agencyId)
    .single()

  if (error) {
    // View might not have data for this agency yet
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as AgencyStorageUsageView
}

export async function getActiveClientsCount(agencyId: string): Promise<ActiveClientsCountView | null> {
  const { data, error } = await supabase
    .from('active_clients_count')
    .select('*')
    .eq('agency_id', agencyId)
    .single()

  if (error) {
    // View might not have data for this agency yet
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as ActiveClientsCountView
}

// ============================================================================
// TEAM
// ============================================================================

export async function getAgencyMembers(agencyId: string): Promise<AgencyMemberWithUser[]> {
  const { data, error } = await supabase
    .from('agency_members')
    .select(`
      *,
      user:users!agency_members_user_id_fkey(*)
    `)
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as unknown as AgencyMemberWithUser[]
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
  const newToken = crypto.randomUUID()
  const { data, error } = await supabase
    .from('agency_members')
    .update({
      invitation_token: newToken,
      invitation_expires_at: new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
      invited_at: new Date().toISOString(),
    })
    .eq('id', memberId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAgencyMemberById(memberId: string) {
  const { data, error } = await supabase
    .from('agency_members')
    .select('*')
    .eq('id', memberId)
    .single()

  if (error) throw error
  return data
}

// ============================================================================
// PROJECTS
// ============================================================================

export async function getProjects(agencyId: string, includeArchived = false): Promise<ProjectWithDetails[]> {
  let query = supabase
    .from('projects')
    .select(`
      *,
      project_members(
        *,
        user:users!project_members_user_id_fkey(*)
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
  return data as unknown as ProjectWithDetails[]
}

export async function getClientProjects(
  userId: string,
  includeArchived = false
): Promise<ProjectWithDetails[]> {
  const { data, error } = await supabase
    .from('project_members')
    .select(`
      project:projects(
        *,
        agency:agencies(*),
        project_members(
          *,
          user:users!project_members_user_id_fkey(*)
        )
      )
    `)
    .eq('user_id', userId)
    .eq('role', 'client')

  if (error) throw error

  const projects = (data ?? [])
    .map((row) => row.project)
    .filter(Boolean) as ProjectWithDetails[]

  return projects.filter((project) => {
    if (project.deleted_at) return false
    if (!includeArchived && project.status === 'archived') return false
    return true
  })
}

export async function getProject(projectId: string): Promise<ProjectWithDetails> {
  const { data, error } = await supabase
    .from('projects')
    .select(`
      *,
      project_members(
        *,
        user:users!project_members_user_id_fkey(*)
      ),
      agency:agencies(*)
    `)
    .eq('id', projectId)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as unknown as ProjectWithDetails
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

export async function getProjectMembers(projectId: string): Promise<ProjectMemberWithUser[]> {
  const { data, error } = await supabase
    .from('project_members')
    .select(`
      *,
      user:users!project_members_user_id_fkey(*)
    `)
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as unknown as ProjectMemberWithUser[]
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
): Promise<RequestWithDetails[]> {
  let query = supabase
    .from('requests')
    .select(`
      *,
      created_by_user:users!requests_created_by_fkey(*),
      assignments:request_assignments(
        *,
        user:users!request_assignments_user_id_fkey(*)
      ),
      attachments(*),
      tags:request_tags(tag:tags(*))
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

  // Apply due date filters
  if (filters?.due_date && filters.due_date !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const endOfWeek = new Date(today)
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()))

    switch (filters.due_date) {
      case 'overdue':
        query = query.lt('due_date', today.toISOString()).neq('status', 'complete')
        break
      case 'due_today':
        query = query.gte('due_date', today.toISOString()).lt('due_date', tomorrow.toISOString())
        break
      case 'due_this_week':
        query = query.gte('due_date', today.toISOString()).lte('due_date', endOfWeek.toISOString())
        break
      case 'no_due_date':
        query = query.is('due_date', null)
        break
    }
  }

  // Apply sorting
  const sortField = sort?.field || 'created_at'
  const sortDir = sort?.direction === 'asc'
  query = query.order(sortField, { ascending: sortDir, nullsFirst: false })

  const { data, error } = await query

  if (error) throw error

  // Transform the nested tags structure
  const typedData = (data as any[]).map((request) => ({
    ...request,
    tags: request.tags?.map((rt: { tag: Tag }) => rt.tag).filter(Boolean) || [],
  })) as RequestWithDetails[]

  // Filter by assignment if needed
  let filteredData = typedData
  if (filters?.assigned && filters.assigned !== 'all') {
    if (filters.assigned === 'unassigned') {
      filteredData = filteredData.filter((r) => r.assignments.length === 0)
    } else {
      filteredData = filteredData.filter((r) =>
        r.assignments.some((a) => a.user_id === filters.assigned)
      )
    }
  }

  // Filter by tags if needed
  if (filters?.tags && filters.tags.length > 0) {
    filteredData = filteredData.filter((r) =>
      filters.tags!.some((tagId) => r.tags.some((t) => t.id === tagId))
    )
  }

  return filteredData
}

export async function getRequest(requestId: string): Promise<RequestWithDetails> {
  const { data, error } = await supabase
    .from('requests')
    .select(`
      *,
      project:projects(*),
      created_by_user:users!requests_created_by_fkey(*),
      assignments:request_assignments(
        *,
        user:users!request_assignments_user_id_fkey(*)
      ),
      attachments(*),
      tags:request_tags(tag:tags(*))
    `)
    .eq('id', requestId)
    .is('deleted_at', null)
    .single()

  if (error) throw error

  // Transform the nested tags structure
  const transformedData = {
    ...data,
    tags: (data as any).tags?.map((rt: { tag: Tag }) => rt.tag).filter(Boolean) || [],
  }

  return transformedData as unknown as RequestWithDetails
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
      due_date: data.due_date || null,
      estimated_hours: data.estimated_hours || null,
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
      user:users!request_assignments_user_id_fkey(*)
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

export async function getMessages(requestId: string, isAgencyUser: boolean): Promise<RequestMessageWithUser[]> {
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
  return data as unknown as RequestMessageWithUser[]
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

export async function getProjectNotes(projectId: string): Promise<ProjectNoteWithUser[]> {
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
  return data as unknown as ProjectNoteWithUser[]
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

export async function getNotifications(userId: string, unreadOnly = false): Promise<Notification[]> {
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
  return data as unknown as Notification[]
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

export async function getNotificationPreferences(userId: string): Promise<NotificationPreference | null> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // Preferences might not exist yet
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data as unknown as NotificationPreference
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
  // Try agency invitation first (staff invitation)
  const { data: agencyInv } = await supabase
    .from('agency_members')
    .select(`
      *,
      agency:agencies(*),
      inviter:users!agency_members_invited_by_fkey(id, name, email)
    `)
    .eq('invitation_token', token)
    .single()

  if (agencyInv) {
    return { type: 'staff' as const, invitation: agencyInv }
  }

  // Try project invitation (client invitation)
  const { data: projectInv, error } = await supabase
    .from('project_members')
    .select(`
      *,
      project:projects(
        *,
        agency:agencies(*)
      ),
      inviter:users!project_members_invited_by_fkey(id, name, email)
    `)
    .eq('invitation_token', token)
    .single()

  if (error) throw error
  return { type: 'client' as const, invitation: projectInv }
}

// ============================================================================
// TAGS
// ============================================================================

export async function getTags(agencyId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('agency_id', agencyId)
    .order('name', { ascending: true })

  if (error) throw error
  return data as Tag[]
}

export async function createTag(agencyId: string, data: CreateTagRequest): Promise<Tag> {
  const { data: tag, error } = await supabase
    .from('tags')
    .insert({
      agency_id: agencyId,
      name: data.name,
      color: data.color || 'gray',
    })
    .select()
    .single()

  if (error) throw error
  return tag as Tag
}

export async function updateTag(tagId: string, data: UpdateTagRequest): Promise<Tag> {
  const { data: tag, error } = await supabase
    .from('tags')
    .update(data)
    .eq('id', tagId)
    .select()
    .single()

  if (error) throw error
  return tag as Tag
}

export async function deleteTag(tagId: string): Promise<void> {
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', tagId)

  if (error) throw error
}

// ============================================================================
// REQUEST TAGS
// ============================================================================

export async function addTagToRequest(requestId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('request_tags')
    .insert({
      request_id: requestId,
      tag_id: tagId,
    })

  if (error) throw error
}

export async function removeTagFromRequest(requestId: string, tagId: string): Promise<void> {
  const { error } = await supabase
    .from('request_tags')
    .delete()
    .eq('request_id', requestId)
    .eq('tag_id', tagId)

  if (error) throw error
}

export async function setRequestTags(requestId: string, tagIds: string[]): Promise<void> {
  // First delete all existing tags
  const { error: deleteError } = await supabase
    .from('request_tags')
    .delete()
    .eq('request_id', requestId)

  if (deleteError) throw deleteError

  // Then add new tags
  if (tagIds.length > 0) {
    const { error: insertError } = await supabase
      .from('request_tags')
      .insert(tagIds.map((tagId) => ({ request_id: requestId, tag_id: tagId })))

    if (insertError) throw insertError
  }
}

// ============================================================================
// TIME TRACKING
// ============================================================================

export async function getTimeEntries(requestId: string): Promise<TimeEntryWithUser[]> {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      user:users(*)
    `)
    .eq('request_id', requestId)
    .is('deleted_at', null)
    .order('tracked_date', { ascending: false })

  if (error) throw error
  return data as unknown as TimeEntryWithUser[]
}

export async function getRequestTotalTime(requestId: string): Promise<number> {
  const { data, error } = await supabase
    .from('time_entries')
    .select('duration_minutes')
    .eq('request_id', requestId)
    .is('deleted_at', null)

  if (error) throw error
  return data.reduce((sum, entry) => sum + entry.duration_minutes, 0)
}

export async function createTimeEntry(
  requestId: string,
  userId: string,
  data: CreateTimeEntryRequest
): Promise<TimeEntry> {
  const { data: entry, error } = await supabase
    .from('time_entries')
    .insert({
      request_id: requestId,
      user_id: userId,
      duration_minutes: data.duration_minutes,
      description: data.description || null,
      tracked_date: data.tracked_date || new Date().toISOString().split('T')[0],
    })
    .select()
    .single()

  if (error) throw error
  return entry as TimeEntry
}

export async function updateTimeEntry(
  entryId: string,
  data: UpdateTimeEntryRequest
): Promise<TimeEntry> {
  const { data: entry, error } = await supabase
    .from('time_entries')
    .update(data)
    .eq('id', entryId)
    .select()
    .single()

  if (error) throw error
  return entry as TimeEntry
}

export async function deleteTimeEntry(entryId: string): Promise<void> {
  const { error } = await supabase
    .from('time_entries')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', entryId)

  if (error) throw error
}

// ============================================================================
// REQUEST TEMPLATES
// ============================================================================

export async function getRequestTemplates(agencyId: string): Promise<RequestTemplateWithCreator[]> {
  const { data, error } = await supabase
    .from('request_templates')
    .select(`
      *,
      created_by_user:users!request_templates_created_by_fkey(*)
    `)
    .eq('agency_id', agencyId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return data as unknown as RequestTemplateWithCreator[]
}

export async function getActiveRequestTemplates(agencyId: string): Promise<RequestTemplate[]> {
  const { data, error } = await supabase
    .from('request_templates')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return data as RequestTemplate[]
}

export async function getRequestTemplate(templateId: string): Promise<RequestTemplateWithCreator> {
  const { data, error } = await supabase
    .from('request_templates')
    .select(`
      *,
      created_by_user:users!request_templates_created_by_fkey(*)
    `)
    .eq('id', templateId)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as unknown as RequestTemplateWithCreator
}

export async function createRequestTemplate(
  agencyId: string,
  userId: string,
  data: CreateRequestTemplateRequest
): Promise<RequestTemplate> {
  const { data: template, error } = await supabase
    .from('request_templates')
    .insert({
      agency_id: agencyId,
      created_by: userId,
      name: data.name,
      description: data.description || null,
      default_type: data.default_type || 'bug',
      default_priority: data.default_priority || 'normal',
      title_template: data.title_template || null,
      description_template: data.description_template,
      is_active: data.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw error
  return template as RequestTemplate
}

export async function updateRequestTemplate(
  templateId: string,
  data: UpdateRequestTemplateRequest
): Promise<RequestTemplate> {
  const { data: template, error } = await supabase
    .from('request_templates')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return template as RequestTemplate
}

export async function deleteRequestTemplate(templateId: string): Promise<void> {
  const { error } = await supabase
    .from('request_templates')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', templateId)

  if (error) throw error
}

// ============================================================================
// CLIENT SATISFACTION RATINGS
// ============================================================================

export async function getRequestSatisfactionRating(
  requestId: string
): Promise<SatisfactionRatingWithUser | null> {
  const { data, error } = await supabase
    .from('client_satisfaction_ratings')
    .select(`
      *,
      user:users(*)
    `)
    .eq('request_id', requestId)
    .single()

  if (error && error.code !== 'PGRST116') throw error // PGRST116 is "no rows returned"
  return data as unknown as SatisfactionRatingWithUser | null
}

export async function createSatisfactionRating(
  requestId: string,
  userId: string,
  data: CreateSatisfactionRatingRequest
): Promise<ClientSatisfactionRating> {
  const { data: rating, error } = await supabase
    .from('client_satisfaction_ratings')
    .insert({
      request_id: requestId,
      user_id: userId,
      rating: data.rating,
      feedback: data.feedback || null,
    })
    .select()
    .single()

  if (error) throw error
  return rating as ClientSatisfactionRating
}

export async function updateSatisfactionRating(
  ratingId: string,
  data: UpdateSatisfactionRatingRequest
): Promise<ClientSatisfactionRating> {
  const { data: rating, error } = await supabase
    .from('client_satisfaction_ratings')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ratingId)
    .select()
    .single()

  if (error) throw error
  return rating as ClientSatisfactionRating
}

export async function getAgencySatisfactionStats(
  agencyId: string
): Promise<{ average_rating: number; total_ratings: number }> {
  // Get all completed requests for the agency's projects, then join with ratings
  const { data, error } = await supabase
    .from('client_satisfaction_ratings')
    .select(`
      rating,
      request:requests!inner(
        project:projects!inner(
          agency_id
        )
      )
    `)
    .eq('request.project.agency_id', agencyId)

  if (error) throw error

  const ratings = data || []
  const total = ratings.length
  const average = total > 0
    ? ratings.reduce((sum, r) => sum + r.rating, 0) / total
    : 0

  return {
    average_rating: Math.round(average * 10) / 10,
    total_ratings: total,
  }
}

// ============================================================================
// AUTOMATION RULES
// ============================================================================

export async function getAutomationRules(agencyId: string): Promise<AutomationRuleWithCreator[]> {
  const { data, error } = await supabase
    .from('automation_rules')
    .select(`
      *,
      created_by_user:users!automation_rules_created_by_fkey(*)
    `)
    .eq('agency_id', agencyId)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error
  return data as unknown as AutomationRuleWithCreator[]
}

export async function getActiveAutomationRules(
  agencyId: string,
  triggerType?: AutomationTrigger
): Promise<AutomationRule[]> {
  let query = supabase
    .from('automation_rules')
    .select('*')
    .eq('agency_id', agencyId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })

  if (triggerType) {
    query = query.eq('trigger_type', triggerType)
  }

  const { data, error } = await query

  if (error) throw error
  return data as AutomationRule[]
}

export async function getAutomationRule(ruleId: string): Promise<AutomationRuleWithCreator> {
  const { data, error } = await supabase
    .from('automation_rules')
    .select(`
      *,
      created_by_user:users!automation_rules_created_by_fkey(*)
    `)
    .eq('id', ruleId)
    .is('deleted_at', null)
    .single()

  if (error) throw error
  return data as unknown as AutomationRuleWithCreator
}

export async function createAutomationRule(
  agencyId: string,
  userId: string,
  data: CreateAutomationRuleRequest
): Promise<AutomationRule> {
  const { data: rule, error } = await supabase
    .from('automation_rules')
    .insert({
      agency_id: agencyId,
      created_by: userId,
      name: data.name,
      description: data.description || null,
      trigger_type: data.trigger_type,
      trigger_conditions: data.trigger_conditions || {},
      action_type: data.action_type,
      action_config: data.action_config,
      is_active: data.is_active ?? true,
    })
    .select()
    .single()

  if (error) throw error
  return rule as AutomationRule
}

export async function updateAutomationRule(
  ruleId: string,
  data: UpdateAutomationRuleRequest
): Promise<AutomationRule> {
  const { data: rule, error } = await supabase
    .from('automation_rules')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', ruleId)
    .select()
    .single()

  if (error) throw error
  return rule as AutomationRule
}

export async function deleteAutomationRule(ruleId: string): Promise<void> {
  const { error } = await supabase
    .from('automation_rules')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', ruleId)

  if (error) throw error
}
