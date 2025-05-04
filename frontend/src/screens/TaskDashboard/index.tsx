import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar/Sidebar';
import { useGetTasksQuery, useUpdateTaskMutation } from '../../redux/api/tasksApi';
import './styles.css';
import { Task } from '../../types/task.types';

const TaskDashboard: React.FC = () => {
  const [shouldFetch, setShouldFetch] = useState(true);
  const { data = [], isLoading, isError, refetch } = useGetTasksQuery(undefined, {
    skip: !shouldFetch
  });
  useEffect(() => {
    if (data.length === 0) {
      setShouldFetch(true);
    }
  }, [data]);
  const [updateTask] = useUpdateTaskMutation();

  const tasks = data as unknown as Task[];
  
  const tasksLoading = isLoading;
  const tasksError = isError;
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  // Set sidebar state based on screen size
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle status circle click
  const handleStatusChange = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    let newStatus = 'not-started';
    if (task.status === 'not-started') newStatus = 'in-progress';
    else if (task.status === 'in-progress') newStatus = 'completed';
    else if (task.status === 'completed') newStatus = 'not-started';
    updateTask({
      id: taskId,
      status: newStatus
    });
  };

  // Modal handlers
  const openModal = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Drag and drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    // Add drag-over class for visual feedback
    if (e.currentTarget.classList.contains('board-column')) {
      e.currentTarget.classList.add('drag-over');
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Remove drag-over class when leaving
    if (e.currentTarget.classList.contains('board-column')) {
      e.currentTarget.classList.remove('drag-over');
    }
  };

  const handleDrop = (e: React.DragEvent, newStatus: 'not-started' | 'in-progress' | 'completed') => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    if (draggedTask) {
      const task = tasks.find(t => t.id === draggedTask);
      if (task) {
        updateTask({
          id: draggedTask,
          status: newStatus
        });
      }
      
      setDraggedTask(null);
    }
  };

  const getTasksByCategory = () => {
    const categories: { [key: string]: Task[] } = {
      'General': []
    };
    
    tasks.forEach(task => {
      if (task.category) {
        if (!categories[task.category]) {
          categories[task.category] = [];
        }
        categories[task.category].push(task);
      } else {
        categories['General'].push(task);
      }
    });
    
    return categories;
  };

  const getTasksByStatus = () => {
    return {
      'not-started': tasks.filter(task => task.status === 'not-started'),
      'in-progress': tasks.filter(task => task.status === 'in-progress'),
      'completed': tasks.filter(task => task.status === 'completed')
    };
  };

  const getTodaysTasks = () => {
    // Get today's date in local timezone (YYYY-MM-DD format)
    const today = new Date();
    const localDate = today.getFullYear() + '-' + 
                     String(today.getMonth() + 1).padStart(2, '0') + '-' + 
                     String(today.getDate()).padStart(2, '0');
    
    // Filter tasks by local date
    return tasks.filter(task => task.due_date === localDate);
  };

  // Status circle component
  const StatusCircle = ({ status, taskId }: { status: string, taskId: string }) => (
    <span 
      className={`status-circle ${status}`} 
      data-status={status}
      onClick={(e) => {
        e.stopPropagation();
        handleStatusChange(taskId);
      }}
    ></span>
  );

  // Priority component
  const PriorityTag = ({ priority }: { priority: string }) => (
    <span className={`priority priority-${priority}`}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</span>
  );

  // Format date to a readable string
  const formatDate = (date: Date): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  // Display loading state
  if (tasksLoading) {
    return (
      <div className="app-container">
        <div className="sidebar">
          <Sidebar />
        </div>
        <main className="main-content">
          <div className="loading-container">
            <p>Loading tasks...</p>
          </div>
        </main>
      </div>
    );
  }

  // Display error state
  if (tasksError) {
    return (
      <div className="app-container">
        <div className="sidebar">
          <Sidebar />
        </div>
        <main className="main-content">
          <div className="error-container">
            <p>Error loading tasks. Please try again.</p>
            <button 
              className="retry-button"
              onClick={() => refetch()}
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <Sidebar /> 
      </div>
      
      <main className="main-content">
        <div className="dashboard-header-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={toggleSidebar} 
              className="sidebar-toggle"
            >
              ☰
            </button>
            <h1 className="dashboard-title">🚀 My Tasks</h1>
          </div>
        </div>
        
        <div className="task-dashboard-content">
          {/* Category View */}
          <div className="view-section">
            <h2 className="view-title">Tasks by Category</h2>
            <div className="board-view">
              {Object.entries(getTasksByCategory()).map(([category, categoryTasks]) => (
                <div className="board-column" key={category}>
                  <div className="column-title">{getCategoryIcon(category)} {category}</div>
                  
                  {categoryTasks.map(task => (
                    <div 
                      className="task-card" 
                      key={task.id}
                      data-description={task.description}
                    >
                      <StatusCircle status={task.status} taskId={task.id} />
                      <div className="task-card-content">
                        <span 
                          className="task-card-main-text"
                          style={task.status === 'completed' ? { textDecoration: 'line-through', color: 'grey' } : {}}
                          onClick={() => openModal(task)}
                        >
                          {task.title}
                        </span>
                        <div className="task-card-meta">
                          <PriorityTag priority={task.priority} />
                          <span className="date">{task.due_date}</span>
                          {/* <span className="project">{task.project_id}</span> */}
                          {/* {task.employee_id && <span className="assigned-user">👤 {task.employee_id}</span>}
                          {task.files && <span className="attachment-icon">📎</span>} */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Status (Kanban) View */}
          <div className="view-section" data-view-type="status-board">
            fasdfasdfasdfasdf
            <h2 className="view-title">Tasks by Status (Kanban)</h2>
            <div className="board-view">
              {Object.entries(getTasksByStatus()).map(([status, statusTasks]) => (
                <div 
                  className="board-column dropzone" 
                  id={`col-${status}`}
                  key={status}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, status as 'not-started' | 'in-progress' | 'completed')}
                >
                  <div className="column-title">
                    {status === 'not-started' && '⚪ Not Started'}
                    {status === 'in-progress' && '🟡 In Progress'}
                    {status === 'completed' && '🔵 Completed'}
                  </div>
                  
                  {statusTasks.map(task => (
                    <div 
                      className="task-card kanban-card" 
                      draggable
                      id={task.id}
                      key={task.id}
                      style={task.status === 'completed' ? { opacity: 0.7 } : {}}
                      onDragStart={() => handleDragStart(task.id)}
                    >
                      <span></span>
                      <div className="task-card-content">
                        <span 
                          style={task.status === 'completed' ? { textDecoration: 'line-through' } : {}}
                        >
                          {task.title}
                        </span>
                        <div className="task-card-meta">
                          <PriorityTag priority={task.priority} />
                          <span className="category">{task.category}</span>
                          <span className="date">{task.due_date}</span>
                          {/* <span className="project">{task.project_id}</span>
                          {task.employee_id && <span className="assigned-user">👤 {task.employee_id}</span>}
                          {task.files && <span className="attachment-icon">📎</span>} */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Today's Tasks (Grid Table View) */}
          <div className="view-section">
            <h2 className="view-title">Today's Tasks ({formatDate(new Date())}) - Grid Table</h2>
            <table className="today-grid-table">
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>Status</th>
                  <th>Task Name</th>
                  <th style={{ width: '10%' }}>Priority</th>
                  <th style={{ width: '15%' }}>Project</th>
                  <th style={{ width: '15%' }}>Assigned To</th>
                  <th style={{ width: '5%' }}>Files</th>
                </tr>
              </thead>
              <tbody>
                {getTodaysTasks().map(task => (
                  <tr key={task.id}>
                    <td>
                      <StatusCircle status={task.status} taskId={task.id} />
                    </td>
                    <td className="task-name-cell">{task.title}</td>
                    <td className="meta-cell">
                      <PriorityTag priority={task.priority} />
                    </td>
                    <td className="meta-cell">
                      <span className="project">{task.project_id}</span>
                    </td>
                    <td className="meta-cell">
                      {/* {task.employee_id && <span className="assigned-user">👤 {task.employee_id}</span>} */}
                    </td>
                    <td className="meta-cell">
                      {/* {task.files && <span className="attachment-icon">📎</span>} */}
                    </td>
                  </tr>
                ))}
                {getTodaysTasks().length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', color: '#999', padding: '20px' }}>
                      No tasks due today
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Description Modal */}
        {isModalOpen && selectedTask && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={closeModal}>&times;</button>
              <div className="modal-description">
                <h3>{selectedTask.title}</h3>
                <p>{selectedTask.description || 'No description provided.'}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Helper function to get an icon for each category
const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'To Buy': return '🛒';
    case 'To Pay': return '💰';
    case 'To Fix': return '🔧';
    case 'To Review': return '👀';
    default: return '📝';
  }
};

export default TaskDashboard;