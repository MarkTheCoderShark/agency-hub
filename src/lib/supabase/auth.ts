import { supabase } from './client'
import type { Database } from '@/types/database.types'

type Tables = Database['public']['Tables']

export interface SignUpData {
  email: string
  password: string
  name: string
  agencyName: string
}

export interface SignInData {
  email: string
  password: string
}

// Sign up new user and create agency
export async function signUp({ email, password, name, agencyName }: SignUpData) {
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        agency_name: agencyName,
      },
    },
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Failed to create user')

  // 2. Create user profile (will be created by trigger, but we can do it here for immediate access)
  const { error: userError } = await supabase.from('users').insert({
    id: authData.user.id,
    email,
    name,
    email_verified: false,
  } as any)

  if (userError) throw userError

  // 3. Create agency
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .insert({
      name: agencyName,
      owner_id: authData.user.id,
    })
    .select()
    .single()

  if (agencyError) throw agencyError

  return { user: authData.user, agency }
}

// Sign in existing user
export async function signIn({ email, password }: SignInData) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// Request password reset
export async function requestPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })

  if (error) throw error
}

// Reset password with token
export async function resetPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
}

// Resend verification email
export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
  })

  if (error) throw error
}

// Verify email (called after clicking link)
export async function verifyEmail(token: string, type: string) {
  const { error } = await supabase.auth.verifyOtp({
    token_hash: token,
    type: type as 'signup' | 'recovery' | 'invite',
  })

  if (error) throw error
}

// Update user profile
export async function updateProfile(userId: string, data: Partial<Tables['users']['Update']>) {
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId)

  if (error) throw error
}

// Get user's agency
export async function getUserAgency(userId: string) {
  const { data, error } = await supabase
    .from('agency_members')
    .select(`
      agency:agencies (
        *,
        subscription:agency_subscriptions (*)
      )
    `)
    .eq('user_id', userId)
    .single()

  if (error) throw error
  return data?.agency
}

// Accept staff invitation
export async function acceptStaffInvitation(token: string, password: string, name: string) {
  // 1. Get invitation details
  const { data: invitation, error: invError } = await supabase
    .from('agency_members')
    .select('*, agency:agencies(*)')
    .eq('invitation_token', token)
    .gt('invitation_expires_at', new Date().toISOString())
    .is('user_id', null)
    .single()

  if (invError || !invitation) {
    throw new Error('Invalid or expired invitation')
  }

  // 2. Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: invitation.invitation_email!,
    password,
    options: {
      data: { name },
    },
  })

  if (authError) throw authError
  if (!authData.user) throw new Error('Failed to create user')

  // 3. Create user profile
  const { error: userError } = await supabase.from('users').insert({
    id: authData.user.id,
    email: invitation.invitation_email!,
    name,
    email_verified: true, // Verified via invitation
  })

  if (userError) throw userError

  // 4. Update agency member record
  const { error: memberError } = await supabase
    .from('agency_members')
    .update({
      user_id: authData.user.id,
      invitation_token: null,
      joined_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  if (memberError) throw memberError

  return { user: authData.user, agency: invitation.agency }
}

// Accept client invitation
export async function acceptClientInvitation(token: string, password: string, name: string) {
  // 1. Get invitation details
  const { data: invitation, error: invError } = await supabase
    .from('project_members')
    .select('*, project:projects(*, agency:agencies(*))')
    .eq('invitation_token', token)
    .gt('invitation_expires_at', new Date().toISOString())
    .is('user_id', null)
    .single()

  if (invError || !invitation) {
    throw new Error('Invalid or expired invitation')
  }

  // 2. Check if user already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', invitation.invitation_email!)
    .single()

  let userId: string

  if (existingUser) {
    // User exists, just sign them in
    userId = existingUser.id
  } else {
    // Create new user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invitation.invitation_email!,
      password,
      options: {
        data: { name },
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // Create user profile
    const { error: userError } = await supabase.from('users').insert({
      id: authData.user.id,
      email: invitation.invitation_email!,
      name,
      email_verified: true,
    })

    if (userError) throw userError
    userId = authData.user.id
  }

  // 3. Update project member record
  const { error: memberError } = await supabase
    .from('project_members')
    .update({
      user_id: userId,
      invitation_token: null,
      joined_at: new Date().toISOString(),
    })
    .eq('id', invitation.id)

  if (memberError) throw memberError

  return { project: invitation.project }
}
