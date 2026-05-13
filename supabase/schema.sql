-- ============================================
-- HABITLY - Supabase Schema
-- Jalankan ini di Supabase SQL Editor
-- ============================================

create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  timezone text default 'Asia/Jakarta',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CATEGORIES
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  color text not null default '#94a3b8',
  icon text not null default '📁',
  created_at timestamptz default now()
);

-- HABITS
create table public.habits (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text,
  icon text not null default '⭐',
  color text not null default '#6366f1',
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  target_days int[] default '{1,2,3,4,5,6,7}',
  target_count int default 1,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- HABIT LOGS
create table public.habit_logs (
  id uuid default uuid_generate_v4() primary key,
  habit_id uuid references public.habits(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  logged_date date not null default current_date,
  count int default 1,
  note text,
  created_at timestamptz default now(),
  unique(habit_id, logged_date)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

-- Profiles
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Categories
create policy "Users can manage own categories" on public.categories for all using (auth.uid() = user_id);

-- Habits
create policy "Users can manage own habits" on public.habits for all using (auth.uid() = user_id);

-- Habit logs
create policy "Users can manage own logs" on public.habit_logs for all using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update updated_at automatically
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger habits_updated_at before update on public.habits
  for each row execute procedure public.handle_updated_at();

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- ============================================
-- SEED: Default categories (will be created per user via app)
-- ============================================
-- No seed needed, categories are user-specific
