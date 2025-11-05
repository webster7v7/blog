import SiteStats from './SiteStats';

export default function Footer() {
  return (
    <footer className="mt-20 py-12 border-t border-gray-200/20 dark:border-gray-800/20">
      <div className="max-w-5xl mx-auto px-6">
        {/* 网站统计信息 */}
        <SiteStats />
        
        {/* 版权信息 */}
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} Webster. 在校大学生，探索代码与创意的交界。
          </p>
        </div>
      </div>
    </footer>
  );
}

