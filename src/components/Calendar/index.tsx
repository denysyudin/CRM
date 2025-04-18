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
  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonth = 3; // April (0-indexed)
  const currentYear = 2025;
  const currentDay = 15; // Today is the 15th

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
          <Day day={1} />
          <Day day={2} />
          <Day day={3} />
          <Day day={4} />
          <Day day={5} />
          <Day day={6} />
          <Day day={7} />
          <Day day={8} />
          <Day day={9} />
          <Day day={10} />
          <Day day={11} />
          <Day day={12} />
          <Day day={13} />
          <Day day={14} />
          <Day day={15} isToday={true} />
          <Day day={16} />
          <Day day={17} />
          <Day day={18} />
          <Day day={19} />
          <Day day={20} />
          <Day day={21} />
          <Day day={22} />
          <Day day={23} />
          <Day day={24} />
          <Day day={25} />
          <Day day={26} />
          <Day day={27} />
          <Day day={28} />
          <Day day={29} />
          <Day day={30} />
        </div>
      </div>
    </div>
  );
};

export default Calendar; 