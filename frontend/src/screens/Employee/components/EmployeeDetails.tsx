import React, { useMemo } from 'react';
import { Employee } from '../../../types/employee.types';
import { Task } from '../../../types/task.types';
import { Note } from '../../../types/note.types';
import { Reminder } from '../../../types/reminder.types';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  useTheme,
  IconButton,
  Switch,
  FormControlLabel,
  Button
} from '@mui/material';
import CircleSharpIcon from '@mui/icons-material/CircleSharp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import AlarmIcon from '@mui/icons-material/Alarm';
import NoteIcon from '@mui/icons-material/Note';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { AddCircleOutline, Delete } from '@mui/icons-material';

interface EmployeeDetailsProps {
  employee: Employee | null;
  tasks: Task[];
  notes: Note[];
  reminders: Reminder[];
  taskFilterStatus: string;
  taskSortBy: string;
  onTaskFilterChange: (filter: string) => void;
  onTaskSortChange: (sort: string) => void;
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
  onAssignTask: () => void;
  onAddNote: () => void;
  onAddReminder: () => void;
  isEmployeeActive: boolean;
  onEmployeeStatusChange?: (status: boolean) => void;
  onDeleteEmployee?: () => void;
}

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({
  employee,
  tasks,
  notes,
  reminders,
  taskFilterStatus,
  taskSortBy,
  onTaskStatusChange,
  onAssignTask,
  onAddNote,
  onAddReminder,
  isEmployeeActive,
  onEmployeeStatusChange,
  onDeleteEmployee
}) => {
  const theme = useTheme();

  // Filter tasks based on the selected filter
  const filteredTasks = useMemo(() => {
    if (!tasks || !tasks.length) return [];
    
    let filtered = [...tasks];
    
    // Apply status filter
    if (taskFilterStatus !== 'all') {
      if (taskFilterStatus === 'pending') {
        filtered = filtered.filter(task => 
          task.status === 'not-started' || task.status === 'in-progress'
        );
      } else if (taskFilterStatus === 'inprogress') {
        filtered = filtered.filter(task => task.status === 'in-progress');
      } else if (taskFilterStatus === 'completed') {
        filtered = filtered.filter(task => task.status === 'completed');
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (taskSortBy === 'due-date') {
        const dateA = a.due_date ? new Date(a.due_date) : new Date('9999-12-31');
        const dateB = b.due_date ? new Date(b.due_date) : new Date('9999-12-31');
        return dateA.getTime() - dateB.getTime();
      } else if (taskSortBy === 'priority') {
        const priorityOrder: { [key: string]: number } = { 
          'High': 1, 
          'Medium': 2, 
          'Low': 3 
        };
        return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      }
      return 0;
    });
    
    return filtered;
  }, [tasks, taskFilterStatus, taskSortBy]);
  
  // Calculate performance stats
  const stats = useMemo(() => {
    if (!tasks || !tasks.length) {
      return {
        assigned: 0,
        pending: 0,
        completed: 0,
        overdue: 0,
        completionRate: 0
      };
    }
    
    const totalAssigned = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const totalCompleted = completedTasks.length;
    
    // Use current date instead of fixed date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = tasks.filter(task => {
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      return dueDate && dueDate < today && task.status !== 'completed';
    });
    
    const totalOverdue = overdueTasks.length;
    const totalPending = tasks.filter(task => 
      task.status === 'not-started' || task.status === 'in-progress'
    ).length;
    
    const completionRate = totalAssigned > 0 
      ? Math.round((totalCompleted / totalAssigned) * 100) 
      : 0;
      
    return {
      assigned: totalAssigned,
      pending: totalPending,
      completed: totalCompleted,
      overdue: totalOverdue,
      completionRate
    };
  }, [tasks]);
  
  // Calculate follow-ups needed from tasks and reminders
  const followUps = useMemo(() => {
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tasks with check-in dates that are due or past due
    const checkInFollowUps = tasks && tasks.length 
      ? tasks.filter(task => 
          task.status !== 'completed' && 
          task.next_checkin_date && 
          new Date(task.next_checkin_date) <= today
        )
      : [];
    
    // Overdue tasks not already in the check-in list
    const overdueTasks = tasks && tasks.length
      ? tasks.filter(task => {
          const dueDate = task.due_date ? new Date(task.due_date) : null;
          return (
            task.status !== 'completed' && 
            dueDate && 
            dueDate < today && 
            !checkInFollowUps.some(f => f.id === task.id)
          );
        })
      : [];
    
    // Format reminders as follow-ups
    const reminderFollowUps = reminders && reminders.length
      ? reminders
          .filter(reminder => !reminder.status)
          .map(reminder => ({
            id: reminder.id,
            title: reminder.title,
            due_date: reminder.due_date,
            priority: reminder.priority,
            project_id: reminder.project_id || '',
            status: 'not-started',
            assignee_id: reminder.employee_id || '',
            next_checkin_date: null,
            completion_date: null,
            notes: 'From reminder',
            isReminder: true
          }))
      : [];
    
    // Combine all types of follow-ups
    const allFollowUps = [...checkInFollowUps, ...overdueTasks, ...reminderFollowUps];
    
    // Sort by due date
    allFollowUps.sort((a, b) => {
      const dateA = a.due_date 
        ? new Date(a.due_date) 
        : (a.due_date ? new Date(a.due_date) : new Date('9999-12-31'));
      
      const dateB = b.due_date 
        ? new Date(b.due_date) 
        : (b.due_date ? new Date(b.due_date) : new Date('9999-12-31'));
      
      return dateA.getTime() - dateB.getTime();
    });
    
    return allFollowUps;
  }, [tasks, reminders]);
  
  // Function to handle task status toggle
  const handleTaskStatusToggle = (taskId: string, currentStatus: string) => {
    let nextStatus = 'not-started';
    
    if (currentStatus === 'not-started') {
      nextStatus = 'in-progress';
    } else if (currentStatus === 'in-progress') {
      nextStatus = 'completed';
    } else if (currentStatus === 'completed') {
      nextStatus = 'not-started';
    }
    onTaskStatusChange(taskId, nextStatus);
  };
  
  // Helper function to format dates
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };

  // Function to get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'in-progress':
        return <CircleSharpIcon sx={{ color: theme.palette.warning.main }} />;
      case 'not-started':
        return <CircleSharpIcon sx={{ color: theme.palette.grey[400] }} />;
      default:
        return <CircleSharpIcon sx={{ color: theme.palette.grey[400] }} />;
    }
  };

  // Function to handle employee status change
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onEmployeeStatusChange) {
      onEmployeeStatusChange(event.target.checked);
    }
  };
  
  // If no employee is selected, show placeholder
  if (!employee) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', height: '100%' }}>
        <Avatar 
          sx={{ 
            width: 80, 
            height: 80, 
            margin: '0 auto', 
            bgcolor: theme.palette.grey[300],
            fontSize: '2.5rem'
          }}
        >
          👥
        </Avatar>
        <Typography variant="h5" sx={{ mt: 2 }}>
          Select an Employee
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          Choose an employee from the list to see their details, assigned tasks, and performance.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', height: '100%', overflow: 'auto' }}>
      {/* Employee Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            sx={{ 
              width: 60, 
              height: 60, 
              bgcolor: theme.palette.primary.main,
              fontSize: '1.5rem'
            }}
          >
            {employee.name.charAt(0)}
          </Avatar>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h5">{employee.name}</Typography>
            <Typography variant="body2" color="text.secondary">{employee.role}</Typography>
            <Chip 
              label={employee.status === false ? 'Inactive' : 'Active'} 
              color={employee.status === false ? 'error' : 'success'} 
              size="small" 
              sx={{ mt: 1 }} 
            />
          </Box>
        </Box>
        <Box>
          {onEmployeeStatusChange && (
            <FormControlLabel
              control={
                <Switch 
                  checked={employee.status !== false} 
                  onChange={handleStatusChange} 
                  color="primary"
                />
              }
              label={employee.status === false ? "Set as Active" : "Set as Inactive"}
            />
          )}
          {onDeleteEmployee && (
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={onDeleteEmployee}
              sx={{ ml: 2 }}
            >
              Delete
            </Button>
          )}
        </Box>
      </Paper>
      
      {/* Tasks Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AssignmentIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Tasks</Typography>
            </Box>
          }
          action={
            <IconButton 
              color="primary" 
              onClick={onAssignTask} 
              disabled={!isEmployeeActive}
              title={!isEmployeeActive ? "Cannot assign tasks to inactive employee" : "Assign Task"}
            >
              <AddCircleOutline />
            </IconButton>
          }
        />
        <CardContent sx={{ pt: 2 }}>
          {filteredTasks.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No tasks match the current filter.
            </Typography>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
              {filteredTasks.map(task => (
                <React.Fragment key={task.id}>
                  <ListItem 
                    alignItems="flex-start"
                    sx={{ 
                      px: 2, 
                      py: 1.5,
                      opacity: task.status === 'completed' ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    secondaryAction={
                      <Chip 
                        label={task.priority}
                        size="small"
                        sx={{ 
                          bgcolor: getPriorityColor(task.priority),
                          color: '#fff'
                        }}
                      />
                    }
                  >
                    <ListItemIcon sx={{ m: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Box onClick={() => handleTaskStatusToggle(task.id, task.status)}>
                        {getStatusIcon(task.status)}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          sx={{ 
                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                            fontWeight: 500
                          }}
                        >
                          {task.title}
                        </Typography>
                      }
                      secondary={
                        <Stack direction="row" spacing={2} sx={{ mt: 0.5, fontSize: '0.875rem' }}>
                          <Typography variant="body2" color="text.secondary">
                            Due: {formatDate(task.due_date)}
                          </Typography>
                          {task.next_checkin_date && task.status !== 'completed' && (
                            <Typography variant="body2" color="text.secondary">
                              Check-in: {formatDate(task.next_checkin_date)}
                            </Typography>
                          )}
                        </Stack>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
      
      {/* Performance Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChartIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Performance</Typography>
            </Box>
          }
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}
              >
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {stats.assigned}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasks Assigned
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}
              >
                <Typography variant="h4" color="text.primary" fontWeight="bold">
                  {stats.pending}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasks Pending
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}
              >
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {stats.completed}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasks Completed
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}
              >
                <Typography 
                  variant="h4" 
                  color={stats.overdue > 0 ? "error.main" : "text.primary"} 
                  fontWeight="bold"
                >
                  {stats.overdue}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tasks Overdue
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={4} md={2.4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  bgcolor: theme.palette.grey[50],
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}
              >
                <Typography 
                  variant="h4" 
                  color={
                    stats.completionRate >= 70 
                      ? "success.main" 
                      : (stats.completionRate < 50 ? "error.main" : "warning.main")
                  } 
                  fontWeight="bold"
                >
                  {stats.completionRate}%
                </Typography>
                <Typography variant="body2" color="success.main">
                  Completion Rate
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Follow-ups Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <AlarmIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Follow-ups</Typography>
            </Box>
          }
          action={
            <IconButton 
              color="primary" 
              onClick={onAddReminder}
              disabled={!isEmployeeActive}
              title={!isEmployeeActive ? "Cannot add reminders to inactive employee" : "Add Reminder"}
            >
              <AddCircleOutline />
            </IconButton>
          }
        />
        <CardContent>
          {followUps.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No follow-ups required at this time.
            </Typography>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
              {followUps.map(item => (
                <React.Fragment key={item.id}>
                  <ListItem alignItems="center" sx={{ px: 2, py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography sx={{ fontWeight: 500 }}>
                            {item.title}
                          </Typography>
                          {(item as any).isReminder && (
                            <NotificationsIcon 
                              fontSize="small" 
                              color="warning" 
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {item.next_checkin_date ? formatDate(item.next_checkin_date) : formatDate(item.due_date)}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
      
      {/* Notes Section */}
      <Card sx={{ mb: 3 }}>
        <CardHeader 
          title={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <NoteIcon sx={{ mr: 1 }} />
              <Typography variant="h6">Notes</Typography>
            </Box>
          }
          action={
            <IconButton 
              color="primary" 
              onClick={onAddNote}
              disabled={!isEmployeeActive}
              title={!isEmployeeActive ? "Cannot add notes to inactive employee" : "Add Note"}
            >
              <AddCircleOutline />
            </IconButton>
          }
        />
        <CardContent>
          {notes.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No notes available.
            </Typography>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
              {notes.map(note => (
                <React.Fragment key={note.id}>
                  <ListItem alignItems="center" sx={{ px: 2, py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: 500 }}>
                          {note.title}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {formatDate(note.created_at)}
                        </Typography>
                      }
                    />
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default EmployeeDetails;