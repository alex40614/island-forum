# 🏝️ Island Forum - 海岛论坛

现代化的论坛系统，基于 FastAPI + React + TypeScript 构建。

## ✨ 功能特性

- 🔐 用户认证系统（注册、登录、JWT）
- 📝 帖子发布与管理
- 💬 评论系统
- 👤 用户个人资料
- 🎨 现代化 UI 设计
- 📱 响应式布局

## 🚀 快速部署

### 一键部署到云端

**前端** (已部署):  
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/import/project?template=https://github.com/alex40614/island-forum)

🌐 **在线访问**: https://island-forum.vercel.app

**后端**:  
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/alex40614/island-forum)

### 本地运行

#### 后端

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

后端运行在: http://localhost:8000  
API 文档: http://localhost:8000/docs

#### 前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在: http://localhost:5173

### 测试账号

- **管理员**: 用户名 `admin` / 密码 `admin123`
- **普通用户**: 用户名 `testuser` / 密码 `test123`

## 🛠️ 技术栈

### 后端
- **FastAPI** - 现代 Python Web 框架
- **SQLAlchemy** - ORM
- **SQLite** - 数据库
- **JWT** - 身份认证
- **Pydantic** - 数据验证

### 前端
- **React 18** - UI 框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库

## 📖 文档

- [快速开始指南](QUICKSTART.md)
- [部署指南](DEPLOYMENT.md)
- [API 文档](http://localhost:8000/docs) (需要先启动后端)

## 📝 开发

### 项目结构

```
island-forum/
├── backend/          # FastAPI 后端
│   ├── app/
│   │   ├── main.py       # 应用入口
│   │   ├── models.py     # 数据模型
│   │   ├── schemas.py    # Pydantic schemas
│   │   ├── crud.py       # 数据库操作
│   │   └── auth.py       # 认证逻辑
│   └── requirements.txt
└── frontend/         # React 前端
    ├── src/
    │   ├── App.tsx       # 主应用
    │   ├── components/   # UI 组件
    │   └── services/     # API 服务
    └── package.json
```

### 环境变量

后端 `.env`:
```
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./island_forum.db
```

前端 `.env`:
```
VITE_API_URL=http://localhost:8000
```

## 📄 License

MIT License

## 👤 作者

Alex (@alex40614)

---

⭐ 如果觉得这个项目不错，请给个 Star！
