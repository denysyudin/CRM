import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './screens/Dashboard';
import TaskDashboard from './screens/TaskDashboard';
import Reminders from './screens/Reminders';
import './App.css';
import Notes from './screens/Notes';
import Employee from './screens/Employee';
import Projects from './screens/Projects';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tasks" element={<TaskDashboard />} />
        <Route path="/reminders" element={<Reminders />} />
        <Route path='/notes' element={<Notes />} />
        {/* <Route path='/calendar' element={<Calendar />} /> */}
        <Route path='/projects' element={<Projects />} /> 
        <Route path='/employee' element={<Employee />} />
        {/* <Route path='/files' element={<Files />} />
        <Route path='/settings' element={<Settings />} /> */}
      </Routes>
    </Router>
  );
}

export default App;