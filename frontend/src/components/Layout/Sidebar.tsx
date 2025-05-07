import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { fetchReminders } from '../../redux/features/remindersSlice';
import { AppDispatch } from '../../redux/store';
import './Sidebar.css';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<Props> = () => {
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

  // Determine sidebar classes based on open state
  const sidebarClasses = `sidebar-nav`;

  return (
    <div className={sidebarClasses}>
      <div className="sidebar-header">
        <span className="logo-icon">🚀</span>
        <span className="logo-text">My CRM</span>
      </div>
      <ul className="nav-list">
        <li>
          <Link to="/" className={path === '/' || path === '/dashboard' ? 'active' : ''}  >
            <span className="nav-icon">🏠</span> Dashboard
          </Link>
        </li>
        <li>
          <Link to="/tasks" className={path === '/tasks' ? 'active' : ''}  >
            <span className="nav-icon">✅</span> All Tasks
          </Link>
        </li>
        <li>
          <Link to="/calendar" className={path === '/calendar' ? 'active' : ''}  >
            <span className="nav-icon">🗓️</span> Calendar
          </Link>
        </li>
        <li>
          <Link to="/notes" className={path === '/notes' ? 'active' : ''}  >
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
          <Link to="/projects" className={path === '/projects' ? 'active' : ''}  >
            <span className="nav-icon">📁</span> Projects
          </Link>
        </li>
        <li>
          <Link to="/employee" className={path === '/employee' ? 'active' : ''}  >
            <span className="nav-icon">👥</span> Employees
          </Link>
        </li>
        {/* <li>
          <Link to="/files" className={path === '/files' ? 'active' : ''}  >
            <span className="nav-icon">📎</span> Files
          </Link>
        </li>
        <li>
          <Link to="/settings" className={path === '/settings' ? 'active' : ''}  >
            <span className="nav-icon">⚙️</span> Settings
          </Link>
        </li> */}
      </ul>
    </div>
  );
};

export default Sidebar; 