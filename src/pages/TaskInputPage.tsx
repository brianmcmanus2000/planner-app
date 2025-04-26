import React, { useState } from 'react';
import styles from './TaskInputPage.module.css';

interface Task {
  name: string;
  startTime: string;
  endTime: string;
  duration: string;
  location: string;
  category: string;
  mandatory: boolean;
  priority: number;
}

const TaskInputPage = () => {
  const [task, setTask] = useState<Task>({
    name: '',
    startTime: '',
    endTime: '',
    duration: '',
    location: '',
    category: 'Work',
    mandatory: false,
    priority: 1,
  });
  const [taskList, setTaskList] = useState<Task[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isCheckbox = e.target instanceof HTMLInputElement && e.target.type === 'checkbox';
    const checked = isCheckbox ? (e.target as HTMLInputElement).checked : undefined;

    setTask({
      ...task,
      [name]: isCheckbox ? checked : value,
    });
  };

  const addTask = () => {
    setTaskList([...taskList, task]);
    setTask({
      name: '',
      startTime: '',
      endTime: '',
      duration: '',
      location: '',
      category: 'Work',
      mandatory: false,
      priority: 1,
    });
  };

  const removeTask = (index: number) => {
    setTaskList(taskList.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.container}>
      <h2>Task Input</h2>
      <div className={styles.inputGroup}>
        <input name="name" value={task.name} onChange={handleChange} placeholder="Task Name" />
        <input name="startTime" value={task.startTime} onChange={handleChange} placeholder="Start Time" />
        <input name="endTime" value={task.endTime} onChange={handleChange} placeholder="End Time" />
        <input name="duration" value={task.duration} onChange={handleChange} placeholder="Duration" />
        <input name="location" value={task.location} onChange={handleChange} placeholder="Location" />
        <select name="category" value={task.category} onChange={handleChange}>
          <option value="Work">Work</option>
          <option value="Chores">Chores</option>
          <option value="Relaxation">Relaxation</option>
        </select>
        <input
          type="number"
          name="priority"
          value={task.priority}
          min={1}
          max={10}
          onChange={handleChange}
          placeholder="Priority"
        />
        <label>
          Mandatory?
          <input
            type="checkbox"
            name="mandatory"
            checked={task.mandatory}
            onChange={handleChange}
          />
        </label>
        <button onClick={addTask}>Add Task</button>
      </div>

      <table className={styles.taskTable}>
        <thead>
          <tr>
            <th>Name</th><th>Time</th><th>Mandatory</th><th>Priority</th><th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {taskList.map((t, idx) => (
            <tr key={idx}>
              <td>{t.name}</td>
              <td>{t.startTime || t.endTime || t.duration}</td>
              <td>{t.mandatory ? 'Yes' : 'No'}</td>
              <td>{t.priority}</td>
              <td><button onClick={() => removeTask(idx)}>❌</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className={styles.generateButton}>Go to Generated Schedule</button>
    </div>
  );
};

export default TaskInputPage;