import Link from 'next/link';

export default function EmptyState() {
  return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">🌱</p>
      <p className="font-display text-xl font-light text-stone-700 mb-1">Belum ada habit</p>
      <p className="text-stone-400 text-sm mb-6">Mulai bangun kebiasaan pertamamu</p>
      <Link
        href="/dashboard/habits"
        className="inline-flex items-center gap-2 bg-sage-500 hover:bg-sage-600 text-white px-5 py-3 rounded-2xl text-sm font-medium transition-all"
      >
        + Tambah Habit Pertama
      </Link>
    </div>
  );
}
