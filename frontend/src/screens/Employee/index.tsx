import React, { useState, useEffect } from 'react';
import EmployeeDetails from './components/EmployeeDetails';
import AddEmployeeModal from './components/AddEmployeeModal';
import AssignTaskModal from './components/AssignTaskModal';
import AddNoteModal from './components/AddNoteModal';
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
  Drawer,
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

import { useGetEmployeesQuery, useCreateEmployeeMutation } from '../../redux/api/employeesApi';
import { useGetNotesQuery, useCreateNoteMutation } from '../../redux/api/notesApi';
import { useGetRemindersQuery } from '../../redux/api/remindersApi';
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation } from '../../redux/api/tasksApi';

// Define local interfaces for EmployeeDetails component if needed
interface EmployeeDetailsProps {
  employee: Employee | null;
  tasks: any[];
  notes: any[];
  reminders: any[];
  taskFilterStatus: string;
  taskSortBy: string;
  onTaskFilterChange: (status: string) => void;
  onTaskSortChange: (sortBy: string) => void;
  onTaskStatusChange: (taskId: string, status: string) => void;
  onAssignTask: () => void;
  onAddNote: () => void;
}

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

  // Create employee mutation hook
  const [createEmployee] = useCreateEmployeeMutation();
  const [updateTask] = useUpdateTaskMutation();

  // Local state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [assignTaskModalOpen, setAssignTaskModalOpen] = useState(false);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [updateTaskStatus, setUpdateTaskStatus] = useState(false);
  const [taskFilterStatus, setTaskFilterStatus] = useState('all');
  const [taskSortBy, setTaskSortBy] = useState('due-date');
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

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
  const handleAssignTask = (taskData: Task) => {
    if (selectedEmployeeId) {
      const taskWithEmployeeId = {
        ...taskData,
        employee_id: selectedEmployeeId
      };
      console.log('Task data:', taskWithEmployeeId);
      createTask(taskWithEmployeeId)
        .unwrap()
        .then(() => {
          setAssignTaskModalOpen(true);
          console.log('Task created:', taskWithEmployeeId);
        })
        .catch((error) => {
          console.error('Failed to create task:', error);
        });
    }
  };

  //handle add note modal
  const handleAddNote = (noteData: Note) => {
    if (selectedEmployeeId) {
      const noteWithEmployeeId = {
        ...noteData,
        employee_id: selectedEmployeeId
      };
      createNote(noteWithEmployeeId)
        .unwrap()
        .then(() => {
          setAddNoteModalOpen(true);
          console.log('Note created:', noteWithEmployeeId);
        })
        .catch((error) => {
          console.error('Failed to create note:', error);
        });
    }
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

  // Calculate drawer width
  const drawerWidth = 240;

  // Check if data is loading
  const isLoading = employeesLoading || notesLoading || tasksLoading || remindersLoading;

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
            px: 3,
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
            p: 3,
            overflow: 'auto',
            backgroundColor: theme.palette.grey[100]
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 3,
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
        <AssignTaskModal
          employee={selectedEmployeeId ? getEmployeeById(selectedEmployeeId) as Employee : null}
          onSave={handleAssignTask}
          onClose={() => setAssignTaskModalOpen(false)}
        />
      )}
      {addNoteModalOpen && (
        <AddNoteModal
          employee={selectedEmployeeId ? getEmployeeById(selectedEmployeeId) as Employee : null}
          onSave={handleAddNote}
          onClose={() => setAddNoteModalOpen(false)}
        />
      )}
    </Box>
    </div>
    </div>
  );
};

export default EmployeePage; 