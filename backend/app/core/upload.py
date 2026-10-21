"""
文件上传配置和工具函数
"""
import os
import uuid
from pathlib import Path
from typing import Optional
from PIL import Image
from fastapi import UploadFile, HTTPException

# 上传配置
UPLOAD_DIR = Path("uploads")
AVATAR_DIR = UPLOAD_DIR / "avatars"
POST_IMAGE_DIR = UPLOAD_DIR / "posts"

# 允许的图片格式
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

# 文件大小限制 (bytes)
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
MAX_AVATAR_SIZE = 2 * 1024 * 1024  # 2MB

# 图片尺寸限制
MAX_IMAGE_WIDTH = 2000
MAX_IMAGE_HEIGHT = 2000
AVATAR_SIZE = (200, 200)  # 头像尺寸


def init_upload_dirs():
    """初始化上传目录"""
    UPLOAD_DIR.mkdir(exist_ok=True)
    AVATAR_DIR.mkdir(exist_ok=True)
    POST_IMAGE_DIR.mkdir(exist_ok=True)


def get_file_extension(filename: str) -> str:
    """获取文件扩展名"""
    return Path(filename).suffix.lower()


def validate_image(file: UploadFile, max_size: int = MAX_FILE_SIZE) -> None:
    """验证上传的图片文件"""
    # 检查文件扩展名
    ext = get_file_extension(file.filename or "")
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"不支持的文件格式。允许的格式: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # 检查文件大小
    file.file.seek(0, 2)  # 移动到文件末尾
    file_size = file.file.tell()
    file.file.seek(0)  # 重置到开头

    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"文件太大。最大允许 {max_size / (1024 * 1024):.1f}MB"
        )


def generate_filename(original_filename: str) -> str:
    """生成唯一的文件名"""
    ext = get_file_extension(original_filename)
    return f"{uuid.uuid4()}{ext}"


async def save_upload_file(file: UploadFile, destination: Path) -> str:
    """保存上传的文件"""
    try:
        content = await file.read()
        with open(destination, "wb") as f:
            f.write(content)
        return str(destination)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件保存失败: {str(e)}")


def resize_image(image_path: Path, max_width: int, max_height: int) -> None:
    """调整图片尺寸"""
    try:
        with Image.open(image_path) as img:
            # 转换 RGBA 到 RGB (for JPEG)
            if img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background

            # 计算新尺寸（保持宽高比）
            img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)

            # 保存优化后的图片
            img.save(image_path, optimize=True, quality=85)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"图片处理失败: {str(e)}")


def create_avatar_thumbnail(image_path: Path) -> None:
    """创建头像缩略图（正方形裁剪）"""
    try:
        with Image.open(image_path) as img:
            # 转换到 RGB
            if img.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", img.size, (255, 255, 255))
                if img.mode == "P":
                    img = img.convert("RGBA")
                background.paste(img, mask=img.split()[-1] if img.mode == "RGBA" else None)
                img = background

            # 裁剪为正方形
            width, height = img.size
            size = min(width, height)
            left = (width - size) // 2
            top = (height - size) // 2
            right = left + size
            bottom = top + size
            img = img.crop((left, top, right, bottom))

            # 调整到目标尺寸
            img = img.resize(AVATAR_SIZE, Image.Resampling.LANCZOS)

            # 保存
            img.save(image_path, optimize=True, quality=90)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"头像处理失败: {str(e)}")


def delete_file(file_path: str) -> None:
    """删除文件"""
    try:
        path = Path(file_path)
        if path.exists():
            path.unlink()
    except Exception:
        pass  # 忽略删除错误
