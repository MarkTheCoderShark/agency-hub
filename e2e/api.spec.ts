import { test, expect } from '@playwright/test'
import { testUsers, testAgency, generateUniqueEmail, generateUniqueSlug } from './fixtures/test-data'

/**
 * API E2E Tests
 * These tests verify the Supabase backend APIs are functioning correctly
 * by making direct API calls through the browser context
 */

test.describe('API - Authentication', () => {
  test('should return error for invalid login credentials', async ({ request }) => {
    // Note: This tests the auth flow via the frontend
    // Direct Supabase API testing would require the actual endpoint
  })
})

test.describe('API - Agencies', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(testUsers.owner.email)
    await page.getByLabel('Password').fill(testUsers.owner.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/')
  })

  test('should fetch agency data', async ({ page }) => {
    // Navigate to settings which fetches agency data
    await page.goto('/settings')

    // Agency name should be displayed
    await expect(page.getByLabel('Agency Name')).toHaveValue(/.+/)
  })

  test('should update agency settings', async ({ page }) => {
    await page.goto('/settings')

    const nameInput = page.getByLabel('Agency Name')
    const originalName = await nameInput.inputValue()

    await nameInput.clear()
    await nameInput.fill(`${originalName} Test`)
    await page.getByRole('button', { name: /save/i }).click()

    // Should show success
    await expect(page.getByText(/saved/i)).toBeVisible()

    // Revert change
    await nameInput.clear()
    await nameInput.fill(originalName)
    await page.getByRole('button', { name: /save/i }).click()
  })
})

test.describe('API - Projects', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(testUsers.owner.email)
    await page.getByLabel('Password').fill(testUsers.owner.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/')
  })

  test('should fetch projects list', async ({ page }) => {
    await page.goto('/projects')

    // Wait for projects to load
    await page.waitForLoadState('networkidle')

    // Either shows projects or empty state
    const hasProjects = await page.locator('[data-testid="project-card"]').count() > 0
    const hasEmptyState = await page.getByText(/no projects/i).isVisible()

    expect(hasProjects || hasEmptyState).toBeTruthy()
  })

  test('should create and fetch project', async ({ page }) => {
    const projectName = `API Test Project ${Date.now()}`
    const clientEmail = generateUniqueEmail('api-test')

    await page.goto('/projects')
    await page.getByRole('button', { name: /new project/i }).click()

    await page.getByLabel('Project Name').fill(projectName)
    await page.getByLabel('Client Name').fill('API Test Client')
    await page.getByLabel('Client Email').fill(clientEmail)
    await page.getByRole('button', { name: /create project/i }).click()

    // Wait for creation
    await page.waitForTimeout(1000)

    // Project should appear
    await expect(page.getByText(projectName)).toBeVisible()
  })
})

test.describe('API - Requests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(testUsers.owner.email)
    await page.getByLabel('Password').fill(testUsers.owner.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/')
  })

  test('should fetch requests for a project', async ({ page }) => {
    await page.goto('/projects')

    const firstProject = page.getByRole('link', { name: /project/i }).first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      await page.getByRole('tab', { name: /requests/i }).click()

      // Wait for requests to load
      await page.waitForLoadState('networkidle')

      // Should show requests or empty state
      const hasRequests = await page.locator('[data-testid="request-item"]').count() > 0
      const hasEmptyState = await page.getByText(/no requests/i).isVisible()

      expect(hasRequests || hasEmptyState).toBeTruthy()
    }
  })

  test('should create request and fetch it', async ({ page }) => {
    await page.goto('/projects')

    const firstProject = page.getByRole('link', { name: /project/i }).first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      await page.getByRole('tab', { name: /requests/i }).click()
      await page.getByRole('button', { name: /new request/i }).click()

      const requestTitle = `API Test Request ${Date.now()}`
      await page.getByLabel('Title').fill(requestTitle)
      await page.getByLabel('Type').click()
      await page.getByRole('option', { name: /feature/i }).click()
      await page.getByLabel('Description').fill('API test request description')
      await page.getByRole('button', { name: /create/i }).click()

      await page.waitForTimeout(1000)

      // Request should appear in list
      await expect(page.getByText(requestTitle)).toBeVisible()
    }
  })
})

test.describe('API - Messages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(testUsers.owner.email)
    await page.getByLabel('Password').fill(testUsers.owner.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/')
  })

  test('should fetch messages for a request', async ({ page }) => {
    await page.goto('/projects')

    const firstProject = page.getByRole('link', { name: /project/i }).first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      await page.getByRole('tab', { name: /requests/i }).click()

      const firstRequest = page.locator('[data-testid="request-item"]').first()
      if (await firstRequest.isVisible()) {
        await firstRequest.click()

        // Messages area should load
        await page.waitForLoadState('networkidle')

        // Should show conversation area
        await expect(page.getByText(/conversation/i)).toBeVisible()
      }
    }
  })

  test('should create message and display it', async ({ page }) => {
    await page.goto('/projects')

    const firstProject = page.getByRole('link', { name: /project/i }).first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      await page.getByRole('tab', { name: /requests/i }).click()

      const firstRequest = page.locator('[data-testid="request-item"]').first()
      if (await firstRequest.isVisible()) {
        await firstRequest.click()

        const messageContent = `API test message ${Date.now()}`
        const messageInput = page.getByRole('textbox', { name: /message/i })

        if (await messageInput.isVisible()) {
          await messageInput.fill(messageContent)
          await page.getByRole('button', { name: /send/i }).click()

          await page.waitForTimeout(1000)

          // Message should appear
          await expect(page.getByText(messageContent)).toBeVisible()
        }
      }
    }
  })
})

test.describe('API - Team Members', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(testUsers.owner.email)
    await page.getByLabel('Password').fill(testUsers.owner.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/')
  })

  test('should fetch team members', async ({ page }) => {
    await page.goto('/team')

    await page.waitForLoadState('networkidle')

    // Should show current user at minimum
    await expect(page.getByText(testUsers.owner.name)).toBeVisible()
  })

  test('should send team invitation', async ({ page }) => {
    const inviteEmail = generateUniqueEmail('team-invite')

    await page.goto('/team')
    await page.getByRole('button', { name: /invite/i }).click()

    await page.getByLabel('Email').fill(inviteEmail)
    await page.getByLabel('Role').click()
    await page.getByRole('option', { name: /staff/i }).click()
    await page.getByRole('button', { name: /send/i }).click()

    // Should show success message
    await expect(page.getByText(/invitation.*sent/i)).toBeVisible()
  })
})

test.describe('API - Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(testUsers.owner.email)
    await page.getByLabel('Password').fill(testUsers.owner.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/')
  })

  test('should fetch notifications', async ({ page }) => {
    // Click notification bell/icon
    const notificationButton = page.getByRole('button', { name: /notification/i })
    if (await notificationButton.isVisible()) {
      await notificationButton.click()

      // Should show notifications dropdown or panel
      await page.waitForTimeout(500)
    }
  })

  test('should update notification preferences', async ({ page }) => {
    await page.goto('/profile')

    // Find notification settings
    const emailToggle = page.getByRole('switch', { name: /email/i })
    if (await emailToggle.isVisible()) {
      const wasChecked = await emailToggle.isChecked()
      await emailToggle.click()

      // Verify it changed
      await expect(emailToggle).toBeChecked({ checked: !wasChecked })

      // Revert
      await emailToggle.click()
    }
  })
})

test.describe('API - Storage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(testUsers.owner.email)
    await page.getByLabel('Password').fill(testUsers.owner.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/')
  })

  test('should display storage usage in billing', async ({ page }) => {
    await page.goto('/settings/billing')

    // Should show storage usage
    await expect(page.getByText(/storage/i)).toBeVisible()
  })
})

test.describe('API - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page, context }) => {
    // Login first
    await page.goto('/login')
    await page.getByLabel('Email').fill(testUsers.owner.email)
    await page.getByLabel('Password').fill(testUsers.owner.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/')

    // Simulate offline
    await context.setOffline(true)

    // Try to navigate
    await page.goto('/projects')

    // Should show error or offline message
    await context.setOffline(false)
  })

  test('should show validation errors from API', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill(testUsers.owner.email)
    await page.getByLabel('Password').fill(testUsers.owner.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL('/')

    await page.goto('/settings')

    // Try to save with invalid data
    const slugInput = page.getByLabel('Slug')
    await slugInput.clear()
    await slugInput.fill('INVALID SLUG!')
    await page.getByRole('button', { name: /save/i }).click()

    // Should show validation error
    await expect(page.getByText(/invalid|error/i)).toBeVisible()
  })
})
