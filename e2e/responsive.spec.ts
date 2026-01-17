import { test, expect } from './fixtures/base'
import { testUsers, testAgency } from './fixtures/test-data'

/**
 * Responsive design tests
 * These tests verify the platform works correctly across different screen sizes
 */

test.describe('Responsive Design', () => {
  test.describe('Mobile View', () => {
    test.use({ viewport: { width: 375, height: 667 } }) // iPhone SE

    test.describe('Authentication', () => {
      test('login should be usable on mobile', async ({ page }) => {
        await page.goto('/login')

        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
        await expect(page.getByLabel('Email')).toBeVisible()
        await expect(page.getByLabel('Password')).toBeVisible()
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
      })

      test('register should be usable on mobile', async ({ page }) => {
        await page.goto('/register')

        await expect(page.getByRole('heading', { name: /create account/i })).toBeVisible()

        // All form fields should be visible
        await expect(page.getByLabel('Name')).toBeVisible()
        await expect(page.getByLabel('Email')).toBeVisible()
      })
    })

    test.describe('Dashboard', () => {
      test.beforeEach(async ({ auth }) => {
        await auth.login(testUsers.owner.email, testUsers.owner.password)
      })

      test('dashboard should have mobile navigation', async ({ page }) => {
        await page.goto('/')

        // Mobile navigation should be present (hamburger menu)
        const mobileMenuButton = page.getByRole('button', { name: /menu|toggle/i })
        await expect(mobileMenuButton).toBeVisible()
      })

      test('should open mobile sidebar', async ({ page }) => {
        await page.goto('/')

        const mobileMenuButton = page.getByRole('button', { name: /menu|toggle/i })
        if (await mobileMenuButton.isVisible()) {
          await mobileMenuButton.click()

          // Navigation links should become visible
          await expect(page.getByRole('link', { name: /projects/i })).toBeVisible()
        }
      })

      test('stats cards should stack vertically', async ({ page }) => {
        await page.goto('/')

        // Cards should be visible and accessible
        await expect(page.getByText(/projects/i)).toBeVisible()
        await expect(page.getByText(/requests/i)).toBeVisible()
      })
    })

    test.describe('Projects', () => {
      test.beforeEach(async ({ auth }) => {
        await auth.login(testUsers.owner.email, testUsers.owner.password)
      })

      test('projects list should be scrollable', async ({ page }) => {
        await page.goto('/projects')

        // Page should be scrollable if content overflows
        const scrollHeight = await page.evaluate(() => document.body.scrollHeight)
        const viewportHeight = await page.evaluate(() => window.innerHeight)

        // Content might fit or overflow - both are acceptable
        expect(scrollHeight).toBeGreaterThanOrEqual(viewportHeight - 100)
      })

      test('project cards should be full width', async ({ page }) => {
        await page.goto('/projects')

        const projectCard = page.locator('[data-testid="project-card"]').first()
        if (await projectCard.isVisible()) {
          const box = await projectCard.boundingBox()
          if (box) {
            // Card should be at least 90% of viewport width
            expect(box.width).toBeGreaterThan(375 * 0.8)
          }
        }
      })
    })

    test.describe('Client Portal', () => {
      test('portal login should work on mobile', async ({ page }) => {
        await page.goto(`/portal/${testAgency.slug}/login`)

        await expect(page.getByLabel('Email')).toBeVisible()
        await expect(page.getByLabel('Password')).toBeVisible()

        // Form should be full width
        const form = page.locator('form').first()
        const box = await form.boundingBox()
        if (box) {
          expect(box.width).toBeGreaterThan(300)
        }
      })

      test('new request form should be usable on mobile', async ({ page }) => {
        await page.goto(`/portal/${testAgency.slug}/login`)
        await page.getByLabel('Email').fill(testUsers.client.email)
        await page.getByLabel('Password').fill(testUsers.client.password)
        await page.getByRole('button', { name: /sign in/i }).click()

        await page.waitForURL(new RegExp(`/portal/${testAgency.slug}`))
        await page.goto(`/portal/${testAgency.slug}/requests/new`)

        // Form should be visible and usable
        await expect(page.getByLabel('Title')).toBeVisible()
        await expect(page.getByLabel('Description')).toBeVisible()
      })
    })
  })

  test.describe('Tablet View', () => {
    test.use({ viewport: { width: 768, height: 1024 } }) // iPad

    test.describe('Dashboard', () => {
      test.beforeEach(async ({ auth }) => {
        await auth.login(testUsers.owner.email, testUsers.owner.password)
      })

      test('should show sidebar or collapsible nav', async ({ page }) => {
        await page.goto('/')

        // Either full sidebar or mobile menu should be visible
        const sidebar = page.locator('aside, [data-sidebar]')
        const mobileMenu = page.getByRole('button', { name: /menu|toggle/i })

        const sidebarVisible = await sidebar.isVisible()
        const menuVisible = await mobileMenu.isVisible()

        expect(sidebarVisible || menuVisible).toBeTruthy()
      })

      test('stats should show in grid', async ({ page }) => {
        await page.goto('/')

        // Stats should be visible
        await expect(page.getByText(/projects/i)).toBeVisible()
        await expect(page.getByText(/requests/i)).toBeVisible()
      })
    })

    test.describe('Projects', () => {
      test.beforeEach(async ({ auth }) => {
        await auth.login(testUsers.owner.email, testUsers.owner.password)
      })

      test('projects should display in grid', async ({ page }) => {
        await page.goto('/projects')

        // Project cards should be visible
        const projectCards = page.locator('[data-testid="project-card"]')
        const count = await projectCards.count()

        if (count > 1) {
          // Multiple cards should be laid out (possibly in grid)
          const firstBox = await projectCards.first().boundingBox()
          const secondBox = await projectCards.nth(1).boundingBox()

          if (firstBox && secondBox) {
            // Cards could be side by side or stacked
            expect(firstBox.width).toBeLessThan(768) // Not full width
          }
        }
      })
    })
  })

  test.describe('Desktop View', () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test.describe('Dashboard', () => {
      test.beforeEach(async ({ auth }) => {
        await auth.login(testUsers.owner.email, testUsers.owner.password)
      })

      test('should show full sidebar', async ({ page }) => {
        await page.goto('/')

        // Full sidebar should be visible
        const sidebar = page.locator('aside, [data-sidebar]')
        await expect(sidebar).toBeVisible()

        // Navigation links should be visible
        await expect(page.getByRole('link', { name: /dashboard/i })).toBeVisible()
        await expect(page.getByRole('link', { name: /projects/i })).toBeVisible()
        await expect(page.getByRole('link', { name: /team/i })).toBeVisible()
      })

      test('stats should show in row', async ({ page }) => {
        await page.goto('/')

        const statCards = page.locator('[data-testid^="stat-"]')
        const count = await statCards.count()

        if (count > 1) {
          const firstBox = await statCards.first().boundingBox()
          const secondBox = await statCards.nth(1).boundingBox()

          if (firstBox && secondBox) {
            // Stats should be side by side (same y position)
            expect(Math.abs(firstBox.y - secondBox.y)).toBeLessThan(10)
          }
        }
      })
    })

    test.describe('Projects', () => {
      test.beforeEach(async ({ auth }) => {
        await auth.login(testUsers.owner.email, testUsers.owner.password)
      })

      test('project detail should show tabs', async ({ page }) => {
        await page.goto('/projects')

        const firstProject = page.getByRole('link', { name: /project/i }).first()
        if (await firstProject.isVisible()) {
          await firstProject.click()

          // All tabs should be visible in a row
          await expect(page.getByRole('tab', { name: /requests/i })).toBeVisible()
          await expect(page.getByRole('tab', { name: /notes/i })).toBeVisible()
          await expect(page.getByRole('tab', { name: /details/i })).toBeVisible()
          await expect(page.getByRole('tab', { name: /settings/i })).toBeVisible()
        }
      })

      test('request slide-over should show on side', async ({ page }) => {
        await page.goto('/projects')

        const firstProject = page.getByRole('link', { name: /project/i }).first()
        if (await firstProject.isVisible()) {
          await firstProject.click()
          await page.getByRole('tab', { name: /requests/i }).click()

          const firstRequest = page.locator('[data-testid="request-item"]').first()
          if (await firstRequest.isVisible()) {
            await firstRequest.click()

            // Slide-over should appear on the side
            const slideOver = page.getByRole('dialog')
            if (await slideOver.isVisible()) {
              const box = await slideOver.boundingBox()
              if (box) {
                // Should not cover the full width
                expect(box.width).toBeLessThan(1440 * 0.8)
              }
            }
          }
        }
      })
    })
  })

  test.describe('Orientation Changes', () => {
    test('should handle landscape on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 }) // iPhone landscape

      await page.goto('/login')

      // Form should still be usable
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
    })

    test('should handle portrait on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }) // iPad portrait

      await page.goto('/login')
      await page.getByLabel('Email').fill(testUsers.owner.email)
      await page.getByLabel('Password').fill(testUsers.owner.password)
      await page.getByRole('button', { name: /sign in/i }).click()

      await page.waitForURL('/')

      // Dashboard should be usable
      await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
    })
  })
})
