'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Profile } from '@/types';
import { LogOut, User, Shield, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    setIsPWA(window.matchMedia('(display-mode: standalone)').matches);
  }, []);

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) {
      setProfile(data);
      setFullName(data.full_name || '');
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update({ full_name: fullName }).eq('id', profile.id);
    setSaving(false);
    if (!error) toast.success('Profil diperbarui');
    else toast.error('Gagal menyimpan');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    toast('Sampai jumpa! 👋');
    router.push('/auth/login');
    router.refresh();
  }

  if (loading) {
    return (
      <div className="px-5 pt-12 space-y-4">
        <div className="skeleton h-8 w-32 rounded-xl" />
        <div className="skeleton h-36 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pb-6 animate-fade-in space-y-5">
      <div>
        <h1 className="font-display text-2xl font-light text-stone-800">Profil</h1>
        <p className="text-stone-400 text-sm mt-0.5">{profile?.id?.slice(0, 8)}...</p>
      </div>

      {/* Avatar + name */}
      <div className="bg-white border border-stone-100 rounded-3xl p-5">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 bg-sage-100 rounded-2xl flex items-center justify-center">
            <User className="w-7 h-7 text-sage-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-medium text-stone-800">{profile?.full_name || 'Pengguna'}</p>
            <p className="text-sm text-stone-400">{profile?.timezone}</p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">
            Nama
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-sage-300"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-4 py-3 bg-sage-500 hover:bg-sage-600 disabled:opacity-60 text-white font-medium rounded-2xl text-sm transition-all"
        >
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {/* App info */}
      <div className="bg-white border border-stone-100 rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-stone-50 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-4 h-4 text-stone-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">Install sebagai App</p>
            <p className="text-xs text-stone-400">
              {isPWA ? '✅ Sudah diinstall sebagai app' : 'Tap "Add to Home Screen" di browser kamu'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-stone-50 rounded-2xl flex items-center justify-center">
            <Shield className="w-4 h-4 text-stone-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-700">Data & Privasi</p>
            <p className="text-xs text-stone-400">Data tersimpan aman di Supabase</p>
          </div>
        </div>
      </div>

      {/* Version */}
      <p className="text-center text-xs text-stone-300">Habitly v1.0.0 · Made with 🌿</p>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-500 font-medium rounded-2xl text-sm transition-all flex items-center justify-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Keluar
      </button>
    </div>
  );
}
