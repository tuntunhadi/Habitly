'use client';

import { Habit, HabitLog } from '@/types';
import { calculateStreak } from '@/utils/habits';
import { Check, Flame } from 'lucide-react';
import { useState } from 'react';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  habitLogs: HabitLog[];
  onToggle: () => void;
}

export default function HabitCard({ habit, log, habitLogs, onToggle }: HabitCardProps) {
  const [animating, setAnimating] = useState(false);
  const isDone = !!log;
  const streak = calculateStreak(habitLogs);

  function handleToggle() {
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);
    onToggle();
  }

  return (
    <div
      className={`bg-white border rounded-3xl p-4 flex items-center gap-4 transition-all ${
        isDone ? 'border-stone-100' : 'border-stone-100'
      }`}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 transition-all"
        style={{
          backgroundColor: isDone ? habit.color + '25' : habit.color + '12',
        }}
      >
        <span className={isDone ? '' : 'opacity-70'}>{habit.icon}</span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${isDone ? 'text-stone-500 line-through' : 'text-stone-800'}`}>
          {habit.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {streak > 0 && (
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-stone-400">{streak} hari</span>
            </div>
          )}
          {habit.description && (
            <p className="text-xs text-stone-400 truncate">{habit.description}</p>
          )}
        </div>
      </div>

      {/* Check button */}
      <button
        onClick={handleToggle}
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all border-2 ${
          animating ? 'animate-check' : ''
        } ${
          isDone
            ? 'border-transparent text-white'
            : 'border-stone-200 text-transparent hover:border-stone-300'
        }`}
        style={isDone ? { backgroundColor: habit.color } : {}}
      >
        <Check className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
}
