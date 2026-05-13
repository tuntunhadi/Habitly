export type Frequency = 'daily' | 'weekly';

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  frequency: Frequency;
  target_days: number[];
  target_count: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  logged_date: string;
  count: number;
  note: string | null;
  created_at: string;
}

export interface HabitWithLog extends Habit {
  log?: HabitLog;
  streak?: number;
  best_streak?: number;
  completion_rate?: number;
}

export interface DashboardStats {
  totalHabits: number;
  completedToday: number;
  currentStreak: number;
  weeklyRate: number;
}
