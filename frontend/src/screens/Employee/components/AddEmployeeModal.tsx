import React, { useState } from 'react';

interface AddEmployeeModalProps {
  onSave: (name: string, role: string) => void;
  onClose: () => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ onSave, onClose }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim(), role.trim());
      setName('');
      setRole('');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close-button" onClick={onClose}>&times;</button>
        <h2 className="modal-form-title">Add New Employee</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="employee-name-input">
              Employee Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="employee-name-input"
              name="employeeName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="employee-role-input">
              Role / Title (Optional)
            </label>
            <input
              type="text"
              id="employee-role-input"
              name="employeeRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., Designer, Marketing Lead"
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
              Save Employee
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal; 