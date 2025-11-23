import { getCachedExternalLinks } from '@/lib/personal-links';
import * as Icons from 'lucide-react';

export default async function ExternalSidebar() {
  const links = await getCachedExternalLinks();

  if (!links || links.length === 0) return null;

  const getIcon = (iconName: string | null) => {
    if (!iconName) return null;
    // @ts-ignore - Dynamic icon access
    const Icon = Icons[iconName] || Icons.Link;
    return <Icon className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4 px-4 animate-fade-in-right">
      <h3 className="text-lg font-bold mb-3 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent flex items-center gap-2">
        <Icons.Globe className="w-5 h-5 text-blue-500" />
        外链导航
      </h3>
      <nav className="space-y-1.5">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm group"
          >
            <div className="flex items-center gap-2">
              {getIcon(link.icon)}
              <span>{link.name}</span>
            </div>
            <Icons.ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
          </a>
        ))}
      </nav>
    </div>
  );
}
