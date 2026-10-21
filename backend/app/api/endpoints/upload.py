"""
文件上传 API 端点
"""
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pathlib import Path

from app.core.database import get_db
from app.api.deps import get_current_user
from app.models import User
from app.core.upload import (
    init_upload_dirs,
    validate_image,
    generate_filename,
    save_upload_file,
    resize_image,
    create_avatar_thumbnail,
    delete_file,
    AVATAR_DIR,
    POST_IMAGE_DIR,
    MAX_AVATAR_SIZE,
    MAX_FILE_SIZE,
    MAX_IMAGE_WIDTH,
    MAX_IMAGE_HEIGHT,
)

router = APIRouter()

# 初始化上传目录
init_upload_dirs()


@router.post("/upload/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    上传用户头像
    """
    # 验证图片
    validate_image(file, max_size=MAX_AVATAR_SIZE)

    # 生成文件名
    filename = generate_filename(file.filename or "avatar.jpg")
    file_path = AVATAR_DIR / filename

    # 保存文件
    await save_upload_file(file, file_path)

    # 处理头像（裁剪为正方形）
    create_avatar_thumbnail(file_path)

    # 删除旧头像
    if current_user.avatar_url and current_user.avatar_url.startswith("/uploads/"):
        old_path = Path(current_user.avatar_url.lstrip("/"))
        delete_file(str(old_path))

    # 更新用户头像 URL
    avatar_url = f"/uploads/avatars/{filename}"
    current_user.avatar_url = avatar_url
    db.commit()

    return {
        "message": "头像上传成功",
        "avatar_url": avatar_url
    }


@router.post("/upload/post-image")
async def upload_post_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    上传帖子图片
    """
    # 验证图片
    validate_image(file, max_size=MAX_FILE_SIZE)

    # 生成文件名
    filename = generate_filename(file.filename or "image.jpg")
    file_path = POST_IMAGE_DIR / filename

    # 保存文件
    await save_upload_file(file, file_path)

    # 调整图片尺寸
    resize_image(file_path, MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT)

    # 返回图片 URL
    image_url = f"/uploads/posts/{filename}"

    return {
        "message": "图片上传成功",
        "image_url": image_url
    }


@router.delete("/upload/{file_type}/{filename}")
async def delete_uploaded_file(
    file_type: str,
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """
    删除已上传的文件
    file_type: 'avatars' 或 'posts'
    """
    if file_type not in ["avatars", "posts"]:
        raise HTTPException(status_code=400, detail="无效的文件类型")

    file_path = Path(f"uploads/{file_type}/{filename}")

    if not file_path.exists():
        raise HTTPException(status_code=404, detail="文件不存在")

    # 只允许删除自己的头像，或者管理员可以删除任何文件
    if file_type == "avatars" and not current_user.is_admin:
        if current_user.avatar_url != f"/uploads/avatars/{filename}":
            raise HTTPException(status_code=403, detail="无权删除此文件")

    delete_file(str(file_path))

    return {"message": "文件删除成功"}
