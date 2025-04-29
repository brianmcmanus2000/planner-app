// src/pages/TaskInputPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import styles from './TaskInputPage.module.css';
import DayTimeline from '../components/DayTimeline';
import { rehydrateTasks } from '../utils/rehydrateTasks';

interface Task {
  name: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  location: string;
  priority: number;
}

const TaskInputPage: React.FC = () => {
  const navigate = useNavigate();

  const [task, setTask] = useState<Task>({
    name: '',
    startTime: null,
    endTime: null,
    location: '',
    priority: 1,
  });

  const [taskList, setTaskList] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskList');
    if (saved) {
      return rehydrateTasks(JSON.parse(saved));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('taskList', JSON.stringify(taskList));
  }, [taskList]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTask({
      ...task,
      [name]: value,
    } as any);
  };

  const addTask = () => {
    if (!task.name.trim()) {
      alert('Task name is required.');
      return;
    }
    if (!task.startTime) {
      alert('Start time is required.');
      return;
    }
    if (!task.endTime) {
      alert('End time is required.');
      return;
    }
    if (task.endTime.isBefore(task.startTime)) {
      alert('End time must be after start time.');
      return;
    }

    const updatedList = [...taskList, task].sort((a, b) =>
      a.startTime!.isBefore(b.startTime!) ? -1 : 1
    );

    setTaskList(updatedList);
    setTask({ name: '', startTime: null, endTime: null, location: '', priority: 1 });
  };

  const removeTask = (index: number) => {
    setTaskList(taskList.filter((_, i) => i !== index));
  };

  const goToSchedule = () => {
    navigate('/schedule', { state: { tasks: taskList } });
  };

  return (
    <div className={styles.container}>
      <h2>Task Input</h2>
      <div className={styles.inputGroup}>
        <input
          name="name"
          value={task.name}
          onChange={handleChange}
          placeholder="Task Name"
        />
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            label="Start Time"
            value={task.startTime}
            onChange={(newValue) => setTask({ ...task, startTime: newValue! })}
          />
          <TimePicker
            label="End Time"
            value={task.endTime}
            onChange={(newValue) => setTask({ ...task, endTime: newValue! })}
          />
        </LocalizationProvider>
        <input
          name="location"
          value={task.location}
          onChange={handleChange}
          placeholder="Location"
        />
        <input
          type="number"
          name="priority"
          value={task.priority}
          min={1}
          max={10}
          onChange={handleChange}
          placeholder="Priority"
        />
        <button onClick={addTask}>Add Task</button>
      </div>

      <table className={styles.taskTable}>
        <tbody>
          {taskList.map((t, idx) => (
            <tr key={idx}>
              <td>{t.name}</td>
              <td>
                {t.startTime?.format('hh:mm A')} - {t.endTime?.format('hh:mm A')}
              </td>
              <td>{t.location}</td>
              <td>{t.priority}</td>
              <td>
                <button onClick={() => removeTask(idx)}>❌</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className={styles.generateButton} onClick={goToSchedule}>
        Go to Generated Schedule
      </button>
      <DayTimeline tasks={taskList} />
    </div>
  );
};

export default TaskInputPage;
