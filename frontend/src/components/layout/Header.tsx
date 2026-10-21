import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, User, LogOut, Menu, X, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { notificationAPI } from '@/api';
import { wsService } from '@/services/websocket';
import NotificationPanel from '@/components/NotificationPanel';

export const Header: React.FC = () => {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // 連接 WebSocket 和獲取未讀數量
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('token');
      if (token) {
        wsService.connect(token);
      }
      loadUnreadCount();
    }

    return () => {
      if (!isAuthenticated) {
        wsService.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  // 監聽新通知
  useEffect(() => {
    const unsubscribe = wsService.onMessage(() => {
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount();
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    wsService.disconnect();
    clearAuth();
    navigate('/');
  };

  const handleNotificationClick = () => {
    setNotificationPanelOpen(!notificationPanelOpen);
    if (!notificationPanelOpen) {
      // 打開面板時重置未讀數
      setTimeout(() => setUnreadCount(0), 1000);
    }
  };

  return (
    <>
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">島</span>
            </div>
            <span className="text-xl font-bold text-white hidden sm:block">Island</span>
          </Link>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索討論..."
                className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
              />
            </div>
          </form>

          {/* 右側菜單 */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                {/* 發起討論按鈕 */}
                <Link
                  to="/create-post"
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  <span>發起討論</span>
                </Link>

                {/* 通知 */}
                <button
                  onClick={handleNotificationClick}
                  className="relative p-2 text-slate-400 hover:text-white transition"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* 用戶菜單 */}
                <div className="relative group">
                  <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-800 transition">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.display_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <span className="text-white text-sm hidden lg:block">{user?.display_name}</span>
                  </button>

                  {/* 下拉菜單 */}
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      to={`/user/${user?.id}`}
                      className="flex items-center space-x-2 px-4 py-3 hover:bg-slate-700 transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span className="text-white">我的主頁</span>
                    </Link>
                    {user?.is_admin && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-2 px-4 py-3 hover:bg-slate-700 transition border-t border-slate-700"
                      >
                        <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-orange-400 font-medium">管理員控制台</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-3 hover:bg-slate-700 transition text-left border-t border-slate-700"
                    >
                      <LogOut className="w-4 h-4 text-slate-400" />
                      <span className="text-white">登出</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-white hover:text-cyan-400 transition"
                >
                  登入
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
                >
                  註冊
                </Link>
              </div>
            )}

            {/* 移動端菜單按鈕 */}
            <button
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* 移動端搜索 */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索討論..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
                />
              </div>
            </form>
          </div>
        )}
      </div>
    </header>

    {/* 通知面板 */}
    <NotificationPanel
      isOpen={notificationPanelOpen}
      onClose={() => setNotificationPanelOpen(false)}
    />
    </>
  );
};
