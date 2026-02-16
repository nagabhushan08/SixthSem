import api from './api';

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserResponse;
}

export interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/auth/me');
    return response.data;
  },
};
