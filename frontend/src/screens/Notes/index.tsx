import React, { useState, useEffect } from 'react';
// Import only React Icons that are actually used
import Sidebar from '../../components/Sidebar/Sidebar';
import { useGetNotesQuery, useUpdateNoteMutation, useCreateNoteMutation, useDeleteNoteMutation } from '../../redux/api/notesApi';
import { useGetProjectsQuery  } from '../../redux/api/projectsApi';
import { useGetEmployeesQuery } from '../../redux/api/employeesApi';
import './styles.css';
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Modal,
  SelectChangeEvent,
  InputAdornment,
  createTheme,
  ThemeProvider,
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
  ListItemIcon,
} from '@mui/material';
import { Note } from '../../types/note.types';
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

const Notes: React.FC = () => {
  // Get data from RTK Query
  const {data: notes = [], isLoading: notesLoading, isError: notesError} = useGetNotesQuery();
  const {data: projects = [], isLoading: projectsLoading, isError: projectsError} = useGetProjectsQuery();
  const {data: employees = [], isLoading: employeesLoading, isError: employeesError} = useGetEmployeesQuery();
  
  // RTK Query mutation hooks
  const [updateNoteMutation] = useUpdateNoteMutation();
  const [createNoteMutation] = useCreateNoteMutation();
  const [deleteNoteMutation] = useDeleteNoteMutation();
  
  const isLoading = notesLoading || projectsLoading || employeesLoading;

  // State for currently selected items
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  // Notification state
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success' as AlertColor
  });

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
    files: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

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
    setNotification({...notification, open: false});
  };

  // Fetch data from the backend when component mounts
  useEffect(() => {
    // Removed previous get call that was causing an error
  }, [deleteConfirm]);

  // Filter notes based on selections and search term
  const filteredNotes = notes.filter((note: Note) => {
    const matchesProject = selectedProject ? note.project_id === selectedProject : true;
    const matchesCategory = selectedCategory ? note.category === selectedCategory : true;
    const matchesEmployee = selectedEmployee ? note.employee_id === selectedEmployee : true;
    const matchesSearch = searchTerm
      ? note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      : true;

    return matchesProject && matchesCategory && matchesEmployee && matchesSearch;
  });

  // Handle opening the modal for creating or editing a note
  const handleOpenModal = (mode: 'add' | 'edit') => {
    if (mode === 'edit' && selectedNote) {
      setNewNote({ ...selectedNote });
      setEditMode(true);
    } else {
      setNewNote({
        title: '',
        description: '',
        project_id: selectedProject || '',
        category: selectedCategory || '',
        employee_id: selectedEmployee || '',
        created_at: new Date().toISOString(),
        files: ''
      });
      setEditMode(false);
    }
    setIsModalOpen(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewNote({
      title: '',
      description: '',
      project_id: selectedProject || '',
      category: selectedCategory || '',
      employee_id: selectedEmployee || '',
      created_at: new Date().toISOString(),
      files: ''
    });
    setEditMode(false);
    setDeleteConfirm(false);
  };

  // Handle saving a new or edited note
  const handleSaveNote = async () => {
    if (!newNote.title || !newNote.description || !newNote.project_id) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    try {
      if (editMode && newNote.id) {
        // Update existing note
        await updateNoteMutation({
          id: newNote.id,
          ...newNote
        });
        
        if (selectedNote?.id === newNote.id) {
          setSelectedNote(newNote as Note);
        }
        showNotification('Note updated successfully');
      } else {
        // Add new note
        const noteData = {
          title: newNote.title || '',
          description: newNote.description || '',
          project_id: newNote.project_id || '',
          category: newNote.category,
          employee_id: newNote.employee_id || '',
          created_at: newNote.created_at || new Date().toISOString(),
          files: newNote.files
        };
        await createNoteMutation(noteData);
        showNotification('Note created successfully');
      }
  
      handleCloseModal();
    } catch (error) {
      console.error('Error saving note:', error);
      showNotification('Failed to save note. Please try again.', 'error');
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async () => {
    if (selectedNote?.id) {
      try {
        await deleteNoteMutation(selectedNote.id);
        setSelectedNote(null);
        setDeleteConfirm(false);
        showNotification('Note deleted successfully');
      } catch (error) {
        console.error('Error deleting note:', error);
        showNotification('Failed to delete note. Please try again.', 'error');
      }
    }
  };

  // Handle input changes for the note form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewNote(prev => ({ ...prev, [name]: value }));
  };

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

  // Create a theme with black text
  const darkTextTheme = createTheme({
    palette: {
      text: {
        primary: '#000000',
        secondary: '#000000',
      },
    },
    components: {
      MuiInputLabel: {
        styleOverrides: {
          root: {
            color: 'black',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          input: {
            color: 'black',
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          select: {
            color: 'black',
          },
        },
      },
    },
  });

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
      <div className="dashboard-container">
        <div className='sidebar'>
          <Sidebar />
        </div>
        <div className="dashboard-main-content loading-container">
          <CircularProgress size={60} />
          <p style={{ marginTop: '16px', fontSize: '18px' }}>Loading Notes...</p>
        </div>
      </div>
    );
  }

  // Display error state
  if (projectsError || employeesError || notesError) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-main-content error-container">
          <p>Error loading data. Please try again.</p>
          <Button 
            variant="contained" 
            onClick={() => {
              // Refresh page to retry loading data
              window.location.reload();
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
      <div className="app-container">
        <div className='sidebar'>
          <Sidebar />
        </div>
        <div className="dashboard-main-content">
          <div className="notes-layout">
            {/* Main Content */}
            <div className="notes-content-wrapper">
              {/* Top Header with Search, Create, and Filters */}
              <Grid container spacing={1} className="notes-header">
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
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <FolderIcon style={{ marginRight: '8px' }} />
                                {value === "" ? "All Projects" : getProjectNameById(value as string)}
                              </div>
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
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon style={{ marginRight: '8px' }} />
                                {value === "" ? "All Members" : getEmployeeNameById(value as string)}
                              </div>
                            );
                          }}
                        >
                          <MenuItem value="">
                            <PersonIcon style={{ marginRight: '8px' }} /> All Members
                          </MenuItem>
                          {employees.map((employee) => (
                            <MenuItem key={employee.id} value={employee.id}>
                              <PersonIcon className="menu-icon" /> {employee.name}
                              {employee.id === 'user-1' && <span className="self-tag"> (You)</span>}
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

              {/* Notes List */}
              <div className="notes-list-container">
                <div className="notes-list">
                  {filteredNotes.length > 0 ? (
                    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                      {filteredNotes.map(note => (
                        <React.Fragment key={note.id}>
                          <ListItem
                            sx={{
                              borderLeft: 3,
                              borderColor: 'primary.main',
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
                                    setSelectedNote(note);
                                    handleOpenModal('edit');
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  edge="end" 
                                  aria-label="delete"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNote(note);
                                    setDeleteConfirm(true);
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
                  ) : (
                    <Box sx={{ textAlign: 'center', mt: 4 }}>
                      <NoteIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5 }} />
                      <Typography color="text.secondary">No notes found</Typography>
                    </Box>
                  )}
                </div>
              </div>
            </div>

            {/* Note Modal */}
            <Modal
              open={isModalOpen}
              onClose={handleCloseModal}
            >
              <Box sx={modalStyle}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">{editMode ? 'Edit Note' : 'New Note'}</Typography>
                  <IconButton onClick={handleCloseModal} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>
                
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Title"
                      name="title"
                      value={newNote.title || ''}
                      onChange={handleInputChange}
                      placeholder="Enter note title"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Content"
                      name="description"
                      value={newNote.description || ''}
                      onChange={handleInputChange}
                      placeholder="Enter note content"
                      variant="outlined"
                      multiline
                      rows={8}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth required size="small">
                      <InputLabel id="project-label">Project</InputLabel>
                      <Select
                        labelId="project-label"
                        name="project_id"
                        value={newNote.project_id || ''}
                        onChange={handleInputChange}
                        label="Project"
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
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 1 }}>
                  <Button
                    variant="outlined"
                    onClick={handleCloseModal}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveNote}
                  >
                    {editMode ? 'Update Note' : 'Save Note'}
                  </Button>
                </Box>
              </Box>
            </Modal>

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
                
                <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
                  {selectedNote.description}
                </Typography>
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
          </div>
        </div>
      </div>
  );
};

export default Notes; 