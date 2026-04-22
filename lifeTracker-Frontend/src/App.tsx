import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { AppData } from './data/types';
import { loadData, saveData } from './data/store';
import { format } from 'date-fns';

import { DailyLogView } from './components/DailyLogView';
import { Analytics } from './components/Analytics';
import { GoalsView } from './components/GoalsView';
import { Todo } from './components/Todo';
import { FinanceView } from './components/FinanceView';

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [appData, setAppData] = useState<AppData>(loadData());

  useEffect(() => {
    saveData(appData);
  }, [appData]);

  const updateAppData = (updates: Partial<AppData> | ((prev: AppData) => AppData)) => {
    setAppData(prev => {
      if (typeof updates === 'function') {
        return updates(prev);
      }
      return { ...prev, ...updates };
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'todo':
        return <Todo appData={appData} updateAppData={updateAppData} />;
      case 'daily-log':
        return <DailyLogView appData={appData} updateAppData={updateAppData} />;
      case 'goals':
        return <GoalsView appData={appData} updateAppData={updateAppData} />;
      case 'analytics':
        return <Analytics appData={appData} updateAppData={updateAppData} />;
      case 'finance':
        return <FinanceView appData={appData} updateAppData={updateAppData} />;
      default:
        return <Analytics appData={appData} updateAppData={updateAppData} />;
    }
  };


  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const hasLoggedToday = !!appData.daily_logs[todayStr] || 
    appData.day_sections.some(s => s.date === todayStr) || 
    appData.study_sessions.some(s => s.date === todayStr);

  const getAccentBgColor = () => {
    switch (appData.settings.accentColor) {
      case 'green': return 'bg-green-600/5';
      case 'purple': return 'bg-purple-600/5';
      case 'blue':
      default: return 'bg-blue-600/5';
    }
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} settings={appData.settings} />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none ${getAccentBgColor()}`} />
        
        <div className="max-w-7xl mx-auto pb-24 relative z-10">
          {!hasLoggedToday && activeTab === 'home' && (
            <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-xl text-slate-300 flex items-center justify-between shadow-lg">
              <span>You haven't logged anything today yet!</span>
              <button 
                onClick={() => setActiveTab('daily-log')}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
              >
                Log Now
              </button>
            </div>
          )}
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
