"""
添加图片字段到 posts 和 comments 表的迁移脚本
"""
import sqlite3
import os
import sys

# 数据库路径
DB_PATH = os.path.join(os.path.dirname(__file__), "island_forum.db")

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        sys.exit(1)

    print(f"Migrating database: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # 检查 posts 表是否有 images 列
        cursor.execute("PRAGMA table_info(posts)")
        posts_columns = [col[1] for col in cursor.fetchall()]

        if 'images' not in posts_columns:
            print("Adding images column to posts table...")
            cursor.execute("ALTER TABLE posts ADD COLUMN images TEXT")
            print("Posts table migrated successfully")
        else:
            print("Posts table already has images column")

        # 检查 comments 表是否有 images 列
        cursor.execute("PRAGMA table_info(comments)")
        comments_columns = [col[1] for col in cursor.fetchall()]

        if 'images' not in comments_columns:
            print("Adding images column to comments table...")
            cursor.execute("ALTER TABLE comments ADD COLUMN images TEXT")
            print("Comments table migrated successfully")
        else:
            print("Comments table already has images column")

        conn.commit()
        print("\nDatabase migration completed successfully!")

    except Exception as e:
        conn.rollback()
        print(f"Migration failed: {e}")
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
