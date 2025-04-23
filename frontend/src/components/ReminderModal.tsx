import React, { useState } from 'react';
import { Reminder } from '../services/api';
import '../screens/Projects/styles.css';

interface ReminderModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (reminderData: Omit<Reminder, 'id'>) => void;
  reminder?: Reminder;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ projectName, onClose, onSubmit, reminder }) => {
  const [name, setName] = useState(reminder?.name || '');
  const [dueDate, setDueDate] = useState(reminder?.dueDate || '');
  const [priority, setPriority] = useState(reminder?.priority || 'Medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      dueDate,
      priority,
      projectId: reminder?.projectId || ''
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
            <label htmlFor="name">Reminder Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
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