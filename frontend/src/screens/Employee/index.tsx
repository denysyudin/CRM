import React, { useState, useEffect } from 'react';
import EmployeeDetails from './components/EmployeeDetails';
import AddEmployeeModal from './components/AddEmployeeModal';
import AssignTaskModal from './components/AssignTaskModal';
import AddNoteModal from './components/AddNoteModal';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchTasks 
} from '../../redux/features/tasksSlice';
import { 
  fetchNotes 
} from '../../redux/features/notesSlice';
import { 
  fetchReminders,
  selectAllReminders 
} from '../../redux/features/remindersSlice';
import { AppDispatch, RootState } from '../../redux/store';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import './styles.css';

// Define types
interface Employee {
  id: string;
  name: string;
  role: string;
}

interface Task {
  id: string;
  name: string;
  status: string;
  priority: string;
  dueDate: string;
  assigneeId: string;
  projectId: string;
  checkInDate: string | null;
  completionDate: string | null;
  notes: string;
}

interface Note {
  id: string;
  title: string;
  date: string;
  category: string;
  project: string;
  employeeId: string;
  body: string;
}

interface Reminder {
  id: string;
  name: string;
  dueDate: string;
  priority: string;
  completed?: boolean;
  projectId?: string;
}

interface EmployeesRecord {
  [id: string]: Employee;
}

// Mock data for employees until an Employee API is implemented
const employeesData: EmployeesRecord = {};

const Employee: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get data from Redux store
  const reminders = useSelector(selectAllReminders);
  const tasks = useSelector((state: RootState) => state.tasks.tasks as Task[]);
  const notes = useSelector((state: RootState) => state.notes.notes as Note[]);
  
  const [employees, setEmployees] = useState<EmployeesRecord>(employeesData);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [taskFilterStatus, setTaskFilterStatus] = useState('all');
  const [taskSortBy, setTaskSortBy] = useState('due-date');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch data from backend when component mounts
  useEffect(() => {
    dispatch(fetchTasks());
    dispatch(fetchNotes());
    dispatch(fetchReminders());
  }, [dispatch]);

  // Check for mobile screen on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Adjust sidebar visibility based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter tasks, notes, and reminders for the selected employee
  const employeeTasks = selectedEmployeeId
    ? tasks.filter(task => task.assigneeId === selectedEmployeeId)
    : [];
    
  const employeeNotes = selectedEmployeeId
    ? notes.filter(note => note.employeeId === selectedEmployeeId)
    : [];
    
  const employeeReminders = selectedEmployeeId
    ? reminders.filter(reminder => {
        // Check if the reminder should be associated with this employee
        // This assumes reminders don't have an assigneeId property directly
        return reminder.projectId === selectedEmployeeId;
      })
    : [];

  // Handler for task status toggle
  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    // Here we would dispatch an action to update the task in Redux
    // For now, we'll just log it
    console.log(`Task ${taskId} status changed to ${newStatus}`);
  };

  // Handler for adding a new employee
  const handleAddEmployee = (name: string, role: string) => {
    const newId = `emp-${Date.now()}`;
    setEmployees(prev => ({
      ...prev,
      [newId]: { id: newId, name, role }
    }));
    setIsAddEmployeeModalOpen(false);
  };

  // Handler for assigning a new task
  const handleAssignTask = (taskData: any) => {
    // Here we would dispatch an action to create a task in Redux
    console.log('New task assigned:', taskData);
    setIsAssignTaskModalOpen(false);
  };

  // Handler for adding a new note
  const handleAddNote = (noteData: any) => {
    // Here we would dispatch an action to create a note in Redux
    console.log('New note added:', noteData);
    setIsAddNoteModalOpen(false);
  };

  // Handler for employee dropdown change
  const handleEmployeeChange = (event: SelectChangeEvent<string>) => {
    setSelectedEmployeeId(event.target.value);
  };

  // Get employee name by ID
  const getEmployeeNameById = (id: string) => {
    return employees[id]?.name || 'Unknown Employee';
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="main-content">
        <div className="employee-container">
          <div className="employee-header">
            <button
              onClick={toggleSidebar}
              className="sidebar-toggle"
            >
              ☰
            </button>
            <h1 className="page-title">Employee Management</h1>
            
            <div className="employee-actions">
              {/* Employee Dropdown */}
              <FormControl variant="outlined" size="small" className="filter-dropdown">
                <InputLabel id="employee-select-label" shrink={true}>Employee</InputLabel>
                <Select
                  labelId="employee-select-label"
                  id="employee-select"
                  value={selectedEmployeeId || ''}
                  onChange={handleEmployeeChange}
                  label="Employee"
                  displayEmpty
                  renderValue={(value) => {
                    return (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PersonIcon style={{ marginRight: '8px' }} />
                        {value === "" ? "Select Employee" : getEmployeeNameById(value as string)}
                      </div>
                    );
                  }}
                >
                  {Object.values(employees).map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      <PersonIcon style={{ marginRight: '8px', color: 'black' }} /> <span style={{ color: 'black' }}>{employee.name}</span>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => setIsAddEmployeeModalOpen(true)}
              >
                Add Employee
              </Button>
            </div>
          </div>
          
          <div className="employee-content">
            <EmployeeDetails
              employee={selectedEmployeeId && employees[selectedEmployeeId] ? employees[selectedEmployeeId] : null}
              tasks={employeeTasks}
              notes={employeeNotes}
              reminders={employeeReminders}
              taskFilterStatus={taskFilterStatus}
              taskSortBy={taskSortBy}
              onTaskFilterChange={setTaskFilterStatus}
              onTaskSortChange={setTaskSortBy}
              onTaskStatusChange={handleTaskStatusChange}
              onAssignTask={() => setIsAssignTaskModalOpen(true)}
              onAddNote={() => setIsAddNoteModalOpen(true)}
            />
          </div>

          {isAddEmployeeModalOpen && (
            <AddEmployeeModal 
              onSave={handleAddEmployee}
              onClose={() => setIsAddEmployeeModalOpen(false)}
            />
          )}

          {isAssignTaskModalOpen && selectedEmployeeId && employees[selectedEmployeeId] && (
            <AssignTaskModal
              employee={employees[selectedEmployeeId]}
              onSave={handleAssignTask}
              onClose={() => setIsAssignTaskModalOpen(false)}
            />
          )}

          {isAddNoteModalOpen && selectedEmployeeId && employees[selectedEmployeeId] && (
            <AddNoteModal
              employee={employees[selectedEmployeeId]}
              onSave={handleAddNote}
              onClose={() => setIsAddNoteModalOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Employee; 