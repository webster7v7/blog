import { getCachedProjects } from '@/lib/projects';
import ProjectCard from '@/components/ProjectCard';

export default async function HomeProjectsSection() {
  const projects = await getCachedProjects();

  if (!projects || projects.length === 0) return null;

  // 只显示前 4 个项目
  const displayProjects = projects.slice(0, 4);

  return (
    <section className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
          已开发项目
        </h2>
        <a 
          href="/projects" 
          className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:underline transition-all"
        >
          查看全部 &rarr;
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayProjects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
