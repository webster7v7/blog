'use client';

import { motion } from 'framer-motion';

interface LoadingProps {
  fullScreen?: boolean;
}

export default function Loading({ fullScreen = true }: LoadingProps) {
  return (
    <div className={`${fullScreen ? 'fixed inset-0' : 'relative'} flex items-center justify-center z-50 ${fullScreen ? 'backdrop-blur-md bg-white/80 dark:bg-gray-900/80' : ''}`}>
      <div className="relative">
        {/* 外圈 */}
        <motion.div
          className="w-20 h-20 border-4 border-purple-200 dark:border-purple-900 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* 内圈 */}
        <motion.div
          className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        
        {/* 中心脉冲 */}
        <motion.div
          className="absolute inset-0 m-auto w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>
    </div>
  );
}

