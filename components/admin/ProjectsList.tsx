'use client';

import { useState } from 'react';
import { Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import type { Project } from '@/types/projects';
import { PROJECT_CATEGORIES } from '@/types/projects';
import ProjectForm from './ProjectForm';

interface ProjectsListProps {
  initialProjects: Project[];
}

export default function ProjectsList({ initialProjects }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？')) return;

    try {
      const response = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      setProjects(projects.filter(project => project.id !== id));
      toast.success('项目已删除');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('删除失败');
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleSuccess = async () => {
    // Refresh projects
    const response = await fetch('/api/admin/projects');
    const data = await response.json();
    setProjects(data);
    setShowForm(false);
    setEditingProject(null);
  };

  const togglePublished = async (project: Project) => {
    try {
      const response = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !project.is_published }),
      });

      if (!response.ok) throw new Error('Failed to update');

      const updatedProject = await response.json();
      setProjects(projects.map(p => p.id === project.id ? updatedProject : p));
      toast.success(updatedProject.is_published ? '项目已发布' : '项目已隐藏');
    } catch (error) {
      console.error('Error toggling published:', error);
      toast.error('操作失败');
    }
  };

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter);

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">项目管理</h2>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">全部类型</option>
            {Object.entries(PROJECT_CATEGORIES).map(([value, { label }]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => {
            setEditingProject(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 whitespace-nowrap"
        >
          添加项目
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">{editingProject ? '编辑项目' : '新建项目'}</h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              取消
            </button>
          </div>
          <ProjectForm project={editingProject || undefined} onSuccess={handleSuccess} />
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">项目名称</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">类型</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">状态</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">浏览/下载</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">标签</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">排序</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {filteredProjects.map((project) => (
              <tr key={project.id}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {project.icon && (
                      <img src={project.icon} alt="" className="w-8 h-8 object-cover rounded" />
                    )}
                    <div>
                      <div className="font-medium">{project.title}</div>
                      {project.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {project.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                    {PROJECT_CATEGORIES[project.category].label}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <button
                    onClick={() => togglePublished(project)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                      project.is_published
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {project.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                    {project.is_published ? '已发布' : '未发布'}
                  </button>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {project.views} / {project.downloads}
                </td>
                <td className="px-4 py-4">
                  {project.tags && project.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        >
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 2 && (
                        <span className="text-xs text-gray-500">+{project.tags.length - 2}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{project.order_index}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(project)}
                      className="text-blue-500 hover:text-blue-700"
                      title="编辑"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-red-500 hover:text-red-700"
                      title="删除"
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

      {filteredProjects.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {filter === 'all' ? '还没有添加项目' : '该类型下没有项目'}
        </div>
      )}
    </div>
  );
}

