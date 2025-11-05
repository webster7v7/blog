'use client';

import { useState } from 'react';
import { Share2, Link2, Twitter, Facebook } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface ShareButtonProps {
  postSlug: string;
  postTitle: string;
}

export default function ShareButton({ postSlug, postTitle }: ShareButtonProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/posts/${postSlug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('链接已复制到剪贴板！');
      setShowMenu(false);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('复制失败，请手动复制');
    }
  };

  const handleShareTwitter = () => {
    const url = `${window.location.origin}/posts/${postSlug}`;
    const text = `${postTitle} - Webster`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text
    )}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
    setShowMenu(false);
  };

  const handleShareFacebook = () => {
    const url = `${window.location.origin}/posts/${postSlug}`;
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`;
    window.open(facebookUrl, '_blank', 'noopener,noreferrer');
    setShowMenu(false);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-300 hover:border-purple-400 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Share2 size={20} />
        <span className="font-medium">分享</span>
      </motion.button>

      <AnimatePresence>
        {showMenu && (
          <>
            {/* 遮罩层，点击关闭菜单 */}
            <motion.div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* 分享菜单 */}
            <motion.div
              className="absolute bottom-full mb-2 left-0 z-20 backdrop-blur-md bg-white/90 dark:bg-gray-900/90 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex flex-col min-w-[200px]">
                <button
                  onClick={handleCopyLink}
                  className="flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/30 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <Link2 size={18} className="text-purple-600 dark:text-purple-400" />
                  <span>复制链接</span>
                </button>

                <button
                  onClick={handleShareTwitter}
                  className="flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <Twitter size={18} className="text-blue-500" />
                  <span>分享到 Twitter</span>
                </button>

                <button
                  onClick={handleShareFacebook}
                  className="flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-gray-700 dark:text-gray-300"
                >
                  <Facebook size={18} className="text-blue-600" />
                  <span>分享到 Facebook</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

