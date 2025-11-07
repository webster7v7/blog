'use client';

import { useScrollPosition } from '@/hooks/useScrollPosition';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const scrollPosition = useScrollPosition();
  const isVisible = scrollPosition > 300;

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-8 right-8 z-40 p-3 rounded-full 
        backdrop-blur-md bg-gradient-to-r from-purple-500 to-pink-500 
        text-white shadow-lg
        transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-0 pointer-events-none'}
        hover:shadow-xl hover:scale-110
      `}
      aria-label="返回顶部"
    >
      <ArrowUp className="w-6 h-6" />
    </button>
  );
}
