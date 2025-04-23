import React, { useState } from 'react';
import { Note } from '../services/api';
import '../screens/Projects/styles.css';

interface NoteModalProps {
  projectName: string;
  onClose: () => void;
  onSubmit: (noteData: Omit<Note, 'id'>) => void;
  note?: Note;
}

const NoteModal: React.FC<NoteModalProps> = ({ projectName, onClose, onSubmit, note }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [date, setDate] = useState(note?.date || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(note?.category || 'General');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      content,
      date,
      project: note?.project || '',
      category
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
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="General">General</option>
              <option value="Meeting">Meeting</option>
              <option value="Idea">Idea</option>
              <option value="Research">Research</option>
              <option value="Important">Important</option>
            </select>
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