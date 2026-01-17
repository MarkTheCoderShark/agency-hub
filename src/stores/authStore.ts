import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, StaffMember } from '@/types'

interface AuthState {
  user: User | null
  staffMember: StaffMember | null
  isInitialized: boolean
  setUser: (user: User | null) => void
  setStaffMember: (staff: StaffMember | null) => void
  setInitialized: (initialized: boolean) => void
  clear: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      staffMember: null,
      isInitialized: false,
      setUser: (user) => set({ user }),
      setStaffMember: (staffMember) => set({ staffMember }),
      setInitialized: (isInitialized) => set({ isInitialized }),
      clear: () => set({ user: null, staffMember: null, isInitialized: false }),
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
