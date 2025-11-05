'use client';

import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { useRef } from 'react';

interface FadeInViewProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export default function FadeInView({ 
  children, 
  direction = 'up', 
  delay = 0,
  className = '' 
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.1 });

  const directionOffset = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { y: 0, x: 40 },
    right: { y: 0, x: -40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directionOffset[direction],
      }}
      animate={isInView ? {
        opacity: 1,
        x: 0,
        y: 0,
      } : {}}
      transition={{
        duration: 0.6,
        delay,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

