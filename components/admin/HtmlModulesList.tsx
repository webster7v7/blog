'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Loader2, Plus, Code, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import HtmlModuleForm from './HtmlModuleForm';
import { HtmlModuleWithCategory } from '@/types/html-module';

export default function HtmlModulesList() {
  const router = useRouter();
  const [modules, setModules] = useState<HtmlModuleWithCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<HtmlModuleWithCategory | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/admin/html-modules');
      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
      toast.error('加载 HTML 模块失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleDelete = async (module: HtmlModuleWithCategory) => {
    if (!confirm(`确定要删除 "${module.title}" 吗？`)) return;

    setDeletingId(module.id);
    try {
      const response = await fetch(`/api/admin/html-modules/${module.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除失败');

      toast.success('模块已删除');
      setModules(prev => prev.filter(m => m.id !== module.id));
    } catch (error) {
      toast.error('删除失败');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Code className="w-6 h-6 text-purple-600" />
          HTML 模块管理
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>新建模块</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : modules.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <p className="text-gray-500 mb-4">暂无 HTML 模块</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-purple-600 hover:underline"
          >
            创建第一个模块
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <div
              key={module.id}
              className="backdrop-blur-md bg-white/60 dark:bg-gray-900/60 p-4 rounded-xl border border-gray-200/30 dark:border-gray-800/30 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {module.title}
                    </h3>
                    {module.link_type === 'external' && <ExternalLink className="w-3 h-3 text-gray-400" />}
                    {module.link_type === 'page' && <FileText className="w-3 h-3 text-gray-400" />}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      module.is_active 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {module.is_active ? '已启用' : '已禁用'}
                    </span>
                    {module.categoryData && (
                      <span 
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: module.categoryData.color }}
                      >
                        {module.categoryData.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingModule(module)}
                    className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(module)}
                    disabled={deletingId === module.id}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="删除"
                  >
                    {deletingId === module.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              {module.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {module.description}
                </p>
              )}
              {module.tags && module.tags.length > 0 && (
                <div className="flex gap-1 flex-wrap mb-2">
                  {module.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Slug: {module.slug}</span>
                <span>排序: {module.order_index}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {(showCreateForm || editingModule) && (
        <HtmlModuleForm
          module={editingModule}
          onClose={() => {
            setShowCreateForm(false);
            setEditingModule(null);
          }}
          onSuccess={fetchModules}
        />
      )}
    </div>
  );
}
