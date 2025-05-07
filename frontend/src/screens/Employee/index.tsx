import React, { useState, useEffect } from 'react';
import EmployeeDetails from './components/EmployeeDetails';
import AddEmployeeModal from './components/AddEmployeeModal';
import TaskModal from '../../components/forms/TaskModal';
import NoteModal from '../../components/forms/NoteModal';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  Paper,
  useMediaQuery,
  useTheme,
  Stack,
  CircularProgress,
  Container,
  Snackbar,
  Alert,
  AlertColor
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import './styles.css';
import { Note } from '../../types/note.types';
import { Employee, CreateEmployeePayload } from '../../types/employee.types';
import { Task } from '../../types/task.types';
import { Reminder } from '../../types/reminder.types';
import { Project } from '../../types/project.types';

import { useGetEmployeesQuery, useCreateEmployeeMutation, useUpdateEmployeeMutation, useDeleteEmployeeMutation } from '../../redux/api/employeesApi';
import { useGetNotesQuery, useCreateNoteMutation } from '../../redux/api/notesApi';
import { useGetRemindersQuery, useCreateReminderMutation } from '../../redux/api/remindersApi';
import { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation } from '../../redux/api/tasksApi';
import { useGetProjectsQuery } from '../../redux/api/projectsApi';
import ReminderModal from '../../components/forms/ReminderModal';
import ConfirmDialog from '../../components/ConfirmDialog';

// Define interface for API responses with message property
// This interface helps us handle backend responses that include a message
// property alongside the actual data. It allows for consistent notification
// display based on backend responses while maintaining type safety.
interface ApiResponse {
  message?: string;  // Response message from the server
  [key: string]: any;  // Additional properties returned by the API
}

const EmployeePage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Notification state
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Function to show notification
  const showNotification = (message: string, severity: AlertColor = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Function to close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

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
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

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

  // State for confirmation dialog
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmAction: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    confirmAction: () => {}
  });

  // Function to close confirmation dialog
  const closeConfirmDialog = () => {
    setConfirmDialog(prev => ({ ...prev, open: false }));
  };

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
    const task = tasks.find((t: any) => t.id === taskId);
    
    // If task is being marked as completed, show confirmation dialog
    // if (newStatus === 'completed' && task) {
    //   setConfirmDialog({
    //     open: true,
    //     title: 'Complete Task',
    //     message: `Are you sure you want to mark "${task.title}" as completed?`,
    //     confirmAction: () => {
    //       performTaskStatusUpdate(taskId, newStatus);
    //       closeConfirmDialog();
    //     }
    //   });
    //   // performTaskStatusUpdate(taskId, newStatus);
    // } else {
      // For other status changes, proceed without confirmation
      performTaskStatusUpdate(taskId, newStatus);
    // }
  };

  // Function to update task status
  const performTaskStatusUpdate = (taskId: string, newStatus: string) => {
    const taskWithEmployeeId = {
      id: taskId,
      status: newStatus
    };
    
    updateTask(taskWithEmployeeId)
      .unwrap()
      .then((response: ApiResponse) => {
        setUpdateTaskStatus(true);
        showNotification(response.message || `Task status updated to ${newStatus}`, 'success');
      })
      .catch((error) => {
        console.error('Failed to update task:', error);
        const errorMsg = error.data?.message || 'Failed to update task status';
        showNotification(errorMsg, 'error');
      });
  };

  // Handler for adding a new employee
  const handleAddEmployee = async (employee: Employee) => {
    try {
      // Validate required fields
      if (!employee.name?.trim()) {
        showNotification('Employee name is required', 'error');
        return;
      }
      
      if (!employee.role?.trim()) {
        showNotification('Employee role is required', 'error');
        return;
      }
      
      // Create a payload that matches the definition in employee.types.ts
      const newEmployee: Employee = {
        id: '',
        name: employee.name,
        role: employee.role,
        status: employee.status || true
      };

      createEmployee(newEmployee as Employee)
        .unwrap()
        .then((response: ApiResponse) => {
          setIsAddEmployeeModalOpen(false);
          showNotification(response.message || 'Employee added successfully', 'success');
        })
        .catch((error) => {
          console.error('Failed to create employee:', error);
          const errorMsg = error.data?.message || 'Failed to add employee';
          showNotification(errorMsg, 'error');
        });
    } catch (error: any) {
      console.error('Failed to create employee:', error);
      const errorMsg = error.data?.message || 'Failed to add employee';
      showNotification(errorMsg, 'error');
    }
  };

  // Check if the selected employee is active
  const isEmployeeActive = (): boolean => {
    if (!selectedEmployeeId) return false;
    const employee = getEmployeeById(selectedEmployeeId);
    return employee?.status !== false;
  };

  // Handler for employee status update
  const handleEmployeeStatusChange = (newStatus: boolean) => {
    if (selectedEmployeeId) {
      const employee = getEmployeeById(selectedEmployeeId);
      if (employee) {
        const statusText = newStatus ? 'active' : 'inactive';
        
        setConfirmDialog({
          open: true,
          title: `Change Employee Status`,
          message: `Are you sure you want to set ${employee.name} as ${statusText}?`,
          confirmAction: () => {
            updateEmployeeStatus(employee, newStatus);
            closeConfirmDialog();
          }
        });
      }
    }
  };

  // Function to update employee status
  const updateEmployeeStatus = (employee: Employee, newStatus: boolean) => {
    if (!selectedEmployeeId) return;
    
    updateEmployee({
      id: selectedEmployeeId,
      status: newStatus,
      name: employee.name,
      role: employee.role,
      project_id: employee.project_id || ''
    })
      .unwrap()
      .then((response: ApiResponse) => {
        showNotification(response.message || `Employee status changed to ${newStatus ? 'active' : 'inactive'}`, 'success');
      })
      .catch((error) => {
        console.error('Failed to update employee status:', error);
        const errorMsg = error.data?.message || 'Failed to update employee status';
        showNotification(errorMsg, 'error');
      });
  };

  //handle assign task modal
  const handleAssignTask = (formData: FormData) => {
    if (!selectedEmployeeId) {
      showNotification('Please select an employee first', 'error');
      return;
    }
    
    if (!isEmployeeActive()) {
      showNotification('Cannot assign task to inactive employee', 'error');
      return;
    }
    
    // Check if required fields exist in formData
    const title = formData.get('title');
    const dueDate = formData.get('due_date');
    
    if (!title) {
      showNotification('Task title is required', 'error');
      return;
    }
    
    if (!dueDate) {
      showNotification('Task due date is required', 'error');
      return;
    }
    
    // The TaskModal component sends FormData, which is what our API expects
    createTask(formData)
      .unwrap()
      .then((response: ApiResponse) => {
        setAssignTaskModalOpen(false);
        showNotification(response.message || 'Task assigned successfully', 'success');
      })
      .catch((error) => {
        console.error('Failed to create task:', error);
        const errorMsg = error.data?.message || 'Failed to assign task';
        showNotification(errorMsg, 'error');
      });
  };

  //handle add note modal
  const handleAddNote = async (noteData: Note) => {
    if (!selectedEmployeeId) {
      showNotification('Please select an employee first', 'error');
      return;
    }
    
    if (!isEmployeeActive()) {
      showNotification('Cannot add note for inactive employee', 'error');
      return;
    }
    
    // Validate required fields
    if (!noteData.title?.trim()) {
      showNotification('Note title is required', 'error');
      return;
    }
    
    // Create FormData for the API
    const formData = new FormData();
    formData.append('title', noteData.title || '');
    formData.append('description', noteData.description || '');
    formData.append('project_id', noteData.project_id || '');
    formData.append('employee_id', selectedEmployeeId);
    formData.append('created_at', new Date().toISOString());
    
    // Handle file if exists
    if (noteData.file && noteData.file.length > 0) {
      noteData.file.forEach(file => {
        formData.append('file', file);
      });
    }
    
    try {
      const response: ApiResponse = await createNote(formData).unwrap();
      setAddNoteModalOpen(false);
      showNotification(response.message || 'Note added successfully', 'success');
    } catch (error: any) {
      console.error('Failed to create note:', error);
      const errorMsg = error.data?.message || 'Failed to add note';
      showNotification(errorMsg, 'error');
    }
  };

  // Function to show error
  const showError = (message: string) => {
    showNotification(message, 'error');
  };

  // Handler for adding a new reminder
  const handleAddReminder = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    // Validate required fields
    if (!selectedEmployeeId) {
      showNotification('Please select an employee first', 'error');
      return;
    }
    
    if (!isEmployeeActive()) {
      showNotification('Cannot create reminder for inactive employee', 'error');
      return;
    }
    
    if (!reminderForm) {
      showNotification('Reminder form data is missing', 'error');
      return;
    }
    
    if (!reminderForm.title?.trim()) {
      showNotification('Please enter a title for the reminder', 'error');
      return;
    }
    
    if (!reminderForm.due_date) {
      showNotification('Please select a due date for the reminder', 'error');
      return;
    }

    // Combine date and time into a single timestamp
    const dueDate = reminderForm.due_date || '';
    const combinedDateTime = `${dueDate}`;

    // Create properly typed reminder data
    const reminderData: any = {
      title: reminderForm.title,
      description: reminderForm.description || '',
      due_date: combinedDateTime,
      priority: reminderForm.priority || 'medium',
      status: reminderForm.status || false,
      project_id: reminderForm.project_id || selectedProject || '',
      employee_id: selectedEmployeeId
    };

    createReminder(reminderData)
      .unwrap()
      .then((response: ApiResponse) => {
        setAddReminderModalOpen(false);
        // Reset form after successful creation
        setReminderForm({
          title: '',
          description: '',
          due_date: new Date().toISOString(),
          employee_id: '',
          project_id: '',
          status: false,
          priority: 'medium'
        });
        showNotification(response.message || 'Reminder created successfully', 'success');
      })
      .catch((error) => {
        console.error('Failed to create reminder:', error);
        const errorMsg = error.data?.message || 'Failed to create reminder. Please try again.';
        showNotification(errorMsg, 'error');
      });
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

  // Check if data is loading
  const isLoading = employeesLoading || notesLoading || tasksLoading || remindersLoading || projectsLoading;

  // Handler for deleting an employee
  const handleDeleteEmployee = () => {
    if (!selectedEmployeeId) {
      showNotification('No employee selected', 'error');
      return;
    }

    const employeeName = getEmployeeNameById(selectedEmployeeId);
    
    setConfirmDialog({
      open: true,
      title: 'Delete Employee',
      message: `Are you sure you want to delete ${employeeName}? This action cannot be undone.`,
      confirmAction: () => {
        deleteEmployee(selectedEmployeeId)
          .unwrap()
          .then(() => {
            setSelectedEmployeeId(null);
            showNotification('Employee deleted successfully', 'success');
            closeConfirmDialog();
          })
          .catch((error) => {
            console.error('Failed to delete employee:', error);
            const errorMsg = error.data?.message || 'Failed to delete employee';
            showNotification(errorMsg, 'error');
            closeConfirmDialog();
          });
      }
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Main content */}
        <Box
          sx={{
            p: 2,
            flexGrow: 1,
            height: '100%',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
            <Box sx={{
              display: 'flex',
              alignItems: { xs: 'flex-start', sm: 'center' },
              justifyContent: 'space-between',
              width: '100%',
              borderBottom: 1, borderColor: 'divider',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', }}>
                <Typography variant="h5" component="h1" sx={{ ml: 2 }}>
                  <PersonIcon /> Employee Management
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
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1 }} />
                            {employee.name}
                          </Box>
                          {employee.status === false && (
                            <Typography variant="caption" color="error" sx={{ ml: 1 }}>
                              (Inactive)
                            </Typography>
                          )}
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
                  onAssignTask={() => isEmployeeActive() && setAssignTaskModalOpen(true)}
                  onAddNote={() => isEmployeeActive() && setAddNoteModalOpen(true)}
                  onAddReminder={() => isEmployeeActive() && setAddReminderModalOpen(true)}
                  isEmployeeActive={isEmployeeActive()}
                  onEmployeeStatusChange={handleEmployeeStatusChange}
                  onDeleteEmployee={handleDeleteEmployee}
                />
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Confirmation Dialog */}
        <ConfirmDialog
          open={confirmDialog.open}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={confirmDialog.confirmAction}
          onCancel={closeConfirmDialog}
          severity="error"
          confirmText="Yes"
          cancelText="No"
        />

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert 
            onClose={handleCloseNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Modals */}
        <AddEmployeeModal
          onSave={handleAddEmployee}
          onClose={() => setIsAddEmployeeModalOpen(false)}
          open={isAddEmployeeModalOpen}
        />
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
            onClose={() => {
              // Reset the form when closing the modal
              setReminderForm({
                title: '',
                description: '',
                due_date: new Date().toISOString(),
                employee_id: '',
                project_id: '',
                status: false,
                priority: 'medium'
              });
              setAddReminderModalOpen(false);
            }}
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
            } as any}
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
              file: []
            }}
            projects={projects}
            isUploading={false}
          />
        )}
      </Box>
    </Container>
  );
};

export default EmployeePage; 