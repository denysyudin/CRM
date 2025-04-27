import React, { useState, useMemo } from 'react';
import { 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval,
  getMonth,
  getYear,
  getDate,
  format
} from 'date-fns';
import DayBox, { Event } from './DayBox';
import './styles.css';

interface CalendarProps {
  events?: Event[];
  onDayClick?: (date: Date) => void;
  onEventClick?: (event: Event) => void;
}

const Calendar: React.FC<CalendarProps> = ({ 
  events = [], 
  onDayClick, 
  onEventClick 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const calendarDays = useMemo(() => {
    // Get the start and end dates of the current month
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Get the start and end dates of the calendar (including days from adjacent months)
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    // Generate array of all days to display
    return eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd
    });
  }, [currentDate]);

  const weekdays = useMemo(() => {
    const weekStart = startOfWeek(new Date());
    return eachDayOfInterval({
      start: weekStart,
      end: endOfWeek(weekStart)
    }).map(day => format(day, 'EEE'));
  }, []);

  const currentMonth = getMonth(currentDate);
  const currentYear = getYear(currentDate);

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const prevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>&lt;</button>
        <h2>{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={nextMonth}>&gt;</button>
      </div>
      
      <div className="calendar-weekdays">
        {weekdays.map((day, index) => (
          <div key={index} className="calendar-weekday">{day}</div>
        ))}
      </div>
      
      <div className="calendar-days">
        {calendarDays.map((day) => {
          const dayNum = getDate(day);
          const monthNum = getMonth(day);
          const yearNum = getYear(day);
          
          return (
            <DayBox
              key={`${yearNum}-${monthNum}-${dayNum}`}
              day={dayNum}
              month={monthNum}
              year={yearNum}
              events={events}
              isCurrentMonth={monthNum === currentMonth}
              onDayClick={onDayClick}
              onEventClick={onEventClick}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Calendar; 