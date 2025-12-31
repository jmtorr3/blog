import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/blog/api';

const client = axios.create({
  baseURL: API_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');

  // Ensure headers object exists
  if (!config.headers) {
    config.headers = {};
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Set Content-Type for JSON requests only (not FormData)
  if (config.data instanceof FormData) {
    // Delete Content-Type header to let the browser set it with boundary
    delete config.headers['Content-Type'];
  } else {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh/`, {
            refresh: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access);
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          return client(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/blog/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default client;
