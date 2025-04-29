// src/pages/CategoriesPage.tsx
import React, { useState, useEffect } from 'react';
import styles from './CategoriesPage.module.css';

export interface Category {
  name: string;
  priority: number;
  defaultDuration: number; // minutes per day
}

const LOCAL_STORAGE_KEY = 'categories';

const CategoriesPage: React.FC = () => {
  // Load from localStorage on first render
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as Category[];
    }
    // default starter list
    return [
      { name: 'Read a book', priority: 10, defaultDuration: 60 },
      { name: 'Workout', priority: 5, defaultDuration: 45 },
      { name: 'Spend time with family', priority: 3, defaultDuration: 120 },
    ];
  });

  // Persist whenever categories change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
  }, [categories]);

  // Add a new category
  const addCategory = () => {
    setCategories([
      ...categories,
      { name: '', priority: 1, defaultDuration: 30 },
    ]);
  };

  // Update one field on a category
  const updateCategory = (
    index: number,
    field: keyof Category,
    value: string | number
  ) => {
    const newCats = [...categories];
    // @ts-ignore
    newCats[index][field] = value;
    setCategories(newCats);
  };

  // Remove a category
  const removeCategory = (index: number) => {
    const newCats = categories.filter((_, i) => i !== index);
    setCategories(newCats);
  };

  return (
    <div className={styles.container}>
      <h2>Your Long Term Tasks</h2>
      <button onClick={addCategory} className={styles.addButton}>
        + Add Category
      </button>

      {categories.map((cat, idx) => (
        <div key={idx} className={styles.categoryRow}>
          <input
            className={styles.nameInput}
            placeholder="Category Name"
            value={cat.name}
            onChange={(e) => updateCategory(idx, 'name', e.target.value)}
          />

          <div className={styles.inputGroup}>
            <label>
              Priority
              <input
                type="number"
                min={0}
                max={10}
                value={cat.priority}
                onChange={(e) =>
                  updateCategory(idx, 'priority', parseInt(e.target.value) || 0)
                }
              />
            </label>

            <label>
              Default Duration (min)
              <input
                type="number"
                min={0}
                value={cat.defaultDuration}
                onChange={(e) =>
                  updateCategory(
                    idx,
                    'defaultDuration',
                    parseInt(e.target.value) || 0
                  )
                }
              />
            </label>
          </div>

          <button
            onClick={() => removeCategory(idx)}
            className={styles.removeButton}
          >
            ❌
          </button>
        </div>
      ))}
    </div>
  );
};

export default CategoriesPage;
