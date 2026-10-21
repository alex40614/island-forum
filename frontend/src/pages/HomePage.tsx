import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { MessageCircle, Users, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { statsAPI, postAPI, eventAPI, categoryAPI } from '@/api';
import { formatRelativeTime, formatNumber } from '@/utils/helpers';
import type { Post } from '@/types';

export const HomePage: React.FC = () => {
  const { data: stats } = useQuery({
    queryKey: ['stats'],
    queryFn: () => statsAPI.get().then(res => res.data),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll().then(res => res.data),
  });

  const { data: hotPosts } = useQuery({
    queryKey: ['posts', 'hot'],
    queryFn: () => postAPI.getList({ sort: 'hot', limit: 5 }).then(res => res.data),
  });

  const { data: latestPosts } = useQuery({
    queryKey: ['posts', 'latest'],
    queryFn: () => postAPI.getList({ sort: 'latest', limit: 10 }).then(res => res.data),
  });

  const { data: upcomingEvents } = useQuery({
    queryKey: ['events', 'upcoming'],
    queryFn: () => eventAPI.getList(true, 0, 3).then(res => res.data),
  });

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-slate-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNiIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIi8+PC9nPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
              讓好奇心，有地方停靠
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              每一種聲音，都是一座島。在這裡分享你的想法，與有趣的靈魂相遇。
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Link
                to="/register"
                className="px-8 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition flex items-center space-x-2"
              >
                <span>加入社群</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/discussions"
                className="px-8 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition border border-slate-700"
              >
                探索討論
              </Link>
            </div>
          </div>

          {/* Stats */}
          {stats && (
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <Users className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{formatNumber(stats.total_users)}</div>
                <div className="text-sm text-slate-400">島民</div>
              </div>
              <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <MessageCircle className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{formatNumber(stats.total_posts)}</div>
                <div className="text-sm text-slate-400">討論</div>
              </div>
              <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <TrendingUp className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white">{formatNumber(stats.total_categories)}</div>
                <div className="text-sm text-slate-400">分類</div>
              </div>
              <div className="text-center p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="w-8 h-8 bg-green-500 rounded-full mx-auto mb-2"></div>
                <div className="text-3xl font-bold text-white">{formatNumber(stats.online_users)}</div>
                <div className="text-sm text-slate-400">在線</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Latest & Hot Posts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hot Posts */}
            {hotPosts && hotPosts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                    <span>熱門討論</span>
                  </h2>
                  <Link to="/hot" className="text-cyan-400 hover:text-cyan-300 text-sm">
                    查看更多 →
                  </Link>
                </div>
                <div className="space-y-4">
                  {hotPosts.map((post: Post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}

            {/* Latest Posts */}
            {latestPosts && latestPosts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                    <MessageCircle className="w-6 h-6 text-cyan-400" />
                    <span>最新討論</span>
                  </h2>
                </div>
                <div className="space-y-4">
                  {latestPosts.map((post: Post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            {categories && categories.length > 0 && (
              <section className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4">探索分類</h3>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      to={`/category/${category.slug}`}
                      className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition border border-slate-700"
                    >
                      <div className="flex items-center space-x-3">
                        {category.icon && <span className="text-2xl">{category.icon}</span>}
                        <div>
                          <div className="text-white font-medium">{category.name}</div>
                          <div className="text-slate-400 text-xs">{category.post_count} 個討論</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Events */}
            {upcomingEvents && upcomingEvents.length > 0 && (
              <section className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  <span>即將到來的活動</span>
                </h3>
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="block p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition border border-slate-700"
                    >
                      <div className="text-white font-medium mb-1">{event.title}</div>
                      <div className="text-slate-400 text-sm mb-2">{event.location}</div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">{formatRelativeTime(event.event_date)}</span>
                        <span className="text-cyan-400">{event.attendee_count} 人參加</span>
                      </div>
                    </Link>
                  ))}
                </div>
                <Link
                  to="/events"
                  className="mt-4 block text-center text-cyan-400 hover:text-cyan-300 text-sm"
                >
                  查看所有活動 →
                </Link>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Post Card Component
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <Link
      to={`/post/${post.id}`}
      className="block bg-slate-900 rounded-lg border border-slate-800 p-6 hover:border-slate-700 transition"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white mb-2 hover:text-cyan-400 transition">
            {post.title}
          </h3>
          {post.category && (
            <span className="inline-block px-3 py-1 bg-slate-800 text-cyan-400 text-xs rounded-full border border-slate-700">
              {post.category.name}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4 text-slate-400">
          <div className="flex items-center space-x-1">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">{post.author.display_name.charAt(0)}</span>
            </div>
            <span>{post.author.display_name}</span>
          </div>
          <span>·</span>
          <span>{formatRelativeTime(post.created_at)}</span>
        </div>

        <div className="flex items-center space-x-4 text-slate-400">
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-4 h-4" />
            <span>{post.comment_count}</span>
          </div>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-4 h-4" />
            <span>{post.view_count}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};
