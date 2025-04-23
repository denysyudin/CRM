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
    const [currentTime, setCurrentTime] = useState(new Date());
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
        <div className="app-container">
            <Sidebar />
            <main className="main-content">
                <div className="dashboard-header-bar">
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button 
                            onClick={toggleSidebar} 
                            className="sidebar-toggle"
                        >
                            ☰
                        </button>
                        <h1 className="dashboard-title">Main Dashboard</h1>
                    </div>
                    <div id="clock-display">{formatDateTime(currentTime)}</div>
                </div>
                
                <div className="dashboard-grid">
                    <div className="widget" style={{ gridColumn: 'span 2', height: '500px' }}>
                        <TodaysTasks />
                    </div>
                    <div className="widget" style={{ height: '500px' }}>
                        <Calendar />
                    </div>
                    <div className="widget" style={{ height: '500px' }}>
                        <KeyMetrics />
                    </div>
                    <div className="widget" style={{ height: '500px' }}>
                        <UpcomingEvents />
                    </div>
                    <div className="widget" style={{ height: '500px' }}>
                        <RecentNotes />
                    </div>
                    <div className="widget" style={{ height: '500px' }}>
                        <PendingReminders />
                    </div>
                    <div className="widget" style={{ height: '500px' }}>
                        <ActiveProjects />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
