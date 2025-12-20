import api from '@/lib/api';
import type { ApiResponse, Group, Message } from '@/types';

interface MessagesResponse {
  messages: Message[];
  canLoadMore: boolean;
}

export const chatService = {
  fetchGroups: (): Promise<ApiResponse<Group[]>> => 
    api.get('/groups'),

  createGroup: (name: string | null, memberIds: string[]): Promise<ApiResponse<Group>> =>
    api.post('/groups', {
      ...(name !== null && { name }),
      memberIds,
    }),

  updateGroup: (groupId: string, data: { name?: string; imageUrl?: string }): Promise<ApiResponse<Group>> =>
    api.patch(`/groups/${groupId}`, data),

  fetchMessages: (
    groupId: string,
    options: { page?: number; limit?: number; before?: string }
  ): Promise<ApiResponse<MessagesResponse>> =>
    api.post(`/groups/${groupId}/messages`, options),
};

