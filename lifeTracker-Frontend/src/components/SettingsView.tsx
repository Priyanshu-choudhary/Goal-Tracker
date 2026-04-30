import React, { useState } from 'react';
import { AppData } from '../data/types';
import { CloudUpload, CloudDownload, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { mergeWithDefault } from '../data/store';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
}

export function SettingsView({ appData, updateAppData }: Props) {
  const [syncStatus, setSyncStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message: string }>({
    type: 'idle',
    message: ''
  });

  const handleColorChange = (color: 'blue' | 'green' | 'purple') => {
    updateAppData(prev => ({
      ...prev,
      settings: { ...prev.settings, accentColor: color }
    }));
  };

  const handlePush = async () => {
    setSyncStatus({ type: 'loading', message: 'Pushing data to cloud...' });
    try {
      const response = await fetch('http://localhost:8081/api/raw-log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appData),
      });

      if (!response.ok) throw new Error('Failed to push data');
      
      setSyncStatus({ type: 'success', message: 'Data pushed successfully!' });
      setTimeout(() => setSyncStatus({ type: 'idle', message: '' }), 3000);
    } catch (error) {
      setSyncStatus({ type: 'error', message: 'Error pushing data: ' + (error as Error).message });
    }
  };

  const handlePull = async () => {
    setSyncStatus({ type: 'loading', message: 'Pulling data from cloud...' });
    try {
      const response = await fetch('http://localhost:8081/api/raw-log');
      if (!response.ok) throw new Error('Failed to pull data');
      
      const rawData = await response.json();
      console.log('Raw data from backend:', rawData);
      
      const hydratedData = mergeWithDefault(rawData[0]);
      console.log('Hydrated data for state:', [hydratedData]);
      
      // Update state with the fully hydrated data
      updateAppData(hydratedData);
      
      setSyncStatus({ type: 'success', message: 'Data pulled and updated successfully!' });
      setTimeout(() => setSyncStatus({ type: 'idle', message: '' }), 3000);
    } catch (error) {
      console.error('Sync Pull Error:', error);
      setSyncStatus({ type: 'error', message: 'Error pulling data: ' + (error as Error).message });
    }
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

      <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Cloud Sync</h3>
        <p className="text-sm text-slate-400 mb-6">
          Manually sync your local data with the remote database.
        </p>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={handlePush}
            disabled={syncStatus.type === 'loading'}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 rounded-lg text-white font-medium transition-colors"
          >
            <CloudUpload className="w-4 h-4" />
            Push to Cloud
          </button>
          
          <button 
            onClick={handlePull}
            disabled={syncStatus.type === 'loading'}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 rounded-lg text-white font-medium transition-colors"
          >
            <CloudDownload className="w-4 h-4" />
            Pull from Cloud
          </button>
        </div>

        {syncStatus.type !== 'idle' && (
          <div className={`mt-4 p-3 rounded-lg flex items-center gap-3 text-sm ${
            syncStatus.type === 'loading' ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50' :
            syncStatus.type === 'success' ? 'bg-green-900/30 text-green-300 border border-green-800/50' :
            'bg-red-900/30 text-red-300 border border-red-800/50'
          }`}>
            {syncStatus.type === 'loading' && <RefreshCw className="w-4 h-4 animate-spin" />}
            {syncStatus.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {syncStatus.type === 'error' && <AlertCircle className="w-4 h-4" />}
            {syncStatus.message}
          </div>
        )}
      </div>
    </div>
  );
}
