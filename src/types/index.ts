export type HabitCategory =
  | "health"
  | "learning"
  | "fitness"
  | "mindfulness"
  | "productivity";

export type HabitDifficulty = "easy" | "medium" | "hard";
export type HabitFrequency = "daily" | "weekdays" | "custom";
export type HabitStatus = "active" | "paused" | "archived";

export type UserStatus = "active" | "inactive" | "disabled";

export interface User {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  timezone?: string;
  memberSince: string;
  createdAt: string;
  updatedAt: string;
  isAdmin?: boolean;
  twoFactorEnabled?: boolean;
  status?: UserStatus;
  deletedAt?: string | null;
  disabledAt?: string | null;
  disabledReason?: string;
  role?: string;
  phone?: string;
  notes?: string;
}

export interface AuditLog {
  _id?: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
  createdAt: string;
}

export interface FinanceTransaction {
  _id?: string;
  userId: string;
  type: "income" | "expense";
  amount: number;
  currency: string;
  category: string;
  title: string;
  notes?: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface BroadcastMessage {
  _id?: string;
  title: string;
  message: string;
  sentBy: string;
  recipientCount: number;
  createdAt: string;
}

export interface Habit {
  _id?: string;
  userId: string;
  name: string;
  description?: string;
  category: HabitCategory;
  icon: string; // Material symbol icon name, e.g. "water_drop"
  frequency: HabitFrequency;
  customDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  target: number; // e.g. 1
  targetUnit?: string; // e.g. "times", "minutes", "glasses"
  difficulty: HabitDifficulty;
  preferredTime?: string; // e.g. "Morning", "Evening", "Anytime"
  reminderTime?: string; // e.g. "08:00"
  reminderEnabled?: boolean;
  status: HabitStatus;
  currentStreak: number;
  bestStreak: number;
  totalCompletions: number;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  _id?: string;
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: string;
}

export interface RoutineHabitItem {
  habitId: string;
  order: number;
}

export interface Routine {
  _id?: string;
  userId: string;
  name: string; // e.g. "Morning Routine", "Study Routine", "Workout Routine", "Night Routine"
  description?: string;
  icon: string;
  timeOfDay?: string; // e.g. "07:30 AM"
  habits: RoutineHabitItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DailyCheckIn {
  _id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: "calm_focused" | "energized" | "neutral" | "tired" | "stressed";
  moodLabel?: string;
  energy: number; // 1 to 10
  notes?: string;
  loggedAt: string;
}

export interface Achievement {
  _id?: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  targetCount: number;
  category: "streak" | "completions" | "consistency" | "first_step";
}

export interface UserAchievement {
  _id?: string;
  userId: string;
  achievementCode: string;
  unlockedAt: string;
  progress: number;
}

export interface Reminder {
  _id?: string;
  userId: string;
  habitId: string;
  habitTitle: string;
  time: string; // "08:00 AM"
  days: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  enabled: boolean;
  smartTiming: boolean;
  createdAt: string;
}

export interface HabitHealthMetric {
  habitId: string;
  name: string;
  category: HabitCategory;
  icon: string;
  score: number; // 0 to 100
  status: "Healthy" | "Stable" | "At Risk";
  frequencyText: string;
}

export interface WeeklyConsistencyDay {
  dayName: string; // "M", "T", "W", "T", "F", "S", "S"
  date: string; // YYYY-MM-DD
  isToday: boolean;
  completionRate: number; // 0 to 100
  completedCount: number;
  totalHabits: number;
}

export interface AppNotification {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: "streak" | "habit" | "achievement" | "reminder" | "system";
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface PasswordReset {
  _id?: string;
  email: string;
  code: string;
  token: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

