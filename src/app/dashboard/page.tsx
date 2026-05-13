'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Habit, HabitLog, Profile } from '@/types';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import HabitCard from '@/components/HabitCard';
import StatsBar from '@/components/StatsBar';
import WeekCalendar from '@/components/WeekCalendar';
import EmptyState from '@/components/EmptyState';
import { Leaf } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const supabase = createClient();
  const today = format(new Date(), 'yyyy-MM-dd');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(today);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [profileRes, habitsRes, logsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('habits').select('*, category:categories(*)').eq('user_id', user.id).eq('is_active', true).order('sort_order'),
      supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('logged_date', format(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), 'yyyy-MM-dd')),
    ]);

    if (profileRes.data) setProfile(profileRes.data);
    if (habitsRes.data) setHabits(habitsRes.data as Habit[]);
    if (logsRes.data) setLogs(logsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleToggleLog(habitId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const existingLog = logs.find(
      (l) => l.habit_id === habitId && l.logged_date === selectedDate
    );

    if (existingLog) {
      const { error } = await supabase.from('habit_logs').delete().eq('id', existingLog.id);
      if (!error) {
        setLogs((prev) => prev.filter((l) => l.id !== existingLog.id));
        toast('Dibatalkan', { icon: '↩️' });
      }
    } else {
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, logged_date: selectedDate })
        .select()
        .single();

      if (!error && data) {
        setLogs((prev) => [...prev, data]);
        toast.success('Selesai! 🎉');
      }
    }
  }

  const todayLogs = logs.filter((l) => l.logged_date === selectedDate);
  const completedCount = todayLogs.length;
  const totalCount = habits.length;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Selamat pagi';
    if (h < 17) return 'Selamat siang';
    return 'Selamat malam';
  };

  if (loading) {
    return (
      <div className="px-5 pt-12 space-y-4 animate-fade-in">
        <div className="skeleton h-8 w-48 rounded-xl" />
        <div className="skeleton h-4 w-32 rounded-xl" />
        <div className="skeleton h-24 rounded-3xl mt-6" />
        <div className="skeleton h-20 rounded-3xl" />
        <div className="skeleton h-20 rounded-3xl" />
        <div className="skeleton h-20 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-stone-400 text-sm font-light">{greeting()},</p>
            <h1 className="font-display text-2xl font-light text-stone-800 mt-0.5">
              {profile?.full_name?.split(' ')[0] || 'Kamu'} 👋
            </h1>
          </div>
          <div className="flex items-center gap-1.5 bg-sage-50 border border-sage-100 rounded-2xl px-3 py-2">
            <Leaf className="w-3.5 h-3.5 text-sage-500" strokeWidth={2} />
            <span className="text-xs font-medium text-sage-600">
              {completedCount}/{totalCount} hari ini
            </span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="px-5 mb-4">
        <StatsBar habits={habits} logs={logs} completedToday={completedCount} total={totalCount} />
      </div>

      {/* Week Calendar */}
      <div className="px-5 mb-6">
        <WeekCalendar
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          logs={logs}
          habits={habits}
        />
      </div>

      {/* Habits List */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-stone-500 uppercase tracking-wider">
            {selectedDate === today
              ? 'Hari ini'
              : format(new Date(selectedDate + 'T00:00:00'), 'EEEE, d MMM', { locale: localeId })}
          </h2>
          {completedCount > 0 && completedCount === totalCount && (
            <span className="text-xs text-sage-500 font-medium">✨ Semua selesai!</span>
          )}
        </div>

        {habits.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-3 pb-4">
            {habits.map((habit, i) => {
              const log = logs.find(
                (l) => l.habit_id === habit.id && l.logged_date === selectedDate
              );
              const habitLogs = logs.filter((l) => l.habit_id === habit.id);
              return (
                <div
                  key={habit.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <HabitCard
                    habit={habit}
                    log={log}
                    habitLogs={habitLogs}
                    onToggle={() => handleToggleLog(habit.id)}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
