import React, { useMemo } from 'react';
import { Dayjs } from 'dayjs';
import styles from './DayTimeline.module.css';

interface Task {
  name: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  location: string;
  priority: number;
}

interface DayTimelineProps {
  tasks: Task[];
}

const DayTimeline: React.FC<DayTimelineProps> = ({ tasks }) => {
  const timelineStartHour = 0;
  const timelineEndHour = 24;
  const totalTimelineMinutes = (timelineEndHour - timelineStartHour) * 60;

  const minutesSinceStart = (time: Dayjs) => {
    return (time.hour() - timelineStartHour) * 60 + time.minute();
  };

  const durationMinutes = (start: Dayjs, end: Dayjs) => {
    return end.diff(start, 'minute');
  };

  const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 80%)`; // pastel colors
  };

  // Memoize random colors so they don't change every re-render
  const taskColors = useMemo(() => {
    return tasks.map(() => generateRandomColor());
  }, [tasks.length]);

  const hours = Array.from({ length: timelineEndHour - timelineStartHour + 1 }, (_, i) => timelineStartHour + i);

  const isOverlapping = (a: Task, b: Task) => {
    if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) return false;
    return a.startTime.isBefore(b.endTime) && b.startTime.isBefore(a.endTime);
  };

  return (
    <div className={styles.timelineWrapper}>
      <div className={styles.hourLabels}>
        {hours.map((hour) => (
          <div key={hour} className={styles.hourLabel}>
            {hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
          </div>
        ))}
      </div>

      <div className={styles.timelineContainer}>
        {tasks.map((task, idx) => {
          if (!task.startTime || !task.endTime) return null;

          const top = (minutesSinceStart(task.startTime) / totalTimelineMinutes) * 100;
          const height = (durationMinutes(task.startTime, task.endTime) / totalTimelineMinutes) * 100;

          // Calculate overlap shift
          let overlapShift = 0;
          for (let j = 0; j < idx; j++) {
            if (isOverlapping(tasks[j], task)) {
              overlapShift += 20; // shift 20px for each overlap
            }
          }

          return (
            <div
              key={idx}
              className={styles.taskBlock}
              style={{
                top: `${top}%`,
                height: `${height}%`,
                left: `${overlapShift}px`,
                backgroundColor: taskColors[idx],
              }}
            >
              {task.name}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayTimeline;
