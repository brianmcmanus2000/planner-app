import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/tasks" element={<TaskInputPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
      </Routes>
    </Router>
  );
}

export default App;