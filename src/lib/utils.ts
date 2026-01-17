import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'

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
