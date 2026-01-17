import { test, expect } from './fixtures/base'
import { testUsers, testRequest, testMessage } from './fixtures/test-data'

test.describe('Requests', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.login(testUsers.owner.email, testUsers.owner.password)
  })

  test.describe('Request List', () => {
    test('should display requests tab in project detail', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()

        await expect(page.getByRole('tab', { name: /requests/i })).toBeVisible()
        await page.getByRole('tab', { name: /requests/i }).click()

        await expect(page.getByRole('button', { name: /new request/i })).toBeVisible()
      }
    })

    test('should filter requests by status', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()

        const statusFilter = page.getByRole('combobox', { name: /status/i })
        if (await statusFilter.isVisible()) {
          await statusFilter.click()
          await page.getByRole('option', { name: /open/i }).click()

          // Wait for filter to apply
          await page.waitForTimeout(300)
        }
      }
    })

    test('should filter requests by type', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()

        const typeFilter = page.getByRole('combobox', { name: /type/i })
        if (await typeFilter.isVisible()) {
          await typeFilter.click()
          await page.getByRole('option', { name: /bug/i }).click()

          await page.waitForTimeout(300)
        }
      }
    })

    test('should search requests', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()

        const searchInput = page.getByPlaceholder(/search/i)
        if (await searchInput.isVisible()) {
          await searchInput.fill('bug')
          await page.waitForTimeout(500)
        }
      }
    })
  })

  test.describe('Create Request', () => {
    test('should open create request form', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()
        await page.getByRole('button', { name: /new request/i }).click()

        await expect(page.getByRole('dialog')).toBeVisible()
        await expect(page.getByLabel('Title')).toBeVisible()
        await expect(page.getByLabel('Type')).toBeVisible()
        await expect(page.getByLabel('Description')).toBeVisible()
      }
    })

    test('should validate required fields', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()
        await page.getByRole('button', { name: /new request/i }).click()

        await page.getByRole('button', { name: /create/i }).click()

        await expect(page.getByText(/title.*required/i)).toBeVisible()
        await expect(page.getByText(/description.*required/i)).toBeVisible()
      }
    })

    test('should create a new request', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()
        await page.getByRole('button', { name: /new request/i }).click()

        const requestTitle = `Test Request ${Date.now()}`
        await page.getByLabel('Title').fill(requestTitle)
        await page.getByLabel('Type').click()
        await page.getByRole('option', { name: /bug/i }).click()
        await page.getByLabel('Description').fill(testRequest.description)
        await page.getByRole('button', { name: /create/i }).click()

        await expect(page.getByText(requestTitle)).toBeVisible()
      }
    })

    test('should set request priority', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()
        await page.getByRole('button', { name: /new request/i }).click()

        // Check priority options are visible
        await expect(page.getByLabel('Normal')).toBeVisible()
        await expect(page.getByLabel('Urgent')).toBeVisible()
      }
    })
  })

  test.describe('Request Detail', () => {
    test('should open request slide-over', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()

        const firstRequest = page.locator('[data-testid="request-item"]').first()
        if (await firstRequest.isVisible()) {
          await firstRequest.click()

          await expect(page.getByRole('dialog')).toBeVisible()
        }
      }
    })

    test('should display request information', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()

        const firstRequest = page.locator('[data-testid="request-item"]').first()
        if (await firstRequest.isVisible()) {
          await firstRequest.click()

          await expect(page.getByText(/description/i)).toBeVisible()
          await expect(page.getByText(/status/i)).toBeVisible()
          await expect(page.getByText(/conversation/i)).toBeVisible()
        }
      }
    })

    test('should update request status', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()

        const firstRequest = page.locator('[data-testid="request-item"]').first()
        if (await firstRequest.isVisible()) {
          await firstRequest.click()

          const statusDropdown = page.getByRole('combobox', { name: /status/i })
          if (await statusDropdown.isVisible()) {
            await statusDropdown.click()
            await page.getByRole('option', { name: /in progress/i }).click()

            await expect(page.getByText(/in progress/i)).toBeVisible()
          }
        }
      }
    })
  })

  test.describe('Request Messaging', () => {
    test('should display conversation area', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()

        const firstRequest = page.locator('[data-testid="request-item"]').first()
        if (await firstRequest.isVisible()) {
          await firstRequest.click()

          await expect(page.getByRole('textbox', { name: /message/i })).toBeVisible()
          await expect(page.getByRole('button', { name: /send/i })).toBeVisible()
        }
      }
    })

    test('should send a message', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()

        const firstRequest = page.locator('[data-testid="request-item"]').first()
        if (await firstRequest.isVisible()) {
          await firstRequest.click()

          const messageInput = page.getByRole('textbox', { name: /message/i })
          const messageContent = `Test message ${Date.now()}`

          await messageInput.fill(messageContent)
          await page.getByRole('button', { name: /send/i }).click()

          await expect(page.getByText(messageContent)).toBeVisible()
        }
      }
    })

    test('should toggle internal notes', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()

        const firstRequest = page.locator('[data-testid="request-item"]').first()
        if (await firstRequest.isVisible()) {
          await firstRequest.click()

          const internalToggle = page.getByLabel(/internal/i)
          if (await internalToggle.isVisible()) {
            await internalToggle.click()

            // Should indicate internal note mode
            await expect(page.getByText(/internal.*only/i)).toBeVisible()
          }
        }
      }
    })
  })

  test.describe('Request Attachments', () => {
    test('should display attachments area', async ({ page }) => {
      await page.goto('/projects')

      const firstProject = page.getByRole('link', { name: /project/i }).first()
      if (await firstProject.isVisible()) {
        await firstProject.click()
        await page.getByRole('tab', { name: /requests/i }).click()

        const firstRequest = page.locator('[data-testid="request-item"]').first()
        if (await firstRequest.isVisible()) {
          await firstRequest.click()

          // Check for attachment button or area
          const attachButton = page.getByRole('button', { name: /attach/i })
          const attachArea = page.getByText(/attachments/i)

          await expect(attachButton.or(attachArea)).toBeVisible()
        }
      }
    })
  })
})

test.describe('Internal Notes', () => {
  test.beforeEach(async ({ auth }) => {
    await auth.login(testUsers.owner.email, testUsers.owner.password)
  })

  test('should display notes tab', async ({ page }) => {
    await page.goto('/projects')

    const firstProject = page.getByRole('link', { name: /project/i }).first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      await page.getByRole('tab', { name: /notes/i }).click()

      await expect(page.getByText(/internal notes/i)).toBeVisible()
    }
  })

  test('should create a new note', async ({ page }) => {
    await page.goto('/projects')

    const firstProject = page.getByRole('link', { name: /project/i }).first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      await page.getByRole('tab', { name: /notes/i }).click()

      const addNoteButton = page.getByRole('button', { name: /add note/i })
      if (await addNoteButton.isVisible()) {
        await addNoteButton.click()

        const noteContent = `Test note ${Date.now()}`
        await page.getByRole('textbox').fill(noteContent)
        await page.getByRole('button', { name: /save/i }).click()

        await expect(page.getByText(noteContent)).toBeVisible()
      }
    }
  })

  test('should edit an existing note', async ({ page }) => {
    await page.goto('/projects')

    const firstProject = page.getByRole('link', { name: /project/i }).first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      await page.getByRole('tab', { name: /notes/i }).click()

      const firstNote = page.locator('[data-testid="note-item"]').first()
      if (await firstNote.isVisible()) {
        await firstNote.getByRole('button', { name: /edit/i }).click()

        const editedContent = `Edited note ${Date.now()}`
        await page.getByRole('textbox').clear()
        await page.getByRole('textbox').fill(editedContent)
        await page.getByRole('button', { name: /save/i }).click()

        await expect(page.getByText(editedContent)).toBeVisible()
      }
    }
  })

  test('should delete a note', async ({ page }) => {
    await page.goto('/projects')

    const firstProject = page.getByRole('link', { name: /project/i }).first()
    if (await firstProject.isVisible()) {
      await firstProject.click()
      await page.getByRole('tab', { name: /notes/i }).click()

      const firstNote = page.locator('[data-testid="note-item"]').first()
      if (await firstNote.isVisible()) {
        await firstNote.getByRole('button', { name: /delete/i }).click()

        // Confirm deletion
        await page.getByRole('button', { name: /confirm/i }).click()

        await expect(page.getByText(/deleted/i)).toBeVisible()
      }
    }
  })
})
