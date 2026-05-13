'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Category } from '@/types';
import { Plus, Trash2, Pencil } from 'lucide-react';
import toast from 'react-hot-toast';
import { DEFAULT_CATEGORIES } from '@/utils/habits';

const CATEGORY_ICONS = ['📁', '💚', '💪', '📚', '🧘', '🎯', '👥', '🏠', '✈️', '🎨', '🎵', '💰', '🌿', '⚡', '🔬', '🍎'];
const CATEGORY_COLORS = ['#4a7d4e', '#5b7fa6', '#8b6f9e', '#c4826a', '#7a9e7e', '#6b8fa8', '#a67c9e', '#d4956e'];

export default function CategoriesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: '📁', color: '#4a7d4e' });

  const fetchData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('categories').select('*').eq('user_id', user.id).order('name');
    if (data) setCategories(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSeed() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const toInsert = DEFAULT_CATEGORIES.map((c) => ({ ...c, user_id: user.id }));
    const { error } = await supabase.from('categories').insert(toInsert);
    if (!error) { toast.success('Kategori default ditambahkan!'); fetchData(); }
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingId) {
      const { error } = await supabase.from('categories').update(form).eq('id', editingId);
      if (!error) { toast.success('Kategori diperbarui'); setEditingId(null); fetchData(); }
    } else {
      const { error } = await supabase.from('categories').insert({ ...form, user_id: user.id });
      if (!error) { toast.success('Kategori ditambahkan'); setAdding(false); fetchData(); }
    }
    setForm({ name: '', icon: '📁', color: '#4a7d4e' });
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus kategori ini?')) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) { setCategories((prev) => prev.filter((c) => c.id !== id)); toast.success('Dihapus'); }
  }

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-light text-stone-800">Kategori</h1>
          <p className="text-stone-400 text-sm mt-0.5">{categories.length} kategori</p>
        </div>
        <button
          onClick={() => { setAdding(true); setEditingId(null); setForm({ name: '', icon: '📁', color: '#4a7d4e' }); }}
          className="flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white px-4 py-2.5 rounded-2xl text-sm font-medium transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </div>

      {/* Form */}
      {(adding || editingId) && (
        <div className="bg-white border border-stone-100 rounded-3xl p-5 mb-4 animate-slide-up">
          <h3 className="text-sm font-medium text-stone-600 mb-4">
            {editingId ? 'Edit Kategori' : 'Kategori Baru'}
          </h3>
          <input
            type="text"
            placeholder="Nama kategori..."
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sage-300 mb-4"
          />
          <div className="mb-4">
            <p className="text-xs text-stone-400 mb-2">Icon</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                  className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${form.icon === ic ? 'bg-sage-100 ring-2 ring-sage-400' : 'bg-stone-50 hover:bg-stone-100'}`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <p className="text-xs text-stone-400 mb-2">Warna</p>
            <div className="flex gap-2 flex-wrap">
              {CATEGORY_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full transition-all ${form.color === c ? 'ring-2 ring-offset-2 ring-stone-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex-1 py-2.5 bg-sage-500 text-white rounded-2xl text-sm font-medium">
              Simpan
            </button>
            <button
              onClick={() => { setAdding(false); setEditingId(null); }}
              className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-2xl text-sm font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      {/* Empty state with seed */}
      {!loading && categories.length === 0 && (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">📁</p>
          <p className="text-stone-500 font-medium mb-1">Belum ada kategori</p>
          <p className="text-stone-400 text-sm mb-4">Buat sendiri atau pakai kategori default</p>
          <button onClick={handleSeed} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-2xl text-sm font-medium transition-all">
            Pakai Kategori Default
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-stone-100 rounded-3xl p-4 flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: cat.color + '20' }}
            >
              {cat.icon}
            </div>
            <span className="flex-1 font-medium text-stone-800 text-sm">{cat.name}</span>
            <button
              onClick={() => { setEditingId(cat.id); setAdding(false); setForm({ name: cat.name, icon: cat.icon, color: cat.color }); }}
              className="p-1.5 text-stone-400 hover:text-stone-600"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-stone-400 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
