import React from 'react';
import { AppData } from '../data/types';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
  onNavigate: (tab: string) => void;
}

export function Home({ onNavigate }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard</h2>
      <p className="text-slate-400">Welcome to LifeTracker. Start by logging your day or viewing your progress.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => onNavigate('daily-log')}
          className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-750 transition-colors text-left"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Daily Log</h3>
          <p className="text-slate-400 text-sm">Log your sleep, day sections, meals, and study sessions.</p>
        </button>
        <button 
          onClick={() => onNavigate('analytics')}
          className="p-6 bg-slate-800 rounded-xl border border-slate-700 hover:bg-slate-750 transition-colors text-left"
        >
          <h3 className="text-lg font-semibold text-white mb-2">Analytics</h3>
          <p className="text-slate-400 text-sm">View your sleep consistency, study hours, and health metrics.</p>
        </button>
      </div>
    </div>
  );
}
