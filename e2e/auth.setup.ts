import { test as setup, expect } from '@playwright/test'
import { testUsers } from './fixtures/test-data'

const authFile = 'e2e/.auth/user.json'

/**
 * Authentication setup
 * This runs before all tests to create an authenticated session state
 * that can be reused across tests for faster execution
 */
setup('authenticate', async ({ page }) => {
  // Go to login page
  await page.goto('/login')

  // Fill in credentials
  await page.getByLabel('Email').fill(testUsers.owner.email)
  await page.getByLabel('Password').fill(testUsers.owner.password)

  // Click sign in
  await page.getByRole('button', { name: 'Sign In' }).click()

  // Wait for navigation to complete
  await page.waitForURL('/')

  // Verify we're logged in
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()

  // Save authentication state
  await page.context().storageState({ path: authFile })
})
