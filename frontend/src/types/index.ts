// User types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Auth types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// AuthResponse - API returns user fields directly with tokens
export interface AuthResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileUrl?: string;
  __v?: number;
  accessToken: string;
  refreshToken: string;
}

// Group types
export interface Group {
  _id: string;
  name?: string;
  imageUrl?: string;
  members: User[]; // API returns User objects directly
  lastMessage?: Message;
  lastMessages?: Message[];
  createdAt: string;
  updatedAt: string;
}

// GroupMember is used when the API returns detailed membership info
export interface GroupMember {
  _id: string;
  group: string;
  user: User;
  role: 'admin' | 'member';
  joinedAt: string;
  lastSeenAt?: string;
}

// Message types
export interface Attachment {
  filename: string;
  url: string;
  type: string;
  size: number;
}

export interface Message {
  _id: string;
  content?: string;
  sender: User;
  group: string;
  attachment?: Attachment;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

