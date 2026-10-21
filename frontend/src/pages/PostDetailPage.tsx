import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart, MessageCircle, Bookmark, Share2, Edit, Trash2,
  Clock, Eye, ChevronRight
} from 'lucide-react';
import { postAPI, commentAPI } from '@/api';
import { useAuthStore } from '@/store/authStore';
import { formatRelativeTime, formatNumber } from '@/utils/helpers';
import { ImageGallery } from '@/components/ImageGallery';

export const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const [commentContent, setCommentContent] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);

  // 獲取帖子詳情
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => postAPI.getById(Number(postId)).then(res => res.data),
  });

  // 獲取評論列表
  const { data: comments } = useQuery({
    queryKey: ['comments', postId],
    queryFn: () => commentAPI.getByPostId(Number(postId)).then(res => res.data),
    enabled: !!postId,
  });

  // 點贊
  const likeMutation = useMutation({
    mutationFn: (action: 'like' | 'unlike') =>
      action === 'like'
        ? postAPI.like(Number(postId))
        : postAPI.unlike(Number(postId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  // 收藏
  const favoriteMutation = useMutation({
    mutationFn: (action: 'favorite' | 'unfavorite') =>
      action === 'favorite'
        ? postAPI.favorite(Number(postId))
        : postAPI.unfavorite(Number(postId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] });
    },
  });

  // 發表評論
  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      commentAPI.create({
        post_id: Number(postId),
        content,
        parent_id: replyTo || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      setCommentContent('');
      setReplyTo(null);
    },
  });

  // 刪除帖子
  const deleteMutation = useMutation({
    mutationFn: () => postAPI.delete(Number(postId)),
    onSuccess: () => {
      navigate('/');
    },
  });

  const handleLike = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    likeMutation.mutate(post?.is_liked ? 'unlike' : 'like');
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    favoriteMutation.mutate(post?.is_favorited ? 'unfavorite' : 'favorite');
  };

  const handleSubmitComment = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!commentContent.trim()) return;
    commentMutation.mutate(commentContent);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          url: window.location.href,
        });
      } catch (err) {
        console.error('分享失敗', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('連結已複製到剪貼板');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">加載中...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400">帖子不存在</div>
      </div>
    );
  }

  const canEdit = user && (user.id === post.author.id || user.is_admin);

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Breadcrumb */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <Link to="/" className="hover:text-cyan-400 transition">首頁</Link>
            <ChevronRight className="w-4 h-4" />
            {post.category && (
              <>
                <Link
                  to={`/category/${post.category.slug}`}
                  className="hover:text-cyan-400 transition"
                >
                  {post.category.name}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-slate-300">討論詳情</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Post Card */}
            <div className="bg-slate-900 rounded-lg border border-slate-800">
              {/* Header */}
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      {post.title}
                    </h1>
                    {post.category && (
                      <Link
                        to={`/category/${post.category.slug}`}
                        className="inline-block px-3 py-1 bg-slate-800 text-cyan-400 text-sm rounded-full border border-slate-700 hover:border-cyan-500 transition"
                      >
                        {post.category.name}
                      </Link>
                    )}
                  </div>
                  {canEdit && (
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`/post/${postId}/edit`)}
                        className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('確定要刪除這篇討論嗎？')) {
                            deleteMutation.mutate();
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex items-center space-x-4 text-sm text-slate-400">
                  <Link
                    to={`/user/${post.author.username}`}
                    className="flex items-center space-x-2 hover:text-cyan-400 transition"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">
                        {post.author.display_name.charAt(0)}
                      </span>
                    </div>
                    <span>{post.author.display_name}</span>
                  </Link>
                  <span>·</span>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatRelativeTime(post.created_at)}</span>
                  </div>
                  <span>·</span>
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatNumber(post.view_count)} 瀏覽</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 prose prose-invert max-w-none">
                <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </div>
                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <ImageGallery images={post.images} />
                )}
              </div>

              {/* Actions */}
              <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      post.is_liked
                        ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                        : 'bg-slate-800 text-slate-400 hover:text-red-400 hover:bg-slate-750 border border-slate-700'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${post.is_liked ? 'fill-current' : ''}`} />
                    <span>{formatNumber(post.like_count)}</span>
                  </button>

                  <button
                    onClick={handleFavorite}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                      post.is_favorited
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                        : 'bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-750 border border-slate-700'
                    }`}
                  >
                    <Bookmark className={`w-5 h-5 ${post.is_favorited ? 'fill-current' : ''}`} />
                  </button>

                  <div className="flex items-center space-x-2 px-4 py-2 bg-slate-800 text-slate-400 rounded-lg border border-slate-700">
                    <MessageCircle className="w-5 h-5" />
                    <span>{formatNumber(post.comment_count)}</span>
                  </div>
                </div>

                <button
                  onClick={handleShare}
                  className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-cyan-400" />
                <span>{formatNumber(post.comment_count)} 則回覆</span>
              </h2>

              {/* Comment Form */}
              {isAuthenticated ? (
                <div className="mb-8">
                  {replyTo && (
                    <div className="mb-2 flex items-center space-x-2 text-sm text-slate-400">
                      <span>回覆給</span>
                      <button
                        onClick={() => setReplyTo(null)}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        取消
                      </button>
                    </div>
                  )}
                  <textarea
                    value={commentContent}
                    onChange={(e) => setCommentContent(e.target.value)}
                    placeholder="分享你的想法..."
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition resize-none"
                    rows={4}
                  />
                  <div className="mt-3 flex justify-end">
                    <button
                      onClick={handleSubmitComment}
                      disabled={!commentContent.trim() || commentMutation.isPending}
                      className="px-6 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {commentMutation.isPending ? '發送中...' : '發送回覆'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-8 p-6 bg-slate-800 rounded-lg border border-slate-700 text-center">
                  <p className="text-slate-400 mb-4">登入後參與討論</p>
                  <Link
                    to="/login"
                    className="inline-block px-6 py-2 bg-cyan-500 text-white rounded-lg font-semibold hover:bg-cyan-600 transition"
                  >
                    登入
                  </Link>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments && comments.length > 0 ? (
                  comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      onReply={(id) => setReplyTo(id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    還沒有回覆，成為第一個發言的人吧！
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">作者</h3>
              <Link
                to={`/user/${post.author.username}`}
                className="flex items-center space-x-3 hover:opacity-80 transition"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-semibold">
                    {post.author.display_name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="text-white font-medium">{post.author.display_name}</div>
                  <div className="text-slate-400 text-sm">@{post.author.username}</div>
                </div>
              </Link>
              {post.author.bio && (
                <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                  {post.author.bio}
                </p>
              )}
            </div>

            {/* Stats Card */}
            <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">數據</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">瀏覽次數</span>
                  <span className="text-white font-medium">{formatNumber(post.view_count)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">點贊數</span>
                  <span className="text-white font-medium">{formatNumber(post.like_count)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400">回覆數</span>
                  <span className="text-white font-medium">{formatNumber(post.comment_count)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Comment Card Component
interface CommentCardProps {
  comment: any;
  onReply: (id: number) => void;
}

const CommentCard: React.FC<CommentCardProps> = ({ comment, onReply }) => {
  return (
    <div className="flex space-x-4">
      <Link to={`/user/${comment.author.username}`}>
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">
            {comment.author.display_name.charAt(0)}
          </span>
        </div>
      </Link>
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <Link
            to={`/user/${comment.author.username}`}
            className="text-white font-medium hover:text-cyan-400 transition"
          >
            {comment.author.display_name}
          </Link>
          <span className="text-slate-500 text-sm">·</span>
          <span className="text-slate-500 text-sm">{formatRelativeTime(comment.created_at)}</span>
        </div>
        <div className="text-slate-200 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
          {comment.content}
        </div>
        <button
          onClick={() => onReply(comment.id)}
          className="text-slate-400 hover:text-cyan-400 text-sm transition"
        >
          回覆
        </button>

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4 pl-6 border-l-2 border-slate-800">
            {comment.replies.map((reply: any) => (
              <CommentCard key={reply.id} comment={reply} onReply={onReply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
