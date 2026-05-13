import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import BottomNav from '@/components/BottomNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/auth/login');

  return (
    <div className="min-h-dvh bg-stone-50 flex flex-col">
      <main className="flex-1 pb-24">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
