import React from 'react';
import { Home, CalendarDays, BarChart2, Target, Settings, Activity, CheckSquare, IndianRupee } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserSettings } from '../data/types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: UserSettings;
}

export function Sidebar({ activeTab, setActiveTab, settings }: SidebarProps) {
  const items = [
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'daily-log', label: 'Daily Log', icon: CalendarDays },
    { id: 'todo', label: 'TODO', icon: CheckSquare },
    { id: 'finance', label: 'Finance', icon: IndianRupee },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];


  const getAccentColor = () => {
    switch (settings.accentColor) {
      case 'green': return 'bg-green-600 shadow-green-600/20';
      case 'purple': return 'bg-purple-600 shadow-purple-600/20';
      case 'blue':
      default: return 'bg-blue-600 shadow-blue-600/20';
    }
  };

  const getIconColor = () => {
    switch (settings.accentColor) {
      case 'green': return 'bg-green-600';
      case 'purple': return 'bg-purple-600';
      case 'blue':
      default: return 'bg-blue-600';
    }
  };

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0f172a] hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getIconColor())}>
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">LifeTracker</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {items.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                isActive 
                  ? cn("text-white shadow-lg", getAccentColor()) 
                  : "text-slate-500 hover:bg-slate-800 hover:text-slate-300"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
