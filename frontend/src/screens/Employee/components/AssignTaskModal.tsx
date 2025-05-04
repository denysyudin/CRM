import React, { useState } from 'react';
import { Task } from '../../../types/task.types';
import { Employee } from '../../../types/employee.types';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface AssignTaskModalProps {
  employee: Employee | null;
  onSave: (taskData: Task) => void;
  onClose: () => void;
}

const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ employee, onSave, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [project, setProject] = useState('');
  const [checkInDate, setCheckInDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (taskName.trim()) {
      onSave({
        id: '',
        title: taskName.trim(),
        description: description.trim(),
        priority,
        due_date: dueDate,
        project_id: project.trim(),
        next_checkin_date: checkInDate ? checkInDate : null,
        status: 'To Do',
      });
      console.log(taskName.trim(), description.trim(), priority, dueDate, project.trim(), checkInDate ? checkInDate : null);
      
      // Close the modal
      onClose();
    }
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6">
          Assign New Task
        </Typography>
        <IconButton 
          edge="end" 
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Box sx={{ px: 3, pb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          For: {employee?.name}
        </Typography>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 0 }}>
          <TextField
            fullWidth
            margin="normal"
            id="assign-task-name"
            label="Task Name"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            required
            size="small"
          />
          
          <TextField
            fullWidth
            margin="normal"
            id="assign-task-description"
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
          />
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  id="assign-task-priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  label="Priority"
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="assign-task-due-date"
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                size="small"
              />
            </Grid>
          </Grid>
          
          <TextField
            fullWidth
            margin="normal"
            id="assign-task-project"
            label="Related Project/Business (Optional)"
            value={project}
            onChange={(e) => setProject(e.target.value)}
            placeholder="e.g., Bravo Jewellers, Website"
            size="small"
          />
          
          <TextField
            fullWidth
            margin="normal"
            id="assign-task-checkin"
            label="Next Check-in Date (Optional)"
            type="date"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            size="small"
          />
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={onClose} 
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            onClick={handleSubmit}
          >
            Assign Task
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AssignTaskModal;