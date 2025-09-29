/**
 * OptimizedImage Component Test Suite
 * Tests Next.js Image wrapper with optimization features
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import OptimizedImage from '../../../components/ui/OptimizedImage';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, fill, className, priority, quality, placeholder, blurDataURL, ...props }) {
    const imgProps = {
      src,
      alt,
      ...props
    };

    // Handle className (including empty string)
    if (className !== undefined) {
      imgProps.className = className;
    }

    // Handle priority
    if (priority !== undefined) {
      imgProps.priority = String(priority);
    }

    // Handle quality
    if (quality !== undefined) {
      imgProps.quality = String(quality);
    }

    // Handle placeholder
    if (placeholder !== undefined) {
      imgProps.placeholder = placeholder;
    }

    // Handle blurDataURL
    if (blurDataURL !== undefined) {
      imgProps.blurDataURL = blurDataURL;
    }

    // Add width/height unless fill is used
    if (!fill && width && height) {
      imgProps.width = width;
      imgProps.height = height;
    }

    // Add data attributes for testing
    if (fill) {
      imgProps['data-fill'] = 'true';
    }

    return <img {...imgProps} data-testid="next-image" />;
  };
});

describe('OptimizedImage', () => {
  const defaultProps = {
    src: '/test-image.jpg',
    alt: 'Test image',
    width: 400,
    height: 300
  };

  describe('Basic Rendering', () => {
    test('renders image with required props', () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
      expect(image).toHaveAttribute('alt', 'Test image');
      expect(image).toHaveAttribute('width', '400');
      expect(image).toHaveAttribute('height', '300');
    });

    test('renders with custom className', () => {
      render(<OptimizedImage {...defaultProps} className="custom-image" />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveClass('custom-image');
    });

    test('renders with default empty className when not provided', () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image.className).toBe('');
    });
  });

  describe('Fill Mode', () => {
    test('renders with fill prop when fill is true', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          fill={true}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('data-fill', 'true');
      // Should not have width/height when fill is used
      expect(image).not.toHaveAttribute('width');
      expect(image).not.toHaveAttribute('height');
    });

    test('uses sizes prop with fill mode', () => {
      const customSizes = "(max-width: 600px) 100vw, 50vw";

      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          fill={true}
          sizes={customSizes}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('sizes', customSizes);
    });

    test('uses default sizes when not provided in fill mode', () => {
      render(
        <OptimizedImage
          src="/test-image.jpg"
          alt="Test image"
          fill={true}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('sizes', "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw");
    });
  });

  describe('Standard Mode (with width/height)', () => {
    test('renders with width and height when fill is false', () => {
      render(<OptimizedImage {...defaultProps} fill={false} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('width', '400');
      expect(image).toHaveAttribute('height', '300');
      expect(image).not.toHaveAttribute('data-fill');
    });

    test('uses sizes prop with standard mode', () => {
      const customSizes = "(max-width: 400px) 100vw";

      render(<OptimizedImage {...defaultProps} sizes={customSizes} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('sizes', customSizes);
    });
  });

  describe('Image Quality and Optimization', () => {
    test('uses default quality of 75', () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('quality', '75');
    });

    test('uses custom quality when provided', () => {
      render(<OptimizedImage {...defaultProps} quality={90} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('quality', '90');
    });

    test('uses default placeholder blur', () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('placeholder', 'blur');
    });

    test('uses custom placeholder when provided', () => {
      render(<OptimizedImage {...defaultProps} placeholder="empty" />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('placeholder', 'empty');
    });

    test('uses default blurDataURL', () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('blurDataURL');
      expect(image.getAttribute('blurDataURL')).toContain('data:image/jpeg;base64');
    });
  });

  describe('Priority Loading', () => {
    test('uses default priority of false', () => {
      render(<OptimizedImage {...defaultProps} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('priority', 'false');
    });

    test('uses custom priority when provided', () => {
      render(<OptimizedImage {...defaultProps} priority={true} />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('priority', 'true');
    });
  });

  describe('Additional Props', () => {
    test('passes through additional props', () => {
      render(
        <OptimizedImage
          {...defaultProps}
          loading="eager"
          style={{ border: '1px solid red' }}
          data-custom="test-value"
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('loading', 'eager');
      expect(image).toHaveAttribute('data-custom', 'test-value');
      expect(image).toHaveAttribute('style');
    });

    test('overrides default props with custom ones', () => {
      render(
        <OptimizedImage
          {...defaultProps}
          quality={95}
          placeholder="empty"
          className="override-class"
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('quality', '95');
      expect(image).toHaveAttribute('placeholder', 'empty');
      expect(image).toHaveClass('override-class');
    });
  });

  describe('Accessibility', () => {
    test('requires alt text for accessibility', () => {
      render(<OptimizedImage {...defaultProps} alt="Descriptive alt text" />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', 'Descriptive alt text');
    });

    test('handles empty alt text for decorative images', () => {
      render(<OptimizedImage {...defaultProps} alt="" />);

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('alt', '');
    });
  });

  describe('Props Destructuring', () => {
    test('correctly separates Next.js Image props from custom props', () => {
      render(
        <OptimizedImage
          src="/test.jpg"
          alt="Test"
          width={200}
          height={150}
          className="test-class"
          quality={80}
          customProp="should-be-passed"
          anotherProp={42}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toHaveAttribute('src', '/test.jpg');
      expect(image).toHaveAttribute('alt', 'Test');
      expect(image).toHaveAttribute('width', '200');
      expect(image).toHaveAttribute('height', '150');
      expect(image).toHaveClass('test-class');
      expect(image).toHaveAttribute('quality', '80');
      expect(image).toHaveAttribute('customProp', 'should-be-passed');
      expect(image).toHaveAttribute('anotherProp', '42');
    });
  });

  describe('Edge Cases', () => {
    test('handles missing width/height in standard mode', () => {
      render(
        <OptimizedImage
          src="/test.jpg"
          alt="Test"
          fill={false}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
      expect(image).not.toHaveAttribute('data-fill');
    });

    test('handles undefined/null props gracefully', () => {
      render(
        <OptimizedImage
          src="/test.jpg"
          alt="Test"
          width={400}
          height={300}
          className={undefined}
          quality={null}
        />
      );

      const image = screen.getByTestId('next-image');
      expect(image).toBeInTheDocument();
    });
  });
});