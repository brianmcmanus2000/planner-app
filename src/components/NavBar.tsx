// src/components/NavBar.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => (
  <nav style={{ display: 'flex', justifyContent: 'space-around', padding: '1rem', background: '#eee' }}>
    <Link to="/categories">Categories</Link>
    <Link to="/tasks">Tasks</Link>
    <Link to="/schedule">Schedule</Link>
  </nav>
);

export default NavBar;

