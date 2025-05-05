import React from 'react';
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
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material';
import { Close, DeleteOutline } from '@mui/icons-material';

// Event form data interface
export interface EventFormData {
  id?: string;
  title: string;
  date: string;
  hours?: string;
  minutes?: string;
  type: string;
  participants?: string;
  notes?: string;
  project_id?: string;
  employee_id?: string;
  description?: string;
}

interface EventModalProps {
  open: boolean;
  onClose: () => void;
  eventFormData: EventFormData;
  isEditing: boolean;
  formError: string | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (e: SelectChangeEvent) => void;
  onSubmit: (e: React.FormEvent) => void;
  onDelete: (id: string) => void;
}

const EventModal: React.FC<EventModalProps> = ({
  open,
  onClose,
  eventFormData,
  isEditing,
  formError,
  isCreating,
  isUpdating,
  isDeleting,
  onFormChange,
  onSelectChange,
  onSubmit,
  onDelete
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {isEditing ? 'Edit Event' : 'Add New Event'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={onSubmit}>
        <DialogContent dividers>
          {formError && (
            <Typography color="error" paragraph>
              {formError}
            </Typography>
          )}

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Name"
                name="title"
                value={eventFormData.title}
                onChange={onFormChange}
                required
                margin="normal"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                name="date"
                value={eventFormData.date}
                onChange={onFormChange}
                required
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box display="flex" alignItems="center" gap={1} mt={2}>
                <FormControl sx={{ flex: 1 }}>
                  <InputLabel id="hours-label">Hours</InputLabel>
                  <Select
                    labelId="hours-label"
                    label="Hours"
                    name="hours"
                    value={eventFormData.hours || '00'}
                    onChange={onSelectChange}
                  >
                    {[...Array(24)].map((_, i) => (
                      <MenuItem key={i} value={String(i).padStart(2, '0')}>
                        {String(i).padStart(2, '0')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Typography variant="h5">:</Typography>

                <FormControl sx={{ flex: 1 }}>
                  <InputLabel id="minutes-label">Minutes</InputLabel>
                  <Select
                    labelId="minutes-label"
                    label="Minutes"
                    name="minutes"
                    value={eventFormData.minutes || '00'}
                    onChange={onSelectChange}
                  >
                    {[...Array(60)].map((_, i) => (
                      <MenuItem key={i} value={String(i).padStart(2, '0')}>
                        {String(i).padStart(2, '0')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="event-type-label">Type</InputLabel>
                <Select
                  labelId="event-type-label"
                  label="Type"
                  name="type"
                  value={eventFormData.type}
                  onChange={onSelectChange}
                >
                  <MenuItem value="meeting">Meeting</MenuItem>
                  <MenuItem value="deadline">Deadline</MenuItem>
                  <MenuItem value="appointment">Appointment</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Participants (Optional)"
                name="participants"
                value={eventFormData.participants || ''}
                onChange={onFormChange}
                placeholder="Comma-separated list of participants"
                margin="normal"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                name="description"
                value={eventFormData.description || ''}
                onChange={onFormChange}
                multiline
                rows={4}
                margin="normal"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isCreating || isUpdating}
          >
            {isEditing ?
              (isUpdating ? 'Updating...' : 'Update Event') :
              (isCreating ? 'Creating...' : 'Create Event')}
          </Button>

          {isEditing && eventFormData.id && (
            <Button
              color="error"
              startIcon={<DeleteOutline />}
              disabled={isDeleting}
              onClick={() => onDelete(eventFormData.id!)}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventModal; 