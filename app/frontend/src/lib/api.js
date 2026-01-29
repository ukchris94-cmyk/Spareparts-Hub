import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Parts APIs
export const partsAPI = {
  getAll: (params) => api.get('/parts', { params }),
  getOne: (id) => api.get(`/parts/${id}`),
  create: (data) => api.post('/parts', data),
  update: (id, data) => api.put(`/parts/${id}`, data),
  delete: (id) => api.delete(`/parts/${id}`),
  getCategories: () => api.get('/categories'),
};

// Orders APIs
export const ordersAPI = {
  create: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}/status`, null, { params: { new_status: status } }),
  assignDispatcher: (id) => api.put(`/orders/${id}/assign`),
};

// Location APIs
export const locationAPI = {
  update: (data) => api.put('/location', data),
  getAll: () => api.get('/locations/dispatchers'),
  getOne: (userId) => api.get(`/location/${userId}`),
};

// Notification APIs
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

// Payment APIs
export const paymentsAPI = {
  initialize: (data) => api.post('/payments/initialize', data),
  verify: (reference) => api.get(`/payments/verify/${reference}`),
};

// Admin APIs
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
  toggleUserStatus: (userId, isActive) => api.put(`/admin/users/${userId}/status`, null, { params: { is_active: isActive } }),
};

export default api;
