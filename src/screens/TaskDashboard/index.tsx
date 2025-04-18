import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import './styles.css';

interface Task {
  id: string;
  title: string;
  status: 'not-started' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  date: string;
  project: string;
  category: string;
  assignedTo?: string;
  hasAttachment: boolean;
  description?: string;
}

const TaskDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-1',
      title: 'Buy milk',
      status: 'not-started',
      priority: 'medium',
      date: 'Apr 16',
      project: 'Groceries',
      category: 'To Buy',
      hasAttachment: true,
      description: 'Get 2% milk from the usual store. Check expiry date!'
    },
    {
      id: 'task-2',
      title: 'New keyboard',
      status: 'not-started',
      priority: 'low',
      date: 'Apr 25',
      project: 'Work Setup',
      category: 'To Buy',
      assignedTo: 'Bob',
      hasAttachment: false,
      description: 'Looking for a mechanical keyboard, tenkeyless, brown switches. Budget $100.'
    },
    {
      id: 'task-3',
      title: 'Pay electricity bill',
      status: 'completed',
      priority: 'high',
      date: 'Apr 18',
      project: 'Household',
      category: 'To Pay',
      hasAttachment: true,
      description: 'Pay the monthly electricity bill online. Account #12345. Check usage report.'
    },
    {
      id: 'task-4',
      title: 'Pay Rent',
      status: 'not-started',
      priority: 'high',
      date: 'May 01',
      project: 'Household',
      category: 'To Pay',
      hasAttachment: false,
      description: 'Monthly rent payment due. Transfer via usual method.'
    },
    {
      id: 'task-5',
      title: 'Call plumber about leak',
      status: 'in-progress',
      priority: 'high',
      date: 'Apr 15',
      project: 'Household',
      category: 'To Fix',
      assignedTo: 'Alice',
      hasAttachment: false,
      description: 'Call plumber about the dripping tap in the kitchen sink. Get quote first.'
    },
    {
      id: 'task-6',
      title: 'Finalize presentation slides',
      status: 'in-progress',
      priority: 'medium',
      date: 'Apr 15',
      project: 'Project Phoenix',
      category: 'To Review',
      hasAttachment: true,
      description: 'Review the final draft of the Q2 presentation slides. Check for typos and consistency. Add speaker notes.'
    }
  ]);

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
    setTasks(prevTasks => 
      prevTasks.map(task => {
        if (task.id === taskId) {
          let newStatus: 'not-started' | 'in-progress' | 'completed' = 'not-started';
          
          if (task.status === 'not-started') newStatus = 'in-progress';
          else if (task.status === 'in-progress') newStatus = 'completed';
          else if (task.status === 'completed') newStatus = 'not-started';
          
          return { ...task, status: newStatus };
        }
        return task;
      })
    );
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
      setTasks(prevTasks => 
        prevTasks.map(task => {
          if (task.id === draggedTask) {
            return { ...task, status: newStatus };
          }
          return task;
        })
      );
      setDraggedTask(null);
    }
  };

  const getTasksByCategory = () => {
    const categories: { [key: string]: Task[] } = {};
    
    tasks.forEach(task => {
      if (!categories[task.category]) {
        categories[task.category] = [];
      }
      categories[task.category].push(task);
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
    // In a real app, we'd compare with today's date
    return tasks.filter(task => task.date === 'Apr 15');
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

  return (
    <div className="dashboard-layout">
      {(sidebarOpen || !isMobile) && (
        <nav className={`sidebar-nav ${isMobile && sidebarOpen ? 'mobile-visible' : ''}`}>
          <Sidebar />
        </nav>
      )}
      
      <main className="dashboard-main-content">
        <div className="dashboard-header-bar">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {isMobile && (
              <button 
                onClick={toggleSidebar} 
                className="sidebar-toggle"
              >
                ☰
              </button>
            )}
            <h1 className="dashboard-title">🚀 My Tasks Dashboard</h1>
          </div>
        </div>
        
        <div className="task-dashboard-content">
          {/* Category View */}
          <div className="view-section">
            <h2 className="view-title">View: Tasks by Category</h2>
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
                          <span className="date">{task.date}</span>
                          <span className="project">{task.project}</span>
                          {task.assignedTo && <span className="assigned-user">👤 {task.assignedTo}</span>}
                          {task.hasAttachment && <span className="attachment-icon">📎</span>}
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
            <h2 className="view-title">View: Tasks by Status (Kanban)</h2>
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
                          <span className="date">{task.date}</span>
                          <span className="project">{task.project}</span>
                          {task.assignedTo && <span className="assigned-user">👤 {task.assignedTo}</span>}
                          {task.hasAttachment && <span className="attachment-icon">📎</span>}
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
            <h2 className="view-title">View: Today's Tasks (Apr 15, 2025) - Grid Table</h2>
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
                      <span className="project">{task.project}</span>
                    </td>
                    <td className="meta-cell">
                      {task.assignedTo && <span className="assigned-user">👤 {task.assignedTo}</span>}
                    </td>
                    <td className="meta-cell">
                      {task.hasAttachment && <span className="attachment-icon">📎</span>}
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