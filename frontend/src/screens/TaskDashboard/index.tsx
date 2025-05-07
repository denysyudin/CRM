import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Layout/Sidebar';
import { useGetTasksQuery, useUpdateTaskMutation } from '../../redux/api/tasksApi';
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
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  FiberManualRecord as StatusIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as MoneyIcon,
  Build as ToolIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Close as CloseIcon
} from '@mui/icons-material';

const TaskDashboard: React.FC = () => {
  const theme = useTheme();
  const [shouldFetch, setShouldFetch] = useState(true);
  const { data = [], isLoading, isError, refetch } = useGetTasksQuery(undefined, {
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
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
  const StatusCircle = ({ status, taskId }: { status: string, taskId: string }) => {
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
          e.stopPropagation();
          handleStatusChange(taskId);
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
          onClick={() => refetch()}
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
           My Tasks
        </Typography>
      </Box>
      
      <Box sx={{ p: 3, height: 'calc(100vh - 60px)', overflow: 'auto' }}>
        {/* Category View */}
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
                          <StatusCircle status={task.status} taskId={task.id} />
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

        {/* Status (Kanban) View */}
        <Box sx={{ mb: 4 }}>
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
                    minHeight: '400px',
                    bgcolor: 'grey.100'
                  }}
                >
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                    {status === 'not-started' && '⚪ Not Started'}
                    {status === 'in-progress' && '🟡 In Progress'}
                    {status === 'completed' && '🔵 Completed'}
                  </Typography>
                  
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
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Today's Tasks (Grid Table View) */}
        <Box>
          <Typography variant="h6" gutterBottom>
            Today's Tasks ({formatDate(new Date())}) - Grid Table
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ p: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="5%">Status</TableCell>
                  <TableCell>Task Name</TableCell>
                  <TableCell width="10%">Priority</TableCell>
                  <TableCell width="15%">Project</TableCell>
                  <TableCell width="15%">Assigned To</TableCell>
                  <TableCell width="5%">Files</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getTodaysTasks().map(task => (
                  <TableRow key={task.id} hover>
                    <TableCell>
                      <StatusCircle status={task.status} taskId={task.id} />
                    </TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      <PriorityTag priority={task.priority} />
                    </TableCell>
                    <TableCell>{task.project_id}</TableCell>
                    <TableCell>{/* {task.employee_id} */}</TableCell>
                    <TableCell>{/* {task.files && <AttachmentIcon />} */}</TableCell>
                  </TableRow>
                ))}
                {getTodaysTasks().length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
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
            </>
          )}
        </Box>
      </Modal>
    </Container>
  );
};

export default TaskDashboard;