# Island Forum (島嶼論壇)

> 讓好奇心，有地方停靠

一個現代化的中文社群論壇平台，強調高質量對話和真誠連結。

## 功能特色

- 🏝️ **主題討論** - 按興趣組織的討論版塊
- 💬 **即時互動** - WebSocket 實時通知和在線狀態
- 🔍 **智能搜索** - 全文搜索，支持快捷鍵 ⌘K
- ⭐ **個性化收藏** - 收藏喜歡的討論和用戶
- 📊 **數據統計** - 實時社群數據儀表板
- 🎯 **活動管理** - 線下聚會組織和報名
- 📱 **響應式設計** - 完美支持桌面和移動端

## 技術棧

### 後端
- FastAPI - 現代 Python Web 框架
- PostgreSQL - 主數據庫
- Redis - 緩存和會話管理
- SQLAlchemy - ORM
- Alembic - 數據庫遷移
- WebSocket - 實時通信

### 前端
- React 18 + TypeScript
- Vite - 構建工具
- Tailwind CSS - UI 框架
- React Query - 數據同步
- Zustand - 狀態管理
- React Router - 路由管理

## 快速開始

### 環境要求

- Python 3.12+
- Node.js 18+
- PostgreSQL 14+
- Redis 6+

### 後端安裝

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# 編輯 .env 設置數據庫連接

# 運行數據庫遷移
alembic upgrade head

# 啟動開發服務器
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 前端安裝

```bash
cd frontend
npm install
npm run dev
```

訪問 http://localhost:5173

## 項目結構

```
island-forum/
├── backend/                 # FastAPI 後端
│   ├── app/
│   │   ├── api/            # API 路由
│   │   ├── core/           # 核心配置
│   │   ├── models/         # 數據模型
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # 業務邏輯
│   │   └── utils/          # 工具函數
│   ├── alembic/            # 數據庫遷移
│   ├── tests/              # 測試
│   └── main.py             # 應用入口
├── frontend/               # React 前端
│   ├── src/
│   │   ├── components/     # React 組件
│   │   ├── pages/          # 頁面組件
│   │   ├── hooks/          # 自定義 hooks
│   │   ├── store/          # 狀態管理
│   │   ├── api/            # API 客戶端
│   │   └── utils/          # 工具函數
│   └── public/             # 靜態資源
└── docker-compose.yml      # Docker 編排
```

## 開發指南

### API 文檔

啟動後端後訪問：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 數據庫遷移

```bash
# 創建新遷移
alembic revision --autogenerate -m "描述"

# 執行遷移
alembic upgrade head

# 回滾
alembic downgrade -1
```

## 部署

### Docker 部署

```bash
docker-compose up -d
```

### Railway 部署

項目已配置 `railway.json`，可直接部署到 Railway。

### Render 部署

項目已配置 `render.yaml`，可直接部署到 Render。

## 環境變量

```env
# 數據庫
DATABASE_URL=postgresql://user:password@localhost:5432/island_forum
REDIS_URL=redis://localhost:6379/0

# JWT 安全
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# 文件上傳
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760  # 10MB
```

## 授權

MIT License

## 作者

© 2026 ISLAND Community
