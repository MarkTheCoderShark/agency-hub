/**
 * Test data for E2E tests
 * These are used across multiple test files for consistent test data
 */

export const testUsers = {
  owner: {
    email: 'test-owner@agencyhub-test.com',
    password: 'TestPassword123!',
    name: 'Test Owner',
  },
  staff: {
    email: 'test-staff@agencyhub-test.com',
    password: 'TestPassword123!',
    name: 'Test Staff Member',
  },
  client: {
    email: 'test-client@agencyhub-test.com',
    password: 'TestPassword123!',
    name: 'Test Client',
  },
}

export const testAgency = {
  name: 'Test Digital Agency',
  slug: 'test-agency',
  email: 'contact@test-agency.com',
  phone: '+1 (555) 123-4567',
  website: 'https://test-agency.com',
  primaryColor: '#3B82F6',
}

export const testProject = {
  name: 'Test Website Project',
  description: 'A test project for E2E testing',
  clientName: 'Test Client Company',
  clientEmail: 'client@testcompany.com',
  status: 'active',
}

export const testRequest = {
  title: 'Test Bug Report',
  type: 'bug' as const,
  priority: 'normal' as const,
  description: 'This is a test bug report for E2E testing. The issue occurs when clicking the submit button.',
}

export const testNote = {
  content: 'This is an internal test note that only the agency team can see.',
}

export const testMessage = {
  content: 'This is a test message in the request conversation.',
}

// Generate unique data for tests that need unique values
export function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `${prefix}-${timestamp}-${random}@agencyhub-test.com`
}

export function generateUniqueSlug(prefix: string = 'agency'): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(7)
  return `${prefix}-${timestamp}-${random}`
}
