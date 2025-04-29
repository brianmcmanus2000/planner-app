import { Dayjs } from 'dayjs';

export interface FreeBlock {
  startTime: Dayjs;
  endTime: Dayjs;
  capacity: number;         // minutes
}
export interface LongTermTask {
  name: string;
  duration: number;         // in minutes
  priority: number;         // the “value”
}
export interface Assignment {
  totalValue: number;
  picks: { itemIndex: number; blockIndex: number }[];
}

/**
 * Brute‐force search for best assignment of items to blocks.
 */
export function bruteForceScheduler(
  blocks: FreeBlock[],
  items: LongTermTask[]
): Assignment {
  let best: Assignment = { totalValue: 0, picks: [] };

  function backtrack(
    i: number,
    remaining: number[],
    totalValue: number,
    picks: { itemIndex: number; blockIndex: number }[]
  ) {
    if (i >= items.length) {
      if (totalValue > best.totalValue) {
        best = { totalValue, picks: [...picks] };
      }
      return;
    }

    // Option 1: skip item i
    backtrack(i + 1, remaining, totalValue, picks);

    // Option 2: try to place item i into any block
    for (let b = 0; b < blocks.length; b++) {
      if (remaining[b] >= items[i].duration) {
        remaining[b] -= items[i].duration;
        picks.push({ itemIndex: i, blockIndex: b });
        backtrack(i + 1, remaining, totalValue + items[i].priority, picks);
        picks.pop();
        remaining[b] += items[i].duration;
      }
    }
  }

  backtrack(0, blocks.map((b) => b.capacity), 0, []);
  return best;
}
