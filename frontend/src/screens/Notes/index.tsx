import React, { useState, useEffect } from 'react';
// Import only React Icons that are actually used
import { useGetNotesQuery, useUpdateNoteMutation, useCreateNoteMutation, useDeleteNoteMutation } from '../../redux/api/notesApi';
import { useGetProjectsQuery } from '../../redux/api/projectsApi';
import { useGetEmployeesQuery } from '../../redux/api/employeesApi';
import { Note } from '../../types/note.types';
import './styles.css';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Modal,
  InputAdornment,
  Box,
  Typography,
  IconButton,
  Divider,
  Paper,
  Grid,
  Chip,
  Snackbar,
  Alert,
  AlertColor,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Container,
  Link,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import NoteIcon from '@mui/icons-material/Note';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import BusinessIcon from '@mui/icons-material/Business';
import { NoteModal } from '../../components/forms';

const Notes: React.FC = () => {
  // Get data from RTK Query
  const { data: notes = [], isLoading: notesLoading, isError: notesError } = useGetNotesQuery();
  console.log('notes', notes);
  const { data: projects = [], isLoading: projectsLoading, isError: projectsError } = useGetProjectsQuery();
  const { data: employees = [], isLoading: employeesLoading, isError: employeesError } = useGetEmployeesQuery();

  // RTK Query mutation hooks with loading states
  const [updateNoteMutation, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const [createNoteMutation, { isLoading: isCreating }] = useCreateNoteMutation();
  const [deleteNoteMutation, { isLoading: isDeleting }] = useDeleteNoteMutation();

  // Combined loading state for data fetching
  const isLoading = notesLoading || projectsLoading || employeesLoading;
  
  // State for currently selected items
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  // const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor
  });

  // Upload progress state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    description: '',
    project_id: '',
    employee_id: '',
    created_at: new Date().toISOString(),
  });
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  
  // Combined loading state for CRUD operations
  const isCrudOperation = isUpdating || isCreating || isDeleting || isUploading;

  // Show notification helper
  const showNotification = (message: string, severity: AlertColor = 'success') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  // Close notification handler
  const handleCloseNotification = (_?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  // Fetch data from the backend when component mounts
  useEffect(() => {
    // Removed previous get call that was causing an error
  }, [deleteConfirmModalOpen]);

  // Filter notes based on selections and search term
  const filteredNotes = notes.filter((note: Note) => {
    const matchesProject = selectedProject ? note.project_id === selectedProject : true;
    // const matchesCategory = selectedCategory ? note.category === selectedCategory : true;
    const matchesEmployee = selectedEmployee ? note.employee_id === selectedEmployee : true;
    const matchesSearch = searchTerm
      ? note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      : true;

    return matchesProject && matchesEmployee && matchesSearch;
  });

  // Handle opening the modal for creating or editing a note
  const handleOpenModal = (mode: 'add' | 'edit', noteToEdit?: Note) => {
    if (mode === 'edit' && noteToEdit) {
      // Create a copy of the note to edit
      const noteWithFiles = { ...noteToEdit };

      // If the note has a file_url, create a temporary file representation
      if (noteToEdit.file_url) {
        // Extract the filename from the URL
        const fileName = noteToEdit.file_url.split('/').pop() || 'attached-file';

        // Create a placeholder for the existing file to display in UI
        noteWithFiles.existingFile = {
          name: fileName,
          url: noteToEdit.file_url
        };
      }

      setNewNote(noteWithFiles);
      setEditMode(true);
    } else {
      // For new notes, start with a clean slate
      setNewNote({
        title: 'New Note',
        description: '',
        project_id: selectedProject,
        employee_id: selectedEmployee,
        created_at: new Date().toISOString(),
      });
      setEditMode(false);
    }
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    // Don't close the modal if an operation is in progress
    if (isCrudOperation) {
      return;
    }
    
    setIsModalOpen(false);
    // Reset form state completely
    setNewNote({
      title: 'New Note',
      description: '',
      project_id: '',
      employee_id: '',
      created_at: new Date().toISOString(),
      existingFile: undefined
    });
    setEditMode(false);
    setDeleteConfirmModalOpen(false);
    setNoteToDelete(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  // Handle saving a new or edited note
  const handleSaveNote = async (noteData: Note) => {
    console.log('noteData', noteData);
    if (!noteData.title || !noteData.description || !noteData.project_id) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    
    // Set uploading state to true at the beginning of the operation
    setIsUploading(true);
    
    try {
      let response;
      // Create FormData for both scenarios (with or without files)
      const formData = new FormData();

      // Add basic note data to FormData
      formData.append('title', noteData.title);
      formData.append('description', noteData.description || '');
      formData.append('project_id', noteData.project_id || '');
      formData.append('employee_id', noteData.employee_id || '');
      formData.append('created_at', noteData.created_at || new Date().toISOString());
      
      // Check if files are present and add them to FormData
      if (noteData.file && noteData.file.length > 0) {
        // Get the first file to upload (API currently supports single file)
        const fileToUpload = noteData.file[0];
        formData.append('file', fileToUpload); // Use 'file' as the backend expects
      }

      if (editMode && noteData.id) {
        // Update existing note with FormData
        response = await updateNoteMutation({
          ...noteData,
          id: noteData.id,
        }).unwrap();

        // Check status code for update operation
        if (response) {
          if (selectedNote?.id === noteData.id) {
            setSelectedNote(response as Note);
          }
          showNotification('Note updated successfully');
          handleCloseModal();
        } else {
          showNotification('Failed to update note. Server returned an unexpected status code.', 'error');
        }
      } else {
        // Add new note with FormData
        response = await createNoteMutation(formData).unwrap();

        // Check status code for create operation
        if (response  ) {
          showNotification('Note created successfully');
          handleCloseModal();
        } else {
          showNotification('Failed to create note. Server returned an unexpected status code.', 'error');
        }
      }
    } catch (error) {
      console.error('Error saving note:', error);
      if (editMode) {
        console.error('Failed to update note with ID:', noteData.id);
      }
      showNotification('Failed to save note. Please try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async () => {
    if (noteToDelete?.id) {
      // Set uploading state to true at the beginning of the delete operation
      setIsUploading(true);
      
      try {
        const response = await deleteNoteMutation(noteToDelete.id).unwrap();
        
        // Check status code for delete operation
        if (response) {
          if (selectedNote?.id === noteToDelete.id) {
            setSelectedNote(null);
          }
          setDeleteConfirmModalOpen(false);
          setNoteToDelete(null);
          showNotification('Note deleted successfully');
        } else {
          showNotification('Failed to delete note. Server returned an unexpected status code.', 'error');
        }
      } catch (error) {
        console.error('Error deleting note:', error);
        showNotification('Failed to delete note. Please try again.', 'error');
      } finally {
        // Always set uploading state to false when operation completes
        setIsUploading(false);
      }
    }
  };

  // Handle input changes for the note form
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | SelectChangeEvent<string>) => {
  //   const { name, value } = e.target;
  //   setNewNote(prev => ({ ...prev, [name]: value }));
  // };

  // Find project name by ID
  const getProjectNameById = (id: string) => {
    const project = projects.find((p) => p.id === id);
    return project ? project.title : '';
  };

  // Find category name by ID
  const getCategoryNameById = (id: string) => {
    for (const project of projects) { 
      // Using type assertion to access categories since it's not defined in the type
      const category = (project as any).categories?.find((c: any) => c.id === id);
      if (category) return category.name;
    }
    return '';
  };

  // Find employee name by ID
  const getEmployeeNameById = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? employee.name : '';
  };

  // Helper functions
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Modal style
  const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
  };

  // Display loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <CircularProgress size={60} sx={{ mb: 2 }}/>
        <Typography variant="h6">Loading notes...</Typography>
      </Box>
    );
  }

  // Display error state
  if (projectsError || employeesError || notesError) {
    return (
      <Box className="dashboard-container">
        <Box className="dashboard-main-content error-container">
          <Typography>Error loading data. Please try again.</Typography>
          <Button
            variant="contained"
            onClick={() => {
              // Refresh page to retry loading data
              window.location.reload();
            }}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', padding: 2 }}>
        <Grid container spacing={2} width="100%">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex' }}>
              <Typography variant="h5" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
                <NoteIcon sx={{ mr: 1 }} /> Notes
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="project-select-label" shrink={true}>Project</InputLabel>
                  <Select
                    labelId="project-select-label"
                    id="project-select"
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    label="Project"
                    displayEmpty
                    renderValue={(value) => {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <FolderIcon style={{ marginRight: '8px' }} />
                          {value === "" ? "All Projects" : getProjectNameById(value as string)}
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value="">
                      <FolderIcon style={{ marginRight: '8px' }} /> All Projects
                    </MenuItem>
                    {projects.map((project) => (
                      <MenuItem key={project.id} value={project.id}>
                        <FolderIcon className="menu-icon" /> {project.title}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl variant="outlined" size="small" fullWidth>
                  <InputLabel id="employee-select-label" shrink={true}>Team Member</InputLabel>
                  <Select
                    labelId="employee-select-label"
                    id="employee-select"
                    value={selectedEmployee}
                    onChange={(e) => setSelectedEmployee(e.target.value)}
                    label="Team Member"
                    displayEmpty
                    renderValue={(value) => {
                      return (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <PersonIcon style={{ marginRight: '8px' }} />
                          {value === "" ? "All Members" : getEmployeeNameById(value as string)}
                        </Box>
                      );
                    }}
                  >
                    <MenuItem value="">
                      <PersonIcon style={{ marginRight: '8px' }} /> All Members
                    </MenuItem>
                    {employees.map((employee) => (
                      <MenuItem key={employee.id} value={employee.id}>
                        <PersonIcon className="menu-icon" /> {employee.name}
                        {employee.id === 'user-1' && <Typography variant="caption" className="self-tag"> (You)</Typography>}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12} md={4}>
            <Grid container spacing={2} alignItems="right">
              <Grid item xs={8}>
                <TextField
                  placeholder="Search notes..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenModal('add')}
                  fullWidth
                >
                  New
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>

      {/* Notes Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', padding: 2 }}>
        {filteredNotes.length > 0 ? (
          <Box sx={{ mt: 2, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <List>
              {filteredNotes.map(note => (
                <React.Fragment key={note.id}>
                <ListItem
                  sx={{
                    borderLeft: 3,
                    borderColor: 'primary.main',
                    backgroundColor: 'background.paper',
                    mb: 1,
                    cursor: 'pointer',
                  }}
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenModal('edit', note);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNoteToDelete(note);
                          setDeleteConfirmModalOpen(true);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                  onClick={() => {
                    setSelectedNote(note);
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography
                        variant="subtitle1"
                        component="div"
                        sx={{ fontWeight: 500 }}
                      >
                        {note.title}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" component="span">
                          {note.description?.substring(0, 120) || ''}
                          {note.description && note.description.length > 120 ? '...' : ''}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
                          <Chip
                            size="small"
                            icon={<CalendarTodayIcon fontSize="small" />}
                            label={formatDate(note.created_at)}
                            variant="outlined"
                          />

                          {note.project_id && (
                            <Chip
                              size="small"
                              icon={<FolderIcon />}
                              label={getProjectNameById(note.project_id)}
                              variant="outlined"
                            />
                          )}

                          {note.category && (
                            <Chip
                              size="small"
                              color="primary"
                              label={getCategoryNameById(note.category)}
                            />
                          )}

                          {note.employee_id && (
                            <Chip
                              size="small"
                              icon={<PersonIcon />}
                              label={getEmployeeNameById(note.employee_id)}
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </Box>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <NoteIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
            <Typography color="text.secondary">No notes found</Typography>
          </Box>
        )}
      </Box>

        {/* Note Modal */}
        <NoteModal
          open={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveNote}
          editMode={editMode}
          initialData={newNote as Note}
          projects={projects}
          isUploading={isCrudOperation}
          uploadProgress={uploadProgress}
        />

        {/* Note Detail View */}
        {selectedNote && (
          <Paper className="note-detail-panel" elevation={2} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <IconButton
                sx={{ position: 'absolute', top: -10, right: -10 }}
                onClick={() => setSelectedNote(null)}
              >
                <CloseIcon />
              </IconButton>
              <Typography variant="h5" gutterBottom>
                {selectedNote.title}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">{formatDate(selectedNote.created_at)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BusinessIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">{getProjectNameById(selectedNote.project_id || '')}</Typography>
                </Box>

                {selectedNote.category && (
                  <Chip
                    size="small"
                    label={getCategoryNameById(selectedNote.category)}
                    color="primary"
                  />
                )}

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon fontSize="small" sx={{ mr: 0.5 }} />
                  <Typography variant="body2">{getEmployeeNameById(selectedNote.employee_id || '')}</Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap'}}>
              {selectedNote.description}
            </Typography>

            {/* Display attached file if any */}
            {selectedNote.file_url && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
                  Attached File:
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <NoteIcon fontSize="small" sx={{ mr: 1 }} />
                  <Link
                    href={selectedNote.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textDecoration: 'underline' }}
                  >
                    {selectedNote.file_url.split('/').pop() || 'Download File'}
                  </Link>
                </Box>
              </Box>
            )}
          </Paper>
        )}

        {/* Notification Snackbar */}
        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={handleCloseNotification}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseNotification}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>

        {/* Delete Confirmation Modal */}
        <Modal
          open={deleteConfirmModalOpen}
          onClose={isCrudOperation ? undefined : () => setDeleteConfirmModalOpen(false)}
        >
          <Box sx={{
            ...modalStyle,
            width: 800,
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">Confirm Delete</Typography>
              <IconButton onClick={() => setDeleteConfirmModalOpen(false)} size="small" disabled={isCrudOperation}>
                <CloseIcon />
              </IconButton>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3 }}>
              Are you sure you want to delete this note? This action cannot be undone.
            </Typography>
            
            {isCrudOperation && (
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
                  Deleting note...
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => setDeleteConfirmModalOpen(false)}
                disabled={isCrudOperation}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={handleDeleteNote}
                disabled={isCrudOperation}
              >
                Delete
              </Button>
            </Box>
          </Box>
        </Modal>
    </Container>
  );
};

export default Notes; 