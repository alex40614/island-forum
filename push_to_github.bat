@echo off
chcp 65001 >nul
echo.
echo ============================================
echo   🚀 Island Forum - 自动推送到 GitHub
echo ============================================
echo.

REM 检查是否在正确的目录
if not exist "backend" (
    echo ❌ 错误：请在 island-forum 目录中运行此脚本
    pause
    exit /b 1
)

echo 📝 请输入你的 GitHub 用户名：
set /p GITHUB_USERNAME=

echo.
echo 🔗 你的仓库地址将是：
echo    https://github.com/%GITHUB_USERNAME%/island-forum
echo.
echo 请确认你已在 GitHub 创建了名为 'island-forum' 的仓库
echo （如果还没创建，请访问 https://github.com/new）
echo.
pause

echo.
echo 📤 正在添加远程仓库...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USERNAME%/island-forum.git

echo.
echo 📤 正在推送代码到 GitHub...
echo.
echo ⚠️  推送时需要输入：
echo    用户名: %GITHUB_USERNAME%
echo    密码: 你的 Personal Access Token（不是 GitHub 密码）
echo.
echo 💡 如何获取 Token：
echo    1. 访问 https://github.com/settings/tokens
echo    2. Generate new token (classic)
echo    3. 勾选 'repo' 权限
echo    4. 复制生成的 token
echo.
pause

git branch -M master
git push -u origin master

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo   ✅ 推送成功！
    echo ============================================
    echo.
    echo 🎉 下一步：部署到 Render
    echo.
    echo 1. 访问 https://render.com
    echo 2. 注册/登录（用 GitHub 账号登录最快）
    echo 3. 点击 "New +" → "Blueprint"
    echo 4. 选择你的 island-forum 仓库
    echo 5. 点击 "Apply"
    echo 6. 等待 5-10 分钟完成部署
    echo.
    echo 📖 详细说明请查看 DEPLOY_NOW.md
    echo.
) else (
    echo.
    echo ============================================
    echo   ❌ 推送失败
    echo ============================================
    echo.
    echo 可能的原因：
    echo 1. GitHub 仓库不存在
    echo 2. Personal Access Token 无效
    echo 3. 网络连接问题
    echo.
    echo 💡 请检查错误信息并重试
    echo.
)

pause
