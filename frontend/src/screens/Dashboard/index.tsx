import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useMediaQuery, Grid, Container, Paper, Box, IconButton, Typography } from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import TodaysTasks from '../../components/TodaysTasks';
import Calendar from '../../components/Calendar';
import KeyMetrics from '../../components/KeyMetrics';
import UpcomingEvents from '../../components/UpcomingEvents';
import RecentNotes from '../../components/RecentNotes';
import PendingReminders from '../../components/PendingReminders';
import ActiveProjects from '../../components/ActiveProjects';
// import './styles.css';

const Dashboard: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());
    const mainContentRef = useRef<HTMLDivElement>(null);
    
    // Use a more specific approach with theme.breakpoints.down for consistency
    // const isSmall = useMediaQuery('(max-width:600px)');
    const isMobile = useMediaQuery('(max-width:768px)');
    // const isMedium = useMediaQuery('(max-width:960px)');
    // const isLarge = useMediaQuery('(max-width:1280px)');

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
    
    // Scroll to top function
    // const scrollToTop = () => {
    //     // if (mainContentRef.current) {
    //     //     mainContentRef.current.scrollTo({
    //     //         top: 0,
    //     //         behavior: 'smooth'
    //     //     });
    //     // }
    //     window.scrollTo({
    //         top: 0,
    //         behavior: 'smooth'
    //     });
    // };

    return (
        <Container 
        maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'hidden' }}
        >
            <Box 
                sx={{
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    p: 2, 
                    borderBottom: 1, 
                    borderColor: 'divider'
                }}
            >
                <Typography variant="h5" component="h1">Main Dashboard</Typography>
                <Typography variant="subtitle1">{formatDateTime(currentTime)}</Typography>
            </Box>
            <Box sx={{ p: 2, overflow: 'auto', height: 'calc(100vh - 100px)' }}>
            
            <Grid container spacing={2}>
                <Grid item xs={12} md={isMobile ? 12 : 6}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 2, 
                            minHeight: 200,
                            height: 500,
                            maxHeight: {xs: 400, md: 'none'},
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'auto'
                        }}
                    >
                        <TodaysTasks />
                    </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 4, 
                            minHeight: 180,
                            height: 500,
                            maxHeight: {xs: 500, md: 'none'},
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'auto'
                        }}
                    >
                        <Calendar />
                    </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 4,
                            minHeight: 180,
                            height: 500,
                            maxHeight: {xs: 500, md: 'none'},
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'auto'
                        }}
                    >
                        <KeyMetrics />
                    </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 4, 
                            minHeight: 180,
                            height: 500,
                            maxHeight: {xs: 500, md: 'none'},
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'auto'
                        }}
                    >
                        <UpcomingEvents />
                    </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 4, 
                            minHeight: 180,
                            height: 500,
                            maxHeight: {xs: 500, md: 'none'},
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'auto'
                        }}
                    >
                        <RecentNotes />
                    </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 4, 
                            minHeight: 180,
                            height: 500,
                            maxHeight: {xs: 500, md: 'none'},
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'auto'
                        }}
                    >
                        <PendingReminders />
                    </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                    <Paper 
                        elevation={2} 
                        sx={{ 
                            p: 4, 
                            minHeight: 180,
                            height: 500,
                            maxHeight: {xs: 500, md: 'none'},
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'auto'
                        }}
                    >
                        <ActiveProjects />
                    </Paper>
                </Grid>
            </Grid>
            
            {/* Scroll to top button */}
            {/* <IconButton
                onClick={() => scrollToTop()}
                aria-label="Scroll to top"
                sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                        bgcolor: 'primary.dark',
                    },
                    zIndex: 1000
                }}
            >
                <KeyboardArrowUpIcon />
            </IconButton> */}
            </Box>
        </Container>
    );
};

export default Dashboard;
