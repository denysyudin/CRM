import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { Reminder } from '../../redux/features/remindersSlice';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useMediaQuery } from '@mui/material';
import './styles.css';

interface CalendarEvent extends Reminder {
  time?: string;
  type?: string;
  project?: string;
  notes?: string;
}

const Calendar: React.FC = () => {
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Calendar state
  const initialDate = new Date();
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  // Get reminders from Redux store
  const reminders = useSelector((state: RootState) => state.reminders.items);

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

  // Format reminders as calendar events
  const getEventsForDate = (dateString: string): CalendarEvent[] => {
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.dueDate);
      const formattedDate = `${reminderDate.getFullYear()}-${String(reminderDate.getMonth() + 1).padStart(2, '0')}-${String(reminderDate.getDate()).padStart(2, '0')}`;
      return formattedDate === dateString;
    }).map(reminder => ({
      ...reminder,
      time: 'All Day', // Default time if not specified
      type: reminder.priority.toLowerCase() === 'high' ? 'deadline' : 'meeting'
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
  
  // Event handlers
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowModal(true);
  };
  
  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
  };
  
  // Create calendar grid
  const generateCalendar = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                       "July", "August", "September", "October", "November", "December"];
    
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const startingDay = (firstDayOfMonth.getDay() === 0) ? 6 : firstDayOfMonth.getDay() - 1; // 0=Mon, 6=Sun
    
    const today = new Date();
    const todayDate = today.getDate();
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    
    let rows = [];
    let day = 1;
    
    // Create rows for the calendar
    for (let i = 0; i < 6; i++) {
      // Break if we've already displayed all days
      if (day > daysInMonth) break;
      
      let cells = [];
      
      for (let j = 0; j < 7; j++) {
        let cellContent;
        let cellClass = '';
        
        if ((i === 0 && j < startingDay) || day > daysInMonth) {
          // Empty cell
          cellContent = <div className="empty-day"></div>;
          cellClass = 'empty';
        } else {
          // Valid day cell
          const currentDay = day;
          const isToday = currentDay === todayDate && currentMonth === todayMonth && currentYear === todayYear;
          
          // Format date for event lookup
          const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
          const dayEvents = getEventsForDate(dateString);
          
          cellClass = isToday ? 'today' : '';
          
          cellContent = (
            <div className="day-cell">
              <div className="day-number">{currentDay}</div>
              <div className="events-container">
                {dayEvents.map((event, idx) => (
                  <div 
                    key={`${event.id}-${idx}`}
                    className={`event event-${event.type}`}
                    onClick={() => handleEventClick(event)}
                  >
                    {event.name}
                  </div>
                ))}
              </div>
            </div>
          );
          
          day++;
        }
        
        cells.push(
          <td key={`cell-${i}-${j}`} className={cellClass}>
            {cellContent}
          </td>
        );
      }
      
      rows.push(<tr key={`row-${i}`}>{cells}</tr>);
    }
    
    return (
      <div className="calendar-widget">
        <div className="calendar-header">
          <h2 className="calendar-title">{monthNames[currentMonth]} {currentYear}</h2>
          <div className="calendar-controls">
            <button onClick={handlePrevMonth}>&lt; Prev</button>
            <button onClick={handleToday}>Today</button>
            <button onClick={handleNextMonth}>Next &gt;</button>
          </div>
        </div>
        
        <table className="calendar-table">
          <thead>
            <tr>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th>Sat</th>
              <th>Sun</th>
            </tr>
          </thead>
          <tbody>
            {rows}
          </tbody>
        </table>
      </div>
    );
  };
  
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <div className="dashboard-header-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={toggleSidebar} 
              className="sidebar-toggle"
            >
              ☰
            </button>
            <h1 className="dashboard-title">Calendar</h1>
          </div>
        </div>

        {generateCalendar()}
        
        {/* Event details modal */}
        {showModal && selectedEvent && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>&times;</button>
              <div className="modal-details">
                <h3>{selectedEvent.name}</h3>
                <p><strong>Time:</strong> {selectedEvent.time || 'All Day'}</p>
                <p>
                  <strong>Priority:</strong> 
                  <span className={`list-item-tag event-${selectedEvent.type}`}>
                    {selectedEvent.priority}
                  </span>
                </p>
                {selectedEvent.project && (
                  <p>
                    <strong>Project:</strong> 
                    <span className="detail-tag">{selectedEvent.project}</span>
                  </p>
                )}
                {selectedEvent.notes && (
                  <p><strong>Notes:</strong> {selectedEvent.notes}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Calendar; 