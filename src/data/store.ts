import { AppData, Skill } from './types';
import { dsaPlan } from './dsa-plan-seed';

const defaultSkills: Skill[] = [
  { id: '1', name: 'DSA', is_custom: false },
  { id: '2', name: 'Core AI', is_custom: false },
  { id: '3', name: 'GenAI', is_custom: false },
  { id: '4', name: 'System Design', is_custom: false },
  { id: '5', name: 'Web Dev', is_custom: false },
  { id: '6', name: 'DevOps', is_custom: false },
  { id: '7', name: 'Other', is_custom: false },
];

export const defaultAppData: AppData = {
  settings: { accentColor: 'blue' },
  daily_logs: {},
  day_sections: [],
  food_logs: [],
  study_sessions: [],
  skills: defaultSkills,
  goals: [],
  health_logs: {},
  todo_tasks: [],
  todo_sections: [{ id: 'inbox', name: 'Inbox' }],
  learning_plans: [dsaPlan],
};

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem('life_tracker_app_data');
    if (raw) {
      const saved: AppData = JSON.parse(raw);
      // Merge any new top-level fields from defaultAppData so old saves stay compatible
      return {
        ...defaultAppData,
        ...saved,
        // Always make sure learning_plans has the DSA plan (add it if missing)
        learning_plans: saved.learning_plans?.length
          ? saved.learning_plans
          : defaultAppData.learning_plans,
      };
    }
  } catch (e) {
    console.error('Failed to parse app data', e);
  }
  return defaultAppData;
}

export function saveData(data: AppData) {
  localStorage.setItem('life_tracker_app_data', JSON.stringify(data));
}

