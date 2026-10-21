"""通知相关 API 端点"""
from typing import List
from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models import User, Notification
from app.schemas import NotificationResponse
import json

router = APIRouter()


class ConnectionManager:
    """WebSocket 连接管理器"""
    def __init__(self):
        self.active_connections: dict[int, WebSocket] = {}

    async def connect(self, user_id: int, websocket: WebSocket):
        """建立连接"""
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        """断开连接"""
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_personal_message(self, user_id: int, message: dict):
        """发送个人消息"""
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_text(json.dumps(message))
            except:
                self.disconnect(user_id)

    async def broadcast(self, message: dict):
        """广播消息给所有在线用户"""
        for user_id in list(self.active_connections.keys()):
            await self.send_personal_message(user_id, message)


# 全局连接管理器
manager = ConnectionManager()


@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    """WebSocket 端点"""
    await manager.connect(user_id, websocket)
    try:
        while True:
            # 保持连接，接收心跳消息
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        manager.disconnect(user_id)


@router.get("/", response_model=List[NotificationResponse])
def get_notifications(
    skip: int = 0,
    limit: int = 50,
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取当前用户的通知列表"""
    query = db.query(Notification).filter(Notification.user_id == current_user.id)

    if unread_only:
        query = query.filter(Notification.is_read == False)

    notifications = query.order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    return notifications


@router.get("/unread-count")
def get_unread_count(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取未读通知数量"""
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    return {"count": count}


@router.post("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """标记通知为已读"""
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()

    if notification:
        notification.is_read = True
        db.commit()
        return {"message": "已标记为已读"}

    return {"message": "通知不存在"}


@router.post("/read-all")
def mark_all_as_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """标记所有通知为已读"""
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "所有通知已标记为已读"}


async def create_notification(
    db: Session,
    user_id: int,
    notification_type: str,
    content: str,
    link: str = None
):
    """创建通知并通过 WebSocket 发送"""
    notification = Notification(
        user_id=user_id,
        type=notification_type,
        content=content,
        link=link
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)

    # 通过 WebSocket 发送实时通知
    await manager.send_personal_message(user_id, {
        "id": notification.id,
        "type": notification_type,
        "content": content,
        "link": link,
        "created_at": notification.created_at.isoformat()
    })

    return notification
