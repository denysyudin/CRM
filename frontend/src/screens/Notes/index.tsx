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
  ThemeProvider
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

// Define local interfaces until Redux is fully set up
interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  project: string;
  category?: string;
  createdBy: string;
  hasAttachment?: boolean;
  attachments?: string[];
}

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

// Mock data for development until Redux is fully implemented
const mockNotes: Note[] = [];

const mockProjects: Project[] = [];

const mockEmployees: Employee[] = [];

const Notes: React.FC = () => {
  // Create mock data
  const employees = mockEmployees;
  const projects = mockProjects;
  const [notes, setNotes] = useState<Note[]>(mockNotes);

  // State for currently selected items
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>(mockProjects.length > 0 ? mockProjects[0].id : "");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>(mockEmployees.length > 0 ? mockEmployees[0].id : "");

  // Local UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newNote, setNewNote] = useState<Partial<Note>>({
    title: '',
    content: '',
    project: '',
    category: '',
    createdBy: 'user-1', // Default to current user
    date: new Date().toISOString().split('T')[0],
    hasAttachment: false
  });
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Effect to filter notes based on default selections when component mounts
  useEffect(() => {
    // This ensures the filtered notes are updated with default selections on mount
    const defaultFiltered = notes.filter(note => {
      return note.project === selectedProject && note.createdBy === selectedEmployee;
    });
    
    // If we don't have any notes matching our default filters, clear the filters
    if (defaultFiltered.length === 0) {
      clearAllFilters();
    }
  }, []);

  // Filter notes based on selections and search term
  const filteredNotes = notes.filter(note => {
    const matchesProject = selectedProject ? note.project === selectedProject : true;
    const matchesCategory = selectedCategory ? note.category === selectedCategory : true;
    const matchesEmployee = selectedEmployee ? note.createdBy === selectedEmployee : true;
    const matchesSearch = searchTerm
      ? note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
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
        content: '',
        project: selectedProject || '',
        category: selectedCategory || '',
        createdBy: 'user-1', // Default to current user
        date: new Date().toISOString().split('T')[0],
        hasAttachment: false
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
      content: '',
      project: selectedProject || '',
      category: selectedCategory || '',
      createdBy: 'user-1',
      date: new Date().toISOString().split('T')[0],
      hasAttachment: false
    });
    setEditMode(false);
    setDeleteConfirm(false);
  };

  // Handle saving a new or edited note
  const handleSaveNote = () => {
    if (!newNote.title || !newNote.content || !newNote.project) {
      alert('Please fill in all required fields');
      return;
    }

    if (editMode && newNote.id) {
      // Update existing note
      setNotes(prev => prev.map((n: Note) => n.id === newNote.id ? newNote as Note : n));
      if (selectedNote?.id === newNote.id) {
        setSelectedNote(newNote as Note);
      }
    } else {
      // Add new note
      const noteWithId = {
        ...newNote,
        id: `note-${Date.now()}`
      } as Note;
      setNotes(prev => [...prev, noteWithId]);
    }

    handleCloseModal();
  };

  // Handle deleting a note
  const handleDeleteNote = () => {
    if (selectedNote?.id) {
      setNotes(prev => prev.filter((n: Note) => n.id !== selectedNote.id));
      setSelectedNote(null);
      setDeleteConfirm(false);
    }
  };

  // Handle input changes for the note form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setNewNote(prev => ({ ...prev, [name]: value }));
  };

  // Find project name by ID
  const getProjectNameById = (id: string) => {
    const project = projects.find(p => p.id === id);
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
                        <p>{note.content.substring(0, 100)}...</p>
                        <div className="note-item-meta">
                          <span className="note-item-date">{formatDate(note.date)}</span>
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
                      name="content"
                      value={newNote.content || ''}
                      onChange={handleInputChange}
                      placeholder="Enter note content"
                      rows={8}
                    ></textarea>
                  </div>

                  <div className="form-group">
                    <label>Project <span className="required">*</span></label>
                    <select
                      name="project"
                      value={newNote.project || ''}
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

                  {newNote.project && (
                    <div className="form-group">
                      <label>Category</label>
                      <select
                        name="category"
                        value={newNote.category || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Select a category</option>
                        {getAvailableCategoriesForProject(newNote.project).map(category => (
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
                    <span><CalendarTodayIcon className="icon" /> {formatDate(selectedNote.date)}</span>
                    <span><BusinessIcon className="icon" /> {getProjectNameById(selectedNote.project)}</span>
                    {selectedNote.category && (
                      <span className="tag">{getCategoryNameById(selectedNote.category)}</span>
                    )}
                    <span><PersonIcon className="icon" /> {getEmployeeNameById(selectedNote.createdBy)}</span>
                  </div>
                </div>

                <div className="note-view-body">
                  <p>{selectedNote.content}</p>
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
                    onClick={handleDeleteNote}
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