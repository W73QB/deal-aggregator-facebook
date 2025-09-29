/**
 * LoadingSpinner Component Test Suite
 * Tests rendering, props, and accessibility features
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';
import styles from '../../../components/ui/LoadingSpinner.module.css';

const querySpinner = () => document.querySelector(`.${styles.loadingSpinner}`);

describe('LoadingSpinner', () => {
  describe('Default Rendering', () => {
    test('renders with default props', () => {
      render(<LoadingSpinner />);

      const container = screen.getByRole('status');
      expect(container).toBeInTheDocument();
      expect(container).toHaveAttribute('aria-label', 'Loading');
      expect(container).toHaveClass(styles.loadingContainer);

      const spinner = querySpinner();
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveClass(styles['loading-spinner--medium']);
      expect(spinner).toHaveStyle('border-top-color: #007bff');
    });
  });

  describe('Size Prop', () => {
    test('renders small size spinner', () => {
      render(<LoadingSpinner size="small" />);

      const spinner = querySpinner();
      expect(spinner).toHaveClass(styles['loading-spinner--small']);
    });

    test('renders large size spinner', () => {
      render(<LoadingSpinner size="large" />);

      const spinner = querySpinner();
      expect(spinner).toHaveClass(styles['loading-spinner--large']);
    });

    test('renders medium size spinner when size prop is medium', () => {
      render(<LoadingSpinner size="medium" />);

      const spinner = querySpinner();
      expect(spinner).toHaveClass(styles['loading-spinner--medium']);
    });
  });

  describe('Color Prop', () => {
    test('applies custom color to spinner', () => {
      render(<LoadingSpinner color="#ff5722" />);

      const spinner = querySpinner();
      expect(spinner).toHaveStyle('border-top-color: #ff5722');
    });

    test('applies custom hex color', () => {
      render(<LoadingSpinner color="#28a745" />);

      const spinner = querySpinner();
      expect(spinner).toHaveStyle('border-top-color: #28a745');
    });
  });

  describe('Text Prop', () => {
    test('does not render text when text prop is null', () => {
      render(<LoadingSpinner text={null} />);

      const text = screen.queryByText('Loading');
      expect(text).not.toBeInTheDocument();
    });

    test('renders custom loading text when provided', () => {
      render(<LoadingSpinner text="Please wait..." />);

      const text = screen.getByText('Please wait...');
      expect(text).toBeInTheDocument();
      expect(text).toHaveClass(styles.loadingText);
      expect(text).toHaveAttribute('aria-hidden', 'true');
    });

    test('updates aria-label when custom text is provided', () => {
      render(<LoadingSpinner text="Saving data..." />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Saving data...');
    });

    test('renders text with proper accessibility attributes', () => {
      render(<LoadingSpinner text="Loading content..." />);

      const text = screen.getByText('Loading content...');
      expect(text).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Combined Props', () => {
    test('renders with all props combined', () => {
      render(<LoadingSpinner size="large" color="#6c757d" text="Loading data..." />);

      const container = screen.getByRole('status');
      const spinner = querySpinner();
      const text = screen.getByText('Loading data...');

      expect(container).toHaveAttribute('aria-label', 'Loading data...');
      expect(spinner).toHaveClass(styles['loading-spinner--large']);
      expect(spinner).toHaveStyle('border-top-color: #6c757d');
      expect(text).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper role for screen readers', () => {
      render(<LoadingSpinner />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('text is hidden from screen readers when present', () => {
      render(<LoadingSpinner text="Loading..." />);

      const text = screen.getByText('Loading...');
      expect(text).toHaveAttribute('aria-hidden', 'true');
    });

    test('container has proper aria-label for screen readers', () => {
      render(<LoadingSpinner text="Fetching results..." />);

      const container = screen.getByRole('status');
      expect(container).toHaveAttribute('aria-label', 'Fetching results...');
    });
  });
});
