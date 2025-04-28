import React, { useState } from 'react';
import { Event } from '../services/api';
import '../screens/Projects/styles.css';

interface EventModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (eventData: Omit<Event, 'id'>) => void;
  event?: Event;
}

const EventModal: React.FC<EventModalProps> = ({ projectName, onClose, onSubmit, event }) => {
  const [name, setName] = useState(event?.name || '');
  const [date, setDate] = useState(event?.date || '');
  const [type, setType] = useState(event?.type || 'meeting');
  const [participants, setParticipants] = useState(event?.participants || '');
  const [notes, setNotes] = useState(event?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      date,
      type,
      participants,
      notes,
      projectId: event?.projectId || ''
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{event ? 'Edit Event' : 'Add New Event'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-subheader">
          Project: {projectName}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Event Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="type">Event Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="meeting">Meeting</option>
              <option value="deadline">Deadline</option>
              <option value="appointment">Appointment</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="participants">Participants</label>
            <input
              id="participants"
              type="text"
              value={participants || ''}
              onChange={(e) => setParticipants(e.target.value)}
              placeholder="Comma-separated list of participants"
            />
          </div>
          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes || ''}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          <div className="form-actions">
            <button type="button" className="form-button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="form-button button-primary">
              {event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventModal; 