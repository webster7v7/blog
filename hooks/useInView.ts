'use client';

import { useState, useEffect, RefObject } from 'react';

export function useInView<T extends Element = Element>(
  ref: RefObject<T | null>, 
  options?: IntersectionObserverInit
) {
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting);
    }, options);

    observer.observe(ref.current);

    return () => {
      const current = ref.current;
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [ref, options]);

  return isInView;
}

