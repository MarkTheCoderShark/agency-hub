import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isBefore, isToday, startOfDay, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date) {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function formatRelativeTime(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function truncate(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    // Request statuses
    submitted: 'bg-blue-100 text-blue-800',
    in_progress: 'bg-orange-100 text-orange-800',
    complete: 'bg-green-100 text-green-800',
    // Project statuses
    active: 'bg-green-100 text-green-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-gray-100 text-gray-800',
    archived: 'bg-gray-100 text-gray-500',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

export function getTypeColor(type: string) {
  const colors: Record<string, string> = {
    bug: 'bg-red-100 text-red-800',
    change: 'bg-blue-100 text-blue-800',
    feature: 'bg-purple-100 text-purple-800',
    question: 'bg-gray-100 text-gray-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

export function getPriorityColor(priority: string) {
  const colors: Record<string, string> = {
    normal: 'bg-gray-100 text-gray-800',
    urgent: 'bg-red-100 text-red-800',
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function generateId() {
  return crypto.randomUUID()
}

// File helpers
export const ALLOWED_FILE_TYPES = [
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

export const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25MB
export const MAX_FILES_PER_UPLOAD = 10

export function isValidFileType(file: File) {
  return ALLOWED_FILE_TYPES.includes(file.type)
}

export function isValidFileSize(file: File) {
  return file.size <= MAX_FILE_SIZE
}

export function getFileExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Error handling
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}

// Due date helpers
export function isOverdue(dueDate: string | Date | null | undefined, status?: string): boolean {
  if (!dueDate) return false
  if (status === 'complete') return false
  const date = new Date(dueDate)
  return isBefore(startOfDay(date), startOfDay(new Date()))
}

export function isDueToday(dueDate: string | Date | null | undefined): boolean {
  if (!dueDate) return false
  return isToday(new Date(dueDate))
}

export function isDueSoon(dueDate: string | Date | null | undefined, daysThreshold = 3): boolean {
  if (!dueDate) return false
  const date = new Date(dueDate)
  const today = startOfDay(new Date())
  const days = differenceInDays(startOfDay(date), today)
  return days >= 0 && days <= daysThreshold
}

export function formatDueDate(dueDate: string | Date | null | undefined): string {
  if (!dueDate) return ''
  const date = new Date(dueDate)

  if (isToday(date)) {
    return 'Today'
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
    return 'Tomorrow'
  }

  const days = differenceInDays(startOfDay(date), startOfDay(new Date()))
  if (days < 0) {
    return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`
  }
  if (days <= 7) {
    return format(date, 'EEEE') // Day name
  }

  return format(date, 'MMM d')
}

export function getDueDateColor(dueDate: string | Date | null | undefined, status?: string): string {
  if (!dueDate) return ''
  if (status === 'complete') return 'text-muted-foreground'

  if (isOverdue(dueDate, status)) {
    return 'text-red-600 bg-red-50'
  }
  if (isDueToday(dueDate)) {
    return 'text-orange-600 bg-orange-50'
  }
  if (isDueSoon(dueDate)) {
    return 'text-yellow-600 bg-yellow-50'
  }
  return 'text-muted-foreground'
}

// Tag color helpers
export function getTagColorClasses(color: string): { bg: string; text: string; border: string } {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    gray: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' },
    red: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
    orange: { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-200' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
    green: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    pink: { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-200' },
  }
  return colors[color] || colors.gray
}
