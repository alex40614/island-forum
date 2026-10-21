import api from './client';
import type {
  User,
  UserProfile,
  Category,
  Post,
  Comment,
  Event,
  Stats,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  PostCreateData,
  CommentCreateData,
} from '@/types';

// ========== 認證 API ==========
export const authAPI = {
  login: (credentials: LoginCredentials) => {
    return api.post<AuthResponse>('/auth/login', credentials);
  },

  register: (data: RegisterData) =>
    api.post<User>('/auth/register', data),

  getCurrentUser: () =>
    api.get<User>('/auth/me'),
};

// ========== 用戶 API ==========
export const userAPI = {
  getProfile: (userId: number) =>
    api.get<UserProfile>(`/users/${userId}`),

  updateProfile: (data: Partial<User>) =>
    api.put<User>('/users/me', data),

  getUserPosts: (userId: number, skip = 0, limit = 20) =>
    api.get<Post[]>(`/users/${userId}/posts`, { params: { skip, limit } }),

  follow: (userId: number) =>
    api.post(`/users/${userId}/follow`),

  unfollow: (userId: number) =>
    api.delete(`/users/${userId}/follow`),
};

// ========== 分類 API ==========
export const categoryAPI = {
  getAll: () =>
    api.get<Category[]>('/categories'),

  getById: (id: number) =>
    api.get<Category>(`/categories/${id}`),
};

// ========== 帖子 API ==========
export const postAPI = {
  getList: (params?: {
    skip?: number;
    limit?: number;
    category_id?: number;
    sort?: 'hot' | 'latest' | 'top';
  }) =>
    api.get<Post[]>('/posts', { params }),

  getById: (id: number) =>
    api.get<Post>(`/posts/${id}`),

  create: (data: PostCreateData) =>
    api.post<Post>('/posts', data),

  update: (id: number, data: Partial<PostCreateData>) =>
    api.put<Post>(`/posts/${id}`, data),

  delete: (id: number) =>
    api.delete(`/posts/${id}`),

  like: (id: number) =>
    api.post(`/posts/${id}/like`),

  unlike: (id: number) =>
    api.delete(`/posts/${id}/like`),

  favorite: (id: number) =>
    api.post(`/posts/${id}/favorite`),

  unfavorite: (id: number) =>
    api.delete(`/posts/${id}/favorite`),

  search: (query: string, skip = 0, limit = 20) =>
    api.get<Post[]>('/posts/search', { params: { q: query, skip, limit } }),
};

// ========== 評論 API ==========
export const commentAPI = {
  getByPostId: (postId: number, skip = 0, limit = 50) =>
    api.get<Comment[]>(`/posts/${postId}/comments`, { params: { skip, limit } }),

  getReplies: (commentId: number) =>
    api.get<Comment[]>(`/comments/${commentId}/replies`),

  create: (data: CommentCreateData) =>
    api.post<Comment>('/comments', data),

  update: (id: number, content: string) =>
    api.put<Comment>(`/comments/${id}`, { content }),

  delete: (id: number) =>
    api.delete(`/comments/${id}`),
};

// ========== 活動 API ==========
export const eventAPI = {
  getList: (upcoming = true, skip = 0, limit = 20) =>
    api.get<Event[]>('/events', { params: { upcoming, skip, limit } }),

  getById: (id: number) =>
    api.get<Event>(`/events/${id}`),

  attend: (id: number) =>
    api.post(`/events/${id}/attend`),

  cancelAttendance: (id: number) =>
    api.delete(`/events/${id}/attend`),
};

// ========== 統計 API ==========
export const statsAPI = {
  get: () =>
    api.get<Stats>('/stats'),
};

// ========== 通知 API ==========
export const notificationAPI = {
  getAll: (skip = 0, limit = 50) =>
    api.get<any[]>('/notifications', { params: { skip, limit } }),

  getUnreadCount: () =>
    api.get<{ count: number }>('/notifications/unread/count'),

  markAsRead: (id: number) =>
    api.put(`/notifications/${id}/read`),

  markAllAsRead: () =>
    api.put('/notifications/read-all'),

  delete: (id: number) =>
    api.delete(`/notifications/${id}`),
};
