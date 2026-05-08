import axios from 'axios';

const API_BASE = 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.config?.url, error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ✅ COMPLETE AND CONSISTENT API ENDPOINTS:

// ========== AUTH APIs ==========
export const signUpUser = async (userData: any) => {
  const response = await api.post('/api/auth/signup', userData);
  return response.data;
};

export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const updateUserProfile = async (profileData: any) => {
  const response = await api.put('/api/auth/profile', profileData);
  return response.data;
};

// ========== PROFILE PICTURE APIs ==========
export const uploadProfilePicture = async (file: File) => {
  const formData = new FormData();
  formData.append('profile_picture', file);

  const response = await api.post('/api/upload/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteProfilePicture = async () => {
  const response = await api.delete('/api/delete/profile-picture');
  return response.data;
};

export const getProfilePictureStatus = async () => {
  const response = await api.get('/api/profile/picture-status');
  return response.data;
};

// ========== CHEF APIs ==========
export const getChefs = async () => {
  const response = await api.get('/api/chefs');
  return response.data;
};

export const getChefById = async (chefId: string) => {
  const response = await api.get(`/api/chefs/${chefId}`);
  return response.data;
};

export const getChefProfile = async () => {
  const response = await api.get('/api/chefs/profile/me');
  return response.data;
};

export const updateChefProfile = async (profileData: any) => {
  const response = await api.put('/api/chefs/profile', profileData);
  return response.data;
};

export const getMyChefProfile = async () => {
  const response = await api.get('/api/chefs/profile/me');
  return response.data;
};

// ========== BOOKING APIs ==========
export const createBooking = async (bookingData: any) => {
  const response = await api.post('/api/bookings', bookingData);
  return response.data;
};

export const getClientBookings = async (clientId: string) => {
  const response = await api.get(`/api/bookings/client/${clientId}`);
  return response.data;
};

export const getChefBookings = async (chefId: string) => {
  const response = await api.get(`/api/bookings/chef/${chefId}`);
  return response.data;
};

export const updateBookingStatus = async (bookingId: string, status: string) => {
  const response = await api.put(`/api/bookings/${bookingId}/status`, { status });
  return response.data;
};

// ========== REVIEW APIs ==========
export const createReview = async (reviewData: any) => {
  const response = await api.post('/api/reviews', reviewData);
  return response.data;
};

export const getChefReviews = async (chefId: string) => {
  const response = await api.get(`/api/reviews/chef/${chefId}`);
  return response.data;
};

// ========== CHAT APIs ==========
export const getMessages = async (bookingId: string) => {
  const response = await api.get(`/api/chat/booking/${bookingId}`);
  return response.data;
};

export const sendMessage = async (messageData: any) => {
  const response = await api.post('/api/chat/messages', messageData);
  return response.data;
};

export const getBookingDetails = async (bookingId: string) => {
  const response = await api.get(`/api/chat/booking/${bookingId}/details`);
  return response.data;
};

// ========== ADMIN APIs ==========
export const getAdminStats = async () => {
  const response = await api.get('/api/admin/stats');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

export const getAdminBookings = async () => {
  const response = await api.get('/api/admin/bookings');
  return response.data;
};

export const deleteAdminUser = async (userId: string) => {
  const response = await api.delete(`/api/admin/users/${userId}`);
  return response.data;
};

export const deleteAdminBooking = async (bookingId: string) => {
  const response = await api.delete(`/api/admin/bookings/${bookingId}`);
  return response.data;
};

// ========== UTILITY APIs ==========
export const getAllChefs = async () => {
  const response = await api.get('/api/chefs/all');
  return response.data;
};

export const testServer = async () => {
  const response = await api.get('/test');
  return response.data;
};

export const healthCheck = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;