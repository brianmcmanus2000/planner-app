import dayjs, { Dayjs } from 'dayjs';

export interface RawTask {
  name: string;
  startTime: string | Dayjs | null;
  endTime: string | Dayjs | null;
  location: string;
  priority: number;
}

export interface Task {
  name: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  location: string;
  priority: number;
}

export function rehydrateTasks(rawTasks: RawTask[]): Task[] {
  return rawTasks.map(task => ({
    name: task.name,
    startTime: task.startTime != null ? dayjs(task.startTime) : null,
    endTime:   task.endTime   != null ? dayjs(task.endTime)   : null,
    location: task.location,
    priority: task.priority,
  }));
}
