import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'
import {
  signIn,
  signUp,
  signOut,
  requestPasswordReset,
  resetPassword,
  updateProfile,
  getUserAgency,
  type SignInData,
  type SignUpData,
} from '@/lib/supabase/auth'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'
import type { User, Agency } from '@/types/database.types'
import { toast } from 'sonner'

interface AuthState {
  user: SupabaseUser | null
  session: Session | null
  isLoading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
  })
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      })
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      })

      // Invalidate queries on auth change
      if (!session) {
        queryClient.clear()
      }
    })

    return () => subscription.unsubscribe()
  }, [queryClient])

  return {
    user: authState.user,
    session: authState.session,
    isLoading: authState.isLoading,
    isAuthenticated: !!authState.user,
  }
}

// Hook for user profile data
export function useUserProfile() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data as User
    },
    enabled: !!user?.id,
  })
}

// Hook for user's agency
export function useUserAgency() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['agency', user?.id],
    queryFn: async () => {
      if (!user?.id) return null
      return getUserAgency(user.id)
    },
    enabled: !!user?.id,
  })
}

// Sign in mutation
export function useSignIn() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: SignInData) => signIn(data),
    onSuccess: () => {
      queryClient.invalidateQueries()
      navigate('/')
      toast.success('Signed in successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sign in')
    },
  })
}

// Sign up mutation
export function useSignUp() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: SignUpData) => signUp(data),
    onSuccess: () => {
      toast.success('Account created! Please check your email to verify your account.')
      navigate('/verify-email')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create account')
    },
  })
}

// Sign out mutation
export function useSignOut() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
      toast.success('Signed out successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sign out')
    },
  })
}

// Request password reset mutation
export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
    onSuccess: () => {
      toast.success('Password reset email sent! Check your inbox.')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send reset email')
    },
  })
}

// Reset password mutation
export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (newPassword: string) => resetPassword(newPassword),
    onSuccess: () => {
      toast.success('Password reset successfully!')
      navigate('/login')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reset password')
    },
  })
}

// Update profile mutation
export function useUpdateProfile() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<User>) => {
      if (!user?.id) throw new Error('Not authenticated')
      return updateProfile(user.id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] })
      toast.success('Profile updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile')
    },
  })
}
