import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Grid, Checkbox,
  FormControl, InputLabel, MenuItem, Select,
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Chip, ListItem, List, ListItemText,
  ListItemIcon, Snackbar, Alert, CircularProgress,
  SelectChangeEvent, Container
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CalendarToday as CalendarIcon,
  Error as ErrorIcon,
  Folder as FolderIcon,
  Person as PersonIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { ReminderModal } from '../../components/forms';
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
  
  const [createReminder, { isLoading: isCreating }] = useCreateReminderMutation();
  const [updateReminder, { isLoading: isUpdating }] = useUpdateReminderMutation();
  const [deleteReminder, { isLoading: isDeleting }] = useDeleteReminderMutation();
  
  // Combined loading state for operations
  const isOperationLoading = isCreating || isUpdating || isDeleting;
  
  // Local state for UI display
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // UI state
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
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
  const [newReminder, setNewReminder] = useState<Reminder>({
    id: '',
    title: '',
    due_date: '',
    priority: 'medium',
    project_id: '',
    employee_id: '',
    status: false,
    description: ''
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
      description: reminder.description || '',
      isUpdatingStatus: false,
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
    // const newReminder = {
    //   ...reminder,
    //   status: !reminder?.status
    // };
    if (reminder) {
      const status = !reminder.status;
      try {
        // Add optimistic update
        setReminders(prevReminders => 
          prevReminders.map(reminder => 
            reminder.id === id 
              ? { ...reminder, status, isUpdatingStatus: true } 
              : reminder
          )
        );
        
        await updateReminder({
          id,
          title: reminder.title,
          due_date: reminder.due_date,
          priority: reminder.priority,
          status: status,
          project_id: reminder.project_id,
          employee_id: reminder.employee_id,
          description: reminder.description
        }).unwrap();
        
        // Update local state again after API call completes
        setReminders(prevReminders => 
          prevReminders.map(reminder => 
            reminder.id === id 
              ? { ...reminder, status, isUpdatingStatus: false } 
              : reminder
          )
        );
        
        showNotification(
          `Reminder marked as ${status ? 'completed' : 'pending'}`,
          'success'
        );
      } catch (error) {
        // Revert optimistic update on error
        setReminders(prevReminders => 
          prevReminders.map(r => 
            r.id === id 
              ? { ...r, status: reminder.status, isUpdatingStatus: false } 
              : r
          )
        );
        console.error('Failed to update reminder status:', error);
        showNotification('Failed to update reminder status', 'error');
      }
    }
  };

  // Handle new reminder button click
  const handleNewReminder = () => {
    // Get current date and time
    const now = new Date();
    
    setEditingReminder(null);
    setNewReminder({
      id: '',
      title: '',
      due_date: now.toISOString(), // Set initial date as current date in ISO format
      priority: 'medium',
      project_id: '',
      employee_id: '',
      status: false,
      description: ''
    });
    setIsModalOpen(true);
  };
  
  // Handle edit reminder
  const handleEditReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      // Parse date and time from due_date
      const dueDate = new Date(reminder.due_date);
      // const dateStr = dueDate.toISOString().split('T')[0];
      console.log('Reminders: Editing reminder', reminder);
      setNewReminder({
        id: reminder.id,
        title: reminder.title,
        due_date: dueDate.toISOString(),
        status: reminder.status,
        priority: reminder.priority as 'high' | 'medium' | 'low',
        project_id: reminder.project_id || '',
        employee_id: reminder.employee_id || '',
        description: reminder.description || ''
      });
      setEditingReminder(id);
      setIsModalOpen(true);
    }
  };
  
  // Handle input changes for the new reminder form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReminder((prev: Reminder) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewReminder((prev: Reminder) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (checked: boolean) => {
    setNewReminder((prev: Reminder) => ({
      ...prev,
      status: checked
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log('Reminders: Creating/updating reminder', newReminder);
    
    // Validate form
    if (!newReminder.title?.trim()) {
      showNotification('Please enter a title for the reminder', 'error');
      return;
    }
    
    if (!newReminder.due_date) {
      showNotification('Please select a due date for the reminder', 'error');
      return;
    }
    
    try {
      if (editingReminder) {
        // Update existing reminder
        await updateReminder({
          id: editingReminder,
          title: newReminder.title.trim(),
          due_date: newReminder.due_date,
          priority: newReminder.priority,
          project_id: newReminder.project_id || undefined,
          employee_id: newReminder.employee_id || undefined,
          status: newReminder.status,
          description: newReminder.description
        }).unwrap();
        
        showNotification('Reminder updated successfully', 'success');
      } else {
        // Create new reminder
        await createReminder({
          title: newReminder.title.trim(),
          due_date: newReminder.due_date,
          priority: newReminder.priority,
          status: false,
          project_id: newReminder.project_id || undefined,
          employee_id: newReminder.employee_id || undefined,
          description: newReminder.description
        }).unwrap();
        
        showNotification('Reminder created successfully', 'success');
      }
      
      // Close modal and reset form
      setIsModalOpen(false);
      setEditingReminder(null);
      setNewReminder({
        id: '',
        title: '',
        due_date: '',
        priority: 'medium',
        project_id: '',
        employee_id: '',
        status: false,
        description: ''
      });
    } catch (error) {
      console.error('Failed to save reminder:', error);
      showNotification(
        `Failed to ${editingReminder ? 'update' : 'create'} reminder`, 
        'error'
      );
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
        setDeleteDialogOpen(false);
        setReminderToDelete(null);
      } catch (error) {
        console.error('Failed to delete reminder:', error);
        showNotification('Failed to delete reminder', 'error');
      }
    }
  };

  // Cancel deletion
  const cancelDeleteReminder = () => {
    setDeleteDialogOpen(false);
    setReminderToDelete(null);
  };

  // Filter reminders
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
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ 
        flexGrow: 1, 
        height: '100vh', 
        overflow: 'auto' 
      }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex' }}>
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
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <FormControl size="small" variant="outlined" sx={{ minWidth: 120 }}>
                  <InputLabel id="filter-status-label">Show</InputLabel>
                  <Select
                    labelId="filter-status-label"
                    id="filter-status"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as 'pending' | 'completed' | 'all')}
                    label="Show"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="completed">Completed</MenuItem>
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
            <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
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
        </Box>

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
                        disabled={reminder.isUpdatingStatus || isOperationLoading}
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
                        disabled={reminder.isUpdatingStatus || isOperationLoading}
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
                      onChange={() => !reminder.isUpdatingStatus && toggleReminderStatus(reminder.id)}
                      inputProps={{ 'aria-labelledby': reminder.id }}
                      disabled={reminder.isUpdatingStatus}
                      icon={reminder.isUpdatingStatus ? <CircularProgress size={20} /> : undefined}
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
        onClose={!isDeleting ? cancelDeleteReminder : undefined}
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
          <Button 
            onClick={cancelDeleteReminder} 
            color="primary" 
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteReminder} 
            color="error" 
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar
        open={notification.visible}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, visible: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, visible: false })} 
          severity={notification.type} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      {/* Reminder modal */}
      <ReminderModal
        open={isModalOpen}
        onClose={() => !isOperationLoading && setIsModalOpen(false)}
        reminder={newReminder}
        isEditing={!!editingReminder}
        isLoading={isOperationLoading}
        projects={projects}
        employees={employees}
        onChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onStatusChange={handleStatusChange}
        onSubmit={handleSubmit}
      />
    </Container>

  );
};

export default Reminders;
