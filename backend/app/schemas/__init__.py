from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


# User Schemas
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    display_name: str = Field(..., min_length=1, max_length=50)


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)


class UserUpdate(BaseModel):
    display_name: Optional[str] = Field(None, max_length=50)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class UserLogin(BaseModel):
    username: str
    password: str


class User(UserBase):
    id: int
    avatar_url: Optional[str]
    bio: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserProfile(User):
    post_count: int = 0
    follower_count: int = 0
    following_count: int = 0


# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None


# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=50)
    slug: str = Field(..., max_length=50)
    description: Optional[str] = None
    icon: Optional[str] = None
    color: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class Category(CategoryBase):
    id: int
    order: int
    is_active: bool
    post_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True


# Post Schemas
class PostBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    category_id: Optional[int] = None
    images: Optional[List[str]] = None


class PostCreate(PostBase):
    pass


class PostUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = None
    category_id: Optional[int] = None
    images: Optional[List[str]] = None


class Post(PostBase):
    id: int
    author_id: int
    view_count: int
    is_pinned: bool
    is_locked: bool
    created_at: datetime
    updated_at: Optional[datetime]

    author: User
    category: Optional[Category]
    comment_count: int = 0
    like_count: int = 0
    is_liked: bool = False
    is_favorited: bool = False

    class Config:
        from_attributes = True


# Comment Schemas
class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)
    images: Optional[List[str]] = None


class CommentCreate(CommentBase):
    post_id: int
    parent_id: Optional[int] = None


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1)
    images: Optional[List[str]] = None


class Comment(CommentBase):
    id: int
    author_id: int
    post_id: int
    parent_id: Optional[int]
    created_at: datetime
    updated_at: Optional[datetime]

    author: User
    reply_count: int = 0

    class Config:
        from_attributes = True


# Event Schemas
class EventBase(BaseModel):
    title: str = Field(..., max_length=200)
    description: str
    location: str = Field(..., max_length=200)
    event_date: datetime
    max_attendees: Optional[int] = None
    image_url: Optional[str] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    location: Optional[str] = None
    event_date: Optional[datetime] = None
    max_attendees: Optional[int] = None
    image_url: Optional[str] = None


class Event(EventBase):
    id: int
    is_active: bool
    created_by: int
    created_at: datetime
    attendee_count: int = 0
    is_attending: bool = False

    class Config:
        from_attributes = True


# Notification Schemas
class NotificationBase(BaseModel):
    type: str
    content: str
    link: Optional[str] = None


class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


# Pagination
class PaginationParams(BaseModel):
    skip: int = 0
    limit: int = 20


class PaginatedResponse(BaseModel):
    total: int
    items: List
    skip: int
    limit: int
