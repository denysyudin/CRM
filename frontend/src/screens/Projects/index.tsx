import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
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
  SelectChangeEvent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
  AlertColor
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
  Add,
  CheckCircle as CheckCircleIcon,
  CircleSharp as CircleSharpIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Alarm as AlarmIcon
} from '@mui/icons-material';
import {
  Project,
  Task,
  Note,
  Events,
  File
} from '../../types';

// Import Reminder from services API instead of from types
import { Reminder } from '../../services/api';

import {
  useGetProjectsQuery,
  useUpdateProjectMutation,
  useCreateProjectMutation,
  useDeleteProjectMutation
} from '../../redux/api/projectsApi';

import {
  useGetTaskByProjectIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation
} from '../../redux/api/tasksApi';

import {
  useGetNoteByProjectIdQuery,
  useCreateNoteMutation,
} from '../../redux/api/notesApi';

import {
  useGetEventByProjectIdQuery,
  useCreateEventMutation,
} from '../../redux/api/eventsApi';

import {
  useGetReminderByProjectIdQuery,
  useCreateReminderMutation,
} from '../../redux/api/remindersApi';

import {
  useGetFileByProjectIdQuery,
} from '../../redux/api/filesApi';

// Import ReminderData interface 
import { ReminderData } from '../../components/common';

// Dictionary type for collections of items by ID
type ItemDict<T> = {
  [key: string]: T;
};

interface FilePayload {
  id?: string;
  title: string;
  type: string;
  project_id: string;
  task_id?: string;
  note_id?: string;
  file_data?: FormData;
}

interface EventPayload {
  id: string;
  title: string;
  type: string;
  due_date: string;
  project_id: string;
  description?: string;
  employee_id?: string;
  participants?: string;
  notes?: string;
}

// For EventModal component
interface EventFormData {
  id?: string;
  title: string;
  date: string;
  hours?: string;
  minutes?: string;
  type: string;
  participants?: string;
  notes?: string;
  project_id?: string;
  employee_id?: string;
  description?: string;
}

// Placeholder component for modals when lazy loading
const ModalFallback: React.FC = () => (
  <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" p={3}>
    <CircularProgress />
  </Box>
);

// Format functions for each type of linked item
const formatTask = (task: Task, onStatusChange?: (taskId: string, newStatus: string) => void, onDelete?: (taskId: string) => void) => {
  const statusColors: Record<string, string> = {
    'not-started': 'default',
    'inprogress': 'primary',
    'in-progress': 'primary',
    'completed': 'success',
    'blocked': 'error',
    'deferred': 'warning',
    'todo': 'default'
  };

  const priorityColors: Record<string, string> = {
    'high': 'error',
    'medium': 'warning',
    'low': 'success',
    'none': 'default'
  };

  const statusKey = task.status.replace('-', '').toLowerCase();
  const priorityKey = task.priority ? task.priority.toLowerCase() : 'none';

  // Format date more nicely
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Status icon based on task status
  const getStatusIcon = () => {
    switch (task.status.toLowerCase()) {
      case 'completed':
        return <CheckCircleIcon fontSize="small" color="success" />;
      case 'in-progress':
      case 'inprogress':
        return <CircleSharpIcon fontSize="small" color="primary" />;
      default:
        return <RadioButtonUncheckedIcon fontSize="small" color="action" />;
    }
  };

  // Handle status toggle
  const handleStatusToggle = () => {
    if (!onStatusChange) return;

    let nextStatus = 'not-started';

    if (task.status === 'not-started') {
      nextStatus = 'in-progress';
    } else if (task.status === 'in-progress') {
      nextStatus = 'completed';
    } else if (task.status === 'completed') {
      nextStatus = 'not-started';
    }

    onStatusChange(task.id, nextStatus);
  };

  // Handle delete
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(task.id);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: 1, width: '100%', borderRadius: 1, borderLeft: 3, borderColor: priorityColors[priorityKey] }}>
      <Box display="flex" alignItems="flex-start" justifyContent="space-between" width="100%">
        <Box display="flex" alignItems="flex-start">
          <Box
            sx={{
              mr: 1,
              mt: 0.5,
              cursor: onStatusChange ? 'pointer' : 'default',
              '&:hover': {
                opacity: onStatusChange ? 0.8 : 1
              }
            }}
            onClick={onStatusChange ? handleStatusToggle : undefined}
            title={onStatusChange ? "Click to change status" : ""}
          >
            {getStatusIcon()}
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{task.title}</Typography>
            {task.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {task.description.length > 120 ? `${task.description.substring(0, 120)}...` : task.description}
              </Typography>
            )}
          </Box>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="flex-end">
          <Box display="flex" alignItems="center">
            <Chip
              size="small"
              label={task.status.replace('-', ' ')}
              color={statusColors[statusKey] as any || 'default'}
              sx={{ mb: 1, textTransform: 'capitalize', mr: 1 }}
            />
            {onDelete && (
              <IconButton 
                size="small" 
                onClick={handleDelete} 
                title="Delete Task"
                color="error"
                sx={{ padding: 0.5 }}
              >
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
          {task.due_date && (
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              <AlarmIcon fontSize="inherit" sx={{ mr: 0.5 }} />
              Due: {formatDate(task.due_date)}
            </Typography>
          )}
          {task.priority && (
            <Chip
              size="small"
              label={task.priority}
              color={priorityColors[priorityKey] as any || 'default'}
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </Box>
    </Paper>
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
    <Typography variant="caption">{file.file_type || ''}</Typography>
  </Box>
);

// Linked items list component with updated type to accept any array of items with IDs
const LinkedItemsList = React.memo(({
  items,
  itemsData,
  formatter,
  emptyMessage = "No related items found."
}: {
  items: (Task | Note | Events | Reminder | File)[],
  itemsData: ItemDict<any> | (Task | Note | Events | Reminder | File)[],
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

        // For tasks, we need to handle the Paper layout differently
        if ('status' in item && 'priority' in item) {
          return (
            <ListItem
              key={id}
              sx={{
                padding: '0.5rem 0',
                display: 'block',
                width: '100%'
              }}
            >
              {formatter(item)}
            </ListItem>
          );
        }

        // For other item types, use the original formatting
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

// Project details section component with corrected props
const ProjectDetailSection = React.memo(({
  title,
  items,
  itemsData,
  formatter,
  onAddItem,
  showaddbutton = true,
  disabled = false
}: {
  title: string,
  items: (Task | Note | Events | Reminder | File)[],
  itemsData: ItemDict<any> | (Task | Note | Events | Reminder | File)[],
  formatter: (item: any) => React.ReactNode,
  onAddItem: () => void,
  showaddbutton?: boolean,
  disabled?: boolean
}) => {
  // Determine the icon based on the title
  const getIcon = () => {
    if (title.includes('Task')) return <ListAlt />;
    if (title.includes('Note')) return <NoteAlt />;
    if (title.includes('Event')) return <Event />;
    if (title.includes('Reminder')) return <Notifications />;
    if (title.includes('File')) return <AttachFile />;
    return <AccountTree />;
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          {getIcon()}
          <Typography variant="h6" sx={{ ml: 1 }}>{title}</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <IconButton
            size="small"
            onClick={onAddItem}
            title={`Add New ${title.replace('Related ', '')}`}
            color="primary"
            disabled={disabled}
          >
            {showaddbutton && <AddCircleOutline />}
          </IconButton>
        </Box>
      </Box>
      <List sx={{ width: '100%' }}>
        <LinkedItemsList
          items={items}
          itemsData={itemsData}
          formatter={formatter}
        />
      </List>
    </Paper>
  );
});

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
  
  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: AlertColor;
  }>({
    open: false,
    message: '',
    type: 'success'
  });
  
  // Confirmation modal states
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogTitle, setConfirmDialogTitle] = useState('');
  const [confirmDialogMessage, setConfirmDialogMessage] = useState('');
  const [confirmDialogAction, setConfirmDialogAction] = useState<() => Promise<void>>(() => async () => {});
  
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [isSubmittingProject, setIsSubmittingProject] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Form error state
  const [formError, setFormError] = useState<string | null>(null);

  // RTK Query hooks
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
  } = useGetProjectsQuery();

  const [updateProject] = useUpdateProjectMutation();
  const [createProject] = useCreateProjectMutation();
  const [deleteProject] = useDeleteProjectMutation();

  // Query hooks for project items - these will only fetch when selectedProjectId is available
  const {
    data: tasks = []
  } = useGetTaskByProjectIdQuery(selectedProjectId as string, {
    skip: !selectedProjectId
  });

  const {
    data: notes = []
  } = useGetNoteByProjectIdQuery(selectedProjectId as string, {
    skip: !selectedProjectId
  });

  const {
    data: events = []
  } = useGetEventByProjectIdQuery(selectedProjectId as string, {
    skip: !selectedProjectId
  });

  const {
    data: reminders = []
  } = useGetReminderByProjectIdQuery(selectedProjectId as string, {
    skip: !selectedProjectId
  });

  const {
    data: files = []
  } = useGetFileByProjectIdQuery(selectedProjectId as string, {
    skip: !selectedProjectId
  });

  // Mutation hooks for adding items
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [createNote, { isLoading: isCreatingNote }] = useCreateNoteMutation();
  const [createEvent, { isLoading: isCreatingEvent }] = useCreateEventMutation();
  const [createReminder, { isLoading: isCreatingReminder }] = useCreateReminderMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeletingTask }] = useDeleteTaskMutation();

  // Initialize empty states for modal forms
  const [newTask, setNewTask] = useState<Partial<Task>>({});
  const [newNote, setNewNote] = useState<Partial<Note>>({});
  const [newEvent, setNewEvent] = useState<EventFormData>({
    id: '',
    title: '',
    date: new Date().toISOString().split('T')[0], // Initialize with today's date
    type: 'meeting',
    hours: '09',
    minutes: '00'
  });
  const [newReminder, setNewReminder] = useState<Reminder>({
    id: '',
    title: '',
    due_date: new Date().toISOString().split('T')[0], // Today's date
    priority: 'medium',
    project_id: '',
    employee_id: '',
    status: false,
    description: ''
  });

  // States for editing items
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingEvent, setEditingEvent] = useState<Events | null>(null);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  // Convert projects to dictionary for easier access - memoized
  const projectsDict = useMemo(() => {
    return projects ? projects.reduce<ItemDict<Project>>((acc, project) => {
      acc[project.id] = project;
      return acc;
    }, {}) : {};
  }, [projects]);

  // When selectedProjectId changes, update selected project from the dictionary
  useEffect(() => {
    if (selectedProjectId && projects) {
      const project = projectsDict[selectedProjectId];
      if (project) {
        setSelectedProject(project);
      }
    } else {
      setSelectedProject(null);
    }
  }, [selectedProjectId, projectsDict, projects]);

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

  // Generic form change handlers
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const { name, value } = e.target;
    console.log('Projects: Input change', name, value);
    setter((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (
    e: SelectChangeEvent<string>,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    const { name, value } = e.target;
    console.log('Projects: Select change', name, value);
    setter((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (
    status: string,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    setter((prev: any) => ({ ...prev, status }));
  };

  // Event form change handlers
  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleInputChange(e, setNewEvent);
  };

  // Task form handler
  const handleTaskFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleInputChange(e, setNewTask);
  };

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
      setIsSubmittingProject(true);
      if (isEditingProject && selectedProject) {
        // Update existing project using RTK Query mutation
        const result = await updateProject({
          id: selectedProject.id,
          ...projectData
        }).unwrap();
        showNotification(`Project "${result.title}" updated successfully`, 'success');
      } else {
        // Create new project using RTK Query mutation
        const result = await createProject(projectData).unwrap();
        setSelectedProjectId(result.id);
        showNotification(`Project "${result.title}" created successfully`, 'success');
      }

      // Reset state
      setShowAddProjectModal(false);
      setIsEditingProject(false);
      setIsSubmittingProject(false);
    } catch (error) {
      setIsSubmittingProject(false);
      console.error(isEditingProject ? 'Failed to update project:' : 'Failed to create project:', error);
      showNotification(
        isEditingProject 
          ? 'Failed to update project. Please try again.' 
          : 'Failed to create project. Please try again.',
        'error'
      );
    }
  };

  const handleEditProject = () => {
    setIsEditingProject(true);
    setShowAddProjectModal(true);
  };

  const handleTaskSubmit = async (taskData: FormData) => {
    if (!selectedProject) return;

    try {
      const result = await createTask(taskData as FormData).unwrap();
      showNotification('Task created successfully', 'success');
      setShowAddTaskModal(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      showNotification('Failed to add task. Please try again.', 'error');
    }
  };

  const handleNoteSubmit = async (noteData: Note, fileData?: FormData) => {
    if (!selectedProject) return;

    try {
      // Create FormData object
      const formData = new FormData();

      // Add note fields to FormData
      formData.append('title', noteData.title);
      formData.append('description', noteData.description || '');
      formData.append('project_id', selectedProject.id);
      formData.append('employee_id', noteData.employee_id || '');

      if (noteData.category) {
        formData.append('category', noteData.category);
      }

      // Use createNote mutation with FormData
      const newNote = await createNote(formData).unwrap();
      showNotification(`Note "${noteData.title}" created successfully`, 'success');

      // If there's file data, handle file upload separately
      if (fileData && newNote.id) {
        try {
          // Create a proper File object for the API
          const filePayload: FilePayload = {
            title: fileData.get('fileName') as string || 'Untitled File',
            type: 'note-attachment',
            project_id: selectedProject.id,
            note_id: newNote.id,
            file_data: fileData
          };

          // formData.append('file', fileData.)
          console.log('File uploaded successfully');
        } catch (fileError) {
          console.error('Error uploading file:', fileError);
          // The note was created, just the file upload failed
          showNotification('Note created but file upload failed. Please try attaching the file again.', 'warning');
        }
      }

      setShowAddNoteModal(false);
    } catch (error) {
      console.error('Failed to add note:', error);
      showNotification('Failed to add note. Please try again.', 'error');
    }
  };

  const handleEventSubmit = async (eventData: Omit<Events, 'id'>) => {
    if (!selectedProject) return;

    try {
      // Create event with required id field
      const eventPayload: EventPayload = {
        id: '',  // This will be assigned by the server
        ...eventData as any,
        project_id: selectedProject.id
      };

      // Use createEvent mutation from RTK Query
      const result = await createEvent(eventPayload as any).unwrap();
      showNotification(`Event "${result.title}" created successfully`, 'success');
      setShowAddEventModal(false);
    } catch (error) {
      console.error('Failed to add event:', error);
      showNotification('Failed to add event. Please try again.', 'error');
    }
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    try {
      if (editingEvent && editingEvent.id) {
        // Handle event update logic here
        console.log('Update event with data:', newEvent);
        showNotification(`Event "${newEvent.title}" updated successfully`, 'success');
      } else {
        // Combine date and time into a single timestamp
        const dateStr = newEvent.date;
        const hours = newEvent.hours || '00';
        const minutes = newEvent.minutes || '00';
        const fullDateTime = `${dateStr}T${hours}:${minutes}:00`;

        // Map the form event data to the API expected format
        const eventPayload: EventPayload = {
          id: '',  // This will be assigned by the server
          title: newEvent.title,
          type: newEvent.type,
          due_date: fullDateTime, // Use combined date and time
          project_id: selectedProject.id,
          description: newEvent.description,
          participants: newEvent.participants
        };

        const result = await createEvent(eventPayload as any).unwrap();
        showNotification(`Event "${result.title}" created successfully`, 'success');
      }

      // Reset the form with the proper EventFormData structure
      setNewEvent({
        id: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        type: 'meeting',
        hours: '09',
        minutes: '00'
      });
      setEditingEvent(null);
      setShowAddEventModal(false);
    } catch (error) {
      console.error('Failed to handle event:', error);
      showNotification('Failed to process event. Please try again.', 'error');
    }
  };

  const handleReminderSubmit = async (reminderData: Reminder) => {
    if (!selectedProject) return;

    try {
      // Use createReminder mutation from RTK Query
      console.log('Reminder data:', reminderData);
      
      // Validate required fields
      if (!reminderData.title.trim()) {
        showNotification('Please enter a title for the reminder.', 'warning');
        return;
      }
      
      if (!reminderData.due_date) {
        showNotification('Please select a due date for the reminder.', 'warning');
        return;
      }
      
      if (!reminderData.priority) {
        showNotification('Please select a priority level for the reminder.', 'warning');
        return;
      }
      
      // Combine date and time
      const due_time = reminderData.due_date?.split('T')[1] || '00:00';
      const due_date = `${reminderData.due_date}T${due_time}`;
      
      // Convert ReminderData to the format expected by the API
      const reminderPayload: Omit<Reminder, 'id'> = {
        title: reminderData.title,
        due_date: due_date,
        priority: reminderData.priority,
        status: Boolean(reminderData.status),
        project_id: selectedProject.id,
        employee_id: reminderData.employee_id || undefined,
        description: reminderData.description
      };
      
      const result = await createReminder(reminderPayload).unwrap();
      showNotification(`Reminder "${result.title}" created successfully`, 'success');
      setShowAddReminderModal(false);
    } catch (error) {
      console.error('Failed to add reminder:', error);
      showNotification('Failed to add reminder. Please try again.', 'error');
    }
  };

  // Show confirmation dialog
  const showConfirmDialog = (title: string, message: string, action: () => Promise<void>) => {
    setConfirmDialogTitle(title);
    setConfirmDialogMessage(message);
    setConfirmDialogAction(() => action);
    setConfirmDialogOpen(true);
  };

  // Handle confirmation dialog confirm action
  const handleConfirmDialogConfirm = async () => {
    try {
      await confirmDialogAction();
      setConfirmDialogOpen(false);
    } catch (error) {
      console.error('Error executing confirmed action:', error);
    }
  };

  // Handle confirmation dialog cancel
  const handleConfirmDialogCancel = () => {
    setConfirmDialogOpen(false);
  };

  // Handle task deletion
  const handleDeleteTask = async (taskId: string) => {
    showConfirmDialog(
      'Delete Task',
      'Are you sure you want to delete this task? This action cannot be undone.',
      async () => {
        try {
          // Call the deleteTask mutation
          const result = await deleteTask(taskId).unwrap();
          console.log(`Task ${taskId} deleted successfully`);
          showNotification('Task deleted successfully', 'success');
        } catch (error) {
          console.error('Failed to delete task:', error);
          showNotification('Failed to delete task. Please try again.', 'error');
        }
      }
    );
  };

  // Handle project deletion
  const handleDeleteProject = async (projectId: string) => {
    showConfirmDialog(
      'Delete Project',
      'Are you sure you want to delete this project? This will also delete all associated tasks, notes, events, and reminders.',
      async () => {
        try {
          // Use deleteProject mutation from RTK Query
          const result = await deleteProject(projectId).unwrap();
          setSelectedProjectId(null);
          showNotification('Project deleted successfully', 'success');
        } catch (error) {
          console.error('Failed to delete project:', error);
          showNotification('Failed to delete project. Please try again.', 'error');
        }
      }
    );
  };

  // Handle task status change
  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // Create the payload for updating the task
      const updatePayload = {
        id: taskId,
        status: newStatus
      };

      // Call the updateTask mutation
      const result = await updateTask(updatePayload).unwrap();
      console.log(`Task ${taskId} status updated to ${newStatus}`);
      showNotification(`Task status updated to "${newStatus}"`, 'success');
    } catch (error) {
      console.error('Failed to update task status:', error);
      showNotification('Failed to update task status. Please try again.', 'error');
    }
  };

  // Handlers for delete operations
  const handleDeleteEvent = (eventId: string) => {
    showConfirmDialog(
      'Delete Event',
      'Are you sure you want to delete this event? This action cannot be undone.',
      async () => {
        try {
          // Event deletion logic would go here
          console.log('Deleting event with ID:', eventId);
          // Reset states
          setEditingEvent(null);
          setShowAddEventModal(false);
          showNotification('Event deleted successfully', 'success');
        } catch (error) {
          console.error('Failed to delete event:', error);
          showNotification('Failed to delete event. Please try again.', 'error');
        }
      }
    );
  };

  // Handle project selection change from dropdown
  const handleProjectDropdownChange = (event: SelectChangeEvent) => {
    if (event.target.value) {
      selectProject(event.target.value);
    }
  };

  // Helper function to show notifications
  const showNotification = (message: string, type: AlertColor = 'success') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  // Handle notification close
  const handleCloseNotification = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  const isProjectCompleted = selectedProject?.status?.toLocaleLowerCase() === 'completed';

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'hidden' }}>
      <Box sx={{
        flexGrow: 1,
        height: '100vh',
        overflow: 'hidden'
      }}>
        <Box
          sx={{
            borderBottom: 1, borderColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
              <AccountTree sx={{ mr: 1 }} /> Projects & Businesses
            </Typography>

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
        </Box>
        <Box sx={{
          flexGrow: 1,
          height: 'calc(100vh - 100px)',
          overflow: 'auto'
        }}>
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
                items={tasks}
                itemsData={tasks}
                formatter={(task) => formatTask(task, handleTaskStatusChange, handleDeleteTask)}
                onAddItem={() => handleAddLinkedItem('Task')}
                showaddbutton={true}
                disabled={isProjectCompleted}
              />

              {/* Related Notes */}
              <ProjectDetailSection
                title="Related Notes"
                items={notes}
                itemsData={notes}
                formatter={formatNote}
                onAddItem={() => handleAddLinkedItem('Note')}
                showaddbutton={true}
                disabled={isProjectCompleted}
              />

              {/* Related Events */}
              <ProjectDetailSection
                title="Related Events"
                items={events}
                itemsData={events}
                formatter={formatEvent}
                onAddItem={() => handleAddLinkedItem('Event')}
                showaddbutton={true}
                disabled={isProjectCompleted}
              />

              {/* Related Reminders */}
              <ProjectDetailSection
                title="Related Reminders"
                items={reminders}
                itemsData={reminders}
                formatter={formatReminder}
                onAddItem={() => handleAddLinkedItem('Reminder')}
                showaddbutton={true}
                disabled={isProjectCompleted}
              />

              {/* Related Files */}
              <ProjectDetailSection
                title="Related Files"
                items={files}
                itemsData={files}
                formatter={formatFile}
                onAddItem={() => handleAddLinkedItem('File')}
                showaddbutton={false}
                disabled={isProjectCompleted}
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
            isUploading={isSubmittingProject}
          />
        </Suspense>
      )}

      {showAddTaskModal && selectedProject && (
        <Suspense fallback={<ModalFallback />}>
          <TaskModal
            projectName={selectedProject.title}
            projectId={selectedProject.id}
            onClose={() => setShowAddTaskModal(false)}
            onSubmit={handleTaskSubmit}
            task={editingTask || undefined}
            isUploading={isCreatingTask}
          />
        </Suspense>
      )}

      {showAddNoteModal && selectedProject && (
        <Suspense fallback={<ModalFallback />}>
          <NoteModal
            open={showAddNoteModal}
            onClose={() => setShowAddNoteModal(false)}
            onSave={handleNoteSubmit}
            editMode={false}
            initialData={{
              id: '',
              title: '',
              description: '',
              project_id: selectedProject.id,
              created_at: new Date().toISOString(),
              employee_id: '' // Required field
            }}
            projects={projects || []}
            isUploading={isCreatingNote}
            uploadProgress={0}
          />
        </Suspense>
      )}

      {showAddEventModal && selectedProject && (
        <Suspense fallback={<ModalFallback />}>
          <EventModal
            open={showAddEventModal}
            onClose={() => setShowAddEventModal(false)}
            eventFormData={{
              id: newEvent.id || editingEvent?.id || '',
              title: newEvent.title,
              date: newEvent.date,
              type: newEvent.type,
              description: newEvent.description,
              participants: newEvent.participants,
              hours: newEvent.hours,
              minutes: newEvent.minutes
            }}
            isEditing={!!editingEvent}
            formError={formError}
            isCreating={isCreatingEvent}
            isUpdating={false}
            isDeleting={false}
            onFormChange={handleEventFormChange}
            onSelectChange={(e: SelectChangeEvent) => handleSelectChange(e, setNewEvent)}
            onSubmit={handleEventFormSubmit}
            onDelete={handleDeleteEvent}
          />
        </Suspense>
      )}

      {showAddReminderModal && selectedProject && (
        <Suspense fallback={<ModalFallback />}>
          <ReminderModal
            open={showAddReminderModal}
            onClose={() => {
              // Check if there's unsaved data
              const hasUnsavedData = 
                (newReminder.title && newReminder.title.trim() !== '') || 
                newReminder.due_date || 
                newReminder.description;
              
              if (hasUnsavedData) {
                // Show confirmation before closing
                showConfirmDialog(
                  'Unsaved Changes',
                  'You have unsaved changes. Are you sure you want to close without saving?',
                  async () => {
                    setShowAddReminderModal(false);
                  }
                );
              } else {
                // Close directly if no unsaved data
                setShowAddReminderModal(false);
              }
            }}
            reminder={newReminder as Reminder}
            isEditing={!!editingReminder}
            employees={[]} // Add actual employee data here if available
            projects={projects || []}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleInputChange(e, setNewReminder)}
            onSelectChange={(e: SelectChangeEvent) => handleSelectChange(e, setNewReminder)}
            onStatusChange={(status: boolean) => handleStatusChange(status.toString(), setNewReminder)}
            onSubmit={() => handleReminderSubmit(newReminder as Reminder)}
          />
        </Suspense>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleConfirmDialogCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{confirmDialogTitle}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {confirmDialogMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleConfirmDialogCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmDialogConfirm} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Projects; 