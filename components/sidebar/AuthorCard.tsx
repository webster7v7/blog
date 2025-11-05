import { User, Mail, Github, Globe } from 'lucide-react';
import SidebarCard from './SidebarCard';

export default function AuthorCard() {
  return (
    <SidebarCard>
      <div className="text-center">
        {/* 头像 */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg">
          W
        </div>

        {/* 名字 */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Webster
        </h3>

        {/* 简介 */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          在校大学生，探索代码与创意的交界
        </p>

        {/* 统计 */}
        <div className="grid grid-cols-3 gap-2 mb-4 py-3 border-y border-gray-200/30 dark:border-gray-800/30">
          <div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
              12
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              文章
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-pink-600 dark:text-pink-400">
              3
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              分类
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              8
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              标签
            </div>
          </div>
        </div>

        {/* 社交链接 */}
        <div className="flex justify-center gap-3">
          <a
            href="mailto:your@email.com"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Email"
          >
            <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </a>
          <a
            href="https://yourwebsite.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Website"
          >
            <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </a>
        </div>
      </div>
    </SidebarCard>
  );
}

