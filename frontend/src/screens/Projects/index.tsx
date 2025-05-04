import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { 
  TaskModal, 
  NoteModal, 
  EventModal, 
  ReminderModal,
  ProjectModal
} from '../../components/forms';
import { 
  Typography, 
  Box, 
  Button, 
  Paper, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemIcon, 
  Chip,
  IconButton,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { 
  FolderOutlined,
  AddCircleOutline, 
  ListAlt, 
  NoteAlt, 
  Event, 
  Notifications,
  AttachFile,
  Edit,
  Delete,
  AccountTree,
  Menu,
  Add
} from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { 
  Project,
  Task,
  Note,
  Events,
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
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
    <CircularProgress />
    <Typography variant="body1" sx={{ mt: 2 }}>Loading form...</Typography>
  </Box>
);

// Format functions for each type of linked item
const formatTask = (task: Task) => {
  const statusColors: Record<string, string> = {
    'todo': 'default',
    'inprogress': 'primary',
    'completed': 'success',
    'blocked': 'error',
    'deferred': 'warning'
  };
  
  const priorityColors: Record<string, string> = {
    'high': 'error',
    'medium': 'warning',
    'low': 'success',
    'none': 'default'
  };
  
  const statusKey = task.status.replace('-', '').toLowerCase();
  const priorityKey = task.priority ? task.priority.toLowerCase() : 'none';
  
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
      <Box display="flex" alignItems="center">
        <ListAlt fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body1">{task.title}</Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Chip 
          size="small" 
          label={task.status}
          color={statusColors[statusKey] as any || 'default'}
          sx={{ mr: 1 }}
        />
        {task.due_date && (
          <Typography variant="caption" sx={{ mr: 1 }}>
            Due: {task.due_date}
          </Typography>
        )}
        {task.priority && (
          <Chip 
            size="small" 
            label={task.priority}
            color={priorityColors[priorityKey] as any || 'default'}
          />
        )}
      </Box>
    </Box>
  );
};

const formatNote = (note: Note) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
    <Box display="flex" alignItems="center">
      <NoteAlt fontSize="small" sx={{ mr: 1 }} />
      <Typography variant="body1">{note.title}</Typography>
    </Box>
    <Typography variant="caption">{note.created_at}</Typography>
  </Box>
);

const formatEvent = (event: Events) => {
  const eventTypeColors: Record<string, string> = {
    'meeting': 'primary',
    'deadline': 'error',
    'other': 'default'
  };
  
  const typeKey = event.type || 'other';
  
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
      <Box display="flex" alignItems="center">
        <Event fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body1">{event.title}</Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Typography variant="caption" sx={{ mr: 1 }}>{event.due_date}</Typography>
        <Chip 
          size="small" 
          label={event.type}
          color={eventTypeColors[typeKey] as any || 'default'}
        />
      </Box>
    </Box>
  );
};

const formatReminder = (reminder: Reminder) => {
  const priorityColors: Record<string, string> = {
    'high': 'error',
    'medium': 'warning',
    'low': 'success',
    'none': 'default'
  };
  
  const priorityKey = reminder.priority ? reminder.priority.toLowerCase() : 'none';
  
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
      <Box display="flex" alignItems="center">
        <Notifications fontSize="small" sx={{ mr: 1 }} />
        <Typography variant="body1">{reminder.title}</Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Typography variant="caption" sx={{ mr: 1 }}>{reminder.due_date}</Typography>
        {reminder.priority && (
          <Chip 
            size="small" 
            label={reminder.priority}
            color={priorityColors[priorityKey] as any || 'default'}
          />
        )}
      </Box>
    </Box>
  );
};

const formatFile = (file: File) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
    <Box display="flex" alignItems="center">
      <AttachFile fontSize="small" sx={{ mr: 1 }} />
      <Typography variant="body1">{file.title}</Typography>
    </Box>
    <Typography variant="caption">{file.type || ''}</Typography>
  </Box>
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
    return (
      <ListItem>
        <Typography variant="body2" color="text.secondary">{emptyMessage}</Typography>
      </ListItem>
    );
  }

  // Check if itemsData is an array
  const isArray = Array.isArray(itemsData);
  
  // If we don't have the items data (empty dictionaries or empty array)
  if ((!isArray && Object.keys(itemsData).length === 0 && items.length > 0) || 
      (isArray && itemsData.length === 0 && items.length > 0)) {
    return (
      <ListItem>
        <Typography variant="body2" color="text.secondary">
          Related items exist but are not loaded. Click the + button to add new ones.
        </Typography>
      </ListItem>
    );
  }

  return (
    <>
      {items.map(item => {
        // @ts-ignore - Handling the ID inconsistency that was causing TS errors
        const id = item?.id;
        if (!item) return null;
        return (
          <ListItem 
            key={id} 
            divider 
            sx={{
              padding: 1.5,
              '&:hover': {
                backgroundColor: 'action.hover',
              }
            }}
          >
            {formatter(item)}
          </ListItem>
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
}) => {
  const statusColors: Record<string, string> = {
    'notstarted': 'default',
    'inprogress': 'primary',
    'onhold': 'warning',
    'completed': 'success',
    'canceled': 'error'
  };
  
  const statusKey = project.status.toLowerCase().replace(' ', '');
  
  return (
    <ListItem 
      button 
      selected={isActive}
      onClick={() => onSelect(project.id)}
      sx={{
        borderRadius: 1,
        mb: 1,
        '&.Mui-selected': {
          backgroundColor: 'primary.light',
          '&:hover': {
            backgroundColor: 'primary.light',
          }
        }
      }}
    >
      <ListItemIcon>
        <FolderOutlined />
      </ListItemIcon>
      <ListItemText
        primary={project.title}
        secondary={
          <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5}>
            <Chip 
              size="small" 
              label={project.status}
              color={statusColors[statusKey] as any || 'default'}
            />
            {project.start_date && (
              <Typography variant="caption">
                Started: {project.start_date}
              </Typography>
            )}
          </Box>
        }
      />
    </ListItem>
  );
});

// Project details section component with updated type
const ProjectDetailSection = React.memo(({
  title,
  items,
  itemsData,
  formatter,
  onAddItem,
  showaddbutton = true
}: {
  title: string,
  icon: React.ReactNode,
  items: (Task | Note | Event | Reminder | File)[],
  itemsData: ItemDict<any> | (Task | Note | Event | Reminder | File)[],
  formatter: (item: any) => React.ReactNode,
  onAddItem: () => void,
  showaddbutton: boolean
}) => (
  <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Box display="flex" alignItems="center">
        <AccountTree sx={{ mr: 1 }} />
        <Typography variant="h6">{title}</Typography>
      </Box>
      <IconButton
        size="small"
        onClick={onAddItem}
        title={`Add New ${title.replace('Related ', '')}`}
      >
        {showaddbutton && <AddCircleOutline />}
      </IconButton>
    </Box>
    <List sx={{ width: '100%' }}>
      <LinkedItemsList
        items={items}
        itemsData={itemsData}
        formatter={formatter}
      />
    </List>
  </Paper>
));

const Projects: React.FC = () => {
  // Theme and media query
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State for project selection and modals
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

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
          
          // @ts-ignore - Working around type issues in the original code
          setTasks(fetchedTasks);
          // @ts-ignore
          setNotes(fetchedNotes);
          // @ts-ignore
          setEvents(fetchedEvents);
          // @ts-ignore
          setReminders(fetchedReminders);
          // @ts-ignore
          setFiles(fetchedFiles);
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
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const selectProject = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

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

  const handleTaskSubmit = async (taskData: Omit<Task, 'id'>, fileData?: FormData) => {
    if (!selectedProject) return;
    
    try {
      // @ts-ignore - Working around type issues in the original code
      const newTask = await tasksApi.create({
        ...taskData,
        project_id: selectedProject.id
      });
      
      // Update local tasks state
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      // If there's file data, upload the file
      if (fileData) {
        // Ensure the new task ID is in the form data
        fileData.set('taskId', newTask.id);
        fileData.set('projectId', selectedProject.id);
        
        // Call the file upload API
        try {
          await filesApi.uploadTaskFile(fileData);
          console.log('File uploaded successfully');
        } catch (fileError) {
          console.error('Error uploading file:', fileError);
          // The task was created, just the file upload failed
          alert('Task created but file upload failed. Please try attaching the file again.');
        }
      }
      
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

  const handleNoteSubmit = async (noteData: Omit<Note, 'id'>, fileData?: FormData) => {
    if (!selectedProject) return;
    
    try {
      const newNote = await notesApi.create({
        ...noteData,
        project_id: selectedProject.id
      });
      
      // Update local notes state
      // @ts-ignore - Working around type issues in the original code
      setNotes(prevNotes => [...prevNotes, newNote]);
      
      // If there's file data, upload the file
      if (fileData) {
        // Ensure the new note ID is in the form data
        fileData.set('noteId', newNote.id);
        fileData.set('projectId', selectedProject.id);
        
        // Call the file upload API
        try {
          await filesApi.uploadNoteFile(fileData);
          console.log('File uploaded successfully');
        } catch (fileError) {
          console.error('Error uploading file:', fileError);
          // The note was created, just the file upload failed
          alert('Note created but file upload failed. Please try attaching the file again.');
        }
      }
      
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

  const handleEventSubmit = async (eventData: Omit<Events, 'id'>) => {
    if (!selectedProject) return;
    
    try {
      // @ts-ignore - Working around type issues in the original code
      const newEvent = await eventsApi.create({
        ...eventData,
        project_id: selectedProject.id
      });
      
      // Update local events state
      // @ts-ignore - Working around type issues in the original code
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

  // Handle project selection change from dropdown
  const handleProjectDropdownChange = (event: SelectChangeEvent) => {
    if (event.target.value) {
      selectProject(event.target.value);
    }
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <Sidebar isOpen={true} toggleSidebar={() => {}} activePath="/projects" />     
      </div>
      <div className="main-content">
    <Box sx={{ display: 'flex', height: '100vh' }}>
           
      
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          height: '100%', 
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: theme.palette.grey[100],
        }}
      >
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'white',
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', }}>
            {isMobile && (
              <IconButton edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
                <Menu />
              </IconButton>
            )}
            <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountTree sx={{ mr: 1 }} /> Projects & Businesses
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="project-selector-label">Select Project</InputLabel>
              <Select
                labelId="project-selector-label"
                id="project-selector"
                value={selectedProjectId || ''}
                label="Select Project"
                onChange={handleProjectDropdownChange}
              >
                {projects && projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button 
              variant="contained" 
              startIcon={<Add />}
              size="medium"
              color="primary"
              onClick={() => setShowAddProjectModal(true)}
            >
              New Project
            </Button>
          </Box>
        </Box>

        <Box sx={{mt: 2, flex: 1 }}>
          {!selectedProject ? (
            <Box 
              display="flex" 
              flexDirection="column" 
              alignItems="center" 
              justifyContent="center"
              sx={{ 
                height: '100%', 
                py: 8,
                backgroundColor: 'background.default',
                borderRadius: 1
              }}
            >
              <AccountTree sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>Select a Project</Typography>
              <Typography variant="body1" color="text.secondary">
                Choose a project or business from the list to see its details and related items.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Paper sx={{ p: 3, mb: 3 }} elevation={1}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Typography variant="h4" gutterBottom>{selectedProject.title}</Typography>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={handleEditProject}
                      title="Edit Project"
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteProject(selectedProject.id)}
                      title="Delete Project"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box 
                  display="flex" 
                  flexWrap="wrap" 
                  gap={2} 
                  alignItems="center" 
                  mb={2}
                >
                  <Chip 
                    icon={<AccountTree fontSize="small" />}
                    label={`Status: ${selectedProject.status}`}
                    color={
                      selectedProject.status === 'Completed' ? 'success' :
                      selectedProject.status === 'In Progress' ? 'primary' :
                      selectedProject.status === 'Not Started' ? 'default' :
                      selectedProject.status === 'On Hold' ? 'warning' :
                      'default'
                    }
                  />
                  
                  {(selectedProject.start_date || selectedProject.end_date) && (
                    <Chip 
                      icon={<Event fontSize="small" />}
                      label={`${selectedProject.start_date ? `Started: ${selectedProject.start_date}` : 'No start date'}
                             ${selectedProject.end_date ? ` | Due: ${selectedProject.end_date}` : ''}`}
                    />
                  )}
                </Box>
                
                <Typography variant="body1" paragraph>
                  {selectedProject.description || 'No description provided.'}
                </Typography>
              </Paper>

              {/* Related Tasks */}
              <ProjectDetailSection
                title="Related Tasks"
                icon={<ListAlt />}
                items={tasks}
                itemsData={tasks}
                formatter={formatTask}
                onAddItem={() => handleAddLinkedItem('Task')}
                showaddbutton={true}
              />

              {/* Related Notes */}
              <ProjectDetailSection
                title="Related Notes"
                icon={<NoteAlt />}
                items={notes}
                itemsData={notes}
                formatter={formatNote}
                onAddItem={() => handleAddLinkedItem('Note')}
                showaddbutton={true}
              />

              {/* Related Events */}
              <ProjectDetailSection
                title="Related Events"
                icon={<Event />}
                items={events}
                itemsData={events}
                formatter={formatEvent}
                onAddItem={() => handleAddLinkedItem('Event')}
                showaddbutton={true}
              />

              {/* Related Reminders */}
              <ProjectDetailSection
                title="Related Reminders"
                icon={<Notifications />}
                items={reminders}
                itemsData={reminders}
                formatter={formatReminder}
                onAddItem={() => handleAddLinkedItem('Reminder')}
                showaddbutton={true}
              />

              {/* Related Files */}
              <ProjectDetailSection
                title="Related Files"
                icon={<AttachFile />}
                items={files}
                itemsData={files}
                formatter={formatFile}
                onAddItem={() => handleAddLinkedItem('File')}
                showaddbutton={false}
              />
            </Box>
          )}
        </Box>
      </Box>

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
    </Box>
    </div>
    </div>
  );
};

export default Projects; 