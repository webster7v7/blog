'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Eye, EyeOff, GripVertical } from 'lucide-react';
import type { ExternalLink } from '@/types/external-link';
import ExternalLinkForm from './ExternalLinkForm';

interface ExternalLinksListProps {
  initialLinks: ExternalLink[];
}

export default function ExternalLinksList({ initialLinks }: ExternalLinksListProps) {
  const [links, setLinks] = useState<ExternalLink[]>(initialLinks);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<ExternalLink | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 打开新建表单
  const handleCreate = () => {
    setEditingLink(null);
    setIsFormOpen(true);
  };

  // 打开编辑表单
  const handleEdit = (link: ExternalLink) => {
    setEditingLink(link);
    setIsFormOpen(true);
  };

  // 表单提交成功后的回调
  const handleFormSuccess = (savedLink: ExternalLink) => {
    if (editingLink) {
      // 更新现有链接
      setLinks(links.map((l) => (l.id === savedLink.id ? savedLink : l)));
      toast.success('外链更新成功');
    } else {
      // 添加新链接
      setLinks([...links, savedLink]);
      toast.success('外链创建成功');
    }
    setIsFormOpen(false);
    setEditingLink(null);
  };

  // 切换可见性
  const handleToggleVisibility = async (link: ExternalLink) => {
    try {
      const response = await fetch(`/api/admin/external-links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_visible: !link.is_visible }),
      });

      if (!response.ok) throw new Error('Failed to toggle visibility');

      const { link: updatedLink } = await response.json();
      setLinks(links.map((l) => (l.id === link.id ? updatedLink : l)));
      toast.success(updatedLink.is_visible ? '外链已显示' : '外链已隐藏');
    } catch (error) {
      console.error('Error toggling visibility:', error);
      toast.error('操作失败，请重试');
    }
  };

  // 删除外链
  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个外链吗？此操作无法撤销。')) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/external-links/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete link');

      setLinks(links.filter((l) => l.id !== id));
      toast.success('外链删除成功');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error('删除失败，请重试');
    } finally {
      setDeletingId(null);
    }
  };

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, link: ExternalLink) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', link.id);
  };

  // 拖拽结束
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  // 放置
  const handleDrop = async (e: React.DragEvent, targetLink: ExternalLink) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/html');
    const draggedLink = links.find((l) => l.id === draggedId);

    if (!draggedLink || draggedLink.id === targetLink.id) return;

    // 重新排序
    const newLinks = [...links];
    const draggedIndex = newLinks.findIndex((l) => l.id === draggedId);
    const targetIndex = newLinks.findIndex((l) => l.id === targetLink.id);

    newLinks.splice(draggedIndex, 1);
    newLinks.splice(targetIndex, 0, draggedLink);

    // 更新 order 字段
    const updatedLinks = newLinks.map((link, index) => ({
      ...link,
      order: index,
    }));

    setLinks(updatedLinks);

    // 批量更新到服务器
    try {
      const response = await fetch('/api/admin/external-links/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          links: updatedLinks.map((l) => ({ id: l.id, order: l.order })),
        }),
      });

      if (!response.ok) throw new Error('Failed to reorder');
      toast.success('排序已更新');
    } catch (error) {
      console.error('Error reordering:', error);
      toast.error('排序更新失败');
      setLinks(initialLinks); // 回滚
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题和新建按钮 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          外链列表 ({links.length})
        </h2>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>添加外链</span>
        </button>
      </div>

      {/* 表单对话框 */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200/30 dark:border-gray-800/30">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {editingLink ? '编辑外链' : '添加外链'}
            </h3>
            <ExternalLinkForm
              link={editingLink}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingLink(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 外链表格 */}
      {links.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>暂无外链，点击"添加外链"按钮创建第一个外链</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-12">
                  排序
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  名称
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  URL
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-24">
                  图标
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-20">
                  状态
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 w-32">
                  操作
                </th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr
                  key={link.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, link)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, link)}
                  className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-move"
                >
                  <td className="py-3 px-4">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                  </td>
                  <td className="py-3 px-4 text-gray-900 dark:text-gray-100 font-medium">
                    {link.name}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400 truncate max-w-xs">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-purple-600 dark:hover:text-purple-400"
                    >
                      {link.url}
                    </a>
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {link.icon || '-'}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleToggleVisibility(link)}
                      className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                      title={link.is_visible ? '点击隐藏' : '点击显示'}
                    >
                      {link.is_visible ? (
                        <Eye className="w-5 h-5" />
                      ) : (
                        <EyeOff className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(link)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(link.id)}
                        disabled={deletingId === link.id}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

