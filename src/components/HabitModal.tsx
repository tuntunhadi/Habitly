'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Habit, Category } from '@/types';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { HABIT_ICONS, HABIT_COLORS } from '@/utils/habits';

interface HabitModalProps {
  habit: Habit | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}

export default function HabitModal({ habit, categories, onClose, onSave }: HabitModalProps) {
  const supabase = createClient();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    icon: '⭐',
    color: '#4a7d4e',
    frequency: 'daily' as 'daily' | 'weekly',
    category_id: '',
    target_count: 1,
  });

  useEffect(() => {
    if (habit) {
      setForm({
        name: habit.name,
        description: habit.description || '',
        icon: habit.icon,
        color: habit.color,
        frequency: habit.frequency,
        category_id: habit.category_id || '',
        target_count: habit.target_count,
      });
    }
  }, [habit]);

  function set(key: string, value: string | number) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.name.trim()) { toast.error('Nama habit harus diisi'); return; }
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      icon: form.icon,
      color: form.color,
      frequency: form.frequency,
      category_id: form.category_id || null,
      target_count: form.target_count,
    };

    if (habit) {
      const { error } = await supabase.from('habits').update(payload).eq('id', habit.id);
      if (error) { toast.error('Gagal menyimpan'); setSaving(false); return; }
      toast.success('Habit diperbarui');
    } else {
      const { error } = await supabase.from('habits').insert({ ...payload, user_id: user.id });
      if (error) { toast.error('Gagal menyimpan'); setSaving(false); return; }
      toast.success('Habit ditambahkan! 🌱');
    }

    onSave();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl p-6 pb-10 animate-slide-up max-h-[90dvh] overflow-y-auto">
        {/* Handle */}
        <div className="w-10 h-1 bg-stone-200 rounded-full mx-auto mb-5" />

        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-light text-stone-800">
            {habit ? 'Edit Habit' : 'Habit Baru'}
          </h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview */}
        <div className="flex items-center gap-3 bg-stone-50 rounded-2xl p-4 mb-5">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
            style={{ backgroundColor: form.color + '25' }}
          >
            {form.icon}
          </div>
          <div>
            <p className="font-medium text-stone-800">{form.name || 'Nama habit...'}</p>
            <p className="text-xs text-stone-400 capitalize">{form.frequency === 'daily' ? 'Setiap hari' : 'Setiap minggu'}</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">Nama *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Minum air 8 gelas..."
              maxLength={50}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">Deskripsi</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Opsional..."
              maxLength={100}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">Frekuensi</label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => set('frequency', f)}
                  className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    form.frequency === f
                      ? 'bg-sage-500 text-white'
                      : 'bg-stone-50 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {f === 'daily' ? 'Setiap Hari' : 'Mingguan'}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div>
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">Kategori</label>
              <select
                value={form.category_id}
                onChange={(e) => set('category_id', e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
              >
                <option value="">Tanpa kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Icon picker */}
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">Icon</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => set('icon', ic)}
                  className={`w-10 h-10 rounded-xl text-lg flex items-center justify-center transition-all ${
                    form.icon === ic ? 'bg-sage-100 ring-2 ring-sage-400' : 'bg-stone-50 hover:bg-stone-100'
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">Warna</label>
            <div className="flex gap-3 flex-wrap">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => set('color', c)}
                  className={`w-8 h-8 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-stone-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full mt-6 py-4 bg-sage-500 hover:bg-sage-600 disabled:opacity-60 text-white font-medium rounded-2xl transition-all text-sm"
        >
          {saving ? 'Menyimpan...' : habit ? 'Simpan Perubahan' : 'Tambah Habit'}
        </button>
      </div>
    </div>
  );
}
