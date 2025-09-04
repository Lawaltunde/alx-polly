import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render card with default styling', () => {
      render(<Card>Card content</Card>);

      const card = screen.getByText('Card content');
      expect(card).toBeInTheDocument();
      expect(card.closest('[data-slot="card"]')).toHaveClass('bg-card');
    });

    it('should apply custom className', () => {
      render(<Card className="custom-card">Custom card</Card>);

      const card = screen.getByText('Custom card');
      expect(card.closest('[data-slot="card"]')).toHaveClass('custom-card');
    });
  });

  describe('CardHeader', () => {
    it('should render card header with proper styling', () => {
      render(<CardHeader>Header content</CardHeader>);

      const header = screen.getByText('Header content');
      expect(header).toBeInTheDocument();
      expect(header).toHaveClass('px-6');
    });
  });

  describe('CardTitle', () => {
    it('should render card title with proper styling', () => {
      render(<CardTitle>Card Title</CardTitle>);

      const title = screen.getByText('Card Title');
      expect(title).toBeInTheDocument();
      expect(title).toHaveClass('font-semibold', 'leading-none');
    });
  });

  describe('CardDescription', () => {
    it('should render card description with proper styling', () => {
      render(<CardDescription>Card description</CardDescription>);

      const description = screen.getByText('Card description');
      expect(description).toBeInTheDocument();
      expect(description).toHaveClass('text-sm', 'text-muted-foreground');
    });
  });

  describe('CardContent', () => {
    it('should render card content with proper styling', () => {
      render(<CardContent>Content here</CardContent>);

      const content = screen.getByText('Content here');
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass('px-6');
    });
  });

  describe('CardFooter', () => {
    it('should render card footer with proper styling', () => {
      render(<CardFooter>Footer content</CardFooter>);

      const footer = screen.getByText('Footer content');
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass('flex', 'items-center', 'px-6');
    });
  });

  describe('Complete Card Structure', () => {
    it('should render a complete card with all components', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Test Title</CardTitle>
            <CardDescription>Test Description</CardDescription>
          </CardHeader>
          <CardContent>Test Content</CardContent>
          <CardFooter>Test Footer</CardFooter>
        </Card>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
      expect(screen.getByText('Test Footer')).toBeInTheDocument();
    });

    it('should maintain proper hierarchy and styling', () => {
      render(
        <Card className="test-card">
          <CardHeader>
            <CardTitle>Title</CardTitle>
            <CardDescription>Description</CardDescription>
          </CardHeader>
          <CardContent>Content</CardContent>
          <CardFooter>Footer</CardFooter>
        </Card>
      );

      const card = screen.getByText('Title').closest('.test-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('test-card');
    });
  });
});
