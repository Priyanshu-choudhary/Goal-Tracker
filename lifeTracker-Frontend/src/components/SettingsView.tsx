import React from 'react';
import { AppData } from '../data/types';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
}

export function SettingsView({ appData, updateAppData }: Props) {
  const handleColorChange = (color: 'blue' | 'green' | 'purple') => {
    updateAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, accentColor: color }
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>
      
      <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Appearance</h3>
        
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-2">Accent Color</label>
          <div className="flex gap-4">
            <button 
              onClick={() => handleColorChange('blue')}
              className={`w-10 h-10 rounded-full bg-blue-600 ${appData.settings.accentColor === 'blue' ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''}`}
            />
            <button 
              onClick={() => handleColorChange('green')}
              className={`w-10 h-10 rounded-full bg-green-600 ${appData.settings.accentColor === 'green' ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''}`}
            />
            <button 
              onClick={() => handleColorChange('purple')}
              className={`w-10 h-10 rounded-full bg-purple-600 ${appData.settings.accentColor === 'purple' ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-800' : ''}`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
