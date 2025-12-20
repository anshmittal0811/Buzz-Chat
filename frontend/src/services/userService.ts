import api from '@/lib/api';
import type { ApiResponse, PaginatedResponse, User } from '@/types';

export const userService = {
  getUsers: (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<PaginatedResponse<User>>> =>
    api.get('/users', { params }),

  getUser: (userId: string): Promise<ApiResponse<User>> => 
    api.get(`/users/${userId}`),

  updateProfileImage: (profileUrl: string): Promise<ApiResponse<User>> =>
    api.patch('/users/profile/image', { profileUrl }),
};

