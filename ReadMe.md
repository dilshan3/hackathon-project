# ReadLoop Regression Test Suite

This repository contains comprehensive regression test cases for the ReadLoop application using Playwright with JavaScript.

## Test Environment

- **Application URL**: https://frontend-ten-topaz-ykmk7ren3l.vercel.app/
- **Test User**: johndoe@email.com
- **Password**: Test@1234

## Test Cases Overview

The test suite includes 10 comprehensive regression test cases:

1. **RT001**: Login and Session Persistence After System Updates
2. **RT002**: Book Search and Filter Functionality After Database Changes
3. **RT003**: Book Management CRUD Operations After API Changes
4. **RT004**: Dashboard Statistics and Data Aggregation After Backend Updates
5. **RT005**: Request Management Workflow After Status Logic Updates
6. **RT006**: User Profile and Authentication State After Security Updates
7. **RT007**: Navigation and UI State Management After Frontend Updates
8. **RT008**: Data Persistence and Synchronization After Database Migration
9. **RT009**: Form Validation and Submission After Validation Rule Changes
10. **RT010**: End-to-End Book Sharing Workflow After Integration Updates

## Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

4. Install Playwright browsers:

```bash
npm run install-browsers
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Tests with UI Mode (Interactive)

```bash
npm run test:ui
```

### Run Tests in Headed Mode (Visible Browser)

```bash
npm run test:headed
```

### Run Tests in Debug Mode

```bash
npm run test:debug
```

### Run Specific Test File

```bash
npx playwright test tests/RT001-login-session-persistence.spec.js
```

### Run Tests on Specific Browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Reports

After running tests, you can view the HTML report:

```bash
npm run report
```

The report will be available at `playwright-report/index.html`

## Test Configuration

The test configuration is defined in `playwright.config.js`:

- **Base URL**: https://frontend-ten-topaz-ykmk7ren3l.vercel.app/
- **Test Directory**: `./tests`
- **Browsers**: Chromium, Firefox, WebKit
- **Retries**: 2 retries on CI, 0 on local
- **Parallel Execution**: Enabled
- **Screenshots**: On failure
- **Videos**: On failure
- **Traces**: On first retry

## Test Structure

```
tests/
├── utils/
│   └── test-utils.js          # Shared utilities and configuration
├── RT001-login-session-persistence.spec.js
├── RT002-book-search-filter.spec.js
├── RT003-book-management-crud.spec.js
├── RT004-dashboard-statistics.spec.js
├── RT005-request-management.spec.js
├── RT006-user-profile-auth.spec.js
├── RT007-navigation-ui-state.spec.js
├── RT008-data-persistence-sync.spec.js
├── RT009-form-validation.spec.js
└── RT010-end-to-end-workflow.spec.js
```

## Test Data

Test data is configured in `tests/utils/test-utils.js`:

- Test user credentials
- Sample book data for testing
- Helper functions for common operations

## Key Features Tested

### Authentication & Session Management
- Login/logout functionality
- Session persistence
- User authentication state

### Book Management
- Add, edit, delete books
- Book search and filtering
- Book status management

### Request Management
- Create and manage book requests
- Request status updates
- Owner and requester views

### Dashboard & Statistics
- Dashboard statistics accuracy
- Data aggregation
- Recent activity tracking

### User Interface
- Navigation functionality
- Form validation
- Responsive design
- UI state management

### Data Integrity
- Data synchronization across views
- Consistency checks
- Error handling

## Continuous Integration

The test suite is configured for CI environments:

- Automatic retry on failure
- Parallel test execution
- Comprehensive reporting
- Cross-browser testing

## Troubleshooting

### Common Issues

1. **Browser Installation**: If browsers are not installed, run:
   ```bash
   npm run install-browsers
   ```

2. **Network Issues**: Ensure stable internet connection for accessing the test application

3. **Test Failures**: Check the HTML report for detailed failure information and screenshots

4. **Timeout Issues**: Increase timeout values in `playwright.config.js` if needed

### Debug Mode

Use debug mode to step through tests:

```bash
npm run test:debug
```

This will open Playwright Inspector for interactive debugging.

## Contributing

When adding new tests:

1. Follow the existing naming convention
2. Use appropriate test IDs and selectors
3. Include proper error handling
4. Add comprehensive assertions
5. Update this README if needed

## Support

For issues or questions regarding the test suite, please refer to:

- Playwright documentation: https://playwright.dev/
- Test reports generated after test execution
- Console output for detailed error messages

