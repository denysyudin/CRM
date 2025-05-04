import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchReminders } from '../../redux/features/remindersSlice';
import { AppDispatch } from '../../redux/store';
import './styles.css';

interface Props {
  isOpen?: boolean;
  activePath?: string;
  toggleSidebar?: () => void;
}

const Sidebar: React.FC<Props> = ({ isOpen = true, activePath, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const path = location.pathname;
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Check if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleReminderClick = (e: React.MouseEvent) => {
    // Prevent the default Link behavior
    e.preventDefault();
    
    // Dispatch the action to fetch reminders
    dispatch(fetchReminders());
    
    // Navigate to the reminders page
    navigate('/reminders');
    
    // Close sidebar on mobile after navigation
    if (isMobile && toggleSidebar) {
      toggleSidebar();
    }
  };

  // Close sidebar when clicking on a nav item on mobile
  const handleNavClick = () => {
    if (isMobile && toggleSidebar) {
      toggleSidebar();
    }
  };

  return (
    <div className={`sidebar-nav ${isOpen ? 'mobile-visible' : ''}`}>
      <div className="sidebar-header">
        <span className="logo-icon">🚀</span>My CRM
      </div>
      <ul className="nav-list">
        <li>
          <Link to="/" className={path === '/' ? 'active' : ''} onClick={handleNavClick}>
            <span className="nav-icon">🏠</span> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/tasks" className={path === '/tasks' ? 'active' : ''} onClick={handleNavClick}>
            <span className="nav-icon">✅</span> All Tasks
          </Link>
        </li>
        <li>
          <Link to="/calendar" className={path === '/calendar' ? 'active' : ''} onClick={handleNavClick}>
            <span className="nav-icon">🗓️</span> Calendar
          </Link>
        </li>
        <li>
          <Link to="/notes" className={path === '/notes' ? 'active' : ''} onClick={handleNavClick}>
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
          <Link to="/projects" className={path === '/projects' ? 'active' : ''} onClick={handleNavClick}>
            <span className="nav-icon">📁</span> Projects
          </Link>
        </li>
        <li>
          <Link to="/employee" className={path === '/employees' ? 'active' : ''} onClick={handleNavClick}>
            <span className="nav-icon">👥</span> Employees
          </Link>
        </li>
        <li>
          <Link to="/files" className={path === '/files' ? 'active' : ''} onClick={handleNavClick}>
            <span className="nav-icon">📎</span> Files
          </Link>
        </li>
        <li>
          <Link to="/#" className={path === '/settings' ? 'active' : ''} onClick={handleNavClick}>
            <span className="nav-icon">⚙️</span> Settings
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar; 