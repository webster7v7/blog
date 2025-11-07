'use client';

import LikeButton from './LikeButton';
import FavoriteButton from './FavoriteButton';
import ShareButton from './ShareButton';
import { Eye, MessageCircle } from 'lucide-react';

interface InteractionBarProps {
  postSlug: string;
  postTitle: string;
  views: number;
  commentsCount: number;
}

export default function InteractionBar({
  postSlug,
  postTitle,
  views,
  commentsCount,
}: InteractionBarProps) {
  return (
    <div className="sticky top-20 z-40 py-4 mb-8 backdrop-blur-md bg-white/70 dark:bg-gray-900/70 border-y border-gray-200/30 dark:border-gray-800/30">
      <div className="max-w-4xl mx-auto px-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* 左侧：统计信息 */}
          <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Eye size={18} />
              <span className="text-sm">{views} 阅读</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={18} />
              <span className="text-sm">{commentsCount} 评论</span>
            </div>
          </div>

          {/* 右侧：互动按钮 */}
          <div className="flex items-center gap-3">
            <LikeButton postSlug={postSlug} />
            <FavoriteButton postSlug={postSlug} />
            <ShareButton postSlug={postSlug} postTitle={postTitle} />
          </div>
        </div>
      </div>
    </div>
  );
}

