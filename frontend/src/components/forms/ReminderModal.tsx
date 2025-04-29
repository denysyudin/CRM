import React, { useState } from 'react';
import { Reminder } from '../../types';
import '../../screens/Projects/styles.css';

interface ReminderModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (reminderData: Omit<Reminder, 'id'>) => void;
  reminder?: Reminder;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ projectName, onClose, onSubmit, reminder }) => {
  const [title, setTitle] = useState(reminder?.title || '');
  const [due_date, setDueDate] = useState(reminder?.due_date || '');
  const [priority, setPriority] = useState(reminder?.priority || 'Medium');
  const [description, setDescription] = useState(reminder?.description || '');
  const [status, setStatus] = useState(reminder?.status || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      due_date,
      priority,
      description,
      status,
      project_id: reminder?.project_id || '',
      employee_id: reminder?.employee_id || ''
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{reminder ? 'Edit Reminder' : 'Add New Reminder'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-subheader">
          Project: {projectName}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Reminder Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="due_date">Due Date</label>
            <input
              id="due_date"
              type="date"
              value={due_date}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="form-group checkbox-group">
            <input
              id="status"
              type="checkbox"
              checked={status}
              onChange={(e) => setStatus(e.target.checked)}
            />
            <label htmlFor="status">Completed</label>
          </div>
          <div className="form-actions">
            <button type="button" className="form-button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="form-button button-primary">
              {reminder ? 'Update Reminder' : 'Create Reminder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal; 