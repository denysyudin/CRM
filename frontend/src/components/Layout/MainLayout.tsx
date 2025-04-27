import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../Sidebar/Sidebar.jsx';
import Dashboard from '../Dashboard/Dashboard';
import TaskView from '../Task/TaskView';
import NoteView from '../Note/NoteView';
import ReminderView from '../Reminder/ReminderView';
import './MainLayout.css';

const MainLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [currentDateTime, setCurrentDateTime] = useState<string>('');
  const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Get current path for determining active content
  const currentPath = location.pathname.split('/')[1] || 'dashboard';

  // Toggle sidebar visibility
  const toggleSidebar = (): void => {
    setSidebarOpen(!sidebarOpen);
  };

  // Update clock
  useEffect(() => {
    const updateClock = (): void => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      setCurrentDateTime(now.toLocaleDateString('en-US', options));
    };

    updateClock();
    const clockInterval = setInterval(updateClock, 1000);
    
    return () => clearInterval(clockInterval);
  }, []);

  // Scroll to top functionality
  useEffect(() => {
    const handleScroll = (): void => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Content rendering based on current path
  const renderContent = () => {
    switch(currentPath) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskView />;
      case 'notes':
        return <NoteView />;
      case 'reminders':
        return <ReminderView />;
      default:
        return <Dashboard />;
    }
  };

  // Handle navigation from sidebar
  const handleNavigation = (path: string): void => {
    navigate(`/${path}`);
  };

  return (
    <div className={`app-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar}
        onNavigate={handleNavigation}
        activePath={currentPath}
      />
      
      <div className="main-content">
        <div className="dashboard-header-bar">
          <div className="header-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <FontAwesomeIcon icon={faBars} />
            </button>
            <h1 className="dashboard-title">
              {currentPath.charAt(0).toUpperCase() + currentPath.slice(1)}
            </h1>
          </div>
          <div id="clock-display">{currentDateTime}</div>
        </div>
        
        <div className="page-content">
          {renderContent()}
        </div>
      </div>
      
      {showScrollButton && (
        <button className="scroll-to-top" onClick={scrollToTop}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
      )}
    </div>
  );
};

export default MainLayout; 