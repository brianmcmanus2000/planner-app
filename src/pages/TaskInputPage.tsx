import React, { useState } from 'react';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import styles from './TaskInputPage.module.css';

interface Task {
  name: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  location: string;
  category: string;
  mandatory: boolean;
  priority: number;
}


const TaskInputPage = () => {
  const [task, setTask] = useState<Task>({
    name: '',
    startTime: null,
    endTime: null,
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
      startTime: null,  // ✅ null, not ''
      endTime: null,    // ✅ null, not ''
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
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            label="Start Time"
            value={task.startTime}
            onChange={(newValue) => setTask({ ...task, startTime: newValue })}
          />
          <TimePicker
            label="End Time"
            value={task.endTime}
            onChange={(newValue) => setTask({ ...task, endTime: newValue })}
          />
        </LocalizationProvider>
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
            <th>Name</th><th>Time</th><th>Location</th><th>Mandatory</th><th>Priority</th><th>Remove</th>
          </tr>
        </thead>
        <tbody>
          {taskList.map((t, idx) => (
            <tr key={idx}>
              <td>{t.name}</td>
              <td>{t.startTime ? t.startTime.format('hh:mm A') : ''} - {t.endTime ? t.endTime.format('hh:mm A') : ''}</td> 
              <td>{t.location}</td>
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