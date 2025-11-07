'use client';

import { useState, useEffect } from 'react';
import { Bookmark } from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';

interface FavoriteButtonProps {
  postSlug: string;
}

export default function FavoriteButton({ postSlug }: FavoriteButtonProps) {
  const [favorited, setFavorited] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 检查登录状态
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    };
    checkAuth();
  }, []);

  // 获取收藏状态
  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${postSlug}/favorite`);
        if (response.ok) {
          const data = await response.json();
          setFavorited(data.favorited);
          setCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching favorite status:', error);
      }
    };

    fetchFavoriteStatus();
  }, [postSlug]);

  const handleFavorite = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录后再收藏');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const method = favorited ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postSlug}/favorite`, {
        method,
      });

      if (response.ok) {
        const data = await response.json();
        setFavorited(data.favorited);
        setCount(data.count);
        toast.success(data.favorited ? '收藏成功！' : '已取消收藏');
      } else {
        const error = await response.json();
        toast.error(error.error || '操作失败，请稍后再试');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('操作失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleFavorite}
      disabled={loading}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full border 
        transition-all duration-300
        hover:scale-105 active:scale-95
        ${
        favorited
          ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-600 dark:text-yellow-400'
          : 'bg-white/80 dark:bg-gray-900/80 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-yellow-400 dark:hover:border-yellow-600 hover:text-yellow-600 dark:hover:text-yellow-400'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className={favorited ? 'animate-bounce-once' : ''}>
        <Bookmark
          size={20}
          className={favorited ? 'fill-current' : ''}
        />
      </div>
      <span className="font-medium">{count}</span>
    </button>
  );
}

