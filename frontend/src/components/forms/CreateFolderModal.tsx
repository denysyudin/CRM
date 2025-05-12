import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress
} from '@mui/material';

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  onFolderCreated: (folderName: string) => void;
  isLoading: boolean;
}

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
  open,
  onClose,
  onFolderCreated,
  isLoading
}) => {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  const handleCreateFolder = () => {
    if (!folderName.trim()) {
      setError('Folder name cannot be empty');
      return;
    }
    setError('');
    onFolderCreated(folderName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && folderName.trim()) {
      handleCreateFolder();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={isLoading ? undefined : onClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={isLoading}
    >
      <DialogTitle>Create New Folder</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            autoFocus
            label="Folder Name"
            fullWidth
            value={folderName}
            onChange={(e) => {
              setFolderName(e.target.value);
              if (e.target.value.trim()) setError('');
            }}
            onKeyPress={handleKeyPress}
            error={!!error}
            helperText={error}
            required
            disabled={isLoading}
          />

        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>Cancel</Button>
        <Button 
          onClick={handleCreateFolder} 
          variant="contained" 
          disabled={isLoading || !folderName.trim()}
          startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isLoading ? 'Creating...' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateFolderModal; 