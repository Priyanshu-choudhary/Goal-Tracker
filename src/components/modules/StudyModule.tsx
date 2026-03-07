import React, { useState, useMemo } from 'react';
import { AppData, StudySession, Skill } from '../../data/types';
import { differenceInMinutes, parse } from 'date-fns';
import { BookOpen, Plus, Trash2, Edit2, Check, X, Clock, Target, Star } from 'lucide-react';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
  selectedDate: string;
}

export function StudyModule({ appData, updateAppData, selectedDate }: Props) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [skillId, setSkillId] = useState(appData.skills[0]?.id || '');
  const [notes, setNotes] = useState('');
  const [resource, setResource] = useState('LeetCode');
  const [qualityScore, setQualityScore] = useState<number>(3);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customSkillName, setCustomSkillName] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StudySession | null>(null);

  const durationMinutes = useMemo(() => {
    try {
      const start = parse(startTime, 'HH:mm', new Date());
      const end = parse(endTime, 'HH:mm', new Date());
      let diff = differenceInMinutes(end, start);
      if (diff < 0) diff += 24 * 60;
      return diff;
    } catch {
      return 0;
    }
  }, [startTime, endTime]);

  const handleAddSession = () => {
    let finalSkillId = skillId;
    if (isAddingCustom && customSkillName.trim()) {
      const newSkill: Skill = {
        id: Math.random().toString(36).substr(2, 9),
        name: customSkillName.trim(),
        is_custom: true
      };
      updateAppData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
      finalSkillId = newSkill.id;
      setSkillId(newSkill.id);
      setIsAddingCustom(false);
      setCustomSkillName('');
    }

    const newSession: StudySession = {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      start_time: startTime,
      end_time: endTime,
      duration_minutes: durationMinutes,
      skill_id: finalSkillId || appData.skills[0]?.id,
      notes,
      resource,
      quality_score: qualityScore
    };

    updateAppData(prev => ({
      ...prev,
      study_sessions: [...prev.study_sessions, newSession]
    }));

    setNotes('');
  };

  const deleteSession = (id: string) => {
    updateAppData(prev => ({
      ...prev,
      study_sessions: prev.study_sessions.filter(s => s.id !== id)
    }));
  };

  const startEdit = (session: StudySession) => {
    setEditingId(session.id);
    setEditForm({ ...session });
  };

  const saveEdit = () => {
    if (!editForm) return;
    
    // Recalculate duration if times changed
    try {
      const start = parse(editForm.start_time, 'HH:mm', new Date());
      const end = parse(editForm.end_time, 'HH:mm', new Date());
      let diff = differenceInMinutes(end, start);
      if (diff < 0) diff += 24 * 60;
      editForm.duration_minutes = diff;
    } catch {}

    updateAppData(prev => ({
      ...prev,
      study_sessions: prev.study_sessions.map(s => s.id === editForm.id ? editForm : s)
    }));
    setEditingId(null);
    setEditForm(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const todaysSessions = appData.study_sessions.filter(s => s.date === selectedDate);
  const getSkillName = (id: string) => appData.skills.find(s => s.id === id)?.name || 'Unknown';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/40 p-5 rounded-xl border border-slate-700/50">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Start</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> End</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 transition-colors" />
            </div>
            <div className="w-24">
              <label className="block text-xs font-medium text-slate-400 mb-1">Duration</label>
              <div className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-blue-300 text-center font-bold text-sm">{Math.floor(durationMinutes / 60)}h {durationMinutes % 60}m</div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Target className="w-3 h-3" /> Topic</label>
            {!isAddingCustom ? (
              <div className="flex gap-2">
                <select value={skillId} onChange={e => setSkillId(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500">
                  {appData.skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button onClick={() => setIsAddingCustom(true)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs text-white font-medium transition-colors">+ New</button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input autoFocus placeholder="New Skill Name" value={customSkillName} onChange={e => setCustomSkillName(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" />
                <button onClick={() => setIsAddingCustom(false)} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-xs text-white font-medium transition-colors">Cancel</button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Resource Used</label>
            <select value={resource} onChange={e => setResource(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500">
              {['LeetCode', 'YouTube', 'Book', 'Course', 'Docs', 'Personal Project', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-4 flex flex-col justify-between">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">What exactly was done?</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white resize-none outline-none focus:border-blue-500 transition-colors" placeholder="e.g., Solved 2 DP problems..." />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Star className="w-3 h-3" /> Quality Score (1-5)</label>
            <div className="flex gap-2 h-[42px]">
              {[1, 2, 3, 4, 5].map(score => (
                <button
                  key={score}
                  onClick={() => setQualityScore(score)}
                  className={`flex-1 rounded-lg text-sm font-bold border transition-all ${qualityScore === score ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                >
                  {score}
                </button>
              ))}
            </div>
          </div>
          
          <button onClick={handleAddSession} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 mt-auto">
            <Plus className="w-4 h-4" /> Log Session
          </button>
        </div>
      </div>

      {todaysSessions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Today's Sessions</span>
            <span className="text-xs font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
              {Math.floor(todaysSessions.reduce((acc, s) => acc + s.duration_minutes, 0) / 60)}h {todaysSessions.reduce((acc, s) => acc + s.duration_minutes, 0) % 60}m Total
            </span>
          </div>
          <div className="space-y-3">
            {todaysSessions.map(session => (
              <div key={session.id} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between group hover:border-blue-500/50 transition-all">
                {editingId === session.id && editForm ? (
                  <div className="flex-1 space-y-3 pr-4">
                    <div className="grid grid-cols-2 gap-2">
                      <input type="time" value={editForm.start_time} onChange={e => setEditForm({...editForm, start_time: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white" />
                      <input type="time" value={editForm.end_time} onChange={e => setEditForm({...editForm, end_time: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white" />
                    </div>
                    <div className="flex gap-2">
                      <select value={editForm.skill_id} onChange={e => setEditForm({...editForm, skill_id: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                        {appData.skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                      <select value={editForm.resource} onChange={e => setEditForm({...editForm, resource: e.target.value})} className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white">
                        {['LeetCode', 'YouTube', 'Book', 'Course', 'Docs', 'Personal Project', 'Other'].map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                    <input type="text" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm text-white" />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold text-white flex items-center gap-1"><Check className="w-3 h-3" /> Save</button>
                      <button onClick={cancelEdit} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-slate-300 flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{getSkillName(session.skill_id)}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-[10px] font-bold text-slate-300 uppercase">{session.resource}</span>
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">{session.start_time} - {session.end_time}</span>
                      </div>
                      <div className="text-sm text-slate-400 mt-2 font-medium line-clamp-1">{session.notes}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-black text-white">{Math.floor(session.duration_minutes / 60)}h {session.duration_minutes % 60}m</div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Quality: {session.quality_score}/5</div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => startEdit(session)} className="p-2 text-slate-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-700/50">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => deleteSession(session.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700/50">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
