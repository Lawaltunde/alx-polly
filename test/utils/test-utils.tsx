import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';

// Mock data for tests
export const mockPolls = [
  {
    id: '1',
    question: 'What is your favorite color?',
    options: [
      { id: '1', text: 'Red', votes: 5 },
      { id: '2', text: 'Blue', votes: 3 },
      { id: '3', text: 'Green', votes: 2 },
    ],
    createdAt: new Date('2024-01-01'),
    createdBy: 'user1',
    requireAuth: false,
    singleVote: true,
    status: 'open' as const,
    voted: [],
  },
  {
    id: '2',
    question: 'What is your favorite programming language?',
    options: [
      { id: '1', text: 'JavaScript', votes: 10 },
      { id: '2', text: 'TypeScript', votes: 8 },
      { id: '3', text: 'Python', votes: 6 },
    ],
    createdAt: new Date('2024-01-02'),
    createdBy: 'user2',
    requireAuth: true,
    singleVote: false,
    status: 'open' as const,
    voted: [],
  },
];

export const mockPoll = mockPolls[0];

// Custom render function with providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      {children}
    </ThemeProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from testing library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Re-export screen and other utilities
export { screen, fireEvent, waitFor, within } from '@testing-library/react';

// Test helpers
export const createMockPoll = (overrides = {}) => ({
  id: 'test-poll',
  question: 'Test Question',
  options: [
    { id: '1', text: 'Option 1', votes: 0 },
    { id: '2', text: 'Option 2', votes: 0 },
  ],
  createdAt: new Date(),
  createdBy: 'test-user',
  requireAuth: false,
  singleVote: true,
  status: 'open' as const,
  voted: [],
  ...overrides,
});

export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));
