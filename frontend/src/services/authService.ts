import api from '@/lib/api';
import type { ApiResponse, AuthResponse, LoginCredentials, RegisterCredentials } from '@/types';

export const authService = {
  login: (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/login', credentials),

  register: (credentials: RegisterCredentials): Promise<ApiResponse<AuthResponse>> =>
    api.post('/auth/register', credentials),

  refreshToken: (refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> =>
    api.post('/auth/refresh', { refreshToken }),
};

