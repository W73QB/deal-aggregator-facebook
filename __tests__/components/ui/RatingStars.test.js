/**
 * RatingStars Component Test Suite
 * Tests rating display, interactivity, and accessibility features
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import RatingStars from '../../../components/ui/RatingStars';

// Mock CSS modules
jest.mock('../../../components/ui/RatingStars.module.css', () => ({
  ratingStars: 'rating-stars',
  ratingStar: 'rating-star',
  'ratingStar--small': 'rating-star--small',
  'ratingStar--medium': 'rating-star--medium',
  'ratingStar--large': 'rating-star--large',
  'ratingStar--interactive': 'rating-star--interactive',
  'ratingStar--filled': 'rating-star--filled',
  'ratingStar--half': 'rating-star--half',
  ratingValue: 'rating-value'
}));

describe('RatingStars', () => {
  describe('Default Rendering', () => {
    test('renders with default props', () => {
      render(<RatingStars />);

      const ratingContainer = screen.getByRole('img');
      expect(ratingContainer).toBeInTheDocument();
      expect(ratingContainer).toHaveAttribute('aria-label', 'Rating: 0 out of 5 stars');
      expect(ratingContainer).toHaveClass('rating-stars');
    });

    test('renders 5 stars by default', () => {
      render(<RatingStars />);

      const stars = screen.getAllByText('★');
      expect(stars).toHaveLength(5);
    });

    test('all stars have proper classes and attributes', () => {
      render(<RatingStars />);

      const stars = screen.getAllByText('★');
      stars.forEach((star, index) => {
        expect(star).toHaveClass('rating-star', 'rating-star--medium');
        expect(star).toHaveAttribute('tabIndex', '-1');
        expect(star).toHaveAttribute('aria-label', `${index + 1} star${index > 0 ? 's' : ''}`);
      });
    });
  });

  describe('Rating Display', () => {
    test('displays filled stars based on rating', () => {
      render(<RatingStars rating={3} />);

      const stars = screen.getAllByText('★');
      // First 3 stars should be filled
      expect(stars[0]).toHaveClass('rating-star--filled');
      expect(stars[1]).toHaveClass('rating-star--filled');
      expect(stars[2]).toHaveClass('rating-star--filled');
      // Last 2 stars should not be filled
      expect(stars[3]).not.toHaveClass('rating-star--filled');
      expect(stars[4]).not.toHaveClass('rating-star--filled');
    });

    test('handles partial ratings with half stars', () => {
      render(<RatingStars rating={3.5} />);

      const stars = screen.getAllByText('★');
      expect(stars[0]).toHaveClass('rating-star--filled');
      expect(stars[1]).toHaveClass('rating-star--filled');
      expect(stars[2]).toHaveClass('rating-star--filled');
      expect(stars[3]).toHaveClass('rating-star--half');
      expect(stars[4]).not.toHaveClass('rating-star--filled', 'rating-star--half');
    });

    test('handles decimal ratings correctly', () => {
      render(<RatingStars rating={2.7} />);

      const stars = screen.getAllByText('★');
      expect(stars[0]).toHaveClass('rating-star--filled');
      expect(stars[1]).toHaveClass('rating-star--filled');
      expect(stars[2]).toHaveClass('rating-star--half');
    });
  });

  describe('Max Rating Prop', () => {
    test('renders custom number of stars based on maxRating', () => {
      render(<RatingStars maxRating={3} />);

      const stars = screen.getAllByText('★');
      expect(stars).toHaveLength(3);
    });

    test('updates aria-label with custom maxRating', () => {
      render(<RatingStars rating={2} maxRating={3} />);

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute('aria-label', 'Rating: 2 out of 3 stars');
    });
  });

  describe('Size Prop', () => {
    test('applies small size class', () => {
      render(<RatingStars size="small" />);

      const stars = screen.getAllByText('★');
      stars.forEach(star => {
        expect(star).toHaveClass('rating-star--small');
      });
    });

    test('applies large size class', () => {
      render(<RatingStars size="large" />);

      const stars = screen.getAllByText('★');
      stars.forEach(star => {
        expect(star).toHaveClass('rating-star--large');
      });
    });
  });

  describe('Interactive Mode', () => {
    test('renders as radiogroup when interactive', () => {
      render(<RatingStars interactive={true} />);

      const container = screen.getByRole('radiogroup');
      expect(container).toBeInTheDocument();
    });

    test('stars have interactive classes when interactive', () => {
      render(<RatingStars interactive={true} />);

      const stars = screen.getAllByText('★');
      stars.forEach(star => {
        expect(star).toHaveClass('rating-star--interactive');
        expect(star).toHaveAttribute('tabIndex', '0');
        expect(star).toHaveAttribute('role', 'radio');
      });
    });

    test('calls onRatingChange when star is clicked', () => {
      const mockOnRatingChange = jest.fn();
      render(<RatingStars interactive={true} onRatingChange={mockOnRatingChange} />);

      const thirdStar = screen.getAllByText('★')[2]; // 0-indexed, so index 2 = 3rd star
      fireEvent.click(thirdStar);

      expect(mockOnRatingChange).toHaveBeenCalledWith(3);
    });

    test('calls onRatingChange when Enter key is pressed', () => {
      const mockOnRatingChange = jest.fn();
      render(<RatingStars interactive={true} onRatingChange={mockOnRatingChange} />);

      const secondStar = screen.getAllByText('★')[1];
      fireEvent.keyDown(secondStar, { key: 'Enter' });

      expect(mockOnRatingChange).toHaveBeenCalledWith(2);
    });

    test('calls onRatingChange when Space key is pressed', () => {
      const mockOnRatingChange = jest.fn();
      render(<RatingStars interactive={true} onRatingChange={mockOnRatingChange} />);

      const fourthStar = screen.getAllByText('★')[3];
      fireEvent.keyDown(fourthStar, { key: ' ' });

      expect(mockOnRatingChange).toHaveBeenCalledWith(4);
    });

    test('does not call onRatingChange for other keys', () => {
      const mockOnRatingChange = jest.fn();
      render(<RatingStars interactive={true} onRatingChange={mockOnRatingChange} />);

      const firstStar = screen.getAllByText('★')[0];
      fireEvent.keyDown(firstStar, { key: 'Tab' });

      expect(mockOnRatingChange).not.toHaveBeenCalled();
    });

    test('does not call onRatingChange when not interactive', () => {
      const mockOnRatingChange = jest.fn();
      render(<RatingStars interactive={false} onRatingChange={mockOnRatingChange} />);

      const firstStar = screen.getAllByText('★')[0];
      fireEvent.click(firstStar);

      expect(mockOnRatingChange).not.toHaveBeenCalled();
    });
  });

  describe('Show Value Prop', () => {
    test('displays rating value when showValue is true', () => {
      render(<RatingStars rating={4.2} showValue={true} />);

      const ratingValue = screen.getByText('(4.2)');
      expect(ratingValue).toBeInTheDocument();
      expect(ratingValue).toHaveClass('rating-value');
      expect(ratingValue).toHaveAttribute('aria-hidden', 'true');
    });

    test('does not display rating value when showValue is false', () => {
      render(<RatingStars rating={4.2} showValue={false} />);

      const ratingValue = screen.queryByText('(4.2)');
      expect(ratingValue).not.toBeInTheDocument();
    });

    test('formats rating value with one decimal place', () => {
      render(<RatingStars rating={3} showValue={true} />);

      const ratingValue = screen.getByText('(3.0)');
      expect(ratingValue).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes for display mode', () => {
      render(<RatingStars rating={3} maxRating={5} />);

      const container = screen.getByRole('img');
      expect(container).toHaveAttribute('aria-label', 'Rating: 3 out of 5 stars');
    });

    test('has proper ARIA attributes for interactive mode', () => {
      render(<RatingStars rating={2} interactive={true} />);

      const container = screen.getByRole('radiogroup');
      const stars = screen.getAllByRole('radio');

      expect(container).toHaveAttribute('aria-label', 'Rating: 2 out of 5 stars');
      expect(stars).toHaveLength(5);
    });

    test('sets aria-checked correctly for interactive stars', () => {
      render(<RatingStars rating={2.7} interactive={true} />);

      const stars = screen.getAllByRole('radio');
      // Rating 2.7 should check the 3rd star (Math.ceil(2.7) = 3)
      expect(stars[2]).toHaveAttribute('aria-checked', 'true');
      expect(stars[0]).toHaveAttribute('aria-checked', 'false');
      expect(stars[1]).toHaveAttribute('aria-checked', 'false');
      expect(stars[3]).toHaveAttribute('aria-checked', 'false');
      expect(stars[4]).toHaveAttribute('aria-checked', 'false');
    });
  });

  describe('Combined Props', () => {
    test('works with all props combined', () => {
      const mockOnRatingChange = jest.fn();
      render(
        <RatingStars
          rating={3.5}
          maxRating={4}
          interactive={true}
          size="large"
          onRatingChange={mockOnRatingChange}
          showValue={true}
        />
      );

      const container = screen.getByRole('radiogroup');
      const stars = screen.getAllByText('★');
      const ratingValue = screen.getByText('(3.5)');

      expect(container).toHaveAttribute('aria-label', 'Rating: 3.5 out of 4 stars');
      expect(stars).toHaveLength(4);
      expect(stars[0]).toHaveClass('rating-star--large', 'rating-star--interactive', 'rating-star--filled');
      expect(ratingValue).toBeInTheDocument();

      // Test interaction
      fireEvent.click(stars[1]);
      expect(mockOnRatingChange).toHaveBeenCalledWith(2);
    });
  });
});