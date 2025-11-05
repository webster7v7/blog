'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase-client';

interface LikeButtonProps {
  postSlug: string;
}

export default function LikeButton({ postSlug }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
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

  // 获取点赞状态
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(`/api/posts/${postSlug}/like`);
        if (response.ok) {
          const data = await response.json();
          setLiked(data.liked);
          setCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching like status:', error);
      }
    };

    fetchLikeStatus();
  }, [postSlug]);

  const handleLike = async () => {
    if (!isLoggedIn) {
      toast.error('请先登录后再点赞');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const method = liked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/posts/${postSlug}/like`, {
        method,
      });

      if (response.ok) {
        const data = await response.json();
        setLiked(data.liked);
        setCount(data.count);
        toast.success(data.liked ? '点赞成功！' : '已取消点赞');
      } else {
        const error = await response.json();
        toast.error(error.error || '操作失败，请稍后再试');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('操作失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      onClick={handleLike}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 ${
        liked
          ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-600 dark:text-red-400'
          : 'bg-white/80 dark:bg-gray-900/80 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-red-400 dark:hover:border-red-600 hover:text-red-600 dark:hover:text-red-400'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={liked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          size={20}
          className={liked ? 'fill-current' : ''}
        />
      </motion.div>
      <span className="font-medium">{count}</span>
    </motion.button>
  );
}

