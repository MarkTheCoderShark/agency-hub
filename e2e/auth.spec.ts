import { test, expect } from './fixtures/base'
import { testUsers, generateUniqueEmail } from './fixtures/test-data'

test.describe('Authentication', () => {
  test.describe('Login', () => {
    test('should display login form', async ({ page }) => {
      await page.goto('/login')

      await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    })

    test('should show validation errors for empty fields', async ({ page }) => {
      await page.goto('/login')
      await page.getByRole('button', { name: 'Sign In' }).click()

      await expect(page.getByText(/email.*required/i)).toBeVisible()
      await expect(page.getByText(/password.*required/i)).toBeVisible()
    })

    test('should show error for invalid credentials', async ({ page }) => {
      await page.goto('/login')
      await page.getByLabel('Email').fill('invalid@test.com')
      await page.getByLabel('Password').fill('wrongpassword')
      await page.getByRole('button', { name: 'Sign In' }).click()

      await expect(page.getByText(/invalid.*credentials/i)).toBeVisible()
    })

    test('should successfully login with valid credentials', async ({ page, auth }) => {
      await auth.login(testUsers.owner.email, testUsers.owner.password)

      await expect(page).toHaveURL('/')
      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    })

    test('should redirect to dashboard if already logged in', async ({ page, auth }) => {
      await auth.login(testUsers.owner.email, testUsers.owner.password)
      await page.goto('/login')

      await expect(page).toHaveURL('/')
    })
  })

  test.describe('Registration', () => {
    test('should display registration form', async ({ page }) => {
      await page.goto('/register')

      await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
      await expect(page.getByLabel('Name')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
      await expect(page.getByLabel('Confirm Password')).toBeVisible()
    })

    test('should show validation errors for invalid data', async ({ page }) => {
      await page.goto('/register')
      await page.getByLabel('Name').fill('A')
      await page.getByLabel('Email').fill('invalid-email')
      await page.getByLabel('Password', { exact: true }).fill('short')
      await page.getByLabel('Confirm Password').fill('different')
      await page.getByRole('button', { name: 'Create Account' }).click()

      await expect(page.getByText(/name.*at least 2/i)).toBeVisible()
      await expect(page.getByText(/invalid.*email/i)).toBeVisible()
      await expect(page.getByText(/password.*at least 8/i)).toBeVisible()
      await expect(page.getByText(/passwords.*match/i)).toBeVisible()
    })

    test('should successfully register a new user', async ({ page }) => {
      const uniqueEmail = generateUniqueEmail('register')

      await page.goto('/register')
      await page.getByLabel('Name').fill('Test New User')
      await page.getByLabel('Email').fill(uniqueEmail)
      await page.getByLabel('Password', { exact: true }).fill('TestPassword123!')
      await page.getByLabel('Confirm Password').fill('TestPassword123!')
      await page.getByRole('button', { name: 'Create Account' }).click()

      // Should redirect to verify email or onboarding
      await expect(page.url()).toMatch(/verify-email|onboarding|\//)
    })

    test('should show error for existing email', async ({ page }) => {
      await page.goto('/register')
      await page.getByLabel('Name').fill('Test User')
      await page.getByLabel('Email').fill(testUsers.owner.email)
      await page.getByLabel('Password', { exact: true }).fill('TestPassword123!')
      await page.getByLabel('Confirm Password').fill('TestPassword123!')
      await page.getByRole('button', { name: 'Create Account' }).click()

      await expect(page.getByText(/already.*registered/i)).toBeVisible()
    })
  })

  test.describe('Password Reset', () => {
    test('should display forgot password form', async ({ page }) => {
      await page.goto('/forgot-password')

      await expect(page.getByRole('heading', { name: /forgot.*password/i })).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByRole('button', { name: /send.*reset/i })).toBeVisible()
    })

    test('should send reset email for valid user', async ({ page }) => {
      await page.goto('/forgot-password')
      await page.getByLabel('Email').fill(testUsers.owner.email)
      await page.getByRole('button', { name: /send.*reset/i }).click()

      await expect(page.getByText(/email.*sent/i)).toBeVisible()
    })

    test('should show error for invalid email format', async ({ page }) => {
      await page.goto('/forgot-password')
      await page.getByLabel('Email').fill('not-an-email')
      await page.getByRole('button', { name: /send.*reset/i }).click()

      await expect(page.getByText(/invalid.*email/i)).toBeVisible()
    })
  })

  test.describe('Logout', () => {
    test('should successfully logout', async ({ page, auth }) => {
      await auth.login(testUsers.owner.email, testUsers.owner.password)
      await auth.logout()

      await expect(page).toHaveURL('/login')
    })

    test('should clear session on logout', async ({ page, auth }) => {
      await auth.login(testUsers.owner.email, testUsers.owner.password)
      await auth.logout()

      // Try to access protected route
      await page.goto('/')
      await expect(page).toHaveURL('/login')
    })
  })
})
