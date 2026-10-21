import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postAPI, categoryAPI } from '@/api';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export const CategoryPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [sortBy, setSortBy] = useState<'hot' | 'latest' | 'top'>('hot');

  // 獲取所有分類
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll().then(res => res.data),
  });

  // 找到當前分類
  const currentCategory = categories?.find((cat) => cat.slug === slug);

  // 獲取分類下的帖子
  const { data: posts, isLoading } = useQuery({
    queryKey: ['posts', currentCategory?.id, sortBy],
    queryFn: () =>
      postAPI.getList({
        category_id: currentCategory?.id,
        sort: sortBy,
        limit: 50,
      }).then(res => res.data),
    enabled: !!currentCategory,
  });

  if (!currentCategory && categories) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📁</div>
          <h2 className="text-2xl font-bold text-white mb-2">分類不存在</h2>
          <Link to="/" className="text-cyan-400 hover:underline">
            返回首頁
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {currentCategory && (
          <>
            {/* 分類頭部 */}
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 mb-6">
              <div className="flex items-start gap-4">
                {currentCategory.icon && (
                  <div className="text-4xl">{currentCategory.icon}</div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {currentCategory.name}
                  </h1>
                  {currentCategory.description && (
                    <p className="text-slate-400 mb-4">{currentCategory.description}</p>
                  )}
                  <div className="text-sm text-slate-500">
                    {currentCategory.post_count} 個討論
                  </div>
                </div>
              </div>
            </div>

            {/* 排序和操作欄 */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('hot')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    sortBy === 'hot'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  🔥 熱門
                </button>
                <button
                  onClick={() => setSortBy('latest')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    sortBy === 'latest'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  🕒 最新
                </button>
                <button
                  onClick={() => setSortBy('top')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    sortBy === 'top'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  ⭐ 熱評
                </button>
              </div>

              <Link
                to="/create-post"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition"
              >
                ＋ 發起討論
              </Link>
            </div>

            {/* 帖子列表 */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-400 border-t-transparent"></div>
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="block bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start gap-4">
                      {/* 作者頭像 */}
                      <Link
                        to={`/user/${post.author.id}`}
                        className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0 hover:opacity-80"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {post.author.display_name.charAt(0).toUpperCase()}
                      </Link>

                      <div className="flex-1 min-w-0">
                        {/* 標題 */}
                        <div className="flex items-start gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white hover:text-cyan-400 flex-1">
                            {post.title}
                          </h3>
                          {post.is_pinned && (
                            <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded border border-orange-500/30">
                              📌 置頂
                            </span>
                          )}
                        </div>

                        {/* 元數據 */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <Link
                            to={`/user/${post.author.id}`}
                            className="hover:text-cyan-400 transition"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {post.author.display_name}
                          </Link>

                          <span>
                            {formatDistanceToNow(new Date(post.created_at), {
                              addSuffix: true,
                              locale: zhTW,
                            })}
                          </span>

                          <div className="flex items-center gap-4">
                            <span>👁️ {post.view_count}</span>
                            <span>💬 {post.comment_count}</span>
                            <span>❤️ {post.like_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-xl font-semibold text-white mb-2">還沒有討論</h3>
                <p className="text-slate-400 mb-6">成為第一個發起討論的人！</p>
                <Link
                  to="/create-post"
                  className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition"
                >
                  發起討論
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
