# Island Forum - Render 部署说明

## 🚀 一键免费部署到 Render

### 步骤 1: 推送代码到 GitHub

```bash
# 如果还没有 GitHub 仓库，创建一个
# 然后在项目目录执行：
cd island-forum
git add .
git commit -m "准备部署到 Render"
git remote add origin https://github.com/YOUR_USERNAME/island-forum.git
git push -u origin master
```

### 步骤 2: 部署到 Render

1. **访问 Render**: https://render.com
2. **注册/登录**（可以用 GitHub 账号登录）
3. **点击 "New +"** → 选择 "Blueprint"
4. **连接 GitHub 仓库**: 选择 `island-forum` 仓库
5. **点击 "Apply"**，Render 会自动：
   - 创建免费 PostgreSQL 数据库
   - 部署后端 API
   - 部署前端网站

### 步骤 3: 等待部署完成（约 5-10 分钟）

部署完成后，你会得到两个地址：
- **前端**: `https://island-forum-frontend.onrender.com`
- **后端**: `https://island-forum-backend.onrender.com`

---

## 📝 默认管理员账号

- 用户名: `admin`
- 密码: `admin123`

**首次登录后请立即修改密码！**

---

## 🔧 配置说明

### 自动配置的环境变量：

**后端：**
- `DATABASE_URL`: 自动连接到 Render PostgreSQL
- `SECRET_KEY`: 自动生成安全密钥
- `ALLOWED_ORIGINS`: 允许所有来源（可以后续在 Render Dashboard 修改）

**前端：**
- `VITE_API_URL`: 自动指向后端 API

---

## ⚠️ 免费版限制

- PostgreSQL: 512MB 存储
- 后端: 15 分钟无活动后休眠（首次访问需要等待几秒钟）
- 前端: 100GB 流量/月
- 完全够个人项目和学习使用！

---

## 🐛 常见问题

### Q: 首次访问很慢？
A: 免费服务器 15 分钟无活动会休眠，首次访问需要等待 30-60 秒唤醒。

### Q: 如何更新网站？
A: 只需 `git push`，Render 会自动重新部署。

### Q: 如何查看日志？
A: 在 Render Dashboard 的每个服务页面都有 Logs 选项卡。

---

## 💡 不用 GitHub 的替代方案

如果你不想用 GitHub，可以使用 Render 的免费数据库 + Vercel 部署前端：

### Render 部署后端：
1. 在 Render Dashboard 点击 "New +" → "Web Service"
2. 选择 "Build and deploy from a Git repository"
3. 手动上传代码或连接 GitHub

### Vercel 部署前端：
```bash
cd frontend
npm install -g vercel
vercel deploy
```

---

## 📞 需要帮助？

查看完整文档：`DEPLOYMENT.md`
