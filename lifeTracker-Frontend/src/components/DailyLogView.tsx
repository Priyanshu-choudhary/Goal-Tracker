import React, { useState } from 'react';
import { format, subDays, addDays } from 'date-fns';
import { AppData } from '../data/types';
import { SleepModule } from './modules/SleepModule';
import { StudyModule } from './modules/StudyModule';
// import StaticEndGoal from './StaticEndGoal';
import { ChevronLeft, ChevronRight, Moon, BookOpen, PenLine } from 'lucide-react';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
}

export function DailyLogView({ appData, updateAppData }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateStr = format(currentDate, 'yyyy-MM-dd');

  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    study: true, sleep: true, summary: true
  });

  const toggle = (key: string) => setExpanded(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg sticky top-0 z-20">
        <button onClick={() => setCurrentDate(subDays(currentDate, 1))} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-bold text-white tracking-wide">
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </h2>
        <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-6">
        {/* <StaticEndGoal /> */}
        {/* Module 0: Daily Summary */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
          <button onClick={() => toggle('summary')} className="w-full flex items-center justify-between p-5 bg-slate-800 hover:bg-slate-750 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-600/20 text-yellow-400 rounded-lg"><PenLine className="w-5 h-5" /></div>
              <h3 className="text-lg font-bold text-white">Daily Summary</h3>
            </div>
            <span className="text-slate-500 text-sm font-medium">{expanded.summary ? 'Collapse' : 'Expand'}</span>
          </button>
          {expanded.summary && (
            <div className="p-5 border-t border-slate-700/50 bg-slate-800/50 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Daily Experience Reflection</label>
                  <textarea
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-slate-300 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 min-h-[120px] transition-all"
                    placeholder="How was your day? What did you feel today?"
                    value={appData.daily_logs[dateStr]?.summary || ''}
                    onChange={(e) => {
                      const summary = e.target.value;
                      updateAppData(prev => ({
                        ...prev,
                        daily_logs: {
                          ...prev.daily_logs,
                          [dateStr]: {
                            ...prev.daily_logs[dateStr],
                            date: dateStr,
                            summary
                          }
                        }
                      }));
                    }}
                  />
                </div>
                <div className="w-full md:w-auto flex gap-4">
                  <div className="w-24 md:w-32 flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50">
                    <label className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mb-2 text-center">Day Score</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      className="w-full bg-transparent text-center text-2xl font-black text-white outline-none"
                      placeholder="0.0"
                      value={appData.daily_logs[dateStr]?.day_score || ''}
                      onChange={(e) => {
                        const day_score = parseFloat(e.target.value);
                        updateAppData(prev => ({
                          ...prev,
                          daily_logs: {
                            ...prev.daily_logs,
                            [dateStr]: {
                              ...prev.daily_logs[dateStr],
                              date: dateStr,
                              day_score: isNaN(day_score) ? undefined : day_score
                            }
                          }
                        }));
                      }}
                    />
                    <div className="text-[10px] font-bold text-slate-500 mt-1">/ 10</div>
                  </div>

                  <div className="w-24 md:w-32 flex flex-col items-center justify-center p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50">
                    <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 text-center">LC Solved</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full bg-transparent text-center text-2xl font-black text-white outline-none"
                      placeholder="0"
                      value={appData.daily_logs[dateStr]?.lc_solved || ''}
                      onChange={(e) => {
                        const lc_solved = parseInt(e.target.value);
                        updateAppData(prev => ({
                          ...prev,
                          daily_logs: {
                            ...prev.daily_logs,
                            [dateStr]: {
                              ...prev.daily_logs[dateStr],
                              date: dateStr,
                              lc_solved: isNaN(lc_solved) ? undefined : lc_solved
                            }
                          }
                        }));
                      }}
                    />
                    <div className="text-[10px] font-bold text-slate-500 mt-1">Questions</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Module 4: Study (Most important) */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
          <button onClick={() => toggle('study')} className="w-full flex items-center justify-between p-5 bg-slate-800 hover:bg-slate-750 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg"><BookOpen className="w-5 h-5" /></div>
              <h3 className="text-lg font-bold text-white">Study & Learning Log</h3>
            </div>
            <span className="text-slate-500 text-sm font-medium">{expanded.study ? 'Collapse' : 'Expand'}</span>
          </button>
          {expanded.study && (
            <div className="p-5 border-t border-slate-700/50 bg-slate-800/50">
              <StudyModule appData={appData} updateAppData={updateAppData} selectedDate={dateStr} />
            </div>
          )}
        </div>

        {/* Module 1: Sleep */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-lg">
          <button onClick={() => toggle('sleep')} className="w-full flex items-center justify-between p-5 bg-slate-800 hover:bg-slate-750 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg"><Moon className="w-5 h-5" /></div>
              <h3 className="text-lg font-bold text-white">Sleep Log</h3>
            </div>
            <span className="text-slate-500 text-sm font-medium">{expanded.sleep ? 'Collapse' : 'Expand'}</span>
          </button>
          {expanded.sleep && (
            <div className="p-5 border-t border-slate-700/50 bg-slate-800/50">
              <SleepModule appData={appData} updateAppData={updateAppData} selectedDate={dateStr} />
            </div>
          )}
        </div>


      </div>
    </div>
  );
}
