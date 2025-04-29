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
  const timelineStartHour = 0; // midnight
  const timelineEndHour = 24;  // end of day
  const totalTimelineMinutes = (timelineEndHour - timelineStartHour) * 60;

  const minutesSinceStart = (time: Dayjs) => {
    return (time.hour() - timelineStartHour) * 60 + time.minute();
  };

  const durationMinutes = (start: Dayjs, end: Dayjs) => {
    return end.diff(start, 'minute');
  };

  function getColorFromName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      // a simple but decent string hash
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // keep it a 32-bit int
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 80%)`;
  }

  const hours = Array.from({ length: timelineEndHour - timelineStartHour }, (_, i) => timelineStartHour + i);

  const isOverlapping = (a: Task, b: Task) => {
    if (!a.startTime || !a.endTime || !b.startTime || !b.endTime) return false;
    return a.startTime.isBefore(b.endTime) && b.startTime.isBefore(a.endTime);
  };

  // Build combined task + free blocks
  type TimelineBlock = {
    type: 'task' | 'free';
    name: string;
    startTime: Dayjs;
    endTime: Dayjs;
    color?: string;
  };

  const blocks: TimelineBlock[] = [];

  const sortedTasks = [...tasks].filter(t => t.startTime && t.endTime).sort((a, b) =>
    a.startTime!.isBefore(b.startTime!) ? -1 : 1
  );
  
  let timelineCursor = sortedTasks.length > 0
    ? sortedTasks[0].startTime!.startOf('day').hour(timelineStartHour).minute(0)
    : null;
  
  // Go through each task
  for (let i = 0; i < sortedTasks.length; i++) {
    const current = sortedTasks[i];
  
    if (!timelineCursor) {
      timelineCursor = current.startTime!;
    }
  
    // If there is a gap between the last end and this start
    const gapMinutes = durationMinutes(timelineCursor, current.startTime!);
    if (gapMinutes >= 30) {
      blocks.push({
        type: 'free',
        name: 'Available',
        startTime: timelineCursor,
        endTime: current.startTime!,
      });
    }
  
    // Insert the task block
    blocks.push({
      type: 'task',
      name: current.name,
      startTime: current.startTime!,
      endTime: current.endTime!,
    });
  
    // Move the timeline cursor to the **later** of current cursor or task's end
    if (!timelineCursor || current.endTime!.isAfter(timelineCursor)) {
      timelineCursor = current.endTime!;
    }
  }
  
  // Handle free time after last task
  if (timelineCursor && timelineCursor.hour() < timelineEndHour) {
    const timelineEnd = timelineCursor.startOf('day').hour(timelineEndHour - 1).minute(59);
    if (timelineCursor.isBefore(timelineEnd)) {
      blocks.push({
        type: 'free',
        name: 'Available',
        startTime: timelineCursor,
        endTime: timelineEnd,
      });
    }
  }
  

  return (
    <div className={styles.timelineWrapper}>
      <div className={styles.hourLabels}>
        {hours.map((hour) => (
          <div key={hour} className={styles.hourLabel}>
            {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
          </div>
        ))}
      </div>

      <div className={styles.timelineContainer}>
      {blocks.map((block, idx) => {
        const top = (minutesSinceStart(block.startTime) / totalTimelineMinutes) * 100;
        const height = (durationMinutes(block.startTime, block.endTime) / totalTimelineMinutes) * 100;

        let overlapShift = 0;
        if (block.type === 'task') {
            for (let j = 0; j < idx; j++) {
            const previous = blocks[j];
            if (previous.type === 'task' && isOverlapping(
                { startTime: previous.startTime, endTime: previous.endTime, name: '', location: '', priority: 0 },
                { startTime: block.startTime, endTime: block.endTime, name: '', location: '', priority: 0 }
            )) {
                overlapShift += 30;
            }
            }
        }

        const blockDurationMinutes = durationMinutes(block.startTime, block.endTime);

        return (
            <div
            key={idx}
            className={block.type === 'task' ? styles.taskBlock : styles.freeBlock}
            style={{
                top: `${top}%`,
                height: `${height}%`,
                backgroundColor:
                block.type === 'task'
                  ? getColorFromName(block.name)
                  : '#ddd',
                transform: block.type === 'task' ? `translateX(${overlapShift}px)` : undefined,
            }}
            >
            {block.type === 'task'
                ? block.name
                : blockDurationMinutes >= 30
                ? block.name
                : ''}
            </div>
        );
        })}
      </div>
    </div>
  );
};

export default DayTimeline;
