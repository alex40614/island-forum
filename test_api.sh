#!/bin/bash
# Island Forum API 功能測試腳本

API_URL="http://localhost:8000/api"
FRONTEND_URL="http://localhost:5173"

echo "======================================"
echo "Island Forum 功能測試報告"
echo "======================================"
echo ""

# 測試 1: 根路由
echo "✓ 1. 測試根路由"
curl -s http://localhost:8000/ && echo ""
echo ""

# 測試 2: 分類列表
echo "✓ 2. 測試分類列表 API"
curl -s "$API_URL/categories" && echo ""
echo ""

# 測試 3: 帖子列表
echo "✓ 3. 測試帖子列表 API (最新3篇)"
curl -s "$API_URL/posts?limit=3&sort=latest" && echo ""
echo ""

# 測試 4: 用戶註冊
echo "✓ 4. 測試用戶註冊 API"
curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@island.com",
    "display_name": "測試用戶2",
    "password": "test123"
  }' && echo ""
echo ""

# 測試 5: 用戶登錄
echo "✓ 5. 測試用戶登錄 API"
TOKEN=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "登錄成功！Token: ${TOKEN:0:50}..."
else
  echo "登錄失敗"
fi
echo ""

# 測試 6: 獲取當前用戶信息
echo "✓ 6. 測試獲取當前用戶信息"
curl -s "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" && echo ""
echo ""

# 測試 7: 創建帖子
echo "✓ 7. 測試創建帖子 API"
NEW_POST=$(curl -s -X POST "$API_URL/posts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "API 測試帖子",
    "content": "這是通過 API 測試創建的帖子",
    "category_id": 1
  }')
echo "$NEW_POST" && echo ""
POST_ID=$(echo "$NEW_POST" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo ""

# 測試 8: 獲取帖子詳情
echo "✓ 8. 測試獲取帖子詳情 (ID: $POST_ID)"
curl -s "$API_URL/posts/$POST_ID" && echo ""
echo ""

# 測試 9: 點贊帖子
echo "✓ 9. 測試點贊帖子"
curl -s -X POST "$API_URL/posts/$POST_ID/like" \
  -H "Authorization: Bearer $TOKEN" && echo ""
echo ""

# 測試 10: 評論帖子
echo "✓ 10. 測試創建評論"
curl -s -X POST "$API_URL/comments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"content\": \"這是一條測試評論\",
    \"post_id\": $POST_ID
  }" && echo ""
echo ""

# 測試 11: 獲取帖子評論
echo "✓ 11. 測試獲取帖子評論列表"
curl -s "$API_URL/posts/$POST_ID/comments" && echo ""
echo ""

# 測試 12: 前端頁面
echo "✓ 12. 測試前端頁面可訪問性"
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL")
if [ "$FRONTEND_STATUS" == "200" ]; then
  echo "前端頁面正常訪問: $FRONTEND_URL"
else
  echo "前端頁面訪問失敗: HTTP $FRONTEND_STATUS"
fi
echo ""

echo "======================================"
echo "測試完成！"
echo "======================================"
echo ""
echo "📊 總結："
echo "- 後端 API: http://localhost:8000"
echo "- API 文檔: http://localhost:8000/docs"
echo "- 前端頁面: http://localhost:5173"
echo ""
echo "🔑 測試帳號："
echo "- 管理員: admin / admin123"
echo "- 測試用戶: testuser / test123"
