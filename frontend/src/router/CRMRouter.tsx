import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../screens/Dashboard';
import Tasks from '../screens/TaskDashboard';
import Notes from '../screens/Notes';
import Reminders from '../screens/Reminders';
import FileManager from '../screens/FileManager';
import Projects from '../screens/Projects';
import Employees from '../screens/Employee';
import Calendar from '../screens/Calendar';

const CRMRouter: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  return (
    <BrowserRouter>
      <div className="app-container">
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/employee" element={<Employees />} />
            <Route path="/files" element={<FileManager />} />
            <Route path="/settings"  />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default CRMRouter; 