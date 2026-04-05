export type Category = 'Study' | 'Work' | 'Rest' | 'Exercise' | 'Leisure' | 'Other';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserSettings {
  accentColor: 'blue' | 'green' | 'purple';
  challenge_start_date?: string; // YYYY-MM-DD
}

export interface SleepLog {
  id: string;
  start_time: string;
  end_time: string;
  quality_score?: number;
  notes?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  wake_time?: string; // HH:mm (Legacy)
  sleep_time?: string; // HH:mm (Legacy)
  energy_morning?: number; // 1-5
  summary?: string; // Short summary of the day
  day_score?: number; // 0-10
  lc_solved?: number; // Number of LC questions solved
  sleep_logs?: SleepLog[];
}

export interface DaySection {
  id: string;
  date: string;
  block_name: string;
  block_order: number;
  notes: string;
  category: Category;
}

export interface FoodLog {
  id: string;
  date: string;
  time: string;
  meal_type: MealType;
  description: string;
  calories?: number;
}

export interface StudySession {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  skill_id: string;
  notes: string;
  resource: string;
  quality_score: number; // 1-5
}

export interface Skill {
  id: string;
  name: string;
  is_custom: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
}

export interface GoalDailyRoutine {
  id: string;
  title: string;
}

export interface Goal {
  id: string;
  skill_id: string;
  title: string;
  milestones: Milestone[];
  daily_routines?: GoalDailyRoutine[];
  action_plan_md?: string;
  progress_percent: number;
  manual_progress?: boolean;
}

// ── Learning Plan types ──────────────────────────────────────────────
export type PlanTaskStatus = 'pending' | 'done' | 'failed';
export type PlanTaskTag = 'GFG' | 'LC';
export type PlanTaskDifficulty = 'easy' | 'medium' | 'hard';

export interface PlanTask {
  id: string;
  title: string;
  url?: string;                   // LeetCode / GFG link
  difficulty?: PlanTaskDifficulty;
  tag?: PlanTaskTag;              // GFG or LC
  status: PlanTaskStatus;
}

export interface PlanDay {
  day_number: number;             // 1–52
  date: string;                   // YYYY-MM-DD
  label: string;                  // "Day 1 — March 7 (Saturday)"
  topic: string;                  // "Arrays — Prefix Sum, Sliding Window"
  is_buffer: boolean;
  tasks: PlanTask[];
}

export interface PlanWeek {
  week_number: number;
  label: string;                  // "WEEK 1 — March 7–13"
  topic: string;                  // "Arrays (Remaining 60%) + Recursion"
  days: PlanDay[];
}

export interface LearningPlan {
  id: string;
  title: string;
  skill_id: string;
  start_date: string;             // YYYY-MM-DD
  end_date: string;
  description: string;
  weeks: PlanWeek[];
}

export interface WaterLog {
  id: string;
  amount_ml: number;
  time: string;
}

export interface ExerciseLog {
  id: string;
  name: string;
  reps?: string;
  weight?: string;
  notes?: string;
}

export interface HealthLog {
  date: string; // YYYY-MM-DD
  did_exercise?: boolean;
  exercise_type?: 'gym' | 'walk' | 'yoga' | 'run' | 'none';
  exercise_duration?: number;
  exercise_intensity?: 'light' | 'moderate' | 'intense';
  weight?: number;
  water_intake?: number;
  water_logs?: WaterLog[];
  exercise_logs?: ExerciseLog[];
  energy_afternoon?: number;
  energy_evening?: number;
  mood_score?: number;
  mood_note?: string;
  screen_time?: number;
  break_count?: number;
  eye_strain?: number;
}

export interface TodoTask {
  id: string;
  title: string;
  notes?: string;
  completed: boolean;
  failed?: boolean;
  dueDate?: string; // YYYY-MM-DD
  startAt?: string; // ISO datetime
  dueAt?: string; // ISO datetime
  priority?: 'low' | 'medium' | 'high';
  myDay?: boolean;
  createdAt?: string; // ISO timestamp
  progressPercent?: number; // 0-100
  sections?: string[]; // ids of todo_sections
  subtasks?: TodoSubtask[];
}

export interface GoalDailyLog {
  goal_id: string;
  date: string;
  worked: boolean;
  note: string;
  completed_routines?: string[]; // IDs of GoalDailyRoutine
}

export interface AppData {
  settings: UserSettings;
  daily_logs: Record<string, DailyLog>;
  day_sections: DaySection[];
  food_logs: FoodLog[];
  study_sessions: StudySession[];
  skills: Skill[];
  goals: Goal[];
  goal_daily_logs?: GoalDailyLog[];
  health_logs: Record<string, HealthLog>;
  todo_tasks: TodoTask[];
  todo_sections: TodoSection[];
  learning_plans?: LearningPlan[];
}

export interface TodoSection {
  id: string;
  name: string;
}

export interface TodoSubtask {
  id: string;
  title: string;
  completed: boolean;
  createdAt?: string;
}
