from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import func
import os
import sys

# 修復 Windows 終端機編碼問題
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8')
        os.environ['PYTHONIOENCODING'] = 'utf-8'
    except Exception:
        pass

from app.core.config import settings
from app.core.database import engine, get_db, SessionLocal
from app.models import Base, User, Post, Category
from app.api import api_router

# 創建數據庫表
Base.metadata.create_all(bind=engine)

# 創建 FastAPI 應用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Island Forum - 讓好奇心，有地方停靠"
)

# CORS 中間件
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 靜態文件
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# API 路由
app.include_router(api_router, prefix="/api")


@app.get("/")
def root():
    """根路由"""
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running"
    }


@app.get("/api/stats")
def get_stats():
    """獲取社群統計數據"""
    db = SessionLocal()
    try:
        total_users = db.query(func.count(User.id)).scalar()
        total_posts = db.query(func.count(Post.id)).filter(Post.is_deleted == False).scalar()
        total_categories = db.query(func.count(Category.id)).filter(Category.is_active == True).scalar()

        # TODO: 實現在線用戶統計（需要 Redis）
        online_users = 0

        return {
            "total_users": total_users,
            "total_posts": total_posts,
            "total_categories": total_categories,
            "online_users": online_users
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        db.close()


@app.on_event("startup")
async def startup_event():
    """應用啟動時執行"""
    print(f"🏝️  {settings.APP_NAME} v{settings.APP_VERSION} 啟動中...")
    print(f"📚 API 文檔: http://localhost:8000/docs")


@app.on_event("shutdown")
async def shutdown_event():
    """應用關閉時執行"""
    print(f"👋 {settings.APP_NAME} 已關閉")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
