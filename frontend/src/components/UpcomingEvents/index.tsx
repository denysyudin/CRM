import React, { useEffect, useState } from 'react';
import './styles.css';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  type: 'Meeting' | 'Deadline';
}

const UpcomingEvents: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/events');
        const data: Event[] = await response.json();
        const upcomingEvents = data.slice(0, 5).map((todo: Event) => ({
          id: todo.id,
          title: todo.title,
          date: todo.date,
          time: todo.time,
          type: todo.type,
        }));
        setEvents(upcomingEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
  }, []);

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