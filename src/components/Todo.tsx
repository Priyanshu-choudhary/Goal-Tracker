import React, { useState, useMemo, useEffect } from 'react';
import { AppData, TodoTask, TodoSection, TodoSubtask, Goal, Milestone, GoalDailyLog } from '../data/types';
import { 
  Plus, CheckSquare, Trash2, Edit3, Star, Sun, PlusCircle, List, 
  BarChart2, Target, CheckCircle, ChevronRight, ChevronDown, 
  Download, FileJson, FileText, Share2, MoreVertical, Clock, XCircle, AlertCircle, Calendar, ChevronLeft, ChevronRight as ChevronRightIcon, X
} from 'lucide-react';
import { format, isToday, parseISO, subDays, addDays, isSameDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface Props {
    appData: AppData;
    updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
}

export function Todo({ appData, updateAppData }: Props) {
    const [newTitle, setNewTitle] = useState('');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed'>('all');
    const [section, setSection] = useState<'all' | 'myday' | 'important' | 'goals'>('all');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingText, setEditingText] = useState('');
    const [editingSubtask, setEditingSubtask] = useState<{taskId: string, subId: string, text: string} | null>(null);
    const [newSectionName, setNewSectionName] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState<string>('all');
    const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
    const [sectionMenuOpenId, setSectionMenuOpenId] = useState<string | null>(null);
    const [exportMenuOpen, setExportMenuOpen] = useState<string | null>(null);

    // Goal Log Date
    const [goalLogDate, setGoalLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    
    // New Goal Creation State
    const [isAddingGoal, setIsAddingGoal] = useState(false);
    const [newGoalTitle, setNewGoalTitle] = useState('');
    const [newGoalSkillId, setNewGoalSkillId] = useState(appData.skills[0]?.id || '');

    const [editingMilestone, setEditingMilestone] = useState<{goalId: string, mId: string, text: string} | null>(null);

    const tasks = appData.todo_tasks || [];
    const sections = appData.todo_sections || [];
    const goals = appData.goals || [];
    const goalDailyLogs = appData.goal_daily_logs || [];

    useEffect(() => {
        setExpandedMap({});
    }, [selectedSectionId]);

    const addTask = () => {
        const title = newTitle.trim();
        if (!title) return;
        
        const createdAt = new Date().toISOString();

        const task: TodoTask = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            completed: false,
            failed: false,
            createdAt,
            startAt: createdAt,
            progressPercent: 0,
            myDay: selectedSectionId === 'myday',
            priority: selectedSectionId === 'important' ? 'high' : undefined,
            sections: (selectedSectionId !== 'all' && selectedSectionId !== 'myday' && selectedSectionId !== 'important' && selectedSectionId !== 'goals') ? [selectedSectionId] : []
        };
        updateAppData(prev => ({ ...prev, todo_tasks: [task, ...(prev.todo_tasks || [])] }));
        setNewTitle('');
    };

    const handleCreateGoal = () => {
        if (!newGoalTitle.trim()) return;
        const goal: Goal = {
            id: Math.random().toString(36).substr(2, 9),
            skill_id: newGoalSkillId,
            title: newGoalTitle,
            milestones: [],
            progress_percent: 0
        };
        updateAppData(prev => ({ ...prev, goals: [...prev.goals, goal] }));
        setNewGoalTitle('');
        setIsAddingGoal(false);
    };

    const addSection = (name: string) => {
        const n = name.trim();
        if (!n) return;
        const sec: TodoSection = { id: Math.random().toString(36).substr(2, 9), name: n };
        updateAppData(prev => ({ ...prev, todo_sections: [sec, ...(prev.todo_sections || [])] }));
        setNewSectionName('');
    };

    const toggleExpand = (id: string) => {
        setExpandedMap(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const removeSection = (id: string) => {
        updateAppData(prev => ({
            ...prev,
            todo_sections: (prev.todo_sections || []).filter(s => s.id !== id),
            todo_tasks: (prev.todo_tasks || []).map(t => ({ ...t, sections: (t.sections || []).filter(sec => sec !== id) }))
        }));
        if (selectedSectionId === id) setSelectedSectionId('all');
    };

    const toggleComplete = (id: string) => {
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => {
                if (t.id !== id) return t;
                const nowCompleted = !t.completed;
                return {
                    ...t,
                    completed: nowCompleted,
                    failed: false,
                    progressPercent: nowCompleted ? 100 : (t.progressPercent === 100 ? 0 : t.progressPercent)
                };
            })
        }));
    };

    const toggleFailed = (id: string) => {
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => {
                if (t.id !== id) return t;
                const nowFailed = !t.failed;
                return {
                    ...t,
                    failed: nowFailed,
                    completed: false,
                    progressPercent: nowFailed ? 0 : t.progressPercent
                };
            })
        }));
    };

    const removeTask = (id: string) => {
        updateAppData(prev => ({ ...prev, todo_tasks: (prev.todo_tasks || []).filter(t => t.id !== id) }));
    };

    const startEdit = (t: TodoTask) => {
        setEditingId(t.id);
        setEditingText(t.title);
    };

    const saveEdit = (id: string) => {
        const title = editingText.trim();
        if (!title) return;
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => t.id === id ? { ...t, title } : t)
        }));
        setEditingId(null);
        setEditingText('');
    };

    const toggleMyDay = (id: string) => {
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => t.id === id ? { ...t, myDay: !t.myDay } : t)
        }));
    };

    const toggleImportant = (id: string) => {
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => t.id === id ? { ...t, priority: t.priority === 'high' ? undefined : 'high' } : t)
        }));
    };

    const toggleAssignSection = (taskId: string, sectionId: string) => {
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => {
                if (t.id !== taskId) return t;
                const has = (t.sections || []).includes(sectionId);
                return { ...t, sections: has ? (t.sections || []).filter(s => s !== sectionId) : [...(t.sections || []), sectionId] };
            })
        }));
    };

    const setTaskStart = (id: string, iso: string) => {
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => t.id === id ? { ...t, startAt: iso } : t)
        }));
    };

    const setTaskDue = (id: string, iso: string) => {
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => t.id === id ? { ...t, dueAt: iso } : t)
        }));
    };

    const setTaskProgress = (id: string, percent: number) => {
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => t.id === id ? { ...t, progressPercent: percent } : t)
        }));
    };

    const addSubtask = (taskId: string, title: string) => {
        const text = title.trim();
        if (!text) return;
        const sub: TodoSubtask = { id: Math.random().toString(36).substr(2, 9), title: text, completed: false, createdAt: new Date().toISOString() };
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => t.id === taskId ? { ...t, subtasks: [...(t.subtasks || []), sub] } : t)
        }));
    };

    const toggleSubtask = (taskId: string, subId: string) => {
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => {
                if (t.id !== taskId) return t;
                return { ...t, subtasks: (t.subtasks || []).map(s => s.id === subId ? { ...s, completed: !s.completed } : s) };
            })
        }));
    };

    const removeSubtask = (taskId: string, subId: string) => {
        updateAppData(prev => ({
            ...prev,
            todo_tasks: (prev.todo_tasks || []).map(t => t.id === taskId ? { ...t, subtasks: (t.subtasks || []).filter(s => s.id !== subId) } : t)
        }));
    };

    const saveSubtaskEdit = () => {
      if (!editingSubtask) return;
      updateAppData(prev => ({
        ...prev,
        todo_tasks: (prev.todo_tasks || []).map(t => {
          if (t.id !== editingSubtask.taskId) return t;
          return {
            ...t,
            subtasks: (t.subtasks || []).map(s => s.id === editingSubtask.subId ? { ...s, title: editingSubtask.text } : s)
          };
        })
      }));
      setEditingSubtask(null);
    };

    const updateGoalMilestone = (goalId: string, milestoneId: string) => {
        updateAppData(prev => ({
            ...prev,
            goals: prev.goals.map(g => {
                if (g.id !== goalId) return g;
                const newMilestones = g.milestones.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
                const completed = newMilestones.filter(m => m.completed).length;
                const progress = newMilestones.length > 0 ? Math.round((completed / newMilestones.length) * 100) : g.progress_percent;
                return { ...g, milestones: newMilestones, progress_percent: g.manual_progress ? g.progress_percent : progress };
            })
        }));
    };

    const deleteMilestone = (goalId: string, mId: string) => {
        updateAppData(prev => ({
            ...prev,
            goals: prev.goals.map(g => {
                if (g.id !== goalId) return g;
                const newMilestones = g.milestones.filter(m => m.id !== mId);
                const completed = newMilestones.filter(m => m.completed).length;
                const progress = newMilestones.length > 0 ? Math.round((completed / newMilestones.length) * 100) : (newMilestones.length === 0 ? 0 : g.progress_percent);
                return { ...g, milestones: newMilestones, progress_percent: g.manual_progress ? g.progress_percent : progress };
            })
        }));
    };

    const saveMilestoneEdit = () => {
        if (!editingMilestone) return;
        updateAppData(prev => ({
            ...prev,
            goals: prev.goals.map(g => {
                if (g.id !== editingMilestone.goalId) return g;
                return {
                    ...g,
                    milestones: g.milestones.map(m => m.id === editingMilestone.mId ? { ...m, title: editingMilestone.text } : m)
                };
            })
        }));
        setEditingMilestone(null);
    };

    const updateGoalManualProgress = (goalId: string, progress: number) => {
        updateAppData(prev => ({
            ...prev,
            goals: prev.goals.map(g => g.id === goalId ? { ...g, progress_percent: progress, manual_progress: true } : g)
        }));
    };

    const setGoalWorkedStatus = (goalId: string, worked: boolean) => {
        updateAppData(prev => {
            const logs = [...(prev.goal_daily_logs || [])];
            const idx = logs.findIndex(l => l.goal_id === goalId && l.date === goalLogDate);
            if (idx >= 0) {
                logs[idx] = { ...logs[idx], worked };
            } else {
                logs.push({ goal_id: goalId, date: goalLogDate, worked, note: '' });
            }
            return { ...prev, goal_daily_logs: logs };
        });
    };

    const updateGoalDailyNote = (goalId: string, note: string) => {
        updateAppData(prev => {
            const logs = [...(prev.goal_daily_logs || [])];
            const idx = logs.findIndex(l => l.goal_id === goalId && l.date === goalLogDate);
            if (idx >= 0) {
                logs[idx] = { ...logs[idx], note };
            } else {
                logs.push({ goal_id: goalId, date: goalLogDate, worked: false, note });
            }
            return { ...prev, goal_daily_logs: logs };
        });
    };

    const removeGoal = (id: string) => {
        updateAppData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
    };

    // Export Logic
    const exportTasks = (format: 'json' | 'list', scope: 'all' | 'section' | 'single', taskId?: string) => {
        let dataToExport: any = [];
        if (scope === 'single' && taskId) {
            dataToExport = tasks.filter(t => t.id === taskId);
        } else if (scope === 'section') {
            dataToExport = filtered;
        } else {
            dataToExport = tasks;
        }

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tasks_${scope}_${format === 'json' ? 'export.json' : 'list.txt'}`;
            a.click();
        } else {
            const text = dataToExport.map((t: TodoTask) => {
                const subtasksText = (t.subtasks || []).map(s => `  [${s.completed ? 'x' : ' '}] ${s.title}`).join('\n');
                return `[${t.completed ? 'x' : (t.failed ? '!' : ' ')}] ${t.title}${t.dueAt ? ` (Due: ${new Date(t.dueAt).toLocaleString()})` : ''}\n${subtasksText}`;
            }).join('\n\n');
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `tasks_${scope}.txt`;
            a.click();
        }
        setExportMenuOpen(null);
    };

    const sectionFiltered = tasks.filter(t => {
        const sel = selectedSectionId;
        if (!sel || sel === 'all') {
            if (section === 'all') return true;
            if (section === 'myday') return !!t.myDay;
            if (section === 'important') return t.priority === 'high';
            return true;
        }
        if (sel === 'myday') return !!t.myDay;
        if (sel === 'important') return t.priority === 'high';
        if (sel === 'goals') return false; 
        return (t.sections || []).includes(sel);
    });

    const filtered = sectionFiltered.filter(t => {
        if (filter === 'all') return true;
        if (filter === 'active') return !t.completed && !t.failed;
        if (filter === 'failed') return !!t.failed;
        return t.completed;
    }).sort((a, b) => {
        if (a.failed && !b.failed) return 1;
        if (!a.failed && b.failed) return -1;
        return 0;
    });

    // Requirement 1: Do not count failed tasks in sections or "All"
    const countTasks = (taskList: TodoTask[]) => taskList.filter(t => !t.failed).length;

    const totalActive = tasks.filter(t => !t.completed && !t.failed).length;
    const totalCompleted = tasks.filter(t => t.completed).length;
    const totalFailed = tasks.filter(t => t.failed).length;
    const totalNonFailed = tasks.filter(t => !t.failed).length;

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full lg:w-72 space-y-6">
                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-lg">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-green-400" /> Tasks
                    </h2>
                    
                    <nav className="space-y-1">
                        <button onClick={() => { setSelectedSectionId('all'); setSection('all'); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${selectedSectionId === 'all' ? 'bg-green-600 text-white font-bold shadow-lg shadow-green-600/20' : 'text-slate-400 hover:bg-slate-700/50'}`}>
                            <div className="flex items-center gap-2"><List className="w-4 h-4" /> All</div>
                            <span className="text-[10px] bg-slate-900/50 px-2 py-0.5 rounded-full">{totalNonFailed}</span>
                        </button>
                        <button onClick={() => { setSelectedSectionId('myday'); setSection('myday'); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${selectedSectionId === 'myday' ? 'bg-yellow-600 text-white font-bold shadow-lg shadow-yellow-600/20' : 'text-slate-400 hover:bg-slate-700/50'}`}>
                            <div className="flex items-center gap-2"><Sun className="w-4 h-4" /> My Day</div>
                            <span className="text-[10px] bg-slate-900/50 px-2 py-0.5 rounded-full">{countTasks(tasks.filter(t => t.myDay))}</span>
                        </button>
                        <button onClick={() => { setSelectedSectionId('important'); setSection('important'); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${selectedSectionId === 'important' ? 'bg-amber-600 text-white font-bold shadow-lg shadow-amber-600/20' : 'text-slate-400 hover:bg-slate-700/50'}`}>
                            <div className="flex items-center gap-2"><Star className="w-4 h-4" /> Important</div>
                            <span className="text-[10px] bg-slate-900/50 px-2 py-0.5 rounded-full">{countTasks(tasks.filter(t => t.priority === 'high'))}</span>
                        </button>
                        <button onClick={() => { setSelectedSectionId('goals'); setSection('goals'); }} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all ${selectedSectionId === 'goals' ? 'bg-purple-600 text-white font-bold shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:bg-slate-700/50'}`}>
                            <div className="flex items-center gap-2"><Target className="w-4 h-4" /> Goals</div>
                            <span className="text-[10px] bg-slate-900/50 px-2 py-0.5 rounded-full">{goals.length}</span>
                        </button>
                    </nav>

                    <hr className="my-4 border-slate-700/50" />
                    
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-3">Custom Sections</h3>
                    <div className="space-y-1">
                        {sections.map(sec => (
                            <div key={sec.id} className="group flex items-center gap-1">
                                <button onClick={() => { setSelectedSectionId(sec.id); setSection('all'); }} className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl transition-all ${selectedSectionId === sec.id ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:bg-slate-700/50'}`}>
                                    <span>{sec.name}</span>
                                    <span className="text-[10px] bg-slate-900/50 px-2 py-0.5 rounded-full">{countTasks(tasks.filter(t => t.sections?.includes(sec.id)))}</span>
                                </button>
                                <button onClick={() => removeSection(sec.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-500 hover:text-red-400 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex gap-2">
                        <input value={newSectionName} onChange={e => setNewSectionName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addSection(newSectionName)} placeholder="New list..." className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-green-500" />
                        <button onClick={() => addSection(newSectionName)} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"><PlusCircle className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-lg">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-400" /> Stats</h3>
                    <div className="space-y-4">
                        <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                            <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Success Rate</div>
                            <div className="text-xl font-black text-white">{totalNonFailed ? Math.round((totalCompleted / totalNonFailed) * 100) : 0}%</div>
                            <div className="text-[10px] text-green-400 mt-1">{totalCompleted} Completed • {totalFailed} Ref</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-6">
                {selectedSectionId !== 'goals' ? (
                    <>
                        <div className="bg-slate-800 rounded-3xl border border-slate-700 p-6 shadow-xl space-y-6">
                            <h2 className="text-2xl font-black text-white flex items-center gap-3 capitalize">
                                {selectedSectionId === 'all' ? 'All Tasks' : (selectedSectionId === 'myday' ? 'My Day' : (sections.find(s=>s.id===selectedSectionId)?.name || 'Tasks'))}
                            </h2>

                            <div className="flex gap-3">
                                <input value={newTitle} onChange={e => setNewTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addTask(); }} placeholder="Add a task..." className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500/50 transition-all" />
                                <button onClick={addTask} className="px-6 bg-green-600 hover:bg-green-500 rounded-xl text-white font-bold flex items-center gap-2 transition-all shadow-lg shadow-green-600/20"><Plus className="w-5 h-5" /> Add</button>
                            </div>
                            
                            <div className="flex items-center justify-between px-1">
                                <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-700">
                                    <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'all' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>All ({totalNonFailed})</button>
                                    <button onClick={() => setFilter('active')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'active' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Active ({totalActive})</button>
                                    <button onClick={() => setFilter('completed')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'completed' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Done ({totalCompleted})</button>
                                    <button onClick={() => setFilter('failed')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${filter === 'failed' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>Ref ({totalFailed})</button>
                                </div>
                                <div className="relative">
                                    <button onClick={() => setExportMenuOpen(exportMenuOpen === 'section' ? null : 'section')} className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-750 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 transition-all">
                                        <Download className="w-3.5 h-3.5" /> Export
                                    </button>
                                    {exportMenuOpen === 'section' && (
                                        <div className="absolute right-0 mt-2 w-40 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden">
                                            <button onClick={() => exportTasks('json', 'section')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2 border-b border-slate-800"><FileJson className="w-3.5 h-3.5" /> JSON Format</button>
                                            <button onClick={() => exportTasks('list', 'section')} className="w-full text-left px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-800 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Text List</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filtered.map(t => {
                                const totalSub = (t.subtasks || []).length;
                                const doneSub = (t.subtasks || []).filter(s => s.completed).length;
                                const isExp = !!expandedMap[t.id];

                                return (
                                    <div key={t.id} className={`bg-slate-800 border transition-all duration-300 rounded-2xl overflow-hidden shadow-lg ${isExp ? 'border-green-500/50 ring-1 ring-green-500/20' : 'border-slate-700 hover:border-slate-600'} ${t.failed ? 'opacity-60 saturate-50' : ''}`}>
                                        <div className="p-4 flex items-center gap-4 cursor-pointer" onClick={() => toggleExpand(t.id)}>
                                            <div className="flex flex-col gap-1" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => toggleComplete(t.id)} title="Complete" className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${t.completed ? 'bg-green-600' : 'bg-slate-900 border border-slate-700 hover:border-green-500'}`}>
                                                    {t.completed && <CheckSquare className="w-4 h-4 text-white" />}
                                                </button>
                                                <button onClick={() => toggleFailed(t.id)} title="Failed" className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${t.failed ? 'bg-red-600' : 'bg-slate-900 border border-slate-700 hover:border-red-500'}`}>
                                                    {t.failed ? <XCircle className="w-4 h-4 text-white" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-700" />}
                                                </button>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                {editingId === t.id ? (
                                                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                                        <input autoFocus value={editingText} onChange={e => setEditingText(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit(t.id)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-white outline-none" />
                                                        <button onClick={() => saveEdit(t.id)} className="p-1 text-green-500"><CheckCircle className="w-5 h-5" /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <span className={`font-bold truncate ${t.completed ? 'line-through text-slate-500' : (t.failed ? 'text-red-400' : 'text-slate-200')}`}>{t.title}</span>
                                                        {t.priority === 'high' && <Star className="w-3 h-3 text-amber-500 fill-amber-500" />}
                                                        {!isExp && totalSub > 0 && (
                                                            <span className="text-[10px] font-black bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full uppercase border border-slate-700">
                                                                {doneSub}/{totalSub} Subtasks
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    {t.dueAt && (
                                                        <div className={`text-[10px] font-bold uppercase flex items-center gap-1 ${new Date(t.dueAt).getTime() < Date.now() && !t.completed ? 'text-red-400' : 'text-slate-500'}`}>
                                                            <Clock className="w-3 h-3" /> Due {format(parseISO(t.dueAt), 'MMM d, p')}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 h-1 bg-slate-900 rounded-full overflow-hidden max-w-[100px]">
                                                        <div className={`h-full transition-all ${t.failed ? 'bg-red-600' : 'bg-green-600'}`} style={{ width: `${t.progressPercent || 0}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1 opacity-40">
                                                {isExp ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                                            </div>
                                        </div>

                                        {isExp && (
                                            <div className="p-5 border-t border-slate-700/50 bg-slate-900/20 space-y-5 animate-in slide-in-from-top-2">
                                                <div className="flex flex-wrap gap-4 items-end">
                                                    <div className="flex-1 min-w-[200px]">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Due Date & Time</label>
                                                        <DatePicker
                                                            selected={t.dueAt ? parseISO(t.dueAt) : null}
                                                            onChange={(date: Date | null) => setTaskDue(t.id, date ? date.toISOString() : '')}
                                                            showTimeSelect
                                                            dateFormat="MMMM d, yyyy h:mm aa"
                                                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-200 outline-none focus:border-green-500"
                                                            placeholderText="Set due date..."
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-[150px]">
                                                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-1.5 ml-1">Progress ({t.progressPercent}%)</label>
                                                        <input type="range" min="0" max="100" value={t.progressPercent || 0} onChange={e => setTaskProgress(t.id, parseInt(e.target.value))} className={`w-full h-8 ${t.failed ? 'accent-red-600' : 'accent-green-600'}`} />
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => toggleMyDay(t.id)} className={`p-2.5 rounded-xl border transition-all ${t.myDay ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}><Sun className="w-4 h-4" /></button>
                                                        <button onClick={() => toggleImportant(t.id)} className={`p-2.5 rounded-xl border transition-all ${t.priority === 'high' ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}><Star className="w-4 h-4" /></button>
                                                        <button onClick={() => startEdit(t)} className="p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-slate-500 hover:text-blue-400 transition-all"><Edit3 className="w-4 h-4" /></button>
                                                        <button onClick={() => removeTask(t.id)} className="p-2.5 rounded-xl border bg-slate-900 border-slate-700 text-slate-500 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-900/40 rounded-2xl border border-slate-700/50 p-4">
                                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><PlusCircle className="w-4 h-4" /> Subtasks</h4>
                                                    <div className="space-y-2">
                                                        {(t.subtasks || []).map(sub => (
                                                            <div key={sub.id} className="group flex items-center gap-3 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/30">
                                                                <input type="checkbox" checked={!!sub.completed} onChange={() => toggleSubtask(t.id, sub.id)} className="w-4 h-4 accent-green-600 rounded cursor-pointer" />
                                                                {editingSubtask?.subId === sub.id ? (
                                                                  <div className="flex-1 flex gap-2">
                                                                    <input autoFocus value={editingSubtask.text} onChange={e => setEditingSubtask({...editingSubtask, text: e.target.value})} onKeyDown={e => e.key === 'Enter' && saveSubtaskEdit()} className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-sm text-white outline-none" />
                                                                    <button onClick={saveSubtaskEdit} className="text-green-500"><CheckCircle className="w-4 h-4" /></button>
                                                                </div>
                                                                ) : (
                                                                  <span className={`flex-1 text-sm font-medium ${sub.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>{sub.title}</span>
                                                                )}
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                                    <button onClick={() => setEditingSubtask({taskId: t.id, subId: sub.id, text: sub.title})} className="p-1 text-slate-500 hover:text-blue-400"><Edit3 className="w-3.5 h-3.5" /></button>
                                                                    <button onClick={() => removeSubtask(t.id, sub.id)} className="p-1 text-slate-500 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        <div className="flex gap-2 mt-4">
                                                            <input placeholder="New subtask..." onKeyDown={e => {
                                                                if (e.key === 'Enter' && (e.currentTarget.value || '').trim()) {
                                                                    addSubtask(t.id, e.currentTarget.value);
                                                                    e.currentTarget.value = '';
                                                                }
                                                            }} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-green-500 transition-all" />
                                                            <button onClick={(e) => {
                                                                const input = (e.currentTarget.previousElementSibling as HTMLInputElement | null);
                                                                if (input && input.value.trim()) {
                                                                    addSubtask(t.id, input.value);
                                                                    input.value = '';
                                                                }
                                                            }} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-white font-bold transition-all">Add</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                                    <Target className="w-8 h-8 text-purple-400" /> Mastery Goals
                                </h2>
                                <p className="text-slate-400 mt-1 font-medium">Daily consistency tracking across any date.</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={() => setIsAddingGoal(!isAddingGoal)}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" /> NEW GOAL
                                </button>
                                
                                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-1 shadow-inner">
                                    <button onClick={() => setGoalLogDate(format(subDays(parseISO(goalLogDate), 1), 'yyyy-MM-dd'))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                                    <div className="flex flex-col items-center px-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">Logging For</span>
                                        <input 
                                            type="date" 
                                            value={goalLogDate} 
                                            onChange={e => setGoalLogDate(e.target.value)}
                                            className="bg-transparent border-none text-white text-xs outline-none font-black text-center"
                                        />
                                    </div>
                                    <button onClick={() => setGoalLogDate(format(addDays(parseISO(goalLogDate), 1), 'yyyy-MM-dd'))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-all"><ChevronRightIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>

                        {isAddingGoal && (
                            <div className="p-8 bg-slate-800 border-2 border-purple-500/30 rounded-3xl shadow-2xl space-y-6 animate-in slide-in-from-top-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Define New Objective</h3>
                                    <button onClick={() => setIsAddingGoal(false)} className="p-2 hover:bg-slate-700 rounded-full text-slate-500"><X className="w-5 h-5"/></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Goal Title</label>
                                        <input autoFocus value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} placeholder="e.g. Master React Internals" className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-purple-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Domain Focus</label>
                                        <select value={newGoalSkillId} onChange={e => setNewGoalSkillId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-white outline-none focus:border-purple-500">
                                            {appData.skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button onClick={handleCreateGoal} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-600/30 uppercase text-xs tracking-widest">Create Objective</button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {goals.map(goal => {
                                const totalM = goal.milestones.length;
                                const doneM = goal.milestones.filter(m => m.completed).length;
                                const mProgress = totalM > 0 ? Math.round((doneM / totalM) * 100) : 0;
                                
                                const dayLog = goalDailyLogs.find(l => l.goal_id === goal.id && l.date === goalLogDate);

                                return (
                                    <div key={goal.id} className="p-6 bg-slate-800 border border-slate-700 rounded-[2rem] shadow-xl flex flex-col group hover:border-purple-500/50 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-white group-hover:text-purple-400 transition-colors">{goal.title}</h3>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded-full">
                                                        <div className={`w-2 h-2 rounded-full ${dayLog?.worked === true ? 'bg-green-500' : (dayLog?.worked === false ? 'bg-red-500' : 'bg-slate-600')}`} />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                            {dayLog?.worked === true ? 'Worked' : (dayLog?.worked === false ? 'Did Not Work' : 'Not Logged')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <div className="text-3xl font-black text-white">{goal.progress_percent}%</div>
                                                <button onClick={() => removeGoal(goal.id)} className="text-slate-600 hover:text-red-400 mt-2 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                            </div>
                                        </div>

                                        <div className="mb-6 p-5 bg-slate-900/50 border border-slate-700 rounded-[1.5rem] space-y-4">
                                            <div className="flex items-center justify-between gap-3">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Worked on {goalLogDate}?</span>
                                                <div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-slate-700 shadow-inner">
                                                    <button 
                                                        onClick={() => setGoalWorkedStatus(goal.id, true)}
                                                        className={`px-4 py-2 text-[10px] font-black rounded-lg uppercase transition-all ${dayLog?.worked === true ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >Yes</button>
                                                    <button 
                                                        onClick={() => setGoalWorkedStatus(goal.id, false)}
                                                        className={`px-4 py-2 text-[10px] font-black rounded-lg uppercase transition-all ${dayLog?.worked === false ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                                                    >No</button>
                                                </div>
                                            </div>
                                            <textarea 
                                                placeholder="What did you do today?" 
                                                value={dayLog?.note || ''}
                                                onChange={e => updateGoalDailyNote(goal.id, e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-all resize-none h-20"
                                            />
                                        </div>

                                        <div className="mb-8 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Progress</label>
                                                {goal.manual_progress && <span className="text-[10px] bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded font-bold uppercase">Manual</span>}
                                            </div>
                                            <input type="range" min="0" max="100" value={goal.progress_percent} onChange={e => updateGoalManualProgress(goal.id, parseInt(e.target.value))} className="w-full accent-purple-500" />
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
                                                    <CheckCircle className="w-3.5 h-3.5 text-purple-400" /> Milestones
                                                </span>
                                                <span className="text-xs font-black text-purple-400 bg-purple-400/10 px-2 py-1 rounded-lg">{doneM}/{totalM}</span>
                                            </div>
                                            
                                            <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700/50">
                                                <div className="h-full bg-purple-500 transition-all duration-700" style={{ width: `${mProgress}%` }} />
                                            </div>

                                            <div className="space-y-2 mt-4 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                                {goal.milestones.map(m => (
                                                    <div key={m.id} className="group/m flex items-center gap-2">
                                                        <button 
                                                            onClick={() => updateGoalMilestone(goal.id, m.id)} 
                                                            className="flex-1 flex items-center gap-3 p-3 bg-slate-900/30 border border-slate-700/30 hover:border-purple-500/30 rounded-2xl transition-all text-left"
                                                        >
                                                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${m.completed ? 'bg-purple-600 border-purple-500' : 'bg-slate-800 border-slate-700 group-hover/m:border-purple-500/50'}`}>
                                                                {m.completed && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                                            </div>
                                                            {editingMilestone?.mId === m.id ? (
                                                                <div className="flex-1 flex gap-2" onClick={e => e.stopPropagation()}>
                                                                    <input autoFocus value={editingMilestone.text} onChange={e => setEditingMilestone({...editingMilestone, text: e.target.value})} onKeyDown={e => e.key === 'Enter' && saveMilestoneEdit()} className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-sm text-white outline-none" />
                                                                    <button onClick={saveMilestoneEdit} className="text-green-500"><CheckCircle className="w-4 h-4" /></button>
                                                                </div>
                                                            ) : (
                                                                <span className={`text-sm font-medium transition-all ${m.completed ? 'text-slate-600 line-through' : 'text-slate-300'}`}>{m.title}</span>
                                                            )}
                                                        </button>
                                                        <div className="flex flex-col gap-1 opacity-0 group-hover/m:opacity-100 transition-all">
                                                            <button onClick={() => setEditingMilestone({goalId: goal.id, mId: m.id, text: m.title})} className="p-1.5 text-slate-500 hover:text-blue-400 rounded-lg hover:bg-slate-700/50 transition-all">
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                            </button>
                                                            <button onClick={() => deleteMilestone(goal.id, m.id)} className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-700/50 transition-all">
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                
                                                <div className="pt-2">
                                                    <input placeholder="+ Add milestone..." onKeyDown={e => {
                                                        if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                                            const text = e.currentTarget.value.trim();
                                                            updateAppData(prev => ({
                                                                ...prev,
                                                                goals: prev.goals.map(g => g.id === goal.id ? { ...g, milestones: [...g.milestones, { id: Math.random().toString(36).substr(2, 9), title: text, completed: false }] } : g)
                                                            }));
                                                            e.currentTarget.value = '';
                                                        }
                                                    }} className="w-full bg-slate-900 border border-slate-700/50 rounded-[1.5rem] px-4 py-3 text-xs text-white outline-none focus:border-purple-500 transition-all" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
