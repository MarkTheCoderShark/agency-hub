import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Theme
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void

  // Modals
  activeModal: string | null
  modalData: Record<string, unknown> | null
  openModal: (modalId: string, data?: Record<string, unknown>) => void
  closeModal: () => void

  // Request slide-over
  selectedRequestId: string | null
  setSelectedRequestId: (id: string | null) => void

  // Project filters
  projectFilters: {
    status?: string
    search?: string
  }
  setProjectFilters: (filters: { status?: string; search?: string }) => void

  // Request filters
  requestFilters: {
    status?: string
    type?: string
    priority?: string
    search?: string
  }
  setRequestFilters: (filters: {
    status?: string
    type?: string
    priority?: string
    search?: string
  }) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Modals
      activeModal: null,
      modalData: null,
      openModal: (modalId, data = null) =>
        set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      // Request slide-over
      selectedRequestId: null,
      setSelectedRequestId: (id) => set({ selectedRequestId: id }),

      // Project filters
      projectFilters: {},
      setProjectFilters: (filters) => set({ projectFilters: filters }),

      // Request filters
      requestFilters: {},
      setRequestFilters: (filters) => set({ requestFilters: filters }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
      }),
    }
  )
)
