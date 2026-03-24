import React, { useMemo } from 'react';
import { AppData } from '../../data/types';
import { format, subDays, parseISO, isSameDay, differenceInCalendarDays } from 'date-fns';

interface Props {
  appData: AppData;
  selectedDate: string;
}

export function ContinuityGraph({ appData, selectedDate }: Props) {
  // Calculate challenge day relative to the VIEWED date
  const challengeDay = useMemo(() => {
    const startStr = appData.settings.challenge_start_date || (appData.learning_plans?.[0]?.start_date);
    if (!startStr) return 0;
    
    const start = parseISO(startStr);
    const viewed = parseISO(selectedDate);
    const diff = differenceInCalendarDays(viewed, start);
    return diff >= 0 ? diff + 1 : 0;
  }, [appData, selectedDate]);

  // We'll show the last 40 days ending at the selectedDate or Today (whichever is later)
  const days = useMemo(() => {
    const today = new Date();
    const viewed = parseISO(selectedDate);
    const endDate = viewed > today ? viewed : today;
    
    const result = [];
    for (let i = 39; i >= 0; i--) {
      const d = subDays(endDate, i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const log = appData.daily_logs[dateStr];
      const score = log?.day_score || 0;
      result.push({
        date: d,
        dateStr,
        score,
        isToday: isSameDay(d, today),
        isSelected: isSameDay(d, viewed)
      });
    }
    return result;
  }, [appData, selectedDate]);

  const getColor = (score: number) => {
    if (score === 0) return 'bg-slate-800/50 border-slate-700/30';
    if (score < 6) return 'bg-emerald-900/30 border-emerald-800/20';
    if (score < 7.5) return 'bg-emerald-800/60 border-emerald-700/40';
    if (score < 8.5) return 'bg-emerald-600 border-emerald-500/50';
    if (score < 9.5) return 'bg-emerald-400 border-emerald-300/50';
    return 'bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.3)] border-white/20';
  };

  const getLabel = (score: number) => {
    if (score === 0) return 'No data';
    if (score < 6) return 'Low Performance';
    if (score < 7.5) return 'Acceptable';
    if (score < 8.5) return 'Good Day';
    return 'Elite Day';
  };

  return (
    <div className="p-8 bg-slate-800 border border-slate-700 rounded-[2.5rem] shadow-lg">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(110, 231, 183, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(110, 231, 183, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(110, 231, 183, 0); }
        }
        .animate-pulse-today {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}} />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-3">
            <div className="w-2 h-6 bg-emerald-500 rounded-full" /> Continuity Matrix
            {challengeDay > 0 && (
              <span className="ml-2 px-3 py-1 bg-emerald-500 text-slate-900 text-[15px] font-black rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)] ">
                DAY {challengeDay-365}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">40-Day Mastery Progress</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-900/50 px-4 py-2 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-slate-800/50 border border-slate-700/30" />
            <span className="text-[9px] font-black text-slate-500 uppercase">None</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-900/30" />
            <span className="text-[9px] font-black text-slate-500 uppercase">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-700" />
            <span className="text-[9px] font-black text-slate-500 uppercase">Med</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-emerald-400" />
            <span className="text-[9px] font-black text-slate-500 uppercase">High</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
        {days.map((day, i) => (
          <div 
            key={day.dateStr} 
            className="group relative"
          >
            <div 
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-[4px] border transition-all duration-300 ${getColor(day.score)} ${day.isSelected ? 'border-white scale-110 z-10' : ''} ${day.isToday ? 'animate-pulse-today ring-2 ring-emerald-500/50' : ''}`}
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-32 p-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-center">
              <div className="text-[10px] font-black text-white mb-1">{format(day.date, 'MMM d, yyyy')}</div>
              <div className={`text-[10px] font-bold uppercase ${day.score === 0 ? 'text-slate-500' : 'text-emerald-400'}`}>
                Score: {day.score || 'N/A'}
              </div>
              <div className="text-[9px] text-slate-400 mt-0.5">{getLabel(day.score)}</div>
              {day.isToday && <div className="text-[8px] text-emerald-500 font-black uppercase mt-1">Today</div>}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-700/50 pt-8">
        <div className="text-center">
          <div className="text-2xl font-black text-white">
            {days.filter(d => d.score >= 9).length}
          </div>
          <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Elite Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-white">
            {days.filter(d => d.score >= 7.5 && d.score < 9).length}
          </div>
          <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Target Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-white">
            {days.filter(d => d.score > 0 && d.score < 6).length}
          </div>
          <div className="text-[10px] font-black text-emerald-900 uppercase tracking-widest">Low Days</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-white">
            {Math.round((days.filter(d => d.score > 0).length / 40) * 100)}%
          </div>
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Coverage</div>
        </div>
      </div>
    </div>
  );
}
