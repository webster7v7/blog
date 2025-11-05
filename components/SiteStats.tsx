'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// 网站创建时间（北京时间）
const SITE_CREATION_DATE = new Date('2025-11-01T00:00:00+08:00');

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  delay: number;
  suppressHydration?: boolean;
}

function StatCard({ icon, label, value, delay, suppressHydration = false }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, y: -4 }}
      className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
    >
      <div className="flex flex-col items-center text-center space-y-3">
        {/* 图标 */}
        <div className="text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {icon}
        </div>
        
        {/* 标签 */}
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </div>
        
        {/* 数值 */}
        <div 
          className="text-2xl md:text-3xl font-bold font-mono text-gray-900 dark:text-gray-100"
          suppressHydrationWarning={suppressHydration}
        >
          {value}
        </div>
      </div>
    </motion.div>
  );
}

export default function SiteStats() {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // 每秒更新时间
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // 清理定时器
    return () => clearInterval(timer);
  }, []);

  // 计算北京时间
  const beijingTime = currentTime.toLocaleString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).split(' ')[1] || currentTime.toLocaleTimeString('zh-CN', { hour12: false });

  // 格式化创建日期
  const creationDate = SITE_CREATION_DATE.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 计算运行时长
  const calculateRunningTime = () => {
    const now = currentTime.getTime();
    const creation = SITE_CREATION_DATE.getTime();
    const diff = now - creation;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}天 ${hours}时 ${minutes}分`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <StatCard
        icon="🕐"
        label="北京时间"
        value={beijingTime}
        delay={0}
        suppressHydration={true}
      />
      
      <StatCard
        icon="🎂"
        label="网站创建"
        value={creationDate}
        delay={0.1}
        suppressHydration={false}
      />
      
      <StatCard
        icon="⏱️"
        label="运行时长"
        value={calculateRunningTime()}
        delay={0.2}
        suppressHydration={true}
      />
    </div>
  );
}

