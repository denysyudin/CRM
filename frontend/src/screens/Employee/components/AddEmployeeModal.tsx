import React, { useState } from 'react';
import { Employee } from '../../../types/employee.types';
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
  FormHelperText,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface AddEmployeeModalProps {
  onSave: (employee: Employee) => void;
  onClose: () => void;
  open: boolean;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ onSave, onClose, open }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState(true);
  const [nameError, setNameError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error state
    setNameError('');
    
    if (!name.trim()) {
      setNameError('Employee name is required');
      return;
    }
    
    // Create a proper employee object with the form data
    const employeeData: Employee = {
      name: name.trim(),
      role: role.trim(),
      status: status
    };
    
    onSave(employeeData);
    setName('');
    setRole('');
    setStatus(true);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add New Employee
        <IconButton 
          aria-label="close" 
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="employee-name-input"
            label="Employee Name"
            type="text"
            fullWidth
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={!!nameError}
            helperText={nameError}
            sx={{ mb: 2 }}
          />
          
          <TextField
            margin="dense"
            id="employee-role-input"
            label="Role / Title (Optional)"
            type="text"
            fullWidth
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="e.g., Designer, Marketing Lead"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth required sx={{ mb: 2 }}>
            <InputLabel id="employee-status-label">Status</InputLabel>
            <Select
              labelId="employee-status-label"
              id="employee-status-input"
              value={status ? 'active' : 'inactive'}
              label="Status"
              onChange={(e) => setStatus(e.target.value === 'active')}
            >
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary">
            Save Employee
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEmployeeModal; 