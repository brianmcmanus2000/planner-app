import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import CategoriesPage from './pages/CategoriesPage';
import TaskInputPage from './pages/TaskInputPage';
import SchedulePage from './pages/SchedulePage';
import NavBar from './components/NavBar';

import './App.css';

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        {/* default landing: redirect “/” to “/tasks” */}
        <Route path="/" element={<Navigate to="/tasks" replace />} />

        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/tasks" element={<TaskInputPage />} />
        <Route path="/schedule" element={<SchedulePage />} />

        {/* catch-all: anything else → back to tasks */}
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>
    </Router>
  );
}

export default App;