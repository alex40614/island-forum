# 🚀 一键部署 - 3分钟上线

## ✅ 准备工作已完成

所有配置文件已经设置好，代码已提交到本地 Git 仓库。

---

## 📋 部署清单（按顺序操作）

### 步骤 1: 注册 GitHub（如果还没有账号）

**网址**: https://github.com/signup

- ✅ 完全免费
- ✅ 用邮箱注册即可
- ⏱️ 2分钟完成

---

### 步骤 2: 创建 GitHub 仓库

1. 登录 GitHub
2. 点击右上角 **"+"** → **"New repository"**
3. 填写：
   - Repository name: `island-forum`
   - 可见性: **Private**（私人仓库，只有你能看到）
   - ❌ **不要**勾选 "Add a README file"
4. 点击 **"Create repository"**

---

### 步骤 3: 推送代码到 GitHub

复制 GitHub 显示的命令，然后：

**打开 Git Bash 或 PowerShell**，在 `island-forum` 目录执行：

```bash
# 方法 1: HTTPS（推荐，无需配置）
git remote add origin https://github.com/YOUR_USERNAME/island-forum.git
git branch -M master
git push -u origin master

# 如果提示输入用户名和密码：
# - 用户名: 你的 GitHub 用户名
# - 密码: 使用 Personal Access Token（不是你的 GitHub 密码）
```

**如何获取 Personal Access Token？**
1. GitHub → 右上角头像 → **Settings**
2. 左侧最底部 → **Developer settings**
3. **Personal access tokens** → **Tokens (classic)**
4. **Generate new token (classic)**
5. 勾选 `repo` 权限
6. 点击 **Generate token**
7. **立即复制**这个 token（只显示一次）
8. 用这个 token 作为密码

---

### 步骤 4: 注册 Render

**网址**: https://render.com

- 点击 **"Get Started for Free"**
- 选择 **"Sign up with GitHub"**（最快）
- 授权 Render 访问你的仓库

⏱️ 1分钟完成

---

### 步骤 5: 一键部署

1. 在 Render Dashboard 点击 **"New +"**
2. 选择 **"Blueprint"**
3. 连接你的 `island-forum` 仓库
4. Render 会自动检测到 `render.yaml`
5. 点击 **"Apply"**
6. ☕ 等待 5-10 分钟，喝杯咖啡

**Render 会自动：**
- ✅ 创建 PostgreSQL 数据库（512MB 免费）
- ✅ 部署后端 API
- ✅ 部署前端网站
- ✅ 配置环境变量
- ✅ 运行数据库迁移
- ✅ 生成测试数据
- ✅ 配置 HTTPS

---

### 步骤 6: 访问你的网站

部署完成后，Render 会提供两个网址：

**前端**: `https://island-forum-frontend.onrender.com`  
**后端**: `https://island-forum-backend.onrender.com`

🎉 **恭喜！你的论坛已上线！**

---

## 🔑 首次登录

使用管理员账号：
- **用户名**: `admin`
- **密码**: `admin123`

⚠️ **重要**: 登录后立即修改密码！

---

## 💡 常见问题

### Q: 第一次访问网站显示 502 错误？
**A**: 正常！免费服务会在15分钟无活动后休眠。第一次访问需要等待 30-60 秒唤醒服务，然后刷新页面。

### Q: 推送代码时要求输入用户名密码？
**A**: 密码不是你的 GitHub 密码，需要使用 **Personal Access Token**（见步骤 3）。

### Q: Blueprint 部署失败？
**A**: 
1. 检查 Render Dashboard 的 **Logs** 选项卡
2. 确认 GitHub 仓库推送成功
3. 确认 `render.yaml` 文件存在于仓库根目录

### Q: 前端无法连接后端？
**A**: 等待所有服务启动完成（约 10 分钟）。在 Render Dashboard 检查所有服务状态是否为 **"Live"**。

### Q: 网站访问速度慢？
**A**: 免费服务托管在美国，中国访问会有延迟。如果需要更快速度，可以考虑升级到付费计划或使用国内服务器。

---

## 🔧 部署后配置

### 修改环境变量

1. Render Dashboard → 选择服务
2. 点击 **Environment** 标签
3. 添加/修改变量
4. 保存后自动重启服务

### 查看日志

Render Dashboard → 选择服务 → **Logs**

### 更新网站

```bash
cd island-forum
git add .
git commit -m "更新内容"
git push
```

Render 自动检测并重新部署（约 3-5 分钟）

---

## 🆘 需要帮助？

如果在任何步骤遇到问题：

1. **复制完整的错误信息**
2. **截图问题页面**
3. **告诉我你在哪一步卡住了**

我会立即帮你解决！

---

## 📊 免费额度详情

| 项目 | 免费额度 | 限制 |
|------|---------|------|
| PostgreSQL | 512MB 存储 | 永久免费 |
| Web Service | 750 小时/月 | 15分钟无活动会休眠 |
| Static Site | 100GB 流量/月 | 永久免费 |
| 构建时间 | 500 分钟/月 | - |

💡 **提示**: 750小时 = 31.25天，足够一个月全天候运行！

---

## 🎯 下一步

- ✅ 测试所有功能
- ✅ 修改管理员密码
- ✅ 创建测试帖子
- ✅ 上传图片测试
- ✅ 邀请朋友测试

**准备好了吗？开始部署吧！** 🚀
