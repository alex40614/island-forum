export interface User {
  id: number;
  username: string;
  email: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
}

export interface UserProfile extends User {
  post_count: number;
  follower_count: number;
  following_count: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  order: number;
  is_active: boolean;
  post_count: number;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  author_id: number;
  category_id?: number;
  view_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  created_at: string;
  updated_at?: string;
  author: User;
  category?: Category;
  comment_count: number;
  like_count: number;
  is_liked: boolean;
  is_favorited: boolean;
  images?: string[];
}

export interface Comment {
  id: number;
  content: string;
  author_id: number;
  post_id: number;
  parent_id?: number;
  created_at: string;
  updated_at?: string;
  author: User;
  reply_count: number;
  images?: string[];
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  event_date: string;
  max_attendees?: number;
  image_url?: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  attendee_count: number;
  is_attending: boolean;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  content: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface Stats {
  total_users: number;
  total_posts: number;
  total_categories: number;
  online_users: number;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  display_name: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface PostCreateData {
  title: string;
  content: string;
  category_id?: number;
  images?: string[];
}

export interface CommentCreateData {
  content: string;
  post_id: number;
  parent_id?: number;
  images?: string[];
}
