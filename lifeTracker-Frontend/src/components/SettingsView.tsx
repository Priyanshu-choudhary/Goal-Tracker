import React, { useState } from 'react';
import { AppData } from '../data/types';
import { CloudUpload, CloudDownload, RefreshCw, CheckCircle, AlertCircle, Users, Trophy } from 'lucide-react';
import { mergeWithDefault } from '../data/store';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
}

interface FriendResult {
  username: string;
  solved_today: number;
  error?: string;
}

interface FriendsData {
  friends: FriendResult[];
  reset_time: string;
  fetched_at: string;
}

const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081';

export function SettingsView({ appData, updateAppData }: Props) {
  const [syncStatus, setSyncStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error'; message: string }>({
    type: 'idle',
    message: '',
  });

  const [friendsData, setFriendsData] = useState<FriendsData | null>(null);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState('');

  const handleColorChange = (color: 'blue' | 'green' | 'purple') => {
    updateAppData(prev => ({ ...prev, settings: { ...prev.settings, accentColor: color } }));
  };

  const handlePush = async () => {
    setSyncStatus({ type: 'loading', message: 'Pushing data to cloud...' });
    try {
      const response = await fetch(`${API}/api/raw-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      const response = await fetch(`${API}/api/raw-log`);
      if (!response.ok) throw new Error('Failed to pull data');
      const rawData = await response.json();
      const hydratedData = mergeWithDefault(rawData[0]);
      updateAppData(hydratedData);
      setSyncStatus({ type: 'success', message: 'Data pulled and updated successfully!' });
      setTimeout(() => setSyncStatus({ type: 'idle', message: '' }), 3000);
    } catch (error) {
      setSyncStatus({ type: 'error', message: 'Error pulling data: ' + (error as Error).message });
    }
  };

  const fetchFriends = async () => {
    setFriendsLoading(true);
    setFriendsError('');
    try {
      const res = await fetch(`${API}/api/leetcode/friends`);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data: FriendsData = await res.json();
      setFriendsData(data);
    } catch (e) {
      setFriendsError('Failed to fetch: ' + (e as Error).message);
    } finally {
      setFriendsLoading(false);
    }
  };

  const topSolver = friendsData?.friends.reduce((best, f) =>
    !f.error && f.solved_today > (best?.solved_today ?? -1) ? f : best,
    null as FriendResult | null
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      {/* Appearance */}
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

      {/* Friend Tracker */}
      <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-semibold text-white">Friend Tracker</h3>
          </div>
          <button
            onClick={fetchFriends}
            disabled={friendsLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg text-sm text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${friendsLoading ? 'animate-spin' : ''}`} />
            {friendsLoading ? 'Fetching…' : 'Refresh'}
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-4">
          LeetCode problems solved today (resets 5:30 AM IST)
        </p>

        {friendsError && (
          <div className="flex items-center gap-2 text-red-400 text-sm mb-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {friendsError}
          </div>
        )}

        {!friendsData && !friendsLoading && !friendsError && (
          <p className="text-slate-500 text-sm">Hit Refresh to check today's progress.</p>
        )}

        {friendsData && (
          <div>
            <p className="text-xs text-slate-500 mb-3">
              Since {friendsData.reset_time} · fetched {friendsData.fetched_at}
            </p>
            <div className="space-y-2">
              {friendsData.friends.map(f => {
                const isTop = topSolver?.username === f.username && f.solved_today > 0;
                return (
                  <div
                    key={f.username}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                      isTop
                        ? 'bg-yellow-900/20 border-yellow-700/40'
                        : 'bg-slate-700/40 border-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isTop && <Trophy className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
                      <span className="text-sm font-medium text-slate-200">{f.username}</span>
                    </div>
                    {f.error ? (
                      <span className="text-xs text-red-400">unavailable</span>
                    ) : (
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          f.solved_today > 0 ? 'text-green-400' : 'text-slate-500'
                        }`}
                      >
                        {f.solved_today} solved
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Cloud Sync */}
      <div className="p-6 bg-slate-800 rounded-xl border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Cloud Sync</h3>
        <p className="text-sm text-slate-400 mb-6">Manually sync your local data with the remote database.</p>

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
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-3 text-sm ${
              syncStatus.type === 'loading'
                ? 'bg-blue-900/30 text-blue-300 border border-blue-800/50'
                : syncStatus.type === 'success'
                ? 'bg-green-900/30 text-green-300 border border-green-800/50'
                : 'bg-red-900/30 text-red-300 border border-red-800/50'
            }`}
          >
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
