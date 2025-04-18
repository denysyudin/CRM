import React, { useState } from 'react';

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface AddNoteModalProps {
  employee: Employee;
  onSave: (noteData: {
    title: string;
    category: string;
    body: string;
  }) => void;
  onClose: () => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ employee, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (title.trim() && body.trim()) {
      onSave({
        title: title.trim(),
        category: category.trim(),
        body: body.trim()
      });
      
      // Reset form
      setTitle('');
      setCategory('');
      setBody('');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-form-title">Add Note</h2>
        <div className="modal-context">For: {employee.name}</div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="add-note-title">
              Title <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="add-note-title"
              name="noteTitle"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="add-note-category">
              Category (Optional)
            </label>
            <input
              type="text"
              id="add-note-category"
              name="noteCategory"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g., FYI, Feedback, Instructions"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="add-note-body">
              Note Content <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              id="add-note-body"
              name="noteBody"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Attachment (Optional)</label>
            <p style={{ fontSize: '0.9em', color: 'var(--text-secondary)' }}>
              Simulate attaching a file here...
            </p>
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
              Save Note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal; 