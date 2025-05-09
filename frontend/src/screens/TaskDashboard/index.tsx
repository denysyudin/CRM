import React, { useState, useEffect } from 'react';
import { useGetTasksQuery, useUpdateTaskMutation, useCreateTaskMutation } from '../../redux/api/tasksApi';
import { useGetFilesQuery } from '../../redux/api/filesApi';
import { useGetProjectsQuery } from '../../redux/api/projectsApi';
import { useGetEmployeesQuery } from '../../redux/api/employeesApi';
import TaskModal from '../../components/forms/TaskModal';
import { Task } from '../../types/task.types';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Grid, 
  Chip, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Modal,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Divider,
  AlertColor,
  Snackbar,
  Alert,
  Tooltip,
  Tabs,
  Tab
} from '@mui/material';
import {
  FiberManualRecord as StatusIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  Build as ToolIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import AddIcon from '@mui/icons-material/Add';
import TaskOutlinedIcon from '@mui/icons-material/TaskOutlined';

const TaskDashboard: React.FC = () => {
  // const theme = useTheme();

  const { data: filesData = [], refetch: refetchFiles } = useGetFilesQuery();
  const { data: projectsData = [], } = useGetProjectsQuery();
  const { data: employeesData = [], } = useGetEmployeesQuery();

  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();

  // Define all useState hooks at the top level of the component
  const [shouldFetch, setShouldFetch] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: AlertColor;
  }>({
    open: false,
    message: '',
    type: 'success'
  });
  const [tabValue, setTabValue] = useState(0);

  const { data = [], isLoading, isError, refetch: refetchTasks } = useGetTasksQuery(undefined, {
    skip: !shouldFetch
  });

  useEffect(() => {
    if (data.length === 0) {
      setShouldFetch(true);
    }
  }, [data]);
  
  const [updateTask] = useUpdateTaskMutation();
  const tasks = data as unknown as Task[];
  
  const tasksLoading = isLoading;
  const tasksError = isError;
  
  // const [sidebarOpen, setSidebarOpen] = useState(true);
  // const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Set sidebar state based on screen size
  // useEffect(() => {
  //   if (isMobile) {
  //     setSidebarOpen(false);
  //   } else {
  //     setSidebarOpen(true);
  //   }
  // }, [isMobile]);

  // Handle status circle click
  const handleStatusChange = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    let newStatus = 'not-started';
    if (task.status === 'not-started') newStatus = 'in-progress';
    else if (task.status === 'in-progress') newStatus = 'completed';
    else if (task.status === 'completed') newStatus = 'not-started';
    updateTask({
      id: taskId,
      status: newStatus
    });
  };

  // Modal handlers
  const openModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Drag and drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: 'not-started' | 'in-progress' | 'completed') => {
    e.preventDefault();
    
    if (draggedTask) {
      const task = tasks.find(t => t.id === draggedTask);
      if (task) {
        updateTask({
          id: draggedTask,
          status: newStatus
        });
      }
      
      setDraggedTask(null);
      showNotification('Task status updated', 'success');
    }

  };

  const getTasksByCategory = () => {
    const categories: { [key: string]: Task[] } = {
      'General': []
    };
    
    tasks.forEach(task => {
      if (task.category) {
        if (!categories[task.category]) {
          categories[task.category] = [];
        }
        categories[task.category].push(task);
      } else {
        categories['General'].push(task);
      }
    });
    
    return categories;
  };

  const getTasksByStatus = () => {
    return {
      'not-started': tasks.filter(task => task.status === 'not-started'),
      'in-progress': tasks.filter(task => task.status === 'in-progress'),
      'completed': tasks.filter(task => task.status === 'completed')
    };
  };

  const getTodaysTasks = () => {
    // Get today's date in local timezone (YYYY-MM-DD format)
    const today = new Date();
    const localDate = today.getFullYear() + '-' + 
                     String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(today.getDate()).padStart(2, '0');
    
    // Filter tasks by local date
    return tasks.filter(task => task.due_date === localDate);
  };

  // Status circle component
  const StatusCircle = ({ status, taskId, disable }: { status: string, taskId: string, disable: boolean }) => {
    const getStatusColor = () => {
      switch(status) {
        case 'not-started': return 'default';
        case 'in-progress': return 'warning';
        case 'completed': return 'primary';
        default: return 'default';
      }
    };
    
    return (
      <IconButton 
        size="small" 
        onClick={(e) => {
          if (!disable) {
            e.stopPropagation();
            handleStatusChange(taskId);
            showNotification('Task status updated', 'success');
          }
        }}
      >
        <StatusIcon color={getStatusColor() as any} fontSize="small" />
      </IconButton>
    );
  };

  // Priority component
  const PriorityTag = ({ priority }: { priority: string }) => {
    const getColor = () => {
      switch(priority) {
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'success';
        default: return 'default';
      }
    };
    
    return (
      <Chip 
        label={priority.charAt(0).toUpperCase() + priority.slice(1)} 
        color={getColor()} 
        size="small"
        variant="outlined"
      />
    );
  };

  // Format date to a readable string
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Display loading state
  if (tasksLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Display error state
  if (tasksError) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error loading tasks. Please try again.
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => refetchTasks()}
        >
          Retry
        </Button>
      </Box>
    );
  }

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'To Buy':
        return <ShoppingCartIcon fontSize="small" />;
      case 'To Pay':
        return <MoneyIcon fontSize="small" />;
      case 'To Fix':
        return <ToolIcon fontSize="small" />;
      case 'To Review':
        return <VisibilityIcon fontSize="small" />;
      default:
        return <AssignmentIcon fontSize="small" />;
    }
  };

  const handleTaskSubmit = async (taskData: FormData) => {
    try {
      await createTask(taskData as FormData).unwrap();
      showNotification('Task created successfully', 'success');
      refetchTasks();
      refetchFiles();
      setShowTaskModal(false);
    } catch (error) {
      console.error('Failed to add task:', error);
      showNotification('Failed to add task. Please try again.', 'error');
    }
  };

  const showNotification = (message: string, type: AlertColor = 'success') => {
    setNotification({
      open: true,
      message,
      type
    });
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle notification close
  const handleCloseNotification = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        p: 2, 
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
          All Tasks
        </Typography>
        {/* Add Task Button */}
        <Button
          onClick={() => setShowTaskModal(true)}
          aria-label="Add Task"
          sx={{
              position: 'flex',
              bgcolor: 'primary.main',
              color: 'white',
              marginLeft: 'auto',
              '&:hover': {
                  bgcolor: 'primary.dark',
              },
              padding: '0.5rem'
          }}
        >
          <AddIcon sx={{ fontSize: '1rem', marginRight: '0.5rem' }} /> New Task
        </Button>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="task dashboard tabs">
          <Tab label="Overview" />
          <Tab label="Category" />
          <Tab label="Status" />
          <Tab label="List" />
        </Tabs>
      </Box>
      
      <Box sx={{ p: 3, height: 'calc(100vh - 140px)', overflow: 'auto' }}>
        {/* Tab 0: Overview */}
        {tabValue === 0 && (
          <>
            {/* Today's Tasks (Grid Table View) */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Today's Tasks ({formatDate(new Date())})
              </Typography>
              <TableContainer component={Paper} variant="outlined" sx={{ p: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell width="5%" align="center">Status</TableCell>
                      <TableCell align="center">Task Name</TableCell>
                      <TableCell width="15%" align="center">Priority</TableCell>
                      <TableCell width="15%" align="center">Category</TableCell>
                      <TableCell width="15%" align="center">Project</TableCell>
                      <TableCell width="15%" align="center">Assigned To</TableCell>
                      <TableCell width="10%" align="center">Files</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {getTodaysTasks().map(task => (
                      <TableRow key={task.id} hover>
                        <TableCell>
                          <StatusCircle status={task.status} taskId={task.id} disable={true} />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{task.title}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{task.category}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <PriorityTag priority={task.priority} />
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{projectsData.filter(project => project.id === task.project_id).map(project => project.title).join(', ')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{employeesData.filter(employee => employee.id === task.employee_id).map(employee => employee.name).join(', ')}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{filesData.filter(file => file.id === task.file_id).map(file => file.title).join(', ')}</TableCell>
                      </TableRow>
                    ))}
                    {getTodaysTasks().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            No tasks due today
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Tasks by Category */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Tasks by Category
              </Typography>
              <Grid container spacing={3}>
                {Object.entries(getTasksByCategory()).map(([category, categoryTasks]) => (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Paper elevation={1} sx={{ height: '100%', p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {getCategoryIcon(category)}
                        <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'medium' }}>
                          {category}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      
                      {categoryTasks.map(task => (
                        <Card 
                          key={task.id} 
                          variant="outlined" 
                          sx={{ 
                            mb: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' }
                          }}
                          onClick={() => openModal(task)}
                        >
                          <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <StatusCircle status={task.status} taskId={task.id} disable={false}/>
                              <Box sx={{ ml: 1, width: '100%' }}>
                                <Typography 
                                  variant="body2"
                                  sx={{
                                    textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                    color: task.status === 'completed' ? 'text.disabled' : 'text.primary'
                                  }}
                                >
                                  {task.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                                  <PriorityTag priority={task.priority} />
                                  <Typography variant="caption" color="text.secondary">
                                    {task.due_date}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {categoryTasks.length === 0 && (
                        <Typography variant="body2" color="text.secondary" align="center">
                          No tasks in this category
                        </Typography>
                      )}
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Tasks by Status (Kanban) */}
            <Box>
              <Typography variant="h6" gutterBottom>
                Tasks by Status (Kanban)
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(getTasksByStatus()).map(([status, statusTasks]) => (
                  <Grid item xs={12} sm={4} key={status}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status as 'not-started' | 'in-progress' | 'completed')}
                  >
                    <Paper 
                      elevation={1} 
                      sx={{ 
                        p: 2, 
                        height: '400px',
                        bgcolor: 'grey.100',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                        {status === 'not-started' && '⚪ Not Started'}
                        {status === 'in-progress' && '🟡 In Progress'}
                        {status === 'completed' && '🔵 Completed'}
                      </Typography>
                      
                      <Box sx={{ overflowY: 'auto', flex: 1 }}>
                        {statusTasks.map(task => (
                          <Card 
                            key={task.id}
                            draggable
                            onDragStart={() => handleDragStart(task.id)}
                            variant="outlined"
                            sx={{ 
                              mb: 1,
                              opacity: task.status === 'completed' ? 0.7 : 1,
                              cursor: 'grab'
                            }}
                          >
                            <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                              <Typography 
                                variant="body2"
                                sx={{
                                  textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                                }}
                              >
                                {task.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                                <PriorityTag priority={task.priority} />
                                <Chip 
                                  label={task.category || 'General'} 
                                  size="small" 
                                  variant="outlined"
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {task.due_date}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                        
                        {statusTasks.length === 0 && (
                          <Typography variant="body2" color="text.secondary" align="center">
                            No tasks in this status
                          </Typography>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </>
        )}

        {/* Tab 1: Category View */}
        {tabValue === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tasks by Category
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(getTasksByCategory()).map(([category, categoryTasks]) => (
                <Grid item xs={12} sm={6} md={4} key={category}>
                  <Paper elevation={1} sx={{ height: '100%', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {getCategoryIcon(category)}
                      <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'medium' }}>
                        {category}
                      </Typography>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    
                    {categoryTasks.map(task => (
                      <Card 
                        key={task.id} 
                        variant="outlined" 
                        sx={{ 
                          mb: 1,
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' }
                        }}
                        onClick={() => openModal(task)}
                      >
                        <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <StatusCircle status={task.status} taskId={task.id} disable={false}/>
                            <Box sx={{ ml: 1, width: '100%' }}>
                              <Typography 
                                variant="body2"
                                sx={{
                                  textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                  color: task.status === 'completed' ? 'text.disabled' : 'text.primary'
                                }}
                              >
                                {task.title}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                                <PriorityTag priority={task.priority} />
                                <Typography variant="caption" color="text.secondary">
                                  {task.due_date}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {categoryTasks.length === 0 && (
                      <Typography variant="body2" color="text.secondary" align="center">
                        No tasks in this category
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Tab 2: Status (Kanban) View */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Tasks by Status (Kanban)
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(getTasksByStatus()).map(([status, statusTasks]) => (
                <Grid item xs={12} sm={4} key={status}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, status as 'not-started' | 'in-progress' | 'completed')}
                >
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      p: 2, 
                      height: '400px',
                      bgcolor: 'grey.100',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                      {status === 'not-started' && '⚪ Not Started'}
                      {status === 'in-progress' && '🟡 In Progress'}
                      {status === 'completed' && '🔵 Completed'}
                    </Typography>
                    
                    <Box sx={{ overflowY: 'auto', flex: 1 }}>
                      {statusTasks.map(task => (
                        <Card 
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task.id)}
                          variant="outlined"
                          sx={{ 
                            mb: 1,
                            opacity: task.status === 'completed' ? 0.7 : 1,
                            cursor: 'grab'
                          }}
                        >
                          <CardContent sx={{ py: 1, '&:last-child': { pb: 1 } }}>
                            <Typography 
                              variant="body2"
                              sx={{
                                textDecoration: task.status === 'completed' ? 'line-through' : 'none'
                              }}
                            >
                              {task.title}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                              <PriorityTag priority={task.priority} />
                              <Chip 
                                label={task.category || 'General'} 
                                size="small" 
                                variant="outlined"
                              />
                              <Typography variant="caption" color="text.secondary">
                                {task.due_date}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                      
                      {statusTasks.length === 0 && (
                        <Typography variant="body2" color="text.secondary" align="center">
                          No tasks in this status
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Tab 3: List View */}
        {tabValue === 3 && (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
              Today's Tasks
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ p: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width="5%" align="center">Status</TableCell>
                    <TableCell align="center">Task Name</TableCell>
                    <TableCell width="15%" align="center">Priority</TableCell>
                    <TableCell width="15%" align="center">Category</TableCell>
                    <TableCell width="15%" align="center">Project</TableCell>
                    <TableCell width="15%" align="center">Assigned To</TableCell>
                    <TableCell width="10%" align="center">Files</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTodaysTasks().map(task => (
                    <TableRow 
                      key={task.id} 
                      hover 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => openModal(task)}
                    >
                      <TableCell>
                        <StatusCircle status={task.status} taskId={task.id} disable={false} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{task.title}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <PriorityTag priority={task.priority} />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{task.category || 'General'}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{projectsData.filter(project => project.id === task.project_id).map(project => project.title).join(', ')}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{employeesData.filter(employee => employee.id === task.employee_id).map(employee => employee.name).join(', ')}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>{filesData.filter(file => file.id === task.file_id).map(file => file.title).join(', ')}</TableCell>
                    </TableRow>
                  ))}
                  {getTodaysTasks().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <Typography variant="body2" color="text.secondary">
                          No tasks due today
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>

      {/* Task Description Modal */}
      <Modal
        open={isModalOpen}
        onClose={closeModal}
        aria-labelledby="task-description-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 500 },
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 1,
        }}>
          {selectedTask && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" component="h2">
                  Task: {selectedTask.title}
                </Typography>
                <IconButton onClick={closeModal} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1">
                Description: {selectedTask.description || 'No description provided.'}
              </Typography>
              
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Status</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <StatusCircle status={selectedTask.status} taskId={selectedTask.id} disable={true} />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {selectedTask.status === 'not-started' && 'Not Started'}
                        {selectedTask.status === 'in-progress' && 'In Progress'}
                        {selectedTask.status === 'completed' && 'Completed'}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Priority</Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <PriorityTag priority={selectedTask.priority} />
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Due Date</Typography>
                    <Typography variant="body2">{selectedTask.due_date || 'Not set'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Category</Typography>
                    <Typography variant="body2">{selectedTask.category || 'General'}</Typography>
                  </Grid>
                  {selectedTask.project_id && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Project</Typography>
                      <Typography variant="body2">{projectsData.filter(project => project.id === selectedTask.project_id).map(project => project.title).join(', ')}</Typography>
                    </Grid>
                  )}
                  {selectedTask.file_id && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Files</Typography>
                      <Typography variant="body2">{filesData.filter(file => file.id === selectedTask.file_id).map(file => file.title).join(', ')}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </>
          )}
        </Box>
      </Modal>

      {/* Add Task Modal */}
      {
        showTaskModal && (
          <TaskModal
            projectName=""
            projectId=""
            onClose={() => setShowTaskModal(false)}
            onSubmit={handleTaskSubmit}
            task={undefined}
            isUploading={isCreatingTask}
          />
        )
      }
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

export default TaskDashboard;