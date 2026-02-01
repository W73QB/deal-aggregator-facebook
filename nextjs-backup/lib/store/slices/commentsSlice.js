import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../utils/http';
import { resolveApiBaseUrl } from '../../utils/apiConfig';

const API_BASE = resolveApiBaseUrl();

// Async thunks for API calls
export const fetchCommentsByDeal = createAsyncThunk(
  'comments/fetchByDeal',
  async ({ dealId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/comments/deal/${dealId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchCommentsByReview = createAsyncThunk(
  'comments/fetchByReview', 
  async ({ reviewId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/comments/review/${reviewId}`, {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const createComment = createAsyncThunk(
  'comments/create',
  async (commentData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const endpoint = commentData.deal_id 
        ? `${API_BASE}/comments/deal/${commentData.deal_id}`
        : `${API_BASE}/comments/review/${commentData.review_id}`;
      
      const response = await axios.post(endpoint, commentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateComment = createAsyncThunk(
  'comments/update',
  async ({ id, content }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_BASE}/comments/${id}`, 
        { content }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const deleteComment = createAsyncThunk(
  'comments/delete',
  async (id, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      await axios.delete(`${API_BASE}/comments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Helper function to build comment tree structure
const buildCommentTree = (comments) => {
  const commentMap = new Map();
  const rootComments = [];

  // First pass: create comment map
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Second pass: build tree structure
  comments.forEach(comment => {
    const commentNode = commentMap.get(comment.id);
    if (comment.parent_id && commentMap.has(comment.parent_id)) {
      // This is a reply, add to parent's replies
      commentMap.get(comment.parent_id).replies.push(commentNode);
    } else {
      // This is a root comment
      rootComments.push(commentNode);
    }
  });

  return rootComments;
};

const commentsSlice = createSlice({
  name: 'comments',
  initialState: {
    comments: [], // Flat array from API
    commentTree: [], // Nested tree structure for display
    pagination: {
      page: 1,
      limit: 20,
      total_items: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false
    },
    loading: false,
    error: null,
    submitting: false,
    currentDealId: null,
    currentReviewId: null,
    expandedReplies: new Set(), // Track which comments have expanded replies
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearComments: (state) => {
      state.comments = [];
      state.commentTree = [];
      state.pagination = {
        page: 1,
        limit: 20,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    },
    setCurrentContext: (state, action) => {
      const { dealId, reviewId } = action.payload;
      state.currentDealId = dealId;
      state.currentReviewId = reviewId;
    },
    toggleReplies: (state, action) => {
      const commentId = action.payload;
      const expanded = new Set(state.expandedReplies);
      if (expanded.has(commentId)) {
        expanded.delete(commentId);
      } else {
        expanded.add(commentId);
      }
      state.expandedReplies = expanded;
    },
    optimisticallyAddComment: (state, action) => {
      // Add comment optimistically for better UX
      state.comments.push(action.payload);
      state.commentTree = buildCommentTree(state.comments);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch comments by deal
      .addCase(fetchCommentsByDeal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsByDeal.fulfilled, (state, action) => {
        state.loading = false;
        const { comments, pagination } = action.payload.data;
        state.comments = comments;
        state.commentTree = buildCommentTree(comments);
        state.pagination = pagination;
      })
      .addCase(fetchCommentsByDeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch comments';
      })
      
      // Fetch comments by review
      .addCase(fetchCommentsByReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommentsByReview.fulfilled, (state, action) => {
        state.loading = false;
        const { comments, pagination } = action.payload.data;
        state.comments = comments;
        state.commentTree = buildCommentTree(comments);
        state.pagination = pagination;
      })
      .addCase(fetchCommentsByReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch comments';
      })
      
      // Create comment
      .addCase(createComment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createComment.fulfilled, (state, action) => {
        state.submitting = false;
        const newComment = action.payload.comment;
        
        // Add to flat array
        state.comments.push(newComment);
        
        // Rebuild tree structure
        state.commentTree = buildCommentTree(state.comments);
        
        // Update pagination
        state.pagination.total_items += 1;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || 'Failed to create comment';
        
        // Remove optimistic comment if it exists
        const optimisticCommentIndex = state.comments.findIndex(c => c.isOptimistic);
        if (optimisticCommentIndex !== -1) {
          state.comments.splice(optimisticCommentIndex, 1);
          state.commentTree = buildCommentTree(state.comments);
        }
      })
      
      // Update comment
      .addCase(updateComment.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateComment.fulfilled, (state, action) => {
        state.submitting = false;
        const updatedComment = action.payload.comment;
        const index = state.comments.findIndex(c => c.id === updatedComment.id);
        if (index !== -1) {
          state.comments[index] = updatedComment;
          state.commentTree = buildCommentTree(state.comments);
        }
      })
      .addCase(updateComment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || 'Failed to update comment';
      })
      
      // Delete comment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.comments = state.comments.filter(c => c.id !== deletedId);
        state.commentTree = buildCommentTree(state.comments);
        state.pagination.total_items = Math.max(0, state.pagination.total_items - 1);
      })
      .addCase(deleteComment.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to delete comment';
      });
  }
});

export const { 
  clearError, 
  clearComments, 
  setCurrentContext, 
  toggleReplies, 
  optimisticallyAddComment 
} = commentsSlice.actions;

export default commentsSlice.reducer;
