import Link from 'next/link';
import SearchBar from './SearchBar';
import AuthButton from './auth/AuthButton';
import ExternalLinksMenu from './ExternalLinksMenu';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-white/70 dark:bg-black/70 border-b border-gray-200/20 dark:border-gray-800/20">
      <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
          Webster
        </Link>
        
        <div className="flex items-center gap-4">
          <SearchBar />
          
          {/* 外链导航菜单 */}
          <ExternalLinksMenu />
          
          <div className="hidden md:flex gap-6">
            <Link 
              href="/" 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              首页
            </Link>
            <Link 
              href="/archive" 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              归档
            </Link>
            <Link 
              href="/about" 
              className="text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              关于
            </Link>
          </div>
          
          <AuthButton />
        </div>
      </nav>
    </header>
  );
}

