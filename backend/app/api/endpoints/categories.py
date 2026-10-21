from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_admin
from app.models import Category, Post
from app.schemas import Category as CategorySchema, CategoryCreate

router = APIRouter()


@router.get("/", response_model=List[CategorySchema])
def get_categories(db: Session = Depends(get_db)):
    """獲取所有分類"""
    categories = db.query(Category).filter(Category.is_active == True).order_by(Category.order).all()

    result = []
    for category in categories:
        post_count = db.query(func.count(Post.id)).filter(
            Post.category_id == category.id,
            Post.is_deleted == False
        ).scalar()

        result.append({
            **category.__dict__,
            "post_count": post_count
        })

    return result


@router.post("/", response_model=CategorySchema, status_code=201)
def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """創建分類（管理員）"""
    # 檢查 slug 是否已存在
    existing = db.query(Category).filter(Category.slug == category_data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="分類標識已存在")

    db_category = Category(**category_data.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)

    return {
        **db_category.__dict__,
        "post_count": 0
    }


@router.get("/{category_id}", response_model=CategorySchema)
def get_category(category_id: int, db: Session = Depends(get_db)):
    """獲取分類詳情"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分類不存在")

    post_count = db.query(func.count(Post.id)).filter(
        Post.category_id == category_id,
        Post.is_deleted == False
    ).scalar()

    return {
        **category.__dict__,
        "post_count": post_count
    }


@router.delete("/{category_id}")
def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_admin)
):
    """刪除分類（管理員）"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分類不存在")

    # 檢查是否有帖子使用此分類
    post_count = db.query(func.count(Post.id)).filter(Post.category_id == category_id).scalar()
    if post_count > 0:
        raise HTTPException(status_code=400, detail="該分類下還有帖子，無法刪除")

    db.delete(category)
    db.commit()

    return {"message": "刪除成功"}
