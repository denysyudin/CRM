import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  SelectChangeEvent,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Reminder } from '../../types/reminder.types';
import { Project } from '../../types/project.types';
import { Employee } from '../../types/employee.types';

interface ReminderModalProps {
  open: boolean;
  onClose: () => void;
  reminder: Reminder;
  isEditing: boolean;
  projects: Project[];
  employees: Employee[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (e: SelectChangeEvent) => void;
  onStatusChange: (checked: boolean) => void;
  onSubmit: (e?: React.FormEvent) => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  open,
  onClose,
  reminder,
  isEditing,
  projects,
  employees,
  onChange,
  onSelectChange,
  onStatusChange,
  onSubmit,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {isEditing ? 'Edit Reminder' : 'New Reminder'}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            id="name"
            label="Reminder Name"
            name="name"
            value={reminder.title}
            onChange={onChange}
            required
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                type="date"
                label="Due Date"
                name="dueDate"
                value={reminder.due_date}
                onChange={onChange}
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                type="time"
                label="Due Time"
                name="dueTime"
                value={reminder.due_date}
                onChange={onChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </LocalizationProvider>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="priority-label">Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority"
              name="priority"
              value={reminder.priority}
              onChange={onSelectChange}
              label="Priority"
            >
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="project-label">Project</InputLabel>
            <Select
              labelId="project-label"
              id="project_id"
              name="project_id"
              value={reminder.project_id}
              onChange={onSelectChange}
              label="Project"
            >
              <MenuItem value="">-- None --</MenuItem>
              {projects.map(project => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title || project.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="employee-label">Assignee</InputLabel>
            <Select
              labelId="employee-label"
              id="employee_id"
              name="employee_id"
              value={reminder.employee_id}
              onChange={onSelectChange}
              label="Assignee"
            >
              <MenuItem value="">-- None --</MenuItem>
              {employees.map(employee => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {isEditing && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={reminder.status}
                  onChange={(e) => onStatusChange(e.target.checked)}
                  name="status"
                />
              }
              label="Mark as completed"
              sx={{ mt: 1 }}
            />
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={onSubmit}
        >
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderModal; 