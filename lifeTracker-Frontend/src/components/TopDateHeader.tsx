import React from 'react';
import { format, parseISO, subDays, addDays } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';

type Props = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  onExport?: () => void;
  exportLabel?: string;
};

export default function TopDateHeader({
  title,
  description,
  icon,
  selectedDate,
  setSelectedDate,
  onExport,
  exportLabel = 'EXPORT JSON',
}: Props) {
  const formatted = (() => {
    try {
      return format(parseISO(selectedDate), 'EEEE, MMMM do');
    } catch {
      return selectedDate;
    }
  })();

  const goPrev = () => setSelectedDate(format(subDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));
  const goNext = () => setSelectedDate(format(addDays(parseISO(selectedDate), 1), 'yyyy-MM-dd'));

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-slate-800 p-6 rounded-[2rem] border border-slate-700 shadow-xl">
      <div className="flex items-center gap-4">
        <div>{icon}</div>
        <div>
          <h2 className="text-2xl font-black text-white">{title}</h2>
          {description && <p className="text-slate-400 mt-1 text-sm">{description}</p>}
          <div className="flex items-center gap-2 text-slate-400 mt-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-wider">{formatted}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-1.5 shadow-inner">
          <button onClick={goPrev} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-transparent border-none text-white text-sm outline-none font-black text-center w-32"
          />
          <button onClick={goNext} className="p-2.5 hover:bg-slate-800 rounded-xl text-slate-400 transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        {onExport && (
          <button onClick={onExport} className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-sm rounded-2xl transition-all shadow-lg shadow-blue-500/20">
            <Download className="w-5 h-5" /> {exportLabel}
          </button>
        )}
      </div>
    </div>
  );
}
