import api from './api';

export interface User {
  id: number;
  email: string;
  public_key: string;
  is_admin: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const register = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/register', { email, password });
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const saveAuth = (authData: AuthResponse) => {
  localStorage.setItem('token', authData.access_token);
  localStorage.setItem('user', JSON.stringify(authData.user));
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('token');
};
