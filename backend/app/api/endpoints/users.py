from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.core.database import get_db
from app.api.deps import get_current_user, get_optional_user
from app.models import User, Post, user_follows
from app.schemas import User as UserSchema, UserProfile, UserUpdate

router = APIRouter()


@router.get("/me", response_model=UserProfile)
def get_current_user_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """獲取當前用戶資料"""
    post_count = db.query(func.count(Post.id)).filter(Post.author_id == current_user.id).scalar()
    follower_count = db.query(func.count(user_follows.c.follower_id)).filter(
        user_follows.c.following_id == current_user.id
    ).scalar()
    following_count = db.query(func.count(user_follows.c.following_id)).filter(
        user_follows.c.follower_id == current_user.id
    ).scalar()

    return {
        **current_user.__dict__,
        "post_count": post_count,
        "follower_count": follower_count,
        "following_count": following_count
    }


@router.put("/me", response_model=UserSchema)
def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新當前用戶資料"""
    if user_data.display_name:
        current_user.display_name = user_data.display_name
    if user_data.bio is not None:
        current_user.bio = user_data.bio
    if user_data.avatar_url is not None:
        current_user.avatar_url = user_data.avatar_url

    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/{user_id}", response_model=UserProfile)
def get_user_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """獲取用戶資料"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用戶不存在")

    post_count = db.query(func.count(Post.id)).filter(Post.author_id == user_id).scalar()
    follower_count = db.query(func.count(user_follows.c.follower_id)).filter(
        user_follows.c.following_id == user_id
    ).scalar()
    following_count = db.query(func.count(user_follows.c.following_id)).filter(
        user_follows.c.follower_id == user_id
    ).scalar()

    return {
        **user.__dict__,
        "post_count": post_count,
        "follower_count": follower_count,
        "following_count": following_count
    }


@router.post("/{user_id}/follow")
def follow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """關注用戶"""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="不能關注自己")

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="用戶不存在")

    # 檢查是否已關注
    if target_user in current_user.following:
        raise HTTPException(status_code=400, detail="已經關注該用戶")

    current_user.following.append(target_user)
    db.commit()

    return {"message": "關注成功"}


@router.delete("/{user_id}/follow")
def unfollow_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取消關注用戶"""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="用戶不存在")

    # 檢查是否已關注
    if target_user not in current_user.following:
        raise HTTPException(status_code=400, detail="未關注該用戶")

    current_user.following.remove(target_user)
    db.commit()

    return {"message": "取消關注成功"}


@router.get("/{user_id}/followers", response_model=List[UserSchema])
def get_user_followers(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """獲取用戶的關注者列表"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用戶不存在")

    followers = user.followers[skip:skip + limit]
    return followers


@router.get("/{user_id}/following", response_model=List[UserSchema])
def get_user_following(
    user_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """獲取用戶關注的人列表"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="用戶不存在")

    following = user.following[skip:skip + limit]
    return following
