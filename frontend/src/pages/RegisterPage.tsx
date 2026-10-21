import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authAPI } from '@/api';
import { isValidEmail, isValidUsername } from '@/utils/helpers';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    display_name: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: () => {
      toast.success('註冊成功！請登入');
      navigate('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || '註冊失敗');
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!isValidUsername(formData.username)) {
      newErrors.username = '用戶名必須是 3-20 個字符，只能包含字母、數字和下劃線';
    }

    if (!isValidEmail(formData.email)) {
      newErrors.email = '請輸入有效的電子郵件地址';
    }

    if (formData.display_name.length < 2 || formData.display_name.length > 50) {
      newErrors.display_name = '顯示名稱必須是 2-50 個字符';
    }

    if (formData.password.length < 6) {
      newErrors.password = '密碼必須至少 6 個字符';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = '兩次輸入的密碼不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    registerMutation.mutate({
      username: formData.username,
      email: formData.email,
      display_name: formData.display_name,
      password: formData.password,
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl mb-4">
            <span className="text-white font-bold text-3xl">島</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">加入 Island</h1>
          <p className="text-slate-400">成為島民，開始探索</p>
        </div>

        {/* Register Form */}
        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                用戶名 *
              </label>
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full px-4 py-3 bg-slate-800 border ${
                  errors.username ? 'border-red-500' : 'border-slate-700'
                } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition`}
                placeholder="username123"
                required
              />
              {errors.username && <p className="mt-1 text-sm text-red-400">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                電子郵件 *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 bg-slate-800 border ${
                  errors.email ? 'border-red-500' : 'border-slate-700'
                } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition`}
                placeholder="your@email.com"
                required
              />
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="display_name" className="block text-sm font-medium text-slate-300 mb-2">
                顯示名稱 *
              </label>
              <input
                type="text"
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                className={`w-full px-4 py-3 bg-slate-800 border ${
                  errors.display_name ? 'border-red-500' : 'border-slate-700'
                } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition`}
                placeholder="你的名字"
                required
              />
              {errors.display_name && <p className="mt-1 text-sm text-red-400">{errors.display_name}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                密碼 *
              </label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-3 bg-slate-800 border ${
                  errors.password ? 'border-red-500' : 'border-slate-700'
                } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition`}
                placeholder="至少 6 個字符"
                required
              />
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                確認密碼 *
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-4 py-3 bg-slate-800 border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-slate-700'
                } rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 transition`}
                placeholder="再次輸入密碼"
                required
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {registerMutation.isPending ? '註冊中...' : '註冊'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm">
              已經有帳號？
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 ml-1">
                立即登入
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
