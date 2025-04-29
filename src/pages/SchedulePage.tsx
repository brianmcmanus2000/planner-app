// src/pages/SchedulePage.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import styles from './SchedulePage.module.css';
import DayTimeline from '../components/DayTimeline';
import { rehydrateTasks, RawTask, Task } from '../utils/rehydrateTasks';
import {
  FreeBlock,
  LongTermTask,
  bruteForceScheduler,
  Assignment,
} from '../utils/bruteForceScheduler';

// We'll keep track of the last solver result
interface SolverState {
  assignment: Assignment;
  freeBlocks: FreeBlock[];
}
// Mirror your categories shape
interface Category {
  name: string;
  priority: number;
  defaultDuration: number;
}

const CATEGORIES_KEY = 'categories';

const SchedulePage: React.FC = () => {
  const navigate = useNavigate();

    // 1) Read once & memoize the raw JSON and fixedTasks
    const rawJson = localStorage.getItem('taskList') ?? '[]';
    const raw: RawTask[] = useMemo(() => JSON.parse(rawJson), [rawJson]);
    const fixedTasks: Task[] = useMemo(
      () => rehydrateTasks(raw),
      [raw]
    );

  //
  // 2) Load categories → build initial long-term tasks
  //
  const savedCats = localStorage.getItem(CATEGORIES_KEY);
  const categories: Category[] = savedCats
    ? (JSON.parse(savedCats) as Category[])
    : [];

  // State for long-term tasks (with override)
  const [longTermTasks, setLongTermTasks] = useState<LongTermTask[]>(() =>
    categories.map((c) => ({
      name: c.name,
      duration: c.defaultDuration,
      priority: c.priority,
    }))
  );
  // State to hold the most recent free-blocks & solver assignment
  const [solverState, setSolverState] = useState<SolverState>(() => ({
    assignment: { totalValue: 0, picks: [] },
    freeBlocks: [],
  }));
     
  // Helper to restore the defaults
  const resetLongTerm = () => {
    setLongTermTasks(
      categories.map((c) => ({
        name: c.name,
        duration: c.defaultDuration,
        priority: c.priority,
      }))
    );
  };
   
  // State for solver result
  const [scheduledLongTasks, setScheduledLongTasks] = useState<Task[]>([]);
  //
  // 3) Build free time blocks from fixedTasks
  //
  const buildFreeBlocks = useCallback((): FreeBlock[] => {
    const timelineStart = dayjs().startOf('day');
    const timelineEnd = timelineStart.add(24, 'hour');

    // Sort fixed tasks by start time
    const fixedSorted = fixedTasks
      .filter((t) => t.startTime && t.endTime)
      .sort((a, b) => (a.startTime!.isBefore(b.startTime!) ? -1 : 1));

    let cursor = timelineStart;
    const gaps: FreeBlock[] = [];

    fixedSorted.forEach((t) => {
      if (cursor.isBefore(t.startTime!)) {
        const gapStart = cursor;
        const gapEnd = t.startTime!;
        gaps.push({
          startTime: gapStart,
          endTime: gapEnd,
          capacity: gapEnd.diff(gapStart, 'minute'),
        });
      }
      if (t.endTime!.isAfter(cursor)) {
        cursor = t.endTime!;
      }
    });

    if (cursor.isBefore(timelineEnd)) {
      gaps.push({
        startTime: cursor,
        endTime: timelineEnd,
        capacity: timelineEnd.diff(cursor, 'minute'),
      });
    }

    return gaps;
  }, [fixedTasks]);

  //
  // 4) Recalculate schedule
  //
  const recalcSchedule = useCallback(() => {
    const freeBlocks = buildFreeBlocks();
    const assignment = bruteForceScheduler(freeBlocks, longTermTasks);

    // save for status lookups
    setSolverState({ assignment, freeBlocks });

    // Build Task objects for each pick
    const scheduled: Task[] = [];
    freeBlocks.forEach((block, bIdx) => {
      let offset = 0;
      assignment.picks
        .filter((p) => p.blockIndex === bIdx)
        .forEach(({ itemIndex }) => {
          const item = longTermTasks[itemIndex];
          const start = block.startTime.add(offset, 'minute');
          const end = start.add(item.duration, 'minute');
          scheduled.push({
            name: item.name,
            startTime: start,
            endTime: end,
            location: '',
            priority: item.priority,
          });
          offset += item.duration;
        });
    });

    setScheduledLongTasks(scheduled);
  }, [buildFreeBlocks, longTermTasks]);

  // Initial run
  useEffect(() => {
    recalcSchedule();
  }, [recalcSchedule]);

  //
  // 5) Handlers: override & remove long-term tasks
  //
  const updateDuration = (idx: number, newDur: number) => {
    setLongTermTasks((lts) =>
      lts.map((lt, i) => (i === idx ? { ...lt, duration: newDur } : lt))
    );
  };

  const removeLongTerm = (idx: number) => {
    setLongTermTasks((lts) => lts.filter((_, i) => i !== idx));
  };

  return (
    <div className={styles.container}>
      <h2>Generated Schedule</h2>

      {fixedTasks.length === 0 && longTermTasks.length === 0 ? (
        <p>No tasks or categories found. Please go back and add them first.</p>
      ) : (
        <>
          {/* 6) Combined view */}
          <DayTimeline tasks={[...fixedTasks, ...scheduledLongTasks]} />

          {/* 7) Controls for long-term overrides */}
          <h3>Adjust Today’s Long-Term Tasks</h3>
          {longTermTasks.length === 0 ? (
            <p>All long-term tasks have been removed.</p>
          ) : (
            <table className={styles.overrideTable}>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Default (min)</th>
                  <th>Today’s Duration (min)</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Remove</th>
                </tr>
              </thead>
              <tbody>
                {longTermTasks.map((lt, i) => {
                  // Was this task included?
                  const included = solverState.assignment.picks.some(
                    (p) => p.itemIndex === i
                  );
                  // If not included, decide why:
                  let reason = '';
                  if (!included) {
                    // could it ever fit?
                    const fitsSomewhere = solverState.freeBlocks.some(
                      (b) => b.capacity >= lt.duration
                    );
                    reason = fitsSomewhere
                      ? 'Lower priority'
                      : 'Too long to fit';
                  }                  
                  return (
                    <tr key={i}>
                      <td>{lt.name}</td>
                      <td>
                        {categories.find((c) => c.name === lt.name)?.defaultDuration}
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          value={lt.duration}
                          onChange={(e) => updateDuration(i, parseInt(e.target.value) || 0)}
                        />
                      </td>
                      <td>{lt.priority}</td>
                      <td>
                        {included
                          ? '✅ Included'
                          : `❌ ${reason}`}
                      </td>
                      <td>
                        <button onClick={() => removeLongTerm(i)}>❌</button>
                      </td>
                    </tr>
                 );
               })}
             </tbody>
           </table>
          )}

            <div className={styles.buttonGroup}>
            <button onClick={recalcSchedule}>
              Recalculate Schedule
            </button>
            <button onClick={resetLongTerm}>
              Reset Daily Adjustments
            </button>
             <button onClick={() => navigate('/tasks')}>
               Back to Tasks
             </button>
           </div>
         </>
       )}
     </div>
   );
 };
 
 export default SchedulePage;