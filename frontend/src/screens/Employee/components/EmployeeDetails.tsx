import React, { useMemo } from 'react';

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
  assigneeId?: string;
}

interface EmployeeDetailsProps {
  employee: Employee | null;
  tasks: Task[];
  notes: Note[];
  reminders: Reminder[];
  taskFilterStatus: string;
  taskSortBy: string;
  onTaskFilterChange: (filter: string) => void;
  onTaskSortChange: (sort: string) => void;
  onTaskStatusChange: (taskId: string, newStatus: string) => void;
  onAssignTask: () => void;
  onAddNote: () => void;
}

const EmployeeDetails: React.FC<EmployeeDetailsProps> = ({
  employee,
  tasks,
  notes,
  reminders,
  taskFilterStatus,
  taskSortBy,
  onTaskFilterChange,
  onTaskSortChange,
  onTaskStatusChange,
  onAssignTask,
  onAddNote
}) => {
  // Filter tasks based on the selected filter
  const filteredTasks = useMemo(() => {
    if (!tasks || !tasks.length) return [];
    
    let filtered = [...tasks];
    
    // Apply status filter
    if (taskFilterStatus !== 'all') {
      if (taskFilterStatus === 'pending') {
        filtered = filtered.filter(task => 
          task.status === 'not-started' || task.status === 'in-progress'
        );
      } else if (taskFilterStatus === 'inprogress') {
        filtered = filtered.filter(task => task.status === 'in-progress');
      } else if (taskFilterStatus === 'completed') {
        filtered = filtered.filter(task => task.status === 'completed');
      }
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (taskSortBy === 'due-date') {
        const dateA = a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31');
        const dateB = b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31');
        return dateA.getTime() - dateB.getTime();
      } else if (taskSortBy === 'priority') {
        const priorityOrder: { [key: string]: number } = { 
          'High': 1, 
          'Medium': 2, 
          'Low': 3 
        };
        return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
      }
      return 0;
    });
    
    return filtered;
  }, [tasks, taskFilterStatus, taskSortBy]);
  
  // Calculate performance stats
  const stats = useMemo(() => {
    if (!tasks || !tasks.length) {
      return {
        assigned: 0,
        pending: 0,
        completed: 0,
        overdue: 0,
        completionRate: 0
      };
    }
    
    const totalAssigned = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed');
    const totalCompleted = completedTasks.length;
    
    // Use current date instead of fixed date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = tasks.filter(task => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      return dueDate && dueDate < today && task.status !== 'completed';
    });
    
    const totalOverdue = overdueTasks.length;
    const totalPending = tasks.filter(task => 
      task.status === 'not-started' || task.status === 'in-progress'
    ).length;
    
    const completionRate = totalAssigned > 0 
      ? Math.round((totalCompleted / totalAssigned) * 100) 
      : 0;
      
    return {
      assigned: totalAssigned,
      pending: totalPending,
      completed: totalCompleted,
      overdue: totalOverdue,
      completionRate
    };
  }, [tasks]);
  
  // Calculate follow-ups needed from tasks and reminders
  const followUps = useMemo(() => {
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Tasks with check-in dates that are due or past due
    const checkInFollowUps = tasks && tasks.length 
      ? tasks.filter(task => 
          task.status !== 'completed' && 
          task.checkInDate && 
          new Date(task.checkInDate) <= today
        )
      : [];
    
    // Overdue tasks not already in the check-in list
    const overdueTasks = tasks && tasks.length
      ? tasks.filter(task => {
          const dueDate = task.dueDate ? new Date(task.dueDate) : null;
          return (
            task.status !== 'completed' && 
            dueDate && 
            dueDate < today && 
            !checkInFollowUps.some(f => f.id === task.id)
          );
        })
      : [];
    
    // Format reminders as follow-ups
    const reminderFollowUps = reminders && reminders.length
      ? reminders
          .filter(reminder => !reminder.completed)
          .map(reminder => ({
            id: reminder.id,
            name: reminder.name,
            dueDate: reminder.dueDate,
            priority: reminder.priority,
            projectId: reminder.projectId || '',
            status: 'not-started',
            assigneeId: reminder.assigneeId || '',
            checkInDate: null,
            completionDate: null,
            notes: 'From reminder',
            isReminder: true
          }))
      : [];
    
    // Combine all types of follow-ups
    const allFollowUps = [...checkInFollowUps, ...overdueTasks, ...reminderFollowUps];
    
    // Sort by due date
    allFollowUps.sort((a, b) => {
      const dateA = a.checkInDate 
        ? new Date(a.checkInDate) 
        : (a.dueDate ? new Date(a.dueDate) : new Date('9999-12-31'));
      
      const dateB = b.checkInDate 
        ? new Date(b.checkInDate) 
        : (b.dueDate ? new Date(b.dueDate) : new Date('9999-12-31'));
      
      return dateA.getTime() - dateB.getTime();
    });
    
    return allFollowUps;
  }, [tasks, reminders]);
  
  // Function to handle task status toggle
  const handleTaskStatusToggle = (taskId: string, currentStatus: string) => {
    let nextStatus = 'not-started';
    
    if (currentStatus === 'not-started') {
      nextStatus = 'in-progress';
    } else if (currentStatus === 'in-progress') {
      nextStatus = 'completed';
    } else if (currentStatus === 'completed') {
      nextStatus = 'not-started';
    }
    
    onTaskStatusChange(taskId, nextStatus);
  };
  
  // Helper function to format dates
  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // If no employee is selected, show placeholder
  if (!employee) {
    return (
      <main className="employee-details-pane">
        <div className="details-placeholder">
          <span className="icon" style={{ fontSize: '3em' }}>👥</span>
          <h2>Select an Employee</h2>
          <p>Choose an employee from the list to see their details, assigned tasks, and performance.</p>
        </div>
      </main>
    );
  }
  
  return (
    <main className="employee-details-pane">
      <header className="employee-details-header">
        <div className="employee-avatar">{employee.name.charAt(0)}</div>
        <div className="employee-details-info">
          <h1 className="employee-details-name">{employee.name}</h1>
          <p className="employee-details-role">{employee.role}</p>
        </div>
      </header>
      
      <section className="details-section">
        <h2 className="details-section-title">
          <span className="title-text">
            <span className="icon">✅</span> Assigned Tasks
          </span>
          <button className="add-button" onClick={onAssignTask}>
            + Assign New Task
          </button>
        </h2>
        <div className="task-filters">
          <label htmlFor="task-filter-status">Status:</label>
          <select 
            id="task-filter-status" 
            value={taskFilterStatus}
            onChange={(e) => onTaskFilterChange(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="inprogress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <label htmlFor="task-sort-by" style={{ marginLeft: '15px' }}>Sort by:</label>
          <select 
            id="task-sort-by" 
            value={taskSortBy}
            onChange={(e) => onTaskSortChange(e.target.value)}
          >
            <option value="due-date">Due Date</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        
        {filteredTasks.length === 0 ? (
          <p className="no-items-message">No tasks match the current filter.</p>
        ) : (
          <ul className="assigned-tasks-list">
            {filteredTasks.map(task => (
              <li 
                key={task.id} 
                className={`task-item ${task.status === 'completed' ? 'completed' : ''}`}
              >
                <div 
                  className={`task-status-toggle ${task.status}`}
                  onClick={() => handleTaskStatusToggle(task.id, task.status)}
                  title={`Status: ${task.status.replace('-', ' ')}`}
                />
                <div className="task-content">
                  <div className="task-name">
                    {task.name}
                  </div>
                  <div className="task-meta">
                    <span className="due-date">Due: {formatDate(task.dueDate)}</span>
                    {task.checkInDate && task.status !== 'completed' && (
                      <span className="check-in">
                        Check-in: {formatDate(task.checkInDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div className={`task-priority priority-${task.priority.toLowerCase()}`}>
                  {task.priority}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      
      <section className="details-section">
        <h2 className="details-section-title">
          <span className="title-text">
            <span className="icon">📊</span> Performance
          </span>
        </h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.assigned}</span>
            <span className="stat-label">Tasks Assigned</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.pending}</span>
            <span className="stat-label">Tasks Pending</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.completed}</span>
            <span className="stat-label">Tasks Completed</span>
          </div>
          <div className="stat-card">
            <span className={`stat-value ${stats.overdue > 0 ? 'negative' : ''}`}>
              {stats.overdue}
            </span>
            <span className="stat-label">Tasks Overdue</span>
          </div>
          <div className="stat-card">
            <span className={`stat-value ${stats.completionRate >= 70 ? 'positive' : (stats.completionRate < 50 ? 'negative' : '')}`}>
              {stats.completionRate}%
            </span>
            <span className="stat-label">Completion Rate</span>
          </div>
        </div>
      </section>
      
      <section className="details-section">
        <h2 className="details-section-title">
          <span className="title-text">
            <span className="icon">⏰</span> Requires Follow-up
          </span>
        </h2>
        {followUps.length === 0 ? (
          <p className="no-items-message">No follow-ups required at this time.</p>
        ) : (
          <ul className="follow-up-list">
            {followUps.map(item => (
              <li key={item.id} className="follow-up-item">
                <div className="follow-up-task">
                  {item.name}
                  {(item as any).isReminder && <span className="reminder-badge" title="From reminder">🔔</span>}
                </div>
                <div className="follow-up-date">
                  {item.checkInDate ? formatDate(item.checkInDate) : formatDate(item.dueDate)}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      
      <section className="details-section">
        <h2 className="details-section-title">
          <span className="title-text">
            <span className="icon">📝</span> Notes
          </span>
          <button className="add-button" onClick={onAddNote}>
            + Add Note
          </button>
        </h2>
        {notes.length === 0 ? (
          <p className="no-items-message">No notes available.</p>
        ) : (
          <ul className="shared-notes-list">
            {notes.map(note => (
              <li key={note.id} className="note-item-summary">
                <div className="note-summary-title">{note.title}</div>
                <div className="note-summary-date">{note.date}</div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default EmployeeDetails; 