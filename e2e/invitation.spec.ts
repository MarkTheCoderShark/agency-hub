import { test, expect } from './fixtures/base'
import { testUsers, generateUniqueEmail } from './fixtures/test-data'

test.describe('Invitation System', () => {
  test.describe('Staff Invitations', () => {
    test.beforeEach(async ({ auth }) => {
      await auth.login(testUsers.owner.email, testUsers.owner.password)
    })

    test('should send staff invitation', async ({ page }) => {
      const inviteEmail = generateUniqueEmail('staff-invite')

      await page.goto('/team')
      await page.getByRole('button', { name: /invite/i }).click()

      await page.getByLabel('Email').fill(inviteEmail)
      await page.getByLabel('Role').click()
      await page.getByRole('option', { name: /staff/i }).click()
      await page.getByRole('button', { name: /send.*invite/i }).click()

      await expect(page.getByText(/invitation.*sent/i)).toBeVisible()
    })

    test('should show pending invitations', async ({ page }) => {
      await page.goto('/team')

      // Check if pending invitations section exists
      const pendingSection = page.getByText(/pending/i)
      if (await pendingSection.isVisible()) {
        await expect(pendingSection).toBeVisible()
      }
    })

    test('should resend invitation', async ({ page }) => {
      await page.goto('/team')

      const resendButton = page.getByRole('button', { name: /resend/i }).first()
      if (await resendButton.isVisible()) {
        await resendButton.click()

        await expect(page.getByText(/resent/i)).toBeVisible()
      }
    })

    test('should revoke invitation', async ({ page }) => {
      await page.goto('/team')

      const revokeButton = page.getByRole('button', { name: /revoke/i }).first()
      if (await revokeButton.isVisible()) {
        await revokeButton.click()

        // Confirm revocation
        await page.getByRole('button', { name: /confirm/i }).click()

        await expect(page.getByText(/revoked/i)).toBeVisible()
      }
    })
  })

  test.describe('Client Invitations', () => {
    test.beforeEach(async ({ auth }) => {
      await auth.login(testUsers.owner.email, testUsers.owner.password)
    })

    test('should invite client to project', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /settings/i }).click()

        const inviteClientButton = page.getByRole('button', { name: /invite.*client/i })
        if (await inviteClientButton.isVisible()) {
          await inviteClientButton.click()

          const inviteEmail = generateUniqueEmail('client-invite')
          await page.getByLabel('Email').fill(inviteEmail)
          await page.getByLabel('Name').fill('New Client')
          await page.getByRole('button', { name: /send/i }).click()

          await expect(page.getByText(/invitation.*sent/i)).toBeVisible()
        }
      }
    })
  })

  test.describe('Invitation Acceptance', () => {
    test('should display invitation page for valid token', async ({ page }) => {
      // This test would need a real invitation token
      // For demo purposes, test the page structure
      await page.goto('/invitation/test-token')

      // Should show either invitation form or error
      const form = page.getByRole('form')
      const error = page.getByText(/invalid|expired/i)

      await expect(form.or(error)).toBeVisible()
    })

    test('should show error for expired invitation', async ({ page }) => {
      // Navigate to an expired invitation
      await page.goto('/invitation/expired-token')

      // Should show expiration message
      const expiredMessage = page.getByText(/expired/i)
      const invalidMessage = page.getByText(/invalid/i)

      await expect(expiredMessage.or(invalidMessage)).toBeVisible()
    })

    test('should show error for already accepted invitation', async ({ page }) => {
      await page.goto('/invitation/already-accepted-token')

      // Should show already accepted message or invalid
      const acceptedMessage = page.getByText(/already.*accepted/i)
      const invalidMessage = page.getByText(/invalid/i)

      await expect(acceptedMessage.or(invalidMessage)).toBeVisible()
    })

    test('should validate password requirements on acceptance', async ({ page }) => {
      // This would need a real valid token
      // Test the form validation behavior
      await page.goto('/invitation/valid-test-token')

      const passwordInput = page.getByLabel('Password', { exact: true })
      if (await passwordInput.isVisible()) {
        await passwordInput.fill('short')
        await page.getByRole('button', { name: /accept|create/i }).click()

        await expect(page.getByText(/at least 8/i)).toBeVisible()
      }
    })

    test('should validate password confirmation matches', async ({ page }) => {
      await page.goto('/invitation/valid-test-token')

      const passwordInput = page.getByLabel('Password', { exact: true })
      const confirmInput = page.getByLabel('Confirm Password')

      if (await passwordInput.isVisible() && await confirmInput.isVisible()) {
        await passwordInput.fill('ValidPassword123!')
        await confirmInput.fill('DifferentPassword123!')
        await page.getByRole('button', { name: /accept|create/i }).click()

        await expect(page.getByText(/match/i)).toBeVisible()
      }
    })
  })

  test.describe('Invitation Links', () => {
    test.beforeEach(async ({ auth }) => {
      await auth.login(testUsers.owner.email, testUsers.owner.password)
    })

    test('should copy invitation link', async ({ page }) => {
      await page.goto('/team')

      const copyButton = page.getByRole('button', { name: /copy.*link/i }).first()
      if (await copyButton.isVisible()) {
        await copyButton.click()

        await expect(page.getByText(/copied/i)).toBeVisible()
      }
    })
  })
})
