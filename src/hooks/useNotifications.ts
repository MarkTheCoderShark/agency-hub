import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from '@/lib/supabase/database'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from './useAuth'
import type { Database } from '@/types/database.types'
import { toast } from 'sonner'

type NotificationPreference = Database['public']['Tables']['notification_preferences']['Update']

// Hook for notifications
export function useNotifications(unreadOnly = false) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notifications', user?.id, unreadOnly],
    queryFn: () => getNotifications(user!.id, unreadOnly),
    enabled: !!user?.id,
    refetchInterval: 30000, // Refetch every 30 seconds
  })
}

// Hook for unread count
export function useUnreadNotificationCount() {
  const { data: notifications } = useNotifications(true)
  return notifications?.length ?? 0
}

// Hook for realtime notifications
export function useRealtimeNotifications() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Invalidate queries to refetch
          queryClient.invalidateQueries({ queryKey: ['notifications'] })

          // Show toast for new notification
          const notification = payload.new as Database['public']['Tables']['notifications']['Row']
          toast.info(notification.title, {
            description: notification.body || undefined,
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id, queryClient])
}

// Mark notification as read mutation
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (notificationId: string) => markNotificationRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark notification as read')
    },
  })
}

// Mark all as read mutation
export function useMarkAllNotificationsRead() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => markAllNotificationsRead(user!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('All notifications marked as read')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark all as read')
    },
  })
}

// Hook for notification preferences
export function useNotificationPreferences() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notificationPreferences', user?.id],
    queryFn: () => getNotificationPreferences(user!.id),
    enabled: !!user?.id,
  })
}

// Update preferences mutation
export function useUpdateNotificationPreferences() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<NotificationPreference>) =>
      updateNotificationPreferences(user!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificationPreferences'] })
      toast.success('Preferences updated')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update preferences')
    },
  })
}
