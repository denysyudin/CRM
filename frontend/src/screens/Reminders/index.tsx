import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Container, Paper, Grid, Checkbox,
  FormControl, InputLabel, MenuItem, Select, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, Divider, ListItem, List, ListItemText,
  ListItemIcon, Snackbar, Alert, CircularProgress,
  SelectChangeEvent, FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Folder as FolderIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import Sidebar from '../../components/Sidebar/Sidebar';
import './styles.css';
import { Reminder } from '../../types/reminder.types';

import { 
  useGetRemindersQuery, 
  useCreateReminderMutation, 
  useUpdateReminderMutation, 
  useDeleteReminderMutation 
} from '../../redux/api/remindersApi';
import { useGetProjectsQuery } from '../../redux/api/projectsApi';
import { useGetEmployeesQuery } from '../../redux/api/employeesApi';

const Reminders: React.FC = () => {
  // RTK Query hooks
  const { 
    data: reduxReminders = [], 
    isLoading, 
    error: remindersError, 
    refetch: refetchReminders 
  } = useGetRemindersQuery();
  
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: employees = [] } = useGetEmployeesQuery();
  
  const [createReminder] = useCreateReminderMutation();
  const [updateReminder] = useUpdateReminderMutation();
  const [deleteReminder] = useDeleteReminderMutation();
  
  // Local state for UI display
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // UI state
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [sortBy, setSortBy] = useState<'due-date' | 'priority' | 'created'>('due-date');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
    visible: boolean;
  }>({
    message: '',
    type: 'info',
    visible: false
  });

  // Form state for new reminder
  const [newReminder, setNewReminder] = useState({
    name: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    project_id: '',
    employee_id: '',
    status: false
  });
  
  // Add state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    // Map Redux reminders to local interface
    const mappedReminders: Reminder[] = reduxReminders.map(reminder => ({
      id: reminder.id,
      title: reminder.title || "",
      due_date: reminder.due_date,
      priority: (reminder.priority || 'medium') as 'high' | 'medium' | 'low',
      status: reminder.status || false,
      project_id: reminder.project_id || '',
      employee_id: reminder.employee_id || '',
      relatedTo: reminder.project_id ? {
        type: 'project' as const,
        name: `Project ${reminder.project_id}`
      } : undefined
    }));
    
    setReminders(mappedReminders);
  }, [reduxReminders]);

  // Hide notification after 3 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (notification.visible) {
      timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [notification.visible]);

  // Check for mobile screen on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Show notification
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({
      message,
      type,
      visible: true
    });
  };

  // Adjust sidebar visibility based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle reminder completed status
  const toggleReminderStatus = async (id: string) => {
    console.log(`Reminders: Toggling status for reminder ${id}`);
    const reminder = reminders.find(r => r.id === id);
    
    if (reminder) {
      const status = !reminder.status;
      try {
        await updateReminder({
          id,
          title: reminder.title,
          due_date: reminder.due_date,
          priority: reminder.priority,
          status: status,
          project_id: reminder.project_id,
          employee_id: reminder.employee_id
        }).unwrap();
        
        // Also update local state immediately for UI responsiveness
        setReminders(prevReminders => 
          prevReminders.map(reminder => 
            reminder.id === id 
              ? { ...reminder, status: !reminder.status } 
              : reminder
          )
        );
        
        showNotification(
          `Reminder marked as ${status ? 'completed' : 'pending'}`,
          'success'
        );
      } catch (error) {
        console.error('Failed to update reminder status:', error);
        showNotification('Failed to update reminder status', 'error');
      }
    }
  };

  // Handle new reminder button click
  const handleNewReminder = () => {
    setEditingReminder(null);
    setNewReminder({
      name: '',
      dueDate: '',
      dueTime: '',
      priority: 'medium',
      project_id: '',
      employee_id: '',
      status: false
    });
    setIsModalOpen(true);
  };
  
  // Handle edit reminder
  const handleEditReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      // Parse date and time from due_date
      const dueDate = new Date(reminder.due_date);
      const dateStr = dueDate.toISOString().split('T')[0];
      const timeStr = dueDate.toTimeString().substring(0, 5);
      console.log('Reminders: Editing reminder', reminder);
      setNewReminder({
        name: reminder.title,
        dueDate: dateStr,
        dueTime: timeStr,
        status: reminder.status,
        priority: reminder.priority as 'high' | 'medium' | 'low',
        project_id: reminder.project_id || '',
        employee_id: reminder.employee_id || ''
      });
      setEditingReminder(id);
      setIsModalOpen(true);
    }
  };
  
  // Handle input changes for the new reminder form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reminders: Creating/updating reminder', newReminder);
    
    if (newReminder.name && newReminder.dueDate) {
      // Combine date and time for the due_date
      const combinedDateTime = newReminder.dueTime 
        ? `${newReminder.dueDate}T${newReminder.dueTime}`
        : `${newReminder.dueDate}T00:00:00`;
      
      try {
        if (editingReminder) {
          // Update existing reminder
          await updateReminder({
            id: editingReminder,
            title: newReminder.name,
            due_date: combinedDateTime,
            priority: newReminder.priority,
            project_id: newReminder.project_id || undefined,
            employee_id: newReminder.employee_id || undefined,
            status: newReminder.status
          }).unwrap();
          
          showNotification('Reminder updated successfully', 'success');
        } else {
          // Create new reminder
          await createReminder({
            title: newReminder.name,
            due_date: combinedDateTime,
            priority: newReminder.priority,
            status: false,
            project_id: newReminder.project_id || undefined,
            employee_id: newReminder.employee_id || undefined
          }).unwrap();
          
          showNotification('Reminder created successfully', 'success');
        }
        
        // Close modal and reset form
        setIsModalOpen(false);
        setEditingReminder(null);
        setNewReminder({
          name: '',
          dueDate: '',
          dueTime: '',
          priority: 'medium',
          project_id: '',
          employee_id: '',
          status: false
        });
      } catch (error) {
        console.error('Failed to save reminder:', error);
        showNotification(
          `Failed to ${editingReminder ? 'update' : 'create'} reminder`, 
          'error'
        );
      }
    }
  };

  // Handle delete reminder
  const handleDeleteReminder = async (id: string) => {
    setReminderToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion when dialog confirms
  const confirmDeleteReminder = async () => {
    if (reminderToDelete) {
      try {
        await deleteReminder(reminderToDelete).unwrap();
        showNotification('Reminder deleted successfully', 'success');
      } catch (error) {
        console.error('Failed to delete reminder:', error);
        showNotification('Failed to delete reminder', 'error');
      }
      setDeleteDialogOpen(false);
      setReminderToDelete(null);
    }
  };

  // Cancel deletion
  const cancelDeleteReminder = () => {
    setDeleteDialogOpen(false);
    setReminderToDelete(null);
  };

  // Filter reminders based on status
  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !reminder.status;
    if (filter === 'completed') return reminder.status;
    return true;
  });

  // Sort reminders
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (sortBy === 'due-date') {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
    } else { // 'created' - using ID as proxy for creation date in this example
      return a.id.localeCompare(b.id);
    }
    return 0;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today, tomorrow, or yesterday
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // Format as "Apr 17 (Thu)"
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: undefined
      }) + ` (${date.toLocaleDateString('en-US', { weekday: 'short' })})`;
    }
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };
  
  // Show loading state
  if (isLoading) {
    return (
      <Box className="app-container" sx={{ display: 'flex' }}>
        <Box className="sidebar">
          <Sidebar />
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: '100%', 
          p: 3,
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Loading reminders...</Typography>
        </Box>
      </Box>
    );
  }
  
  // Show error state
  if (remindersError) {
    return (
      <Box className="app-container" sx={{ display: 'flex' }}>
        <Box className="sidebar">
          <Sidebar />
        </Box>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          width: '100%', 
          p: 3,
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh'
        }}>
          <ErrorIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h6" color="error" gutterBottom>
            Error loading reminders
          </Typography>
          <Typography color="textSecondary" gutterBottom>
            {JSON.stringify(remindersError)}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={() => refetchReminders()}
            startIcon={<CalendarIcon />}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="app-container" sx={{ display: 'flex' }}>
      <Box className="sidebar">
        <Sidebar />
      </Box>
      
      <Box sx={{ 
        flexGrow: 1, 
        p: { xs: 1, sm: 2, md: 3 }, 
        height: '100vh', 
        overflow: 'auto' 
      }}>
        <Paper elevation={0} sx={{ p: { xs: 1, sm: 2 }, mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2 
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                sx={{ mr: 1, display: { md: 'none' } }}
                onClick={toggleSidebar}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon sx={{ mr: 1 }} /> Reminders
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel id="filter-status-label">Show</InputLabel>
                  <Select
                    labelId="filter-status-label"
                    id="filter-status"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'pending' | 'completed' | 'all')}
                    label="Show"
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
                    <MenuItem value="all">All</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel id="sort-by-label">Sort by</InputLabel>
                  <Select
                    labelId="sort-by-label"
                    id="sort-by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'due-date' | 'priority' | 'created')}
                    label="Sort by"
                  >
                    <MenuItem value="due-date">Due Date</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                    <MenuItem value="created">Date Created</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={handleNewReminder}
              >
                New Reminder
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {sortedReminders.length === 0 ? (
          <Paper sx={{ py: 6, textAlign: 'center' }}>
            <CalendarIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary">
              No reminders found
            </Typography>
          </Paper>
        ) : (
          <List sx={{ bgcolor: 'background.paper' }} component={Paper}>
            {sortedReminders.map((reminder) => (
              <React.Fragment key={reminder.id}>
                <ListItem
                  sx={{
                    borderLeft: 3,
                    borderColor: `${reminder.status ? 'success.main' : getPriorityColor(reminder.priority)}.main`,
                    opacity: reminder.status ? 0.7 : 1,
                    textDecoration: reminder.status ? 'line-through' : 'none',
                  }}
                  secondaryAction={
                    <Box>
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditReminder(reminder.id);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReminder(reminder.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={reminder.status}
                      onChange={() => toggleReminderStatus(reminder.id)}
                      inputProps={{ 'aria-labelledby': reminder.id }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography 
                        variant="subtitle1" 
                        component="div"
                        sx={{ fontWeight: 500 }}
                      >
                        {reminder.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" component="span">
                          {formatDate(reminder.due_date)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                          <Chip 
                            size="small" 
                            color={getPriorityColor(reminder.priority) as any}
                            label={reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)} 
                          />
                          
                          {reminder.project_id && (
                            <Chip
                              size="small"
                              icon={<FolderIcon />}
                              label={projects.find(p => p.id === reminder.project_id)?.title || 'Project ' + reminder.project_id}
                              variant="outlined"
                            />
                          )}
                          
                          {reminder.employee_id && (
                            <Chip
                              size="small"
                              icon={<PersonIcon />}
                              label={employees.find(e => e.id === reminder.employee_id)?.name || 'Employee ' + reminder.employee_id}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={cancelDeleteReminder}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this reminder? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteReminder} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteReminder} 
            color="error" 
            variant="contained" 
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar
        open={notification.visible}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, visible: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, visible: false })} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Reminder Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingReminder ? 'Edit Reminder' : 'New Reminder'}
          <IconButton
            aria-label="close"
            onClick={() => setIsModalOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              fullWidth
              id="name"
              label="Reminder Name"
              name="name"
              value={newReminder.name}
              onChange={handleInputChange}
              required
            />
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <TextField
                  type="date"
                  label="Due Date"
                  name="dueDate"
                  value={newReminder.dueDate}
                  onChange={handleInputChange}
                  fullWidth
                  required
                  InputLabelProps={{ shrink: true }}
                />
                
                <TextField
                  type="time"
                  label="Due Time"
                  name="dueTime"
                  value={newReminder.dueTime}
                  onChange={handleInputChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </LocalizationProvider>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                name="priority"
                value={newReminder.priority}
                onChange={handleSelectChange}
                label="Priority"
              >
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="project-label">Project</InputLabel>
              <Select
                labelId="project-label"
                id="project_id"
                name="project_id"
                value={newReminder.project_id}
                onChange={handleSelectChange}
                label="Project"
              >
                <MenuItem value="">-- None --</MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.title || project.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="employee-label">Assignee</InputLabel>
              <Select
                labelId="employee-label"
                id="employee_id"
                name="employee_id"
                value={newReminder.employee_id}
                onChange={handleSelectChange}
                label="Assignee"
              >
                <MenuItem value="">-- None --</MenuItem>
                {employees.map(employee => (
                  <MenuItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {editingReminder && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={newReminder.status}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, status: e.target.checked }))}
                    name="status"
                  />
                }
                label="Mark as completed"
                sx={{ mt: 1 }}
              />
            )}
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={handleSubmit}
          >
            {editingReminder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reminders;
