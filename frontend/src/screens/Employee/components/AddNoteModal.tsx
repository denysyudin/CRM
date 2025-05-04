import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Employee } from '../../../types/employee.types';
interface AddNoteModalProps {
  employee: Employee | null;
  onSave: (noteData: any) => void;
  onClose: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ employee, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [project, setProject] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      body,
      category,
      project,
      employeeId: employee?.id,
      date: new Date().toISOString()
    });
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
  };

  const handleProjectChange = (event: SelectChangeEvent) => {
    setProject(event.target.value);
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
          Add Note for Employee
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
          Employee: {employee?.name} ({employee?.role})
        </Typography>
      </Box>
      
      <DialogContent sx={{ pt: 0 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            id="title"
            label="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            size="small"
          />
          
          <FormControl 
            fullWidth 
            margin="normal"
            size="small"
          >
            <InputLabel id="category-label">Category</InputLabel>
            <Select
              labelId="category-label"
              id="category"
              value={category}
              label="Category"
              onChange={handleCategoryChange}
            >
              <MenuItem value="Meeting">Meeting</MenuItem>
              <MenuItem value="Performance">Performance</MenuItem>
              <MenuItem value="Training">Training</MenuItem>
              <MenuItem value="Feedback">Feedback</MenuItem>
              <MenuItem value="General">General</MenuItem>
            </Select>
          </FormControl>
          
          {/* <FormControl 
            fullWidth 
            margin="normal"
            size="small"
          >
            <InputLabel id="project-label">Related Project</InputLabel>
            <Select
              labelId="project-label"
              id="project"
              value={project}
              label="Related Project"
              onChange={handleProjectChange}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              <MenuItem value="project-1"></MenuItem>
              <MenuItem value="project-2">Mobile App</MenuItem>
              <MenuItem value="project-3">CRM System</MenuItem>
            </Select>
          </FormControl> */}
          
          <TextField
            fullWidth
            margin="normal"
            id="body"
            label="Note Content"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            multiline
            rows={4}
            required
          />
          
          <DialogActions sx={{ px: 0, pt: 2 }}>
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
            >
              Save Note
            </Button>
          </DialogActions>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddNoteModal; 