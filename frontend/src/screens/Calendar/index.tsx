import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { Event } from '../../services/api';
import { fetchEvents, createEvent, updateEvent, deleteEvent, selectEventsStatus, selectEventsError } from '../../redux/features/eventsSlice';
import Sidebar from '../../components/Sidebar/Sidebar';
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
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
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

// Define a CalendarEvent that extends the API Event interface
interface CalendarEvent extends Event {
  time?: string;
}

// Define our form data structure to match Event API interface
interface EventFormData {
  id?: string;
  title: string;
  date: string;
  time?: string;
  hours?: string;
  minutes?: string;
  type: string;
  participants?: string;
  notes?: string;
  project_id?: string;
  employee_id?: string;
  description?: string;
}

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

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Redux
  const dispatch = useDispatch();
  const events = useSelector((state: RootState) => state.events?.items || []);
  const status = useSelector(selectEventsStatus);
  const error = useSelector(selectEventsError);

  // Local loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Fetch events on component mount
  useEffect(() => {
    dispatch(fetchEvents() as any);
  }, [dispatch]);

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
  const getEventsForDate = (dateString: string): CalendarEvent[] => {
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

  const openEditEventModal = (event: CalendarEvent) => {
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

      if (isEditing && eventFormData.id) {
        // Update existing event
        setIsUpdating(true);
        await dispatch(updateEvent({
          id: eventFormData.id,
          event: {
            title: eventFormData.title,
            due_date: timestamptz, // Send ISO timestamp with timezone
            type: eventFormData.type || 'other',
            participants: eventFormData.participants,
            notes: eventFormData.notes,
            project_id: eventFormData.project_id,
            employee_id: eventFormData.employee_id,
            description: eventFormData.description
          }
        }) as any);
        setIsUpdating(false);
      } else {
        // Add new event
        setIsCreating(true);
        await dispatch(createEvent({
          title: eventFormData.title,
          due_date: timestamptz, // Send ISO timestamp with timezone
          type: eventFormData.type || 'other',
          participants: eventFormData.participants,
          notes: eventFormData.notes,
          project_id: eventFormData.project_id,
          employee_id: eventFormData.employee_id,
          description: eventFormData.description
        }) as any);
        setIsCreating(false);
      }

      closeEventModal();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred');
      setIsCreating(false);
      setIsUpdating(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      setIsDeleting(true);
      await dispatch(deleteEvent(id) as any);
      setIsDeleting(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Error deleting event');
      setIsDeleting(false);
    }
  };

  // Event handlers
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
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
    if (status === 'loading' && events.length === 0) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" p={4}>
          <CircularProgress />
          <Typography variant="body1" sx={{ ml: 2 }}>
            Loading events...
          </Typography>
        </Box>
      );
    }

    // If there was an error, show error message
    if (status === 'failed' && error) {
      return (
        <Box p={4} textAlign="center">
          <Typography color="error" paragraph>
            Error: {error}
          </Typography>
          <Button
            variant="contained"
            onClick={() => dispatch(fetchEvents() as any)}
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
      const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      const dateStr = `${prevYear}-${(prevMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

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
                  label={`${event.time} ${event.title}`}
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
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

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
    <div className="app-container">
      <div className="sidebar">
        <Sidebar />
      </div>
      <div className="main-content sidebar-open">
        <Box sx={{ display: 'flex', height: '100vh' }}>
          <Box component="main" sx={{ flexGrow: 1, height: '100%', overflow: 'auto' }}>
            <Box
              sx={{
                p: 2,
                display: 'flex',
                alignItems: 'center',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              {isMobile && (
                <IconButton edge="start" onClick={toggleSidebar} sx={{ mr: 2 }}>
                  <Menu />
                </IconButton>
              )}
              <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
                <EventIcon sx={{ mr: 1 }} /> Calendar
              </Typography>
            </Box>

            <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
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
                        <Typography variant="body1">{selectedEvent.time || 'All Day'}</Typography>
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
                            label={selectedEvent.project_id}
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
                        handleDeleteEvent(selectedEvent.id);
                        closeModal();
                      }}
                    >
                      Delete
                    </Button>
                  </DialogActions>
                </>
              )}
            </Dialog>

            {/* Event create/edit modal */}
            <Dialog
              open={showEventModal}
              onClose={closeEventModal}
              maxWidth="sm"
              fullWidth
            >
              <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">
                    {isEditing ? 'Edit Event' : 'Add New Event'}
                  </Typography>
                  <IconButton onClick={closeEventModal} size="small">
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>

              <form onSubmit={handleEventFormSubmit}>
                <DialogContent dividers>
                  {formError && (
                    <Typography color="error" paragraph>
                      {formError}
                    </Typography>
                  )}

                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Event Name"
                        name="title"
                        value={eventFormData.title}
                        onChange={handleEventFormChange}
                        required
                        margin="normal"
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Date"
                        type="date"
                        name="date"
                        value={eventFormData.date}
                        onChange={handleEventFormChange}
                        required
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <FormControl sx={{ flex: 1 }}>
                          <InputLabel id="hours-label">Hours</InputLabel>
                          <Select
                            labelId="hours-label"
                            label="Hours"
                            name="hours"
                            value={eventFormData.hours || '00'}
                            onChange={handleSelectChange}
                          >
                            {[...Array(24)].map((_, i) => (
                              <MenuItem key={i} value={String(i).padStart(2, '0')}>
                                {String(i).padStart(2, '0')}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>

                        <Typography variant="h5">:</Typography>

                        <FormControl sx={{ flex: 1 }}>
                          <InputLabel id="minutes-label">Minutes</InputLabel>
                          <Select
                            labelId="minutes-label"
                            label="Minutes"
                            name="minutes"
                            value={eventFormData.minutes || '00'}
                            onChange={handleSelectChange}
                          >
                            {[...Array(60)].map((_, i) => (
                              <MenuItem key={i} value={String(i).padStart(2, '0')}>
                                {String(i).padStart(2, '0')}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControl fullWidth margin="normal">
                        <InputLabel id="event-type-label">Type</InputLabel>
                        <Select
                          labelId="event-type-label"
                          label="Type"
                          name="type"
                          value={eventFormData.type}
                          onChange={handleSelectChange}
                        >
                          <MenuItem value="meeting">Meeting</MenuItem>
                          <MenuItem value="deadline">Deadline</MenuItem>
                          <MenuItem value="appointment">Appointment</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Participants (Optional)"
                        name="participants"
                        value={eventFormData.participants || ''}
                        onChange={handleEventFormChange}
                        placeholder="Comma-separated list of participants"
                        margin="normal"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Project (Optional)"
                        name="project_id"
                        value={eventFormData.project_id || ''}
                        onChange={handleEventFormChange}
                        margin="normal"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Notes (Optional)"
                        name="description"
                        value={eventFormData.description || ''}
                        onChange={handleEventFormChange}
                        multiline
                        rows={4}
                        margin="normal"
                      />
                    </Grid>
                  </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2 }}>
                  <Button onClick={closeEventModal}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isCreating || isUpdating}
                  >
                    {isEditing ?
                      (isUpdating ? 'Updating...' : 'Update Event') :
                      (isCreating ? 'Creating...' : 'Create Event')}
                  </Button>

                  {isEditing && eventFormData.id && (
                    <Button
                      color="error"
                      startIcon={<DeleteOutline />}
                      disabled={isDeleting}
                      onClick={() => {
                        handleDeleteEvent(eventFormData.id!);
                        closeEventModal();
                      }}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  )}
                </DialogActions>
              </form>
            </Dialog>
          </Box>
        </Box>
      </div>
    </div>
  );
};

export default Calendar;