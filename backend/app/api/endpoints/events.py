from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_admin, get_optional_user
from app.models import Event, EventAttendee, User
from app.schemas import Event as EventSchema, EventCreate, EventUpdate

router = APIRouter()


@router.get("/", response_model=List[EventSchema])
def get_events(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    upcoming: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """獲取活動列表"""
    query = db.query(Event).filter(Event.is_active == True)

    if upcoming:
        # 只顯示未來的活動
        query = query.filter(Event.event_date >= datetime.utcnow())
        query = query.order_by(Event.event_date)
    else:
        # 顯示所有活動，按日期倒序
        query = query.order_by(desc(Event.event_date))

    events = query.offset(skip).limit(limit).all()

    result = []
    for event in events:
        attendee_count = db.query(func.count(EventAttendee.id)).filter(
            EventAttendee.event_id == event.id,
            EventAttendee.status == "confirmed"
        ).scalar()

        is_attending = False
        if current_user:
            is_attending = db.query(EventAttendee).filter(
                EventAttendee.event_id == event.id,
                EventAttendee.user_id == current_user.id,
                EventAttendee.status == "confirmed"
            ).first() is not None

        result.append({
            **event.__dict__,
            "attendee_count": attendee_count,
            "is_attending": is_attending
        })

    return result


@router.post("/", response_model=EventSchema, status_code=201)
def create_event(
    event_data: EventCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """創建活動（管理員）"""
    db_event = Event(
        **event_data.model_dump(),
        created_by=current_user.id
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)

    return {
        **db_event.__dict__,
        "attendee_count": 0,
        "is_attending": False
    }


@router.get("/{event_id}", response_model=EventSchema)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user)
):
    """獲取活動詳情"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="活動不存在")

    attendee_count = db.query(func.count(EventAttendee.id)).filter(
        EventAttendee.event_id == event_id,
        EventAttendee.status == "confirmed"
    ).scalar()

    is_attending = False
    if current_user:
        is_attending = db.query(EventAttendee).filter(
            EventAttendee.event_id == event_id,
            EventAttendee.user_id == current_user.id,
            EventAttendee.status == "confirmed"
        ).first() is not None

    return {
        **event.__dict__,
        "attendee_count": attendee_count,
        "is_attending": is_attending
    }


@router.put("/{event_id}", response_model=EventSchema)
def update_event(
    event_id: int,
    event_data: EventUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """更新活動（管理員）"""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="活動不存在")

    for field, value in event_data.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)

    attendee_count = db.query(func.count(EventAttendee.id)).filter(
        EventAttendee.event_id == event_id,
        EventAttendee.status == "confirmed"
    ).scalar()

    return {
        **event.__dict__,
        "attendee_count": attendee_count,
        "is_attending": False
    }


@router.post("/{event_id}/attend")
def attend_event(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """報名參加活動"""
    event = db.query(Event).filter(Event.id == event_id, Event.is_active == True).first()
    if not event:
        raise HTTPException(status_code=404, detail="活動不存在")

    # 檢查活動日期
    if event.event_date < datetime.utcnow():
        raise HTTPException(status_code=400, detail="活動已結束")

    # 檢查人數限制
    if event.max_attendees:
        attendee_count = db.query(func.count(EventAttendee.id)).filter(
            EventAttendee.event_id == event_id,
            EventAttendee.status == "confirmed"
        ).scalar()
        if attendee_count >= event.max_attendees:
            raise HTTPException(status_code=400, detail="活動已滿")

    # 檢查是否已報名
    existing = db.query(EventAttendee).filter(
        EventAttendee.event_id == event_id,
        EventAttendee.user_id == current_user.id
    ).first()

    if existing:
        if existing.status == "confirmed":
            raise HTTPException(status_code=400, detail="已經報名過了")
        else:
            existing.status = "confirmed"
    else:
        attendee = EventAttendee(
            event_id=event_id,
            user_id=current_user.id,
            status="confirmed"
        )
        db.add(attendee)

    db.commit()

    return {"message": "報名成功"}


@router.delete("/{event_id}/attend")
def cancel_attendance(
    event_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """取消報名"""
    attendee = db.query(EventAttendee).filter(
        EventAttendee.event_id == event_id,
        EventAttendee.user_id == current_user.id
    ).first()

    if not attendee or attendee.status != "confirmed":
        raise HTTPException(status_code=400, detail="未報名該活動")

    attendee.status = "cancelled"
    db.commit()

    return {"message": "取消報名成功"}
