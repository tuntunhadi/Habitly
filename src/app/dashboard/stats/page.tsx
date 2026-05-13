'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Habit, HabitLog } from '@/types';
import { format, subDays, eachDayOfInterval, startOfWeek, endOfWeek } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { calculateStreak, calculateBestStreak, getCompletionRate, getLast30Days } from '@/utils/habits';
import { Flame, Trophy, TrendingUp, Calendar } from 'lucide-react';

export default function StatsPage() {
  const supabase = createClient();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [habitsRes, logsRes] = await Promise.all([
      supabase.from('habits').select('*, category:categories(*)').eq('user_id', user.id).eq('is_active', true),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('logged_date', format(subDays(new Date(), 90), 'yyyy-MM-dd')),
    ]);

    if (habitsRes.data) setHabits(habitsRes.data as Habit[]);
    if (logsRes.data) setLogs(logsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const last30 = getLast30Days();
  const today = format(new Date(), 'yyyy-MM-dd');

  // Overall stats
  const totalCompletions = logs.length;
  const uniqueDays = new Set(logs.map((l) => l.logged_date)).size;
  const overallRate = getCompletionRate(logs, 30);

  // Per-habit stats
  const habitStats = habits.map((habit) => {
    const habitLogs = logs.filter((l) => l.habit_id === habit.id);
    return {
      ...habit,
      streak: calculateStreak(habitLogs),
      bestStreak: calculateBestStreak(habitLogs),
      completionRate: getCompletionRate(habitLogs, 30),
      totalDone: habitLogs.length,
    };
  }).sort((a, b) => b.streak - a.streak);

  // Heatmap data (last 30 days)
  const heatmapData = last30.map((date) => {
    const dayLogs = logs.filter((l) => l.logged_date === date);
    const rate = habits.length > 0 ? dayLogs.length / habits.length : 0;
    return { date, rate, count: dayLogs.length };
  });

  // Best day of week
  const dayStats = [0, 1, 2, 3, 4, 5, 6].map((dow) => {
    const dayLogs = logs.filter((l) => new Date(l.logged_date + 'T00:00:00').getDay() === dow);
    return { dow, count: dayLogs.length };
  });
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const maxDayCount = Math.max(...dayStats.map((d) => d.count), 1);

  if (loading) {
    return (
      <div className="px-5 pt-12 space-y-4">
        <div className="skeleton h-8 w-32 rounded-xl" />
        <div className="skeleton h-36 rounded-3xl" />
        <div className="skeleton h-48 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in space-y-5">
      <div>
        <h1 className="font-display text-2xl font-light text-stone-800">Statistik</h1>
        <p className="text-stone-400 text-sm mt-0.5">30 hari terakhir</p>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<Flame className="w-5 h-5 text-orange-400" />} label="Total Check-in" value={totalCompletions.toString()} bg="bg-orange-50" />
        <StatCard icon={<Calendar className="w-5 h-5 text-blue-400" />} label="Hari Aktif" value={uniqueDays.toString()} bg="bg-blue-50" />
        <StatCard icon={<TrendingUp className="w-5 h-5 text-sage-500" />} label="Completion Rate" value={`${overallRate}%`} bg="bg-sage-50" />
        <StatCard icon={<Trophy className="w-5 h-5 text-sand-500" />} label="Total Habit" value={habits.length.toString()} bg="bg-sand-50" />
      </div>

      {/* Heatmap */}
      <div className="bg-white border border-stone-100 rounded-3xl p-5">
        <h3 className="text-sm font-medium text-stone-600 mb-4">Aktivitas 30 Hari</h3>
        <div className="grid grid-cols-[repeat(30,1fr)] gap-1">
          {heatmapData.map(({ date, rate }) => (
            <div
              key={date}
              className="aspect-square rounded-sm"
              style={{
                backgroundColor: rate === 0
                  ? '#f5f5f4'
                  : rate < 0.4
                  ? '#c2d9c3'
                  : rate < 0.7
                  ? '#649968'
                  : '#3a633d',
              }}
              title={`${date}: ${Math.round(rate * 100)}%`}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 mt-3">
          <span className="text-xs text-stone-400">Sedikit</span>
          {['#f5f5f4', '#c2d9c3', '#649968', '#3a633d'].map((c) => (
            <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
          ))}
          <span className="text-xs text-stone-400">Banyak</span>
        </div>
      </div>

      {/* Day of week */}
      <div className="bg-white border border-stone-100 rounded-3xl p-5">
        <h3 className="text-sm font-medium text-stone-600 mb-4">Hari Terbaik</h3>
        <div className="flex items-end gap-2 h-20">
          {dayStats.map(({ dow, count }) => (
            <div key={dow} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg transition-all"
                style={{
                  height: `${(count / maxDayCount) * 64}px`,
                  backgroundColor: count === Math.max(...dayStats.map(d => d.count)) ? '#4a7d4e' : '#c2d9c3',
                  minHeight: count > 0 ? '4px' : '0',
                }}
              />
              <span className="text-xs text-stone-400">{dayNames[dow]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per habit */}
      <div className="bg-white border border-stone-100 rounded-3xl p-5">
        <h3 className="text-sm font-medium text-stone-600 mb-4">Per Habit</h3>
        <div className="space-y-4">
          {habitStats.map((habit) => (
            <div key={habit.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base">{habit.icon}</span>
                  <span className="text-sm font-medium text-stone-700">{habit.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-stone-400">
                  <span>🔥 {habit.streak}</span>
                  <span>🏆 {habit.bestStreak}</span>
                  <span className="font-medium text-stone-600">{habit.completionRate}%</span>
                </div>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${habit.completionRate}%`,
                    backgroundColor: habit.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, bg
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-3xl p-4`}>
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-display font-light text-stone-800">{value}</p>
      <p className="text-xs text-stone-500 mt-0.5">{label}</p>
    </div>
  );
}
