import React, { useState } from 'react';

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface AssignTaskModalProps {
  employee: Employee;
  onSave: (taskData: {
    name: string;
    description: string;
    priority: string;
    dueDate: string;
    project: string;
    checkInDate: string | null;
  }) => void;
  onClose: () => void;
}

const AssignTaskModal: React.FC<AssignTaskModalProps> = ({ employee, onSave, onClose }) => {
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [project, setProject] = useState('');
  const [checkInDate, setCheckInDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (taskName.trim()) {
      onSave({
        name: taskName.trim(),
        description: description.trim(),
        priority,
        dueDate,
        project: project.trim(),
        checkInDate: checkInDate ? checkInDate : null
      });
      
      // Reset form
      setTaskName('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      setProject('');
      setCheckInDate('');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-form-title">Assign New Task</h2>
        <div className="modal-context">For: {employee.name}</div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="assign-task-name">
              Task Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="assign-task-name"
              name="taskName"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="assign-task-description">Description</label>
            <textarea
              id="assign-task-description"
              name="taskDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="assign-task-priority">Priority</label>
              <select
                id="assign-task-priority"
                name="taskPriority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            
            <div className="form-group" style={{ flex: 1 }}>
              <label htmlFor="assign-task-due-date">Due Date</label>
              <input
                type="date"
                id="assign-task-due-date"
                name="taskDueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="assign-task-project">
              Related Project/Business (Optional)
            </label>
            <input
              type="text"
              id="assign-task-project"
              name="taskProject"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="e.g., Bravo Jewellers, Website"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="assign-task-checkin">
              Next Check-in Date (Optional)
            </label>
            <input
              type="date"
              id="assign-task-checkin"
              name="taskCheckinDate"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="form-button button-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="form-button button-primary"
            >
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskModal; 