import { apiService } from './api';
import type { User, ApiResponse } from '@/types';

interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> => {
    return apiService.post<LoginResponse>('/auth/login', credentials);
  },

  register: async (data: LoginCredentials & { name: string }): Promise<ApiResponse<LoginResponse>> => {
    return apiService.post<LoginResponse>('/auth/register', data);
  },

  logout: async (): Promise<void> => {
    try {
      await apiService.post('/auth/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    return apiService.get<User>('/users/profile');
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    return apiService.post<{ accessToken: string }>('/auth/refresh', { refreshToken });
  },

  verifyToken: async (): Promise<ApiResponse<User>> => {
    return apiService.get<User>('/auth/verify');
  },
};

export default authService;
