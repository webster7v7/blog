import { createPublicClient } from '@/lib/supabase';
import HtmlModuleCard from '@/components/HtmlModuleCard';
import { HtmlModule, HtmlModuleWithCategory } from '@/types/html-module';

export default async function HtmlModulesDisplay() {
  const supabase = createPublicClient();
  
  // @ts-expect-error - Supabase types not updating immediately
  const { data: modules, error } = await supabase
    .from('html_modules')
    .select('*, categories(*)')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching HTML modules:', error);
    return null;
  }

  if (!modules || modules.length === 0) {
    return null;
  }

  // 映射分类数据
  const typedModules = modules as unknown as HtmlModule[];
  const modulesWithCategory = typedModules.map((module: any) => ({
    ...module,
    categoryData: module.categories || null,
  })) as HtmlModuleWithCategory[];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {modulesWithCategory.map((module) => (
        <HtmlModuleCard key={module.id} module={module} />
      ))}
    </section>
  );
}
