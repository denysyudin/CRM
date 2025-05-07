import React, { ReactNode} from 'react';
import Sidebar from './Sidebar';
import './MainLayout.css';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {

  // Check if we're on mobile and update state

  // Update sidebar state when screen size changes

  // Toggle sidebar open/closed
  const toggleSidebar = () => {
    // setSidebarOpen(!sidebarOpen);
  };

  // Determine layout classes
  const layoutClasses = [
    'main-layout',
    'sidebar-visible'
  ].join(' ');

  return (
    <div className={layoutClasses}>
      <Sidebar isOpen={true} onToggle={toggleSidebar} />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
