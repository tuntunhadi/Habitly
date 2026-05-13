'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, BarChart2, Tag, User } from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/habits', icon: ListChecks, label: 'Habits' },
  { href: '/dashboard/stats', icon: BarChart2, label: 'Stats' },
  { href: '/dashboard/categories', icon: Tag, label: 'Kategori' },
  { href: '/dashboard/profile', icon: User, label: 'Profil' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-stone-100 safe-bottom z-50">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${
                isActive
                  ? 'text-sage-600'
                  : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-sage-100' : ''}`}>
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive ? 2 : 1.5}
                />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'text-sage-600' : 'text-stone-400'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
