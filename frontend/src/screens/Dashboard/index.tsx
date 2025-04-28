import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMediaQuery } from '@mui/material';
import Sidebar from '../../components/Sidebar/Sidebar.tsx';
import TodaysTasks from '../../components/TodaysTasks';
import Calendar from '../../components/Calendar';
import KeyMetrics from '../../components/KeyMetrics';
import UpcomingEvents from '../../components/UpcomingEvents';
import RecentNotes from '../../components/RecentNotes';
import PendingReminders from '../../components/PendingReminders';
import ActiveProjects from '../../components/ActiveProjects';
import './styles.css';

const Dashboard: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());
    const mainContentRef = useRef<HTMLDivElement>(null);
    
    // Use a more specific approach with theme.breakpoints.down for consistency
    const isSmall = useMediaQuery('(max-width:600px)');
    const isMobile = useMediaQuery('(max-width:768px)');
    const isMedium = useMediaQuery('(max-width:960px)');
    const isLarge = useMediaQuery('(max-width:1280px)');
    
    // Update sidebar state when screen size changes
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
        }
    }, [isMobile]);

    // Update the clock every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000); // Update every minute (60000 ms)
        
        // Clean up the interval on component unmount
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date: Date) => {
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };
    
    // Close sidebar when clicking overlay (mobile only)
    const closeSidebar = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    // Scroll to top function
    const scrollToTop = () => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    // Calculate dynamic classes for different screen sizes, memoized for performance
    const responsiveClass = useMemo(() => {
        if (isSmall) return "dashboard-small";
        if (isMobile) return "dashboard-mobile";
        if (isMedium) return "dashboard-medium";
        if (isLarge) return "dashboard-large";
        return "dashboard-xlarge";
    }, [isSmall, isMobile, isMedium, isLarge]);

    // Determine if sidebar should be shown
    const sidebarClass = sidebarOpen ? "sidebar-open" : "sidebar-closed";

    return (
        <div className={`app-container ${responsiveClass} ${sidebarClass}`}>
            {/* Fixed position sidebar */}
            <div className="sidebar">
                <Sidebar />
            </div>
            
            {/* Overlay for mobile sidebar */}
            {isMobile && sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar}></div>
            )}
            
            {/* Main content area that adjusts based on sidebar state */}
            <main className="main-content" ref={mainContentRef}>
                <div className="dashboard-header-bar">
                    <div className="header-left">
                        <button 
                            onClick={toggleSidebar} 
                            className="sidebar-toggle"
                            aria-label="Toggle sidebar"
                        >
                            ☰
                        </button>
                        <h1 className="dashboard-title">Main Dashboard</h1>
                    </div>
                    <div id="clock-display">{formatDateTime(currentTime)}</div>
                </div>
                
                <div className="dashboard-grid">
                    <div className={`widget widget-large ${isMobile ? 'full-width' : ''}`}>
                        <TodaysTasks />
                    </div>
                    <div className={`widget ${isSmall ? 'full-width' : ''}`}>
                        <Calendar />
                    </div>
                    <div className={`widget ${isSmall ? 'full-width' : ''}`}>
                        <KeyMetrics />
                    </div>
                    <div className={`widget ${isSmall ? 'full-width' : ''}`}>
                        <UpcomingEvents />
                    </div>
                    <div className={`widget ${isSmall ? 'full-width' : ''}`}>
                        <RecentNotes />
                    </div>
                    <div className={`widget ${isSmall ? 'full-width' : ''}`}>
                        <PendingReminders />
                    </div>
                    <div className={`widget ${isSmall ? 'full-width' : ''}`}>
                        <ActiveProjects />
                    </div>
                </div>
                
                {/* Scroll to top button */}
                <button 
                    className="scroll-to-top"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                >
                    ↑
                </button>
            </main>
        </div>
    );
};

export default Dashboard;
