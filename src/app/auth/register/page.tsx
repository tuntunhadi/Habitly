'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Leaf } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password minimal 6 karakter');
      return;
    }
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success('Akun berhasil dibuat! Silakan login.');
    router.push('/auth/login');
  }

  return (
    <div className="min-h-dvh bg-stone-50 flex flex-col">
      <div className="h-2 bg-gradient-to-r from-sage-400 via-sage-500 to-sage-600" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sage-100 rounded-2xl mb-4">
            <Leaf className="w-7 h-7 text-sage-600" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-3xl font-light text-stone-800 tracking-tight">
            Habitly
          </h1>
          <p className="text-stone-400 text-sm mt-1 font-light">Mulai kebiasaan baru</p>
        </div>

        <div className="w-full max-w-sm">
          <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8">
            <h2 className="text-lg font-medium text-stone-800 mb-6">Buat akun</h2>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">
                  Nama
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama lengkap"
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-stone-500 uppercase tracking-wider block mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 karakter"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-stone-800 placeholder-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-sage-300 focus:border-transparent transition-all pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-sage-500 hover:bg-sage-600 disabled:opacity-60 text-white font-medium rounded-2xl transition-all text-sm mt-2 active:scale-[0.98]"
              >
                {loading ? 'Membuat akun...' : 'Daftar sekarang'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-stone-400 mt-6">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-sage-600 font-medium hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
