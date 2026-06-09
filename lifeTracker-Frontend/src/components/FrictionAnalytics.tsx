import React, { useMemo } from 'react';
import { AppData } from '../data/types';
import { FRICTION_PATTERNS, countPatternInLastNDays, getFrictionLog } from '../lib/friction';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays, parse } from 'date-fns';

export default function FrictionAnalytics({ appData }: { appData: AppData }) {
  const last30Counts = useMemo(() => {
    return FRICTION_PATTERNS.map(p => ({ id: p.id, label: p.label, count: countPatternInLastNDays(appData, p.id, 30) }));
  }, [appData]);

  const tagSummary = useMemo(() => {
    const map: Record<string, number> = {};
    for (const p of FRICTION_PATTERNS) map[p.tag] = 0;
    for (const p of FRICTION_PATTERNS) {
      const c = countPatternInLastNDays(appData, p.id, 30);
      map[p.tag] = (map[p.tag] || 0) + c;
    }
    return Object.keys(map).map(k => ({ tag: k, count: map[k] }));
  }, [appData]);

  const phoneInBedStats = useMemo(() => {
    const today = new Date();
    const days = [] as string[];
    for (let i = 0; i < 30; i++) days.push(format(subDays(today, i), 'yyyy-MM-dd'));

    let fired = 0;
    let deltas: number[] = [];
    for (const d of days) {
      const f = getFrictionLog(appData, d);
      if (f && f.phone_in_bed) {
        fired++;
        const day = appData.daily_logs?.[d];
        // if wake_time and any sleep_log end_time exist, compute delta
        try {
          const planned = day?.wake_time; // HH:mm
          const end = day?.sleep_logs && day.sleep_logs.length ? day.sleep_logs[0].end_time : undefined;
          if (planned && end) {
            const p = parse(planned, 'HH:mm', new Date());
            const e = parse(end, 'HH:mm', new Date());
            const diff = (p.getTime() - e.getTime()) / 60000; // minutes
            deltas.push(diff);
          }
        } catch { /* ignore */ }
      }
    }
    const avgDelay = deltas.length ? Math.round(deltas.reduce((a,b) => a+b,0) / deltas.length) : 0;
    return { fired, avgDelay };
  }, [appData]);

  return (
    <div className="p-8 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-black text-white">Friction Analytics</h3>
        <span className="text-xs font-black text-slate-500 uppercase bg-slate-900 px-3 py-1 rounded-full border border-slate-700">Last 30 days</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-4 bg-slate-900/40 rounded-xl">
          <div className="text-sm text-slate-400">Reels frequency</div>
          <div className="text-2xl font-black text-amber-400">{countPatternInLastNDays(appData, 'reels', 30)} / 30</div>
        </div>
        <div className="p-4 bg-slate-900/40 rounded-xl">
          <div className="text-sm text-slate-400">Phone in bed</div>
          <div className="text-2xl font-black text-blue-400">{phoneInBedStats.fired} / 30</div>
          <div className="text-xs text-slate-400">corr. {phoneInBedStats.avgDelay} min avg wake delay</div>
        </div>
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={last30Counts} layout="vertical" margin={{ top: 5, right: 10, left: 60, bottom: 5 }}>
            <XAxis type="number" />
            <YAxis dataKey="label" type="category" width={160} />
            <Tooltip />
            <Bar dataKey="count" fill="#ef4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6">
        <div className="text-xs text-slate-400 mb-2">Tag summary</div>
        <div className="flex gap-3">
          {tagSummary.map(t => (
            <div key={t.tag} className="flex-1 p-3 bg-slate-900/40 rounded-lg">
              <div className="text-sm text-slate-400 uppercase">{t.tag}</div>
              <div className="text-lg font-black text-white">{t.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
