import React, { useMemo, useState } from 'react';
import { AppData } from '../data/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { format, subDays, parseISO, isToday, addDays, differenceInMinutes, parse } from 'date-fns';
import { 
  BarChart2, Activity, BrainCircuit, Download, Calendar, 
  ChevronLeft, ChevronRight, CheckCircle, XCircle, Target, 
  Clock, Utensils, BookOpen, Zap, Droplets, Dumbbell
} from 'lucide-react';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
}

export function Analytics({ appData, updateAppData: _updateAppData }: Props) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Global Study Data for the Bar Chart
  const studyData = useMemo(() => {
    return appData.skills.map(skill => {
      const hours = appData.study_sessions
        .filter(s => s.skill_id === skill.id)
        .reduce((sum, s) => sum + s.duration_minutes, 0) / 60;
      return {
        name: skill.name,
        hours: Math.round(hours * 10) / 10
      };
    }).filter(d => d.hours > 0).sort((a, b) => b.hours - a.hours);
  }, [appData]);

  // Weekly Trend Data
  const weeklyData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = subDays(parseISO(selectedDate), i);
      const dateStr = format(d, 'yyyy-MM-dd');
      
      const health = appData.health_logs[dateStr];
      const sleep = appData.daily_logs[dateStr];
      const studyMins = appData.study_sessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + s.duration_minutes, 0);

      const dayTasks = appData.todo_tasks.filter(t => !t.failed && t.createdAt && t.createdAt.startsWith(dateStr));
      const completedCount = dayTasks.filter(t => t.completed).length;

      data.push({
        name: format(d, 'EEE'),
        fullDate: dateStr,
        energy: sleep?.energy_morning || health?.energy_afternoon || 0,
        mood: health?.mood_score || 0,
        studyHours: Math.round((studyMins / 60) * 10) / 10,
        tasks: completedCount
      });
    }
    return data;
  }, [appData, selectedDate]);

  // Helper for Sleep Duration
  const calculateSleepMinutes = (dateStr: string) => {
    const log = appData.daily_logs[dateStr];
    if (!log?.sleep_logs) return 0;
    return log.sleep_logs.reduce((total, s) => {
      try {
        const start = parse(s.start_time, 'HH:mm', new Date());
        const end = parse(s.end_time, 'HH:mm', new Date());
        let diff = differenceInMinutes(end, start);
        if (diff < 0) diff += 24 * 60;
        return total + diff;
      } catch { return total; }
    }, 0);
  };

  const exportDayData = () => {
    const dateStr = selectedDate;
    
    // Derived Metrics for LLM
    const sleepMins = calculateSleepMinutes(dateStr);
    const dayMeals = appData.food_logs.filter(f => f.date === dateStr);
    const dayStudy = appData.study_sessions.filter(s => s.date === dateStr);
    const dayTasks = appData.todo_tasks.filter(t => 
        (t.createdAt && t.createdAt.startsWith(dateStr)) || 
        (t.dueAt && t.dueAt.startsWith(dateStr)) ||
        (t.dueDate === dateStr)
    );
    const dayGoalLogs = (appData.goal_daily_logs || []).filter(l => l.date === dateStr);
    
    const studyMins = dayStudy.reduce((acc, s) => acc + s.duration_minutes, 0);
    const completedTasks = dayTasks.filter(t => t.completed).length;
    const failedTasks = dayTasks.filter(t => t.failed).length;
    const totalCals = dayMeals.reduce((sum, m) => sum + (m.calories || 0), 0);
    const health = appData.health_logs[dateStr];
    
    // Requirement: summary_metrics at last, raw_data mapping names
    const dayData = {
      metadata: {
        export_date: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
        target_date: dateStr,
        app_version: "2.1.0",
        llm_context: "Personal life tracking data including health, productivity, and habits."
      },
      raw_data: {
        daily_log: appData.daily_logs[dateStr] || null,
        health_log: health || null,
        day_sections: appData.day_sections.filter(s => s.date === dateStr),
        food_logs: dayMeals,
        study_sessions: dayStudy,
        long_term_goals: dayGoalLogs.map(l => ({
            ...l,
            goal_name: appData.goals.find(g => g.id === l.goal_id)?.title || "Unknown Goal"
        })),
        todo_tasks: dayTasks
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
        total_goals_monitored: appData.goals.length,
        water_intake_ml: health?.water_intake || 0,
        water_glasses: Math.round((health?.water_intake || 0) / 250) // Assuming 250ml glass
      }
    };

    const blob = new Blob([JSON.stringify(dayData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life_tracker_llm_export_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedDateStats = useMemo(() => {
    const dateStr = selectedDate;
    const studyMins = appData.study_sessions
      .filter(s => s.date === dateStr)
      .reduce((sum, s) => sum + s.duration_minutes, 0);
    
    const dayTasks = appData.todo_tasks.filter(t => t.createdAt && t.createdAt.startsWith(dateStr));
    const goalLogs = (appData.goal_daily_logs || []).filter(l => l.date === dateStr && l.worked);
    const meals = appData.food_logs.filter(f => f.date === dateStr);
    const sleepMins = calculateSleepMinutes(dateStr);
    const health = appData.health_logs[dateStr];
    const totalCals = meals.reduce((sum, m) => sum + (m.calories || 0), 0);

    return {
      studyMins,
      tasksDone: dayTasks.filter(t => t.completed).length,
      tasksFailed: dayTasks.filter(t => t.failed).length,
      goalsWorked: goalLogs.length,
      mealsCount: meals.length,
      sleepMins,
      waterMl: health?.water_intake || 0,
      didExercise: health?.did_exercise,
      calories: totalCals
    };
  }, [appData, selectedDate]);

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Date Navigation */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-800 p-6 rounded-[2rem] border border-slate-700 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl">
            <BarChart2 className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">Daily Analytics</h2>
            <div className="flex items-center gap-2 text-slate-400 mt-1">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-bold uppercase tracking-wider">{format(parseISO(selectedDate), 'EEEE, MMMM do')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-inner">
                <button 
                    onClick={() => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))} 
                    className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={e => setSelectedDate(e.target.value)}
                    className="bg-transparent border-none text-white text-sm outline-none font-black text-center w-32"
                />
                <button 
                    onClick={() => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'))} 
                    className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
            <button 
                onClick={exportDayData}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-blue-500/20"
            >
                <Download className="w-5 h-5" /> EXPORT JSON
            </button>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Productivity Card */}
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-[2rem] shadow-lg group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><BookOpen className="w-5 h-5" /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Productivity</span>
          </div>
          <div className="text-3xl font-black text-white">
            {Math.floor(selectedDateStats.studyMins / 60)}<span className="text-lg text-slate-500 ml-1">h</span> {selectedDateStats.studyMins % 60}<span className="text-lg text-slate-500 ml-1">m</span>
          </div>
          <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-tighter">Study Sessions</p>
        </div>

        {/* Tasks Card */}
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-[2rem] shadow-lg group hover:border-green-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-500/10 text-green-400 rounded-lg"><CheckCircle className="w-5 h-5" /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Execution</span>
          </div>
          <div className="flex items-end gap-3">
            <div className="text-3xl font-black text-white">{selectedDateStats.tasksDone}</div>
            <div className="text-[10px] font-black bg-red-500/10 text-red-500 px-2 py-1 rounded-full uppercase mb-1">{selectedDateStats.tasksFailed} Failed (Ref)</div>
          </div>
          <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-tighter">Tasks Completed</p>
        </div>

        {/* Goal Consistency Card */}
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-[2rem] shadow-lg group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><Target className="w-5 h-5" /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Consistency</span>
          </div>
          <div className="text-3xl font-black text-white">
            {selectedDateStats.goalsWorked}<span className="text-lg text-slate-500 mx-1">/</span>{appData.goals.length}
          </div>
          <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-tighter">Goals Progressed</p>
        </div>

        {/* Vitality Card - Updated */}
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-[2rem] shadow-lg group hover:border-yellow-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg"><Zap className="w-5 h-5" /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Vitality</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-bold text-white">{(selectedDateStats.waterMl / 250).toFixed(1)} <span className="text-[10px] text-slate-500 uppercase">glasses</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Dumbbell className={`w-4 h-4 ${selectedDateStats.didExercise ? 'text-green-400' : 'text-slate-600'}`} />
                    <span className={`text-[10px] font-black uppercase ${selectedDateStats.didExercise ? 'text-green-400' : 'text-slate-500'}`}>
                        {selectedDateStats.didExercise ? 'Exercised' : 'No Gym'}
                    </span>
                </div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-700/50">
                <div className="flex flex-col">
                    <span className="text-lg font-black text-white">{selectedDateStats.calories} <span className="text-[10px] text-slate-500">kcal</span></span>
                    <span className="text-[10px] font-black text-slate-500 uppercase">Energy In</span>
                </div>
                <div className="text-right">
                    <span className="text-lg font-black text-white">{Math.floor(selectedDateStats.sleepMins / 60)}h</span>
                    <span className="block text-[10px] font-black text-slate-500 uppercase">Sleep</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Visualization */}
        <div className="p-8 bg-slate-800 border border-slate-700 rounded-[2.5rem] shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white flex items-center gap-3">
              <Activity className="w-6 h-6 text-pink-500" /> Performance Trend
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-900 px-3 py-1 rounded-full border border-slate-700">7-Day Window</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '1.5rem', color: '#fff', padding: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="studyHours" name="Study" stroke="#3b82f6" strokeWidth={5} dot={{ r: 5, strokeWidth: 3, fill: '#0f172a' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="tasks" name="Tasks" stroke="#22c55e" strokeWidth={5} dot={{ r: 5, strokeWidth: 3, fill: '#0f172a' }} />
                <Line type="monotone" dataKey="mood" name="Mood" stroke="#ec4899" strokeWidth={5} dot={{ r: 5, strokeWidth: 3, fill: '#0f172a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="p-8 bg-slate-800 border border-slate-700 rounded-[2.5rem] shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-white flex items-center gap-3">
              <BrainCircuit className="w-6 h-6 text-blue-500" /> Topic Specialization
            </h3>
            <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-900 px-3 py-1 rounded-full border border-slate-700">All Time Focus</span>
          </div>
          <div className="h-[300px] w-full">
            {studyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={studyData} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#cbd5e1" fontSize={10} fontWeight="black" tickLine={false} axisLine={false} width={80} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '1.5rem', color: '#fff' }}
                    cursor={{ fill: '#334155', opacity: 0.3 }}
                  />
                  <Bar dataKey="hours" name="Total Hours" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500 flex-col gap-4">
                <BarChart2 className="w-16 h-16 opacity-10" />
                <p className="text-xs font-black uppercase tracking-widest opacity-40">No Data Available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
