/**
 * ConsentBanner Component Test Suite - Simplified
 * Tests basic consent management functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ConsentBanner from '../../../components/ui/ConsentBanner';

jest.mock('../../../lib/analytics/dataLayer', () => ({
  setConsent: jest.fn(),
  getConsentStatus: jest.fn(),
}));

describe('ConsentBanner', () => {
  const { setConsent, getConsentStatus } = require('../../../lib/analytics/dataLayer');

  beforeEach(() => {
    jest.clearAllMocks();
    getConsentStatus.mockReturnValue(null);
    window.dataLayer = [];
  });

  afterEach(() => {
    document.body.style.paddingBottom = '0';
    document.body.style.transition = '';
  });

  test('renders banner with privacy messaging and link when consent not set', () => {
    getConsentStatus.mockReturnValue(null);

    render(<ConsentBanner />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/We use analytics to improve your experience/i)).toBeInTheDocument();
    expect(screen.getByText(/We never sell your data/i)).toBeInTheDocument();

    const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
    expect(privacyLink).toHaveAttribute('href', '/privacy-policy');
  });

  test('does not render banner when consent already decided', () => {
    getConsentStatus.mockReturnValue('granted');

    render(<ConsentBanner />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  test('accept flow stores consent and hides banner', async () => {
    getConsentStatus.mockReturnValue(null);

    render(<ConsentBanner />);

    fireEvent.click(screen.getByRole('button', { name: /accept analytics tracking/i }));

    await waitFor(() => {
      expect(setConsent).toHaveBeenCalledWith(true);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: 'consent_granted' })
      ])
    );
  });

  test('decline flow stores denial and hides banner', async () => {
    getConsentStatus.mockReturnValue(null);

    render(<ConsentBanner />);

    fireEvent.click(screen.getByRole('button', { name: /deny analytics tracking/i }));

    await waitFor(() => {
      expect(setConsent).toHaveBeenCalledWith(false);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(window.dataLayer).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ event: 'consent_denied' })
      ])
    );
  });
});
