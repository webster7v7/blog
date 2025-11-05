'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Particle {
  id: number;
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  targetX: number;
  targetY: number;
  duration: number;
}

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [meteors, setMeteors] = useState<Array<{ id: number; delay: number }>>([]);

  useEffect(() => {
    // 标记为已挂载
    setMounted(true);
    
    // 生成粒子数据（只在客户端）
    const generatedParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      color: i % 2 === 0 
        ? 'rgba(167, 139, 250, 0.3)' 
        : 'rgba(236, 72, 153, 0.3)',
      initialX: Math.random() * window.innerWidth,
      initialY: Math.random() * window.innerHeight,
      targetX: Math.random() * window.innerWidth,
      targetY: Math.random() * window.innerHeight,
      duration: 15 + Math.random() * 25,
    }));
    
    setParticles(generatedParticles);
    
    // 生成流星数据
    const meteorArray = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      delay: Math.random() * 10,
    }));
    
    setMeteors(meteorArray);
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* 多层渐变背景 - 始终渲染 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-950 dark:via-purple-950 dark:to-gray-900" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-100/30 to-transparent dark:via-purple-900/10" />
      
      {/* 增强的漂浮光点 - 只在客户端渲染 */}
      {mounted && particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute rounded-full blur-sm"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
          }}
          initial={{
            x: particle.initialX,
            y: particle.initialY,
          }}
          animate={{
            x: particle.targetX,
            y: particle.targetY,
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* 流星效果 - 只在客户端渲染 */}
      {mounted && meteors.map((meteor) => (
        <motion.div
          key={`meteor-${meteor.id}`}
          className="absolute w-1 h-24 bg-gradient-to-b from-purple-400 to-transparent rounded-full"
          style={{
            top: -100,
            right: `${Math.random() * 100}%`,
            transform: 'rotate(-45deg)',
          }}
          animate={{
            y: window.innerHeight + 200,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 2,
            delay: meteor.delay,
            repeat: Infinity,
            repeatDelay: 8 + Math.random() * 10,
            ease: 'linear',
          }}
        />
      ))}
      
      {/* 呼吸灯脉冲圆圈 */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`pulse-${i}`}
          className="absolute rounded-full"
          style={{
            top: `${20 + i * 30}%`,
            left: `${10 + i * 35}%`,
            width: `${200 + i * 100}px`,
            height: `${200 + i * 100}px`,
            background: i % 2 === 0
              ? 'radial-gradient(circle, rgba(167, 139, 250, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      {/* 大型模糊圆形（增强版）*/}
      <motion.div
        className="absolute top-1/4 -left-48 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-600/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 80, 0],
          y: [0, 50, 0],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-pink-300/20 dark:bg-pink-600/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.4, 1],
          x: [0, -80, 0],
          y: [0, -50, 0],
          rotate: [0, -90, 0],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-blue-300/15 dark:bg-blue-600/8 rounded-full blur-3xl"
        style={{ x: '-50%', y: '-50%' }}
        animate={{
          scale: [1, 1.25, 1],
          rotate: [0, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}

