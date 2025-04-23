import React, { useState } from 'react';
import { Project } from '../services/api';
import '../screens/Projects/styles.css';

interface ProjectModalProps {
  onClose: () => void;
  onSubmit: (projectData: Omit<Project, 'id'> & { uploadedFile?: globalThis.File }) => void;
  project?: Project;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ onClose, onSubmit, project }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [status, setStatus] = useState(project?.status || 'Not Started');
  const [startDate, setStartDate] = useState(project?.startDate || '');
  const [endDate, setEndDate] = useState(project?.endDate || '');
  const [uploadedFile, setUploadedFile] = useState<globalThis.File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      description,
      status,
      startDate,
      endDate,
      tasks: [],
      notes: [],
      events: [],
      reminders: [],
      files: [],
      icon: '📁', // Keep a default icon
      uploadedFile: uploadedFile || undefined
    });
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{project ? 'Edit Project' : 'Add New Project'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Project Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="fileInput">Attach File</label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileChange}
            />
            {uploadedFile && (
              <div className="file-info">
                Selected file: {uploadedFile.name} ({Math.round(uploadedFile.size / 1024)} KB)
              </div>
            )}
          </div>
          <div className="form-actions">
            <button type="button" className="form-button button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="form-button button-primary">
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal; 