import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userAPI.getProfile(Number(userId)).then(res => res.data),
    enabled: !!userId,
  });

  const { data: userPosts, isLoading: postsLoading } = useQuery({
    queryKey: ['user-posts', userId],
    queryFn: () => userAPI.getUserPosts(Number(userId)).then(res => res.data),
    enabled: !!userId && activeTab === 'posts',
  });

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-cyan-400">載入中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">用戶不存在</div>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile.id;

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* 用戶頭部 */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 mb-6">
          <div className="flex items-start gap-6">
            {/* 頭像 */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-3xl font-bold text-white flex-shrink-0">
              {profile.display_name.charAt(0).toUpperCase()}
            </div>

            {/* 用戶信息 */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-3xl font-bold text-white">{profile.display_name}</h1>
                {profile.is_admin && (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-sm rounded-full border border-orange-500/30">
                    管理員
                  </span>
                )}
              </div>

              <p className="text-slate-400 mb-4">@{profile.username}</p>

              {profile.bio && (
                <p className="text-slate-300 mb-4">{profile.bio}</p>
              )}

              {/* 統計數據 */}
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-2xl font-bold text-white">{profile.post_count}</span>
                  <span className="text-slate-400 ml-2">討論</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">{profile.follower_count}</span>
                  <span className="text-slate-400 ml-2">追蹤者</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">{profile.following_count}</span>
                  <span className="text-slate-400 ml-2">追蹤中</span>
                </div>
              </div>

              {/* 操作按鈕 */}
              <div className="mt-4 flex gap-3">
                {isOwnProfile ? (
                  <Link
                    to="/settings"
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
                  >
                    編輯個人資料
                  </Link>
                ) : (
                  <button className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition">
                    追蹤
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 標籤頁 */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-slate-800">
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'posts'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              討論
            </button>
            <button
              onClick={() => setActiveTab('about')}
              className={`px-4 py-3 font-medium transition ${
                activeTab === 'about'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              關於
            </button>
          </div>
        </div>

        {/* 內容區域 */}
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {postsLoading ? (
              <div className="text-center py-8 text-slate-400">載入中...</div>
            ) : userPosts && userPosts.length > 0 ? (
              userPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/post/${post.id}`}
                  className="block bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 hover:text-cyan-400">
                        {post.title}
                      </h3>

                      <div className="flex items-center gap-4 text-sm text-slate-400">
                        {post.category && (
                          <span className="px-2 py-1 bg-slate-800 rounded text-xs">
                            {post.category.name}
                          </span>
                        )}
                        <span>
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                            locale: zhTW,
                          })}
                        </span>
                        <span>{post.view_count} 次查看</span>
                        <span>{post.comment_count} 則留言</span>
                        <span>{post.like_count} 個讚</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <p>尚無討論</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm text-slate-400 mb-2">電子郵件</h3>
                <p className="text-white">{isOwnProfile ? profile.email : '隱藏'}</p>
              </div>

              <div>
                <h3 className="text-sm text-slate-400 mb-2">加入時間</h3>
                <p className="text-white">
                  {new Date(profile.created_at).toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {profile.bio && (
                <div>
                  <h3 className="text-sm text-slate-400 mb-2">個人簡介</h3>
                  <p className="text-white whitespace-pre-wrap">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
