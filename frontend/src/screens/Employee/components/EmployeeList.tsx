import React from 'react';

interface Employee {
  id: string;
  name: string;
  role: string;
}

interface EmployeeListProps {
  employees: Employee[];
  selectedEmployeeId: string | null;
  onEmployeeSelect: (id: string) => void;
  onAddEmployee: () => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({
  employees,
  selectedEmployeeId,
  onEmployeeSelect,
  onAddEmployee
}) => {
  return (
    <aside className="employee-list-pane">
      <div className="employee-list-header">
        <h2 className="employee-list-title">Employees</h2>
        <button className="new-employee-button" onClick={onAddEmployee}>
          + Add Employee
        </button>
      </div>
      <div className="employee-list-container">
        <ul className="employee-list">
          {employees.map(employee => (
            <li
              key={employee.id}
              className={`employee-summary-item ${selectedEmployeeId === employee.id ? 'active' : ''}`}
              onClick={() => onEmployeeSelect(employee.id)}
            >
              <div className="employee-avatar">{employee.name.charAt(0)}</div>
              <div className="employee-info">
                <div className="employee-name">{employee.name}</div>
                <div className="employee-role">{employee.role}</div>
              </div>
            </li>
          ))}
          {employees.length === 0 && (
            <li className="no-items-message">No employees added yet.</li>
          )}
        </ul>
      </div>
    </aside>
  );
};

export default EmployeeList; 