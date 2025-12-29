import client from './client';

export const login = async (username, password) => {
  const response = await client.post('/auth/login/', { username, password });
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  return response.data;
};

export const logout = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  try {
    await client.post('/auth/logout/', { refresh: refreshToken });
  } finally {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }
};

export const getMe = async () => {
  const response = await client.get('/auth/me/');
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await client.post('/auth/register/', { username, email, password });
  localStorage.setItem('access_token', response.data.access);
  localStorage.setItem('refresh_token', response.data.refresh);
  return response.data;
};
