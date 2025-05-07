import React, { useState, useEffect } from 'react';
import { Events } from '../../types/event.types';
import { useCreateEventMutation, useUpdateEventMutation, useDeleteEventMutation, useGetEventsQuery } from '../../redux/api/eventsApi';
import { useGetProjectsQuery } from '../../redux/api/projectsApi';
import EventModal, { EventFormData } from '../../components/forms/EventModal';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  SelectChangeEvent,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Today,
  Close,
  Event as EventIcon,
  EditOutlined,
  DeleteOutline,
  Menu
} from '@mui/icons-material';
import './styles.css';
import { Project } from '../../types/project.types';

const Calendar: React.FC = () => {
  const theme = useTheme();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Calendar state
  const initialDate = new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());

  // Event form state
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventFormData, setEventFormData] = useState<EventFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    hours: '09',
    minutes: '00',
    type: 'meeting'
  });
  const [isEditing, setIsEditing] = useState(false);

  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Events | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // RTK Query hooks
  const { data: events = [], isLoading, error } = useGetEventsQuery();
  const [createEvent, { isLoading: isCreating }] = useCreateEventMutation();
  const [updateEvent, { isLoading: isUpdating }] = useUpdateEventMutation();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const { data: projects = [] } = useGetProjectsQuery();

  const [formError, setFormError] = useState<string | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error' | 'info'; open: boolean}>({
    message: '',
    type: 'info',
    open: false
  });

  // Handle sidebar toggle
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

  // Format events as calendar events
  const getEventsForDate = (dateString: string): Events[] => {
    return events.filter(event => {
      // Check if the event has a date property
      if (!event.due_date) {
        console.warn('Event without date:', event);
        return false;
      }

      try {
        // Parse the date string from timestamptz format
        const eventDate = new Date(event.due_date);

        // Check if date is valid
        if (isNaN(eventDate.getTime())) {
          console.warn('Invalid event date:', event.due_date, event);
          return false;
        }

        // Get local date components from the timestamptz
        const year = eventDate.getFullYear();
        const month = String(eventDate.getMonth() + 1).padStart(2, '0');
        const day = String(eventDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;

        return formattedDate === dateString;
      } catch (err) {
        console.error('Error processing event date:', err, event);
        return false;
      }
    }).map(event => {
      // Map event type to one of the predefined types that have CSS classes
      let mappedType = 'other';
      if (['meeting', 'deadline', 'appointment'].includes(event.type?.toLowerCase())) {
        mappedType = event.type.toLowerCase();
      }

      // Extract time from the timestamptz
      const eventDate = new Date(event.due_date);
      const hours = String(eventDate.getHours()).padStart(2, '0');
      const minutes = String(eventDate.getMinutes()).padStart(2, '0');

      // Only show time if not 00:00 (midnight)
      const timeString = (hours === '00' && minutes === '00') ? 'All Day' : `${hours}:${minutes}`;

      return {
        ...event,
        type: mappedType, // Map to one of our predefined types with CSS classes
        time: timeString // Format time properly
      };
    });
  };

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 0) {
        setCurrentYear(prevYear => prevYear - 1);
        return 11;
      }
      return prevMonth - 1;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      if (prevMonth === 11) {
        setCurrentYear(prevYear => prevYear + 1);
        return 0;
      }
      return prevMonth + 1;
    });
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  // CRUD operations for events
  const openAddEventModal = (date: string) => {
    setIsEditing(false);
    setSelectedDate(date);
    setEventFormData({
      title: '',
      date: date,
      hours: '09',
      minutes: '00',
      type: 'meeting'
    });
    setShowEventModal(true);
  };

  const openEditEventModal = (event: Events) => {
    setIsEditing(true);
    // Extract hours and minutes from the event due_date
    const eventDate = new Date(event.due_date);
    const hours = String(eventDate.getHours()).padStart(2, '0');
    const minutes = String(eventDate.getMinutes()).padStart(2, '0');

    setEventFormData({
      id: event.id,
      title: event.title,
      date: event.due_date.split('T')[0], // Just get the date part
      hours: hours,
      minutes: minutes,
      type: event.type,
      participants: event.participants,
      notes: event.notes,
      project_id: event.project_id,
      employee_id: event.employee_id,
      description: event.description
    });
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
  };

  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setEventFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;

    setEventFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEventFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      // Combine date and time for the due_date field
      const date = eventFormData.date;
      const hours = eventFormData.hours || '00';
      const minutes = eventFormData.minutes || '00';

      // Create a proper ISO timestamp with timezone information
      const dateObj = new Date(`${date}T${hours}:${minutes}:00`);
      const timestamptz = dateObj.toISOString();
      console.log("ISO timestamp with timezone:", timestamptz);

      const eventData = {
        title: eventFormData.title,
        due_date: timestamptz, // Send ISO timestamp with timezone
        type: eventFormData.type || 'other',
        participants: eventFormData.participants,
        notes: eventFormData.notes,
        project_id: eventFormData.project_id,
        employee_id: eventFormData.employee_id,
        description: eventFormData.description
      };

      if (isEditing && eventFormData.id) {
        // Update existing event
        await updateEvent({
          id: eventFormData.id,
          ...eventData
        }).unwrap();
        setNotification({
          message: 'Event updated successfully',
          type: 'success',
          open: true
        });
      } else {
        // Add new event
        await createEvent({
          ...eventData,
          id: '' 
        }).unwrap();
        setNotification({
          message: 'Event created successfully',
          type: 'success',
          open: true
        });
      }

      closeEventModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setFormError(errorMessage);
      setNotification({
        message: errorMessage,
        type: 'error',
        open: true
      });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent({ id: id } as Events).unwrap();
      setNotification({
        message: 'Event deleted successfully',
        type: 'success',
        open: true
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error deleting event';
      setFormError(errorMessage);
      setNotification({
        message: errorMessage,
        type: 'error',
        open: true
      });
    }
  };

  // Open delete confirmation dialog
  const openDeleteConfirmation = (id: string) => {
    setEventToDelete(id);
    setDeleteConfirmOpen(true);
  };

  // Close delete confirmation dialog
  const closeDeleteConfirmation = () => {
    setDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  // Confirm and delete event
  const confirmDelete = () => {
    if (eventToDelete) {
      handleDeleteEvent(eventToDelete);
      closeDeleteConfirmation();
      closeEventModal();
      closeModal();
    }
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Event handlers
  const handleEventClick = (event: Events, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering day click
    setSelectedEvent(event);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };

  // Handle day click
  const handleDayClick = (date: string) => {
    openAddEventModal(date);
  };

  // Get event chip color based on type
  const getEventColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'meeting':
        return 'primary';
      case 'deadline':
        return 'error';
      case 'appointment':
        return 'success';
      default:
        return 'default';
    }
  };

  // Create calendar grid
  const renderCalendar = () => {
    // If loading events, show loading indicator
    if (isLoading && events.length === 0) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
          <CircularProgress size={60} sx={{ mb: 2 }}/>
          <Typography variant="h6">Loading events...</Typography>
        </Box>
      );
    }

    // If there was an error, show error message
    if (error) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <Typography color="error" paragraph>
            Error: {typeof error === 'string' ? error : 'Failed to load events'}
          </Typography>
          <Button
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      );
    }

    const currentDate = new Date(currentYear, currentMonth, 1);
    const firstDayOfMonth = currentDate.getDay();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Get the last day of the previous month
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();

    // Calculate days from previous month to display
    const prevMonthDays = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      prevMonthDays.push(prevMonthLastDay - i);
    }

    // Calculate current month days
    const currentMonthDays = [];
    for (let day = 1; day <= lastDay; day++) {
      currentMonthDays.push(day);
    }

    // Calculate days from next month to display
    // We want to ensure we display enough days to have complete weeks
    const totalCells = Math.ceil((firstDayOfMonth + lastDay) / 7) * 7;
    const nextMonthDays = [];
    for (let i = 1; i <= totalCells - (prevMonthDays.length + currentMonthDays.length); i++) {
      nextMonthDays.push(i);
    }

    const rows: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    // Add previous month days
    prevMonthDays.forEach(day => {

      cells.push(
        <TableCell
          key={`prev-${day}`}
          sx={{
            opacity: 0.4,
            height: '120px',
            verticalAlign: 'top',
            padding: 1
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {day}
            </Typography>
          </Box>
        </TableCell>
      );
    });

    // Add current month days
    currentMonthDays.forEach(day => {
      const today = new Date();
      const isToday =
        currentYear === today.getFullYear() &&
        currentMonth === today.getMonth() &&
        day === today.getDate();

      const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      const dayEvents = getEventsForDate(dateStr);

      cells.push(
        <TableCell
          key={day}
          onClick={() => handleDayClick(dateStr)}
          sx={{
            height: '120px',
            backgroundColor: isToday ? 'rgba(25, 118, 210, 0.08)' : 'inherit',
            border: isToday ? `1px solid ${theme.palette.primary.main}` : undefined,
            verticalAlign: 'top',
            padding: 1,
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              cursor: 'pointer'
            }
          }}
        >
          <Box>
            <Typography
              variant="body2"
              fontWeight={isToday ? 'bold' : 'normal'}
              color={isToday ? 'primary' : 'text.primary'}
            >
              {day}
            </Typography>

            <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
              {dayEvents.map((event, index) => (
                <Chip
                  key={index}
                  size="small"
                  label={`${event.due_date.slice(11, 16)} ${event.title}`}
                  color={getEventColor(event.type) as any}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event, e);
                  }}
                  sx={{
                    height: 'auto',
                    '& .MuiChip-label': {
                      display: 'block',
                      whiteSpace: 'normal',
                      textAlign: 'left'
                    }
                  }}
                />
              ))}
            </Box>
          </Box>
        </TableCell>
      );

      if (cells.length === 7) {
        rows.push(<TableRow key={rows.length}>{cells}</TableRow>);
        cells = [];
      }
    });

    // Add next month days
    nextMonthDays.forEach(day => {
      cells.push(
        <TableCell
          key={`next-${day}`}
          sx={{
            opacity: 0.4,
            height: '120px',
            verticalAlign: 'top',
            padding: 1
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {day}
            </Typography>
          </Box>
        </TableCell>
      );

      if (cells.length === 7) {
        rows.push(<TableRow key={rows.length}>{cells}</TableRow>);
        cells = [];
      }
    });

    // Add any remaining cells to the last row
    if (cells.length > 0) {
      while (cells.length < 7) {
        const nextDay = nextMonthDays[nextMonthDays.length - (7 - cells.length)] || 1;
        cells.push(
          <TableCell
            key={`next-extra-${nextDay}`}
            sx={{
              opacity: 0.4,
              height: '120px',
              verticalAlign: 'top',
              padding: 1
            }}
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                {nextDay}
              </Typography>
            </Box>
          </TableCell>
        );
      }
      rows.push(<TableRow key={rows.length}>{cells}</TableRow>);
    }

    return (
      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">Sun</TableCell>
              <TableCell align="center">Mon</TableCell>
              <TableCell align="center">Tue</TableCell>
              <TableCell align="center">Wed</TableCell>
              <TableCell align="center">Thu</TableCell>
              <TableCell align="center">Fri</TableCell>
              <TableCell align="center">Sat</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </TableContainer>
    );
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
          <Box component="main" sx={{ flexGrow: 1, height: '100%', overflow: 'hidden' }}>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1 }} /> Calendar
              </Typography>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 3, mb: 4, height: 'calc(100vh - 60px)', overflow: 'auto' }}>
              <Paper sx={{ p: 2, mb: 3 }} elevation={1}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h5" component="h2">
                    {monthNames[currentMonth]} {currentYear}
                  </Typography>
                  <Box display="flex" gap={1}>
                    <Button
                      variant="outlined"
                      startIcon={<ArrowBack />}
                      onClick={handlePrevMonth}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Today />}
                      onClick={handleToday}
                    >
                      Today
                    </Button>
                    <Button
                      variant="outlined"
                      endIcon={<ArrowForward />}
                      onClick={handleNextMonth}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              </Paper>

              {renderCalendar()}
            </Container>

            {/* Event details modal */}
            <Dialog
              open={showModal}
              onClose={closeModal}
              maxWidth="sm"
              fullWidth
            >
              {selectedEvent && (
                <>
                  <DialogTitle>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">{selectedEvent.title}</Typography>
                      <IconButton onClick={closeModal} size="small">
                        <Close />
                      </IconButton>
                    </Box>
                  </DialogTitle>
                  <DialogContent dividers>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Date</Typography>
                        <Typography variant="body1">
                          {new Date(selectedEvent.due_date).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">Time</Typography>
                        <Typography variant="body1">{selectedEvent.due_date.slice(11, 16) || 'All Day'}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">Type</Typography>
                        <Chip
                          label={selectedEvent.type}
                          color={getEventColor(selectedEvent.type) as any}
                          size="small"
                        />
                      </Grid>

                      {selectedEvent.participants && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Participants</Typography>
                          <Typography variant="body1">{selectedEvent.participants}</Typography>
                        </Grid>
                      )}

                      {selectedEvent.project_id && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Project</Typography>
                          <Chip
                            label={projects.find((project: Project) => project.id === selectedEvent.project_id)?.title}
                            size="small"
                            variant="outlined"
                          />
                        </Grid>
                      )}

                      {selectedEvent.description && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="text.secondary">Notes</Typography>
                          <Typography variant="body1">{selectedEvent.description}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </DialogContent>
                  <DialogActions>
                    <Button
                      startIcon={<EditOutlined />}
                      onClick={() => {
                        closeModal();
                        openEditEventModal(selectedEvent);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      color="error"
                      startIcon={<DeleteOutline />}
                      onClick={() => {
                        openDeleteConfirmation(selectedEvent.id);
                      }}
                    >
                      Delete
                    </Button>
                  </DialogActions>
                </>
              )}
            </Dialog>

            {/* Event create/edit modal */}
            <EventModal
              open={showEventModal}
              onClose={closeEventModal}
              eventFormData={eventFormData}
              isEditing={isEditing}
              formError={formError}
              isCreating={isCreating}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              onFormChange={handleEventFormChange}
              onSelectChange={handleSelectChange}
              onSubmit={handleEventFormSubmit}
              onDelete={openDeleteConfirmation}
            />

            {/* Notification Snackbar */}
            <Snackbar
              open={notification.open}
              autoHideDuration={6000}
              onClose={handleNotificationClose}
              anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <Alert 
                onClose={handleNotificationClose} 
                severity={notification.type} 
                sx={{ width: '100%' }}
              >
                {notification.message}
              </Alert>
            </Snackbar>

            {/* Delete Confirmation Dialog */}
            <Dialog
              open={deleteConfirmOpen}
              onClose={closeDeleteConfirmation}
              aria-labelledby="delete-confirm-dialog-title"
            >
              <DialogTitle id="delete-confirm-dialog-title">
                Confirm Delete
              </DialogTitle>
              <DialogContent>
                <Typography>
                  Are you sure you want to delete this event? This action cannot be undone.
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={closeDeleteConfirmation}>Cancel</Button>
                <Button onClick={confirmDelete} color="error" variant="contained">
                  Delete
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Box>
    </Container>
  );
};

export default Calendar;