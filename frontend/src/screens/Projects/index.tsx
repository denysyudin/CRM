import React, { useState, useEffect, useCallback } from 'react';
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
  faBriefcase, 
  faCalendarDay, 
  faUsers, 
  faTag,
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
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  
  // Data fetching hooks
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects
  } = useApi<Project[]>(() => projectsApi.getAll());
  
  const {
    data: tasks,
    isLoading: isLoadingTasks,
    error: tasksError,
    refetch: refetchTasks
  } = useApi<Task[]>(() => tasksApi.getAll());
  
  const {
    data: notes,
    isLoading: isLoadingNotes,
    error: notesError,
    refetch: refetchNotes
  } = useApi<Note[]>(() => notesApi.getAll());
  
  const {
    data: events,
    isLoading: isLoadingEvents,
    error: eventsError,
    refetch: refetchEvents
  } = useApi<Event[]>(() => eventsApi.getAll());
  
  const {
    data: reminders,
    isLoading: isLoadingReminders,
    error: remindersError,
    refetch: refetchReminders
  } = useApi<Reminder[]>(() => remindersApi.getAll());
  
  const {
    data: files,
    isLoading: isLoadingFiles,
    error: filesError,
    refetch: refetchFiles
  } = useApi<File[]>(() => filesApi.getAll());

  // Convert arrays to dictionaries for easier access
  const projectsDict = projects ? projects.reduce<ItemsDict<Project>>((acc, project) => {
    acc[project.id] = project;
    return acc;
  }, {}) : {};
  
  const tasksDict = tasks ? tasks.reduce<ItemsDict<Task>>((acc, task) => {
    acc[task.id] = task;
    return acc;
  }, {}) : {};
  
  const notesDict = notes ? notes.reduce<ItemsDict<Note>>((acc, note) => {
    acc[note.id] = note;
    return acc;
  }, {}) : {};
  
  const eventsDict = events ? events.reduce<ItemsDict<Event>>((acc, event) => {
    acc[event.id] = event;
    return acc;
  }, {}) : {};
  
  const remindersDict = reminders ? reminders.reduce<ItemsDict<Reminder>>((acc, reminder) => {
    acc[reminder.id] = reminder;
    return acc;
  }, {}) : {};
  
  const filesDict = files ? files.reduce<ItemsDict<File>>((acc, file) => {
    acc[file.id] = file;
    return acc;
  }, {}) : {};

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

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const selectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  // Function to refetch all data
  const refetchAllData = useCallback(() => {
    refetchProjects();
    refetchTasks();
    refetchNotes();
    refetchEvents();
    refetchReminders();
    refetchFiles();
  }, [refetchProjects, refetchTasks, refetchNotes, refetchEvents, refetchReminders, refetchFiles]);

  // Loading and error handling
  const isLoading = isLoadingProjects || isLoadingTasks || isLoadingNotes || 
                  isLoadingEvents || isLoadingReminders || isLoadingFiles;
  
  const error = projectsError || tasksError || notesError || 
                eventsError || remindersError || filesError;

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetchAllData} />;
  }

  // Format linked items
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

  // Create linked item list
  const LinkedItemsList = ({ 
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
  };

  // Add new project form
  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const newProject: Omit<Project, 'id'> = {
        name: formData.get('projectName') as string,
        icon: formData.get('projectIcon') as string || null,
        description: formData.get('projectDescription') as string || '',
        status: formData.get('projectStatus') as string,
        startDate: formData.get('projectStartDate') as string || null,
        endDate: formData.get('projectEndDate') as string || null,
        tasks: [],
        notes: [],
        events: [],
        reminders: [],
        files: []
      };
      
      await projectsApi.create(newProject);
      refetchProjects();
      setShowAddProjectModal(false);
    } catch (error) {
      console.error('Failed to create project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  // Add new task form
  const handleAddTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const newTask: Omit<Task, 'id'> = {
        name: formData.get('taskName') as string,
        description: formData.get('taskDescription') as string || '',
        status: 'not-started',
        priority: formData.get('taskPriority') as string,
        dueDate: formData.get('taskDueDate') as string,
        assignee: formData.get('taskAssignee') as string || null,
        projectId: selectedProject.id
      };
      
      const createdTask = await tasksApi.create(newTask);
      
      // Update the project's tasks array
      await projectsApi.update(selectedProject.id, {
        tasks: [...selectedProject.tasks, createdTask.id]
      });
      
      refetchTasks();
      refetchProjects();
      setShowAddTaskModal(false);
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Please try again.');
    }
  };

  // Add new note form
  const handleAddNote = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const newNote: Omit<Note, 'id'> = {
        title: formData.get('noteTitle') as string,
        category: formData.get('noteCategory') as string || 'General',
        content: formData.get('noteBody') as string || '',
        date: new Date().toISOString().split('T')[0],
        project: selectedProject.name
      };
      
      const createdNote = await notesApi.create(newNote);
      
      // Update the project's notes array
      await projectsApi.update(selectedProject.id, {
        notes: [...selectedProject.notes, createdNote.id]
      });
      
      refetchNotes();
      refetchProjects();
      setShowAddNoteModal(false);
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('Failed to create note. Please try again.');
    }
  };

  // Add new event form
  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const newEvent: Omit<Event, 'id'> = {
        name: formData.get('eventName') as string,
        date: formData.get('eventDatetime') as string,
        type: formData.get('eventType') as string,
        participants: formData.get('eventParticipants') as string || '',
        notes: formData.get('eventNotes') as string || '',
        projectId: selectedProject.id
      };
      
      const createdEvent = await eventsApi.create(newEvent);
      
      // Update the project's events array
      await projectsApi.update(selectedProject.id, {
        events: [...selectedProject.events, createdEvent.id]
      });
      
      refetchEvents();
      refetchProjects();
      setShowAddEventModal(false);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please try again.');
    }
  };

  // Add new reminder form
  const handleAddReminder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedProject) return;
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const newReminder: Omit<Reminder, 'id'> = {
        name: formData.get('reminderName') as string,
        dueDate: formData.get('reminderDatetime') as string,
        priority: formData.get('reminderPriority') as string,
        projectId: selectedProject.id
      };
      
      const createdReminder = await remindersApi.create(newReminder);
      
      // Update the project's reminders array
      await projectsApi.update(selectedProject.id, {
        reminders: [...selectedProject.reminders, createdReminder.id]
      });
      
      refetchReminders();
      refetchProjects();
      setShowAddReminderModal(false);
    } catch (error) {
      console.error('Failed to create reminder:', error);
      alert('Failed to create reminder. Please try again.');
    }
  };

  // Handle add linked item button clicks
  const handleAddLinkedItem = (type: string) => {
    if (!selectedProject) return;

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
              
              refetchFiles();
              refetchProjects();
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

  return (
    <div className="dashboard-layout">
      {(sidebarOpen || !isMobile) && (
        <nav className={`sidebar-nav ${isMobile && sidebarOpen ? 'mobile-visible' : ''}`}>
          <Sidebar />
        </nav>
      )}

      <main className="dashboard-main-content">
        <div className="dashboard-header-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <button 
                onClick={toggleSidebar} 
                className="sidebar-toggle"
              >
                <FontAwesomeIcon icon={faBars} />
              </button>
            )}
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
                  <li 
                    key={project.id} 
                    className={`project-summary-card ${selectedProject?.id === project.id ? 'active' : ''}`}
                    onClick={() => selectProject(project.id)}
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
                <div className="linked-items-section">
                  <h3 className="linked-items-title">
                    <span className="title-content"><FontAwesomeIcon className="icon" icon={faClipboardList} /> Related Tasks</span>
                    <button 
                      className="add-linked-item-button" 
                      title="Add New Task"
                      onClick={() => handleAddLinkedItem('Task')}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </h3>
                  <ul className="linked-item-list">
                    <LinkedItemsList 
                      items={selectedProject.tasks} 
                      itemsData={tasksDict} 
                      formatter={formatTask} 
                    />
                  </ul>
                </div>

                {/* Related Notes */}
                <div className="linked-items-section">
                  <h3 className="linked-items-title">
                    <span className="title-content"><FontAwesomeIcon className="icon" icon={faStickyNote} /> Related Notes</span>
                    <button 
                      className="add-linked-item-button" 
                      title="Add New Note"
                      onClick={() => handleAddLinkedItem('Note')}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </h3>
                  <ul className="linked-item-list">
                    <LinkedItemsList 
                      items={selectedProject.notes} 
                      itemsData={notesDict} 
                      formatter={formatNote} 
                    />
                  </ul>
                </div>

                {/* Related Events */}
                <div className="linked-items-section">
                  <h3 className="linked-items-title">
                    <span className="title-content"><FontAwesomeIcon className="icon" icon={faCalendarAlt} /> Related Events</span>
                    <button 
                      className="add-linked-item-button" 
                      title="Add New Event"
                      onClick={() => handleAddLinkedItem('Event')}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </h3>
                  <ul className="linked-item-list">
                    <LinkedItemsList 
                      items={selectedProject.events} 
                      itemsData={eventsDict} 
                      formatter={formatEvent} 
                    />
                  </ul>
                </div>

                {/* Related Reminders */}
                <div className="linked-items-section">
                  <h3 className="linked-items-title">
                    <span className="title-content"><FontAwesomeIcon className="icon" icon={faBell} /> Related Reminders</span>
                    <button 
                      className="add-linked-item-button" 
                      title="Add New Reminder"
                      onClick={() => handleAddLinkedItem('Reminder')}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </h3>
                  <ul className="linked-item-list">
                    <LinkedItemsList 
                      items={selectedProject.reminders} 
                      itemsData={remindersDict} 
                      formatter={formatReminder} 
                    />
                  </ul>
                </div>

                {/* Related Files */}
                <div className="linked-items-section">
                  <h3 className="linked-items-title">
                    <span className="title-content"><FontAwesomeIcon className="icon" icon={faFileAlt} /> Related Files</span>
                    <button 
                      className="add-linked-item-button" 
                      title="Add New File"
                      onClick={() => handleAddLinkedItem('File')}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </h3>
                  <ul className="linked-item-list">
                    <LinkedItemsList 
                      items={selectedProject.files} 
                      itemsData={filesDict} 
                      formatter={formatFile} 
                    />
                  </ul>
                </div>
              </div>
            )}
          </main>
        </div>

        {/* Add Project Modal */}
        {showAddProjectModal && (
          <div className="modal-overlay" onClick={() => setShowAddProjectModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-button" onClick={() => setShowAddProjectModal(false)}>&times;</button>
              <h2 className="modal-form-title">Add New Project / Business</h2>
              <form onSubmit={handleAddProject}>
                <div className="form-group">
                  <label htmlFor="project-name">Name <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" id="project-name" name="projectName" required placeholder="e.g., Bravo Jewellers, Q3 Marketing Campaign" />
                </div>
                <div className="form-group">
                  <label htmlFor="project-icon">Icon (Optional)</label>
                  <input type="text" id="project-icon" name="projectIcon" placeholder="Enter an emoji or character (e.g., 💍, ✨)" />
                </div>
                <div className="form-group">
                  <label htmlFor="project-description">Description (Optional)</label>
                  <textarea id="project-description" name="projectDescription" placeholder="Enter a brief overview..."></textarea>
                </div>
                <div className="form-group">
                  <label htmlFor="project-status">Status <span style={{ color: 'red' }}>*</span></label>
                  <select id="project-status" name="projectStatus" required>
                    <option value="" disabled selected>-- Select Status --</option>
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="project-start-date">Start Date (Optional)</label>
                    <input type="date" id="project-start-date" name="projectStartDate" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="project-end-date">End Date (Optional)</label>
                    <input type="date" id="project-end-date" name="projectEndDate" />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="button" className="form-button button-secondary" onClick={() => setShowAddProjectModal(false)}>Cancel</button>
                  <button type="submit" className="form-button button-primary">Save Project</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Task Modal */}
        {showAddTaskModal && (
          <div className="modal-overlay" onClick={() => setShowAddTaskModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-button" onClick={() => setShowAddTaskModal(false)}>&times;</button>
              <h2 className="modal-form-title">Add New Task</h2>
              <div className="modal-project-context">Adding to: {selectedProject?.name}</div>
              <form onSubmit={handleAddTask}>
                <div className="form-group">
                  <label htmlFor="task-name">Task Name <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" id="task-name" name="taskName" required />
                </div>
                <div className="form-group">
                  <label htmlFor="task-description">Description</label>
                  <textarea id="task-description" name="taskDescription"></textarea>
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="task-priority">Priority</label>
                    <select id="task-priority" name="taskPriority">
                      <option value="Low">Low</option>
                      <option value="Medium" selected>Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="task-due-date">Due Date</label>
                    <input type="date" id="task-due-date" name="taskDueDate" />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="task-assignee">Assignee (Optional)</label>
                  <input type="text" id="task-assignee" name="taskAssignee" placeholder="e.g., Self, Alice, Bob" />
                </div>
                <div className="form-actions">
                  <button type="button" className="form-button button-secondary" onClick={() => setShowAddTaskModal(false)}>Cancel</button>
                  <button type="submit" className="form-button button-primary">Save Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Note Modal */}
        {showAddNoteModal && (
          <div className="modal-overlay" onClick={() => setShowAddNoteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-button" onClick={() => setShowAddNoteModal(false)}>&times;</button>
              <h2 className="modal-form-title">Add New Note</h2>
              <div className="modal-project-context">Adding to: {selectedProject?.name}</div>
              <form onSubmit={handleAddNote}>
                <div className="form-group">
                  <label htmlFor="note-title">Title <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" id="note-title" name="noteTitle" required />
                </div>
                <div className="form-group">
                  <label htmlFor="note-category">Category</label>
                  <input type="text" id="note-category" name="noteCategory" placeholder="e.g., Meeting Notes, Ideas, Strategy" />
                </div>
                <div className="form-group">
                  <label htmlFor="note-body">Note Content</label>
                  <textarea id="note-body" name="noteBody" rows={6}></textarea>
                </div>
                <div className="form-group">
                  <label>Attachment (Optional)</label>
                  <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>Simulate attaching a file here...</p>
                </div>
                <div className="form-actions">
                  <button type="button" className="form-button button-secondary" onClick={() => setShowAddNoteModal(false)}>Cancel</button>
                  <button type="submit" className="form-button button-primary">Save Note</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Event Modal */}
        {showAddEventModal && (
          <div className="modal-overlay" onClick={() => setShowAddEventModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-button" onClick={() => setShowAddEventModal(false)}>&times;</button>
              <h2 className="modal-form-title">Add New Event</h2>
              <div className="modal-project-context">Adding to: {selectedProject?.name}</div>
              <form onSubmit={handleAddEvent}>
                <div className="form-group">
                  <label htmlFor="event-name">Event Name <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" id="event-name" name="eventName" required />
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label htmlFor="event-datetime">Date & Time <span style={{ color: 'red' }}>*</span></label>
                    <input type="datetime-local" id="event-datetime" name="eventDatetime" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="event-type">Type</label>
                    <select id="event-type" name="eventType">
                      <option value="meeting" selected>Meeting</option>
                      <option value="deadline">Deadline</option>
                      <option value="appointment">Appointment</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="event-participants">Participants (Optional)</label>
                  <input type="text" id="event-participants" name="eventParticipants" placeholder="e.g., Alice, Bob, Supplier XYZ" />
                </div>
                <div className="form-group">
                  <label htmlFor="event-notes">Notes (Optional)</label>
                  <textarea id="event-notes" name="eventNotes" rows={3}></textarea>
                </div>
                <div className="form-actions">
                  <button type="button" className="form-button button-secondary" onClick={() => setShowAddEventModal(false)}>Cancel</button>
                  <button type="submit" className="form-button button-primary">Save Event</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Reminder Modal */}
        {showAddReminderModal && (
          <div className="modal-overlay" onClick={() => setShowAddReminderModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-button" onClick={() => setShowAddReminderModal(false)}>&times;</button>
              <h2 className="modal-form-title">Add New Reminder</h2>
              <div className="modal-project-context">Adding to: {selectedProject?.name}</div>
              <form onSubmit={handleAddReminder}>
                <div className="form-group">
                  <label htmlFor="reminder-name">Remind me to... <span style={{ color: 'red' }}>*</span></label>
                  <input type="text" id="reminder-name" name="reminderName" required placeholder="e.g., Follow up with Alex, Call supplier" />
                </div>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label htmlFor="reminder-datetime">Date & Time <span style={{ color: 'red' }}>*</span></label>
                    <input type="datetime-local" id="reminder-datetime" name="reminderDatetime" required />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label htmlFor="reminder-priority">Priority</label>
                    <select id="reminder-priority" name="reminderPriority">
                      <option value="Low">Low</option>
                      <option value="Medium" selected>Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Related To (Optional)</label>
                  <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>Link this reminder to a specific Task or Person (feature to be implemented).</p>
                </div>
                <div className="form-actions">
                  <button type="button" className="form-button button-secondary" onClick={() => setShowAddReminderModal(false)}>Cancel</button>
                  <button type="submit" className="form-button button-primary">Save Reminder</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects; 