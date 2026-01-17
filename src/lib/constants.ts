// App constants
export const APP_NAME = 'AgencyHub'
export const APP_DESCRIPTION = 'Client management platform for digital agencies'

// Tier configuration
export const TIERS = {
  free: {
    name: 'Free',
    description: 'For trying out the platform',
    monthlyPrice: 0,
    annualPrice: 0,
  },
  starter: {
    name: 'Starter',
    description: 'For freelancers and small agencies',
    monthlyPrice: 29,
    annualPrice: 290,
  },
  growth: {
    name: 'Growth',
    description: 'Most popular for established agencies',
    monthlyPrice: 79,
    annualPrice: 790,
  },
  scale: {
    name: 'Scale',
    description: 'For larger agencies with high volume',
    monthlyPrice: 149,
    annualPrice: 1490,
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Custom solutions for 50+ active clients',
    monthlyPrice: null,
    annualPrice: null,
  },
} as const

// Request types
export const REQUEST_TYPES = [
  { value: 'bug', label: 'Bug', description: 'Something is broken or not working correctly' },
  { value: 'change', label: 'Change', description: 'Modification to existing functionality' },
  { value: 'feature', label: 'New Feature', description: 'Request for new functionality' },
  { value: 'question', label: 'Question', description: 'Question or inquiry' },
] as const

// Request priorities
export const REQUEST_PRIORITIES = [
  { value: 'normal', label: 'Normal', description: 'Standard priority' },
  { value: 'urgent', label: 'Urgent', description: 'High priority, needs immediate attention' },
] as const

// Request statuses
export const REQUEST_STATUSES = [
  { value: 'submitted', label: 'Submitted', color: 'blue' },
  { value: 'in_progress', label: 'In Progress', color: 'orange' },
  { value: 'complete', label: 'Complete', color: 'green' },
] as const

// Project statuses
export const PROJECT_STATUSES = [
  { value: 'active', label: 'Active', description: 'Ongoing work, requests accepted' },
  { value: 'on_hold', label: 'On Hold', description: 'Paused, requests queued' },
  { value: 'completed', label: 'Completed', description: 'Work finished, read-only for client' },
  { value: 'archived', label: 'Archived', description: 'Removed from active lists' },
] as const

// Timezones (common ones)
export const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
] as const

// Invitation expiry
export const INVITATION_EXPIRY_DAYS = 7

// Message edit window
export const MESSAGE_EDIT_WINDOW_MINUTES = 5

// Pagination defaults
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

// File upload
export const MAX_ATTACHMENT_SIZE_MB = 25
export const MAX_ATTACHMENTS_PER_UPLOAD = 10
export const ALLOWED_ATTACHMENT_TYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'application/zip',
]

// Logo upload
export const MAX_LOGO_SIZE_MB = 2
export const ALLOWED_LOGO_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']
export const RECOMMENDED_LOGO_WIDTH = 400
export const RECOMMENDED_LOGO_HEIGHT = 100

// Navigation
export const DASHBOARD_NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/projects', label: 'Projects', icon: 'FolderKanban' },
  { path: '/team', label: 'Team', icon: 'Users' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
] as const

// Notification types
export const NOTIFICATION_TYPES = {
  new_request: 'new_request',
  status_changed: 'status_changed',
  new_reply: 'new_reply',
  assignment: 'assignment',
  invitation: 'invitation',
  tier_limit_warning: 'tier_limit_warning',
  tier_limit_exceeded: 'tier_limit_exceeded',
} as const
