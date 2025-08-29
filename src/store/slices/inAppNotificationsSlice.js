/**
 * M3.6 In-App Notifications Redux Slice
 * Manages notification center state and operations
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import httpClient from '../../utils/http';

// ==============================================
// ASYNC THUNKS
// ==============================================

/**
 * Fetch notification history with pagination
 */
export const fetchHistory = createAsyncThunk(
  'inAppNotifications/fetchHistory',
  async ({ limit = 20, offset = 0, status = null, append = false }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams({ limit, offset });
      if (status) params.append('status', status);

      const response = await httpClient.get(`/notifications/history?${params}`);
      
      return {
        notifications: response.data.notifications,
        pagination: response.data.pagination,
        append
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch notifications',
        status: error.response?.status
      });
    }
  }
);

/**
 * Mark notification as read
 */
export const markRead = createAsyncThunk(
  'inAppNotifications/markRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      await httpClient.post('/notifications/track/open', { notificationId });
      return notificationId;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to mark notification as read',
        status: error.response?.status
      });
    }
  }
);

/**
 * Mark all notifications as read
 */
export const markAllRead = createAsyncThunk(
  'inAppNotifications/markAllRead',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { items } = getState().inAppNotifications;
      const unreadIds = items
        .filter(item => !item.opened_at)
        .map(item => item.id);

      // Mark each unread notification
      const promises = unreadIds.map(id => 
        httpClient.post('/notifications/track/open', { notificationId: id })
      );

      await Promise.all(promises);
      return unreadIds;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to mark all notifications as read',
        status: error.response?.status
      });
    }
  }
);

/**
 * Track notification click
 */
export const trackClick = createAsyncThunk(
  'inAppNotifications/trackClick',
  async ({ notificationId, targetUrl }, { rejectWithValue }) => {
    try {
      const response = await httpClient.post('/notifications/track/click', {
        notificationId,
        targetUrl
      });

      return {
        notificationId,
        redirectUrl: response.data.redirectUrl
      };
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to track click',
        status: error.response?.status
      });
    }
  }
);

/**
 * Fetch user preferences
 */
export const fetchPreferences = createAsyncThunk(
  'inAppNotifications/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await httpClient.get('/notifications/prefs');
      return response.data.preferences;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to fetch preferences',
        status: error.response?.status
      });
    }
  }
);

/**
 * Update user preferences
 */
export const updatePreferences = createAsyncThunk(
  'inAppNotifications/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await httpClient.patch('/notifications/prefs', preferences);
      return response.preferences;
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Failed to update preferences',
        status: error.response?.status
      });
    }
  }
);

// ==============================================
// SLICE DEFINITION
// ==============================================

const initialState = {
  // Notification items
  items: [],
  
  // Pagination
  pagination: {
    limit: 20,
    offset: 0,
    total: 0,
    hasMore: false
  },
  
  // UI state
  loading: false,
  loadingMore: false,
  error: null,
  
  // Counters
  unreadCount: 0,
  totalCount: 0,
  
  // Metadata
  lastFetched: null,
  
  // Preferences
  preferences: null,
  preferencesLoading: false,
  preferencesError: null,
  
  // Filters
  statusFilter: null, // null, 'pending', 'sent', 'failed'
  
  // UI flags
  isOpen: false,
  highlightedId: null
};

const inAppNotificationsSlice = createSlice({
  name: 'inAppNotifications',
  initialState,
  reducers: {
    // UI actions
    openPanel: (state) => {
      state.isOpen = true;
    },
    
    closePanel: (state) => {
      state.isOpen = false;
    },
    
    togglePanel: (state) => {
      state.isOpen = !state.isOpen;
    },
    
    // Highlight specific notification (for deep linking)
    highlightNotification: (state, action) => {
      state.highlightedId = action.payload;
    },
    
    clearHighlight: (state) => {
      state.highlightedId = null;
    },
    
    // Filter actions
    setStatusFilter: (state, action) => {
      state.statusFilter = action.payload;
      // Reset pagination when filter changes
      state.pagination.offset = 0;
      state.items = [];
    },
    
    clearFilter: (state) => {
      state.statusFilter = null;
      state.pagination.offset = 0;
      state.items = [];
    },
    
    // Clear all data (logout, etc.)
    clearAll: (state) => {
      return { ...initialState };
    },
    
    // Clear errors
    clearError: (state) => {
      state.error = null;
      state.preferencesError = null;
    },
    
    // Add new notification (for real-time updates)
    addNotification: (state, action) => {
      const notification = action.payload;
      
      // Add to beginning of list
      state.items.unshift(notification);
      
      // Update counters
      state.totalCount += 1;
      if (!notification.opened_at) {
        state.unreadCount += 1;
      }
      
      // Remove duplicates (in case of race conditions)
      const seen = new Set();
      state.items = state.items.filter(item => {
        if (seen.has(item.id)) {
          return false;
        }
        seen.add(item.id);
        return true;
      });
    },
    
    // Update notification in place
    updateNotification: (state, action) => {
      const { id, updates } = action.payload;
      const index = state.items.findIndex(item => item.id === id);
      
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
        
        // Update unread count if marking as read
        if (updates.opened_at && !state.items[index].opened_at) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      }
    }
  },
  
  extraReducers: (builder) => {
    // Fetch history
    builder
      .addCase(fetchHistory.pending, (state, action) => {
        const { append } = action.meta.arg;
        if (append) {
          state.loadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchHistory.fulfilled, (state, action) => {
        const { notifications, pagination, append } = action.payload;
        
        state.loading = false;
        state.loadingMore = false;
        state.error = null;
        state.lastFetched = Date.now();
        
        if (append) {
          // Append to existing items
          state.items = [...state.items, ...notifications];
        } else {
          // Replace items
          state.items = notifications;
        }
        
        // Update pagination
        state.pagination = pagination;
        
        // Update counters
        state.totalCount = pagination.total;
        state.unreadCount = state.items.filter(item => !item.opened_at).length;
      })
      .addCase(fetchHistory.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.error = action.payload?.message || 'Failed to fetch notifications';
      });
    
    // Mark as read
    builder
      .addCase(markRead.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.items.find(item => item.id === notificationId);
        
        if (notification && !notification.opened_at) {
          notification.opened_at = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      });
    
    // Mark all as read
    builder
      .addCase(markAllRead.fulfilled, (state, action) => {
        const markedIds = action.payload;
        
        state.items.forEach(item => {
          if (markedIds.includes(item.id)) {
            item.opened_at = new Date().toISOString();
          }
        });
        
        state.unreadCount = 0;
      });
    
    // Track click
    builder
      .addCase(trackClick.fulfilled, (state, action) => {
        const { notificationId } = action.payload;
        const notification = state.items.find(item => item.id === notificationId);
        
        if (notification) {
          notification.clicked_at = new Date().toISOString();
          
          // Also mark as read if not already
          if (!notification.opened_at) {
            notification.opened_at = new Date().toISOString();
            state.unreadCount = Math.max(0, state.unreadCount - 1);
          }
        }
      });
    
    // Fetch preferences
    builder
      .addCase(fetchPreferences.pending, (state) => {
        state.preferencesLoading = true;
        state.preferencesError = null;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.preferencesError = action.payload?.message || 'Failed to fetch preferences';
      });
    
    // Update preferences
    builder
      .addCase(updatePreferences.pending, (state) => {
        state.preferencesLoading = true;
        state.preferencesError = null;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.preferencesError = action.payload?.message || 'Failed to update preferences';
      });
  }
});

// ==============================================
// ACTIONS & SELECTORS
// ==============================================

export const {
  openPanel,
  closePanel,
  togglePanel,
  highlightNotification,
  clearHighlight,
  setStatusFilter,
  clearFilter,
  clearAll,
  clearError,
  addNotification,
  updateNotification
} = inAppNotificationsSlice.actions;

// Selectors
export const selectNotifications = (state) => state.inAppNotifications.items;
export const selectUnreadCount = (state) => state.inAppNotifications.unreadCount;
export const selectTotalCount = (state) => state.inAppNotifications.totalCount;
export const selectLoading = (state) => state.inAppNotifications.loading;
export const selectLoadingMore = (state) => state.inAppNotifications.loadingMore;
export const selectError = (state) => state.inAppNotifications.error;
export const selectPagination = (state) => state.inAppNotifications.pagination;
export const selectIsOpen = (state) => state.inAppNotifications.isOpen;
export const selectHighlightedId = (state) => state.inAppNotifications.highlightedId;
export const selectStatusFilter = (state) => state.inAppNotifications.statusFilter;
export const selectPreferences = (state) => state.inAppNotifications.preferences;
export const selectPreferencesLoading = (state) => state.inAppNotifications.preferencesLoading;
export const selectPreferencesError = (state) => state.inAppNotifications.preferencesError;

// Computed selectors
export const selectUnreadNotifications = (state) => 
  state.inAppNotifications.items.filter(item => !item.opened_at);

export const selectNotificationById = (state, id) =>
  state.inAppNotifications.items.find(item => item.id === id);

export const selectHasUnread = (state) => 
  state.inAppNotifications.unreadCount > 0;

export default inAppNotificationsSlice.reducer;