import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Chip, 
  Box, 
  Divider,
  CircularProgress
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import { useGetEventsQuery } from '../../redux/api/eventsApi';
import './styles.css';

const UpcomingEvents: React.FC = () => {
  const [shouldFetch, setShouldFetch] = useState(false);
  
  // Use RTK Query with skip option to conditionally fetch
  const { data: events = [], isLoading, isError } = useGetEventsQuery(undefined, {
    skip: !shouldFetch
  });

  // Check if we have events data in the store
  useEffect(() => {
    if (events.length === 0) {
      setShouldFetch(true);
    }
  }, [events]);

  const getChipColor = (type: string) => {
    return type === 'Meeting' ? 'primary' : 'error';
  };

  return (
    <Paper elevation={0} className="mui-events-container">
      <Box>
        <Typography variant="h6" component="h2" display="flex" alignItems="center" gap={2} gutterBottom>
          <EventIcon color="primary" /> Upcoming Events
        </Typography>
        <Divider />
        
        {isLoading ? (
          <Box display="flex" justifyContent="center" >
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Typography color="error" align="center">Error loading events</Typography>
        ) : events.length === 0 ? (
          <Typography align="center">No upcoming events</Typography>
        ) : (
          <List>
            {events.map((event, index) => (
              <React.Fragment key={event.id}>
                <ListItem
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 1.5
                  }}
                >
                  <ListItemText
                    primary={<Typography color="black">{event.title}</Typography>}
                    secondary={
                      <Typography variant="body2" color="text.secondary">
                        {event.due_date}
                      </Typography>
                    }
                    sx={{ color: 'black' }}
                  />
                  <Chip 
                    label={event.type} 
                    color={getChipColor(event.type)}
                    size="small"
                    sx={{ color: 'black' }}
                  />
                </ListItem>
                {index < events.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default UpcomingEvents;