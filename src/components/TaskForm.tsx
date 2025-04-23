import React, { useState } from 'react';

type Task = {
  name: string;
  priority: number;
};

export const TaskForm = ({ onSubmit }: { onSubmit: (task: Task) => void }) => {
  const [name, setName] = useState('');
  const [priority, setPriority] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, priority });
    setName('');
    setPriority(5);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Task name" required />
      <input type="number" value={priority} onChange={e => setPriority(Number(e.target.value))} min={1} max={10} />
      <button type="submit">Add Task</button>
    </form>
  );
};
