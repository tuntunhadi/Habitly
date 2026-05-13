'use client';

import { Habit, HabitLog } from '@/types';
import { format, subDays, addDays, isFuture } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface WeekCalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  logs: HabitLog[];
  habits: Habit[];
}

export default function WeekCalendar({ selectedDate, onSelectDate, logs, habits }: WeekCalendarProps) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    return {
      date: format(d, 'yyyy-MM-dd'),
      label: format(d, 'EEE', { locale: localeId }),
      num: format(d, 'd'),
      isFuture: isFuture(addDays(d, 1)),
    };
  });

  function getRate(date: string) {
    if (!habits.length) return 0;
    const dayLogs = logs.filter((l) => l.logged_date === date);
    return dayLogs.length / habits.length;
  }

  return (
    <div className="bg-white border border-stone-100 rounded-3xl p-4">
      <div className="flex justify-between gap-1">
        {days.map(({ date, label, num, isFuture: future }) => {
          const isSelected = date === selectedDate;
          const isToday = date === format(today, 'yyyy-MM-dd');
          const rate = getRate(date);
          const hasActivity = rate > 0;

          return (
            <button
              key={date}
              onClick={() => !future && onSelectDate(date)}
              disabled={future}
              className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-2xl transition-all ${
                isSelected
                  ? 'bg-sage-500 text-white'
                  : future
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-stone-50'
              }`}
            >
              <span className={`text-[10px] font-medium uppercase ${isSelected ? 'text-sage-100' : 'text-stone-400'}`}>
                {label}
              </span>
              <span className={`text-sm font-medium ${isSelected ? 'text-white' : isToday ? 'text-sage-600' : 'text-stone-700'}`}>
                {num}
              </span>
              {/* Activity dot */}
              <div className={`w-1.5 h-1.5 rounded-full ${
                isSelected
                  ? rate === 1 ? 'bg-white' : rate > 0 ? 'bg-sage-200' : 'bg-sage-300/50'
                  : hasActivity
                  ? rate === 1 ? 'bg-sage-500' : 'bg-sage-300'
                  : 'bg-transparent'
              }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
