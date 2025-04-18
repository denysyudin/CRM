import React, { useState, useEffect } from 'react';
import EmployeeList from './components/EmployeeList';
import EmployeeDetails from './components/EmployeeDetails';
import AddEmployeeModal from './components/AddEmployeeModal';
import AssignTaskModal from './components/AssignTaskModal';
import AddNoteModal from './components/AddNoteModal';
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

interface EmployeesRecord {
  [id: string]: Employee;
}

interface TasksRecord {
  [id: string]: Task;
}

interface NotesRecord {
  [id: string]: Note;
}

// Mock data for development until Redux is fully implemented
const employeesData: EmployeesRecord = {
  "emp-1": { id: "emp-1", name: "Alice", role: "Designer / Production" },
  "emp-2": { id: "emp-2", name: "Bob", role: "Marketing / Website" },
  "emp-3": { id: "emp-3", name: "Charlie", role: "Sales / Admin" }
};

const tasksData: TasksRecord = {
  "task-bj-1": { id: "task-bj-1", name: "Order new display boxes", status: "not-started", priority: "High", dueDate: "2025-04-15", assigneeId: "emp-3", projectId: "proj-bj", checkInDate: null, completionDate: null, notes: "Need 50 units by end of month." },
  "task-bc-1": { id: "task-bc-1", name: "Review Ad Copy", status: "completed", priority: "Medium", dueDate: "2025-04-15", assigneeId: "emp-2", projectId: "proj-bc", checkInDate: null, completionDate: "2025-04-14", notes: "Approved." },
  "task-sj-1": { id: "task-sj-1", name: "Draft blog post outline", status: "not-started", priority: "Low", dueDate: "2025-04-20", assigneeId: "emp-2", projectId: "proj-sj", checkInDate: "2025-04-18", completionDate: null, notes: "" },
  "task-pp-1": { id: "task-pp-1", name: "Finalize presentation slides", status: "in-progress", priority: "Medium", dueDate: "2025-04-15", assigneeId: "emp-2", projectId: "proj-pp", checkInDate: null, completionDate: null, notes: "Waiting for final figures." },
  "task-house-1": { id: "task-house-1", name: "Call plumber about leak", status: "in-progress", priority: "High", dueDate: "2025-04-15", assigneeId: "emp-1", projectId: "proj-house", checkInDate: "2025-04-16", completionDate: null, notes: "Plumber scheduled for tomorrow AM." },
  "task-bj-3": { id: "task-bj-3", name: "Polish silver inventory", status: "completed", priority: "Medium", dueDate: "2025-04-10", assigneeId: "emp-1", projectId: "proj-bj", checkInDate: null, completionDate: "2025-04-10", notes: "" },
  "task-admin-1": { id: "task-admin-1", name: "Organize Q1 Receipts", status: "not-started", priority: "Medium", dueDate: "2025-04-25", assigneeId: "emp-3", projectId: "proj-admin", checkInDate: null, completionDate: null, notes: "Scan and file digitally." },
  "task-overdue-1": { id: "task-overdue-1", name: "Update supplier contact list", status: "in-progress", priority: "Low", dueDate: "2025-04-10", assigneeId: "emp-3", projectId: "proj-admin", checkInDate: "2025-04-14", completionDate: null, notes: "Need Bob's input." }
};

const notesData: NotesRecord = {
  "note-1": { id: "note-1", title: "Pendant Design Ideas", date: "Apr 14, 2025", category: "Product Design", project: "Bravo Jewellers", employeeId: "emp-1", body: "<p>Alice, check these ideas...</p>" },
  "note-2": { id: "note-2", title: "Spring Sale Slogans", date: "Apr 12, 2025", category: "Marketing Ideas", project: "Bravo Creations", employeeId: "emp-2", body: "<h3>Draft Slogans for Bob:</h3><p>1. 'Bloom into Spring...'</p>" },
  "note-6": { id: "note-6", title: "Meeting Notes - Box Supplier", date: "Apr 08, 2025", category: "Meeting Notes", project: "Bravo Jewellers", employeeId: "emp-3", body: "<p>Charlie, FYI on box supplier lead times...</p>" },
  "note-8": { id: "note-8", title: "Phoenix Project - Phase 1 Notes", date: "Apr 14, 2025", category: "Meeting Notes", project: "Project Phoenix", employeeId: "emp-2", body: "<p>Bob - notes from the review meeting.</p>" },
  "note-9": { id: "note-9", title: "Q1 Tax Docs", date: "Apr 05, 2025", category: "Admin", project: "Admin", employeeId: "emp-3", body: "<p>Charlie - please ensure these are gathered.</p>" }
};

const Employee: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeesRecord>(employeesData);
  const [tasks, setTasks] = useState<TasksRecord>(tasksData);
  const [notes, setNotes] = useState<NotesRecord>(notesData);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
  const [isAssignTaskModalOpen, setIsAssignTaskModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [taskFilterStatus, setTaskFilterStatus] = useState('all');
  const [taskSortBy, setTaskSortBy] = useState('due-date');

  // Handler for task status toggle
  const handleTaskStatusChange = (taskId: string, newStatus: string) => {
    setTasks(prevTasks => ({
      ...prevTasks,
      [taskId]: {
        ...prevTasks[taskId],
        status: newStatus,
        completionDate: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
      }
    }));
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
    const newId = `task-${Date.now()}`;
    setTasks(prev => ({
      ...prev,
      [newId]: {
        id: newId,
        ...taskData,
        assigneeId: selectedEmployeeId,
        status: 'not-started',
        completionDate: null
      }
    }));
    setIsAssignTaskModalOpen(false);
  };

  // Handler for adding a new note
  const handleAddNote = (noteData: any) => {
    const newId = `note-${Date.now()}`;
    setNotes(prev => ({
      ...prev,
      [newId]: {
        id: newId,
        ...noteData,
        employeeId: selectedEmployeeId,
        date: new Date().toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        project: 'New Note' // Default project name
      }
    }));
    setIsAddNoteModalOpen(false);
  };

  return (
    <div className="employee-layout">
      <EmployeeList 
        employees={Object.values(employees)} 
        selectedEmployeeId={selectedEmployeeId}
        onEmployeeSelect={setSelectedEmployeeId}
        onAddEmployee={() => setIsAddEmployeeModalOpen(true)}
      />
      
      <EmployeeDetails
        employee={selectedEmployeeId && employees[selectedEmployeeId] ? employees[selectedEmployeeId] : null}
        tasks={Object.values(tasks).filter(task => task.assigneeId === selectedEmployeeId)}
        notes={Object.values(notes).filter(note => note.employeeId === selectedEmployeeId)}
        taskFilterStatus={taskFilterStatus}
        taskSortBy={taskSortBy}
        onTaskFilterChange={setTaskFilterStatus}
        onTaskSortChange={setTaskSortBy}
        onTaskStatusChange={handleTaskStatusChange}
        onAssignTask={() => setIsAssignTaskModalOpen(true)}
        onAddNote={() => setIsAddNoteModalOpen(true)}
      />

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
  );
};

export default Employee; 