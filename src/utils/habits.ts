import { HabitLog } from '@/types';
import { format, subDays, eachDayOfInterval } from 'date-fns';

export function calculateStreak(logs: HabitLog[]): number {
  if (!logs.length) return 0;

  const logDates = new Set(logs.map((l) => l.logged_date));
  let streak = 0;
  let date = new Date();

  // Check today first, if not done start from yesterday
  if (!logDates.has(format(date, 'yyyy-MM-dd'))) {
    date = subDays(date, 1);
  }

  while (logDates.has(format(date, 'yyyy-MM-dd'))) {
    streak++;
    date = subDays(date, 1);
  }

  return streak;
}

export function calculateBestStreak(logs: HabitLog[]): number {
  if (!logs.length) return 0;

  const logDates = logs.map((l) => l.logged_date).sort();
  let best = 1;
  let current = 1;

  for (let i = 1; i < logDates.length; i++) {
    const prev = new Date(logDates[i - 1]);
    const curr = new Date(logDates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
      best = Math.max(best, current);
    } else if (diff > 1) {
      current = 1;
    }
  }

  return best;
}

export function getCompletionRate(logs: HabitLog[], days = 30): number {
  if (!logs.length) return 0;

  const end = new Date();
  const start = subDays(end, days - 1);
  const range = eachDayOfInterval({ start, end });
  const logDates = new Set(logs.map((l) => l.logged_date));

  const completed = range.filter((d) => logDates.has(format(d, 'yyyy-MM-dd'))).length;
  return Math.round((completed / range.length) * 100);
}

export function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), 6 - i), 'yyyy-MM-dd')
  );
}

export function getLast30Days(): string[] {
  return Array.from({ length: 30 }, (_, i) =>
    format(subDays(new Date(), 29 - i), 'yyyy-MM-dd')
  );
}

export const HABIT_ICONS = [
  '💧', '🏃', '📚', '🧘', '💪', '🍎', '😴', '✍️',
  '🎯', '🧠', '💊', '🚴', '🎵', '🌿', '☕', '🍵',
  '🧹', '💻', '📝', '🛁', '🌅', '🌙', '❤️', '🔥',
  '⭐', '🎨', '🏋️', '🤸', '🥗', '🦷', '👁️', '🙏',
];

export const HABIT_COLORS = [
  '#4a7d4e', '#5b7fa6', '#8b6f9e', '#c4826a',
  '#7a9e7e', '#6b8fa8', '#a67c9e', '#d4956e',
  '#4e8b8b', '#7a6fa6', '#a68b5b', '#6e9e7a',
  '#8b7a6e', '#6e8b8b', '#9e7a8b', '#8b8b6e',
];

export const DEFAULT_CATEGORIES = [
  { name: 'Health', icon: '💚', color: '#4a7d4e' },
  { name: 'Fitness', icon: '💪', color: '#5b7fa6' },
  { name: 'Learning', icon: '📚', color: '#8b6f9e' },
  { name: 'Mindfulness', icon: '🧘', color: '#c4826a' },
  { name: 'Productivity', icon: '🎯', color: '#6b8fa8' },
  { name: 'Social', icon: '👥', color: '#a67c9e' },
];
