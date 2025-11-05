'use client';

import { useMousePosition } from '@/hooks/useMousePosition';
import { motion } from 'framer-motion';

export default function MouseGlow() {
  const { x, y } = useMousePosition();

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      animate={{
        background: `radial-gradient(600px circle at ${x}px ${y}px, rgba(167, 139, 250, 0.15), transparent 40%)`,
      }}
      transition={{ type: 'spring', damping: 30, stiffness: 200 }}
    />
  );
}

