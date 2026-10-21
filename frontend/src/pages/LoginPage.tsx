import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authAPI } from '@/api';
import { useAuthStore } from '@/store/authStore';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: async (response) => {
      const token = response.data.access_token;

      // 先將 token 存入 localStorage，這樣後續的 API 請求才能帶上 token
      localStorage.setItem('token', token);

      // 獲取用戶信息
      const userResponse = await authAPI.getCurrentUser();
      setAuth(userResponse.data, token);

      toast.success('登入成功！');
      navigate('/');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || '登入失敗，請檢查用戶名和密碼');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mb-4">
            <span className="text-white font-bold text-3xl">島</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">歡迎回到 Island</h1>
          <p className="text-slate-400">登入你的帳號繼續探索</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                用戶名
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
                placeholder="輸入用戶名"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                密碼
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition"
                placeholder="輸入密碼"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loginMutation.isPending ? '登入中...' : '登入'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              還沒有帳號？
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 ml-1">
                立即註冊
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
