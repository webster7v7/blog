'use client';

import { useEffect, useRef, useState } from 'react';

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
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  const directionClasses = {
    up: 'translate-y-8',
    down: '-translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
  };

  return (
    <div
      ref={ref}
      className={`
        transition-all duration-700 ease-out
        ${isVisible 
          ? 'opacity-100 translate-x-0 translate-y-0' 
          : `opacity-0 ${directionClasses[direction]}`
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}
