import React, { useEffect, useMemo, useState } from 'react';
import { AppData } from '../data/types';
import { FRICTION_PATTERNS, getPatternLast7, getPatternStreak, saveFrictionLog } from '../lib/friction';
import { format, parseISO } from 'date-fns';
import { AlertTriangle, Flag } from 'lucide-react';

type Props = {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
  selectedDate: string;
};

function tagColor(tag?: string) {
  switch (tag) {
    case 'fear': return 'bg-red-500/10 text-red-400 border border-red-500/20';
    case 'avoidance': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    case 'time_waste': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
    case 'sleep_drift': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
    default: return 'bg-slate-700 text-slate-300 border border-slate-700/30';
  }
}

export default function FrictionLog({ appData, updateAppData, selectedDate }: Props) {
  const existing = appData.daily_logs?.[selectedDate]?.friction;

  const [selectedPatterns, setSelectedPatterns] = useState<Set<string>>(new Set(existing?.patterns_fired || []));
  const [triggerNote, setTriggerNote] = useState(existing?.trigger_note || '');
  const [phoneInBed, setPhoneInBed] = useState(existing?.phone_in_bed || false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelectedPatterns(new Set(existing?.patterns_fired || []));
    setTriggerNote(existing?.trigger_note || '');
    setPhoneInBed(existing?.phone_in_bed || false);
  }, [selectedDate, existing]);

  const grouped = useMemo(() => {
    const map: Record<string, typeof FRICTION_PATTERNS> = {} as any;
    for (const p of FRICTION_PATTERNS) {
      if (!map[p.category]) map[p.category] = [] as any;
      map[p.category].push(p);
    }
    return map;
  }, []);

  const togglePattern = (id: string) => {
    setSelectedPatterns(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      // keep phoneInBed sync if id === 'phone_in_bed'
      if (id === 'phone_in_bed') setPhoneInBed(next.has('phone_in_bed'));
      return next;
    });
  };

  const handleSave = () => {
    const patterns = Array.from(selectedPatterns);
    const tags = Array.from(new Set(patterns.map(pid => FRICTION_PATTERNS.find(p => p.id === pid)?.tag).filter(Boolean)));
    saveFrictionLog(updateAppData as any, selectedDate, {
      patterns_fired: patterns,
      phone_in_bed: phoneInBed,
      trigger_note: triggerNote,
      tags_fired: tags,
      logged_at: format(new Date(), 'HH:mm')
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1400);
  };

  return (
    <div className="p-5 border-t border-slate-700/50 bg-slate-800/50 space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-red-600/10 text-red-400 rounded-lg"><AlertTriangle className="w-5 h-5" /></div>
        <div>
          <h3 className="text-lg font-bold text-white">Friction Log</h3>
          <p className="text-sm text-slate-400">Tap what fired today — even partially</p>
        </div>
      </div>

      {/* pattern groups */}
      <div className="space-y-3">
        {Object.keys(grouped).map(cat => (
          <div key={cat}>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{cat.replace('_', ' ')}</div>
            <div className="space-y-2">
              {grouped[cat].map(p => {
                const last7 = getPatternLast7(appData, p.id);
                const streak = getPatternStreak(appData, p.id);
                const last7Fired = last7 as (boolean|null)[];
                return (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/20 border border-slate-700/40">
                    <button onClick={() => togglePattern(p.id)} className={`w-5 h-5 rounded-full flex items-center justify-center ${selectedPatterns.has(p.id) ? 'bg-red-500' : 'bg-transparent border border-slate-700'}`}>
                      {selectedPatterns.has(p.id) ? <Flag className="w-3 h-3 text-white" /> : null}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-white">{p.label}</div>
                        <div className={`text-[10px] px-2 py-0.5 rounded-full ${tagColor(p.tag)}`}>{p.tag}</div>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          {last7Fired.map((v, i) => (
                            <span key={i} className={`w-2.5 h-2.5 rounded-full ${v === null ? 'bg-slate-700/30' : v ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          ))}
                        </div>
                        <div className="text-xs text-slate-400">
                          {streak >= 7 ? `${streak}-day streak ⚠` : `${last7Fired.filter(x => x === true).length} of last 7 days`}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Trigger Note (optional)</label>
        <textarea value={triggerNote} onChange={e => setTriggerNote(e.target.value)} placeholder="Optional: what triggered it today?" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-sm text-slate-200 outline-none min-h-[80px] resize-y" />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" checked={phoneInBed} onChange={e => { setPhoneInBed(e.target.checked); if (e.target.checked) setSelectedPatterns(s => new Set(s).add('phone_in_bed')); else setSelectedPatterns(s => { const n = new Set(s); n.delete('phone_in_bed'); return n; }); }} />
            <span className="text-xs">Phone in bed</span>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all">{saved ? 'Saved' : 'Save to log'}</button>
        </div>
      </div>
    </div>
  );
}
