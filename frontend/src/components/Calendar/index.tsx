import React from 'react';
import './styles.css';

interface DayProps {
  day: number;
  isToday?: boolean;
}

const Day: React.FC<DayProps> = ({ day, isToday }) => {
  return (
    <div className={`calendar-day ${isToday ? 'today' : ''}`}>
      {day}
    </div>
  );
};

const Calendar: React.FC = () => {
  // Use current date instead of hardcoded values
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();
  
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  
  // Get days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Get the day of week of the first day of the month (0 = Sunday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust to make Monday the first day of the week (0 = Monday)
  const firstDayIndex = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
  
  // Create empty placeholders for days before the first day of the month
  const placeholders = Array(firstDayIndex).fill(null);

  return (
    <div className="calendar-container">
      <h2>Calendar</h2>
      
      <div className="calendar-header">
        <div className="month-year">
          {monthNames[currentMonth]} {currentYear}
        </div>
      </div>
      
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          <div>Mo</div>
          <div>Tu</div>
          <div>We</div>
          <div>Th</div>
          <div>Fr</div>
          <div>Sa</div>
          <div>Su</div>
        </div>
        
        <div className="calendar-days">
          {/* Add placeholder empty cells for days before the 1st of the month */}
          {placeholders.map((_, index) => (
            <div key={`placeholder-${index}`} className="calendar-day empty"></div>
          ))}
          
          {/* Render actual days of the month */}
          {days.map(day => (
            <Day key={day} day={day} isToday={day === currentDay} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar; 