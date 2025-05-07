import React from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  Box, 
  Avatar,
  Divider
} from '@mui/material';
import './styles.css';

import { useGetTasksQuery } from '../../redux/api/tasksApi';
import { useGetActiveProjectsQuery } from '../../redux/api/projectsApi';
import { useGetRemindersQuery } from '../../redux/api/remindersApi';
import { useGetEventsQuery } from '../../redux/api/eventsApi';

interface MetricItemProps {
  icon: string;
  label: string;
  value: number;
  color?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({ icon, label, value, color }) => {
  return (
    <Box 
      display="flex" 
      alignItems="center" 
      p={1.5}
      sx={{ '&:last-child': { borderBottom: 'none' } }}
    >
      <Avatar 
        sx={{ 
          bgcolor: 'background.paper',
          color: color || 'primary.main',
          marginRight: 2,
          width: 48,
          height: 48
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h5" component="div" color="black" fontWeight="bold">
          {value}
        </Typography>
        <Typography variant="body2" color="black">
          {label}
        </Typography>
      </Box>
    </Box>
  );
};

const KeyMetrics: React.FC = () => {
  // Fetch data at the parent component level
  const { data: tasks = [] } = useGetTasksQuery();
  const { data: projects = [] } = useGetActiveProjectsQuery();
  const { data: reminders = [] } = useGetRemindersQuery();
  const { data: events = [] } = useGetEventsQuery();

  // Calculate metrics once
  const today = new Date().toISOString().split('T')[0];
  
  const overdueTasks = tasks.filter(task => task.due_date > today && task.status !== 'completed');
  const highPriorityToday = tasks.filter(task => 
    task.priority === 'high' && task.due_date === today
  );
  const pendingFollowUps = reminders.filter(reminder => reminder.status === false);
  const meetingsToday = events.filter(event => 
    event.type === 'meeting' && event.due_date === today
  );
  const activeProjects = projects;

  return (
    <Paper elevation={0} className="mui-metrics-container">
      <Box>
        <Typography variant="h5" component="h2" gutterBottom color="black">
        📊 Key Metrics
        </Typography>
        <Divider />
        
        <Grid container>
          <Grid item xs={12}>
            <MetricItem 
              icon="⚠️" 
              label="Overdue Tasks" 
              value={overdueTasks.length} 
              color="#f44336"
            />
          </Grid>
          
          <Grid item xs={12}>
            <MetricItem 
              icon="🔥" 
              label="High Priority Today" 
              value={highPriorityToday.length} 
              color="#ff9800"
            />
          </Grid>
          
          <Grid item xs={12}>
            <MetricItem 
              icon="👤" 
              label="Pending Follow-ups" 
              value={pendingFollowUps.length} 
              color="#2196f3"
            />
          </Grid>
          
          <Grid item xs={12}>
            <MetricItem 
              icon="📅" 
              label="Meetings Today" 
              value={meetingsToday.length} 
              color="#4caf50"
            />
          </Grid>
          
          <Grid item xs={12}>
            <MetricItem 
              icon="📊" 
              label="Active Projects" 
              value={activeProjects.length} 
              color="#9c27b0"
            />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default KeyMetrics;