'use client';

import { useScrollPosition } from '@/hooks/useScrollPosition';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ReadingProgress() {
  const scrollPosition = useScrollPosition();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 计算阅读进度 - 在 useEffect 中访问 document，确保只在客户端执行
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const newProgress = scrollHeight > 0 ? (scrollPosition / scrollHeight) * 100 : 0;
    setProgress(newProgress);
  }, [scrollPosition]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200/20 dark:bg-gray-800/20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"
        style={{ width: `${progress}%` }}
        initial={{ width: 0 }}
        transition={{ duration: 0.1 }}
      />
    </motion.div>
  );
}

