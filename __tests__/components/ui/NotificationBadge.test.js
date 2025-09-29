/**
 * NotificationBadge Component Test Suite
 * Tests Redux-connected notification badge component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import NotificationBadge from '../../../components/ui/NotificationBadge';
import inAppNotificationsSlice from '../../../lib/store/slices/inAppNotificationsSlice';
import styles from '../../../components/ui/NotificationBadge.module.css';

// Mock analytics
jest.mock('../../../lib/analytics/events', () => ({
  trackNotificationOpen: jest.fn()
}));

// Create mock store with initial state
const createMockStore = (initialState = {}) => {
  const baseState = inAppNotificationsSlice(undefined, { type: '@@INIT' });
  return configureStore({
    reducer: {
      inAppNotifications: inAppNotificationsSlice
    },
    preloadedState: {
      inAppNotifications: {
        ...baseState,
        ...initialState
      }
    }
  });
};

const renderWithStore = (component, store) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('NotificationBadge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    test('renders notification badge button', () => {
      const store = createMockStore();
      renderWithStore(<NotificationBadge />, store);

      const button = screen.getByRole('button', { name: /notifications/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass(styles.notificationBadge);
    });

    test('renders with custom className', () => {
      const store = createMockStore();
      renderWithStore(<NotificationBadge className="custom-badge" />, store);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-badge');
    });

    test('renders notification icon', () => {
      const store = createMockStore();
      renderWithStore(<NotificationBadge />, store);

      const icon = screen.getByText('🔔');
      expect(icon).toBeInTheDocument();
    });
  });

  describe('Unread Count Display', () => {
    test('shows count badge when there are unread notifications', () => {
      const store = createMockStore({
        unreadCount: 5,
        hasUnread: true
      });
      renderWithStore(<NotificationBadge />, store);

      const count = screen.getByText('5');
      expect(count).toBeInTheDocument();
      expect(count).toHaveClass(styles.notificationBadge__count);
    });

    test('does not show count badge when no unread notifications', () => {
      const store = createMockStore({
        unreadCount: 0,
        hasUnread: false
      });
      renderWithStore(<NotificationBadge />, store);

      const count = screen.queryByText('0');
      expect(count).not.toBeInTheDocument();
    });

    test('shows 99+ for counts over 99', () => {
      const store = createMockStore({
        unreadCount: 150,
        hasUnread: true
      });
      renderWithStore(<NotificationBadge />, store);

      const count = screen.getByText('99+');
      expect(count).toBeInTheDocument();
    });

    test('shows exact count for counts under 99', () => {
      const store = createMockStore({
        unreadCount: 42,
        hasUnread: true
      });
      renderWithStore(<NotificationBadge />, store);

      const count = screen.getByText('42');
      expect(count).toBeInTheDocument();
    });
  });

  describe('Pulse Animation', () => {
    test('shows pulse animation when there are unread notifications', () => {
      const store = createMockStore({
        unreadCount: 3,
        hasUnread: true
      });
      renderWithStore(<NotificationBadge />, store);

      const pulse = document.querySelector(`.${styles.notificationBadge__pulse}`);
      expect(pulse).toBeInTheDocument();
    });

    test('does not show pulse animation when no unread notifications', () => {
      const store = createMockStore({
        unreadCount: 0,
        hasUnread: false
      });
      renderWithStore(<NotificationBadge />, store);

      const pulse = document.querySelector(`.${styles.notificationBadge__pulse}`);
      expect(pulse).not.toBeInTheDocument();
    });
  });

  describe('Active State', () => {
    test('applies active class when panel is open', () => {
      const store = createMockStore({
        isOpen: true
      });
      renderWithStore(<NotificationBadge />, store);

      const button = screen.getByRole('button');
      expect(button).toHaveClass(styles.notificationBadge);
      expect(button).toHaveClass(styles.notificationBadgeActive);
    });

    test('does not apply active class when panel is closed', () => {
      const store = createMockStore({
        isOpen: false
      });
      renderWithStore(<NotificationBadge />, store);

      const button = screen.getByRole('button');
      expect(button).not.toHaveClass(styles.notificationBadgeActive);
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      const store = createMockStore({
        unreadCount: 7,
        isOpen: false
      });
      renderWithStore(<NotificationBadge />, store);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Notifications. 7 unread.');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'dialog');
      expect(button).toHaveAttribute('title', '7 unread notifications');
    });

    test('updates aria-expanded when panel is open', () => {
      const store = createMockStore({
        unreadCount: 3,
        isOpen: true
      });
      renderWithStore(<NotificationBadge />, store);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    test('count badge has aria-hidden', () => {
      const store = createMockStore({
        unreadCount: 5,
        hasUnread: true
      });
      renderWithStore(<NotificationBadge />, store);

      const count = screen.getByText('5');
      expect(count).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('User Interactions', () => {
    test('handles click to toggle panel', () => {
      const store = createMockStore();
      renderWithStore(<NotificationBadge />, store);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Check if store state changed (panel should be open now)
      const state = store.getState().inAppNotifications;
      expect(state.isOpen).toBe(true);
    });

    test('handles Enter key press', () => {
      const store = createMockStore();
      renderWithStore(<NotificationBadge />, store);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter' });

      const state = store.getState().inAppNotifications;
      expect(state.isOpen).toBe(true);
    });

    test('handles Space key press', () => {
      const store = createMockStore();
      renderWithStore(<NotificationBadge />, store);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ' });

      const state = store.getState().inAppNotifications;
      expect(state.isOpen).toBe(true);
    });

    test('ignores other key presses', () => {
      const store = createMockStore();
      renderWithStore(<NotificationBadge />, store);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Escape' });

      const state = store.getState().inAppNotifications;
      expect(state.isOpen).toBe(false);
    });
  });

  describe('Redux Integration', () => {
    test('dispatches fetchHistory on mount', () => {
      const store = createMockStore();
      const dispatchSpy = jest.spyOn(store, 'dispatch');

      renderWithStore(<NotificationBadge />, store);

      expect(dispatchSpy).toHaveBeenCalled();
    });

    test('responds to store state changes', () => {
      const store = createMockStore({
        unreadCount: 1,
        hasUnread: true
      });

      const { rerender } = renderWithStore(<NotificationBadge />, store);
      expect(screen.getByText('1')).toBeInTheDocument();

      // Dispatch reducer action to add new unread notification
      store.dispatch({
        type: 'inAppNotifications/addNotification',
        payload: {
          id: 'notification-2',
          title: 'New notification',
          opened_at: null
        }
      });

      rerender(
        <Provider store={store}>
          <NotificationBadge />
        </Provider>
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });
});
