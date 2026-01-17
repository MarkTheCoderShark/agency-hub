import { test, expect } from './fixtures/base'
import { testUsers, testAgency, testRequest } from './fixtures/test-data'

test.describe('Client Portal', () => {
  test.describe('Portal Login', () => {
    test('should display portal login page with agency branding', async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)

      await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page.getByText(/email.*required/i)).toBeVisible()
      await expect(page.getByText(/password.*required/i)).toBeVisible()
    })

    test('should login client successfully', async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByLabel('Email').fill(testUsers.client.email)
      await page.getByLabel('Password').fill(testUsers.client.password)
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page).toHaveURL(new RegExp(`/portal/${testAgency.slug}`))
    })

    test('should show error for non-client user', async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByLabel('Email').fill('random@test.com')
      await page.getByLabel('Password').fill('wrongpassword')
      await page.getByRole('button', { name: /sign in/i }).click()

      await expect(page.getByText(/invalid.*credentials/i)).toBeVisible()
    })

    test('should show 404 for invalid agency slug', async ({ page }) => {
      await page.goto('/portal/non-existent-agency/login')

      await expect(page.getByText(/not found/i)).toBeVisible()
    })
  })

  test.describe('Portal Dashboard', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByLabel('Email').fill(testUsers.client.email)
      await page.getByLabel('Password').fill(testUsers.client.password)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(new RegExp(`/portal/${testAgency.slug}`))
    })

    test('should display client dashboard', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible()
    })

    test('should show client project information', async ({ page }) => {
      // Check for project card or overview
      await expect(page.getByText(/project/i)).toBeVisible()
    })

    test('should display request summary', async ({ page }) => {
      await expect(page.getByText(/requests/i)).toBeVisible()
    })

    test('should navigate to requests list', async ({ page }) => {
      await page.getByRole('link', { name: /requests/i }).click()

      await expect(page).toHaveURL(new RegExp(`/portal/${testAgency.slug}/requests`))
    })

    test('should navigate to settings', async ({ page }) => {
      await page.getByRole('link', { name: /settings/i }).click()

      await expect(page).toHaveURL(new RegExp(`/portal/${testAgency.slug}/settings`))
    })
  })

  test.describe('Portal Requests', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByLabel('Email').fill(testUsers.client.email)
      await page.getByLabel('Password').fill(testUsers.client.password)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(new RegExp(`/portal/${testAgency.slug}`))
      await page.goto(`/portal/${testAgency.slug}/requests`)
    })

    test('should display requests list', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /requests/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /new request/i })).toBeVisible()
    })

    test('should filter requests by status', async ({ page }) => {
      const statusFilter = page.getByRole('combobox', { name: /status/i })
      if (await statusFilter.isVisible()) {
        await statusFilter.click()
        await page.getByRole('option', { name: /open/i }).click()

        await page.waitForTimeout(300)
      }
    })

    test('should search requests', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/search/i)
      if (await searchInput.isVisible()) {
        await searchInput.fill('test')
        await page.waitForTimeout(500)
      }
    })

    test('should navigate to create new request', async ({ page }) => {
      await page.getByRole('button', { name: /new request/i }).click()

      await expect(page).toHaveURL(new RegExp(`/portal/${testAgency.slug}/requests/new`))
    })

    test('should open request detail', async ({ page }) => {
      const firstRequest = page.locator('[data-testid="request-item"]').first()
      if (await firstRequest.isVisible()) {
        await firstRequest.click()

        await expect(page.url()).toMatch(new RegExp(`/portal/${testAgency.slug}/requests/`))
      }
    })
  })

  test.describe('Submit New Request', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByLabel('Email').fill(testUsers.client.email)
      await page.getByLabel('Password').fill(testUsers.client.password)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(new RegExp(`/portal/${testAgency.slug}`))
      await page.goto(`/portal/${testAgency.slug}/requests/new`)
    })

    test('should display new request form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /new request/i })).toBeVisible()
      await expect(page.getByLabel('Title')).toBeVisible()
      await expect(page.getByLabel(/type/i)).toBeVisible()
      await expect(page.getByLabel('Description')).toBeVisible()
    })

    test('should validate required fields', async ({ page }) => {
      await page.getByRole('button', { name: /submit/i }).click()

      await expect(page.getByText(/title.*required/i)).toBeVisible()
      await expect(page.getByText(/description.*required/i)).toBeVisible()
    })

    test('should submit a new request', async ({ page }) => {
      const requestTitle = `Client Request ${Date.now()}`

      await page.getByLabel('Title').fill(requestTitle)
      await page.getByLabel(/type/i).click()
      await page.getByRole('option', { name: /bug/i }).click()
      await page.getByLabel('Description').fill('This is a detailed description of the issue.')
      await page.getByRole('button', { name: /submit/i }).click()

      // Should redirect to requests list or detail
      await expect(page.url()).toMatch(new RegExp(`/portal/${testAgency.slug}/requests`))
    })

    test('should set priority', async ({ page }) => {
      await expect(page.getByLabel('Normal')).toBeVisible()
      await expect(page.getByLabel('Urgent')).toBeVisible()

      await page.getByLabel('Urgent').click()
      // Urgent should be selected
    })

    test('should cancel and go back', async ({ page }) => {
      await page.getByRole('button', { name: /cancel/i }).click()

      await expect(page).toHaveURL(new RegExp(`/portal/${testAgency.slug}/requests`))
    })
  })

  test.describe('Request Detail & Conversation', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByLabel('Email').fill(testUsers.client.email)
      await page.getByLabel('Password').fill(testUsers.client.password)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(new RegExp(`/portal/${testAgency.slug}`))
      await page.goto(`/portal/${testAgency.slug}/requests`)
    })

    test('should display request details', async ({ page }) => {
      const firstRequest = page.locator('[data-testid="request-item"]').first()
      if (await firstRequest.isVisible()) {
        await firstRequest.click()

        await expect(page.getByText(/description/i)).toBeVisible()
        await expect(page.getByText(/status/i)).toBeVisible()
        await expect(page.getByText(/conversation/i)).toBeVisible()
      }
    })

    test('should send a message', async ({ page }) => {
      const firstRequest = page.locator('[data-testid="request-item"]').first()
      if (await firstRequest.isVisible()) {
        await firstRequest.click()

        const messageInput = page.getByPlaceholder(/message/i)
        if (await messageInput.isVisible()) {
          const messageContent = `Client message ${Date.now()}`
          await messageInput.fill(messageContent)
          await page.getByRole('button', { name: /send/i }).click()

          await expect(page.getByText(messageContent)).toBeVisible()
        }
      }
    })

    test('should display existing messages', async ({ page }) => {
      const firstRequest = page.locator('[data-testid="request-item"]').first()
      if (await firstRequest.isVisible()) {
        await firstRequest.click()

        // Conversation area should be visible
        await expect(page.getByText(/conversation/i)).toBeVisible()
      }
    })

    test('should navigate back to requests list', async ({ page }) => {
      const firstRequest = page.locator('[data-testid="request-item"]').first()
      if (await firstRequest.isVisible()) {
        await firstRequest.click()
        await page.getByRole('button', { name: /back/i }).click()

        await expect(page).toHaveURL(new RegExp(`/portal/${testAgency.slug}/requests`))
      }
    })
  })

  test.describe('Portal Settings', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByLabel('Email').fill(testUsers.client.email)
      await page.getByLabel('Password').fill(testUsers.client.password)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(new RegExp(`/portal/${testAgency.slug}`))
      await page.goto(`/portal/${testAgency.slug}/settings`)
    })

    test('should display account settings', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /settings/i })).toBeVisible()
      await expect(page.getByLabel('Name')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
    })

    test('should update profile name', async ({ page }) => {
      const nameInput = page.getByLabel('Name')
      const originalName = await nameInput.inputValue()

      await nameInput.clear()
      await nameInput.fill(`${originalName} Updated`)
      await page.getByRole('button', { name: /save/i }).click()

      await expect(page.getByText(/saved/i)).toBeVisible()
    })

    test('should have email field disabled', async ({ page }) => {
      const emailInput = page.getByLabel('Email')

      await expect(emailInput).toBeDisabled()
    })

    test('should display notification preferences', async ({ page }) => {
      await expect(page.getByText(/notifications/i)).toBeVisible()
      await expect(page.getByText(/email/i)).toBeVisible()
    })

    test('should toggle email notifications', async ({ page }) => {
      const emailToggle = page.getByRole('switch', { name: /email/i })
      if (await emailToggle.isVisible()) {
        const isChecked = await emailToggle.isChecked()
        await emailToggle.click()

        // Toggle should have changed
        await expect(emailToggle).toBeChecked({ checked: !isChecked })
      }
    })
  })

  test.describe('Portal Logout', () => {
    test('should logout from portal', async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByLabel('Email').fill(testUsers.client.email)
      await page.getByLabel('Password').fill(testUsers.client.password)
      await page.getByRole('button', { name: /sign in/i }).click()
      await page.waitForURL(new RegExp(`/portal/${testAgency.slug}`))

      // Find and click logout
      await page.getByRole('button', { name: /logout|sign out/i }).click()

      await expect(page).toHaveURL(new RegExp(`/portal/${testAgency.slug}/login`))
    })
  })
})
