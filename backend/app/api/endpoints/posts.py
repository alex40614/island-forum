from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, or_
from typing import List, Optional
import json
from app.core.database import get_db
from app.api.deps import get_current_user, get_optional_user
from app.models import Post, User, Comment, Category, user_likes, user_favorites
from app.schemas import Post as PostSchema, PostCreate, PostUpdate

router = APIRouter()


@router.get("/", response_model=List[PostSchema])
def get_posts(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    category_id: Optional[int] = None,
    sort: str = Query("latest", regex="^(latest|hot|featured)$"),
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """獲取帖子列表"""
    query = db.query(Post).filter(Post.is_deleted == False)

    # 按分類篩選
    if category_id:
        query = query.filter(Post.category_id == category_id)

    # 搜索
    if search:
        query = query.filter(
            or_(
                Post.title.ilike(f"%{search}%"),
                Post.content.ilike(f"%{search}%")
            )
        )

    # 排序
    if sort == "latest":
        query = query.order_by(desc(Post.created_at))
    elif sort == "hot":
        # 熱門：根據點贊數和評論數
        query = query.outerjoin(user_likes).group_by(Post.id).order_by(
            desc(func.count(user_likes.c.user_id) + Post.view_count / 10)
        )
    elif sort == "featured":
        # 精選：置頂優先，然後按創建時間
        query = query.order_by(desc(Post.is_pinned), desc(Post.created_at))

    posts = query.offset(skip).limit(limit).all()

    # 添加額外信息
    result = []
    for post in posts:
        comment_count = db.query(func.count(Comment.id)).filter(
            Comment.post_id == post.id, Comment.is_deleted == False
        ).scalar()
        like_count = db.query(func.count(user_likes.c.user_id)).filter(
            user_likes.c.post_id == post.id
        ).scalar()

        is_liked = False
        is_favorited = False
        if current_user:
            is_liked = db.query(user_likes).filter(
                user_likes.c.user_id == current_user.id,
                user_likes.c.post_id == post.id
            ).first() is not None
            is_favorited = db.query(user_favorites).filter(
                user_favorites.c.user_id == current_user.id,
                user_favorites.c.post_id == post.id
            ).first() is not None

        post_dict = {
            **post.__dict__,
            "images": json.loads(post.images) if post.images else [],
            "comment_count": comment_count,
            "like_count": like_count,
            "is_liked": is_liked,
            "is_favorited": is_favorited,
            "author": post.author,
            "category": post.category
        }
        result.append(post_dict)

    return result


@router.post("/", response_model=PostSchema, status_code=201)
def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """創建帖子"""
    db_post = Post(
        title=post_data.title,
        content=post_data.content,
        category_id=post_data.category_id,
        images=json.dumps(post_data.images) if post_data.images else None,
        author_id=current_user.id
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    return {
        **db_post.__dict__,
        "images": json.loads(db_post.images) if db_post.images else [],
        "comment_count": 0,
        "like_count": 0,
        "is_liked": False,
        "is_favorited": False,
        "author": current_user,
        "category": db_post.category
    }


@router.get("/{post_id}", response_model=PostSchema)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """獲取帖子詳情"""
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")

    # 增加瀏覽次數
    post.view_count += 1
    db.commit()

    comment_count = db.query(func.count(Comment.id)).filter(
        Comment.post_id == post_id, Comment.is_deleted == False
    ).scalar()
    like_count = db.query(func.count(user_likes.c.user_id)).filter(
        user_likes.c.post_id == post_id
    ).scalar()

    is_liked = False
    is_favorited = False
    if current_user:
        is_liked = db.query(user_likes).filter(
            user_likes.c.user_id == current_user.id,
            user_likes.c.post_id == post_id
        ).first() is not None
        is_favorited = db.query(user_favorites).filter(
            user_favorites.c.user_id == current_user.id,
            user_favorites.c.post_id == post_id
        ).first() is not None

    return {
        **post.__dict__,
        "comment_count": comment_count,
        "like_count": like_count,
        "is_liked": is_liked,
        "is_favorited": is_favorited,
        "author": post.author,
        "category": post.category
    }


@router.put("/{post_id}", response_model=PostSchema)
def update_post(
    post_id: int,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新帖子"""
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")

    if post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="沒有權限")

    if post_data.title:
        post.title = post_data.title
    if post_data.content:
        post.content = post_data.content
    if post_data.category_id is not None:
        post.category_id = post_data.category_id

    db.commit()
    db.refresh(post)

    comment_count = db.query(func.count(Comment.id)).filter(
        Comment.post_id == post_id, Comment.is_deleted == False
    ).scalar()
    like_count = db.query(func.count(user_likes.c.user_id)).filter(
        user_likes.c.post_id == post_id
    ).scalar()

    return {
        **post.__dict__,
        "comment_count": comment_count,
        "like_count": like_count,
        "is_liked": False,
        "is_favorited": False,
        "author": post.author,
        "category": post.category
    }


@router.delete("/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """刪除帖子"""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")

    if post.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="沒有權限")

    post.is_deleted = True
    db.commit()

    return {"message": "刪除成功"}


@router.post("/{post_id}/like")
async def like_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """點贊帖子"""
    from app.api.endpoints.notifications import create_notification

    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")

    # 檢查是否已點贊
    existing = db.query(user_likes).filter(
        user_likes.c.user_id == current_user.id,
        user_likes.c.post_id == post_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="已經點贊過了")

    db.execute(user_likes.insert().values(user_id=current_user.id, post_id=post_id))
    db.commit()

    # 發送通知給帖子作者
    if post.author_id != current_user.id:
        await create_notification(
            db=db,
            user_id=post.author_id,
            notification_type="like",
            content=f"{current_user.display_name} 贊了你的帖子「{post.title}」",
            link=f"/posts/{post_id}"
        )

    return {"message": "點贊成功"}


@router.delete("/{post_id}/like")
def unlike_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取消點贊"""
    result = db.execute(
        user_likes.delete().where(
            user_likes.c.user_id == current_user.id,
            user_likes.c.post_id == post_id
        )
    )
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=400, detail="未點贊過")

    return {"message": "取消點贊成功"}


@router.post("/{post_id}/favorite")
def favorite_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """收藏帖子"""
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")

    # 檢查是否已收藏
    existing = db.query(user_favorites).filter(
        user_favorites.c.user_id == current_user.id,
        user_favorites.c.post_id == post_id
    ).first()

    if existing:
        raise HTTPException(status_code=400, detail="已經收藏過了")

    db.execute(user_favorites.insert().values(user_id=current_user.id, post_id=post_id))
    db.commit()

    return {"message": "收藏成功"}


@router.delete("/{post_id}/favorite")
def unfavorite_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取消收藏"""
    result = db.execute(
        user_favorites.delete().where(
            user_favorites.c.user_id == current_user.id,
            user_favorites.c.post_id == post_id
        )
    )
    db.commit()

    if result.rowcount == 0:
        raise HTTPException(status_code=400, detail="未收藏過")

    return {"message": "取消收藏成功"}
