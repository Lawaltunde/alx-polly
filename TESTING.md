# Testing Guide for ALX Polly

This document provides a comprehensive guide to testing the ALX Polly application.

## Overview

ALX Polly uses **Vitest** as the testing framework with **React Testing Library** for component testing. The testing setup includes:

- **Unit Tests**: Testing individual functions and components
- **Integration Tests**: Testing component interactions and workflows
- **UI Component Tests**: Testing reusable UI components
- **Data Layer Tests**: Testing data operations and persistence

## Test Structure

```
test/
├── setup.ts                 # Global test setup and mocks
├── utils/
│   └── test-utils.tsx       # Custom render function and test helpers
└── integration/
    └── poll-workflow.test.tsx  # End-to-end workflow tests

app/
├── lib/
│   └── data.test.ts         # Data layer tests
├── (dashboard)/polls/
│   ├── page.test.tsx        # Polls listing page tests
│   ├── new/
│   │   └── page.test.tsx    # New poll creation tests
│   └── [pollId]/
│       └── PollPage.test.tsx # Individual poll page tests

components/ui/
├── button.test.tsx          # Button component tests
├── card.test.tsx            # Card component tests
└── input.test.tsx           # Input component tests
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The coverage report shows:
- **Statements**: Percentage of code statements executed
- **Branches**: Percentage of conditional branches executed
- **Functions**: Percentage of functions called
- **Lines**: Percentage of lines executed

## Test Categories

### 1. Unit Tests

#### Data Layer Tests (`app/lib/data.test.ts`)
Tests for data operations including:
- Poll retrieval (`getPolls`, `getPoll`)
- Poll creation (`addPoll`)
- Vote submission (`submitVote`)
- Poll deletion (`removePoll`)
- Error handling for missing files/polls

#### UI Component Tests
Tests for reusable UI components:

**Button Component** (`components/ui/button.test.tsx`):
- Different variants (default, destructive, outline, secondary)
- Different sizes (sm, lg, icon)
- Click event handling
- Disabled state
- Custom styling

**Card Component** (`components/ui/card.test.tsx`):
- Card structure (Header, Content, Footer, Title, Description)
- Proper styling classes
- Custom className support

**Input Component** (`components/ui/input.test.tsx`):
- Value change handling
- Different input types
- Disabled state
- Accessibility attributes
- Focus/blur events

### 2. Page Component Tests

#### Polls Listing Page (`app/(dashboard)/polls/page.test.tsx`)
Tests for the main polls listing page:
- Rendering polls when they exist
- Empty state when no polls
- Poll option display
- Vote count display
- Navigation links
- Error handling

#### New Poll Creation Page (`app/(dashboard)/polls/new/page.test.tsx`)
Tests for poll creation functionality:
- Form rendering
- Option addition/removal
- Form validation
- Settings toggles (auth, single vote)
- Form submission

#### Individual Poll Page (`app/(dashboard)/polls/[pollId]/PollPage.test.tsx`)
Tests for individual poll display:
- Poll question and options rendering
- Vote count display
- Voting functionality
- Not found handling
- Poll metadata display

### 3. Integration Tests

#### Poll Workflow (`test/integration/poll-workflow.test.tsx`)
End-to-end workflow tests:
- Complete poll lifecycle (create → view → vote)
- Poll settings configuration
- Data persistence
- Error handling
- User experience flows

## Test Utilities

### Custom Render Function
Located in `test/utils/test-utils.tsx`, provides:
- Theme provider wrapper
- Consistent testing environment
- Mock data for tests

### Mock Data
Predefined mock data for consistent testing:
```typescript
export const mockPolls = [
  {
    id: '1',
    question: 'What is your favorite color?',
    options: [
      { id: '1', text: 'Red', votes: 5 },
      { id: '2', text: 'Blue', votes: 3 },
      { id: '3', text: 'Green', votes: 2 },
    ],
    // ... other properties
  }
];
```

### Test Helpers
Utility functions for common testing patterns:
- `createMockPoll()`: Create poll objects with defaults
- `waitForLoadingToFinish()`: Wait for async operations

## Mocking Strategy

### File System Mocks
- Mock `fs` and `path` modules for data operations
- Simulate file read/write operations
- Test error scenarios

### Next.js Mocks
- Mock `next/navigation` for router functionality
- Mock `next/link` for navigation components
- Mock `react-dom` for form state management

### Component Mocks
- Mock data layer functions (`getPolls`, `addPoll`, etc.)
- Mock authentication context
- Mock theme provider

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. Component Testing
- Test user interactions, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Test accessibility features

### 3. Async Testing
- Use `waitFor` for async operations
- Mock async functions appropriately
- Test loading and error states

### 4. Coverage Goals
- Aim for >80% line coverage
- Focus on critical user paths
- Test error scenarios

## Debugging Tests

### Common Issues

1. **Component not rendering**: Check if all required providers are mocked
2. **Async test failures**: Ensure proper `waitFor` usage
3. **Mock not working**: Verify mock setup and cleanup

### Debug Commands

```bash
# Run specific test file
npm test -- app/lib/data.test.ts

# Run tests with verbose output
npm test -- --reporter=verbose

# Run tests in debug mode
npm test -- --reporter=verbose --no-coverage
```

## Continuous Integration

Tests should be run:
- On every pull request
- Before deployment
- During development (watch mode)

### CI Configuration
```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:coverage
```

## Future Testing Improvements

1. **E2E Testing**: Add Playwright for browser testing
2. **Performance Testing**: Add performance benchmarks
3. **Visual Regression**: Add visual testing for UI components
4. **Accessibility Testing**: Add automated accessibility checks

## Contributing

When adding new features:
1. Write tests first (TDD approach)
2. Ensure all tests pass
3. Maintain or improve coverage
4. Update this documentation

For questions about testing, refer to:
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
