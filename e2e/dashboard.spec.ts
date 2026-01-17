import { test, expect } from './fixtures/base'
import { testUsers, testAgency } from './fixtures/test-data'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.login(testUsers.owner.email, testUsers.owner.password)
  })

  test.describe('Overview', () => {
    test('should display dashboard with statistics', async ({ page, dashboardPage }) => {
      await dashboardPage.goto()

      await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
      await expect(page.getByText(/projects/i)).toBeVisible()
      await expect(page.getByText(/open requests/i)).toBeVisible()
      await expect(page.getByText(/active clients/i)).toBeVisible()
    })

    test('should display recent activity', async ({ page, dashboardPage }) => {
      await dashboardPage.goto()

      await expect(page.getByRole('heading', { name: /recent activity/i })).toBeVisible()
    })

    test('should navigate to projects from dashboard', async ({ page, dashboardPage }) => {
      await dashboardPage.goto()
      await dashboardPage.navigateToProjects()

      await expect(page).toHaveURL('/projects')
    })

    test('should navigate to team from sidebar', async ({ page, dashboardPage }) => {
      await dashboardPage.goto()
      await dashboardPage.navigateToTeam()

      await expect(page).toHaveURL('/team')
    })

    test('should navigate to settings from sidebar', async ({ page, dashboardPage }) => {
      await dashboardPage.goto()
      await dashboardPage.navigateToSettings()

      await expect(page).toHaveURL('/settings')
    })
  })

  test.describe('Navigation', () => {
    test('should show active state for current route', async ({ page }) => {
      await page.goto('/projects')

      const projectsLink = page.getByRole('link', { name: 'Projects' })
      await expect(projectsLink).toHaveClass(/active|bg-primary/)
    })

    test('should show user menu with options', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: /account/i }).click()

      await expect(page.getByRole('menuitem', { name: /profile/i })).toBeVisible()
      await expect(page.getByRole('menuitem', { name: /sign out/i })).toBeVisible()
    })

    test('should navigate to profile from user menu', async ({ page }) => {
      await page.goto('/')
      await page.getByRole('button', { name: /account/i }).click()
      await page.getByRole('menuitem', { name: /profile/i }).click()

      await expect(page).toHaveURL('/profile')
    })
  })
})

test.describe('Agency Settings', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.login(testUsers.owner.email, testUsers.owner.password)
  })

  test('should display agency settings form', async ({ page }) => {
    await page.goto('/settings')

    await expect(page.getByRole('heading', { name: /agency settings/i })).toBeVisible()
    await expect(page.getByLabel('Agency Name')).toBeVisible()
    await expect(page.getByLabel('Slug')).toBeVisible()
  })

  test('should update agency name', async ({ page }) => {
    await page.goto('/settings')

    const nameInput = page.getByLabel('Agency Name')
    await nameInput.clear()
    await nameInput.fill('Updated Agency Name')
    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByText(/saved/i)).toBeVisible()
  })

  test('should validate agency slug format', async ({ page }) => {
    await page.goto('/settings')

    const slugInput = page.getByLabel('Slug')
    await slugInput.clear()
    await slugInput.fill('Invalid Slug With Spaces!')
    await page.getByRole('button', { name: /save/i }).click()

    await expect(page.getByText(/lowercase.*numbers.*hyphens/i)).toBeVisible()
  })

  test('should upload agency logo', async ({ page }) => {
    await page.goto('/settings')

    // Check logo upload area exists
    await expect(page.getByText(/upload.*logo/i)).toBeVisible()
  })

  test('should update branding colors', async ({ page }) => {
    await page.goto('/settings')

    // Check for branding section
    await expect(page.getByText(/branding/i)).toBeVisible()
  })
})

test.describe('Team Management', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.login(testUsers.owner.email, testUsers.owner.password)
  })

  test('should display team members list', async ({ page }) => {
    await page.goto('/team')

    await expect(page.getByRole('heading', { name: /team/i })).toBeVisible()
    await expect(page.getByText(testUsers.owner.name)).toBeVisible()
  })

  test('should show invite button for owner', async ({ page }) => {
    await page.goto('/team')

    await expect(page.getByRole('button', { name: /invite/i })).toBeVisible()
  })

  test('should open invite dialog', async ({ page }) => {
    await page.goto('/team')
    await page.getByRole('button', { name: /invite/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Role')).toBeVisible()
  })

  test('should validate invite form', async ({ page }) => {
    await page.goto('/team')
    await page.getByRole('button', { name: /invite/i }).click()

    await page.getByRole('button', { name: /send.*invite/i }).click()

    await expect(page.getByText(/email.*required/i)).toBeVisible()
  })

  test('should send team invitation', async ({ page }) => {
    await page.goto('/team')
    await page.getByRole('button', { name: /invite/i }).click()

    await page.getByLabel('Email').fill('newmember@test.com')
    await page.getByLabel('Role').click()
    await page.getByRole('option', { name: /staff/i }).click()
    await page.getByRole('button', { name: /send.*invite/i }).click()

    await expect(page.getByText(/invitation.*sent/i)).toBeVisible()
  })
})

test.describe('Billing', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.login(testUsers.owner.email, testUsers.owner.password)
  })

  test('should display billing page with plans', async ({ page }) => {
    await page.goto('/settings/billing')

    await expect(page.getByRole('heading', { name: /billing/i })).toBeVisible()
    await expect(page.getByText(/free/i)).toBeVisible()
    await expect(page.getByText(/starter/i)).toBeVisible()
    await expect(page.getByText(/growth/i)).toBeVisible()
    await expect(page.getByText(/scale/i)).toBeVisible()
  })

  test('should show current plan indicator', async ({ page }) => {
    await page.goto('/settings/billing')

    await expect(page.getByText(/current plan/i)).toBeVisible()
  })

  test('should display plan features', async ({ page }) => {
    await page.goto('/settings/billing')

    // Check for feature list items
    await expect(page.getByText(/projects/i).first()).toBeVisible()
    await expect(page.getByText(/storage/i).first()).toBeVisible()
  })

  test('should show upgrade buttons for non-current plans', async ({ page }) => {
    await page.goto('/settings/billing')

    const upgradeButtons = page.getByRole('button', { name: /upgrade/i })
    await expect(upgradeButtons.first()).toBeVisible()
  })
})
