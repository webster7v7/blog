'use client';

import Link from 'next/link';
import { PostListItem } from '@/types/blog';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef } from 'react';

interface PostCardProps {
  post: PostListItem;
}

export default function PostCard({ post }: PostCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7.5deg', '-7.5deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7.5deg', '7.5deg']);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className="group"
    >
      <Link href={`/posts/${post.slug}`}>
        <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 relative overflow-hidden">
          {/* 光影跟随效果 */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `radial-gradient(600px circle at ${x.get() * 100 + 50}% ${y.get() * 100 + 50}%, rgba(167, 139, 250, 0.1), transparent 40%)`,
            }}
          />
          
          <div style={{ transform: 'translateZ(50px)' }} className="relative">
            <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
              {post.title}
            </h2>
            
            {post.excerpt && (
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {post.excerpt}
              </p>
            )}
            
            <div className="flex items-center justify-between text-sm">
              <time className="text-gray-500 dark:text-gray-500">
                {format(new Date(post.published_at), 'yyyy年MM月dd日', { locale: zhCN })}
              </time>
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}

