import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postAPI, categoryAPI, statsAPI } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { Navigate, Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import toast from 'react-hot-toast';

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'posts' | 'categories'>('overview');

  // 檢查管理員權限
  if (!user?.is_admin) {
    return <Navigate to="/" replace />;
  }

  // 獲取統計數據
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => statsAPI.get().then(res => res.data),
  });

  // 獲取所有帖子
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => postAPI.getList({ limit: 100 }).then(res => res.data),
    enabled: activeTab === 'posts',
  });

  // 獲取所有分類
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll().then(res => res.data),
    enabled: activeTab === 'categories',
  });

  // 刪除帖子
  const deletePostMutation = useMutation({
    mutationFn: (postId: number) => postAPI.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('帖子已刪除');
    },
    onError: () => {
      toast.error('刪除失敗');
    },
  });

  const handleDeletePost = (postId: number, title: string) => {
    if (window.confirm(`確定要刪除「${title}」嗎？此操作無法撤銷。`)) {
      deletePostMutation.mutate(postId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">管理員控制台</h1>
          <p className="text-slate-400">管理 Island Forum 的內容和設置</p>
        </div>

        {/* 標籤頁 */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'overview'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              📊 概覽
            </button>
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'posts'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              📝 帖子管理
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'categories'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              📁 分類管理
            </button>
          </div>
        </div>

        {/* 概覽標籤頁 */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* 統計卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-lg p-6">
                <div className="text-cyan-400 text-sm mb-2">總用戶數</div>
                <div className="text-4xl font-bold text-white">{stats.total_users}</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-lg p-6">
                <div className="text-orange-400 text-sm mb-2">總討論數</div>
                <div className="text-4xl font-bold text-white">{stats.total_posts}</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-6">
                <div className="text-purple-400 text-sm mb-2">總分類數</div>
                <div className="text-4xl font-bold text-white">{stats.total_categories}</div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-lg p-6">
                <div className="text-green-400 text-sm mb-2">在線用戶</div>
                <div className="text-4xl font-bold text-white">{stats.online_users}</div>
              </div>
            </div>

            {/* 快捷操作 */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">快捷操作</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('posts')}
                  className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="font-medium text-white">管理帖子</div>
                  <div className="text-sm text-slate-400">查看和管理所有討論</div>
                </button>

                <button
                  onClick={() => setActiveTab('categories')}
                  className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition"
                >
                  <div className="text-2xl mb-2">📁</div>
                  <div className="font-medium text-white">管理分類</div>
                  <div className="text-sm text-slate-400">編輯討論分類</div>
                </button>

                <Link
                  to="/create-post"
                  className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg text-left transition"
                >
                  <div className="text-2xl mb-2">➕</div>
                  <div className="font-medium text-white">創建公告</div>
                  <div className="text-sm text-slate-400">發布重要通知</div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 帖子管理標籤頁 */}
        {activeTab === 'posts' && (
          <div>
            {postsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-400 border-t-transparent"></div>
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">標題</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">作者</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">分類</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">數據</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">創建時間</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {posts.map((post) => (
                        <tr key={post.id} className="hover:bg-slate-800/50">
                          <td className="px-6 py-4">
                            <Link
                              to={`/post/${post.id}`}
                              className="text-white hover:text-cyan-400 font-medium"
                            >
                              {post.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{post.author.display_name}</td>
                          <td className="px-6 py-4">
                            {post.category && (
                              <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                                {post.category.name}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            👁️ {post.view_count} | 💬 {post.comment_count} | ❤️ {post.like_count}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400">
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: zhTW,
                            })}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeletePost(post.id, post.title)}
                              className="text-red-400 hover:text-red-300 text-sm"
                            >
                              刪除
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">沒有帖子</div>
            )}
          </div>
        )}

        {/* 分類管理標籤頁 */}
        {activeTab === 'categories' && (
          <div>
            {categoriesLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-400 border-t-transparent"></div>
              </div>
            ) : categories && categories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-slate-900 border border-slate-800 rounded-lg p-6"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {category.icon && <div className="text-3xl">{category.icon}</div>}
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-1">{category.name}</h3>
                        <p className="text-sm text-slate-400">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{category.post_count} 個討論</span>
                      <Link
                        to={`/category/${category.slug}`}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        查看 →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-400">沒有分類</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
