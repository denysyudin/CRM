import React, { useState } from 'react';
import { Note } from '../../types';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  SelectChangeEvent,
  CircularProgress
} from '@mui/material';
import { Close as CloseIcon, CloudUpload } from '@mui/icons-material';

interface NoteModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (noteData: Omit<Note, 'id'>, fileData?: FormData) => void;
  note?: Note;
}

const NoteModal: React.FC<NoteModalProps> = ({ projectName, onClose, onSubmit, note }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [description, setDescription] = useState(note?.description || '');
  const [category, setCategory] = useState(note?.category || 'General');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    
    // Create note data object
    const noteData = {
      title,
      description,
      category,
      project_id: note?.project_id || '',
      employee_id: note?.employee_id || '',
      created_at: new Date().toISOString(),
      files: file ? fileName : ''
    };
    
    // If there's a file, prepare FormData for file upload
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileName', fileName);
      formData.append('noteId', note?.id || '');
      formData.append('projectId', note?.project_id || '');
      
      // Pass both note data and file data to parent component
      onSubmit(noteData, formData);
    } else {
      // Just submit the note data without file
      onSubmit(noteData);
    }
    
    setIsUploading(false);
  };

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value);
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
            {note ? 'Edit Note' : 'Add New Note'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
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
        <form id="note-form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                variant="outlined"
                margin="normal"
                size="small"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal" size="small">
                <InputLabel id="note-category-label">Category</InputLabel>
                <Select
                  labelId="note-category-label"
                  value={category}
                  label="Category"
                  onChange={handleCategoryChange}
                >
                  <MenuItem value="Meeting">Meeting</MenuItem>
                  <MenuItem value="Client">Client</MenuItem>
                  <MenuItem value="Task">Task</MenuItem>
                  <MenuItem value="Idea">Idea</MenuItem>
                  <MenuItem value="General">General</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Content"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={5}
                variant="outlined"
                margin="normal"
                required
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
                  id="note-file-upload"
                  type="file"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="note-file-upload">
                  <Button
                    component="span"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    sx={{ mb: 1 }}
                  >
                    Upload Attachment
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
                  Attach documents, images, or other files to this note
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
          form="note-form" 
          variant="contained" 
          color="primary"
          disabled={isUploading}
          startIcon={isUploading ? <CircularProgress size={20} /> : null}
        >
          {isUploading ? 'Uploading...' : (note ? 'Update Note' : 'Create Note')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteModal; 