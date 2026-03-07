import React, { useState } from 'react';
import { AppData, DailyLog, SleepLog } from '../../data/types';
import { differenceInMinutes, parse, format } from 'date-fns';
import { Moon, Plus, Trash2, Clock, Zap } from 'lucide-react';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
  selectedDate: string;
}

export function SleepModule({ appData, updateAppData, selectedDate }: Props) {
  const log: DailyLog = appData.daily_logs[selectedDate] || { date: selectedDate };
  const sleepLogs = log.sleep_logs || [];

  const [startTime, setStartTime] = useState('23:00');
  const [endTime, setEndTime] = useState('07:00');
  const [quality, setQuality] = useState(3);

  const handleUpdate = (updates: Partial<DailyLog>) => {
    updateAppData(prev => ({
      ...prev,
      daily_logs: {
        ...prev.daily_logs,
        [selectedDate]: { ...log, ...updates, date: selectedDate }
      }
    }));
  };

  const addSleepLog = () => {
    const newLog: SleepLog = {
      id: Math.random().toString(36).substr(2, 9),
      start_time: startTime,
      end_time: endTime,
      quality_score: quality
    };
    handleUpdate({ sleep_logs: [...sleepLogs, newLog] });
  };

  const removeSleepLog = (id: string) => {
    handleUpdate({ sleep_logs: sleepLogs.filter(s => s.id !== id) });
  };

  const getDuration = (start: string, end: string) => {
    try {
      const s = parse(start, 'HH:mm', new Date());
      const e = parse(end, 'HH:mm', new Date());
      let diff = differenceInMinutes(e, s);
      if (diff < 0) diff += 24 * 60;
      return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    } catch {
      return '0h 0m';
    }
  };

  const getTotalDuration = () => {
    let totalMins = 0;
    sleepLogs.forEach(s => {
      try {
        const start = parse(s.start_time, 'HH:mm', new Date());
        const end = parse(s.end_time, 'HH:mm', new Date());
        let diff = differenceInMinutes(end, start);
        if (diff < 0) diff += 24 * 60;
        totalMins += diff;
      } catch {}
    });
    return `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Sleep Time</label>
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Wake Time</label>
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-indigo-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Zap className="w-3 h-3" /> Quality</label>
          <div className="flex gap-1 h-[42px]">
            {[1, 2, 3, 4, 5].map(score => (
              <button key={score} onClick={() => setQuality(score)} className={`flex-1 rounded-lg text-xs font-bold border transition-all ${quality === score ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}>
                {score}
              </button>
            ))}
          </div>
        </div>
        <button onClick={addSleepLog} className="h-[42px] bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
          <Plus className="w-4 h-4" /> Add Sleep
        </button>
      </div>

      <div className="space-y-3">
        {sleepLogs.length > 0 ? (
          <>
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium text-slate-400">Recorded Sleep Sessions</span>
              <span className="text-sm font-bold text-indigo-400 bg-indigo-400/10 px-3 py-1 rounded-full">Total: {getTotalDuration()}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sleepLogs.map(s => (
                <div key={s.id} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between group hover:border-indigo-500/50 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                      <Moon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{s.start_time} - {s.end_time}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{getDuration(s.start_time, s.end_time)}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span>Quality: {s.quality_score}/5</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => removeSleepLog(s.id)} className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 bg-slate-900/20 border border-dashed border-slate-700 rounded-xl">
            <Moon className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-20" />
            <p className="text-sm text-slate-500">No sleep logs recorded for this day.</p>
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-700/30">
        <label className="block text-xs font-medium text-slate-400 mb-2">Morning Energy Score (Overall)</label>
        <div className="flex gap-2 max-w-xs">
          {[1, 2, 3, 4, 5].map(score => (
            <button
              key={score}
              onClick={() => handleUpdate({ energy_morning: score })}
              className={`flex-1 py-2 rounded-lg text-sm font-bold border transition-colors ${log.energy_morning === score ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
            >
              {score}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
