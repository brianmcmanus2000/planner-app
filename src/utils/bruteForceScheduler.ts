// src/utils/bruteForceScheduler.ts
import { Dayjs } from 'dayjs';

export interface FreeBlock {
  startTime: Dayjs;
  endTime:   Dayjs;
  capacity:  number;   // in minutes
}
export interface LongTermTask {
  name:     string;
  duration: number;    // in minutes
  priority: number;    // “value”
}
export interface Assignment {
  totalValue: number;
  picks:      { itemIndex: number; blockIndex: number }[];
}

export function bruteForceScheduler(
  blocks: FreeBlock[],
  items:  LongTermTask[]
): Assignment {
  // We’ll track an extra field `emptyBlocks` for tie-breaking
  type Best = Assignment & { emptyBlocks: number };
  let best: Best = { totalValue: 0, picks: [], emptyBlocks: Infinity };

  function backtrack(
    i:        number,
    remaining: number[],
    totalValue: number,
    picks:      { itemIndex: number; blockIndex: number }[]
  ) {
    if (i === items.length) {
      // compute how many blocks got **no** picks
      const used = new Set(picks.map(p => p.blockIndex)).size;
      const empties = blocks.length - used;

      // update if strictly better value, or equal-value but fewer empties
      if (
        totalValue > best.totalValue ||
        (totalValue === best.totalValue && empties < best.emptyBlocks)
      ) {
        best = { totalValue, picks: [...picks], emptyBlocks: empties };
      }
      return;
    }

    // 1) skip this item
    backtrack(i + 1, remaining, totalValue, picks);

    // 2) try placing it in each block
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

  backtrack(0, blocks.map(b => b.capacity), 0, []);
  // strip off the helper field
  const { emptyBlocks, ...res } = best;
  return res;
}
