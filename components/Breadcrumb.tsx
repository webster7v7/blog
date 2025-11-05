import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-6">
      <Link
        href="/"
        className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
      >
        首页
      </Link>
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          <span>/</span>
          {index === items.length - 1 ? (
            <span className="text-gray-900 dark:text-gray-100">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

