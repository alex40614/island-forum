"""
種子數據腳本 - 初始化分類和測試數據
運行方式: python -m backend.seed_data
"""
import sys
import os
from pathlib import Path

# 修復 Windows 編碼問題
if sys.platform == "win32":
    try:
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(encoding='utf-8')
        os.environ['PYTHONIOENCODING'] = 'utf-8'
    except Exception:
        pass

# 添加項目根目錄到 Python 路徑
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.core.database import engine, SessionLocal
from app.core.security import get_password_hash
from app.models import Base, User, Category, Post, Comment


def init_categories(db: Session):
    """初始化分類數據"""
    categories_data = [
        {
            "name": "技術討論",
            "slug": "tech",
            "description": "程式開發、工具、框架相關討論",
            "icon": "💻",
            "color": "#22d3ee",
            "order": 1
        },
        {
            "name": "生活分享",
            "slug": "life",
            "description": "日常生活、興趣愛好、經驗分享",
            "icon": "🌟",
            "color": "#f59e0b",
            "order": 2
        },
        {
            "name": "問答求助",
            "slug": "qa",
            "description": "遇到問題？來這裡提問",
            "icon": "❓",
            "color": "#8b5cf6",
            "order": 3
        },
        {
            "name": "創意想法",
            "slug": "ideas",
            "description": "腦洞大開、創意點子分享",
            "icon": "💡",
            "color": "#facc15",
            "order": 4
        },
        {
            "name": "藝術設計",
            "slug": "art",
            "description": "設計作品、攝影、繪畫分享",
            "icon": "🎨",
            "color": "#ec4899",
            "order": 5
        },
        {
            "name": "閱讀書影",
            "slug": "books-movies",
            "description": "書籍、電影、音樂推薦與討論",
            "icon": "📚",
            "color": "#06b6d4",
            "order": 6
        }
    ]

    for cat_data in categories_data:
        existing = db.query(Category).filter(Category.slug == cat_data["slug"]).first()
        if not existing:
            category = Category(**cat_data)
            db.add(category)
            print(f"✓ 創建分類: {cat_data['name']}")
        else:
            print(f"- 分類已存在: {cat_data['name']}")

    db.commit()


def init_test_user(db: Session):
    """創建測試用戶"""
    test_users = [
        {
            "username": "admin",
            "email": "admin@island.com",
            "display_name": "管理員",
            "password": "admin123",
            "is_admin": True,
            "bio": "Island Forum 管理員"
        },
        {
            "username": "testuser",
            "email": "test@island.com",
            "display_name": "測試用戶",
            "password": "test123",
            "is_admin": False,
            "bio": "這是一個測試用戶帳號"
        }
    ]

    for user_data in test_users:
        try:
            existing = db.query(User).filter(User.username == user_data["username"]).first()
            if not existing:
                password = user_data["password"]  # 不要 pop，保留原數據
                # 確保密碼不超過 bcrypt 的 72 字節限制
                password = password[:72]
                print(f"  正在為用戶 {user_data['username']} 生成密碼哈希...")
                hashed_password = get_password_hash(password)
                print(f"  密碼哈希生成成功")

                # 創建新字典，避免修改原數據
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    display_name=user_data["display_name"],
                    is_admin=user_data["is_admin"],
                    bio=user_data["bio"],
                    hashed_password=hashed_password
                )
                db.add(user)
                db.flush()  # 立即刷新到數據庫
                print(f"✓ 創建用戶: {user_data['username']}")
            else:
                print(f"- 用戶已存在: {user_data['username']}")
        except Exception as e:
            print(f"❌ 創建用戶 {user_data['username']} 失敗: {e}")
            import traceback
            traceback.print_exc()

    db.commit()


def init_test_posts(db: Session):
    """創建測試帖子"""
    admin = db.query(User).filter(User.username == "admin").first()
    testuser = db.query(User).filter(User.username == "testuser").first()

    if not admin or not testuser:
        print("! 需要先創建測試用戶")
        return

    tech_cat = db.query(Category).filter(Category.slug == "tech").first()
    life_cat = db.query(Category).filter(Category.slug == "life").first()

    test_posts = [
        {
            "title": "歡迎來到 Island Forum！",
            "content": """大家好！歡迎來到 Island Forum 🏝️

這是一個開放、友善的中文社群論壇，我們鼓勵：
- 真誠的交流和分享
- 多元的觀點和想法
- 互相尊重和包容

期待在這裡與你相遇！""",
            "author_id": admin.id,
            "category_id": life_cat.id if life_cat else None,
            "is_pinned": True
        },
        {
            "title": "FastAPI + React 開發論壇的心得分享",
            "content": """最近用 FastAPI + React + Tailwind CSS 開發了這個論壇平台，想分享一些心得：

**後端技術棧：**
- FastAPI：現代、高效能的 Python Web 框架
- PostgreSQL：可靠的關係型數據庫
- SQLAlchemy：強大的 ORM
- JWT：安全的用戶認證

**前端技術棧：**
- React 18 + TypeScript：類型安全的開發體驗
- Vite：極速的開發服務器
- Tailwind CSS：快速構建美觀界面
- React Query：優雅的數據同步

整體開發體驗非常流暢，推薦給想做類似專案的朋友！""",
            "author_id": admin.id,
            "category_id": tech_cat.id if tech_cat else None
        },
        {
            "title": "島嶼論壇使用指南",
            "content": """👋 新來的朋友看這裡！

**如何開始：**
1. 註冊帳號（只需要用戶名、郵箱）
2. 探索不同的分類版塊
3. 發起你的第一個討論
4. 回覆感興趣的話題

**社群規則：**
- 保持友善和尊重
- 避免垃圾訊息
- 尊重原創內容
- 理性討論，避免人身攻擊

有任何問題歡迎在這裡留言！""",
            "author_id": testuser.id,
            "category_id": life_cat.id if life_cat else None
        }
    ]

    for post_data in test_posts:
        existing = db.query(Post).filter(Post.title == post_data["title"]).first()
        if not existing:
            post = Post(**post_data)
            db.add(post)
            print(f"✓ 創建帖子: {post_data['title']}")
        else:
            print(f"- 帖子已存在: {post_data['title']}")

    db.commit()


def init_test_comments(db: Session):
    """創建測試評論"""
    admin = db.query(User).filter(User.username == "admin").first()
    testuser = db.query(User).filter(User.username == "testuser").first()

    if not admin or not testuser:
        print("! 需要先創建測試用戶")
        return

    welcome_post = db.query(Post).filter(Post.title == "歡迎來到 Island Forum！").first()

    if not welcome_post:
        print("! 需要先創建測試帖子")
        return

    test_comments = [
        {
            "content": "感謝管理員！這個論壇設計得很漂亮 ✨",
            "author_id": testuser.id,
            "post_id": welcome_post.id,
            "parent_id": None
        },
        {
            "content": "謝謝支持！我們會持續改進的 😊",
            "author_id": admin.id,
            "post_id": welcome_post.id,
            "parent_id": None
        }
    ]

    for comment_data in test_comments:
        existing = db.query(Comment).filter(
            Comment.content == comment_data["content"],
            Comment.post_id == comment_data["post_id"]
        ).first()
        if not existing:
            comment = Comment(**comment_data)
            db.add(comment)
            print(f"✓ 創建評論")
        else:
            print(f"- 評論已存在")

    db.commit()


def main():
    """主函數"""
    print("🌱 開始初始化種子數據...")
    print("=" * 60)

    # 創建數據庫表
    print("\n📦 創建數據庫表...")
    Base.metadata.create_all(bind=engine)
    print("✓ 數據庫表創建完成")

    # 創建數據庫會話
    db = SessionLocal()

    try:
        print("\n📁 初始化分類...")
        init_categories(db)

        print("\n👤 初始化測試用戶...")
        init_test_user(db)

        print("\n📝 初始化測試帖子...")
        init_test_posts(db)

        print("\n💬 初始化測試評論...")
        init_test_comments(db)

        print("\n" + "=" * 60)
        print("✅ 種子數據初始化完成！")
        print("\n測試帳號：")
        print("  管理員: admin / admin123")
        print("  普通用戶: testuser / test123")

    except Exception as e:
        print(f"\n❌ 錯誤: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
