import { format, parse, differenceInMinutes } from 'date-fns';
import { AppData } from '../data/types';

function calculateSleepMinutes(appData: AppData, dateStr: string) {
  const log = appData.daily_logs?.[dateStr];
  if (!log?.sleep_logs) return 0;
  return log.sleep_logs.reduce((total: number, s: any) => {
    try {
      const start = parse(s.start_time, 'HH:mm', new Date());
      const end = parse(s.end_time, 'HH:mm', new Date());
      let diff = differenceInMinutes(end, start);
      if (diff < 0) diff += 24 * 60;
      return total + diff;
    } catch {
      return total;
    }
  }, 0);
}

export function exportDayData(appData: AppData, dateStr: string, filenamePrefix = 'life_tracker_llm_export') {
  const sleepMins = calculateSleepMinutes(appData, dateStr);
  const dayMeals = (appData.food_logs || []).filter(f => f.date === dateStr);
  const dayStudy = (appData.study_sessions || []).filter(s => s.date === dateStr);
  const dayTasks = (appData.todo_tasks || []).filter(t => 
    (t.createdAt && t.createdAt.startsWith(dateStr)) ||
    (t.dueAt && t.dueAt.startsWith(dateStr)) ||
    (t.dueDate === dateStr)
  );
  const dayGoalLogs = (appData.goal_daily_logs || []).filter(l => l.date === dateStr);

  const studyMins = dayStudy.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
  const completedTasks = dayTasks.filter(t => t.completed).length;
  const failedTasks = dayTasks.filter(t => t.failed).length;
  const totalCals = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const health = appData.health_logs?.[dateStr];

  const dayData = {
    metadata: {
      export_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      target_date: dateStr,
      app_version: "2.1.0",
      llm_context: "Personal life tracking data including health, productivity, and habits."
    },
    raw_data: {
      daily_log: appData.daily_logs?.[dateStr] || null,
      health_log: health || null,
      day_sections: (appData.day_sections || []).filter((s: any) => s.date === dateStr),
      food_logs: dayMeals,
      study_sessions: dayStudy,
      long_term_goals: dayGoalLogs.map(l => {
        const fullGoal = (appData.goals || []).find(g => g.id === l.goal_id);
        return {
          ...l,
          goal_name: fullGoal?.title || "Unknown Goal",
          goal_details: fullGoal || null,
        };
      }),
      todo_tasks: dayTasks,
      all_goals_definitions: appData.goals || [],
      all_skills: appData.skills || []
    },
    summary_metrics: {
      total_sleep_duration: `${Math.floor(sleepMins / 60)}h ${sleepMins % 60}m`,
      total_sleep_minutes: sleepMins,
      total_meals_count: dayMeals.length,
      total_calories_kcal: totalCals,
      did_exercise: health?.did_exercise || false,
      total_study_minutes: studyMins,
      total_study_hours: (studyMins / 60).toFixed(2),
      todo_completion_rate: dayTasks.filter(t => !t.failed).length ? ((completedTasks / dayTasks.filter(t => !t.failed).length) * 100).toFixed(1) + "%" : "0%",
      tasks_completed: completedTasks,
      tasks_failed: failedTasks,
      total_active_tasks: dayTasks.filter(t => !t.failed).length,
      goals_worked_on: dayGoalLogs.filter(l => l.worked).length,
      total_goals_monitored: (appData.goals || []).length,
      water_intake_ml: health?.water_intake || 0,
      water_glasses: Math.round((health?.water_intake || 0) / 250)
    }
  };

  const blob = new Blob([JSON.stringify(dayData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filenamePrefix}_${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
