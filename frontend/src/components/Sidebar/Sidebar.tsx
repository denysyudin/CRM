import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchReminders } from '../../redux/features/remindersSlice';
import { AppDispatch } from '../../redux/store';
import './styles.css';

interface Props {
  isOpen?: boolean;
  toggleSidebar?: () => void;
}

const Sidebar: React.FC<Props> = ({ isOpen = true, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const path = location.pathname;

  const handleReminderClick = (e: React.MouseEvent) => {
    // Prevent the default Link behavior
    e.preventDefault();
    
    // Dispatch the action to fetch reminders
    dispatch(fetchReminders());
    
    // Navigate to the reminders page
    navigate('/reminders');
  };

  return (
    <div className={`sidebar-nav ${isOpen ? 'mobile-visible' : ''}`}>
      <div className="sidebar-header">
        <span className="logo-icon">🚀</span>My CRM
        {toggleSidebar && (
          <button className="close-sidebar-button" onClick={toggleSidebar}>
            &times;
          </button>
        )}
      </div>
      <ul className="nav-list">
        <li>
          <Link to="/" className={path === '/' ? 'active' : ''}>
            <span className="nav-icon">🏠</span> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/tasks" className={path === '/tasks' ? 'active' : ''}>
            <span className="nav-icon">✅</span> All Tasks
          </Link>
        </li>
        <li>
            <Link to="/calendar" className={path === '/calendar' ? 'active' : ''}>
            <span className="nav-icon">🗓️</span> Calendar
          </Link>
        </li>
        <li>
          <Link to="/notes" className={path === '/notes' ? 'active' : ''}>
            <span className="nav-icon">📝</span> Notes
          </Link>
        </li>
        <li>
          <Link 
            to="/reminders" 
            className={path === '/reminders' ? 'active' : ''} 
            onClick={handleReminderClick}
          >
            <span className="nav-icon">🔔</span> Reminders
          </Link>
        </li>
        <li>
          <Link to="/projects" className={path === '/projects' ? 'active' : ''}>
            <span className="nav-icon">📁</span> Projects
          </Link>
        </li>
        <li>
          <Link to="/employee" className={path === '/employees' ? 'active' : ''}>
            <span className="nav-icon">👥</span> Employees
          </Link>
        </li>
        <li>
          <Link to="/files" className={path === '/files' ? 'active' : ''}>
            <span className="nav-icon">📎</span> Files
          </Link>
        </li>
        <li>
          <Link to="/settings" className={path === '/settings' ? 'active' : ''}>
            <span className="nav-icon">⚙️</span> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 