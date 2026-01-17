# AgencyHub E2E Tests

End-to-end tests for the AgencyHub platform using [Playwright](https://playwright.dev/).

## Prerequisites

1. Node.js 18+ installed
2. Project dependencies installed: `npm install`
3. Playwright browsers installed: `npx playwright install`
4. Environment variables configured in `.env.local`
5. Supabase backend running (local or remote)

## Test Structure

```
e2e/
├── fixtures/
│   ├── base.ts          # Custom test fixtures and page objects
│   └── test-data.ts     # Test data constants
├── auth.setup.ts        # Authentication state setup
├── global-setup.ts      # Global test setup
├── auth.spec.ts         # Authentication tests
├── dashboard.spec.ts    # Dashboard and agency tests
├── projects.spec.ts     # Project management tests
├── requests.spec.ts     # Request system tests
├── portal.spec.ts       # Client portal tests
├── invitation.spec.ts   # Invitation system tests
├── api.spec.ts          # API integration tests
├── accessibility.spec.ts # Accessibility tests
└── responsive.spec.ts   # Responsive design tests
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run tests with UI (interactive mode)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Run tests with debug mode
```bash
npm run test:e2e:debug
```

### Run specific test file
```bash
npx playwright test auth.spec.ts
```

### Run specific test by name
```bash
npx playwright test -g "should login successfully"
```

### Run tests for specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Run mobile viewport tests
```bash
npx playwright test --project=mobile-chrome
npx playwright test --project=mobile-safari
```

## Viewing Test Results

### Open HTML report
```bash
npm run test:e2e:report
```

### View trace files
Trace files are generated on first retry for failing tests. View them at:
```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

## Test Configuration

Configuration is in `playwright.config.ts`:

- **Base URL**: `http://localhost:5173` (or `BASE_URL` env var)
- **Retries**: 0 locally, 2 in CI
- **Workers**: Unlimited locally, 1 in CI
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

## Test Data

Test data is defined in `e2e/fixtures/test-data.ts`:

- `testUsers`: Pre-defined test user credentials
- `testAgency`: Test agency details
- `testProject`: Test project data
- `testRequest`: Test request data

**Important**: Before running tests, ensure these test accounts exist in your database or update the test data to match existing accounts.

## Writing New Tests

### Using custom fixtures

```typescript
import { test, expect } from './fixtures/base'

test('my test', async ({ page, auth, dashboardPage }) => {
  // Login using auth fixture
  await auth.login('user@test.com', 'password')

  // Use page object
  await dashboardPage.navigateToProjects()

  // Assert
  await expect(page).toHaveURL('/projects')
})
```

### Test naming conventions

- Describe blocks: Feature or page name
- Test names: Should start with "should"
- Example: `should display login form`

### Best practices

1. Use page objects for common interactions
2. Use meaningful selectors (role, label, testid)
3. Wait for network idle when needed
4. Handle conditional UI elements gracefully
5. Keep tests independent

## CI/CD Integration

The tests are configured to work in CI environments:

```yaml
# Example GitHub Actions
- name: Install Playwright Browsers
  run: npx playwright install --with-deps

- name: Run E2E Tests
  run: npm run test:e2e
  env:
    BASE_URL: http://localhost:5173
    CI: true
```

## Troubleshooting

### Tests timeout
- Increase timeout in playwright.config.ts
- Check if dev server is running
- Verify network connectivity

### Authentication fails
- Verify test user credentials
- Check Supabase connection
- Ensure `.auth/` directory is writable

### Element not found
- Add explicit waits
- Check selector accuracy
- Verify page state

### Flaky tests
- Add proper waits for async operations
- Use retry logic for unstable elements
- Check for race conditions
