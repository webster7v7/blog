'use client';

import { useEffect } from 'react';

export default function HideFrontendNav() {
  useEffect(() => {
    // 隐藏前台导航元素
    const style = document.createElement('style');
    style.textContent = `
      /* 隐藏前台 Header */
      body > header {
        display: none !important;
      }
      /* 隐藏顶部标签栏（TopTagBar） - 使用更精确的选择器 */
      body > div.fixed[class*="top-"] {
        display: none !important;
      }
      /* 隐藏前台 Footer */
      body > footer {
        display: none !important;
      }
      /* 隐藏滚动到顶部按钮 */
      body > button[class*="fixed"],
      body > div[class*="fixed"][class*="bottom-"] {
        display: none !important;
      }
      /* 移除主内容区的顶部padding */
      body > main {
        padding-top: 0 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      // 清理
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  return null;
}

