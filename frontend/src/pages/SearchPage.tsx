import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { postAPI } from '@/api';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [inputValue, setInputValue] = useState(query);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: () => postAPI.search(query).then(res => res.data),
    enabled: query.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setQuery(inputValue.trim());
      setSearchParams({ q: inputValue.trim() });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* 搜索標題 */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">搜索</h1>
          <p className="text-slate-400">在 Island Forum 中搜索討論</p>
        </div>

        {/* 搜索欄 */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="搜索討論..."
              className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-medium rounded-lg transition"
            >
              搜索
            </button>
          </div>
        </form>

        {/* 搜索結果 */}
        {query && (
          <div>
            <div className="mb-4 text-slate-400">
              {isLoading ? (
                '搜索中...'
              ) : searchResults && searchResults.length > 0 ? (
                `找到 ${searchResults.length} 個結果`
              ) : (
                '沒有找到結果'
              )}
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cyan-400 border-t-transparent"></div>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map((post) => (
                  <Link
                    key={post.id}
                    to={`/post/${post.id}`}
                    className="block bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start gap-4">
                      {/* 作者頭像 */}
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {post.author.display_name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* 標題 */}
                        <h3 className="text-xl font-semibold text-white mb-2 hover:text-cyan-400">
                          {post.title}
                        </h3>

                        {/* 內容預覽 */}
                        <p className="text-slate-400 mb-3 line-clamp-2">{post.content}</p>

                        {/* 元數據 */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                          <Link
                            to={`/user/${post.author.id}`}
                            className="hover:text-cyan-400 transition"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {post.author.display_name}
                          </Link>

                          {post.category && (
                            <Link
                              to={`/category/${post.category.slug}`}
                              className="px-2 py-1 bg-slate-800 rounded text-xs hover:bg-slate-700 transition"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {post.category.name}
                            </Link>
                          )}

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
            ) : query ? (
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">沒有找到結果</h3>
                <p className="text-slate-400">試試其他關鍵詞</p>
              </div>
            ) : null}
          </div>
        )}

        {/* 搜索提示 */}
        {!query && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-8">
            <h3 className="text-lg font-semibold text-white mb-4">搜索提示</h3>
            <ul className="space-y-2 text-slate-400">
              <li>• 使用關鍵字搜索討論標題和內容</li>
              <li>• 搜索會自動匹配相關的討論</li>
              <li>• 支持中英文搜索</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
