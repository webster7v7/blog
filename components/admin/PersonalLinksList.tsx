'use client';

import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import type { PersonalLink } from '@/types/projects';
import PersonalLinksForm from './PersonalLinksForm';

interface PersonalLinksListProps {
  initialLinks: PersonalLink[];
}

export default function PersonalLinksList({ initialLinks }: PersonalLinksListProps) {
  const [links, setLinks] = useState<PersonalLink[]>(initialLinks);
  const [editingLink, setEditingLink] = useState<PersonalLink | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个链接吗？')) return;

    try {
      const response = await fetch(`/api/admin/personal-links/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete');
      }

      setLinks(links.filter(link => link.id !== id));
      toast.success('链接已删除');
    } catch (error) {
      console.error('Error deleting link:', error);
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  const handleEdit = (link: PersonalLink) => {
    setEditingLink(link);
    setShowForm(true);
  };

  const handleSuccess = async () => {
    // Refresh links
    const response = await fetch('/api/admin/personal-links');
    const data = await response.json();
    setLinks(data);
    setShowForm(false);
    setEditingLink(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">个人链接管理</h2>
        <button
          onClick={() => {
            setEditingLink(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          添加链接
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">{editingLink ? '编辑链接' : '新建链接'}</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingLink(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
          </div>
          <PersonalLinksForm link={editingLink || undefined} onSuccess={handleSuccess} />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">名称</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">图标</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">链接</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">描述</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">排序</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {links.map((link) => (
              <tr key={link.id}>
                <td className="px-4 py-4 whitespace-nowrap">{link.name}</td>
                <td className="px-4 py-4 whitespace-nowrap">{link.icon}</td>
                <td className="px-4 py-4">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate block max-w-xs"
                  >
                    {link.url}
                  </a>
                </td>
                <td className="px-4 py-4">{link.description || '-'}</td>
                <td className="px-4 py-4 whitespace-nowrap">{link.order_index}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(link)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(link.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {links.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          还没有添加个人链接
        </div>
      )}
    </div>
  );
}

