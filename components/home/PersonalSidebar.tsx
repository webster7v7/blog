import { getCachedPersonalLinks } from '@/lib/personal-links';
import * as Icons from 'lucide-react';

export default async function PersonalSidebar() {
  const links = await getCachedPersonalLinks();

  if (!links || links.length === 0) return null;

  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    // @ts-expect-error - Dynamic icon access
    const Icon = Icons[iconName] || Icons.Link;
    return <Icon className="w-5 h-5" />;
  };

  return (
    <div className="space-y-4 px-4 animate-fade-in-left">
      <h3 className="text-lg font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
        <Icons.User className="w-5 h-5 text-purple-600" />
        个人链接
      </h3>
      <nav className="space-y-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 group"
          >
            <span className="text-gray-500 group-hover:text-purple-500 transition-colors">
              {getIcon(link.icon)}
            </span>
            <span className="font-medium text-sm">{link.name}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
