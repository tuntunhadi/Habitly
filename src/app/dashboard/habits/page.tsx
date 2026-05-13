'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Habit, Category } from '@/types';
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import HabitModal from '@/components/HabitModal';
import toast from 'react-hot-toast';

export default function HabitsPage() {
  const supabase = createClient();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [habitsRes, catsRes] = await Promise.all([
      supabase.from('habits').select('*, category:categories(*)').eq('user_id', user.id).order('sort_order'),
      supabase.from('categories').select('*').eq('user_id', user.id).order('name'),
    ]);

    if (habitsRes.data) setHabits(habitsRes.data as Habit[]);
    if (catsRes.data) setCategories(catsRes.data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleToggleActive(habit: Habit) {
    const { error } = await supabase
      .from('habits')
      .update({ is_active: !habit.is_active })
      .eq('id', habit.id);

    if (!error) {
      setHabits((prev) => prev.map((h) => h.id === habit.id ? { ...h, is_active: !h.is_active } : h));
      toast(habit.is_active ? 'Habit dinonaktifkan' : 'Habit diaktifkan');
    }
  }

  async function handleDelete(habitId: string) {
    if (!confirm('Hapus habit ini? Semua log akan ikut terhapus.')) return;

    const { error } = await supabase.from('habits').delete().eq('id', habitId);
    if (!error) {
      setHabits((prev) => prev.filter((h) => h.id !== habitId));
      toast.success('Habit dihapus');
    }
  }

  function handleEdit(habit: Habit) {
    setEditingHabit(habit);
    setModalOpen(true);
  }

  function handleAdd() {
    setEditingHabit(null);
    setModalOpen(true);
  }

  const activeHabits = habits.filter((h) => h.is_active);
  const inactiveHabits = habits.filter((h) => !h.is_active);

  if (loading) {
    return (
      <div className="px-5 pt-12 space-y-4">
        <div className="skeleton h-8 w-32 rounded-xl" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-light text-stone-800">Habits</h1>
          <p className="text-stone-400 text-sm mt-0.5">{activeHabits.length} aktif</p>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white px-4 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {habits.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-4">🌱</p>
          <p className="text-stone-500 font-medium">Belum ada habit</p>
          <p className="text-stone-400 text-sm mt-1">Tap "Tambah" untuk mulai</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active habits */}
          <div className="space-y-3">
            {activeHabits.map((habit) => (
              <HabitListItem
                key={habit.id}
                habit={habit}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggle={handleToggleActive}
              />
            ))}
          </div>

          {/* Inactive habits */}
          {inactiveHabits.length > 0 && (
            <div>
              <p className="text-xs font-medium text-stone-400 uppercase tracking-wider mb-3">
                Tidak aktif
              </p>
              <div className="space-y-3 opacity-60">
                {inactiveHabits.map((habit) => (
                  <HabitListItem
                    key={habit.id}
                    habit={habit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggleActive}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {modalOpen && (
        <HabitModal
          habit={editingHabit}
          categories={categories}
          onClose={() => setModalOpen(false)}
          onSave={() => { setModalOpen(false); fetchData(); }}
        />
      )}
    </div>
  );
}

function HabitListItem({
  habit,
  onEdit,
  onDelete,
  onToggle,
}: {
  habit: Habit;
  onEdit: (h: Habit) => void;
  onDelete: (id: string) => void;
  onToggle: (h: Habit) => void;
}) {
  return (
    <div className="bg-white border border-stone-100 rounded-3xl p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: habit.color + '20' }}
      >
        {habit.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-stone-800 text-sm truncate">{habit.name}</p>
        <p className="text-xs text-stone-400 capitalize">
          {habit.frequency === 'daily' ? 'Setiap hari' : 'Setiap minggu'}
          {habit.category && ` · ${(habit.category as Category).name}`}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onToggle(habit)}
          className="p-1.5 text-stone-400 hover:text-sage-500 transition-colors"
        >
          {habit.is_active
            ? <ToggleRight className="w-5 h-5 text-sage-500" />
            : <ToggleLeft className="w-5 h-5" />
          }
        </button>
        <button
          onClick={() => onEdit(habit)}
          className="p-1.5 text-stone-400 hover:text-stone-600 transition-colors"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(habit.id)}
          className="p-1.5 text-stone-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
