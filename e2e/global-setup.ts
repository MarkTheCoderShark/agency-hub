import { chromium, FullConfig } from '@playwright/test'
import { testUsers, testAgency, testProject } from './fixtures/test-data'

/**
 * Global setup for E2E tests
 * This runs once before all tests to:
 * 1. Verify the app is running
 * 2. Seed test data if needed
 * 3. Create test accounts
 */
async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use?.baseURL || 'http://localhost:5173'

  console.log('Starting global setup...')
  console.log(`Base URL: ${baseURL}`)

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // Verify the app is running
    console.log('Verifying app is running...')
    const response = await page.goto(baseURL, { timeout: 30000 })

    if (!response || response.status() >= 400) {
      throw new Error(`App is not running or returned error: ${response?.status()}`)
    }

    console.log('App is running successfully')

    // Note: In a real setup, you would seed test data here
    // This would involve:
    // 1. Connecting to the test database
    // 2. Creating test users
    // 3. Creating test agency, projects, requests
    //
    // For now, we assume test data exists or will be created
    // through the application's own registration flow

    console.log('Global setup completed successfully')
  } catch (error) {
    console.error('Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup
