import React, { useState, useEffect } from 'react';
import { useGetTasksQuery } from '../../redux/api/tasksApi';
import { useGetEmployeesQuery } from '../../redux/api/employeesApi';
import { CircularProgress, Typography, Table, TableBody, TableRow, TableCell, TableHead, TableContainer, Divider, Paper } from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import './styles.css';

const TodaysTasks: React.FC = () => {
  const [shouldFetch, setShouldFetch] = useState(false);
  
  // Check if we have data in the cache first
  const { data: tasks, isLoading, isError, error } = useGetTasksQuery({}, {
    skip: !shouldFetch
  });

  const { data: employees } = useGetEmployeesQuery();

  useEffect(() => {
    // If tasks are not in the store, fetch them
    if (!tasks) {
      setShouldFetch(true);
    }
  }, [tasks]);

  // Get today's date in YYYY-MM-DD format
  const todayString = new Date().toISOString().split('T')[0];
  
  // Filter tasks due today
  const todaysTasks = tasks?.filter(task => {
    // Handle different property names for due date
    const taskDueDate = task?.due_date.split('T')[0];
    return taskDueDate === todayString;
  }) || [];

  if (isLoading) {
    return (
      <Paper elevation={0} className='mui-tasks-container'>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AssignmentTurnedInIcon color="primary" />
          Today's Tasks  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
          <TableHead>
            <TableRow>
              <TableCell>Task</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assignee</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} align="center">
                <CircularProgress />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      </Paper>
    );
  }

  if (isError) {
    return (
      <Paper elevation={0} className='tasks-container'>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <AssignmentTurnedInIcon color="primary" />
          Today's Tasks  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <TableContainer>
          <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Assignee</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell colSpan={4} align="center">
                <Typography color="error">Error loading tasks: {(error as any)?.data?.message || 'Unknown error'}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer> 
      </Paper>
    );
  }

  return (
    <Paper elevation={0} className='tasks-container'>
      <Typography 
        variant="h6" 
        sx={{ 
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          padding: 1
        }}
      >
        <AssignmentTurnedInIcon color="primary" />
        Today's Tasks  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </Typography>
      <Divider />
      <TableContainer className='tasks-container'>
        <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Assignee</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {todaysTasks.map(task => (  
            <TableRow key={task.id}>
              <TableCell>{task.title}</TableCell>
              <TableCell>{task.status}</TableCell>
              <TableCell>{task.priority}</TableCell>
              <TableCell>{employees?.find(employee => employee.id === task.employee_id)?.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </Paper>
  );
};

export default TodaysTasks; 