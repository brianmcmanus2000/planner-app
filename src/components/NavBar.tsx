import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NavBar.module.css';

const NavBar = () => (
  <nav className={styles.navbar}>
    <Link to="/categories">Categories</Link>
    <Link to="/tasks">Tasks</Link>
    <Link to="/schedule">Schedule</Link>
  </nav>
);

export default NavBar;