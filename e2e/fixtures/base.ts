import { test as base, expect, Page } from '@playwright/test'
import { testUsers, testAgency } from './test-data'

/**
 * Extended test fixtures for AgencyHub E2E tests
 */

// Auth helper type
interface AuthHelper {
  login(email: string, password: string): Promise<void>
  logout(): Promise<void>
  register(email: string, password: string, name: string): Promise<void>
}

// Page object types
interface DashboardPage {
  goto(): Promise<void>
  getStats(): Promise<{ projects: string; requests: string; clients: string }>
  navigateToProjects(): Promise<void>
  navigateToTeam(): Promise<void>
  navigateToSettings(): Promise<void>
}

interface ProjectsPage {
  goto(): Promise<void>
  createProject(name: string, description: string, clientName: string, clientEmail: string): Promise<void>
  openProject(name: string): Promise<void>
  searchProjects(query: string): Promise<void>
}

interface RequestsHelper {
  createRequest(projectId: string, data: { title: string; type: string; priority: string; description: string }): Promise<void>
  updateStatus(requestId: string, status: string): Promise<void>
  addMessage(requestId: string, content: string): Promise<void>
}

// Extend the base test with custom fixtures
export const test = base.extend<{
  auth: AuthHelper
  dashboardPage: DashboardPage
  projectsPage: ProjectsPage
  requestsHelper: RequestsHelper
}>({
  // Auth helper fixture
  auth: async ({ page }, use) => {
    const auth: AuthHelper = {
      async login(email: string, password: string) {
        await page.goto('/login')
        await page.getByLabel('Email').fill(email)
        await page.getByLabel('Password').fill(password)
        await page.getByRole('button', { name: 'Sign In' }).click()
        await page.waitForURL('/')
      },

      async logout() {
        // Click user menu and logout
        await page.getByRole('button', { name: /account/i }).click()
        await page.getByRole('menuitem', { name: /sign out/i }).click()
        await page.waitForURL('/login')
      },

      async register(email: string, password: string, name: string) {
        await page.goto('/register')
        await page.getByLabel('Name').fill(name)
        await page.getByLabel('Email').fill(email)
        await page.getByLabel('Password', { exact: true }).fill(password)
        await page.getByLabel('Confirm Password').fill(password)
        await page.getByRole('button', { name: 'Create Account' }).click()
        // May redirect to verify email or dashboard depending on config
      },
    }
    await use(auth)
  },

  // Dashboard page object
  dashboardPage: async ({ page }, use) => {
    const dashboardPage: DashboardPage = {
      async goto() {
        await page.goto('/')
        await page.waitForLoadState('networkidle')
      },

      async getStats() {
        const projects = await page.locator('[data-testid="stat-projects"]').textContent() || '0'
        const requests = await page.locator('[data-testid="stat-requests"]').textContent() || '0'
        const clients = await page.locator('[data-testid="stat-clients"]').textContent() || '0'
        return { projects, requests, clients }
      },

      async navigateToProjects() {
        await page.getByRole('link', { name: 'Projects' }).click()
        await page.waitForURL('/projects')
      },

      async navigateToTeam() {
        await page.getByRole('link', { name: 'Team' }).click()
        await page.waitForURL('/team')
      },

      async navigateToSettings() {
        await page.getByRole('link', { name: 'Settings' }).click()
        await page.waitForURL('/settings')
      },
    }
    await use(dashboardPage)
  },

  // Projects page object
  projectsPage: async ({ page }, use) => {
    const projectsPage: ProjectsPage = {
      async goto() {
        await page.goto('/projects')
        await page.waitForLoadState('networkidle')
      },

      async createProject(name: string, description: string, clientName: string, clientEmail: string) {
        await page.getByRole('button', { name: /new project/i }).click()
        await page.getByLabel('Project Name').fill(name)
        await page.getByLabel('Description').fill(description)
        await page.getByLabel('Client Name').fill(clientName)
        await page.getByLabel('Client Email').fill(clientEmail)
        await page.getByRole('button', { name: 'Create Project' }).click()
        await page.waitForResponse((res) => res.url().includes('/projects') && res.status() === 200)
      },

      async openProject(name: string) {
        await page.getByRole('link', { name }).click()
        await page.waitForURL(/\/projects\/.*/)
      },

      async searchProjects(query: string) {
        await page.getByPlaceholder('Search projects').fill(query)
        await page.waitForTimeout(300) // Debounce
      },
    }
    await use(projectsPage)
  },

  // Requests helper
  requestsHelper: async ({ page }, use) => {
    const requestsHelper: RequestsHelper = {
      async createRequest(projectId: string, data) {
        await page.goto(`/projects/${projectId}`)
        await page.getByRole('tab', { name: 'Requests' }).click()
        await page.getByRole('button', { name: /new request/i }).click()

        await page.getByLabel('Title').fill(data.title)
        await page.getByLabel('Type').click()
        await page.getByRole('option', { name: data.type }).click()
        await page.getByLabel('Description').fill(data.description)

        await page.getByRole('button', { name: 'Create Request' }).click()
      },

      async updateStatus(requestId: string, status: string) {
        await page.getByRole('button', { name: /status/i }).click()
        await page.getByRole('option', { name: status }).click()
      },

      async addMessage(requestId: string, content: string) {
        await page.getByPlaceholder('Type your message').fill(content)
        await page.getByRole('button', { name: 'Send' }).click()
      },
    }
    await use(requestsHelper)
  },
})

export { expect }
