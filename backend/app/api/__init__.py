from fastapi import APIRouter
from app.api.endpoints import auth, users, posts, comments, categories, events, notifications, upload

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["認證"])
api_router.include_router(users.router, prefix="/users", tags=["用戶"])
api_router.include_router(categories.router, prefix="/categories", tags=["分類"])
api_router.include_router(posts.router, prefix="/posts", tags=["帖子"])
api_router.include_router(comments.router, prefix="", tags=["評論"])
api_router.include_router(events.router, prefix="/events", tags=["活動"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["通知"])
api_router.include_router(upload.router, prefix="", tags=["文件上传"])
