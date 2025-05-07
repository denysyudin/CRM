import React, { ReactNode, useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile and update state
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    checkMobile();
    
    // Set up listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup listener
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update sidebar state when screen size changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Determine layout classes
  const layoutClasses = [
    'main-layout',
    sidebarOpen ? 'sidebar-visible' : (isMobile ? 'sidebar-hidden' : 'sidebar-collapsed')
  ].join(' ');

  return (
    <div className={layoutClasses}>
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
