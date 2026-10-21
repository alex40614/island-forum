# Island Forum 快速啟動指南

## 當前進度 ✅

Island Forum 已完成核心功能開發：

### 後端功能 (FastAPI)
- ✅ 用戶註冊/登錄/認證 (JWT)
- ✅ 帖子 CRUD（創建、讀取、更新、刪除）
- ✅ 評論系統（支持嵌套回覆）
- ✅ 點贊和收藏功能
- ✅ 分類管理
- ✅ 統計數據 API
- ✅ 搜索功能

### 前端功能 (React + TypeScript)
- ✅ 首頁展示（熱門/最新討論）
- ✅ 用戶登錄/註冊頁面
- ✅ 討論詳情頁（含評論）
- ✅ 創建討論頁面
- ✅ 響應式導航欄
- ✅ 深色主題設計
- ✅ 個人資料頁面
- ✅ 搜索頁面
- ✅ 分類頁面
- ✅ 管理員後台

### 待完成功能 📝
- ⏳ 活動管理功能
- ⏳ 通知系統
- ⏳ 用戶關注功能

---

## 快速啟動

### 1. 環境要求
```bash
# 後端
Python 3.12+
PostgreSQL 14+
Redis 6+ (可選)

# 前端
Node.js 18+
npm 或 yarn
```

### 2. 後端設置

```bash
cd backend

# 安裝依賴
pip install -r requirements.txt

# 配置環境變量
cp .env.example .env
# 編輯 .env 設置數據庫連接：
# DATABASE_URL=postgresql://username:password@localhost:5432/island_forum
# SECRET_KEY=your-secret-key-here

# 初始化數據庫和種子數據
python seed_data.py

# 啟動後端服務
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

後端將運行在 http://localhost:8000

API 文檔：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 3. 前端設置

```bash
cd frontend

# 安裝依賴
npm install

# 配置環境變量
cp .env.example .env
# 編輯 .env：
# VITE_API_URL=http://localhost:8000/api

# 啟動開發服務器
npm run dev
```

前端將運行在 http://localhost:5173

### 4. 測試帳號

種子數據已創建以下測試帳號：

**管理員帳號：**
- 用戶名: `admin`
- 密碼: `admin123`

**普通用戶：**
- 用戶名: `testuser`
- 密碼: `test123`

---

## 項目結構

```
island-forum/
├── backend/                 # FastAPI 後端
│   ├── app/
│   │   ├── api/            # API 路由
│   │   │   ├── endpoints/  # 各功能模塊的端點
│   │   │   │   ├── auth.py        # 認證 API
│   │   │   │   ├── users.py       # 用戶 API
│   │   │   │   ├── posts.py       # 帖子 API
│   │   │   │   ├── comments.py    # 評論 API
│   │   │   │   ├── categories.py  # 分類 API
│   │   │   │   └── events.py      # 活動 API
│   │   │   ├── deps.py     # 依賴注入
│   │   │   └── __init__.py
│   │   ├── core/           # 核心配置
│   │   │   ├── config.py   # 應用配置
│   │   │   ├── database.py # 數據庫連接
│   │   │   └── security.py # 安全相關（JWT、密碼哈希）
│   │   ├── models/         # SQLAlchemy 數據模型
│   │   │   └── __init__.py # User, Post, Comment, Category 等
│   │   ├── schemas/        # Pydantic schemas
│   │   │   └── __init__.py # 請求/響應模型
│   │   └── utils/          # 工具函數
│   ├── seed_data.py        # 種子數據腳本 ⭐
│   ├── main.py             # FastAPI 應用入口
│   └── requirements.txt    # Python 依賴
│
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # React 組件
│   │   │   └── layout/     # 佈局組件
│   │   │       ├── Header.tsx      # 頂部導航欄
│   │   │       ├── Footer.tsx      # 底部
│   │   │       └── MainLayout.tsx  # 主佈局
│   │   ├── pages/          # 頁面組件
│   │   │   ├── HomePage.tsx        # 首頁 ✅
│   │   │   ├── LoginPage.tsx       # 登錄頁 ✅
│   │   │   ├── RegisterPage.tsx    # 註冊頁 ✅
│   │   │   ├── PostDetailPage.tsx  # 討論詳情頁 ✅
│   │   │   ├── CreatePostPage.tsx  # 創建討論頁 ✅
│   │   │   ├── UserProfilePage.tsx # 個人資料頁 ✅
│   │   │   ├── SearchPage.tsx      # 搜索頁 ✅
│   │   │   ├── CategoryPage.tsx    # 分類頁 ✅
│   │   │   └── AdminPage.tsx       # 管理員後台 ✅
│   │   ├── store/          # Zustand 狀態管理
│   │   │   └── authStore.ts        # 認證狀態
│   │   ├── api/            # API 客戶端
│   │   │   ├── client.ts   # Axios 配置
│   │   │   └── index.ts    # API 函數
│   │   ├── types/          # TypeScript 類型
│   │   │   └── index.ts
│   │   ├── utils/          # 工具函數
│   │   │   └── helpers.ts
│   │   ├── App.tsx         # 應用主組件
│   │   ├── main.tsx        # 入口文件
│   │   └── index.css       # 全局樣式
│   ├── package.json
│   └── vite.config.ts
│
├── README.md               # 項目說明
├── QUICKSTART.md           # 本文件 ⭐
└── docker-compose.yml      # Docker 編排
```

---

## 開發指南

### 添加新的 API 端點

1. 在 `backend/app/api/endpoints/` 創建或修改端點文件
2. 在 `backend/app/api/__init__.py` 中註冊路由
3. 更新 `frontend/src/api/index.ts` 添加對應的客戶端函數

### 添加新頁面

1. 在 `frontend/src/pages/` 創建頁面組件
2. 在 `frontend/src/App.tsx` 添加路由
3. 在需要的地方添加導航鏈接

### 數據庫遷移 (Alembic)

```bash
cd backend

# 創建新遷移
alembic revision --autogenerate -m "描述變更"

# 執行遷移
alembic upgrade head

# 回滾
alembic downgrade -1
```

---

## 部署建議

### Railway 部署
1. 連接 GitHub 倉庫
2. 添加 PostgreSQL 插件
3. 設置環境變量
4. Railway 會自動檢測並部署

### Render 部署
1. 創建 Web Service (後端)
2. 創建 Static Site (前端)
3. 添加 PostgreSQL 數據庫
4. 配置環境變量

### Docker 部署
```bash
docker-compose up -d
```

---

## 常見問題

### Q: 無法連接到數據庫
A: 檢查 `DATABASE_URL` 環境變量是否正確，確保 PostgreSQL 服務已啟動。

### Q: 前端無法調用 API
A: 檢查 CORS 配置，確保 `ALLOWED_ORIGINS` 包含前端地址。

### Q: JWT token 無效
A: 檢查 `SECRET_KEY` 是否一致，清除瀏覽器緩存重新登錄。

---

## 技術棧詳情

### 後端
- **FastAPI** - 現代高效能 Python Web 框架
- **PostgreSQL** - 可靠的關係型數據庫
- **SQLAlchemy** - 強大的 ORM
- **Alembic** - 數據庫遷移工具
- **JWT** - 無狀態認證
- **Pydantic** - 數據驗證

### 前端
- **React 18** - UI 框架
- **TypeScript** - 類型安全
- **Vite** - 極速構建工具
- **Tailwind CSS** - 實用優先的 CSS 框架
- **React Query** - 數據同步和緩存
- **Zustand** - 輕量級狀態管理
- **React Router** - 客戶端路由
- **Axios** - HTTP 客戶端

### 設計系統
- 深色主題（slate 色系）
- cyan (#22d3ee) 作為主要強調色
- orange (#f59e0b) 作為輔助動作色
- 無障礙設計標準
- 響應式佈局

---

## 下一步建議

1. **實現通知系統** - WebSocket 實時通知新評論、點贊
2. **添加用戶關注功能** - 關注用戶、查看關注者動態
3. **活動管理** - 創建和管理線上線下活動
4. **優化性能** - 添加分頁、虛擬滾動、圖片懶加載
5. **增強安全** - 內容審核、防垃圾機制、驗證碼
6. **移動端優化** - PWA 支持、離線模式

---

## 貢獻指南

歡迎提交 Issue 和 Pull Request！

開發規範：
- Python: 遵循 PEP 8
- TypeScript: 遵循 ESLint 配置
- Git Commit: 使用語義化提交訊息

---

## 授權

MIT License

---

**享受開發！** 🏝️
