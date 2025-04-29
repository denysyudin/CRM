import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { Event } from '../../services/api';
import { fetchEvents, createEvent, updateEvent, deleteEvent, selectEventsStatus, selectEventsError } from '../../redux/features/eventsSlice';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useMediaQuery } from '@mui/material';
import './styles.css';

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
}

const Calendar: React.FC = () => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width:768px)');
  
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
    // console.log(`Looking for events on ${dateString}, total events: ${events.length}`);
    
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
        
        // Log matching events for debugging
        // if (formattedDate === dateString) {
        //   console.log('Found event on', dateString, event);
        // }
        
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
      employee_id: event.employee_id
    });
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
  };

  const handleEventFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
            employee_id: eventFormData.employee_id
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
          employee_id: eventFormData.employee_id
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
  
  // Create calendar grid
  const renderCalendar = () => {
    // If loading events, show loading indicator
    if (status === 'loading' && events.length === 0) {
      return (
        <div className="cal-page-loading">
          <p>Loading events...</p>
        </div>
      );
    }
    
    // If there was an error, show error message
    if (status === 'failed' && error) {
      return (
        <div className="cal-page-error">
          <p>Error: {error}</p>
          <button onClick={() => dispatch(fetchEvents() as any)}>Retry</button>
        </div>
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
        <td 
          key={`prev-${day}`} 
          className="cal-page-disabled-day"
        >
          <div className="cal-page-day-content">
            <div className="cal-page-day-number">{day}</div>
            <div className="cal-page-day-events"></div>
          </div>
        </td>
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
        <td 
          key={day}
          className={isToday ? 'today' : ''}
          onClick={() => handleDayClick(dateStr)}
        >
          <div className="cal-page-day-content">
            <div className="cal-page-day-number">{day}</div>
            <div className="cal-page-day-events">
              {dayEvents.map((event, index) => (
                <div 
                  key={index} 
                  className={`cal-page-event cal-page-event-${event.type}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEventClick(event, e);
                  }}
                >
                  <span className="cal-page-event-time">{event.time}</span> {event.title}
                </div>
              ))}
            </div>
          </div>
        </td>
      );
      
      if (cells.length === 7) {
        rows.push(<tr key={rows.length}>{cells}</tr>);
        cells = [];
      }
    });
    
    // Add next month days
    nextMonthDays.forEach(day => {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dateStr = `${nextYear}-${(nextMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      
      cells.push(
        <td 
          key={`next-${day}`} 
          className="cal-page-disabled-day"
        >
          <div className="cal-page-day-content">
            <div className="cal-page-day-number">{day}</div>
            <div className="cal-page-day-events"></div>
          </div>
        </td>
      );
      
      if (cells.length === 7) {
        rows.push(<tr key={rows.length}>{cells}</tr>);
        cells = [];
      }
    });
    
    // Add any remaining cells to the last row
    if (cells.length > 0) {
      while (cells.length < 7) {
        const nextDay = nextMonthDays[nextMonthDays.length - (7 - cells.length)] || 1;
        cells.push(
          <td 
            key={`next-extra-${nextDay}`} 
            className="cal-page-disabled-day"
          >
            <div className="cal-page-day-content">
              <div className="cal-page-day-number">{nextDay}</div>
              <div className="cal-page-day-events"></div>
            </div>
          </td>
        );
      }
      rows.push(<tr key={rows.length}>{cells}</tr>);
    }
    
    return (
      <table className="cal-page-table">
        <thead>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tue</th>
            <th>Wed</th>
            <th>Thu</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    );
  };
  
  const monthNames = ["January", "February", "March", "April", "May", "June",
                     "July", "August", "September", "October", "November", "December"];
  
  return (
    <div className="cal-page-layout">
      <div className="sidebar">
        <Sidebar />
      </div>
      
      <div className="main-content">
        <div className="dashboard-header-bar">
          <div className="cal-page-header-left">
            <button 
              onClick={toggleSidebar} 
              className="cal-page-sidebar-toggle"
            >
              ☰
            </button>
            <h1 className="dashboard-title">🗓️ Calendar</h1>
          </div>
        </div>

        <div className="cal-page-container">
          <div className="cal-page-header">
            <div className="cal-page-header-content">
              <h2 className="cal-page-month-year">{monthNames[currentMonth]} {currentYear}</h2>
              <div className="cal-page-controls">
                <button onClick={handlePrevMonth}>&lt; Prev</button>
                <button onClick={handleToday}>Today</button>
                <button onClick={handleNextMonth}>Next &gt;</button>
              </div>
            </div>
          </div>

          <div className="cal-page-widget">
            {renderCalendar()}
          </div>
        </div>
        
        {/* Event details modal */}
        {showModal && selectedEvent && (
          <div className="cal-page-modal-overlay" onClick={closeModal}>
            <div className="cal-page-modal-content" onClick={e => e.stopPropagation()}>
              <button className="cal-page-modal-close" onClick={closeModal}>&times;</button>
              <div className="cal-page-modal-details">
                <h3>{selectedEvent.title}</h3>
                <p><strong>Date:</strong> {new Date(selectedEvent.due_date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {selectedEvent.time || 'All Day'}</p>
                <p>
                  <strong>Type:</strong> 
                  <span className={`cal-page-list-item-tag cal-page-event-${selectedEvent.type}`}>
                    {selectedEvent.type}
                  </span>
                </p>
                {selectedEvent.participants && (
                  <p><strong>Participants:</strong> {selectedEvent.participants}</p>
                )}
                {selectedEvent.project_id && (
                  <p>
                    <strong>Project:</strong> 
                    <span className="cal-page-detail-tag">{selectedEvent.project_id}</span>
                  </p>
                )}
                {selectedEvent.description && (
                  <p><strong>Notes:</strong> {selectedEvent.description}</p>
                )}
                <div className="cal-page-modal-actions">
                  <button 
                    className="cal-page-btn cal-page-btn-edit"
                    onClick={() => {
                      closeModal();
                      openEditEventModal(selectedEvent);
                    }}
                  >
                    Edit
                  </button>
                  <button 
                    className="cal-page-btn cal-page-btn-delete"
                    onClick={() => {
                      handleDeleteEvent(selectedEvent.id);
                      closeModal();
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Event create/edit modal */}
        {showEventModal && (
          <div className="cal-page-modal-overlay" onClick={closeEventModal}>
            <div className="cal-page-modal-content cal-page-form-modal" onClick={e => e.stopPropagation()}>
              <button className="cal-page-modal-close" onClick={closeEventModal}>&times;</button>
              <h3>{isEditing ? 'Edit Event' : 'Add New Event'}</h3>
              
              {formError && (
                <div className="cal-page-form-error">
                  <p>{formError}</p>
                </div>
              )}
              
              <form onSubmit={handleEventFormSubmit}>
                <div className="cal-page-form-group">
                  <label htmlFor="name">Event Name</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={eventFormData.title}
                    onChange={handleEventFormChange}
                    required
                  />
                </div>
                
                <div className="cal-page-form-group">
                  <label htmlFor="date">Date</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={eventFormData.date}
                    onChange={handleEventFormChange}
                    required
                  />
                </div>
                
                <div className="cal-page-form-group">
                  <label htmlFor="time">Time</label>
                  <div className="cal-page-time-inputs">
                    <select
                      id="hours"
                      name="hours"
                      value={eventFormData.hours || '00'}
                      onChange={handleEventFormChange}
                    >
                      {[...Array(24)].map((_, i) => (
                        <option key={i} value={String(i).padStart(2, '0')}>
                          {String(i).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    <span className="cal-page-time-separator">:</span>
                    <select
                      id="minutes"
                      name="minutes"
                      value={eventFormData.minutes || '00'}
                      onChange={handleEventFormChange}
                    >
                      {[...Array(60)].map((_, i) => (
                        <option key={i} value={String(i).padStart(2, '0')}>
                          {String(i).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="cal-page-form-group">
                  <label htmlFor="type">Type</label>
                  <select
                    id="type"
                    name="type"
                    value={eventFormData.type}
                    onChange={handleEventFormChange}
                  >
                    <option value="meeting">Meeting</option>
                    <option value="deadline">Deadline</option>
                    <option value="appointment">Appointment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="cal-page-form-group">
                  <label htmlFor="participants">Participants (Optional)</label>
                  <input
                    type="text"
                    id="participants"
                    name="participants"
                    value={eventFormData.participants || ''}
                    onChange={handleEventFormChange}
                    placeholder="Comma-separated list of participants"
                  />
                </div>
                
                <div className="cal-page-form-group">
                  <label htmlFor="projectId">Project (Optional)</label>
                  <input
                    type="text"
                    id="project_id"
                    name="project_id"
                    value={eventFormData.project_id || ''}
                    onChange={handleEventFormChange}
                  />
                </div>
                
                <div className="cal-page-form-group">
                  <label htmlFor="notes">Notes (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={eventFormData.notes || ''}
                    onChange={handleEventFormChange}
                    rows={4}
                  />
                </div>
                
                <div className="cal-page-form-actions">
                  <button type="button" className="form-button button-secondary" onClick={closeEventModal}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="form-button button-primary"
                    disabled={isCreating || isUpdating}
                  >
                    {isEditing ? 
                      (isUpdating ? 'Updating...' : 'Update Event') : 
                      (isCreating ? 'Creating...' : 'Create Event')}
                  </button>
                  
                  {isEditing && (
                    <button
                      type="button"
                      className="cal-page-btn cal-page-btn-delete"
                      disabled={isDeleting}
                      onClick={() => {
                        if (eventFormData.id) {
                          handleDeleteEvent(eventFormData.id);
                          closeEventModal();
                        }
                      }}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar; 