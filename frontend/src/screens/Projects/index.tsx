import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import './styles.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faProjectDiagram, 
  faClipboardList, 
  faStickyNote, 
  faCalendarAlt, 
  faBell, 
  faFileAlt, 
  faPlus, 
  faCalendarDay, 
  faChartLine,
  faBars,
  faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import { useApi } from '../../hooks/useApi';
import api, {
  Project,
  Task,
  Note,
  Event,
  Reminder,
  File,
  projectsApi,
  tasksApi,
  notesApi,
  eventsApi,
  remindersApi,
  filesApi
} from '../../services/api';

// Lazy load modal components
const ProjectModal = lazy(() => import('../../components/ProjectModal'));
const TaskModal = lazy(() => import('../../components/TaskModal'));
const NoteModal = lazy(() => import('../../components/NoteModal'));
const EventModal = lazy(() => import('../../components/EventModal'));
const ReminderModal = lazy(() => import('../../components/ReminderModal'));

// Dictionary type for linked items
type ItemsDict<T> = Record<string, T>;

// Load state component
const LoadingState: React.FC = () => (
  <div className="loading-state">
    <div className="loading-spinner"></div>
    <p>Loading data...</p>
  </div>
);

// Error state component
const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="error-state">
    <FontAwesomeIcon icon={faExclamationTriangle} className="error-icon" />
    <h3>Error Loading Data</h3>
    <p>{message}</p>
    <button onClick={onRetry} className="form-button button-primary">Try Again</button>
  </div>
);

// Placeholder component for modals when lazy loading
const ModalFallback: React.FC = () => (
  <div className="modal-loading">
    <div className="loading-spinner"></div>
    <p>Loading form...</p>
  </div>
);

// Format functions for each type of linked item
const formatTask = (task: Task) => {
  const statusClass = task.status.replace('-', '');
  const priorityClass = task.priority ? task.priority.toLowerCase() : 'low';
  return (
    <>
      <span className="linked-item-name"><span className="item-icon">✅</span> {task.name}</span>
      <span className="linked-item-meta">
        <span className={`status-circle ${statusClass}`} title={`Status: ${task.status}`}></span>
        {task.dueDate && `Due: ${task.dueDate}`}
        {task.priority && <span className={`priority priority-${priorityClass}`}>{task.priority}</span>}
      </span>
    </>
  );
};

const formatNote = (note: Note) => (
  <>
    <span className="linked-item-name"><span className="item-icon">📝</span> {note.title}</span>
    <span className="linked-item-meta">{note.date}</span>
  </>
);

const formatEvent = (event: Event) => {
  const tagClass = event.type === 'meeting' ? 'event-type-meeting' : 'event-type-deadline';
  return (
    <>
      <span className="linked-item-name"><span className="item-icon">🗓️</span> {event.name}</span>
      <span className="linked-item-meta">
        {event.date} <span className={`list-item-tag ${tagClass}`} style={{ marginLeft: '5px' }}>{event.type}</span>
      </span>
    </>
  );
};

const formatReminder = (reminder: Reminder) => {
  const priorityClass = reminder.priority ? reminder.priority.toLowerCase() : 'low';
  return (
    <>
      <span className="linked-item-name"><span className="item-icon">🔔</span> {reminder.name}</span>
      <span className="linked-item-meta">
        {reminder.dueDate}
        {reminder.priority && <span className={`priority priority-${priorityClass}`}>{reminder.priority}</span>}
      </span>
    </>
  );
};

const formatFile = (file: File) => (
  <>
    <span className="linked-item-name"><span className="item-icon">📎</span> {file.name}</span>
    <span className="linked-item-meta">{file.type || ''}</span>
  </>
);

// Linked items list component
const LinkedItemsList = React.memo(({ 
  items, 
  itemsData, 
  formatter, 
  emptyMessage = "No related items found." 
}: { 
  items: string[], 
  itemsData: ItemsDict<any>, 
  formatter: (item: any) => React.ReactNode,
  emptyMessage?: string 
}) => {
  if (!items || items.length === 0) {
    return <li className="no-items-message">{emptyMessage}</li>;
  }

  // If we don't have the items data (empty dictionaries)
  if (Object.keys(itemsData).length === 0 && items.length > 0) {
    return <li className="no-items-message">Related items exist but are not loaded. Click the + button to add new ones.</li>;
  }

  return (
    <>
      {items.map(id => {
        const item = itemsData[id];
        if (!item) return null;
        return (
          <li key={id} className="linked-item">
            {formatter(item)}
          </li>
        );
      })}
    </>
  );
});

// Project list item component
const ProjectListItem = React.memo(({ 
  project, 
  isActive, 
  onSelect 
}: { 
  project: Project, 
  isActive: boolean, 
  onSelect: (id: string) => void 
}) => (
  <li 
    className={`project-summary-card ${isActive ? 'active' : ''}`}
    onClick={() => onSelect(project.id)}
  >
    <div className="project-summary-title">
      <span className="icon">{project.icon || '📁'}</span> {project.name}
    </div>
    <div className="project-summary-meta">
      <span className={`project-status-tag status-${project.status.toLowerCase().replace(' ', '')}`}>
        {project.status}
      </span>
      {project.startDate && <span> | Started: {project.startDate}</span>}
    </div>
  </li>
));

// Project details section component
const ProjectDetailSection = React.memo(({
  title,
  icon,
  items,
  itemsData,
  formatter,
  onAddItem
}: {
  title: string,
  icon: any,
  items: string[],
  itemsData: ItemsDict<any>,
  formatter: (item: any) => React.ReactNode,
  onAddItem: () => void
}) => (
  <div className="linked-items-section">
    <h3 className="linked-items-title">
      <span className="title-content">
        <FontAwesomeIcon className="icon" icon={icon} /> {title}
      </span>
      <button
        className="add-linked-item-button"
        title={`Add New ${title.replace('Related ', '')}`}
        onClick={onAddItem}
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
    </h3>
    <ul className="linked-item-list">
      <LinkedItemsList
        items={items}
        itemsData={itemsData}
        formatter={formatter}
      />
    </ul>
  </div>
));

const Projects: React.FC = () => {
  // State for project selection and modals
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMemo(() => window.matchMedia('(max-width: 768px)').matches, []);
  
  // Data fetching hook - only fetch projects
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects
  } = useApi<Project[]>(() => projectsApi.getAll());
  
  // Convert projects to dictionary for easier access - memoized
  const projectsDict = useMemo(() => {
    return projects ? projects.reduce<ItemsDict<Project>>((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {}) : {};
  }, [projects]);

  // Initialize empty dictionaries for linked items
  const tasksDict = useMemo<ItemsDict<Task>>(() => ({}), []);
  const notesDict = useMemo<ItemsDict<Note>>(() => ({}), []);
  const eventsDict = useMemo<ItemsDict<Event>>(() => ({}), []);
  const remindersDict = useMemo<ItemsDict<Reminder>>(() => ({}), []);
  const filesDict = useMemo<ItemsDict<File>>(() => ({}), []);

  // When selectedProjectId changes, fetch the project
  useEffect(() => {
    if (selectedProjectId && projects) {
      const project = projectsDict[selectedProjectId];
      if (project) {
        setSelectedProject(project);
      }
    } else {
      setSelectedProject(null);
    }
  }, [selectedProjectId, projects, projectsDict]);

  // Set sidebar state based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const selectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
  }, []);

  // Modal handlers
  const handleAddLinkedItem = (type: string) => {
    if (!selectedProject) {
      console.error('No project selected');
      return;
    }
    
    switch (type) {
      case 'Task':
        setShowAddTaskModal(true);
        break;
      case 'Note':
        setShowAddNoteModal(true);
        break;
      case 'Event':
        setShowAddEventModal(true);
        break;
      case 'Reminder':
        setShowAddReminderModal(true);
        break;
      case 'File':
        // File upload will be handled differently
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = async (e) => {
          const target = e.target as HTMLInputElement;
          if (target.files && target.files.length > 0) {
            const file = target.files[0];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('projectId', selectedProject.id);
            
            try {
              const createdFile = await filesApi.create(formData);
              
              // Update the project's files array
              await projectsApi.update(selectedProject.id, {
                files: [...selectedProject.files, createdFile.id]
              });
              
              // Refresh project data
              await refetchProjects();
              
              // Update the selected project with the latest data
              if (projects && selectedProject) {
                const updatedProject = projects.find(p => p.id === selectedProject.id);
                if (updatedProject) {
                  setSelectedProject(updatedProject);
                }
              }
              
              alert(`File "${file.name}" uploaded successfully.`);
            } catch (error) {
              console.error('Failed to upload file:', error);
              alert('Failed to upload file. Please try again.');
            }
          }
        };
        fileInput.click();
        break;
      default:
        console.error("Unknown item type:", type);
    }
  };

  // Event handlers for form submissions
  const handleProjectSubmit = async (projectData: Omit<Project, 'id'> & { uploadedFile?: globalThis.File }) => {
    try {
      // Create a clean project object without the uploadedFile property
      const { uploadedFile, ...projectDataForApi } = projectData;
      
      // First create the project
      const newProject = await projectsApi.create(projectDataForApi);
      
      // If there's a file to upload
      if (uploadedFile) {
        // Create a FormData object for file upload
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('projectId', newProject.id);
        
        try {
          // Upload the file
          const createdFile = await filesApi.create(formData);
          
          // Update the project with the file reference
          await projectsApi.update(newProject.id, {
            files: [createdFile.id]
          });
        } catch (error) {
          console.error('Failed to upload file:', error);
          alert('Project created, but file upload failed. Please try adding the file later.');
        }
      }
      
      // Refresh projects data
      await refetchProjects();
      setShowAddProjectModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  const handleTaskSubmit = async (taskData: Omit<Task, 'id'>) => {
    if (!selectedProject) return;
    
    try {
      const newTask = await tasksApi.create({
        ...taskData,
        projectId: selectedProject.id
      });
      
      await projectsApi.update(selectedProject.id, {
        tasks: [...selectedProject.tasks, newTask.id]
      });
      
      await refetchProjects();
      
      if (projects) {
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) setSelectedProject(updatedProject);
      }
      
      setShowAddTaskModal(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      alert('Failed to add task. Please try again.');
    }
  };

  const handleNoteSubmit = async (noteData: Omit<Note, 'id'>) => {
    if (!selectedProject) return;
    
    try {
      const newNote = await notesApi.create({
        ...noteData,
        project: selectedProject.id
      });
      
      await projectsApi.update(selectedProject.id, {
        notes: [...selectedProject.notes, newNote.id]
      });
      
      await refetchProjects();
      
      if (projects) {
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) setSelectedProject(updatedProject);
      }
      
      setShowAddNoteModal(false);
    } catch (error) {
      console.error('Failed to add note:', error);
      alert('Failed to add note. Please try again.');
    }
  };

  const handleEventSubmit = async (eventData: Omit<Event, 'id'>) => {
    if (!selectedProject) return;
    
    try {
      const newEvent = await eventsApi.create({
        ...eventData,
        projectId: selectedProject.id
      });
      
      await projectsApi.update(selectedProject.id, {
        events: [...selectedProject.events, newEvent.id]
      });
      
      await refetchProjects();
      
      if (projects) {
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) setSelectedProject(updatedProject);
      }
      
      setShowAddEventModal(false);
    } catch (error) {
      console.error('Failed to add event:', error);
      alert('Failed to add event. Please try again.');
    }
  };

  const handleReminderSubmit = async (reminderData: Omit<Reminder, 'id'>) => {
    if (!selectedProject) return;
    
    try {
      const newReminder = await remindersApi.create({
        ...reminderData,
        projectId: selectedProject.id
      });
      
      await projectsApi.update(selectedProject.id, {
        reminders: [...selectedProject.reminders, newReminder.id]
      });
      
      await refetchProjects();
      
      if (projects) {
        const updatedProject = projects.find(p => p.id === selectedProject.id);
        if (updatedProject) setSelectedProject(updatedProject);
      }
      
      setShowAddReminderModal(false);
    } catch (error) {
      console.error('Failed to add reminder:', error);
      alert('Failed to add reminder. Please try again.');
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={toggleSidebar} 
              className="sidebar-toggle"
            >
              <FontAwesomeIcon icon={faBars} />
            </button>
            <h1 className="dashboard-title"><FontAwesomeIcon icon={faProjectDiagram} /> Projects & Businesses</h1>
          </div>
        </div>

        <div className="projects-layout">
          {/* Project List Sidebar */}
          <aside className="project-list-pane">
            <div className="project-list-header">
              <h2 className="project-list-title">Projects & Businesses</h2>
              <button className="new-project-button" onClick={() => setShowAddProjectModal(true)}>
                <FontAwesomeIcon icon={faPlus} /> New
              </button>
            </div>
            <div className="project-list-container">
              <ul className="project-list">
                {Object.values(projectsDict).map(project => (
                  <ProjectListItem 
                    key={project.id}
                    project={project}
                    isActive={selectedProject?.id === project.id}
                    onSelect={selectProject}
                  />
                ))}
              </ul>
            </div>
          </aside>

          {/* Project Details */}
          <main className="project-details-pane">
            {!selectedProject ? (
              <div className="details-placeholder">
                <FontAwesomeIcon className="icon" icon={faProjectDiagram} style={{ fontSize: '3em' }} />
                <h2>Select a Project</h2>
                <p>Choose a project or business from the list to see its details and related items.</p>
              </div>
            ) : (
              <div className="project-details-view">
                <div className="project-details-header">
                  <h1 className="project-details-title">{selectedProject.name}</h1>
                  <div className="project-details-meta">
                    <span>
                      <FontAwesomeIcon className="icon" icon={faChartLine} /> Status: 
                      <span className={`project-status-tag status-${selectedProject.status.toLowerCase().replace(' ', '')}`}>
                        {selectedProject.status}
                      </span>
                    </span>
                    <span>
                      <FontAwesomeIcon className="icon" icon={faCalendarDay} /> Dates: 
                      {selectedProject.startDate ? ` Started: ${selectedProject.startDate}` : ' No start date'}
                      {selectedProject.endDate ? ` | Ended: ${selectedProject.endDate}` : (selectedProject.status !== 'Completed' && selectedProject.startDate ? ' | Ongoing' : '')}
                    </span>
                  </div>
                </div>

                <div className="project-details-description">
                  <p>{selectedProject.description || 'No description provided.'}</p>
                </div>

                {/* Related Tasks */}
                <ProjectDetailSection
                  title="Related Tasks"
                  icon={faClipboardList}
                  items={selectedProject.tasks}
                  itemsData={tasksDict}
                  formatter={formatTask}
                  onAddItem={() => handleAddLinkedItem('Task')}
                />

                {/* Related Notes */}
                <ProjectDetailSection
                  title="Related Notes"
                  icon={faStickyNote}
                  items={selectedProject.notes}
                  itemsData={notesDict}
                  formatter={formatNote}
                  onAddItem={() => handleAddLinkedItem('Note')}
                />

                {/* Related Events */}
                <ProjectDetailSection
                  title="Related Events"
                  icon={faCalendarAlt}
                  items={selectedProject.events}
                  itemsData={eventsDict}
                  formatter={formatEvent}
                  onAddItem={() => handleAddLinkedItem('Event')}
                />

                {/* Related Reminders */}
                <ProjectDetailSection
                  title="Related Reminders"
                  icon={faBell}
                  items={selectedProject.reminders}
                  itemsData={remindersDict}
                  formatter={formatReminder}
                  onAddItem={() => handleAddLinkedItem('Reminder')}
                />

                {/* Related Files */}
                <ProjectDetailSection
                  title="Related Files"
                  icon={faFileAlt}
                  items={selectedProject.files}
                  itemsData={filesDict}
                  formatter={formatFile}
                  onAddItem={() => handleAddLinkedItem('File')}
                />
              </div>
            )}
          </main>
        </div>

        {/* Modal components with lazy loading */}
        {showAddProjectModal && (
          <Suspense fallback={<ModalFallback />}>
            <ProjectModal 
              onClose={() => setShowAddProjectModal(false)}
              onSubmit={handleProjectSubmit}
            />
          </Suspense>
        )}

        {showAddTaskModal && selectedProject && (
          <Suspense fallback={<ModalFallback />}>
            <TaskModal 
              projectName={selectedProject.name}
              onClose={() => setShowAddTaskModal(false)}
              onSubmit={handleTaskSubmit}
            />
          </Suspense>
        )}

        {showAddNoteModal && selectedProject && (
          <Suspense fallback={<ModalFallback />}>
            <NoteModal 
              projectName={selectedProject.name}
              onClose={() => setShowAddNoteModal(false)}
              onSubmit={handleNoteSubmit}
            />
          </Suspense>
        )}

        {showAddEventModal && selectedProject && (
          <Suspense fallback={<ModalFallback />}>
            <EventModal 
              projectName={selectedProject.name}
              onClose={() => setShowAddEventModal(false)}
              onSubmit={handleEventSubmit}
            />
          </Suspense>
        )}

        {showAddReminderModal && selectedProject && (
          <Suspense fallback={<ModalFallback />}>
            <ReminderModal 
              projectName={selectedProject.name}
              onClose={() => setShowAddReminderModal(false)}
              onSubmit={handleReminderSubmit}
            />
          </Suspense>
        )}
      </main>
    </div>
  );
};

export default Projects; 