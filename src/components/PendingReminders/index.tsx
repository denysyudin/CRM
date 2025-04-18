import React from 'react';
import './styles.css';

interface Reminder {
  id: number;
  title: string;
  date: string;
  time: string;
  priority: 'High' | 'Medium' | 'Low';
}

const PendingReminders: React.FC = () => {
  const reminders: Reminder[] = [
    {
      id: 1,
      title: 'Follow up with Alex re: Vendor Call',
      date: 'Today',
      time: '4:00 PM',
      priority: 'High'
    },
    {
      id: 2,
      title: 'Call the box supplier',
      date: 'Tomorrow',
      time: '9:00 AM',
      priority: 'Medium'
    },
    {
      id: 3,
      title: 'Check inventory levels',
      date: 'Apr 17 (Thu)',
      time: '',
      priority: 'Medium'
    },
    {
      id: 4,
      title: 'Renew software subscription',
      date: 'Apr 18 (Fri)',
      time: '',
      priority: 'Low'
    }
  ];

  return (
    <div className="reminders-container">
      <h2>
        <span className="icon">🔔</span>
        Pending Reminders
      </h2>
      
      <div className="reminders-list">
        {reminders.map(reminder => (
          <div key={reminder.id} className="reminder-item">
            <div className="reminder-details">
              <div className="reminder-title">{reminder.title}</div>
              <div className="reminder-time">
                {reminder.date}{reminder.time ? `, ${reminder.time}` : ''}
              </div>
            </div>
            <div className={`priority-label ${reminder.priority.toLowerCase()}`}>
              {reminder.priority}
            </div>
          </div>
        ))}
      </div>
      
      <div className="reminders-footer">
        (Showing upcoming)
      </div>
    </div>
  );
};

export default PendingReminders; 