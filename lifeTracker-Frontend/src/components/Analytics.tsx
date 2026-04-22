import React, { useMemo, useState } from 'react';
import { AppData } from '../data/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { format, subDays, parseISO, isToday, addDays, differenceInMinutes, parse } from 'date-fns';
import { 
  BarChart2, Activity, BrainCircuit, Download, Calendar, 
  ChevronLeft, ChevronRight, CheckCircle, XCircle, Target, 
  Clock, Utensils, BookOpen, Zap, Droplets, Dumbbell, Info
} from 'lucide-react';
import { ContinuityGraph } from './modules/ContinuityGraph';
import { StaticWeekReport } from './modules/StaticWeekReport';
// import StaticEndGoal from './StaticEndGoal';

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

  // All Time Trend Data
  const allTimeData = useMemo(() => {
    // Collect all dates from various logs
    const allDates = [
      ...Object.keys(appData.daily_logs || {}),
      ...Object.keys(appData.health_logs || {}),
      ...(appData.study_sessions || []).map(s => s.date),
      ...(appData.todo_tasks || []).map(t => t.createdAt?.split('T')[0]).filter(Boolean),
    ].filter(Boolean) as string[];

    let startDate = parseISO(selectedDate);
    if (allDates.length > 0) {
      allDates.sort();
      const firstRecord = parseISO(allDates[0]);
      if (firstRecord < startDate) {
        startDate = firstRecord;
      }
    } else {
      startDate = subDays(parseISO(selectedDate), 6);
    }

    const data = [];
    const endDate = parseISO(selectedDate);
    let currentDate = startDate;
    
    while (currentDate <= endDate) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      const health = appData.health_logs[dateStr];
      const sleep = appData.daily_logs[dateStr];
      const studyMins = appData.study_sessions
        .filter(s => s.date === dateStr)
        .reduce((sum, s) => sum + s.duration_minutes, 0);

      const dayTasks = appData.todo_tasks.filter(t => !t.failed && t.createdAt && t.createdAt.startsWith(dateStr));
      const completedCount = dayTasks.filter(t => t.completed).length;

      data.push({
        name: format(currentDate, 'MMM d'),
        fullDate: dateStr,
        energy: sleep?.energy_morning || health?.energy_afternoon || 0,
        mood: health?.mood_score || 0,
        dayScore: sleep?.day_score || 0,
        lcSolved: sleep?.lc_solved || 0,
        studyHours: Math.round((studyMins / 60) * 10) / 10,
        tasks: completedCount
      });
      
      currentDate = addDays(currentDate, 1);
    }
    return data;
  }, [appData, selectedDate]);

  const { avgDayScore, avgStudyHours } = useMemo(() => {
    if (allTimeData.length === 0) return { avgDayScore: "0.0", avgStudyHours: "0.0" };
    
    let totalScore = 0;
    let scoreCount = 0;
    let totalStudy = 0;

    allTimeData.forEach(d => {
      if (d.dayScore > 0) {
        totalScore += d.dayScore;
        scoreCount++;
      }
      totalStudy += (d.studyHours || 0);
    });

    const avgScoreStr = scoreCount > 0 ? (totalScore / scoreCount).toFixed(1) : "0.0";
    const avgStudyStr = (totalStudy / allTimeData.length).toFixed(1);

    return { avgDayScore: avgScoreStr, avgStudyHours: avgStudyStr };
  }, [allTimeData]);

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
        long_term_goals: dayGoalLogs.map(l => {
            const fullGoal = appData.goals.find(g => g.id === l.goal_id);
            return {
                ...l,
                goal_name: fullGoal?.title || "Unknown Goal",
                goal_details: fullGoal || null, // Include full definition (milestones, action plan, etc)
            };
        }),
        todo_tasks: dayTasks,
        all_goals_definitions: appData.goals, // Full context of all goals
        all_skills: appData.skills // Full context for skill IDs
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
    const dayLog = appData.daily_logs[dateStr];

    const allTimeLC = Object.values(appData.daily_logs).reduce((sum, log) => sum + (log.lc_solved || 0), 0);

    return {
      studyMins,
      tasksDone: dayTasks.filter(t => t.completed).length,
      tasksFailed: dayTasks.filter(t => t.failed).length,
      goalsWorked: goalLogs.length,
      mealsCount: meals.length,
      sleepMins,
      waterMl: health?.water_intake || 0,
      didExercise: health?.did_exercise,
      calories: totalCals,
      dayScore: dayLog?.day_score || 0,
      lcSolved: dayLog?.lc_solved || 0,
      allTimeLC
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

        {/* Continuity Matrix */}
        {/* <StaticEndGoal className="col-span-full" /> */}
        <ContinuityGraph appData={appData} selectedDate={selectedDate} />

        {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Day Score Card */}
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-[2rem] shadow-lg group/score relative hover:border-yellow-500/50 transition-all cursor-help">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg"><Zap className="w-5 h-5" /></div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance</span>
              <Info className="w-3.5 h-3.5 text-slate-600 group-hover/score:text-yellow-500 transition-colors" />
            </div>
          </div>
          
          {/* Matrix Tooltip */}
          <div className="absolute top-full left-0 mt-4 w-72 p-4 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl opacity-0 invisible group-hover/score:opacity-100 group-hover/score:visible transition-all z-50 pointer-events-none scale-95 group-hover/score:scale-100 origin-top-left">
            <h4 className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Score Matrix Guide</h4>
            <div className="space-y-3">
              <div className="flex gap-2.5">
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 h-fit">9–10</span>
                <p className="text-[10px] leading-relaxed text-slate-300"><span className="font-bold text-white">Elite Day:</span> All 4 goals hit, slept before 12:30, no time leaks. (Rare, target 2-3x/week)</p>
              </div>
              <div className="flex gap-2.5">
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20 h-fit">8–8.5</span>
                <p className="text-[10px] leading-relaxed text-slate-300"><span className="font-bold text-white">Good Day:</span> 3 goals fully done, one partially. Your standard target.</p>
              </div>
              <div className="flex gap-2.5">
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 h-fit">7–7.5</span>
                <p className="text-[10px] leading-relaxed text-slate-300"><span className="font-bold text-white">Acceptable:</span> Worked, missed one goal. Don't let it become a trend.</p>
              </div>
              <div className="flex gap-2.5 pt-1 border-t border-slate-800">
                <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 border border-red-500/20 h-fit">{"<"} 6</span>
                <p className="text-[10px] leading-relaxed text-red-400"><span className="font-bold">Red Flag:</span> Late-night slip or full goal skipped. Max 4-5 per 40 days.</p>
              </div>
            </div>
          </div>

          <div className="text-3xl font-black text-white">
            {selectedDateStats.dayScore}<span className="text-lg text-slate-500 ml-1">/10</span>
          </div>
          <p className="text-xs text-slate-500 font-bold mt-2 uppercase tracking-tighter">Day Score</p>
        </div>

        {/* Productivity Card */}
        <div className="p-6 bg-slate-800 border border-slate-700 rounded-[2rem] shadow-lg group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><BookOpen className="w-5 h-5" /></div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Productivity</span>
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-2xl font-black text-white">
                {Math.floor(selectedDateStats.studyMins / 60)}<span className="text-sm text-slate-500 ml-1 uppercase">hr</span> {selectedDateStats.studyMins % 60}<span className="text-sm text-slate-500 ml-1 uppercase">min</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">Study Sessions</p>
            </div>
            <div className="pt-3 border-t border-slate-700/50">
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-blue-400">{selectedDateStats.lcSolved}</span>
                <span className="text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-tighter">Today</span>
                <span className="text-sm text-slate-600 mb-1">/</span>
                <span className="text-sm font-black text-slate-300 mb-0.5">{selectedDateStats.allTimeLC}</span>
                <span className="text-[10px] font-black text-slate-500 mb-1.5 uppercase tracking-tighter">Total</span>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">DSA Solved</p>
              </div>
             
            </div>
          </div>
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
            <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-900 px-3 py-1 rounded-full border border-slate-700">All Time</span>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={allTimeData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '1.5rem', color: '#fff', padding: '12px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'black', textTransform: 'uppercase', paddingTop: '20px' }} />
                <Line type="monotone" dataKey="studyHours" name="Study" stroke="#3b82f6" strokeWidth={5} dot={{ r: 5, strokeWidth: 3, fill: '#0f172a' }} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="lcSolved" name="LC Solved" stroke="#60a5fa" strokeWidth={5} dot={{ r: 5, strokeWidth: 3, fill: '#0f172a' }} />
                <Line type="monotone" dataKey="dayScore" name="Day Score" stroke="#eab308" strokeWidth={5} dot={{ r: 5, strokeWidth: 3, fill: '#0f172a' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex items-center justify-center gap-6 pt-6 border-t border-slate-700/50">
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Avg Score</span>
               <span className="text-xl font-black text-yellow-500">{avgDayScore}</span>
            </div>
            <div className="w-px h-8 bg-slate-700/50"></div>
            <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Avg Study</span>
               <span className="text-xl font-black text-blue-400">{avgStudyHours}<span className="text-[10px] text-slate-500 ml-1">h/day</span></span>
            </div>
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

      <StaticWeekReport />
    </div>
  );
}
