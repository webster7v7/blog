'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

interface TagCloudProps {
  tags: string[];
}

export default function TagCloud({ tags }: TagCloudProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 rounded-2xl p-6 border border-gray-200/30 dark:border-gray-800/30">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        标签
      </h3>
      <div className="flex flex-wrap gap-3">
        {tags.map((tag, index) => (
          <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`}>
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.1 }}
              className="inline-block px-4 py-2 text-sm rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white cursor-pointer hover:shadow-lg transition-shadow"
            >
              {tag}
            </motion.span>
          </Link>
        ))}
      </div>
    </div>
  );
}

