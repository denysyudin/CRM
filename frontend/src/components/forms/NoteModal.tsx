import React, { useState, useEffect } from 'react';
import { Note } from '../../types/note.types';
import { Project } from '../../types/project.types';

import {
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  maxWidth: '90%',
  bgcolor: 'background.paper',
  borderRadius: 1,
  boxShadow: 24,
  p: 4,
};

interface NoteModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (note: Note) => Promise<void>;
  editMode: boolean;
  initialData: Note;
  projects: Project[];
  isUploading?: boolean;
  uploadProgress?: number;
  attachedFiles: string;
}

const NoteModal: React.FC<NoteModalProps> = ({
  open,
  onClose,
  onSave,
  editMode,
  initialData,
  projects,
  isUploading = false,
  attachedFiles
}) => {
  const [noteData, setNoteData] = useState<Note>(initialData);

  // Update noteData when initialData changes or modal opens
  useEffect(() => {
    setNoteData(initialData);
  }, [initialData, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name) {
      setNoteData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveNote = async () => {
    await onSave(noteData);
  };

  return (
    <Modal open={open} onClose={isUploading ? undefined : onClose}>
      <Box sx={modalStyle}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">{editMode ? 'Edit Note' : 'New Note'}</Typography>
          <IconButton onClick={onClose} size="small" disabled={isUploading}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        {isUploading && (
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 1
          }}>
            <CircularProgress />
            <Typography variant="body1" sx={{ mt: 2 }}>
              {editMode ? 'Updating note...' : 'Creating note...'}
            </Typography>
          </Box>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Title"
              name="title"
              value={noteData.title || ''}
              onChange={handleInputChange}
              placeholder="Enter note title"
              variant="outlined"
              size="small"
              disabled={isUploading}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Content"
              name="description"
              value={noteData.description || ''}
              onChange={handleInputChange}
              placeholder="Enter note content"
              variant="outlined"
              multiline
              rows={8}
              disabled={isUploading}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required size="small" disabled={isUploading}>
              <InputLabel id="project-label">Project</InputLabel>
              <Select
                labelId="project-label"
                name="project_id"
                value={noteData.project_id || ''}
                onChange={handleInputChange}
                label="Project"
                disabled={isUploading}
              >
                <MenuItem value="">
                  <em>Select a project</em>
                </MenuItem>
                {projects.map(project => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<AddIcon />}
              sx={{ mb: 1 }}
              disabled={isUploading}
            >
              Attach File
              <input
                type="file"
                hidden
                multiple
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    const newFiles = Array.from(e.target.files);
                    setNoteData(prev => ({ 
                      ...prev, 
                      file: [...(prev.file || []), ...newFiles] 
                    }));
                  }
                }}
                disabled={isUploading}
              />
            </Button>
            
            {/* Display existing file if editing a note with an attached file */}
            {editMode && noteData.existingFile && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2">
                  Attached File: 
                  <a 
                    href={noteData.existingFile.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ marginLeft: '4px', textDecoration: 'underline' }}
                  >
                    {attachedFiles}
                  </a>
                </Typography>
              </Box>
            )}
            
            {noteData.file && noteData.file.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', mt: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2">{noteData.file.map(file => file.name).join(', ')}</Typography>
                  <IconButton 
                    size="small" 
                    onClick={() => setNoteData(prev => ({ ...prev, file: [] }))}
                    disabled={isUploading}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSaveNote}
            disabled={isUploading}
          >
            {editMode ? 'Update Note' : 'Create Note'}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default NoteModal; 