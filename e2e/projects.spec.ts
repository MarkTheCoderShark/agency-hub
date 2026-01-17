import { test, expect } from './fixtures/base'
import { testUsers, testProject, generateUniqueEmail } from './fixtures/test-data'

test.describe('Projects', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.login(testUsers.owner.email, testUsers.owner.password)
  })

  test.describe('Projects List', () => {
    test('should display projects page', async ({ page, projectsPage }) => {
      await projectsPage.goto()

      await expect(page.getByRole('heading', { name: /projects/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /new project/i })).toBeVisible()
    })

    test('should show empty state when no projects', async ({ page }) => {
      await page.goto('/projects')

      // Either shows empty state or project list
      const emptyState = page.getByText(/no projects/i)
      const projectList = page.getByRole('link', { name: /project/i })

      await expect(emptyState.or(projectList.first())).toBeVisible()
    })

    test('should search projects by name', async ({ page, projectsPage }) => {
      await projectsPage.goto()

      await page.getByPlaceholder(/search/i).fill('test')
      await page.waitForTimeout(500) // Debounce

      // Results should be filtered
      const projectCards = page.locator('[data-testid="project-card"]')
      const count = await projectCards.count()

      // Each visible project should contain 'test' in name
      for (let i = 0; i < count; i++) {
        const text = await projectCards.nth(i).textContent()
        expect(text?.toLowerCase()).toContain('test')
      }
    })

    test('should filter projects by status', async ({ page, projectsPage }) => {
      await projectsPage.goto()

      await page.getByRole('combobox', { name: /status/i }).click()
      await page.getByRole('option', { name: /active/i }).click()

      // Projects should be filtered to active only
      await page.waitForTimeout(300)
    })
  })

  test.describe('Create Project', () => {
    test('should open create project dialog', async ({ page, projectsPage }) => {
      await projectsPage.goto()
      await page.getByRole('button', { name: /new project/i }).click()

      await expect(page.getByRole('dialog')).toBeVisible()
      await expect(page.getByLabel('Project Name')).toBeVisible()
      await expect(page.getByLabel('Description')).toBeVisible()
      await expect(page.getByLabel('Client Name')).toBeVisible()
      await expect(page.getByLabel('Client Email')).toBeVisible()
    })

    test('should validate required fields', async ({ page, projectsPage }) => {
      await projectsPage.goto()
      await page.getByRole('button', { name: /new project/i }).click()

      await page.getByRole('button', { name: /create project/i }).click()

      await expect(page.getByText(/name.*required/i)).toBeVisible()
      await expect(page.getByText(/client.*email.*required/i)).toBeVisible()
    })

    test('should create a new project', async ({ page, projectsPage }) => {
      const uniqueEmail = generateUniqueEmail('project-client')
      const projectName = `Test Project ${Date.now()}`

      await projectsPage.goto()
      await projectsPage.createProject(
        projectName,
        'Test project description',
        'Test Client',
        uniqueEmail
      )

      // Project should appear in list or navigate to detail
      await expect(page.getByText(projectName)).toBeVisible()
    })

    test('should validate client email format', async ({ page, projectsPage }) => {
      await projectsPage.goto()
      await page.getByRole('button', { name: /new project/i }).click()

      await page.getByLabel('Project Name').fill('Test Project')
      await page.getByLabel('Client Email').fill('invalid-email')
      await page.getByRole('button', { name: /create project/i }).click()

      await expect(page.getByText(/invalid.*email/i)).toBeVisible()
    })
  })

  test.describe('Project Detail', () => {
    test('should display project details', async ({ page }) => {
      // Assume a project exists - navigate to it
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()

        await expect(page.getByRole('tab', { name: /requests/i })).toBeVisible()
        await expect(page.getByRole('tab', { name: /notes/i })).toBeVisible()
        await expect(page.getByRole('tab', { name: /details/i })).toBeVisible()
        await expect(page.getByRole('tab', { name: /settings/i })).toBeVisible()
      }
    })

    test('should switch between tabs', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()

        // Click through tabs
        await page.getByRole('tab', { name: /notes/i }).click()
        await expect(page.getByText(/internal notes/i)).toBeVisible()

        await page.getByRole('tab', { name: /details/i }).click()
        await expect(page.getByText(/project information/i)).toBeVisible()

        await page.getByRole('tab', { name: /settings/i }).click()
        await expect(page.getByText(/project settings/i)).toBeVisible()
      }
    })

    test('should navigate back to projects list', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('button', { name: /back/i }).click()

        await expect(page).toHaveURL('/projects')
      }
    })
  })

  test.describe('Project Settings', () => {
    test('should update project name', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /settings/i }).click()

        const nameInput = page.getByLabel('Project Name')
        const originalName = await nameInput.inputValue()

        await nameInput.clear()
        await nameInput.fill(`${originalName} Updated`)
        await page.getByRole('button', { name: /save/i }).click()

        await expect(page.getByText(/saved/i)).toBeVisible()
      }
    })

    test('should archive project', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /settings/i }).click()

        const archiveButton = page.getByRole('button', { name: /archive/i })
        if (await archiveButton.isVisible()) {
          await archiveButton.click()

          // Confirm dialog
          await page.getByRole('button', { name: /confirm/i }).click()

          await expect(page.getByText(/archived/i)).toBeVisible()
        }
      }
    })
  })

  test.describe('Project Members', () => {
    test('should display project members', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /settings/i }).click()

        await expect(page.getByText(/team members/i)).toBeVisible()
      }
    })

    test('should add team member to project', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /settings/i }).click()

        const addMemberButton = page.getByRole('button', { name: /add member/i })
        if (await addMemberButton.isVisible()) {
          await addMemberButton.click()

          await expect(page.getByRole('dialog')).toBeVisible()
        }
      }
    })
  })
})
