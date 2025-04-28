import React, { useState, useEffect } from 'react';
import { FiCalendar, FiAlertCircle, FiPlus, FiLink, FiTrash2, FiEdit, FiX, FiMenu, FiUser, FiFolder } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar/Sidebar';
import './styles.css';

// Reminder interface
interface Reminder {
  id: string;
  name: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed?: boolean;
  relatedTo?: {
    type: 'person' | 'project';
    name: string;
  };
}

const Reminders: React.FC = () => {
  // Mock data - in a real app this would come from an API
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // UI state
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [sortBy, setSortBy] = useState<'due-date' | 'priority' | 'created'>('due-date');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile screen on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Adjust sidebar visibility based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle reminder completed status
  const toggleReminderStatus = (id: string) => {
    setReminders(prevReminders => 
      prevReminders.map(reminder => 
        reminder.id === id 
          ? { ...reminder, completed: !reminder.completed } 
          : reminder
      )
    );
  };

  // Handle new reminder button click
  const handleNewReminder = () => {
    setIsModalOpen(true);
    // In a real app, you would show a form modal here
  };

  // Filter reminders based on status
  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !reminder.completed;
    if (filter === 'completed') return reminder.completed;
    return true;
  });

  // Sort reminders
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (sortBy === 'due-date') {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    } else { // 'created' - using ID as proxy for creation date in this example
      return a.id.localeCompare(b.id);
    }
    return 0;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Check if it's today, tomorrow, or yesterday
    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // Format as "Apr 17 (Thu)"
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: undefined
      }) + ` (${date.toLocaleDateString('en-US', { weekday: 'short' })})`;
    }
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <div className="reminders-container">
          <header className="reminders-header">
            <div className="header-left">
              <button
                className="sidebar-toggle"
                onClick={toggleSidebar}
              >
                <FiMenu />
              </button>
              <h1 className="reminders-title">
                <FiCalendar className="icon" /> Reminders
              </h1>
            </div>
          </header>

          <div className="reminders-controls">
            <div className="filter-controls">
              <label htmlFor="filter-status">Show:</label>
              <select
                id="filter-status"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'pending' | 'completed' | 'all')}
                className="filter-select"
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="all">All</option>
              </select>

              <label htmlFor="sort-by">Sort by:</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'due-date' | 'priority' | 'created')}
                className="filter-select"
              >
                <option value="due-date">Due Date</option>
                <option value="priority">Priority</option>
                <option value="created">Date Created</option>
              </select>
            </div>
            <button className="new-reminder-button" onClick={handleNewReminder}>
              <FiPlus style={{ marginRight: '5px' }} /> New Reminder
            </button>
          </div>

          {sortedReminders.length === 0 ? (
            <div className="no-reminders">
              <FiCalendar className="no-data-icon" />
              <p>No reminders found</p>
            </div>
          ) : (
            <ul className="reminders-list">
              {sortedReminders.map((reminder) => (
                <li 
                  key={reminder.id}
                  className={`reminder-item ${reminder.completed ? 'completed' : ''}`}
                  data-id={reminder.id}
                >
                  <span 
                    className={`reminder-status ${reminder.completed ? 'completed' : ''}`}
                    data-status={reminder.completed ? 'completed' : 'pending'}
                    title={reminder.completed ? 'Mark as pending' : 'Mark as complete'}
                    onClick={() => toggleReminderStatus(reminder.id)}
                  ></span>
                  
                  <div className="reminder-content" onClick={() => toggleReminderStatus(reminder.id)}>
                    <span className="reminder-name">{reminder.name}</span>
                    <div className="reminder-meta">
                      <span className="due-date">{formatDate(reminder.dueDate)}</span>
                      {reminder.relatedTo && (
                        <span className="related-info">
                          <span className="icon">
                            {reminder.relatedTo.type === 'person' ? <FiUser /> : <FiFolder />}
                          </span> {reminder.relatedTo.name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <span className={`reminder-priority priority-${reminder.priority}`}>
                    {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Reminder Modal would go here */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>New Reminder</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form>
              <div className="form-group">
                <label htmlFor="name">Reminder Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Enter reminder name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dueDate">Due Date:</label>
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="priority">Priority:</label>
                <select
                  id="priority"
                  name="priority"
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  Create Reminder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
