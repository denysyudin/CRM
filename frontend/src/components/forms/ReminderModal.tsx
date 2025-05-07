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
  CircularProgress,
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
  isLoading?: boolean;
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
  isLoading = false,
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
      onClose={!isLoading ? onClose : undefined}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {isEditing ? 'Edit Reminder' : 'New Reminder'}
        {!isLoading && (
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
        )}
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            fullWidth
            id="title"
            label="Reminder Name"
            name="title"
            value={reminder.title}
            onChange={onChange}
            disabled={isLoading}
            required
          />
          <TextField
            margin="normal"
            fullWidth
            id="description"
            label="Description"
            name="description"
            value={reminder.description || ''}
            onChange={onChange}
            multiline
            rows={3}
            disabled={isLoading}
          />
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <TextField
                type="date"
                label="Due Date"
                name="due_date"
                value={reminder.due_date?.split('T')[0]}
                onChange={onChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={isLoading}
                required
              />
              
              <TextField
                type="time"
                label="Due Time"
                name="due_time"
                value={reminder.due_date?.split('T')[1]}
                onChange={onChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
                disabled={isLoading}
                required 
              />
            </Box>
          </LocalizationProvider>
          
          <FormControl fullWidth margin="normal" disabled={isLoading}>
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
          
          <FormControl fullWidth margin="normal" disabled={isLoading}>
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
          
          <FormControl fullWidth margin="normal" disabled={isLoading}>
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
                  disabled={isLoading}
                />
              }
              label="Mark as completed"
              sx={{ mt: 1 }}
              disabled={isLoading}
            />
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={onSubmit}
          disabled={isLoading || !reminder.title}
          startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
        >
          {isLoading 
            ? (isEditing ? 'Updating...' : 'Creating...') 
            : (isEditing ? 'Update' : 'Create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderModal; 