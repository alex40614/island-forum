import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Send } from 'lucide-react';
import { postAPI, categoryAPI } from '@/api';
import toast from 'react-hot-toast';
import { ImageUploader } from '@/components/ImageUploader';

export const CreatePostPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);

  // 獲取分類列表
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryAPI.getAll().then(res => res.data),
  });

  // 創建帖子
  const createMutation = useMutation({
    mutationFn: () =>
      postAPI.create({
        title,
        content,
        category_id: categoryId ?? undefined,
        images: images.length > 0 ? images : undefined,
      }),
    onSuccess: (response) => {
      toast.success('討論發布成功！');
      navigate(`/post/${response.data.id}`);
    },
    onError: () => {
      toast.error('發布失敗，請稍後再試');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('請輸入標題');
      return;
    }

    if (!content.trim()) {
      toast.error('請輸入內容');
      return;
    }

    createMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-slate-400 hover:text-cyan-400 transition mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>返回</span>
          </button>
          <h1 className="text-3xl font-bold text-white">發起新討論</h1>
          <p className="text-slate-400 mt-2">分享你的想法，與社群交流</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              選擇分類（可選）
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCategoryId(null)}
                className={`p-4 rounded-lg border-2 transition ${
                  categoryId === null
                    ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                    : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className="text-2xl mb-1">📝</div>
                <div className="text-sm font-medium">不分類</div>
              </button>
              {categories?.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(category.id)}
                  className={`p-4 rounded-lg border-2 transition ${
                    categoryId === category.id
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-400'
                      : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{category.icon || '📁'}</div>
                  <div className="text-sm font-medium">{category.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
              標題 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="一個吸引人的標題..."
              maxLength={200}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
            <div className="text-xs text-slate-500 mt-1 text-right">
              {title.length} / 200
            </div>
          </div>

          {/* Content Textarea */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">
              內容 <span className="text-red-400">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="詳細描述你的想法..."
              rows={12}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none font-mono text-sm leading-relaxed"
            />
            <div className="text-xs text-slate-500 mt-1 text-right">
              {content.length} 個字符
            </div>
          </div>

          {/* Image Uploader */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              圖片（可選）
            </label>
            <ImageUploader images={images} onChange={setImages} maxImages={9} />
          </div>

          {/* Guidelines */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">發布指南</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• 使用清晰、具體的標題</li>
              <li>• 內容真誠、有建設性</li>
              <li>• 尊重不同觀點，保持友善</li>
              <li>• 避免重複發布相同內容</li>
            </ul>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-700 transition border border-slate-700"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !title.trim() || !content.trim()}
              className="px-8 py-3 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span>{createMutation.isPending ? '發布中...' : '發布討論'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
