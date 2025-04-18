import React from 'react';
import './styles.css';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'Meeting' | 'Deadline';
}

const UpcomingEvents: React.FC = () => {
  const events: Event[] = [
    { 
      id: 1, 
      title: 'Meeting with Designer', 
      date: 'Today', 
      time: '2:00 PM', 
      type: 'Meeting' 
    },
    { 
      id: 2, 
      title: 'Supplier Call - Boxes', 
      date: 'Tomorrow', 
      time: '10:00 AM', 
      type: 'Meeting' 
    },
    { 
      id: 3, 
      title: 'Project Phoenix Deadline', 
      date: 'Apr 18 (Fri)', 
      time: '', 
      type: 'Deadline' 
    },
    { 
      id: 4, 
      title: 'Marketing Sync', 
      date: 'Apr 21 (Mon)', 
      time: '11:30 AM', 
      type: 'Meeting' 
    },
    { 
      id: 5, 
      title: 'Pay Quarterly Taxes', 
      date: 'Apr 22 (Tue)', 
      time: '', 
      type: 'Deadline' 
    }
  ];

  return (
    <div className="events-container">
      <h2>
        <span className="icon">📅</span>
        Upcoming Events
      </h2>
      
      <div className="events-list">
        {events.map(event => (
          <div key={event.id} className="event-item">
            <div className="event-details">
              <div className="event-title">{event.title}</div>
              <div className="event-time">{event.date}{event.time ? `, ${event.time}` : ''}</div>
            </div>
            <div className={`event-tag ${event.type.toLowerCase()}`}>
              {event.type}
            </div>
          </div>
        ))}
      </div>
      
      <div className="events-footer">
        (Showing upcoming)
      </div>
    </div>
  );
};

export default UpcomingEvents; 