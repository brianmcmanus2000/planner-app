// src/pages/SchedulePage.tsx
import React from 'react';
import styles from './SchedulePage.module.css';

import { useLocation } from 'react-router-dom';

const SchedulePage = () => {
  const location = useLocation();
  const tasks = location.state?.tasks || [];

  return (
    <div className={styles.container}>
      <h2>Generated Schedule</h2>
      <pre>{JSON.stringify(tasks, null, 2)}</pre> {/* For now, just display tasks */}
    </div>
  );
};

export default SchedulePage;