import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AgencyMember } from '@/types'

interface AuthState {
  user: User | null
  agencyMember: AgencyMember | null
  isInitialized: boolean
  setUser: (user: User | null) => void
  setAgencyMember: (member: AgencyMember | null) => void
  setInitialized: (initialized: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      agencyMember: null,
      isInitialized: false,
      setUser: (user) => set({ user }),
      setAgencyMember: (agencyMember) => set({ agencyMember }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      clear: () => set({ user: null, agencyMember: null, isInitialized: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Only persist non-sensitive data
        isInitialized: state.isInitialized,
      }),
    }
  )
)
