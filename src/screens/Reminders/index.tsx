import React, { useState, useEffect } from 'react';
import { FiCalendar, FiAlertCircle, FiPlus, FiLink, FiTrash2, FiEdit, FiX, FiMenu } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar/Sidebar';
import './styles.css';

// Define the Reminder interface
interface Reminder {
  id: number;
  name: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  relatedTo?: string;
}

// Sample reminder data
const initialReminders: Reminder[] = [
  {
    id: 1,
    name: 'Call client about pending payment',
    date: '2023-08-15',
    priority: 'high',
    completed: false,
    relatedTo: 'Project X'
  },
  {
    id: 2,
    name: 'Review project proposal',
    date: '2023-08-18',
    priority: 'medium',
    completed: true
  },
  {
    id: 3,
    name: 'Submit monthly report',
    date: '2023-08-25',
    priority: 'high',
    completed: false,
    relatedTo: 'Finance'
  },
  {
    id: 4,
    name: 'Update team calendar',
    date: '2023-08-12',
    priority: 'low',
    completed: false
  },
  {
    id: 5,
    name: 'Schedule team building event',
    date: '2023-09-05',
    priority: 'medium',
    completed: false,
    relatedTo: 'HR'
  },
];

// Interface for form data
interface ReminderFormData {
  id?: number;
  name: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  relatedTo?: string;
}

const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority'>('date');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [formData, setFormData] = useState<ReminderFormData>({
    name: '',
    date: new Date().toISOString().split('T')[0],
    priority: 'medium',
    relatedTo: '',
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
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
  const toggleReminderStatus = (id: number) => {
    setReminders(prevReminders =>
      prevReminders.map(reminder =>
        reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
      )
    );
  };

  // Open modal for adding a new reminder
  const handleOpenAddModal = () => {
    setSelectedReminder(null);
    setFormData({
      name: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      relatedTo: '',
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing reminder
  const handleOpenEditModal = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setFormData({
      id: reminder.id,
      name: reminder.name,
      date: reminder.date,
      priority: reminder.priority,
      relatedTo: reminder.relatedTo || '',
    });
    setIsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Save reminder (create or update)
  const handleSaveReminder = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) return;
    
    if (selectedReminder) {
      // Update existing reminder
      setReminders(prevReminders =>
        prevReminders.map(reminder =>
          reminder.id === selectedReminder.id
            ? {
                ...reminder,
                name: formData.name,
                date: formData.date,
                priority: formData.priority,
                relatedTo: formData.relatedTo || undefined,
              }
            : reminder
        )
      );
    } else {
      // Add new reminder
      const newReminder: Reminder = {
        id: Math.max(0, ...reminders.map(r => r.id)) + 1,
        name: formData.name,
        date: formData.date,
        priority: formData.priority,
        completed: false,
        relatedTo: formData.relatedTo || undefined,
      };
      setReminders(prev => [...prev, newReminder]);
    }
    
    setIsModalOpen(false);
  };

  // Delete a reminder
  const handleDeleteReminder = (id: number) => {
    setReminders(prevReminders => prevReminders.filter(reminder => reminder.id !== id));
    setDeleteConfirmId(null);
  };

  // Filter reminders based on status
  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    if (filter === 'active') return !reminder.completed;
    if (filter === 'completed') return reminder.completed;
    return true;
  });

  // Sort reminders
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return 0;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <div className="dashboard-layout">
      {(sidebarOpen || !isMobile) && (
        <nav className={`sidebar-nav ${isMobile && sidebarOpen ? 'mobile-visible' : ''}`}>
          <Sidebar />
        </nav>
      )}
      <div className="dashboard-main-content">
        <div className="reminders-container">
          <div className="reminders-header">
            <div className="header-left">
              {isMobile && (
                <button 
                  onClick={toggleSidebar} 
                  className="sidebar-toggle"
                >
                  <FiMenu />
                </button>
              )}
              <h1 className="reminders-title">
                <FiCalendar className="icon" /> Reminders
              </h1>
            </div>
            <button className="new-reminder-button" onClick={handleOpenAddModal}>
              <FiPlus style={{ marginRight: '5px' }} /> New Reminder
            </button>
          </div>

          <div className="reminders-controls">
            <div>
              <label htmlFor="filter-status">Show:</label>
              <select
                id="filter-status"
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'completed')}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label htmlFor="sort-by">Sort by:</label>
              <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'priority')}
              >
                <option value="date">Due Date</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>

          <ul className="reminders-list">
            {sortedReminders.map((reminder) => (
              <li
                key={reminder.id}
                className={`reminder-item ${reminder.completed ? 'completed' : ''}`}
              >
                <div
                  className={`reminder-status ${reminder.completed ? 'completed' : ''}`}
                  onClick={() => toggleReminderStatus(reminder.id)}
                />
                <div className="reminder-content">
                  <div className="reminder-name">{reminder.name}</div>
                  <div className="reminder-meta">
                    <span className="reminder-date">
                      <FiCalendar style={{ marginRight: '5px' }} />
                      {formatDate(reminder.date)}
                    </span>
                    {reminder.relatedTo && (
                      <span className="related-info">
                        <FiLink className="icon" />{reminder.relatedTo}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`reminder-priority priority-${reminder.priority}`}>
                  <FiAlertCircle style={{ marginRight: '3px' }} />
                  {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                </div>
                <div className="reminder-actions">
                  <button 
                    className="action-button edit"
                    onClick={() => handleOpenEditModal(reminder)}
                    title="Edit reminder"
                  >
                    <FiEdit />
                  </button>
                  {deleteConfirmId === reminder.id ? (
                    <>
                      <button 
                        className="action-button delete confirm"
                        onClick={() => handleDeleteReminder(reminder.id)}
                        title="Confirm delete"
                      >
                        ✓
                      </button>
                      <button 
                        className="action-button cancel"
                        onClick={() => setDeleteConfirmId(null)}
                        title="Cancel"
                      >
                        <FiX />
                      </button>
                    </>
                  ) : (
                    <button 
                      className="action-button delete"
                      onClick={() => setDeleteConfirmId(reminder.id)}
                      title="Delete reminder"
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </li>
            ))}
            {sortedReminders.length === 0 && (
              <li className="no-reminders">
                <p>No reminders found. Create a new reminder to get started.</p>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Modal for Add/Edit Reminder */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2>{selectedReminder ? 'Edit Reminder' : 'New Reminder'}</h2>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSaveReminder}>
              <div className="form-group">
                <label htmlFor="name">Reminder Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="What do you need to remember?"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Due Date *</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="priority">Priority *</label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="relatedTo">Related To (Optional)</label>
                <input
                  type="text"
                  id="relatedTo"
                  name="relatedTo"
                  value={formData.relatedTo}
                  onChange={handleInputChange}
                  placeholder="e.g., Project name, Department, etc."
                />
              </div>
              
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  {selectedReminder ? 'Update Reminder' : 'Add Reminder'}
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