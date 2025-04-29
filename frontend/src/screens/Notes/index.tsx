import React, { useState, useEffect } from 'react';
// Initialize FontAwesome library
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faPlus,
  faFolder,
  faUser,
  faMagnifyingGlass,
  faChevronRight,
  faStickyNote,
  faCalendarAlt,
  faBuilding,
  faPaperclip,
  faPencilAlt,
  faTrashAlt,
  faTimes,
  faBars
} from '@fortawesome/free-solid-svg-icons';
import Sidebar from '../../components/Sidebar/Sidebar';
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
  CircularProgress
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { fetchProjects } from '../../redux/features/projectsSlice';
import { fetchEmployees } from '../../redux/features/employeesSlice';
import { fetchNotes, createNote, updateNote, deleteNote, Note as ReduxNote } from '../../redux/features/notesSlice';
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

// Add the icons to the library
library.add(
  faPlus,
  faFolder,
  faUser,
  faMagnifyingGlass,
  faChevronRight,
  faStickyNote,
  faCalendarAlt,
  faBuilding,
  faPaperclip,
  faPencilAlt,
  faTrashAlt,
  faTimes,
  faBars
);

// Define local interfaces for UI state
interface Note extends ReduxNote {} // Use the Redux Note type

interface Project {
  id: string;
  name: string;
  categories: ProjectCategory[];
}

interface ProjectCategory {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  avatar?: string;
}

const Notes: React.FC = () => {
  const dispatch = useDispatch();
  
  // Get data from Redux store
  const projects = useSelector((state: RootState) => state.projects?.items || []);
  const employees = useSelector((state: RootState) => state.employees?.items || []);
  const notes = useSelector((state: RootState) => state.notes?.items || []);
  const projectsStatus = useSelector((state: RootState) => state.projects?.status);
  const employeesStatus = useSelector((state: RootState) => state.employees?.status);
  const notesStatus = useSelector((state: RootState) => state.notes?.status);
  const projectsError = useSelector((state: RootState) => state.projects?.error);
  const employeesError = useSelector((state: RootState) => state.employees?.error);
  const notesError = useSelector((state: RootState) => state.notes?.error);
  
  const isLoading = projectsStatus === 'loading' || employeesStatus === 'loading' || notesStatus === 'loading';

  // State for currently selected items
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    description: '',
    project_id: '',
    employee_id: '', // Will be set to current user
    created_at: new Date().toISOString(),
    files: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Fetch data from the backend when component mounts
  useEffect(() => {
    dispatch(fetchProjects() as any);
    dispatch(fetchEmployees() as any);
    dispatch(fetchNotes(undefined) as any);
  }, [dispatch]);

  // Set default selections after data is loaded
  useEffect(() => {
    if (projects.length > 0 && selectedProject === "") {
      setSelectedProject(projects[0].id);
    }
    
    if (employees.length > 0 && selectedEmployee === "") {
      // Find the current user (you could have a way to identify the current user)
      const currentUser = employees.find((emp: Employee) => emp.id === 'user-1') || employees[0];
      setSelectedEmployee(currentUser.id);
      
      // Also set the current user as the creator for new notes
      setNewNote(prev => ({
        ...prev,
        createdBy: currentUser.id
      }));
    }
  }, [projects, employees]);

  // Effect to filter notes based on project when project selection changes
  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchNotes(selectedProject) as any);
    } else {
      dispatch(fetchNotes(undefined) as any);
    }
  }, [selectedProject, dispatch]);

  // Filter notes based on selections and search term
  const filteredNotes = notes.filter(note => {
    const matchesProject = selectedProject ? note.project_id === selectedProject : true;
    const matchesCategory = selectedCategory ? note.category === selectedCategory : true;
    const matchesEmployee = selectedEmployee ? note.employee_id === selectedEmployee : true;
    const matchesSearch = searchTerm
      ? note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.description.toLowerCase().includes(searchTerm.toLowerCase())
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
        employee_id: selectedEmployee || '', // Use selected employee as default creator
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
      alert('Please fill in all required fields');
      return;
    }

    try {
      if (editMode && newNote.id) {
        // Update existing note
        await dispatch(updateNote({
          id: newNote.id,
          note: newNote
        }) as any);
        
        if (selectedNote?.id === newNote.id) {
          setSelectedNote(newNote as Note);
        }
      } else {
        // Add new note
        await dispatch(createNote(newNote as Omit<Note, 'id'>) as any);
      }
  
      handleCloseModal();
      // Refresh notes list
      dispatch(fetchNotes(selectedProject || undefined) as any);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  // Handle deleting a note
  const handleDeleteNote = async () => {
    if (selectedNote?.id) {
      try {
        await dispatch(deleteNote(selectedNote.id) as any);
        setSelectedNote(null);
        setDeleteConfirm(false);
        // Refresh notes list
        dispatch(fetchNotes(selectedProject || undefined) as any);
      } catch (error) {
        console.error('Error deleting note:', error);
        alert('Failed to delete note. Please try again.');
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
    const project = projects.find((p: Project) => p.id === id);
    return project ? project.name : '';
  };

  // Find category name by ID
  const getCategoryNameById = (id: string) => {
    for (const project of projects) {
      const category = project.categories.find(c => c.id === id);
      if (category) return category.name;
    }
    return '';
  };

  // Find employee name by ID
  const getEmployeeNameById = (id: string) => {
    const employee = employees.find(e => e.id === id);
    return employee ? employee.name : '';
  };

  // Find available categories for selected project
  const getAvailableCategoriesForProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.categories : [];
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedProject('');
    setSelectedCategory('');
    setSelectedEmployee('');
    setSearchTerm('');
    // Fetch all notes when filters are cleared
    dispatch(fetchNotes(undefined) as any);
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

  // Display loading state
  if (isLoading) {
    return (
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-main-content loading-container">
          <CircularProgress />
          <p>Loading data...</p>
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
              dispatch(fetchProjects() as any);
              dispatch(fetchEmployees() as any);
              dispatch(fetchNotes(undefined) as any);
            }}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={darkTextTheme}>
      <div className="dashboard-container">
        <Sidebar />
        <div className="dashboard-main-content">
          <div className="notes-layout">
            {/* Main Content */}
            <div className="notes-content-wrapper">
              {/* Top Header with Search, Create, and Filters */}
              <div className="notes-header">
                <div className="notes-filters">
                  {/* Project Dropdown */}
                  <FormControl variant="outlined" size="small" className="filter-dropdown">
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
                          <FolderIcon className="menu-icon" /> {project.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {/* Team Members Dropdown */}
                  <FormControl variant="outlined" size="small" className="filter-dropdown">
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
                  <div className="notes-actions">
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
                      className="search-field"
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenModal('add')}
                      className="create-note-btn"
                    >
                      New Note
                    </Button>
                  </div>
                </div>
              </div>

              {/* Notes List */}
              <div className="notes-list-container">
                <div className="notes-list">
                  {filteredNotes.length > 0 ? (
                    filteredNotes.map(note => (
                      <div
                        key={note.id}
                        className={`note-item ${selectedNote?.id === note.id ? 'active' : ''}`}
                        onClick={() => setSelectedNote(note)}
                      >
                        <h3 className="note-item-title">{note.title}</h3>
                        <p>{note.description.substring(0, 100)}...</p>
                        <div className="note-item-meta">
                          <span className="note-item-date">{formatDate(note.created_at)}</span>
                          {note.category && (
                            <span className="note-item-category-tag">
                              {getCategoryNameById(note.category)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="note-item-empty">
                      <NoteIcon />
                      <p>No notes found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Note Modal */}
            <Modal
              open={isModalOpen}
              onClose={handleCloseModal}
            >
              <div className="modal-overlay">
                <div className="modal-container">
                  <div className="modal-header">
                    <h2>{editMode ? 'Edit Note' : 'New Note'}</h2>
                    <button className="close-button" onClick={handleCloseModal}>
                      <CloseIcon />
                    </button>
                  </div>

                  <div className="form-group">
                    <label>Title <span className="required">*</span></label>
                    <input
                      type="text"
                      name="title"
                      value={newNote.title || ''}
                      onChange={handleInputChange}
                      placeholder="Enter note title"
                    />
                  </div>

                  <div className="form-group">
                    <label>Content <span className="required">*</span></label>
                    <textarea
                      name="description"
                      value={newNote.description || ''}
                      onChange={handleInputChange}
                      placeholder="Enter note content"
                      rows={8}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Project <span className="required">*</span></label>
                    <select
                      name="project_id"
                      value={newNote.project_id || ''}
                      onChange={handleInputChange}
                    >
                      <option value="">Select a project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {newNote.project_id && (
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={newNote.category || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a category</option>
                        {getAvailableCategoriesForProject(newNote.project_id).map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-actions">
                    <button
                      className="form-button button-secondary"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button
                      className="form-button button-primary"
                      onClick={handleSaveNote}
                    >
                      {editMode ? 'Update Note' : 'Save Note'}
                    </button>
                  </div>
                </div>
              </div>
            </Modal>

            {/* Note Detail View */}
            {selectedNote && (
              <div className="note-detail-panel">
                <div className="note-view-header">
                  <h2 className="note-view-title">{selectedNote.title}</h2>
                  <div className="note-view-meta">
                    <span><CalendarTodayIcon className="icon" /> {formatDate(selectedNote.created_at)}</span>
                    <span><BusinessIcon className="icon" /> {getProjectNameById(selectedNote.project_id)}</span>
                    {selectedNote.category && (
                      <span className="tag">{getCategoryNameById(selectedNote.category)}</span>
                    )}
                    <span><PersonIcon className="icon" /> {getEmployeeNameById(selectedNote.employee_id)}</span>
                  </div>
                </div>

                <div className="note-view-body">
                  <p>{selectedNote.description}</p>
                </div>

                <div className="note-view-actions">
                  <button
                    className="action-button edit"
                    onClick={() => handleOpenModal('edit')}
                  >
                    <EditIcon /> Edit
                  </button>
                  <button
                    className={`action-button delete ${deleteConfirm ? 'confirm' : ''}`}
                    onClick={deleteConfirm ? handleDeleteNote : () => setDeleteConfirm(true)}
                  >
                    <DeleteIcon /> {deleteConfirm ? 'Confirm Delete' : 'Delete'}
                  </button>
                  <button
                    className="action-button cancel"
                    onClick={() => setSelectedNote(null)}
                  >
                    <CloseIcon /> Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Notes; 