import { AppData, FrictionLog, FrictionPattern } from '../data/types';
import { format, parseISO, subDays, addDays, differenceInCalendarDays } from 'date-fns';

export const FRICTION_PATTERNS: FrictionPattern[] = [
  { id: 'dsa_revision_skip', label: 'Skipped DSA revision, did new topics only', tag: 'fear', category: 'avoidance_fear' },
  { id: 'gsoc_avoidance', label: 'Avoided GSoC / open source (made an excuse)', tag: 'avoidance', category: 'avoidance_fear' },
  { id: 'lc_contest_skip', label: 'Skipped or feared LC contest', tag: 'fear', category: 'avoidance_fear' },
  { id: 'reels', label: 'Reels / mindless scroll session', tag: 'time_waste', category: 'time_waste' },
  { id: 'group_chat_overdraft', label: 'Group chat / unproductive social time (30+ min)', tag: 'time_waste', category: 'time_waste' },
  { id: 'phone_in_bed', label: 'Phone use in bed after lights out', tag: 'sleep_drift', category: 'sleep' },
  { id: 'slept_late_woke_late', label: 'Slept late → woke late (cycle continued)', tag: 'sleep_drift', category: 'sleep' },
];

// Save a friction entry for a given date using the provided updateAppData callback.
export function saveFrictionLog(updateAppData: (u: any) => void, dateStr: string, entry: Partial<FrictionLog>) {
  const now = format(new Date(), 'HH:mm');
  updateAppData((prev: AppData) => {
    const prevDay = prev.daily_logs?.[dateStr] || { date: dateStr };
    const existing: FrictionLog = prevDay.friction || { patterns_fired: [] };
    const merged: FrictionLog = {
      patterns_fired: entry.patterns_fired || existing.patterns_fired || [],
      phone_in_bed: entry.phone_in_bed ?? existing.phone_in_bed,
      trigger_note: entry.trigger_note ?? existing.trigger_note,
      tags_fired: entry.tags_fired ?? existing.tags_fired ?? [],
      logged_at: entry.logged_at ?? existing.logged_at ?? now,
    };

    return {
      ...prev,
      daily_logs: {
        ...prev.daily_logs,
        [dateStr]: {
          ...prevDay,
          date: dateStr,
          friction: merged,
        }
      }
    };
  });
}

export function getFrictionLog(appData: AppData, dateStr: string): FrictionLog | null {
  return appData.daily_logs?.[dateStr]?.friction ?? null;
}

export function getFrictionLogRange(appData: AppData, startISO: string, endISO: string) {
  const start = parseISO(startISO);
  const end = parseISO(endISO);
  const days: { date: string; friction: FrictionLog | null }[] = [];
  for (let d = start; differenceInCalendarDays(end, d) >= 0; d = addDays(d, 1)) {
    const s = format(d, 'yyyy-MM-dd');
    days.push({ date: s, friction: getFrictionLog(appData, s) });
  }
  return days;
}

// Return an array of 7 values for the last 7 days (oldest first). Value is:
// true => pattern fired that day
// false => day logged but pattern did not fire
// null => no log exists for that day
export function getPatternLast7(appData: AppData, patternId: string) {
  const res: (boolean | null)[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    const log = getFrictionLog(appData, d);
    if (!log) {
      res.push(null);
    } else {
      res.push((log.patterns_fired || []).includes(patternId));
    }
  }
  return res;
}

// Current consecutive streak ending today (or yesterday if today has no log)
export function getPatternStreak(appData: AppData, patternId: string) {
  const today = format(new Date(), 'yyyy-MM-dd');
  let cursor = new Date();
  let startDate = today;
  // If today has no log, start from yesterday
  if (!getFrictionLog(appData, today)) {
    cursor = subDays(cursor, 1);
    startDate = format(cursor, 'yyyy-MM-dd');
  }

  let count = 0;
  while (true) {
    const d = format(cursor, 'yyyy-MM-dd');
    const log = getFrictionLog(appData, d);
    if (log && (log.patterns_fired || []).includes(patternId)) {
      count++;
      cursor = subDays(cursor, 1);
    } else {
      break;
    }
  }
  return count;
}

export function countPatternInLastNDays(appData: AppData, patternId: string, n = 30) {
  const today = new Date();
  let cnt = 0;
  for (let i = 0; i < n; i++) {
    const d = format(subDays(today, i), 'yyyy-MM-dd');
    const log = getFrictionLog(appData, d);
    if (log && (log.patterns_fired || []).includes(patternId)) cnt++;
  }
  return cnt;
}
