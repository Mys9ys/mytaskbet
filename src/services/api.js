"""
API service for myTaskBet mobile application
Handles all HTTP requests to the backend API
"""

import axios from 'axios';

// Base API configuration
const API_BASE_URL = 'http://10.0.2.2:8000'; // Use 10.0.2.2 for Android emulator
// const API_BASE_URL = 'http://localhost:8000'; // Use for iOS simulator

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access - logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Optionally navigate to login screen
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  login: async (credentials) => {
    try {
      const response = await api.post('/api/auth/login', credentials);
      // Store token and user data
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        // Get user data
        const userResponse = await api.get('/api/auth/me');
        localStorage.setItem('user', JSON.stringify(userResponse.data));
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return { success: true };
  },
  
  getCurrentUser: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Tasks API methods
export const tasksAPI = {
  getTaskTemplates: async (category, search) => {
    try {
      const params = {};
      if (category) params.category = category;
      if (search) params.search = search;
      
      const response = await api.get('/api/tasks/templates', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  createTaskTemplate: async (templateData) => {
    try {
      const response = await api.post('/api/tasks/templates', templateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getUserTasks: async (status, category) => {
    try {
      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;
      
      const response = await api.get('/api/tasks/my-tasks', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  createUserTask: async (taskData) => {
    try {
      const response = await api.post('/api/tasks/my-tasks', taskData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  completeTask: async (taskId) => {
    try {
      const response = await api.put(`/api/tasks/my-tasks/${taskId}/complete`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  failTask: async (taskId) => {
    try {
      const response = await api.put(`/api/tasks/my-tasks/${taskId}/fail`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Bank API methods
export const bankAPI = {
  getBankInfo: async () => {
    try {
      const response = await api.get('/api/bank/');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getBankTransactions: async (userId, transactionType, startDate, endDate) => {
    try {
      const params = {};
      if (userId) params.user_id = userId;
      if (transactionType) params.transaction_type = transactionType;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      
      const response = await api.get('/api/bank/transactions', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getBankStatus: async () => {
    try {
      const response = await api.get('/api/bank/status');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  distributeRewards: async (distributionType) => {
    try {
      const response = await api.post('/api/bank/distribute-rewards', { distribution_type: distributionType });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Rankings API methods
export const rankingsAPI = {
  getLeaderboard: async (rankingType, taskId, limit = 100) => {
    try {
      const params = { limit };
      if (taskId) params.task_id = taskId;
      
      const response = await api.get(`/api/rankings/leaderboard/${rankingType}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getUserRankings: async (userId) => {
    try {
      const response = await api.get(`/api/rankings/user/${userId}/rankings`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  updateRankings: async () => {
    try {
      const response = await api.get('/api/rankings/update');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  
  getMyRankings: async () => {
    try {
      const response = await api.get('/api/rankings/my');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

export default api;