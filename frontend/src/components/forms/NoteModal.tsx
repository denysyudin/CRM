import React, { useState } from 'react';
import { Note } from '../../types';
import '../../screens/Projects/styles.css';

interface NoteModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (noteData: Omit<Note, 'id'>) => void;
  note?: Note;
}

const NoteModal: React.FC<NoteModalProps> = ({ projectName, onClose, onSubmit, note }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [description, setDescription] = useState(note?.description || '');
  const [category, setCategory] = useState(note?.category || 'General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      description,
      category,
      project_id: note?.project_id || '',
      employee_id: note?.employee_id || '',
      created_at: new Date().toISOString()
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{note ? 'Edit Note' : 'Add New Note'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <div className="modal-subheader">
          Project: {projectName}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Note Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Meeting">Meeting</option>
              <option value="Client">Client</option>
              <option value="Task">Task</option>
              <option value="Idea">Idea</option>
              <option value="General">General</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="description">Content</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              required
            />
          </div>
          <div className="form-actions">
            <button type="button" className="form-button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="form-button button-primary">
              {note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NoteModal; 