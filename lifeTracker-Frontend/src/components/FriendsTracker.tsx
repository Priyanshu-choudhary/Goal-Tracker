import React, { useState, useEffect } from 'react';
import { Users, RefreshCw, Trophy, Code2 } from 'lucide-react';

const API_URL =
  import.meta.env.VITE_LEETCODE_API_URL ||
  'https://leetcode-api-beige.vercel.app/api';

interface FriendsData {
  date_utc: string;
  solved_today: Record<string, number | string>;
}

export function FriendsTracker() {
  const [data, setData] = useState<FriendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: FriendsData = await res.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Sort by solved count descending; errors go to bottom
  const sorted = data
    ? Object.entries(data.solved_today).sort((a, b) => {
        const aVal = typeof a[1] === 'number' ? a[1] : -1;
        const bVal = typeof b[1] === 'number' ? b[1] : -1;
        return bVal - aVal;
      })
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Friends Tracker</h2>
            <p className="text-slate-400 text-sm">
              {data
                ? `LeetCode problems solved today · ${data.date_utc} (UTC)`
                : 'Loading today\'s stats…'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 text-sm font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800/50 rounded-xl text-red-400 text-sm">
          ⚠ {error}
        </div>
      )}

      {/* Skeleton */}
      {loading && !data && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Cards */}
      {sorted.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sorted.map(([username, count], index) => {
            const isError = typeof count === 'string';
            const solved = isError ? 0 : (count as number);
            const isLeader = index === 0 && solved > 0;

            return (
              <div
                key={username}
                className={`relative p-5 rounded-xl border transition-all duration-200 ${
                  isLeader
                    ? 'bg-yellow-900/10 border-yellow-700/40 shadow-lg shadow-yellow-900/10'
                    : solved > 0
                    ? 'bg-green-900/10 border-green-800/40'
                    : 'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                {/* Trophy for leader */}
                {isLeader && (
                  <Trophy className="absolute top-4 right-4 w-4 h-4 text-yellow-400" />
                )}

                {/* Avatar + Username */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold ${
                      solved > 0
                        ? 'bg-green-600/25 text-green-400'
                        : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-white font-medium text-sm truncate">{username}</span>
                </div>

                {/* Count */}
                <div className="flex items-end gap-2">
                  <span
                    className={`text-4xl font-bold leading-none ${
                      solved > 0 ? 'text-green-400' : 'text-slate-600'
                    }`}
                  >
                    {isError ? '—' : solved}
                  </span>
                  <span className="text-slate-400 text-sm mb-1">solved today</span>
                </div>

                {/* Streak dots (visual for solved count) */}
                {!isError && solved > 0 && (
                  <div className="flex gap-1 mt-3">
                    {[...Array(Math.min(solved, 10))].map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-green-500/60" />
                    ))}
                    {solved > 10 && (
                      <span className="text-green-500/60 text-xs ml-1">+{solved - 10}</span>
                    )}
                  </div>
                )}

                {/* Error text */}
                {isError && (
                  <p className="text-red-400 text-xs mt-2">{count as string}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Summary bar */}
      {data && sorted.length > 0 && (
        <div className="flex items-center gap-3 p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl">
          <Code2 className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-400 text-sm">
            Total solved today:{' '}
            <span className="text-white font-semibold">
              {sorted.reduce(
                (sum, [, v]) => sum + (typeof v === 'number' ? v : 0),
                0
              )}
            </span>{' '}
            problems across{' '}
            <span className="text-white font-semibold">
              {sorted.filter(([, v]) => typeof v === 'number' && v > 0).length}
            </span>{' '}
            friends
          </span>
        </div>
      )}

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-slate-600 text-xs text-right">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
