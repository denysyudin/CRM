import React, { useState, useEffect } from 'react';
import { FiCalendar, FiAlertCircle, FiPlus, FiTrash2, FiEdit, FiX, FiMenu, FiUser, FiFolder } from 'react-icons/fi';
import Sidebar from '../../components/Sidebar/Sidebar';
import './styles.css';
import { Reminder } from '../../services/api';

import { 
  useGetRemindersQuery, 
  useCreateReminderMutation, 
  useUpdateReminderMutation, 
  useDeleteReminderMutation 
} from '../../redux/api/remindersApi';
import { useGetProjectsQuery } from '../../redux/api/projectsApi';
import { useGetEmployeesQuery } from '../../redux/api/employeesApi';

const Reminders: React.FC = () => {
  // RTK Query hooks
  const { 
    data: reduxReminders = [], 
    isLoading, 
    error: remindersError, 
    refetch: refetchReminders 
  } = useGetRemindersQuery();
  
  const { data: projects = [] } = useGetProjectsQuery();
  const { data: employees = [] } = useGetEmployeesQuery();
  
  const [createReminder] = useCreateReminderMutation();
  const [updateReminder] = useUpdateReminderMutation();
  const [deleteReminder] = useDeleteReminderMutation();
  
  // Local state for UI display
  const [reminders, setReminders] = useState<Reminder[]>([]);

  // UI state
  const [filter, setFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [sortBy, setSortBy] = useState<'due-date' | 'priority' | 'created'>('due-date');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [editingReminder, setEditingReminder] = useState<string | null>(null);

  // Form state for new reminder
  const [newReminder, setNewReminder] = useState({
    name: '',
    dueDate: '',
    dueTime: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    project_id: '',
    employee_id: '',
    status: false
  });
  
  useEffect(() => {
    // Map Redux reminders to local interface
    const mappedReminders: Reminder[] = reduxReminders.map(reminder => ({
      id: reminder.id,
      title: reminder.title || "",
      due_date: reminder.due_date,
      priority: (reminder.priority || 'medium') as 'high' | 'medium' | 'low',
      status: reminder.status || false,
      project_id: reminder.project_id || '',
      employee_id: reminder.employee_id || '',
      relatedTo: reminder.project_id ? {
        type: 'project' as const,
        name: `Project ${reminder.project_id}`
      } : undefined
    }));
    
    setReminders(mappedReminders);
  }, [reduxReminders]);

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
  const toggleReminderStatus = async (id: string) => {
    console.log(`Reminders: Toggling status for reminder ${id}`);
    const reminder = reminders.find(r => r.id === id);
    
    if (reminder) {
      const status = !reminder.status;
      try {
        await updateReminder({
          id,
          title: reminder.title,
          due_date: reminder.due_date,
          priority: reminder.priority,
          status: status,
          project_id: reminder.project_id,
          employee_id: reminder.employee_id
        }).unwrap();
        
        // Also update local state immediately for UI responsiveness
        setReminders(prevReminders => 
          prevReminders.map(reminder => 
            reminder.id === id 
              ? { ...reminder, status: !reminder.status } 
              : reminder
          )
        );
      } catch (error) {
        console.error('Failed to update reminder status:', error);
      }
    }
  };

  // Handle new reminder button click
  const handleNewReminder = () => {
    setEditingReminder(null);
    setNewReminder({
      name: '',
      dueDate: '',
      dueTime: '',
      priority: 'medium',
      project_id: '',
      employee_id: '',
      status: false
    });
    setIsModalOpen(true);
  };
  
  // Handle edit reminder
  const handleEditReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      // Parse date and time from due_date
      const dueDate = new Date(reminder.due_date);
      const dateStr = dueDate.toISOString().split('T')[0];
      const timeStr = dueDate.toTimeString().substring(0, 5);
      console.log('Reminders: Editing reminder', reminder);
      setNewReminder({
        name: reminder.title,
        dueDate: dateStr,
        dueTime: timeStr,
        status: reminder.status,
        priority: reminder.priority as 'high' | 'medium' | 'low',
        project_id: reminder.project_id || '',
        employee_id: reminder.employee_id || ''
      });
      setEditingReminder(id);
      setIsModalOpen(true);
    }
  };
  
  // Handle input changes for the new reminder form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Reminders: Creating/updating reminder', newReminder);
    
    if (newReminder.name && newReminder.dueDate) {
      // Combine date and time for the due_date
      const combinedDateTime = newReminder.dueTime 
        ? `${newReminder.dueDate}T${newReminder.dueTime}`
        : `${newReminder.dueDate}T00:00:00`;
      
      try {
        if (editingReminder) {
          // Update existing reminder
          await updateReminder({
            id: editingReminder,
            title: newReminder.name,
            due_date: combinedDateTime,
            priority: newReminder.priority,
            project_id: newReminder.project_id || undefined,
            employee_id: newReminder.employee_id || undefined,
            status: newReminder.status
          }).unwrap();
        } else {
          // Create new reminder
          await createReminder({
            title: newReminder.name,
            due_date: combinedDateTime,
            priority: newReminder.priority,
            status: false,
            project_id: newReminder.project_id || undefined,
            employee_id: newReminder.employee_id || undefined
          }).unwrap();
        }
        
        // Close modal and reset form
        setIsModalOpen(false);
        setEditingReminder(null);
        setNewReminder({
          name: '',
          dueDate: '',
          dueTime: '',
          priority: 'medium',
          project_id: '',
          employee_id: '',
          status: false
        });
      } catch (error) {
        console.error('Failed to save reminder:', error);
      }
    }
  };

  // Handle delete reminder
  const handleDeleteReminder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await deleteReminder(id).unwrap();
      } catch (error) {
        console.error('Failed to delete reminder:', error);
      }
    }
  };

  // Filter reminders based on status
  const filteredReminders = reminders.filter(reminder => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !reminder.status;
    if (filter === 'completed') return reminder.status;
    return true;
  });

  // Sort reminders
  const sortedReminders = [...filteredReminders].sort((a, b) => {
    if (sortBy === 'due-date') {
      return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
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
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', flexDirection: 'column' }}>
            <div style={{ fontSize: '48px', marginBottom: '10px' }}>
              <FiCalendar />
            </div>
            <p>Loading reminders...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (remindersError) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <div className="error-container" style={{ textAlign: 'center', padding: '20px' }}>
            <FiAlertCircle style={{ fontSize: '48px', color: '#dc3545', marginBottom: '10px' }} />
            <p>Error loading reminders: {JSON.stringify(remindersError)}</p>
            <button 
              onClick={() => refetchReminders()}
              style={{ 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                padding: '8px 16px', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className='sidebar'>
        <Sidebar />
      </div>
      
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
                  className={`reminder-item ${reminder.status ? 'completed' : ''}`}
                  data-id={reminder.id}
                >
                  <span 
                    className={`reminder-status ${reminder.status ? 'completed' : ''}`}
                    data-status={reminder.status ? 'completed' : 'pending'}
                    title={reminder.status ? 'Mark as pending' : 'Mark as complete'}
                    onClick={() => toggleReminderStatus(reminder.id)}
                  ></span>
                  
                  <div className="reminder-content" onClick={() => toggleReminderStatus(reminder.id)}>
                    <span className="reminder-name">{reminder.title}</span>
                    <div className="reminder-meta">
                      <span className="due-date">{formatDate(reminder.due_date)}</span>
                      {reminder.project_id && (
                        <span className="related-info">
                          <span className="icon">
                            <FiFolder />
                          </span> 
                          {projects.find(p => p.id === reminder.project_id)?.title || 'Project ' + reminder.project_id}
                        </span>
                      )}
                      {reminder.employee_id && (
                        <span className="related-info">
                          <span className="icon">
                            <FiUser />
                          </span> 
                          {employees.find(e => e.id === reminder.employee_id)?.name || 'Employee ' + reminder.employee_id}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <span className={`reminder-priority priority-${reminder.priority}`}>
                    {reminder.priority.charAt(0).toUpperCase() + reminder.priority.slice(1)}
                  </span>
                  
                  <div className="reminder-actions">
                    <button 
                      className="action-button_reminder edit-button_reminder" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditReminder(reminder.id);
                      }}
                      title="Edit reminder"
                    >
                      <FiEdit size={14} />
                    </button>
                    <button 
                      className="action-button_reminder delete-button_reminder" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteReminder(reminder.id);
                      }}
                      title="Delete reminder"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      {/* Reminder Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingReminder ? 'Edit Reminder' : 'New Reminder'}</h2>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Reminder Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newReminder.name}
                  onChange={handleInputChange}
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
                  value={newReminder.dueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dueTime">Due Time:</label>
                <input
                  type="time"
                  id="dueTime"
                  name="dueTime"
                  value={newReminder.dueTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="priority">Priority:</label>
                <select
                  id="priority"
                  name="priority"
                  value={newReminder.priority}
                  onChange={handleInputChange}
                >
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="project_id">Project:</label>
                <select
                  id="project_id"
                  name="project_id"
                  value={newReminder.project_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Project --</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title || project.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="employee_id">Assignee:</label>
                <select
                  id="employee_id"
                  name="employee_id"
                  value={newReminder.employee_id}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Assignee --</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="save-button">
                  {editingReminder ? 'Update Reminder' : 'Create Reminder'}
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
