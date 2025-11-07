'use client';

interface LoadingProps {
  fullScreen?: boolean;
}

export default function Loading({ fullScreen = true }: LoadingProps) {
  return (
    <div className={`${fullScreen ? 'fixed inset-0' : 'relative'} flex items-center justify-center z-50 ${fullScreen ? 'backdrop-blur-md bg-white/80 dark:bg-gray-900/80' : ''}`}>
      <div className="relative w-20 h-20">
        {/* 外圈 */}
        <div className="
          absolute inset-0 w-20 h-20 
          border-4 border-purple-200 dark:border-purple-900 rounded-full
          animate-spin-slow
        " />
        
        {/* 内圈 */}
        <div className="
          absolute inset-0 w-20 h-20 
          border-4 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full
          animate-spin
        " />
        
        {/* 中心脉冲 */}
        <div className="
          absolute inset-0 m-auto w-8 h-8 
          bg-gradient-to-r from-purple-500 to-pink-500 rounded-full
          animate-pulse
        " />
      </div>
    </div>
  );
}
