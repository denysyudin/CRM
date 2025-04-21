import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@mui/material';
import useWebSocket from '../../hooks/useWebSocket';
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
    const isSmall = useMediaQuery('(max-width:600px)');
    const isMobile = useMediaQuery('(max-width:768px)');
    const isMedium = useMediaQuery('(max-width:960px)');
    const isLarge = useMediaQuery('(max-width:1280px)');
    
    useEffect(() => {
        if (isMobile) {
            setSidebarOpen(false);
        } else {
            setSidebarOpen(true);
        }
    }, [isMobile]);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    // Function to determine column size based on screen width
    const getColumnSize = () => {
        if (isSmall) return 12; // 1 item per row on small screens
        if (isMobile) return 6; // 2 items per row on mobile screens
        if (isMedium) return 4; // 3 items per row on medium screens
        return 3; // 4 items per row on large screens
    };

    // Special case for the Tasks component which takes more width
    const getTasksColumnSize = () => {
        if (isSmall) return 12; // 1 item per row on small screens
        if (isMobile) return 12; // 1 item per row on mobile screens
        if (isMedium) return 6; // Takes half of the row on medium screens
        return 6; // Takes half of the row on large screens
    };

    const columnSize = getColumnSize();
    const tasksColumnSize = getTasksColumnSize();

    return (
        <div className="dashboard-layout">
            {(sidebarOpen || !isMobile) && (
                <nav className={`sidebar-nav ${isMobile && sidebarOpen ? 'mobile-visible' : ''}`}>
                    <Sidebar />
                </nav>
            )}
            <main className="dashboard-main-content">
                <div className="dashboard-header-bar">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {isMobile && (
                            <button 
                                onClick={toggleSidebar} 
                                className="sidebar-toggle"
                            >
                                ☰
                            </button>
                        )}
                        <h1 className="dashboard-title">Main Dashboard</h1>
                    </div>
                    <div id="clock-display">Thu, Apr 17, 2025, 2:31 PM</div>
                    <div className="search-bar">
                        <span className="search-icon">🔍</span>
                        <input type="search" placeholder="Search tasks, notes, projects..." />
                    </div>
                </div>
                
                <div className="dashboard-grid">
                    <div className="widget" style={{ gridColumn: 'span 2' }}>
                        <TodaysTasks />
                    </div>
                    <div className="widget">
                        <Calendar />
                    </div>
                    <div className="widget">
                        <KeyMetrics />
                    </div>
                    <div className="widget">
                        <UpcomingEvents />
                    </div>
                    <div className="widget">
                        <RecentNotes />
                    </div>
                    <div className="widget">
                        <PendingReminders />
                    </div>
                    <div className="widget">
                        <ActiveProjects />
                    </div>
                </div>

                <div className="quick-add-menu">
                    <button data-action="task"><span className="menu-icon">✅</span> New Task</button>
                    <button data-action="note"><span className="menu-icon">📝</span> New Note</button>
                    <button data-action="event"><span className="menu-icon">🗓️</span> New Event</button>
                    <button data-action="reminder"><span className="menu-icon">🔔</span> New Reminder</button>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
