import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for Sanctum authentication
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Don't redirect if already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ========== AUTH API ==========
export const authAPI = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
  updateProfile: (data) => api.put('/user/profile', data),
};

// ========== TRANSLATION API ==========
export const translationAPI = {
  translate: (text, source, target) => 
    api.post('/translate', { text, source, target }),
  
  getLanguages: () => api.get('/languages'),
  
  // Protected routes (require auth)
  getHistory: () => api.get('/translations/history'),
  saveTranslation: (data) => api.post('/translations/save', data),
  deleteTranslation: (id) => api.delete(`/translations/${id}`),
};

// ========== DICTIONARY API ==========
export const dictionaryAPI = {
  search: (query) => api.get('/dictionary/search', { params: { q: query } }),
  getWord: (word) => api.get(`/dictionary/word/${word}`),
  
  // Protected routes - search history
  getHistory: () => api.get('/dictionary/history'),
  saveHistory: (word, phonetic, found) => api.post('/dictionary/history', { word, phonetic, found }),
  clearHistory: () => api.delete('/dictionary/history'),
  deleteHistoryItem: (id) => api.delete(`/dictionary/history/${id}`),
};

// ========== QUIZ API ==========
export const quizAPI = {
  getQuestions: (category = null, limit = 5) => 
    api.get('/quiz/questions', { params: { category, limit } }),
  
  // Protected routes - save quiz score
  saveScore: (data) => api.post('/quiz/submit', data),
  getScores: () => api.get('/quiz/scores'),
};

// ========== LEARNING API ==========
export const learningAPI = {
  getPhrases: (category = null) => 
    api.get('/learning/phrases', { params: { category } }),
  
  getCategories: () => api.get('/learning/categories'),
  
  // Protected routes
  getProgress: () => api.get('/learning/progress'),
  updateProgress: (data) => api.post('/learning/progress', data),
};

// ========== HEALTH CHECK ==========
export const healthCheck = () => api.get('/health');

export default api;
