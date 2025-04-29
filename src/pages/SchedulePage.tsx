// src/pages/SchedulePage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs, { Dayjs } from 'dayjs';
import styles from './SchedulePage.module.css';
import { rehydrateTasks, RawTask, Task } from '../utils/rehydrateTasks';
import DayTimeline from '../components/DayTimeline';

// import our solver types & fn
import {
  FreeBlock,
  LongTermTask,
  bruteForceScheduler,
  Assignment,
} from '../utils/bruteForceScheduler';

const SchedulePage: React.FC = () => {
  const navigate = useNavigate();

  // 1) load & rehydrate your “fixed” tasks from localStorage
  const saved = localStorage.getItem('taskList');
  const raw: RawTask[] = saved ? JSON.parse(saved) : [];
  const tasks: Task[] = rehydrateTasks(raw);

  // 2) build free time blocks exactly as in DayTimeline logic
// right after rehydrating `tasks`
const timelineStart = dayjs().startOf('day');
const timelineEnd   = timelineStart.add(24, 'hour');

// sort only the fixed tasks
const fixed = tasks
  .filter(t => t.startTime && t.endTime)
  .sort((a, b) => a.startTime!.isBefore(b.startTime!) ? -1 : 1);

// now walk them to carve out free gaps
let cursor = timelineStart;
const freeBlocks: FreeBlock[] = [];

fixed.forEach((t) => {
  // if there's a gap between cursor and this task’s start...
  if (cursor.isBefore(t.startTime!)) {
    const gapStart = cursor;
    const gapEnd   = t.startTime!;
    freeBlocks.push({
      startTime: gapStart,
      endTime:   gapEnd,
      capacity:  gapEnd.diff(gapStart, 'minute'),   // correct capacity
    });
  }
  // move cursor to the later of itself or this task's end
  if (t.endTime!.isAfter(cursor)) {
    cursor = t.endTime!;
  }
});

// finally, gap after the last fixed task until midnight
if (cursor.isBefore(timelineEnd)) {
  freeBlocks.push({
    startTime: cursor,
    endTime:   timelineEnd,
    capacity:  timelineEnd.diff(cursor, 'minute'),
  });
}


  // 3) define your “long-term” tasks (replace these with your real list later)
  const longTermTasks: LongTermTask[] = [
    { name: 'Read Chapter', duration: 45, priority: 8 },
    { name: 'Exercise',     duration: 30, priority: 6 },
    { name: 'Practice Coding', duration: 60, priority: 9 },
  ];

  // 4) run the brute-force solver
  const assignment: Assignment = bruteForceScheduler(freeBlocks, longTermTasks);

  // 5) build new scheduled items out of the picks
  interface ScheduledTask extends Task {}
  const scheduledLongTasks: ScheduledTask[] = [];

  // group picks by block, then offset within each block
  freeBlocks.forEach((block, bIdx) => {
    const picksInBlock = assignment.picks.filter(p => p.blockIndex === bIdx);
    let offset = 0;
    picksInBlock.forEach(({ itemIndex }) => {
      const item = longTermTasks[itemIndex];
      const start = block.startTime.add(offset, 'minute');
      const end   = start.add(item.duration, 'minute');
      scheduledLongTasks.push({
        name: item.name,
        startTime: start,
        endTime:   end,
        location:  '',
        priority:  item.priority,
      });
      offset += item.duration;
    });
  });

  // 6) combine fixed tasks + scheduled long term tasks for the timeline
  const allScheduled = [...tasks, ...scheduledLongTasks];

  return (
    <div className={styles.container}>
      <h2>Generated Schedule</h2>

      {allScheduled.length === 0 ? (
        <p>No tasks to show.</p>
      ) : (
        <>
          {/* visualize the full day with both fixed and long-term blocks */}
          <DayTimeline tasks={allScheduled} />

          {/* optional table for inspection */}
          <table className={styles.scheduleTable}>
            <thead>
              <tr>
                <th>Task</th>
                <th>Start – End</th>
                <th>Type</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {[...tasks, ...scheduledLongTasks].map((t, i) => (
                <tr key={i}>
                  <td>{t.name}</td>
                  <td>
                    {t.startTime?.format('hh:mm A')} – {t.endTime?.format('hh:mm A')}
                  </td>
                  <td>
                    {i < tasks.length ? 'Fixed' : 'Long-term'}
                  </td>
                  <td>{t.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div className={styles.buttonGroup}>
        <button onClick={() => navigate('/tasks')}>Back to Tasks</button>
      </div>
    </div>
  );
};

export default SchedulePage;
