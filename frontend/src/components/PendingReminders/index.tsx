import React, { useEffect, useState } from 'react';
import './styles.css';

interface Reminder {
  id: number;
  title: string;
  date: string;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
}

const PendingReminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/reminders');
        const data: Reminder[] = await response.json();
        const upcomingReminders = data.slice(0, 5).map((reminder: Reminder) => ({
          ...reminder,
          date: reminder.date.split('T')[0],
          time: reminder.date.split('T')[1].slice(0, 5)
        }));
        setReminders(upcomingReminders);
      } catch (error) {
        console.error('Error fetching reminders:', error);
      }
    };
    fetchReminders();
  }, []);

  return (
    <div className="pending-reminders-container">
      <h2>
        <span className="icon">🔔</span>
        Pending Reminders
      </h2>
      
      <div className="pending-reminders-list">
        {reminders.map(reminder => (
          <div key={reminder.id} className="pending-reminder-item">
            <div className="pending-reminder-details">
              <div className="pending-reminder-title">{reminder.title}</div>
              <div className="pending-reminder-time">
                {reminder.date}{reminder.time ? `, ${reminder.time}` : ''}
              </div>
            </div>
            <div className={`pending-priority-label ${reminder.priority.toLowerCase()}`}>
              {reminder.priority}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PendingReminders; 