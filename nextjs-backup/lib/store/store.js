import { configureStore } from '@reduxjs/toolkit';
import reviewsReducer from './slices/reviewsSlice';
import commentsReducer from './slices/commentsSlice';
import reportsReducer from './slices/reportsSlice';
import authReducer from './slices/authSlice';
import notificationReducer from './slices/notificationSlice';
import inAppNotificationsReducer from './slices/inAppNotificationsSlice';

export const store = configureStore({
  reducer: {
    reviews: reviewsReducer,
    comments: commentsReducer,
    reports: reportsReducer,
    auth: authReducer,
    notifications: notificationReducer,
    inAppNotifications: inAppNotificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

// TypeScript types for Redux store
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;