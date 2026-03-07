import React, { useMemo } from 'react';
import { AppData, DaySection, Category } from '../../data/types';
import { cn } from '../../lib/utils';
import { Clock } from 'lucide-react';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
  selectedDate: string;
}

const DEFAULT_BLOCKS = [
  { name: 'Morning', order: 1, hours: [4, 12] },
  { name: 'Afternoon', order: 2, hours: [12, 16] },
  { name: 'Evening', order: 3, hours: [16, 20] },
  { name: 'Night', order: 4, hours: [20, 24] }
];

const TIME_RANGES: Record<string, string> = {
  Morning: '4am → 12pm',
  Afternoon: '12pm → 4pm',
  Evening: '4pm → 8pm',
  Night: '8pm → 4am'
};

const CATEGORY_COLORS: Record<Category, string> = {
  Study: 'bg-blue-500',
  Work: 'bg-indigo-500',
  Rest: 'bg-emerald-500',
  Exercise: 'bg-orange-500',
  Leisure: 'bg-purple-500',
  Other: 'bg-slate-500'
};

export function DaySectionsModule({ appData, updateAppData, selectedDate }: Props) {
  const todaysSections = appData.day_sections.filter(s => s.date === selectedDate);

  const currentHour = new Date().getHours();
  const currentBlockOrder = useMemo(() => {
    if (currentHour >= 4 && currentHour < 12) return 1;
    if (currentHour >= 12 && currentHour < 16) return 2;
    if (currentHour >= 16 && currentHour < 20) return 3;
    return 4; // Night
  }, [currentHour]);

  // Ensure default blocks exist for the day
  const blocks = DEFAULT_BLOCKS.map(db => {
    return todaysSections.find(s => s.block_order === db.order) || {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      block_name: db.name,
      block_order: db.order,
      notes: '',
      category: 'Other' as Category
    };
  });

  const handleUpdateBlock = (_blockId: string | undefined, index: number, updates: Partial<DaySection>) => {
    updateAppData(prev => {
      const existing = prev.day_sections.find(s => s.date === selectedDate && s.block_order === DEFAULT_BLOCKS[index].order);
      let newSections = [...prev.day_sections];
      if (existing) {
        newSections = newSections.map(s => s.id === existing.id ? { ...s, ...updates } : s);
      } else {
        const newBlock: DaySection = {
          id: Math.random().toString(36).substr(2, 9),
          date: selectedDate,
          block_name: DEFAULT_BLOCKS[index].name,
          block_order: DEFAULT_BLOCKS[index].order,
          notes: '',
          category: 'Other',
          ...updates
        };
        newSections.push(newBlock);
      }
      return { ...prev, day_sections: newSections };
    });
  };

  return (
    <div className="space-y-6">
      {/* Visual Timeline Bar */}
      <div className="h-4 flex rounded-full overflow-hidden bg-slate-900 border border-slate-700 shadow-inner">
        {blocks.map((block, i) => (
          <div 
            key={i} 
            className={cn(
              "h-full flex-1 border-r border-slate-900 last:border-0 transition-all duration-500",
              CATEGORY_COLORS[block.category] || 'bg-slate-800',
              block.block_order === currentBlockOrder ? "opacity-100 scale-y-110 shadow-[0_0_15px_rgba(255,255,255,0.2)]" : "opacity-40"
            )}
            title={`${block.block_name}: ${block.category}`}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blocks.map((block, index) => {
          const isCurrent = block.block_order === currentBlockOrder;
          return (
            <div 
              key={block.block_order} 
              className={cn(
                "p-4 border rounded-xl space-y-3 transition-all duration-300",
                isCurrent 
                  ? "bg-slate-700/40 border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/30" 
                  : "bg-slate-800/30 border-slate-700/50"
              )}
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-2">
                  {block.block_name} 
                  {isCurrent && <span className="text-[10px] bg-purple-500 text-white px-2 py-0.5 rounded-full uppercase tracking-tighter">Current</span>}
                </h4>
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700 uppercase flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> {TIME_RANGES[block.block_name]}
                  </div>
                  <select 
                    value={block.category} 
                    onChange={e => handleUpdateBlock(block.id, index, { category: e.target.value as Category })}
                    className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1 text-xs text-white outline-none focus:border-purple-500"
                  >
                    {Object.keys(CATEGORY_COLORS).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
              <textarea 
                value={block.notes} 
                onChange={e => handleUpdateBlock(block.id, index, { notes: e.target.value })}
                placeholder="What did you do during this block?"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 resize-none outline-none focus:border-purple-500 h-24 placeholder:text-slate-600 font-medium"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
