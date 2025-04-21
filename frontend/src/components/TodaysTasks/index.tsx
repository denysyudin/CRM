import React from 'react';
import './styles.css';

interface Task {
  id: number;
  title: string;
  priority: string;
  project: string;
  assignee: string;
  completed: boolean;
}

const TodaysTasks: React.FC = () => {
  const tasks: Task[] = [
    { id: 1, title: 'Call plumber about leak', priority: 'High', project: 'Household', assignee: 'Alice', completed: false },
    { id: 2, title: 'Finalize presentation slides', priority: 'Medium', project: 'Project Phoenix', assignee: 'Self', completed: false },
    { id: 3, title: 'Review Ad Copy', priority: 'Medium', project: 'Bravo Creations', assignee: 'Self', completed: true },
    { id: 4, title: 'Order new display boxes', priority: 'High', project: 'Bravo Jewellers', assignee: 'Self', completed: false },
    { id: 5, title: 'Draft blog post outline', priority: 'Low', project: 'Smart Jeweller', assignee: 'Self', completed: false }
  ];

  return (
    <div className="tasks-container">
      <h2>Today's Tasks (Apr 15, 2025)</h2>
      
      <table className="tasks-table">
        <thead>
          <tr>
            <th className="task-column">TASK</th>
            <th>PRIORITY</th>
            <th>PROJECT / BUSINESS</th>
            <th>ASSIGNEE</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td>
                <div className="task-item">
                  <div className={`status-circle ${task.completed ? 'completed' : ''}`}></div>
                  {task.title}
                </div>
              </td>
              <td>
                <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                  {task.priority}
                </span>
              </td>
              <td>{task.project}</td>
              <td>
                <div className="assignee">
                  {task.assignee === 'Self' ? (
                    <span className="self-tag">Self</span>
                  ) : (
                    <span className="user-avatar">{task.assignee.charAt(0)}</span>
                  )}
                  {task.assignee}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="tasks-footer">
        <span>(Showing tasks due today)</span>
      </div>
    </div>
  );
};

export default TodaysTasks; 