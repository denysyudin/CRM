import React, { useState } from 'react';
import { Task } from '../../types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Divider,
  Grid,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import { Close, CloudUpload } from '@mui/icons-material';

interface TaskModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (taskData: FormData) => void;
  task?: Task;
  projectId: string;
}

const TaskModal: React.FC<TaskModalProps> = ({ projectName, onClose, onSubmit, task, projectId }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState(task?.status || 'To Do');
  const [due_date, setDueDate] = useState(task?.due_date || '');
  const [priority, setPriority] = useState(task?.priority || 'Medium');
  const [category, setCategory] = useState(task?.category || 'General');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    const taskData = {
      title,
      description,
      status,
      due_date,
      priority,
      category,
      project_id: task?.project_id || projectId,
      employee_id: task?.employee_id || '',
      // Convert file to array to match interface
      files: file ? [fileName] : []
    };
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    formData.append('due_date', due_date);
    formData.append('priority', priority);
    formData.append('category', category);
    formData.append('project_id', projectId);
    formData.append('employee_id', '');
    console.log(formData);
    // If there's a file, prepare FormData for file upload
    if (file) {
      formData.append('file', file);
      onSubmit(formData);
    } else {
      // Just submit the task data without file
      onSubmit(formData);
    }
    
    setIsUploading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  return (
    <Dialog 
      open={true} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {task ? 'Edit Task' : 'Add New Task'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Box px={3} pb={2}>
        <Typography variant="subtitle2" color="text.secondary">
          Project: {projectName}
        </Typography>
      </Box>
      
      <Divider />
      
      <DialogContent sx={{ pt: 2 }}>
        <form id="task-form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                variant="outlined"
                margin="normal"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={category}
                  label="Category"
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <MenuItem value="To Buy">To Buy</MenuItem>
                  <MenuItem value="To Pay">To Pay</MenuItem>
                  <MenuItem value="To Fix">To Fix</MenuItem>
                  <MenuItem value="To Contact">To Contact</MenuItem>
                  <MenuItem value="To Follow Up">To Follow Up</MenuItem>
                  <MenuItem value="To Research">To Research</MenuItem>
                  <MenuItem value="To Prepare/Make">To Prepare/Make</MenuItem>
                  <MenuItem value="To Review">To Review</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="To Do">To Do</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="On Hold">On Hold</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                variant="outlined"
                margin="normal"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="Low">Low</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Urgent">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={due_date}
                onChange={(e) => setDueDate(e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
                variant="outlined"
                margin="normal"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box 
                sx={{ 
                  border: '1px dashed', 
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                  mt: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'background.default'
                }}
              >
                <input
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  id="file-upload"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 1 }}
                  >
                    Upload File
                  </Button>
                </label>
                {fileName && (
                  <Box sx={{ mt: 1, textAlign: 'center' }}>
                    <Typography variant="body2">
                      Selected: {fileName}
                    </Typography>
                  </Box>
                )}
                <FormHelperText>
                  Supported formats: Images, PDF, Word, Excel, and Text files
                </FormHelperText>
              </Box>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      
      <Divider />
      
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          form="task-form" 
          variant="contained" 
          color="primary"
          disabled={isUploading}
          startIcon={isUploading ? <CircularProgress size={20} /> : null}
        >
          {isUploading ? 'Uploading...' : (task ? 'Update Task' : 'Create Task')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskModal; 