import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/http';
import { resolveApiBaseUrl } from '../../utils/apiConfig';

const API_BASE = resolveApiBaseUrl();

// Async thunks for API calls
export const fetchReviewsByDeal = createAsyncThunk(
  'reviews/fetchByDeal',
  async ({ dealId, page = 1, limit = 10, sort = 'newest' }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/reviews/deal/${dealId}`, {
        params: { page, limit, sort }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createReview = createAsyncThunk(
  'reviews/create',
  async (reviewData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE}/reviews`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ id, ...updateData }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_BASE}/reviews/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_BASE}/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const voteOnReview = createAsyncThunk(
  'reviews/vote',
  async ({ id, helpful }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE}/reviews/${id}/vote`, { helpful }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return { id, vote_counts: response.data.vote_counts };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const reviewsSlice = createSlice({
  name: 'reviews',
  initialState: {
    reviews: [],
    dealStats: {
      avg_rating: 0,
      review_count: 0,
      comment_count: 0
    },
    pagination: {
      page: 1,
      limit: 10,
      total_items: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false
    },
    loading: false,
    error: null,
    submitting: false,
    currentDealId: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentDeal: (state, action) => {
      state.currentDealId = action.payload;
    },
    clearReviews: (state) => {
      state.reviews = [];
      state.pagination = {
        page: 1,
        limit: 10,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch reviews
      .addCase(fetchReviewsByDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByDeal.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload.data.reviews;
        state.dealStats = action.payload.data.deal_stats;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchReviewsByDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch reviews';
      })
      
      // Create review
      .addCase(createReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.submitting = false;
        state.reviews.unshift(action.payload.review);
        state.dealStats.review_count += 1;
      })
      .addCase(createReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || 'Failed to create review';
      })
      
      // Update review
      .addCase(updateReview.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.submitting = false;
        const index = state.reviews.findIndex(r => r.id === action.payload.review.id);
        if (index !== -1) {
          state.reviews[index] = action.payload.review;
        }
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || 'Failed to update review';
      })
      
      // Delete review
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.reviews = state.reviews.filter(r => r.id !== action.payload);
        state.dealStats.review_count = Math.max(0, state.dealStats.review_count - 1);
      })
      
      // Vote on review
      .addCase(voteOnReview.fulfilled, (state, action) => {
        const index = state.reviews.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.reviews[index].helpful_count = action.payload.vote_counts.helpful_count;
          state.reviews[index].total_votes = action.payload.vote_counts.total_votes;
        }
      });
  }
});

export const { clearError, setCurrentDeal, clearReviews } = reviewsSlice.actions;
export default reviewsSlice.reducer;
