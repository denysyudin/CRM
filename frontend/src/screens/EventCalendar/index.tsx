import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import { Events } from '../../types/event.types';
import Sidebar from '../../components/Sidebar/Sidebar';
import { 
  useGetEventsQuery, 
  useCreateEventMutation, 
  useUpdateEventMutation, 
  useDeleteEventMutation 
} from '../../redux/api/eventsApi';
import { CircularProgress } from '@mui/material';
import './styles.css';
import EventModal from '../../components/forms/EventModal';

// Define our form data structure
interface EventFormData {
  id?: string;
  title: string;
  due_date: string;
  type: string;
  participants?: string;
  notes?: string;
  project_id?: string;
}

const EventCalendar: React.FC = () => {
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
    due_date: new Date().toISOString(),
    type: 'meeting'
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Modal state
  const [selectedEvent, setSelectedEvent] = useState<Events | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [projectName, setProjectName] = useState<string>('');
  
  // RTK Query hooks
  const { data: events = [], isLoading, isError, error } = useGetEventsQuery();
  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();
  const [deleteEvent] = useDeleteEventMutation();
  const [showModal, setShowModal] = useState(false);
  
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
      const eventDate = new Date(event.due_date);
      const formattedDate = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return formattedDate === dateString;
    }).map(event => {
      const eventTime = new Date(event.due_date);
      const formattedTime = eventTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      
      return {
        ...event,
        time: formattedTime // Add formatted time
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
    
    // Create a date object with the selected date and current time
    const selectedDate = new Date(date);
    const now = new Date();
    
    // Ensure valid date before setting hours/minutes
    if (!isNaN(selectedDate.getTime())) {
      // Set hours and minutes from current time
      selectedDate.setHours(now.getHours());
      selectedDate.setMinutes(now.getMinutes());
      
      // Convert to ISO string for the form
      const isoDate = selectedDate.toISOString();
      
      setEventFormData({
        title: '',
        due_date: isoDate,
        type: 'meeting'
      });
    } else {
      console.error("Invalid date format:", date);
      // Fallback to current date/time
      setEventFormData({
        title: '',
        due_date: now.toISOString(),
        type: 'meeting'
      });
    }
    
    setShowEventModal(true);
  };

  const openEditEventModal = (event: Events) => {
    setIsEditing(true);
    setEventFormData({
      id: event.id,
      title: event.title,
      due_date: event.due_date,
      type: event.type,
      participants: event.participants,
      notes: event.notes,
      project_id: event.project_id
    });
    setShowEventModal(true);
  };

  const closeEventModal = () => {
    setShowEventModal(false);
  };

  // This function matches the type expected by EventModal
  const handleEventSubmit = async (eventData: Omit<Events, "id">) => {
    try {
      if (isEditing && eventFormData.id) {
        // Update existing event
        await updateEvent({
          id: eventFormData.id,
          ...eventData
        }).unwrap();
        console.log(`Event "${eventData.title}" was updated successfully`);
      } else {
        // Add new event
        await createEvent({
          id: '',
          ...eventData
        }).unwrap();
        console.log(`Event "${eventData.title}" was created successfully`);
      }
      closeEventModal();
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  };

  const handleDeleteEvent = async (eventId?: string) => {
    if (selectedEvent && selectedEvent.id) {
      try {
        await deleteEvent({ 
          id: selectedEvent.id, 
          title: selectedEvent.title, 
          due_date: selectedEvent.due_date, 
          type: selectedEvent.type 
        }).unwrap();
        console.log(`Event "${selectedEvent.title}" was deleted successfully`);
        closeModal();
      } catch (err) {
        console.error('Failed to delete event:', err);
      }
    } else if (eventId) {
      try {
        const eventToDelete = events.find(e => e.id === eventId);
        if (eventToDelete) {
          await deleteEvent({ 
            id: eventToDelete.id, 
            title: eventToDelete.title, 
            due_date: eventToDelete.due_date, 
            type: eventToDelete.type 
          }).unwrap();
          console.log(`Event "${eventToDelete.title}" was deleted successfully`);
        }
        closeEventModal();
      } catch (err) {
        console.error('Failed to delete event:', err);
      }
    }
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

  // Loading state
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="dashboard-main-content loading-container">
          <CircularProgress />
          <p>Loading calendar...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="dashboard-container">
        <div className="sidebar">
          <Sidebar />
        </div>
        <div className="dashboard-main-content error-container">
          <p>Error loading events: {(error as any)?.data?.message || 'Unknown error'}</p>
        </div>
      </div>
    );
  }

  // Handle day click
  const handleDayClick = (date: string) => {
    openAddEventModal(date);
  };
  
  // Create calendar grid
  const renderCalendar = () => {
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
              {dayEvents.map((event: any, index) => (
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
            <h1 className="dashboard-title">🗓️ Event Calendar</h1>
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
          <div 
            className="cal-page-modal-overlay" 
            onClick={closeModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-details-title"
          >
            <div 
              className="cal-page-modal-content" 
              onClick={e => e.stopPropagation()}
              tabIndex={-1} // Make container focusable but not in tab order
            >
              <button 
                className="cal-page-modal-close" 
                onClick={closeModal}
                aria-label="Close modal"
              >
                &times;
              </button>
              <div className="cal-page-modal-details">
                <h3 id="event-details-title">{selectedEvent.title}</h3>
                <p><strong>Date:</strong> {
                  new Date(selectedEvent.due_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                }</p>
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
                {selectedEvent.notes && (
                  <p><strong>Notes:</strong> {selectedEvent.notes}</p>
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
                      handleDeleteEvent(selectedEvent?.id);
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
          <div className="event-modal-wrapper">
            <EventModal
              projectName={projectName}
              onClose={closeEventModal}
              onSubmit={handleEventSubmit}
              event={isEditing && eventFormData.id ? 
                {
                  id: eventFormData.id,
                  title: eventFormData.title,
                  due_date: eventFormData.due_date,
                  type: eventFormData.type,
                  participants: eventFormData.participants,
                  notes: eventFormData.notes,
                  project_id: eventFormData.project_id
                } : undefined
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCalendar; 