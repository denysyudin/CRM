import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  List, 
  ListItem, 
  Divider,
  Stack,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useGetPendingRemindersQuery } from '../../redux/api/remindersApi';

const PendingReminders: React.FC = () => {
  const [shouldFetch, setShouldFetch] = useState(false);
  const { data = [], isLoading, isError } = useGetPendingRemindersQuery(undefined, {
    skip: !shouldFetch
  });

  useEffect(() => {
    if (data.length === 0) {
      setShouldFetch(true);
    }
  }, [data]);
  
  const getChipColor = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        maxWidth: '100%'
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <NotificationsIcon color="primary" />
        Pending Reminders
      </Typography>
      <Divider />
      
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress size={24} />
        </Box>
      ) : isError ? (
        <Typography variant="body2" color="error" sx={{ p: 2, textAlign: 'center' }}>
          Failed to load reminders
        </Typography>
      ) : data.length === 0 ? (
        <Typography variant="body2" sx={{ p: 2, textAlign: 'center' }}>
          No pending reminders found
        </Typography>
      ) : (
        <List sx={{ width: '100%' }}>
          {data.map((reminder, index) => (
            <React.Fragment key={reminder.id}>
              <ListItem 
                sx={{ 
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="subtitle1">{reminder.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {reminder.due_date.split('T')[0]}
                  </Typography>
                </Stack>
                <Chip 
                  label={reminder.priority}
                  color={getChipColor(reminder.priority) as any}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </ListItem>
              {index < data.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default PendingReminders;