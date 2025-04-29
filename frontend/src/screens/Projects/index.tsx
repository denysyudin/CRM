import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { Sidebar } from '../../components/Layout';
import { Button } from '../../components/common';
import { 
  TaskModal, 
  NoteModal, 
  EventModal, 
  ReminderModal,
  ProjectModal
} from '../../components/forms';
import './styles.css';
import { BiNetworkChart } from 'react-icons/bi';
import { BsListCheck, BsPencilSquare, BsTrash } from 'react-icons/bs';
import { BsFileText, BsCalendar, BsBell } from 'react-icons/bs';
import { IoAdd } from 'react-icons/io5';
import { useApi } from '../../hooks/useApi';
import { formatDate } from '../../utils/dateUtils';
import { 
  Project,
  Task,
  Note,
  Event,
  Reminder,
  File
} from '../../types';
import {
  projectsApi,
  tasksApi,
  notesApi,
  eventsApi,
  remindersApi,
  filesApi
} from '../../services/api';

// Dictionary type for collections of items by ID
type ItemDict<T> = {
  [key: string]: T;
};

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
      <span className="linked-item-name"><span className="item-icon">✅</span> {task.title}</span>
      <span className="linked-item-meta">
        <span className={`status-circle ${statusClass}`} title={`Status: ${task.status}`}></span>
        {task.due_date && `Due: ${task.due_date}`}
        {task.priority && <span className={`priority priority-${priorityClass}`}>{task.priority}</span>}
      </span>
    </>
  );
};

const formatNote = (note: Note) => (
  <>
    <span className="linked-item-name"><span className="item-icon">📝</span> {note.title}</span>
    <span className="linked-item-meta">{note.created_at}</span>
  </>
);

const formatEvent = (event: Event) => {
  const tagClass = event.type === 'meeting' ? 'event-type-meeting' : 'event-type-deadline';
  return (
    <>
      <span className="linked-item-name"><span className="item-icon">🗓️</span> {event.title}</span>
      <span className="linked-item-meta">
        {event.due_date} <span className={`list-item-tag ${tagClass}`} style={{ marginLeft: '5px' }}>{event.type}</span>
      </span>
    </>
  );
};

const formatReminder = (reminder: Reminder) => {
  const priorityClass = reminder.priority ? reminder.priority.toLowerCase() : 'low';
  return (
    <>
      <span className="linked-item-name"><span className="item-icon">🔔</span> {reminder.title}</span>
      <span className="linked-item-meta">
        {reminder.due_date}
        {reminder.priority && <span className={`priority priority-${priorityClass}`}>{reminder.priority}</span>}
      </span>
    </>
  );
};

const formatFile = (file: File) => (
  <>
    <span className="linked-item-name"><span className="item-icon">📎</span> {file.title}</span>
    <span className="linked-item-meta">{file.type || ''}</span>
  </>
);

// Linked items list component with updated type to accept any array of items with IDs
const LinkedItemsList = React.memo(({ 
  items, 
  itemsData, 
  formatter, 
  emptyMessage = "No related items found." 
}: { 
  items: (Task | Note | Event | Reminder | File)[], 
  itemsData: ItemDict<any> | (Task | Note | Event | Reminder | File)[], 
  formatter: (item: any) => React.ReactNode,
  emptyMessage?: string 
}) => {
  if (!items || items.length === 0) {
    return <li className="no-items-message">{emptyMessage}</li>;
  }

  // Check if itemsData is an array
  const isArray = Array.isArray(itemsData);
  
  // If we don't have the items data (empty dictionaries or empty array)
  if ((!isArray && Object.keys(itemsData).length === 0 && items.length > 0) || 
      (isArray && itemsData.length === 0 && items.length > 0)) {
    return <li className="no-items-message">Related items exist but are not loaded. Click the + button to add new ones.</li>;
  }

  return (
    <>
      {items.map(item => {
        const id = item.id;
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
      <span className="icon">{'📁'}</span> <h3>{project.title}</h3>
    </div>
    <div className="project-summary-meta">
      <span className={`project-status-tag status-${project.status.toLowerCase().replace(' ', '')}`}>
        {project.status}
      </span>
      {project.start_date && <span> | Started: {project.start_date}</span>}
    </div>
  </li>
));

// Project details section component with updated type
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
  items: (Task | Note | Event | Reminder | File)[],
  itemsData: ItemDict<any> | (Task | Note | Event | Reminder | File)[],
  formatter: (item: any) => React.ReactNode,
  onAddItem: () => void
}) => (
  <div className="linked-items-section">
    <h3 className="linked-items-title">
      <span className="title-content">
        <BiNetworkChart className="icon" size={20} /> {title}
      </span>
      <button
        className="add-linked-item-button"
        title={`Add New ${title.replace('Related ', '')}`}
        onClick={onAddItem}
      >
        <IoAdd size={20} />
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
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMemo(() => window.matchMedia('(max-width: 768px)').matches, []);

  // State for linked items
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  
  // Data fetching hook - only fetch projects
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects
  } = useApi<Project[]>(() => projectsApi.getAll());
  
  // Convert projects to dictionary for easier access - memoized
  const projectsDict = useMemo(() => {
    return projects ? projects.reduce<ItemDict<Project>>((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {}) : {};
  }, [projects]);

  // These dictionaries are unused - removed for cleaner code
  
  // When selectedProjectId changes, fetch the project
  useEffect(() => {
    const fetchProjectData = async () => {
      if (selectedProjectId && projects) {
        const project = projectsDict[selectedProjectId];
        if (project) {
          setSelectedProject(project);
          const fetchedTasks = await tasksApi.getByProjectId(project.id);
          const fetchedNotes = await notesApi.getByProjectId(project.id);
          const fetchedEvents = await eventsApi.getByProjectId(project.id);
          const fetchedReminders = await remindersApi.getByProjectId(project.id);
          const fetchedFiles = await filesApi.getByProjectId(project.id);
          
          setTasks(fetchedTasks);
          setNotes(fetchedNotes);
          setEvents(fetchedEvents);
          setReminders(fetchedReminders);
          setFiles(fetchedFiles);
          
          console.log("this is tasks", fetchedTasks);
          console.log("this is notes", fetchedNotes);
          console.log("this is events", fetchedEvents);
          console.log("this is reminders", fetchedReminders);
          console.log("this is files", fetchedFiles);
        }
      } else {
        setSelectedProject(null);
        // Clear linked items when no project is selected
        setTasks([]);
        setNotes([]);
        setEvents([]);
        setReminders([]);
        setFiles([]);
      }
    };
    fetchProjectData();
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
      default:
        console.error("Unknown item type:", type);
    }
  };

  const handleProjectSubmit = async (projectData: Omit<Project, 'id'>) => {
    try {
      if (isEditingProject && selectedProject) {
        // Update existing project
        const updatedProject = await projectsApi.update(selectedProject.id, projectData);
        
        // Refresh the projects list
        await refetchProjects();
        setSelectedProject(updatedProject);
      } else {
        // Create new project
        const newProject = await projectsApi.create(projectData);
        setSelectedProject(newProject);
      }
      
      // Reset state
      setShowAddProjectModal(false);
      setIsEditingProject(false);
    } catch (error) {
      console.error(isEditingProject ? 'Failed to update project:' : 'Failed to create project:', error);
      alert(isEditingProject ? 'Failed to update project' : 'Failed to create project');
    }
  };

  const handleEditProject = () => {
    setIsEditingProject(true);
    setShowAddProjectModal(true);
  };

  const handleTaskSubmit = async (taskData: Omit<Task, 'id'>) => {
    if (!selectedProject) return;
    
    try {
      const newTask = await tasksApi.create({
        ...taskData,
        project_id: selectedProject.id
      });
      
      // Update local tasks state
      setTasks(prevTasks => [...prevTasks, newTask]);
      
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
        project_id: selectedProject.id
      });
      
      // Update local notes state
      setNotes(prevNotes => [...prevNotes, newNote]);
      
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
        project_id: selectedProject.id
      });
      
      // Update local events state
      setEvents(prevEvents => [...prevEvents, newEvent]);
      
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
        project_id: selectedProject.id
      });
      
      // Update local reminders state
      setReminders(prevReminders => [...prevReminders, newReminder]);
      
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

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      await projectsApi.delete(projectId);
      await refetchProjects();
      setSelectedProject(null);
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="app-container">
      <div className='sidebar'>
        <Sidebar />
      </div>
      <main className="main-content">
        <div className="dashboard-header-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={toggleSidebar} 
              className="sidebar-toggle"
            >
              <BiNetworkChart size={20} />
            </button>
            <h1 className="dashboard-title"><BiNetworkChart size={24} /> Projects & Businesses</h1>
          </div>
        </div>

        <div className="projects-layout">
          {/* Project List Sidebar */}
          <aside className="project-list-pane">
            <div className="project-list-header">
              <h2 className="project-list-title">Projects & Businesses</h2>
              <button className="new-project-button" onClick={() => setShowAddProjectModal(true)}>
                <IoAdd size={20} /> New
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
                <BiNetworkChart className="icon" size={36} />
                <h2>Select a Project</h2>
                <p>Choose a project or business from the list to see its details and related items.</p>
              </div>
            ) : (
              <div className="project-details-view">
                <div className="project-details-header">
                  <h1 className="project-details-title">{selectedProject.title}</h1>
                  <div className="project-details-meta">
                    <span>
                      <BiNetworkChart className="icon" size={20} /> Status: 
                      <span className={"project-status-tag"}>
                        {selectedProject.status}
                      </span>
                    </span>
                    <span>
                      <BsCalendar className="icon" size={20} /> Dates: 
                      {selectedProject.start_date ? ` Started: ${selectedProject.start_date}` : ' No start date'}
                      {selectedProject.end_date ? ` | EST: ${selectedProject.end_date}` : (selectedProject.status !== 'Completed' && selectedProject.start_date ? ' | Ongoing' : '')}
                    </span>
                    <button className="edit-project-button" onClick={() => handleEditProject()}>
                      <BsPencilSquare className="edit-icon" size={20} />
                    </button>
                    <button className="delete-project-button" onClick={() => handleDeleteProject(selectedProject.id)}>
                      <BsTrash className="delete-icon" size={20} />
                    </button>
                  </div>
                </div>

                <div className="project-details-description">
                  <p>{selectedProject.description || 'No description provided.'}</p>
                </div>

                {/* Related Tasks */}
                <ProjectDetailSection
                  title="Related Tasks"
                  icon={BsListCheck}
                  items={tasks}
                  itemsData={tasks}
                  formatter={formatTask}
                  onAddItem={() => handleAddLinkedItem('Task')}
                />

                {/* Related Notes */}
                <ProjectDetailSection
                  title="Related Notes"
                  icon={BsFileText}
                  items={notes}
                  itemsData={notes}
                  formatter={formatNote}
                  onAddItem={() => handleAddLinkedItem('Note')}
                />

                {/* Related Events */}
                <ProjectDetailSection
                  title="Related Events"
                  icon={BsCalendar}
                  items={events}
                  itemsData={events}
                  formatter={formatEvent}
                  onAddItem={() => handleAddLinkedItem('Event')}
                />

                {/* Related Reminders */}
                <ProjectDetailSection
                  title="Related Reminders"
                  icon={BsBell}
                  items={reminders}
                  itemsData={reminders}
                  formatter={formatReminder}
                  onAddItem={() => handleAddLinkedItem('Reminder')}
                />

                {/* Related Files */}
                <ProjectDetailSection
                  title="Related Files"
                  icon={BsFileText}
                  items={files}
                  itemsData={files}
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
              project={isEditingProject ? selectedProject : undefined}
              onClose={() => {
                setShowAddProjectModal(false)
                setIsEditingProject(false)
              }}
              onSubmit={handleProjectSubmit}
            />
          </Suspense>
        )}

        {showAddTaskModal && selectedProject && (
          <Suspense fallback={<ModalFallback />}>
            <TaskModal 
              projectName={selectedProject.title}
              onClose={() => setShowAddTaskModal(false)}
              onSubmit={handleTaskSubmit}
            />
          </Suspense>
        )}

        {showAddNoteModal && selectedProject && (
          <Suspense fallback={<ModalFallback />}>
            <NoteModal 
              projectName={selectedProject.title}
              onClose={() => setShowAddNoteModal(false)}
              onSubmit={handleNoteSubmit}
            />
          </Suspense>
        )}

        {showAddEventModal && selectedProject && (
          <Suspense fallback={<ModalFallback />}>
            <EventModal 
              projectName={selectedProject.title}
              onClose={() => setShowAddEventModal(false)}
              onSubmit={handleEventSubmit}
            />
          </Suspense>
        )}

        {showAddReminderModal && selectedProject && (
          <Suspense fallback={<ModalFallback />}>
            <ReminderModal 
              projectName={selectedProject.title}
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