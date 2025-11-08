'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { PostWithCategory } from '@/types/blog';

interface Favorite {
  id: string;
  created_at: string;
  post_slug: string;
  posts: PostWithCategory;
}

export default function FavoritesPage() {
  const params = useParams();
  const userId = params.id as string;
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFavorites() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/user/favorites?userId=${userId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || '获取收藏失败');
        }

        setFavorites(data.favorites || []);
      } catch (err: unknown) {
        console.error('Error fetching favorites:', err);
        const errorMessage = err instanceof Error ? err.message : '加载收藏失败';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    if (userId) {
      fetchFavorites();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 mx-auto mb-4 text-purple-600 dark:text-purple-400 animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">加载收藏中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 backdrop-blur-md bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200/30 dark:border-red-800/30">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        我的收藏
      </h2>

      {favorites.length > 0 ? (
        <div className="grid gap-8 md:grid-cols-2">
          {favorites.map((favorite) => (
            <PostCard key={favorite.id} post={favorite.posts} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl border border-gray-200/30 dark:border-gray-800/30">
          <Star className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400 mb-2">还没有收藏任何文章</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            在文章页面点击收藏按钮即可收藏喜欢的文章
          </p>
        </div>
      )}
    </div>
  );
}

