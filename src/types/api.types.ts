import type {
  User,
  Agency,
  AgencySubscription,
  TierLimit,
  AgencyMember,
  Project,
  ProjectMember,
  ProjectNote,
  Request,
  RequestAssignment,
  RequestMessage,
  Attachment,
  Notification,
  RequestType,
  RequestPriority,
  RequestStatus,
  ProjectStatus,
  ProjectMemberRole,
} from './database.types'

// Extended types with relations
export interface UserWithAgency extends User {
  agency_members: (AgencyMember & { agency: Agency })[]
}

export interface AgencyWithSubscription extends Agency {
  subscription: AgencySubscription
  tier_info: TierLimit
}

export interface AgencyMemberWithUser extends AgencyMember {
  user: User | null
}

export interface ProjectWithMembers extends Project {
  project_members: (ProjectMember & { user: User | null })[]
  _count?: {
    requests: number
    open_requests: number
  }
}

export interface ProjectMemberWithUser extends ProjectMember {
  user: User | null
}

export interface RequestWithDetails extends Request {
  project: Project
  created_by_user: User
  assignments: (RequestAssignment & { user: User })[]
  attachments: Attachment[]
  _count?: {
    messages: number
  }
}

export interface RequestMessageWithUser extends RequestMessage {
  user: User
  attachments: Attachment[]
}

export interface ProjectNoteWithUser extends ProjectNote {
  user: User
  attachments: Attachment[]
}

export interface NotificationWithDetails extends Notification {
  // Resolved reference data
  request?: Request
  project?: Project
}

// API Request/Response types
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  agencyName: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
  project_url?: string
  staging_url?: string
  hosting_provider?: string
  tech_stack?: string
  payment_link?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string | null
  status?: ProjectStatus
  project_url?: string | null
  staging_url?: string | null
  hosting_provider?: string | null
  tech_stack?: string | null
  payment_link?: string | null
}

export interface CreateRequestFormData {
  title: string
  type: RequestType
  priority: RequestPriority
  description: string
  attachments?: File[]
}

export interface UpdateRequestRequest {
  title?: string
  description?: string
  type?: RequestType
  priority?: RequestPriority
  status?: RequestStatus
}

export interface CreateMessageRequest {
  content: string
  is_internal?: boolean
  attachments?: File[]
}

export interface InviteStaffRequest {
  email: string
}

export interface InviteClientRequest {
  email: string
  name?: string
  project_id: string
}

export interface UpdateAgencyRequest {
  name?: string
  logo_url?: string | null
  brand_color?: string | null
  timezone?: string
}

// Filter types
export interface RequestFilters {
  status?: RequestStatus | 'all'
  type?: RequestType | 'all'
  priority?: RequestPriority | 'all'
  assigned?: 'all' | 'unassigned' | 'me' | string // string for specific user ID
  search?: string
}

export interface RequestSort {
  field: 'created_at' | 'updated_at' | 'priority'
  direction: 'asc' | 'desc'
}

// Dashboard stats
export interface AgencyDashboardStats {
  active_clients: number
  active_client_limit: number | null
  total_projects: number
  active_projects: number
  submitted_requests: number
  in_progress_requests: number
  complete_requests: number
  storage_used_gb: number
  storage_limit_gb: number | null
  staff_count: number
  staff_limit: number | null
}

export interface ProjectStats {
  total_requests: number
  submitted_requests: number
  in_progress_requests: number
  complete_requests: number
  requests_by_type: {
    type: RequestType
    count: number
  }[]
  average_completion_hours: number | null
}

// Tier features
export interface TierFeatures {
  branding_logo: boolean
  branding_color: boolean
  csv_import: boolean
  activity_log: 'none' | 'basic' | 'advanced'
  realtime: boolean
  api_access: boolean
  webhooks: boolean
  export: boolean
  sso?: boolean
  custom_domain?: boolean
}

// Pagination
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Activity log types
export type ActivityAction =
  | 'created'
  | 'status_changed'
  | 'assigned'
  | 'unassigned'
  | 'priority_changed'
  | 'completed'
  | 'message_sent'
  | 'message_edited'
  | 'message_deleted'
  | 'attachment_added'
  | 'attachment_deleted'

export interface ActivityLogEntry {
  id: string
  request_id: string
  user: User
  action: ActivityAction
  old_value: string | null
  new_value: string | null
  metadata: Record<string, unknown>
  created_at: string
}
