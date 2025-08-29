import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';

// Async thunks for API calls
export const createReport = createAsyncThunk(
  'reports/create',
  async (reportData, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.post(`${API_BASE}/reports`, reportData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Admin endpoints
export const fetchReports = createAsyncThunk(
  'reports/fetchAll',
  async ({ page = 1, limit = 20, status = 'all' }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE}/reports`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const updateReportStatus = createAsyncThunk(
  'reports/updateStatus',
  async ({ id, status, reason }, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.put(`${API_BASE}/reports/${id}`, 
        { status, reason }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const fetchReportStats = createAsyncThunk(
  'reports/fetchStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const token = getState().auth.token;
      const response = await axios.get(`${API_BASE}/reports/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
  initialState: {
    reports: [],
    stats: {
      pending: 0,
      reviewing: 0,
      dismissed: 0,
      action_taken: 0,
      total: 0
    },
    pagination: {
      page: 1,
      limit: 20,
      total_items: 0,
      total_pages: 0,
      has_next: false,
      has_prev: false
    },
    loading: false,
    statsLoading: false,
    error: null,
    submitting: false,
    currentFilter: 'all',
    selectedReport: null,
    showReportModal: false,
    reportingContent: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentFilter: (state, action) => {
      state.currentFilter = action.payload;
    },
    setSelectedReport: (state, action) => {
      state.selectedReport = action.payload;
    },
    showReportModal: (state, action) => {
      state.showReportModal = true;
      state.reportingContent = action.payload;
    },
    hideReportModal: (state) => {
      state.showReportModal = false;
      state.reportingContent = null;
    },
    clearReports: (state) => {
      state.reports = [];
      state.pagination = {
        page: 1,
        limit: 20,
        total_items: 0,
        total_pages: 0,
        has_next: false,
        has_prev: false
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Create report
      .addCase(createReport.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.submitting = false;
        // Update stats
        state.stats.pending += 1;
        state.stats.total += 1;
      })
      .addCase(createReport.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || 'Failed to submit report';
      })
      
      // Fetch reports
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.data.reports;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch reports';
      })
      
      // Update report status
      .addCase(updateReportStatus.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(updateReportStatus.fulfilled, (state, action) => {
        state.submitting = false;
        const updatedReport = action.payload.report;
        const index = state.reports.findIndex(r => r.id === updatedReport.id);
        if (index !== -1) {
          const oldStatus = state.reports[index].status;
          state.reports[index] = updatedReport;
          
          // Update stats
          if (state.stats[oldStatus] > 0) {
            state.stats[oldStatus] -= 1;
          }
          state.stats[updatedReport.status] += 1;
        }
      })
      .addCase(updateReportStatus.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload?.message || 'Failed to update report status';
      })
      
      // Fetch report stats
      .addCase(fetchReportStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchReportStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.stats;
      })
      .addCase(fetchReportStats.rejected, (state, action) => {
        state.statsLoading = false;
        // Don't set error for stats - it's not critical
      });
  }
});

export const { 
  clearError, 
  setCurrentFilter, 
  setSelectedReport,
  showReportModal,
  hideReportModal,
  clearReports
} = reportsSlice.actions;

export default reportsSlice.reducer;