import React from 'react';
import { ExternalLink } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  image: string;
  link: string;
}

interface ProjectsWindowProps {
  projects: Project[];
}

export const ProjectsWindow: React.FC<ProjectsWindowProps> = ({ projects }) => {
  return (
    <div className="space-y-4 font-tahoma text-[11px] sm:text-[12px]">
      <div className="bg-[#FFFFE1] border border-[#ACA899] p-2 flex items-center gap-2 mb-2">
        <div className="text-blue-600 font-bold text-lg">ⓘ</div>
        <div className="text-black">
          <p className="font-bold">My Projects</p>
          <p className="text-[10px]">Four pinned projects from my GitHub</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white border text-black p-[2px] shadow-sm flex flex-col h-full"
            style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
          >
            {/* Project Window Frame */}
            <div className="flex-1 border border-[#D4D0C8] p-2 flex flex-col gap-2 relative group hover:bg-[#F7F7F7] transition-colors">
              <div className="h-[120px] w-full border border-[#808080] bg-black/5 overflow-hidden">
                <img
                  src={'images/' + project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-[#003399] font-bold text-[12px] truncate">{project.title}</h3>

              <p className="text-black leading-snug text-[11px] mb-2 flex-1">
                {project.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-2">
                {project.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="px-1.5 py-0.5 bg-[#EFEFEF] border border-[#D4D0C8] text-[#333] text-[10px] rounded-[2px]"
                  >
                    {tech}
                  </span>
                ))}
                {project.technologies.length > 4 && (
                  <span className="text-[9px] text-gray-500 self-center">...</span>
                )}
              </div>

              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="xp-button flex items-center justify-center gap-1 w-full mt-auto active:translate-y-[1px]"
              >
                <span>View on GitHub</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
