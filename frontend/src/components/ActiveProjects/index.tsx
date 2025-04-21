import React from 'react';
import './styles.css';

interface Project {
  id: number;
  title: string;
  status: 'Planning' | 'In Progress' | 'Active';
}

const ActiveProjects: React.FC = () => {
  const projects: Project[] = [
    {
      id: 1,
      title: 'Spring Collection Launch',
      status: 'In Progress'
    },
    {
      id: 2,
      title: 'Website Redesign',
      status: 'Planning'
    },
    {
      id: 3,
      title: 'Smart Jeweler Ads',
      status: 'Active'
    },
    {
      id: 4,
      title: 'New Packaging Order',
      status: 'In Progress'
    },
    {
      id: 5,
      title: 'Q2 Marketing Plan',
      status: 'Planning'
    }
  ];

  const getStatusClassName = (status: string): string => {
    return status.toLowerCase().replace(' ', '-');
  };

  return (
    <div className="projects-container">
      <h2>
        <span className="icon">📁</span>
        Active Project Status
      </h2>
      
      <div className="projects-list">
        {projects.map(project => (
          <div key={project.id} className="project-item">
            <div className="project-title">{project.title}</div>
            <div 
              className={`project-status ${getStatusClassName(project.status)}`}
            >
              {project.status}
            </div>
          </div>
        ))}
      </div>
      
      <div className="projects-footer">
        (Showing active projects)
      </div>
    </div>
  );
};

export default ActiveProjects; 