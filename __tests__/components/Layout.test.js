/**
 * Layout Component Test Suite
 * Tests main layout structure, navigation, and routing integration
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import Layout from '../../components/Layout';

// Mock Next.js components and hooks
jest.mock('next/link', () => {
  return function MockLink({ href, className, children, ...props }) {
    return (
      <a href={href} className={className} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));

// Mock child components
jest.mock('../../components/ui/AuthButtons', () => {
  return function MockAuthButtons() {
    return <div data-testid="auth-buttons">Auth Buttons</div>;
  };
});

jest.mock('../../components/ui/SearchBox', () => {
  return function MockSearchBox() {
    return <div data-testid="search-box">Search Box</div>;
  };
});

jest.mock('../../components/ui/ThemeToggle', () => {
  return function MockThemeToggle() {
    return <div data-testid="theme-toggle">Theme Toggle</div>;
  };
});

const { useRouter } = require('next/router');

describe('Layout', () => {
  beforeEach(() => {
    useRouter.mockReturnValue({
      pathname: '/'
    });
  });

  describe('Basic Rendering', () => {
    test('renders children content', () => {
      render(
        <Layout>
          <div data-testid="child-content">Test Content</div>
        </Layout>
      );

      expect(screen.getByTestId('child-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    test('renders main layout structure', () => {
      render(
        <Layout>
          <div>Content</div>
        </Layout>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });
  });

  describe('Header Section', () => {
    test('renders logo and branding', () => {
      render(<Layout><div>Content</div></Layout>);

      expect(screen.getByText('DealRadar')).toBeInTheDocument();
      expect(screen.getByText('US')).toBeInTheDocument();
      expect(screen.getByText('Your Radar for the Best Deals')).toBeInTheDocument();
    });

    test('renders logo link to homepage', () => {
      render(<Layout><div>Content</div></Layout>);

      const logoLink = screen.getByText('DealRadar').closest('a');
      expect(logoLink).toHaveAttribute('href', '/');
    });

    test('renders navigation menu', () => {
      render(<Layout><div>Content</div></Layout>);

      const navigation = screen.getByRole('navigation');

      expect(screen.getAllByText('Home')).toHaveLength(2); // Header and footer
      expect(screen.getByText('Deals')).toBeInTheDocument();
      expect(screen.getAllByText('Blog')).toHaveLength(2); // Header and footer
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    test('renders navigation links with correct hrefs', () => {
      render(<Layout><div>Content</div></Layout>);

      const navigation = screen.getByRole('navigation');
      const homeLink = navigation.querySelector('a[href="/"]');
      const dealsLink = navigation.querySelector('a[href="/deals"]');
      const blogLink = navigation.querySelector('a[href="/blog"]');
      const aboutLink = navigation.querySelector('a[href="/about"]');
      const contactLink = navigation.querySelector('a[href="/contact"]');

      expect(homeLink).toBeInTheDocument();
      expect(dealsLink).toBeInTheDocument();
      expect(blogLink).toBeInTheDocument();
      expect(aboutLink).toBeInTheDocument();
      expect(contactLink).toBeInTheDocument();
    });

    test('renders mobile menu button', () => {
      render(<Layout><div>Content</div></Layout>);

      const mobileMenuBtn = screen.getByRole('button', { name: 'Toggle menu' });
      expect(mobileMenuBtn).toBeInTheDocument();
      expect(mobileMenuBtn).toHaveClass('mobile-menu-btn');
    });

    test('renders integrated UI components', () => {
      render(<Layout><div>Content</div></Layout>);

      expect(screen.getByTestId('auth-buttons')).toBeInTheDocument();
      expect(screen.getByTestId('search-box')).toBeInTheDocument();
    });
  });

  describe('Navigation Active States', () => {
    test('applies active class to home nav when on home page', () => {
      useRouter.mockReturnValue({
        pathname: '/'
      });

      render(<Layout><div>Content</div></Layout>);

      const navigation = screen.getByRole('navigation');
      const homeLink = navigation.querySelector('a[href="/"]');
      expect(homeLink).toHaveClass('active');
    });

    test('applies active class to deals nav when on deals page', () => {
      useRouter.mockReturnValue({
        pathname: '/deals'
      });

      render(<Layout><div>Content</div></Layout>);

      const dealsLink = screen.getByText('Deals').closest('a');
      expect(dealsLink).toHaveClass('active');
    });

    test('applies active class to blog nav when on blog subpage', () => {
      useRouter.mockReturnValue({
        pathname: '/blog/some-post'
      });

      render(<Layout><div>Content</div></Layout>);

      const navigation = screen.getByRole('navigation');
      const blogLink = navigation.querySelector('a[href="/blog"]');
      expect(blogLink).toHaveClass('active');
    });

    test('applies active class to about nav when on about page', () => {
      useRouter.mockReturnValue({
        pathname: '/about'
      });

      render(<Layout><div>Content</div></Layout>);

      const aboutLink = screen.getByText('About').closest('a');
      expect(aboutLink).toHaveClass('active');
    });

    test('does not apply active class to non-matching nav links', () => {
      useRouter.mockReturnValue({
        pathname: '/deals'
      });

      render(<Layout><div>Content</div></Layout>);

      const navigation = screen.getByRole('navigation');
      const homeLink = navigation.querySelector('a[href="/"]');
      const blogLink = navigation.querySelector('a[href="/blog"]');

      expect(homeLink).not.toHaveClass('active');
      expect(blogLink).not.toHaveClass('active');
    });
  });

  describe('Social Links', () => {
    test('renders header social links with correct URLs', () => {
      render(<Layout><div>Content</div></Layout>);

      const header = screen.getByRole('banner');
      const facebookLink = header.querySelector('a[href="https://facebook.com/dealradarus"]');
      const twitterLink = header.querySelector('a[href="https://x.com/dealradarus"]');
      const instagramLink = header.querySelector('a[href="https://instagram.com/dealradarus"]');

      expect(facebookLink).toBeInTheDocument();
      expect(twitterLink).toBeInTheDocument();
      expect(instagramLink).toBeInTheDocument();
    });

    test('social links open in new tab', () => {
      render(<Layout><div>Content</div></Layout>);

      const allLinks = screen.getAllByRole('link');
      const externalLinks = allLinks.filter(link =>
        link.href.includes('facebook.com') ||
        link.href.includes('twitter.com') ||
        link.href.includes('instagram.com')
      );

      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Footer Section', () => {
    test('renders company information', () => {
      render(<Layout><div>Content</div></Layout>);

      expect(screen.getByText('DealRadarUS')).toBeInTheDocument();
      expect(screen.getByText(/Your trusted source for the best tech deals/)).toBeInTheDocument();
    });

    test('renders footer navigation sections', () => {
      render(<Layout><div>Content</div></Layout>);

      expect(screen.getByText('Quick Links')).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
      expect(screen.getByText('Support')).toBeInTheDocument();
    });

    test('renders footer links', () => {
      render(<Layout><div>Content</div></Layout>);

      const footer = screen.getByRole('contentinfo');

      // Quick Links section in footer
      const footerHomeLinks = footer.querySelectorAll('a[href="/"]');
      expect(footerHomeLinks.length).toBeGreaterThan(0);

      // Categories
      expect(screen.getByText('Smartphones')).toBeInTheDocument();
      expect(screen.getByText('Laptops')).toBeInTheDocument();
      expect(screen.getByText('Gaming')).toBeInTheDocument();
      expect(screen.getByText('Smart Home')).toBeInTheDocument();

      // Support
      expect(screen.getByText('Contact Us')).toBeInTheDocument();
      expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
      expect(screen.getByText('Terms of Service')).toBeInTheDocument();
    });

    test('renders newsletter signup section', () => {
      render(<Layout><div>Content</div></Layout>);

      expect(screen.getByText('🔔 Deal Alerts')).toBeInTheDocument();
      expect(screen.getByText('Get the best deals in your inbox!')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument();
      expect(screen.getByText('Subscribe')).toBeInTheDocument();
      expect(screen.getByText('Join 25K+ deal hunters')).toBeInTheDocument();
    });

    test('newsletter form has proper attributes', () => {
      render(<Layout><div>Content</div></Layout>);

      const emailInput = screen.getByPlaceholderText('Your email');
      const subscribeButton = screen.getByText('Subscribe');

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
      expect(subscribeButton).toHaveAttribute('type', 'submit');
    });

    test('renders legal information', () => {
      render(<Layout><div>Content</div></Layout>);

      expect(screen.getByText('© 2024 DealRadarUS. All rights reserved.')).toBeInTheDocument();
      expect(screen.getByText(/This site contains affiliate links/)).toBeInTheDocument();
    });
  });

  describe('SVG Graphics and Animations', () => {
    test('renders animated logo SVG', () => {
      render(<Layout><div>Content</div></Layout>);

      const svgElement = document.querySelector('.logo-animated svg');
      expect(svgElement).toBeInTheDocument();
      expect(svgElement).toHaveAttribute('width', '200');
      expect(svgElement).toHaveAttribute('height', '60');
    });

    test('renders navigation icons', () => {
      render(<Layout><div>Content</div></Layout>);

      const navigation = screen.getByRole('navigation');
      const iconSpans = navigation.querySelectorAll('.material-icons.nav-icon');

      expect(iconSpans.length).toBe(5);
      iconSpans.forEach((icon) => {
        expect(icon).toHaveClass('material-icons');
        expect(icon.textContent.trim().length).toBeGreaterThan(0);
      });
    });

    test('renders mobile menu icon', () => {
      render(<Layout><div>Content</div></Layout>);

      const mobileMenuBtn = screen.getByRole('button', { name: 'Toggle menu' });
      const icon = mobileMenuBtn.querySelector('.material-icons');

      expect(icon).toBeInTheDocument();
      expect(icon.textContent.trim()).toBe('menu');
    });
  });

  describe('Accessibility', () => {
    test('has proper semantic HTML structure', () => {
      render(<Layout><div>Content</div></Layout>);

      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('main')).toBeInTheDocument(); // main
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
      expect(screen.getByRole('navigation')).toBeInTheDocument(); // nav
    });

    test('mobile menu button has accessible label', () => {
      render(<Layout><div>Content</div></Layout>);

      const mobileMenuBtn = screen.getByRole('button', { name: 'Toggle menu' });
      expect(mobileMenuBtn).toHaveAttribute('aria-label', 'Toggle menu');
    });

    test('form elements have proper labels', () => {
      render(<Layout><div>Content</div></Layout>);

      const emailInput = screen.getByPlaceholderText('Your email');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('required');
    });

    test('external links have security attributes', () => {
      render(<Layout><div>Content</div></Layout>);

      const externalLinks = screen.getAllByRole('link').filter(link =>
        link.href && (
          link.href.includes('facebook.com') ||
          link.href.includes('twitter.com') ||
          link.href.includes('instagram.com')
        )
      );

      externalLinks.forEach(link => {
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      });
    });
  });

  describe('Responsive Design Elements', () => {
    test('renders both desktop and mobile navigation elements', () => {
      render(<Layout><div>Content</div></Layout>);

      // Desktop navigation
      expect(screen.getByRole('navigation')).toBeInTheDocument();

      // Mobile menu button
      expect(screen.getByRole('button', { name: 'Toggle menu' })).toBeInTheDocument();
    });

    test('applies proper CSS classes for styling', () => {
      render(<Layout><div>Content</div></Layout>);

      const layout = document.querySelector('.app-layout');
      const header = document.querySelector('.main-header');
      const main = document.querySelector('.main-content');
      const footer = document.querySelector('.main-footer');

      expect(layout).toBeInTheDocument();
      expect(header).toBeInTheDocument();
      expect(main).toBeInTheDocument();
      expect(footer).toBeInTheDocument();
    });
  });
});
