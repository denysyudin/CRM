import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchEvents, createEvent, updateEvent, deleteEvent } from '../../redux/features/eventsSlice';
import { Event } from '../../services/api';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useMediaQuery } from '@mui/material';
import './styles.css';

// Define a CalendarEvent that extends the API Event interface
interface CalendarEvent extends Event {
  time?: string;
}

// Define our form data structure
interface EventFormData {
  id?: string;
  name: string;
  date: string;
  type: string;
  participants?: string;
  notes?: string;
  projectId?: string;
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
    name: '',
    date: new Date().toISOString().split('T')[0],
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
  
  // Fetch events on component mount
  useEffect(() => {
    dispatch(fetchEvents());
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
      const eventDate = new Date(event.date);
      const formattedDate = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      return formattedDate === dateString;
    }).map(event => ({
      ...event,
      time: 'All Day' // Default time if not specified
    }));
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
      name: '',
      date: date,
      type: 'meeting'
    });
    setShowEventModal(true);
  };

  const openEditEventModal = (event: CalendarEvent) => {
    setIsEditing(true);
    setEventFormData({
      id: event.id,
      name: event.name,
      date: event.date,
      type: event.type,
      participants: event.participants,
      notes: event.notes,
      projectId: event.projectId
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

  const handleEventFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing && eventFormData.id) {
      // Update existing event
      dispatch(updateEvent({
        id: eventFormData.id,
        event: {
          name: eventFormData.name,
          date: eventFormData.date,
          type: eventFormData.type,
          participants: eventFormData.participants,
          notes: eventFormData.notes,
          projectId: eventFormData.projectId
        }
      }));
    } else {
      // Add new event
      dispatch(createEvent({
        name: eventFormData.name,
        date: eventFormData.date,
        type: eventFormData.type,
        participants: eventFormData.participants,
        notes: eventFormData.notes,
        projectId: eventFormData.projectId
      }));
    }
    
    closeEventModal();
  };

  const handleDeleteEvent = () => {
    if (eventFormData.id) {
      dispatch(deleteEvent(eventFormData.id));
      closeEventModal();
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
                  {event.name}
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
          <div className="cal-page-modal-overlay" onClick={closeModal}>
            <div className="cal-page-modal-content" onClick={e => e.stopPropagation()}>
              <button className="cal-page-modal-close" onClick={closeModal}>&times;</button>
              <div className="cal-page-modal-details">
                <h3>{selectedEvent.name}</h3>
                <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
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
                {selectedEvent.projectId && (
                  <p>
                    <strong>Project:</strong> 
                    <span className="cal-page-detail-tag">{selectedEvent.projectId}</span>
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
                      dispatch(deleteEvent(selectedEvent.id));
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
              
              <form onSubmit={handleEventFormSubmit}>
                <div className="cal-page-form-group">
                  <label htmlFor="name">Event Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={eventFormData.name}
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
                    id="projectId"
                    name="projectId"
                    value={eventFormData.projectId || ''}
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
                  <button type="button" className="cal-page-btn cal-page-btn-secondary" onClick={closeEventModal}>
                    Cancel
                  </button>
                  <button type="submit" className="cal-page-btn cal-page-btn-save">
                    {isEditing ? 'Update' : 'Create'}
                  </button>
                  
                  {isEditing && (
                    <button
                      type="button"
                      className="cal-page-btn cal-page-btn-delete"
                      onClick={handleDeleteEvent}
                    >
                      Delete
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

export default EventCalendar; 