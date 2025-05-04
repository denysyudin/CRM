import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { Divider, Paper, Typography } from '@mui/material';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import './styles.css';

const Calendar: React.FC = () => {
  // Use current date
  const now = new Date();
  
  return (
    <Paper elevation={0} className="mui-calendar-container">
      <Typography variant="h6" component="h2" display="flex" alignItems="center" gap={1} gutterBottom>
        <CalendarMonthRoundedIcon color="primary" /> Calendar
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateCalendar 
          readOnly
          defaultValue={now}
          className="mui-calendar"
          views={['day']}
          showDaysOutsideCurrentMonth
        />
      </LocalizationProvider>
    </Paper>
  );
};

export default Calendar; 