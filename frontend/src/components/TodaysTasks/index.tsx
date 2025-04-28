import React, { useEffect, useState } from 'react';
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const DEFAULT_ROWS = 5;

  // Get API URL from environment variables with fallback
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  useEffect(() => {
    // Initial fetch from backend
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${apiUrl}/tasks`);
        console.log('Received tasks:', response);
        const data: Task[] = await response.json();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);
  // Create array of row indexes to always render 5 rows
  const rowIndexes = Array.from({ length: DEFAULT_ROWS }, (_, i) => i);

  return (
    <div className="tasks-container">
      <h2>Today's Tasks ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</h2>
      
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
          {rowIndexes.map(index => {
            const task = tasks[index];
            return (
              <tr key={index} className={!task ? 'empty-row' : ''}>
                <td>
                  {task ? (
                    <div className="task-item">
                      <div className={`status-circle ${task.completed ? 'completed' : ''}`}></div>
                      {task.title}
                    </div>
                  ) : null}
                </td>
                <td>
                  {task ? (
                    <span className={`priority-tag ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  ) : null}
                </td>
                <td>{task?.project || ''}</td>
                <td>
                  {task ? (
                    <div className="assignee">
                      {task.assignee === 'Self' ? (
                        <span className="self-tag">Self</span>
                      ) : ''}
                      {task.assignee}
                    </div>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TodaysTasks; 