'use client';

import { Habit, HabitLog } from '@/types';
import { calculateStreak } from '@/utils/habits';
import { format } from 'date-fns';

interface StatsBarProps {
  habits: Habit[];
  logs: HabitLog[];
  completedToday: number;
  total: number;
}

export default function StatsBar({ habits, logs, completedToday, total }: StatsBarProps) {
  const progressPercent = total > 0 ? Math.round((completedToday / total) * 100) : 0;

  // Overall streak: days where at least 1 habit was done
  const allDates = [...new Set(logs.map((l) => l.logged_date))].map((d) => ({
    habit_id: 'all',
    logged_date: d,
    id: d,
    user_id: '',
    count: 1,
    note: null,
    created_at: '',
  }));
  const overallStreak = calculateStreak(allDates);

  return (
    <div className="bg-white border border-stone-100 rounded-3xl p-5">
      {/* Progress */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
          Progress hari ini
        </span>
        <span className="text-sm font-medium text-stone-700">
          {completedToday}/{total}
        </span>
      </div>

      <div className="h-2.5 bg-stone-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progressPercent}%`,
            background: progressPercent === 100
              ? 'linear-gradient(90deg, #4a7d4e, #649968)'
              : 'linear-gradient(90deg, #649968, #95bc97)',
          }}
        />
      </div>

      {/* Mini stats */}
      <div className="flex gap-4">
        <div className="flex-1 text-center">
          <p className="font-display text-xl font-light text-stone-800">{progressPercent}%</p>
          <p className="text-xs text-stone-400">Selesai</p>
        </div>
        <div className="w-px bg-stone-100" />
        <div className="flex-1 text-center">
          <p className="font-display text-xl font-light text-stone-800">{overallStreak}</p>
          <p className="text-xs text-stone-400">Streak</p>
        </div>
        <div className="w-px bg-stone-100" />
        <div className="flex-1 text-center">
          <p className="font-display text-xl font-light text-stone-800">{total - completedToday}</p>
          <p className="text-xs text-stone-400">Tersisa</p>
        </div>
      </div>
    </div>
  );
}
