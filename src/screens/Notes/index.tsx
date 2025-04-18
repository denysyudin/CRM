import React, { useState, useEffect, useRef } from 'react';
// Initialize FontAwesome library
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
import { IconButton, Checkbox, TextField, FormControl, InputLabel, Select, MenuItem, Button, Modal, Fab, SelectChangeEvent } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FolderIcon from '@mui/icons-material/Folder';
import NoteIcon from '@mui/icons-material/Note';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import GetAppIcon from '@mui/icons-material/GetApp';
import PersonIcon from '@mui/icons-material/Person';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Client Meeting Notes',
    content: 'Discussed timeline for the new collection. They want to launch by October for the holiday season. Need to prepare preliminary sketches by next week.',
    date: '2023-04-15',
    project: 'project-2',
    category: 'cat-5',
    createdBy: 'user-1',
    hasAttachment: false
  },
  {
    id: 'note-2',
    title: 'Diamond Supplier Research',
    content: 'Contacted three potential suppliers for ethically sourced diamonds. Waiting on quotes from two. The third one (GemEthics) has the best reputation but higher prices.',
    date: '2023-04-12',
    project: 'project-1',
    category: 'cat-2',
    createdBy: 'user-1',
    hasAttachment: true,
    attachments: ['supplier-contact-list.pdf']
  }
];

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Bravo Jewellers',
    categories: [
      { id: 'cat-1', name: 'Store Operations' },
      { id: 'cat-2', name: 'Research' },
      { id: 'cat-3', name: 'Inventory' }
    ]
  },
  {
    id: 'project-2',
    name: 'Bravo Creations',
    categories: [
      { id: 'cat-4', name: 'Designs' },
      { id: 'cat-5', name: 'Client Meetings' },
      { id: 'cat-6', name: 'Production' }
    ]
  }
];

const mockEmployees: Employee[] = [
  { id: 'user-1', name: 'Edward Bravo', avatar: '/assets/avatars/edward.jpg' },
  { id: 'user-2', name: 'Sarah Johnson', avatar: '/assets/avatars/sarah.jpg' }
];

const Notes: React.FC = () => {
  // In the future, this will use the Redux store
  // For now, use local state with mock data until Redux is fully implemented
  const [notes, setNotes] = useState<Note[]>(mockNotes);
  const [projects, setProjects] = useState<Project[]>(mockProjects);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');

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
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [mainSidebarOpen, setMainSidebarOpen] = useState(true);
  const [notesSidebarOpen, setNotesSidebarOpen] = useState(true);
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Effect to handle responsive sidebar
  useEffect(() => {
    if (isMobile) {
      setMainSidebarOpen(false);
      setNotesSidebarOpen(false);
    } else {
      setMainSidebarOpen(true);
      setNotesSidebarOpen(true);
    }
  }, [isMobile]);

  // Toggle project expansion in sidebar
  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

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
      project: '',
      category: '',
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
      setNotes(prev => prev.map(n => n.id === newNote.id ? newNote as Note : n));
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
      setNotes(prev => prev.filter(n => n.id !== selectedNote.id));
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

  // Toggle main sidebar visibility
  const toggleMainSidebar = () => {
    setMainSidebarOpen(!mainSidebarOpen);
  };

  // Toggle notes sidebar visibility
  const toggleNotesSidebar = () => {
    setNotesSidebarOpen(!notesSidebarOpen);
  };

  // Find available categories for selected project
  const getAvailableCategoriesForProject = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.categories : [];
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedProject('');
    setSelectedCategory(null);
    setSelectedEmployee('');
    setSearchTerm('');
  };

  // Helper functions
  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleProjectSelect = (id: string) => {
    setSelectedProject(id === selectedProject ? '' : id);
  };

  const handleEmployeeSelect = (id: string) => {
    setSelectedEmployee(id === selectedEmployee ? '' : id);
  };

  return (
    <div className="dashboard-container">
      <div className={`sidebar-nav ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar />
        <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
          {sidebarCollapsed ? <MenuIcon /> : <ChevronRightIcon />}
        </button>
      </div>
      
      {/* Mobile header for small screens */}
      <div className="mobile-header">
        <button className="sidebar-toggle" onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}>
          <MenuIcon />
        </button>
        <h1>Notes</h1>
        <Button 
          variant="contained" 
          color="primary" 
          size="small" 
          onClick={() => handleOpenModal('add')}
        >
          <AddIcon />
        </Button>
      </div>

      <div className={`notes-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Notes Sidebar (Projects & Employees) */}
        <div className={`notes-sidebar ${!notesSidebarOpen ? 'collapsed' : ''} ${mobileSidebarOpen ? 'mobile-visible' : ''}`}>
          <div className="notes-sidebar-header">
            <h3>Filters</h3>
            <IconButton onClick={toggleNotesSidebar} size="small">
              {notesSidebarOpen ? <ChevronRightIcon /> : <MenuIcon />}
            </IconButton>
          </div>

          {/* Projects section */}
          <div className="sidebar-section">
            <h4 className="sidebar-section-header">
              <FolderIcon className="icon" />
              Projects
            </h4>
            <ul className="filter-list">
              {projects.map((project) => (
                <li key={project.id} className={`project-item ${expandedProjects.includes(project.id) ? 'expanded' : ''}`}>
                  <a 
                    href="#" 
                    className={selectedProject === project.id ? 'active-filter' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      handleProjectSelect(project.id);
                    }}
                  >
                    <FolderIcon className="project-icon" />
                    <span>{project.name}</span>
                    <ChevronRightIcon 
                      className="expand-icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleProjectExpand(project.id);
                      }}
                    />
                  </a>
                  <ul className="subcategory-list">
                    {project.categories.map(category => (
                      <li key={category.id}>
                        <a 
                          href="#" 
                          className={selectedCategory === category.id ? 'active' : ''}
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedCategory(selectedCategory === category.id ? null : category.id);
                          }}
                        >
                          <NoteIcon className="subcategory-icon" />
                          <span>{category.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>

          {/* Employees section */}
          <div className="sidebar-section">
            <h4 className="sidebar-section-header">
              <PersonIcon className="icon" />
              Team Members
            </h4>
            <ul className="filter-list">
              {employees.map((employee) => (
                <li key={employee.id} className="employee-filter-item">
                  <a 
                    href="#" 
                    className={selectedEmployee === employee.id ? 'active' : ''}
                    onClick={(e) => {
                      e.preventDefault();
                      handleEmployeeSelect(employee.id);
                    }}
                  >
                    {employee.avatar ? (
                      <img src={employee.avatar} alt={employee.name} className="avatar-img" />
                    ) : (
                      <div className="user-avatar">
                        {employee.name.charAt(0)}
                      </div>
                    )}
                    <span>{employee.name}</span>
                    {employee.id === 'user-1' && <span className="self-tag">You</span>}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Clear filters button */}
          <div className="filter-actions">
            <button className="clear-filters-button" onClick={clearAllFilters}>
              <ClearIcon />
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Notes List Column */}
        <div className="notes-list-column">
          <div className="notes-list-header">
            <h2 className="notes-list-title">My Notes</h2>
            <button className="new-note-button" onClick={() => handleOpenModal('add')}>
              <AddIcon />
              New Note
            </button>
          </div>
          
          <div className="notes-controls">
            <div className="search-box">
              <SearchIcon className="search-icon" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

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

        {/* Notes Content Area */}
        <div className="notes-content">
          {selectedNote ? (
            <div className="note-view">
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
              </div>
            </div>
          ) : (
            <div className="note-content-placeholder">
              <NoteIcon className="icon" />
              <h3>Select a note to view</h3>
              <p>Choose a note from the list or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB for adding notes */}
      <button className="mobile-toggle" onClick={() => handleOpenModal('add')}>
        <AddIcon />
      </button>

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
              <label>Project <span className="required">*</span></label>
              <select
                name="project"
                value={newNote.project || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  handleInputChange(e);
                  setNewNote(prev => ({ ...prev, category: '' }));
                }}
              >
                <option value="">Select a project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                name="category"
                value={newNote.category || ''}
                onChange={handleInputChange}
              >
                <option value="">Select a category</option>
                {newNote.project &&
                  getAvailableCategoriesForProject(newNote.project).map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Content <span className="required">*</span></label>
              <textarea
                name="content"
                value={newNote.content || ''}
                onChange={handleInputChange}
                rows={6}
                placeholder="Enter note content"
              />
            </div>
            
            <div className="form-group">
              <label>Attachments</label>
              <div className="attachment-placeholder">
                <AttachFileIcon /> Click to add attachments
              </div>
            </div>
            
            <div className="form-actions">
              <button className="form-button button-secondary" onClick={handleCloseModal}>
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
    </div>
  );
};

export default Notes; 