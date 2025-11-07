'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  text?: string;
}

export default function BackButton({ text = '返回' }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="
        inline-flex items-center gap-2 px-4 py-2 rounded-lg 
        backdrop-blur-md bg-white/60 dark:bg-gray-900/60 
        border border-gray-200/30 dark:border-gray-800/30 
        text-gray-700 dark:text-gray-300 
        hover:border-purple-400/50 dark:hover:border-purple-600/50 
        transition-all duration-200
        hover:-translate-x-1
      "
    >
      <ArrowLeft className="h-5 w-5" />
      <span>{text}</span>
    </button>
  );
}
