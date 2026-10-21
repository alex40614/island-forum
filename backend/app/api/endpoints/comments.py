from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import json
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models import Comment, Post, User
from app.schemas import Comment as CommentSchema, CommentCreate, CommentUpdate

router = APIRouter()


@router.get("/posts/{post_id}/comments", response_model=List[CommentSchema])
def get_post_comments(
    post_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """獲取帖子的評論列表"""
    # 檢查帖子是否存在
    post = db.query(Post).filter(Post.id == post_id, Post.is_deleted == False).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")

    # 獲取頂層評論（沒有父評論的）
    comments = db.query(Comment).filter(
        Comment.post_id == post_id,
        Comment.parent_id == None,
        Comment.is_deleted == False
    ).order_by(desc(Comment.created_at)).offset(skip).limit(limit).all()

    # 為每個評論添加回覆數量
    result = []
    for comment in comments:
        reply_count = db.query(Comment).filter(
            Comment.parent_id == comment.id,
            Comment.is_deleted == False
        ).count()

        result.append({
            **comment.__dict__,
            "images": json.loads(comment.images) if comment.images else [],
            "reply_count": reply_count,
            "author": comment.author
        })

    return result


@router.get("/comments/{comment_id}/replies", response_model=List[CommentSchema])
def get_comment_replies(
    comment_id: int,
    db: Session = Depends(get_db)
):
    """獲取評論的回覆"""
    # 檢查評論是否存在
    parent_comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.is_deleted == False
    ).first()
    if not parent_comment:
        raise HTTPException(status_code=404, detail="評論不存在")

    # 獲取回覆
    replies = db.query(Comment).filter(
        Comment.parent_id == comment_id,
        Comment.is_deleted == False
    ).order_by(Comment.created_at).all()

    result = []
    for reply in replies:
        result.append({
            **reply.__dict__,
            "reply_count": 0,
            "author": reply.author
        })

    return result


@router.post("/comments", response_model=CommentSchema, status_code=201)
async def create_comment(
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """創建評論"""
    from app.api.endpoints.notifications import create_notification

    # 檢查帖子是否存在
    post = db.query(Post).filter(
        Post.id == comment_data.post_id,
        Post.is_deleted == False
    ).first()
    if not post:
        raise HTTPException(status_code=404, detail="帖子不存在")

    # 如果是回覆，檢查父評論是否存在
    parent_author_id = None
    if comment_data.parent_id:
        parent_comment = db.query(Comment).filter(
            Comment.id == comment_data.parent_id,
            Comment.is_deleted == False
        ).first()
        if not parent_comment:
            raise HTTPException(status_code=404, detail="父評論不存在")
        parent_author_id = parent_comment.author_id

    # 創建評論
    db_comment = Comment(
        content=comment_data.content,
        images=json.dumps(comment_data.images) if comment_data.images else None,
        author_id=current_user.id,
        post_id=comment_data.post_id,
        parent_id=comment_data.parent_id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)

    # 發送通知
    # 如果是回覆評論，通知被回覆的用戶
    if parent_author_id and parent_author_id != current_user.id:
        await create_notification(
            db=db,
            user_id=parent_author_id,
            notification_type="reply",
            content=f"{current_user.display_name} 回覆了你的評論",
            link=f"/posts/{comment_data.post_id}"
        )
    # 否則通知帖子作者
    elif post.author_id != current_user.id:
        await create_notification(
            db=db,
            user_id=post.author_id,
            notification_type="comment",
            content=f"{current_user.display_name} 評論了你的帖子「{post.title}」",
            link=f"/posts/{comment_data.post_id}"
        )

    return {
        **db_comment.__dict__,
        "reply_count": 0,
        "author": current_user
    }


@router.put("/comments/{comment_id}", response_model=CommentSchema)
def update_comment(
    comment_id: int,
    comment_data: CommentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新評論"""
    comment = db.query(Comment).filter(
        Comment.id == comment_id,
        Comment.is_deleted == False
    ).first()
    if not comment:
        raise HTTPException(status_code=404, detail="評論不存在")

    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="沒有權限")

    comment.content = comment_data.content
    db.commit()
    db.refresh(comment)

    reply_count = db.query(Comment).filter(
        Comment.parent_id == comment_id,
        Comment.is_deleted == False
    ).count()

    return {
        **comment.__dict__,
        "reply_count": reply_count,
        "author": comment.author
    }


@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """刪除評論"""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="評論不存在")

    if comment.author_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="沒有權限")

    comment.is_deleted = True
    db.commit()

    return {"message": "刪除成功"}
