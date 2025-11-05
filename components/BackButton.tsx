'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface BackButtonProps {
  text?: string;
}

export default function BackButton({ text = '返回' }: BackButtonProps) {
  const router = useRouter();

  return (
    <motion.button
      whileHover={{ x: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => router.back()}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border border-gray-200/30 dark:border-gray-800/30 text-gray-700 dark:text-gray-300 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-colors"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      <span>{text}</span>
    </motion.button>
  );
}

