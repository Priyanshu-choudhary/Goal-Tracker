import { AppData, Skill } from './types';
import { dsaPlan } from './dsa-plan-seed';

const defaultSkills: Skill[] = [
  { id: '1', name: 'DSA', is_custom: false },
  { id: '2', name: 'AI', is_custom: false },
  { id: '3', name: 'Job search', is_custom: false },
  { id: '4', name: 'self improving skills', is_custom: false },
  { id: '5', name: 'Interview prep.', is_custom: false },
  { id: '6', name: 'Other', is_custom: false },
];

export const defaultAppData: AppData = {
  settings: { 
    accentColor: 'blue',
    challenge_start_date: '2026-05-01'
  },
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
  finance_transactions: [],
  wealth_logs: [],
};

export function mergeWithDefault(saved: any): AppData {
  const savedChallengeStartDate =
    saved.settings?.challenge_start_date === '2026-03-20'
      ? '2026-05-01'
      : saved.settings?.challenge_start_date;

  return {
    ...defaultAppData,
    settings: {
      ...defaultAppData.settings,
      ...(saved.settings || {}),
      challenge_start_date: savedChallengeStartDate ?? defaultAppData.settings.challenge_start_date,
    },
    // Guard every field: if server returns null/undefined, fall back to the default
    daily_logs:            saved.daily_logs            ?? defaultAppData.daily_logs,
    day_sections:          saved.day_sections          ?? defaultAppData.day_sections,
    food_logs:             saved.food_logs             ?? defaultAppData.food_logs,
    study_sessions:        saved.study_sessions        ?? defaultAppData.study_sessions,
    skills:                saved.skills?.length        ? saved.skills        : defaultAppData.skills,
    goals:                 saved.goals                 ?? defaultAppData.goals,
    health_logs:           saved.health_logs           ?? defaultAppData.health_logs,
    todo_tasks:            saved.todo_tasks            ?? defaultAppData.todo_tasks,
    todo_sections:         saved.todo_sections?.length ? saved.todo_sections : defaultAppData.todo_sections,
    finance_transactions:  saved.finance_transactions  ?? defaultAppData.finance_transactions,
    wealth_logs:           saved.wealth_logs           ?? defaultAppData.wealth_logs,
    learning_plans:        saved.learning_plans?.length ? saved.learning_plans : defaultAppData.learning_plans,
  };
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem('life_tracker_app_data');
    if (raw) {
      const saved = JSON.parse(raw);
      return mergeWithDefault(saved);
    }
  } catch (e) {
    console.error('Failed to parse app data', e);
  }
  return defaultAppData;
}

export function saveData(data: AppData) {
  localStorage.setItem('life_tracker_app_data', JSON.stringify(data));
}

