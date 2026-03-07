import React, { useState, useMemo } from 'react';
import {
  AppData, LearningPlan, PlanDay, PlanTask,
  Goal,
} from '../data/types';
import {
  Target, Plus, CheckCircle, ChevronDown, ChevronRight,
  BookOpen, ExternalLink, AlertTriangle, Zap, RefreshCw,
  Calendar, TrendingUp, X, RotateCcw, Flag,
} from 'lucide-react';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
}

// ─── helpers ──────────────────────────────────────────────────────────────────
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function diffBadge(diff?: string) {
  if (!diff) return null;
  const map: Record<string, string> = {
    easy: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${map[diff] || ''}`}>
      {diff}
    </span>
  );
}

function tagBadge(tag?: string) {
  if (!tag) return null;
  return tag === 'LC'
    ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">LC</span>
    : <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">GFG</span>;
}

function planProgress(plan: LearningPlan) {
  let total = 0; let done = 0;
  plan.weeks.forEach(w => w.days.forEach(d => d.tasks.forEach(t => {
    total++; if (t.status === 'done') done++;
  })));
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

function dayProgress(day: PlanDay) {
  const total = day.tasks.length;
  const done = day.tasks.filter(t => t.status === 'done').length;
  return { done, total };
}

// ─── Task Row ──────────────────────────────────────────────────────────────────
function TaskRow({ task, onToggle, onFail, onReset }: {
  task: PlanTask;
  onToggle: () => void;
  onFail: () => void;
  onReset: () => void;
}) {
  const isDone = task.status === 'done';
  const isFailed = task.status === 'failed';

  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl group transition-all ${
      isDone ? 'bg-emerald-500/5 border border-emerald-500/10' :
      isFailed ? 'bg-red-500/5 border border-red-500/10' :
      'hover:bg-slate-700/40 border border-transparent'
    }`}>
      {/* done / pending checkbox */}
      <button
        onClick={isDone ? onReset : onToggle}
        className="flex-shrink-0"
        title={isDone ? 'Mark pending' : 'Mark done'}
      >
        {isDone
          ? <CheckCircle className="w-5 h-5 text-emerald-500" />
          : isFailed
          ? <X className="w-5 h-5 text-red-500" />
          : <div className="w-5 h-5 rounded-full border-2 border-slate-600 group-hover:border-slate-400 transition-colors" />
        }
      </button>

      {/* label */}
      <span className={`flex-1 text-sm leading-snug ${
        isDone ? 'text-slate-500 line-through' :
        isFailed ? 'text-red-400/70' :
        'text-slate-200'
      }`}>
        {task.title}
      </span>

      {/* badges */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {tagBadge(task.tag)}
        {diffBadge(task.difficulty)}
        {task.url && (
          <a href={task.url} target="_blank" rel="noreferrer"
            className="text-slate-500 hover:text-blue-400 transition-colors ml-0.5"
            title="Open problem"
            onClick={e => e.stopPropagation()}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        {/* fail / reset controls */}
        {!isDone && !isFailed && (
          <button onClick={onFail} title="Mark failed"
            className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-red-400 ml-1">
            <Flag className="w-3.5 h-3.5" />
          </button>
        )}
        {isFailed && (
          <button onClick={onReset} title="Reset to pending"
            className="text-slate-500 hover:text-amber-400 transition-colors ml-1">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Day Card (expandable) ─────────────────────────────────────────────────────
function DayCard({ day, isToday, forceOpen, onTaskAction }: {
  day: PlanDay;
  isToday: boolean;
  forceOpen?: boolean;
  onTaskAction: (dayDate: string, taskId: string, action: 'done' | 'failed' | 'pending') => void;
}) {
  const [open, setOpen] = useState(isToday || !!forceOpen);
  const { done, total } = dayProgress(day);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const failed = day.tasks.filter(t => t.status === 'failed').length;

  return (
    <div className={`rounded-xl border transition-all ${
      isToday
        ? 'border-purple-500/40 bg-purple-500/5 ring-1 ring-purple-500/20'
        : 'border-slate-700/60 bg-slate-800/40'
    }`}>
      {/* header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {open ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
        <span className={`text-sm font-semibold flex-1 ${isToday ? 'text-purple-300' : 'text-slate-200'}`}>{day.label}</span>
        {isToday && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-300 mr-1">TODAY</span>}
        {day.is_buffer && <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-600/60 text-slate-400 mr-1">BUFFER</span>}
        {failed > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 mr-1">{failed} failed</span>}
        <span className="text-xs text-slate-400 tabular-nums">{done}/{total}</span>
        {/* mini progress */}
        <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-2 flex-shrink-0">
          <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </button>

      {/* tasks */}
      {open && (
        <div className="px-3 pb-3 space-y-1">
          <p className="text-xs text-slate-400 px-3 pb-1 pt-0.5 font-medium">{day.topic}</p>
          {day.tasks.map(task => (
            <TaskRow
              key={task.id}
              task={task}
              onToggle={() => onTaskAction(day.date, task.id, 'done')}
              onFail={() => onTaskAction(day.date, task.id, 'failed')}
              onReset={() => onTaskAction(day.date, task.id, 'pending')}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Plan Detail Panel ────────────────────────────────────────────────────────
function PlanDetail({ plan, onTaskAction }: {
  plan: LearningPlan;
  onTaskAction: (planId: string, dayDate: string, taskId: string, action: 'done' | 'failed' | 'pending') => void;
}) {
  const today = todayStr();
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(() => {
    // Auto-expand the week containing today
    const s = new Set<number>();
    plan.weeks.forEach(w => {
      if (w.days.some(d => d.date === today)) s.add(w.week_number);
    });
    if (s.size === 0) s.add(1); // fallback: expand week 1
    return s;
  });

  const todayDay = useMemo(() => {
    for (const w of plan.weeks) {
      const d = w.days.find(d => d.date === today);
      if (d) return d;
    }
    return null;
  }, [plan, today]);

  const backlogTasks = useMemo(() => {
    const result: { day: PlanDay; task: PlanTask }[] = [];
    plan.weeks.forEach(w => {
      w.days.forEach(d => {
        if (d.date >= today) return; // only past days
        d.tasks.forEach(task => {
          if (task.status === 'failed' || (task.status === 'pending' && d.date < today)) {
            result.push({ day: d, task });
          }
        });
      });
    });
    return result;
  }, [plan, today]);

  const toggleWeek = (n: number) => {
    setExpandedWeeks(prev => {
      const s = new Set(prev);
      s.has(n) ? s.delete(n) : s.add(n);
      return s;
    });
  };

  const act = (dayDate: string, taskId: string, action: 'done' | 'failed' | 'pending') =>
    onTaskAction(plan.id, dayDate, taskId, action);

  const pct = planProgress(plan);

  return (
    <div className="flex flex-col gap-6 min-h-0">
      {/* Plan header */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-white leading-tight">{plan.title}</h3>
            <p className="text-slate-400 text-sm mt-1">{plan.description}</p>
            <div className="flex gap-3 mt-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {plan.start_date} → {plan.end_date}</span>
            </div>
          </div>
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="#1e293b" strokeWidth="6" />
                <circle cx="32" cy="32" r="28" fill="none" stroke="#a855f7" strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - pct / 100)}`}
                  strokeLinecap="round" className="transition-all duration-700" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-black text-purple-400">{pct}%</span>
            </div>
            <span className="text-xs text-slate-500 mt-1">complete</span>
          </div>
        </div>
        {/* overall bar */}
        <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Today's Agenda */}
      {todayDay ? (
        <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-purple-400" />
            <h4 className="text-base font-bold text-purple-300">Today's Agenda</h4>
            {todayDay.is_buffer && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-700 text-slate-300">Buffer Day</span>
            )}
          </div>
          {todayDay.is_buffer && (
            <p className="text-slate-400 text-sm mb-3 italic">Buffer day — catch up on any backlog or weak topics.</p>
          )}
          <div className="space-y-1">
            {todayDay.tasks.map(task => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => act(todayDay.date, task.id, 'done')}
                onFail={() => act(todayDay.date, task.id, 'failed')}
                onReset={() => act(todayDay.date, task.id, 'pending')}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 text-center text-slate-500">
          <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No session scheduled for today in this plan.</p>
        </div>
      )}

      {/* Backlog */}
      {backlogTasks.length > 0 && (
        <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <h4 className="text-base font-bold text-red-300">Backlog ({backlogTasks.length})</h4>
            <span className="text-xs text-slate-500 ml-1">— failed or missed tasks from previous days</span>
          </div>
          <div className="space-y-1">
            {backlogTasks.map(({ day, task }) => (
              <div key={task.id} className="flex items-start gap-2">
                <span className="text-[10px] text-slate-500 mt-2.5 flex-shrink-0 w-28 truncate">{day.label.split(' — ')[0]}</span>
                <div className="flex-1">
                  <TaskRow
                    task={task}
                    onToggle={() => act(day.date, task.id, 'done')}
                    onFail={() => act(day.date, task.id, 'failed')}
                    onReset={() => act(day.date, task.id, 'pending')}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Week accordion */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Full Schedule
        </h4>
        {plan.weeks.map(week => {
          const isExpanded = expandedWeeks.has(week.week_number);
          let wTotal = 0; let wDone = 0;
          week.days.forEach(d => d.tasks.forEach(t => { wTotal++; if (t.status === 'done') wDone++; }));
          const wPct = wTotal === 0 ? 0 : Math.round((wDone / wTotal) * 100);

          return (
            <div key={week.week_number} className="bg-slate-800/60 border border-slate-700/60 rounded-2xl overflow-hidden">
              {/* week header */}
              <button
                onClick={() => toggleWeek(week.week_number)}
                className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-700/30 transition-colors"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{week.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5 truncate">{week.topic}</div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-slate-400 tabular-nums">{wDone}/{wTotal}</span>
                  <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${wPct}%` }} />
                  </div>
                  <span className="text-xs font-bold text-purple-400 w-8 text-right">{wPct}%</span>
                </div>
              </button>

              {/* days */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-2">
                  {week.days.map(day => (
                    <DayCard
                      key={day.day_number}
                      day={day}
                      isToday={day.date === today}
                      onTaskAction={act}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FREE GOALS (original) ────────────────────────────────────────────────────
function FreeGoals({ appData, updateAppData }: Props) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSkillId, setNewSkillId] = useState(appData.skills[0]?.id || '');

  const handleAddGoal = () => {
    if (!newTitle.trim()) return;
    const goal: Goal = {
      id: Math.random().toString(36).substr(2, 9),
      skill_id: newSkillId,
      title: newTitle,
      milestones: [],
      progress_percent: 0,
    };
    updateAppData(prev => ({ ...prev, goals: [...prev.goals, goal] }));
    setIsAdding(false);
    setNewTitle('');
  };

  const getHours = (skillId: string) => {
    const sessions = appData.study_sessions.filter(s => s.skill_id === skillId);
    return Math.round((sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / 60) * 10) / 10;
  };
  const getSkillName = (id: string) => appData.skills.find(s => s.id === id)?.name || 'Unknown';

  const addMilestone = (goalId: string, title: string) => {
    if (!title.trim()) return;
    updateAppData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id !== goalId ? g : {
        ...g, milestones: [...g.milestones, { id: Math.random().toString(36).substr(2, 9), title, completed: false }],
      }),
    }));
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    updateAppData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id !== goalId ? g : {
        ...g, milestones: g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m),
      }),
    }));
  };

  const updateProgress = (goalId: string, percent: number) => {
    updateAppData(prev => ({ ...prev, goals: prev.goals.map(g => g.id === goalId ? { ...g, progress_percent: percent } : g) }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-purple-600/20 text-sm">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>
      {isAdding && (
        <div className="p-6 bg-slate-800 rounded-2xl border border-slate-700 shadow-lg space-y-4">
          <h3 className="text-lg font-semibold text-white">Create New Goal</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-1">Goal Title</label>
              <input autoFocus value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. Master Dynamic Programming" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500" />
            </div>
            <div className="w-56">
              <label className="block text-xs font-medium text-slate-400 mb-1">Linked Skill</label>
              <select value={newSkillId} onChange={e => setNewSkillId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-purple-500">
                {appData.skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={handleAddGoal} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-purple-600/20">Save Goal</button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appData.goals.map(goal => {
          const completedMilestones = goal.milestones.filter(m => m.completed).length;
          const milestoneProgress = goal.milestones.length > 0 ? (completedMilestones / goal.milestones.length) * 100 : 0;
          return (
            <div key={goal.id} className="p-6 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{goal.title}</h3>
                  <span className="inline-flex px-3 py-1 bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 rounded-lg">
                    {getSkillName(goal.skill_id)} • {getHours(goal.skill_id)}h Logged
                  </span>
                </div>
                <div className="text-3xl font-black text-purple-400">{goal.progress_percent}%</div>
              </div>
              <div className="mb-8">
                <label className="block text-xs font-medium text-slate-400 mb-3">Overall Progress (Manual)</label>
                <input type="range" min="0" max="100" value={goal.progress_percent} onChange={e => updateProgress(goal.id, parseInt(e.target.value))} className="w-full accent-purple-500 cursor-pointer" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span className="text-slate-300">Milestones</span>
                  <span className="text-purple-400">{Math.round(milestoneProgress)}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-purple-500 transition-all duration-500 ease-out" style={{ width: `${milestoneProgress}%` }} />
                </div>
                <div className="space-y-1 mt-4">
                  {goal.milestones.map(m => (
                    <button key={m.id} onClick={() => toggleMilestone(goal.id, m.id)} className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-700/50 rounded-xl transition-colors text-left group">
                      <CheckCircle className={`w-5 h-5 flex-shrink-0 transition-colors ${m.completed ? 'text-green-500' : 'text-slate-600 group-hover:text-slate-400'}`} />
                      <span className={`text-sm font-medium transition-all ${m.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{m.title}</span>
                    </button>
                  ))}
                  <div className="pt-2">
                    <input type="text" placeholder="+ Add a milestone (press Enter)"
                      onKeyDown={e => { if (e.key === 'Enter' && e.currentTarget.value) { addMilestone(goal.id, e.currentTarget.value); e.currentTarget.value = ''; } }}
                      className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-purple-500 focus:bg-slate-900 transition-all placeholder:text-slate-500" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {appData.goals.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No free goals yet.</p>
            <p className="text-sm mt-1">Create a goal above to track milestones manually.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Root GoalsView ────────────────────────────────────────────────────────────
export function GoalsView({ appData, updateAppData }: Props) {
  const [tab, setTab] = useState<'plans' | 'goals'>('plans');
  const [activePlanId, setActivePlanId] = useState<string | null>(
    appData.learning_plans?.[0]?.id || null
  );

  const plans = appData.learning_plans || [];
  const activePlan = plans.find(p => p.id === activePlanId) || null;

  // Mutate a task inside the plan stored in appData
  const handleTaskAction = (planId: string, dayDate: string, taskId: string, action: 'done' | 'failed' | 'pending') => {
    updateAppData(prev => ({
      ...prev,
      learning_plans: (prev.learning_plans || []).map(plan => {
        if (plan.id !== planId) return plan;
        return {
          ...plan,
          weeks: plan.weeks.map(week => ({
            ...week,
            days: week.days.map(day => {
              if (day.date !== dayDate) return day;
              return {
                ...day,
                tasks: day.tasks.map(task =>
                  task.id === taskId ? { ...task, status: action } : task
                ),
              };
            }),
          })),
        };
      }),
    }));
  };

  return (
    <div className="pb-12 space-y-6">
      {/* ── Page header ── */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-400" /> Goals & Plans
            </h2>
            <p className="text-slate-400 mt-1 text-sm">Track learning plans day-by-day and manage long-term goals.</p>
          </div>
          {/* Tab pills */}
          <div className="flex gap-1 bg-slate-900 rounded-lg p-1">
            <button
              onClick={() => setTab('plans')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === 'plans' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <BookOpen className="w-4 h-4" /> Learning Plans
            </button>
            <button
              onClick={() => setTab('goals')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-semibold transition-all ${tab === 'goals' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Target className="w-4 h-4" /> Free Goals
            </button>
          </div>
        </div>
      </div>

      {/* ── Learning Plans tab ── */}
      {tab === 'plans' && (
        <div className="flex gap-6">
          {/* Left sidebar: plan list */}
          <div className="w-72 flex-shrink-0 space-y-3">
            {plans.map(plan => {
              const pct = planProgress(plan);
              const isActive = plan.id === activePlanId;
              return (
                <button
                  key={plan.id}
                  onClick={() => setActivePlanId(plan.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'border-purple-500/50 bg-purple-500/10 ring-1 ring-purple-500/20'
                      : 'border-slate-700 bg-slate-800/60 hover:border-slate-600'
                  }`}
                >
                  <div className="text-sm font-bold text-white leading-tight mb-1">{plan.title}</div>
                  <div className="text-xs text-slate-400 mb-3">{plan.start_date} → {plan.end_date}</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs font-bold text-purple-400 tabular-nums">{pct}%</span>
                  </div>
                </button>
              );
            })}

            {/* Add new plan stub */}
            <button className="w-full p-4 rounded-2xl border border-dashed border-slate-700 text-slate-500 hover:text-slate-300 hover:border-slate-500 transition-all flex items-center justify-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add New Plan
            </button>
          </div>

          {/* Right: active plan detail */}
          <div className="flex-1 min-w-0">
            {activePlan
              ? <PlanDetail plan={activePlan} onTaskAction={handleTaskAction} />
              : (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl">
                  <BookOpen className="w-10 h-10 mb-3 opacity-20" />
                  <p>Select a plan to view details</p>
                </div>
              )
            }
          </div>
        </div>
      )}

      {/* ── Free Goals tab ── */}
      {tab === 'goals' && (
        <FreeGoals appData={appData} updateAppData={updateAppData} />
      )}
    </div>
  );
}
