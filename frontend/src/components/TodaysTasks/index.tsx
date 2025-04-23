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

interface ApiTodo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

const TodaysTasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos');
        const data: ApiTodo[] = await response.json();
        
        // Transform API data to match our Task interface with meaningful defaults
        const tasksWithRequiredProps = data.slice(0, 5).map((todo: ApiTodo) => ({
          id: todo.id,
          title: todo.title,
          completed: todo.completed, // Keep the original completed status
          priority: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
          project: `Project ${todo.userId}`,
          assignee: todo.userId === 1 ? 'Self' : `User ${todo.userId}`
        }));
        
        setTasks(tasksWithRequiredProps);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);


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
    </div>
  );
};

export default TodaysTasks; 