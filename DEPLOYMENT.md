# Island Forum - 完整部署指南

## 🚀 快速開始

### 後端啟動

```bash
cd backend

# 1. 創建虛擬環境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 安裝依賴
pip install -r requirements.txt

# 3. 配置環境變量
cp .env.example .env
# 編輯 .env 文件，設置你的配置

# 4. 初始化數據庫
alembic upgrade head

# 5. 創建初始數據（可選）
python scripts/seed_data.py

# 6. 啟動服務器
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

後端服務將運行在 `http://localhost:8000`

### 前端啟動

```bash
cd frontend

# 1. 安裝依賴
npm install

# 2. 配置環境變量
cp .env.example .env
# 確保 VITE_API_URL 指向後端地址

# 3. 啟動開發服務器
npm run dev
```

前端服務將運行在 `http://localhost:5173`

## 📦 生產部署

### Docker 部署（推薦）

```bash
# 構建並啟動所有服務
docker-compose up -d

# 查看日誌
docker-compose logs -f

# 停止服務
docker-compose down
```

### Railway 部署

1. 安裝 Railway CLI:
```bash
npm install -g @railway/cli
```

2. 登入並初始化:
```bash
railway login
railway init
```

3. 設置環境變量:
```bash
railway variables set DATABASE_URL=postgresql://...
railway variables set SECRET_KEY=your-secret-key
# ... 其他環境變量
```

4. 部署:
```bash
railway up
```

### Render 部署

1. 連接 GitHub 倉庫到 Render

2. 創建 Web Service:
   - **Build Command**: `cd backend && pip install -r requirements.txt && alembic upgrade head`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`

3. 創建 Static Site (前端):
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`

4. 在 Dashboard 設置環境變量

### Vercel 部署（前端）

```bash
cd frontend
npm install -g vercel
vercel
```

後端可以部署到 Railway 或 Render。

## 🔧 環境變量配置

### 後端必需的環境變量

| 變量名 | 說明 | 示例 |
|--------|------|------|
| `DATABASE_URL` | 數據庫連接字符串 | `postgresql://user:pass@localhost/db` |
| `SECRET_KEY` | JWT 密鑰 | 隨機生成的長字符串 |
| `ALLOWED_ORIGINS` | CORS 允許的來源 | `https://your-frontend.com` |

### 前端必需的環境變量

| 變量名 | 說明 | 示例 |
|--------|------|------|
| `VITE_API_URL` | 後端 API 地址 | `https://api.your-domain.com/api` |

## 📊 數據庫遷移

```bash
# 創建新的遷移
alembic revision --autogenerate -m "描述變更"

# 應用遷移
alembic upgrade head

# 回滾遷移
alembic downgrade -1
```

## 🔒 安全建議

1. **更改默認密鑰**: 在生產環境中必須更改 `SECRET_KEY`
2. **使用 HTTPS**: 確保在生產環境使用 SSL/TLS
3. **環境變量**: 永遠不要將 `.env` 文件提交到版本控制
4. **數據庫**: 使用強密碼並限制訪問權限
5. **CORS**: 只允許受信任的來源
6. **速率限制**: 考慮添加 API 速率限制

## 📝 初始管理員賬號

運行種子腳本後，默認管理員賬號：
- 用戶名: `admin`
- 密碼: `admin123`

**請在首次登入後立即更改密碼！**

## 🐛 故障排除

### 數據庫連接失敗
- 檢查 `DATABASE_URL` 是否正確
- 確認數據庫服務正在運行
- 檢查防火牆設置

### CORS 錯誤
- 檢查 `ALLOWED_ORIGINS` 環境變量
- 確保前端 URL 包含在允許列表中

### 靜態文件 404
- 檢查 `UPLOAD_DIR` 目錄是否存在且有寫權限
- 確認 Nginx/服務器配置正確

## 📞 技術支持

遇到問題？請查看：
- GitHub Issues
- 文檔: `/docs`
- API 文檔: `http://localhost:8000/docs`
