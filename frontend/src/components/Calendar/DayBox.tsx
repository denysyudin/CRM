import React, { useMemo } from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import './styles.css';

export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

interface DayBoxProps {
  day: number;
  month: number;
  year: number;
  events?: Event[];
  isCurrentMonth: boolean;
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: Event) => void;
}

const DayBox: React.FC<DayBoxProps> = ({
  day,
  month,
  year,
  events = [],
  isCurrentMonth,
  onDayClick,
  onEventClick,
}) => {
  const date = useMemo(() => new Date(year, month, day), [day, month, year]);
  
  const dayEvents = useMemo(() => {
    return events.filter(event => isSameDay(event.start, date));
  }, [date, events]);

  const dayClasses = [
    'calendar-day-box',
    isToday(date) ? 'today' : '',
    !isCurrentMonth ? 'other-month' : '',
  ].filter(Boolean).join(' ');

  const handleDayClick = () => {
    if (onDayClick) {
      onDayClick(date);
    }
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEventClick) {
      onEventClick(event);
    }
  };

  return (
    <div className={dayClasses} onClick={handleDayClick}>
      <div className="day-number">{day}</div>
      <div className="day-events">
        {dayEvents.map((event) => (
          <div
            key={event.id}
            className="event-item"
            style={{ backgroundColor: event.color || '#4285f4' }}
            onClick={(e) => handleEventClick(event, e)}
          >
            <div className="event-title">{event.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DayBox; 