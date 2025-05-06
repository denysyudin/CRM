import React, { useState, useEffect } from 'react';
import EmployeeDetails from './components/EmployeeDetails';
import AddEmployeeModal from './components/AddEmployeeModal';
import TaskModal from '../../components/forms/TaskModal';
import NoteModal from '../../components/forms/NoteModal';
import Sidebar from '../../components/Sidebar/Sidebar';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  IconButton,
  Paper,
  useMediaQuery,
  useTheme,
  Stack,
  AppBar,
  Toolbar,
  CircularProgress
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import './styles.css';
import { Note } from '../../types/note.types';
import { Employee, CreateEmployeePayload } from '../../types/employee.types';
import { Task } from '../../types/task.types';
import { Reminder } from '../../types/reminder.types';
import { Project } from '../../types/project.types';

import { useGetEmployeesQuery, useCreateEmployeeMutation } from '../../redux/api/employeesApi';
import { useGetNotesQuery, useCreateNoteMutation } from '../../redux/api/notesApi';
import { useGetRemindersQuery, useCreateReminderMutation } from '../../redux/api/remindersApi';
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation } from '../../redux/api/tasksApi';
import { useGetProjectsQuery } from '../../redux/api/projectsApi';
import ReminderModal from '../../components/forms/ReminderModal';

const EmployeePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Get data using RTK Query
  const {
    data: employees = [],
    isLoading: employeesLoading
  } = useGetEmployeesQuery();

  const {
    data: notes = [],
    isLoading: notesLoading
  } = useGetNotesQuery();

  const {
    data: tasks = [],
    isLoading: tasksLoading
  } = useGetTasksQuery();

  const {
    data: reminders = [],
    isLoading: remindersLoading
  } = useGetRemindersQuery();

  const {
    data: projects = [],
    isLoading: projectsLoading
  } = useGetProjectsQuery();

  // Create employee mutation hook
  const [createEmployee] = useCreateEmployeeMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [createReminder] = useCreateReminderMutation();

  // Local state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [assignTaskModalOpen, setAssignTaskModalOpen] = useState(false);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [addReminderModalOpen, setAddReminderModalOpen] = useState(false);
  const [updateTaskStatus, setUpdateTaskStatus] = useState(false);
  const [taskFilterStatus, setTaskFilterStatus] = useState('all');
  const [taskSortBy, setTaskSortBy] = useState('due-date');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [selectedProject, setSelectedProject] = useState<string>('');

  // Add state for the reminder form
  const [reminderForm, setReminderForm] = useState<Partial<Reminder>>({
    title: '',
    description: '',
    due_date: new Date().toISOString(),
    employee_id: '',
    project_id: '',
    status: false,
    priority: 'medium'
  });

  // Adjust sidebar visibility based on screen size
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const [createTask] = useCreateTaskMutation();
  const [createNote] = useCreateNoteMutation();

  // Filter tasks, notes, and reminders for the selected employee
  const employeeTasks = selectedEmployeeId
    ? tasks.filter((task: any) => task.employee_id === selectedEmployeeId)
    : [];

  const employeeNotes = selectedEmployeeId
    ? notes.filter((note: any) => note.employee_id === selectedEmployeeId)
    : [];

  const employeeReminders = selectedEmployeeId
    ? reminders.filter((reminder: any) => reminder.employee_id === selectedEmployeeId)
    : [];

  // Handler for task status toggle
  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    const taskWithEmployeeId = {
      id: taskId,
      status: newStatus
    };
    updateTask(taskWithEmployeeId)
      .unwrap()
      .then(() => {
        setUpdateTaskStatus(true);
        console.log(`Task ${taskId} status changed to ${newStatus}`);
      })
      .catch((error) => {
        console.error('Failed to update task:', error);
      });
  };

  // Handler for adding a new employee
  const handleAddEmployee = async (name: string, role: string) => {
    try {
      // Create a payload that matches the definition in employee.types.ts
      const newEmployee: CreateEmployeePayload = {
        name,
        role
        // Don't add role as it's not part of the Employee type definition
      };

      createEmployee(newEmployee as Employee)
        .unwrap()
        .then(() => {
          setIsAddEmployeeModalOpen(false);
        })
        .catch((error) => {
          console.error('Failed to create employee:', error);
        });
    } catch (error) {
      console.error('Failed to create employee:', error);
    }
  };

  //handle assign task modal
  const handleAssignTask = (formData: FormData) => {
    if (selectedEmployeeId) {
      // Convert FormData to Task object
      const taskData: Partial<Task> = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        status: formData.get('status') as string,
        due_date: formData.get('due_date') as string,
        priority: formData.get('priority') as string,
        category: formData.get('category') as string,
        project_id: formData.get('project_id') as string,
        employee_id: selectedEmployeeId
      };
      
      console.log('Task data:', taskData);
      
      // Create task with explicitly typed data
      const taskPayload: Partial<Task> = {
        title: taskData.title || '',
        description: taskData.description || '',
        status: taskData.status || 'To Do',
        due_date: taskData.due_date || new Date().toISOString(),
        category: taskData.category || 'General',
        priority: taskData.priority || 'medium',
        project_id: taskData.project_id || '',
        employee_id: selectedEmployeeId || ''
      };
      console.log('Task payload:', taskPayload);
      createTask(taskPayload)
        .unwrap()
        .then(() => {
          setAssignTaskModalOpen(false);
          console.log('Task created successfully');
        })
        .catch((error) => {
          console.error('Failed to create task:', error);
        });
    }
  };

  //handle add note modal
  const handleAddNote = async (noteData: Note) => {
    if (selectedEmployeeId) {
      const noteWithEmployeeId = {
        ...noteData,
        employee_id: selectedEmployeeId
      };
      try {
        await createNote(noteWithEmployeeId).unwrap();
        setAddNoteModalOpen(false);
        console.log('Note created:', noteWithEmployeeId);
      } catch (error) {
        console.error('Failed to create note:', error);
      }
    }
  };

  // Handler for adding a new reminder
  const handleAddReminder = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (selectedEmployeeId && reminderForm) {
      // Create properly typed reminder data
      const reminderData: Omit<Reminder, 'id'> = {
        title: reminderForm.title || '',
        description: reminderForm.description || '',
        due_date: reminderForm.due_date || new Date().toISOString(),
        priority: reminderForm.priority || 'medium',
        status: reminderForm.status || false,
        project_id: reminderForm.project_id || selectedProject || '',
        employee_id: selectedEmployeeId
      };
      
      createReminder(reminderData)
        .unwrap()
        .then(() => {
          setAddReminderModalOpen(false);
          console.log('Reminder created:', reminderData);
        })
        .catch((error) => {
          console.error('Failed to create reminder:', error);
        });
    }
  };

  // Handler for reminder form field changes
  const handleReminderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setReminderForm({
      ...reminderForm,
      [e.target.name]: e.target.value
    });
  };

  // Handler for reminder select field changes
  const handleReminderSelectChange = (e: SelectChangeEvent) => {
    setReminderForm({
      ...reminderForm,
      [e.target.name]: e.target.value
    });
  };

  // Handler for reminder status toggle
  const handleReminderStatusChange = (checked: boolean) => {
    setReminderForm({
      ...reminderForm,
      status: checked
    });
  };

  // Handler for employee dropdown change
  const handleEmployeeChange = (event: SelectChangeEvent<string>) => {
    setSelectedEmployeeId(event.target.value);
  };

  // Get employee by ID
  const getEmployeeById = (id: string): Employee | undefined => {
    return employees.find((emp: Employee) => emp.id === id);
  };

  // Get employee name by ID
  const getEmployeeNameById = (id: string): string => {
    const employee = getEmployeeById(id);
    return employee ? employee.name : 'Select Employee';
  };

  // Find project by ID
  const getProjectById = (id: string): Project | undefined => {
    return projects.find((project: Project) => project.id === id);
  };

  // Calculate drawer width
  const drawerWidth = 240;

  // Check if data is loading
  const isLoading = employeesLoading || notesLoading || tasksLoading || remindersLoading || projectsLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <Sidebar isOpen={true} toggleSidebar={() => { }} activePath="/employee" />
      </div>
      <div className="main-content">
        <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100%',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          width: { md: `calc(100% - ${sidebarOpen ? drawerWidth : 0}px)` },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        {/* Sticky Header */}
        <AppBar
          position="sticky"
          color="default"
          elevation={0}
          sx={{
            backgroundColor: theme.palette.grey[100],
            width: '100%',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2
            }}
          >
            <Toolbar>
              <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                justifyContent: 'space-between',
                width: '100%',
                py: 1,
                zIndex: 1
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="menu"
                    onClick={toggleSidebar}
                    sx={{ mr: 2, display: { md: 'none' } }}
                  >
                    <MenuIcon />
                  </IconButton>
                  <Typography variant="h5" component="h1" sx={{ color: 'white', ml: 2 }}>
                    Employee Management
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  width={{ xs: '100%', sm: 'auto' }}
                >
                  {/* Employee Dropdown */}
                  <FormControl
                    variant="outlined"
                    size="small"
                    sx={{ minWidth: 200 }}
                  >
                    <InputLabel id="employee-select-label" shrink={true}>Employee</InputLabel>
                    <Select
                      labelId="employee-select-label"
                      id="employee-select"
                      value={selectedEmployeeId || ''}
                      onChange={handleEmployeeChange}
                      label="Employee"
                      displayEmpty
                      renderValue={(value) => (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon sx={{ mr: 1 }} />
                          {value === selectedEmployeeId ? getEmployeeNameById(value as string) : "Select Employee"}
                        </Box>
                      )}
                    >
                      {employees.map((employee: Employee) => (
                        <MenuItem key={employee.id} value={employee.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1 }} />
                            {employee.name}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => setIsAddEmployeeModalOpen(true)}
                    fullWidth={isMobile}
                  >
                    Add Employee
                  </Button>
                </Stack>
              </Box>
            </Toolbar>
          </Paper>
        </AppBar>

        {/* Scrollable Content Area */}
        <Box
          sx={{
            flexGrow: 1,
            mt: 2,
            overflow: 'auto',
            backgroundColor: theme.palette.grey[100]
          }}
        >
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2
            }}
          >
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {/* Cast to any to avoid type issues with component props */}
              <EmployeeDetails
                employee={selectedEmployeeId ? getEmployeeById(selectedEmployeeId) as Employee : null}
                tasks={employeeTasks as Task[]}
                notes={employeeNotes as Note[]}
                reminders={employeeReminders as Reminder[]}
                taskFilterStatus={taskFilterStatus}
                taskSortBy={taskSortBy}
                onTaskFilterChange={setTaskFilterStatus}
                onTaskSortChange={setTaskSortBy}
                onTaskStatusChange={handleTaskStatusChange}
                onAssignTask={() => setAssignTaskModalOpen(true)}
                onAddNote={() => setAddNoteModalOpen(true)}
                onAddReminder={() => setAddReminderModalOpen(true)}
              />
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Modals */}
      {isAddEmployeeModalOpen && (
        <AddEmployeeModal
          onSave={handleAddEmployee}
          onClose={() => setIsAddEmployeeModalOpen(false)}
        />
      )}
      {assignTaskModalOpen && (
        <TaskModal
          projectName={selectedProject ? getProjectById(selectedProject)?.title || '' : ''}
          projectId={selectedProject || ''}
          onClose={() => setAssignTaskModalOpen(false)}
          onSubmit={handleAssignTask}
        />
      )}
      {addReminderModalOpen && (
        <ReminderModal
          open={addReminderModalOpen}
          onClose={() => setAddReminderModalOpen(false)}
          onSubmit={handleAddReminder}
          onChange={handleReminderChange}
          onSelectChange={handleReminderSelectChange}
          onStatusChange={handleReminderStatusChange}
          isEditing={false}
          reminder={{
            id: '',
            title: reminderForm.title || '',
            description: reminderForm.description || '',
            due_date: reminderForm.due_date || new Date().toISOString(),
            employee_id: selectedEmployeeId || '',
            project_id: selectedProject || '',
            status: reminderForm.status || false,
            priority: reminderForm.priority || 'medium'
          }}
          projects={projects}
          employees={employees}
        />
      )}
      {addNoteModalOpen && (
        <NoteModal
          open={addNoteModalOpen}
          onClose={() => setAddNoteModalOpen(false)}
          onSave={handleAddNote}
          editMode={false}
          initialData={{
            id: '',
            title: '',
            description: '',
            project_id: selectedProject || '',
            employee_id: selectedEmployeeId || '',
            created_at: new Date().toISOString(),
            files: []
          }}
          projects={projects}
          isUploading={false}
        />
      )}
    </Box>
    </div>
    </div>
  );
};

export default EmployeePage; 