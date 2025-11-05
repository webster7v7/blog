import { ReactNode } from 'react';

interface SidebarCardProps {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
}

export default function SidebarCard({ title, icon, children }: SidebarCardProps) {
  return (
    <div className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 rounded-2xl p-5 border border-gray-200/30 dark:border-gray-800/30 hover:border-purple-400/50 dark:hover:border-purple-600/50 transition-all duration-300">
      {title && (
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200/30 dark:border-gray-800/30">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
}

