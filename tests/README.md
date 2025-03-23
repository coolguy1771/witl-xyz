# Witl.xyz Test Suite

This directory contains end-to-end tests for the witl.xyz website using Playwright.

## Test Structure

- **pages/**: Tests for specific page views and functionality
- **components/**: Tests for individual components and features

## Running Tests

Run all tests:

```bash
npm test
```

Run tests with browser UI visible:

```bash
npm run test:headed
```

Run tests with the Playwright UI for debugging:

```bash
npm run test:ui
```

Run a specific test file:

```bash
npx playwright test tests/components/animations.spec.ts
```

## Test Coverage

The test suite covers:

1. **404 Pages**: Tests both the global and blog-specific 404 pages
2. **Syntax Highlighting**: Tests code block highlighting and copy functionality
3. **Table of Contents**: Tests TOC link navigation and active state highlighting
4. **Animations**: Tests page transitions, hover effects, and interactive elements

## Adding New Tests

When adding new features to the site, please add corresponding tests to maintain test coverage. Follow the existing patterns in the test files for consistency.

## Common Issues

If tests are failing, check:

1. **404 tests**: Make sure your error pages match the expected content and styling
2. **Animation tests**: Some animation tests rely on timing and may need adjustments if animations change
3. **Selectors**: If component DOM structure changes, update selectors in the tests