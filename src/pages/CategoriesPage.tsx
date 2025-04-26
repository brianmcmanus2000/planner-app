import React, { useState } from 'react';
import styles from './CategoriesPage.module.css';

type Category = {
  name: string;
  priority: number;
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([
    { name: 'Work', priority: 10 },
    { name: 'Chores', priority: 8 },
    { name: 'Relaxation', priority: 3 },
  ]);

  const updatePriority = (index: number, newPriority: number) => {
    const newCategories = [...categories];
    newCategories[index].priority = newPriority;
    setCategories(newCategories);
  };

  return (
    <div className={styles.container}>
      <h2>Categories</h2>
      {categories.map((cat, idx) => (
        <div key={idx} className={styles.categoryItem}>
          <strong>{cat.name}</strong>
          <input
            type="number"
            value={cat.priority}
            min={0}
            max={10}
            onChange={e => updatePriority(idx, parseInt(e.target.value) || 0)}
            className={styles.priorityInput}
          />
        </div>
      ))}
    </div>
  );
};

export default CategoriesPage;