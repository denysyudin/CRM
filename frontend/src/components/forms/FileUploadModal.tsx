import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Box,
  IconButton,
  SelectChangeEvent,
  FormHelperText,
  CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

interface Project {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
}

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (fileData: FormData) => void;
  projects: Project[];
  employees: Employee[];
  isLoading?: boolean;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  open,
  onClose,
  onUpload,
  projects,
  employees,
  isLoading = false
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [projectId, setProjectId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleProjectChange = (event: SelectChangeEvent) => {
    setProjectId(event.target.value);
  };

  const handleEmployeeChange = (event: SelectChangeEvent) => {
    setEmployeeId(event.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedFiles.length === 0) {
      setError('Please select at least one file to upload');
      return;
    }
    
    const formData = new FormData();
    
    // Append all selected files
    selectedFiles.forEach(file => {
      formData.append('file', file);
    });
    
    // Append other form data
    if (projectId) formData.append('project_id', projectId);
    if (category) formData.append('category', category);
    if (employeeId) formData.append('employee_id', employeeId);
    if (description) formData.append('description', description);

    setError('');
    onUpload(formData);
  };

  return (
    <Dialog
      open={open}
      onClose={isLoading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle>
        Upload New File
        {!isLoading && (
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Select File
            </Typography>
            <Box
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: isLoading ? 'default' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                '&:hover': {
                  borderColor: isLoading ? '#ccc' : (theme) => theme.palette.primary.main,
                },
                bgcolor: 'background.paper'
              }}
              onClick={isLoading ? undefined : handleOpenFileDialog}
              onDragOver={isLoading ? undefined : handleDragOver}
              onDrop={isLoading ? undefined : handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                multiple
                disabled={isLoading}
              />
              {isLoading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 1 }}>
                  <CircularProgress sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    Uploading file{selectedFiles.length > 1 ? 's' : ''}...
                  </Typography>
                </Box>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="body1">
                    Drag & drop file here, or click to browse
                  </Typography>
                </>
              )}
              
              {selectedFiles.length > 0 && (
                <Box sx={{ mt: 2, textAlign: 'left' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                    Selected Files:
                  </Typography>
                  {selectedFiles.map((file, index) => (
                    <Typography key={index} variant="body2">
                      {file.name}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }} disabled={isLoading}>
            <InputLabel id="project-select-label">Assign to Project/Business (Optional)</InputLabel>
            <Select
              labelId="project-select-label"
              id="project-select"
              value={projectId}
              label="Assign to Project/Business (Optional)"
              onChange={handleProjectChange}
            >
              <MenuItem value="">-- Select Project --</MenuItem>
              {projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            id="category-input"
            label="Sub-category/Folder (Optional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g., Receipts, Jewelry Photos, Contracts"
            sx={{ mb: 2 }}
            disabled={isLoading}
          />

          <FormControl fullWidth sx={{ mb: 2 }} disabled={isLoading}>
            <InputLabel id="employee-select-label">Assign to Employee (Optional)</InputLabel>
            <Select
              labelId="employee-select-label"
              id="employee-select"
              value={employeeId}
              label="Assign to Employee (Optional)"
              onChange={handleEmployeeChange}
            >
              <MenuItem value="">-- Select Employee --</MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            id="description-input"
            label="Description / Tags (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a short description or tags..."
            multiline
            rows={2}
            sx={{ mb: 1 }}
            disabled={isLoading}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            type="submit"
            disabled={isLoading || selectedFiles.length === 0}
            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default FileUploadModal; 