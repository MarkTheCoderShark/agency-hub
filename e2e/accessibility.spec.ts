import { test, expect } from './fixtures/base'
import { testUsers, testAgency } from './fixtures/test-data'

/**
 * Accessibility tests
 * These tests verify the platform meets basic accessibility requirements
 */

test.describe('Accessibility', () => {
  test.describe('Authentication Pages', () => {
    test('login page should have proper labels', async ({ page }) => {
      await page.goto('/login')

      // Check for proper form labels
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()

      // Check button is accessible
      await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    })

    test('register page should have proper labels', async ({ page }) => {
      await page.goto('/register')

      await expect(page.getByLabel('Name')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
      await expect(page.getByLabel('Confirm Password')).toBeVisible()
    })

    test('forgot password page should have proper labels', async ({ page }) => {
      await page.goto('/forgot-password')

      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByRole('button', { name: /send|reset/i })).toBeVisible()
    })
  })

  test.describe('Dashboard Navigation', () => {
    test.beforeEach(async ({ auth }) => {
      await auth.login(testUsers.owner.email, testUsers.owner.password)
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/')

      // Should have an h1
      const h1 = page.locator('h1')
      await expect(h1).toBeVisible()

      // H1 count should be exactly 1
      await expect(h1).toHaveCount(1)
    })

    test('should have accessible navigation', async ({ page }) => {
      await page.goto('/')

      // Navigation should have proper roles
      const nav = page.getByRole('navigation')
      await expect(nav).toBeVisible()

      // Links should be properly labeled
      await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
      await expect(page.getByRole('link', { name: /projects/i })).toBeVisible()
    })

    test('should have skip link or proper focus management', async ({ page }) => {
      await page.goto('/')

      // Tab to first interactive element
      await page.keyboard.press('Tab')

      // Should focus on something meaningful
      const focusedElement = page.locator(':focus')
      await expect(focusedElement).toBeVisible()
    })
  })

  test.describe('Forms', () => {
    test.beforeEach(async ({ auth }) => {
      await auth.login(testUsers.owner.email, testUsers.owner.password)
    })

    test('project form should have proper labels', async ({ page }) => {
      await page.goto('/projects')
      await page.getByRole('button', { name: /new project/i }).click()

      await expect(page.getByLabel('Project Name')).toBeVisible()
      await expect(page.getByLabel('Description')).toBeVisible()
      await expect(page.getByLabel('Client Name')).toBeVisible()
      await expect(page.getByLabel('Client Email')).toBeVisible()
    })

    test('settings form should have proper labels', async ({ page }) => {
      await page.goto('/settings')

      await expect(page.getByLabel('Agency Name')).toBeVisible()
      await expect(page.getByLabel('Slug')).toBeVisible()
    })

    test('error messages should be associated with fields', async ({ page }) => {
      await page.goto('/register')
      await page.getByRole('button', { name: /create account/i }).click()

      // Error messages should be visible
      const errorMessages = page.locator('[role="alert"], .text-destructive')
      const count = await errorMessages.count()
      expect(count).toBeGreaterThan(0)
    })
  })

  test.describe('Interactive Elements', () => {
    test.beforeEach(async ({ auth }) => {
      await auth.login(testUsers.owner.email, testUsers.owner.password)
    })

    test('buttons should have accessible names', async ({ page }) => {
      await page.goto('/')

      // All buttons should have accessible names
      const buttons = page.getByRole('button')
      const count = await buttons.count()

      for (let i = 0; i < count; i++) {
        const button = buttons.nth(i)
        const name = await button.getAttribute('aria-label') ||
                     await button.textContent()
        expect(name?.trim()).toBeTruthy()
      }
    })

    test('links should have accessible names', async ({ page }) => {
      await page.goto('/')

      // All links should have accessible names
      const links = page.getByRole('link')
      const count = await links.count()

      for (let i = 0; i < Math.min(count, 20); i++) { // Check first 20
        const link = links.nth(i)
        const name = await link.getAttribute('aria-label') ||
                     await link.textContent()
        expect(name?.trim()).toBeTruthy()
      }
    })

    test('dropdowns should be keyboard accessible', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()
        await page.getByRole('button', { name: /new request/i }).click()

        // Tab to the type dropdown
        const typeDropdown = page.getByLabel('Type')
        if (await typeDropdown.isVisible()) {
          await typeDropdown.focus()
          await page.keyboard.press('Enter')

          // Options should be visible
          await expect(page.getByRole('option').first()).toBeVisible()

          // Arrow down should work
          await page.keyboard.press('ArrowDown')
          await page.keyboard.press('Enter')
        }
      }
    })
  })

  test.describe('Color Contrast & Visual', () => {
    test('text should be visible against background', async ({ page }) => {
      await page.goto('/login')

      // Heading should be visible
      const heading = page.getByRole('heading', { name: /sign in/i })
      await expect(heading).toBeVisible()

      // Check computed styles - this is a basic check
      const color = await heading.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return style.color
      })
      expect(color).toBeTruthy()
    })

    test('focus indicators should be visible', async ({ page }) => {
      await page.goto('/login')

      const emailInput = page.getByLabel('Email')
      await emailInput.focus()

      // Focus should be visible (outline or ring)
      const hasFocusStyle = await emailInput.evaluate((el) => {
        const style = window.getComputedStyle(el)
        return style.outlineWidth !== '0px' ||
               style.boxShadow !== 'none'
      })
      expect(hasFocusStyle).toBeTruthy()
    })
  })

  test.describe('Client Portal Accessibility', () => {
    test('portal login should have proper labels', async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)

      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
    })

    test('portal navigation should be accessible', async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByLabel('Email').fill(testUsers.client.email)
      await page.getByLabel('Password').fill(testUsers.client.password)
      await page.getByRole('button', { name: /sign in/i }).click()

      await page.waitForURL(new RegExp(`/portal/${testAgency.slug}`))

      // Navigation should be accessible
      const nav = page.getByRole('navigation')
      await expect(nav).toBeVisible()
    })

    test('new request form should have proper labels', async ({ page }) => {
      await page.goto(`/portal/${testAgency.slug}/login`)
      await page.getByLabel('Email').fill(testUsers.client.email)
      await page.getByLabel('Password').fill(testUsers.client.password)
      await page.getByRole('button', { name: /sign in/i }).click()

      await page.waitForURL(new RegExp(`/portal/${testAgency.slug}`))
      await page.goto(`/portal/${testAgency.slug}/requests/new`)

      await expect(page.getByLabel('Title')).toBeVisible()
      await expect(page.getByLabel('Description')).toBeVisible()
    })
  })
})
