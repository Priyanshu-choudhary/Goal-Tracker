import React, { useState } from 'react';
import { AppData, HealthLog, ExerciseLog, WaterLog } from '../../data/types';
import { HeartPulse, Plus, Trash2, Dumbbell, Droplets, Smile, Monitor, Zap, Info, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
  selectedDate: string;
}

const COMMON_EXERCISES = [
  "Pushups", "Squats", "Plank", "Running", "Walking", "Yoga", "Deadlift", "Bench Press", "Pullups", "Cycling"
];

export function HealthModule({ appData, updateAppData, selectedDate }: Props) {
  const log: HealthLog = appData.health_logs[selectedDate] || { date: selectedDate };
  const waterLogs = log.water_logs || [];
  const exerciseLogs = log.exercise_logs || [];

  const [waterAmount, setWaterAmount] = useState(250);
  const [exerciseName, setExerciseName] = useState(COMMON_EXERCISES[0]);
  const [exerciseReps, setExerciseReps] = useState('');
  const [exerciseWeight, setExerciseWeight] = useState('');
  const [exerciseNotes, setExerciseNotes] = useState('');

  const handleUpdate = (updates: Partial<HealthLog>) => {
    updateAppData(prev => ({
      ...prev,
      health_logs: {
        ...prev.health_logs,
        [selectedDate]: { ...log, ...updates, date: selectedDate }
      }
    }));
  };

  const addWater = () => {
    const newLog: WaterLog = {
      id: Math.random().toString(36).substr(2, 9),
      amount_ml: waterAmount,
      time: format(new Date(), 'HH:mm')
    };
    handleUpdate({ 
      water_logs: [...waterLogs, newLog],
      water_intake: (log.water_intake || 0) + waterAmount
    });
  };

  const removeWater = (id: string) => {
    const item = waterLogs.find(w => w.id === id);
    if (!item) return;
    handleUpdate({ 
      water_logs: waterLogs.filter(w => w.id !== id),
      water_intake: Math.max(0, (log.water_intake || 0) - item.amount_ml)
    });
  };

  const addExercise = () => {
    const newLog: ExerciseLog = {
      id: Math.random().toString(36).substr(2, 9),
      name: exerciseName,
      reps: exerciseReps,
      weight: exerciseWeight,
      notes: exerciseNotes
    };
    handleUpdate({ exercise_logs: [...exerciseLogs, newLog], did_exercise: true });
    setExerciseReps('');
    setExerciseWeight('');
    setExerciseNotes('');
  };

  const removeExercise = (id: string) => {
    const newLogs = exerciseLogs.filter(e => e.id !== id);
    handleUpdate({ exercise_logs: newLogs, did_exercise: newLogs.length > 0 });
  };

  const toggleDidExercise = (val: boolean) => {
    handleUpdate({ did_exercise: val });
  };

  const renderScoreButtons = (field: keyof HealthLog, colorClass: string) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map(score => (
        <button
          key={score}
          onClick={() => handleUpdate({ [field]: score } as any)}
          className={`flex-1 py-1 rounded-md text-xs font-bold border transition-all ${log[field] === score ? `${colorClass} text-white shadow-lg` : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white'}`}
        >
          {score}
        </button>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Exercise Section */}
      <div className="space-y-4 p-5 bg-slate-900/30 border border-slate-700/50 rounded-xl lg:col-span-2">
        <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white flex items-center gap-2">
                <div className="p-1.5 bg-red-500/10 text-red-400 rounded-lg"><Dumbbell className="w-5 h-5" /></div>
                Exercise & Workouts
            </h4>
            <div className="flex gap-1 p-1 bg-slate-900 rounded-xl border border-slate-700">
                <button onClick={() => toggleDidExercise(true)} className={`px-4 py-1.5 text-[10px] font-black rounded-lg uppercase transition-all ${log.did_exercise === true ? 'bg-green-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Yes</button>
                <button onClick={() => toggleDidExercise(false)} className={`px-4 py-1.5 text-[10px] font-black rounded-lg uppercase transition-all ${log.did_exercise === false ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>No</button>
            </div>
        </div>
        
        {log.did_exercise === false ? (
            <div className="flex flex-col items-center justify-center py-12 bg-slate-800/20 border border-dashed border-red-500/20 rounded-2xl">
                <XCircle className="w-10 h-10 text-red-500/20 mb-2" />
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Did not do exercise today</p>
            </div>
        ) : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
                    <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tighter">Exercise Name</label>
                        <select value={exerciseName} onChange={e => setExerciseName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500 text-sm">
                        {COMMON_EXERCISES.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                        <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tighter">Reps / Sets</label>
                        <input type="text" value={exerciseReps} onChange={e => setExerciseReps(e.target.value)} placeholder="3x12" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tighter">Weight (kg)</label>
                        <input type="text" value={exerciseWeight} onChange={e => setExerciseWeight(e.target.value)} placeholder="50kg" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500 text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tighter">Notes</label>
                        <input type="text" value={exerciseNotes} onChange={e => setExerciseNotes(e.target.value)} placeholder="Feel great today" className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-red-500 text-sm" />
                    </div>
                    <button onClick={addExercise} className="h-[42px] mt-auto bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                        <Plus className="w-4 h-4" /> Add Set
                    </button>
                </div>

                <div className="space-y-2 mt-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {exerciseLogs.map(ex => (
                    <div key={ex.id} className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between group hover:border-red-500/50 transition-all">
                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center font-bold text-xs uppercase">{ex.name.charAt(0)}</div>
                        <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                            {ex.name} 
                            {ex.weight && <span className="text-[10px] bg-slate-700 px-1.5 py-0.5 rounded text-slate-300 font-bold uppercase">{ex.weight}</span>}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 font-medium">{ex.reps} • {ex.notes || 'No notes'}</div>
                        </div>
                    </div>
                    <button onClick={() => removeExercise(ex.id)} className="p-2 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
                ))}
                {exerciseLogs.length === 0 && (
                    <div className="text-center py-6 text-slate-500 text-sm font-medium border border-dashed border-slate-700 rounded-xl">No specific exercises logged for this date.</div>
                )}
                </div>
            </>
        )}
      </div>

      {/* Water Intake Section */}
      <div className="space-y-4 p-5 bg-slate-900/30 border border-slate-700/50 rounded-xl">
        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
          <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg"><Droplets className="w-5 h-5" /></div>
          Water Intake
        </h4>
        <div className="flex gap-4 items-end bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
          <div className="flex-1">
            <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tighter">Glass Size (ml)</label>
            <input type="number" value={waterAmount} onChange={e => setWaterAmount(parseInt(e.target.value) || 0)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500 text-sm font-bold" />
          </div>
          <button onClick={addWater} className="h-[42px] w-[100px] bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Total Hydration</div>
            <div className="text-2xl font-black text-white">{log.water_intake || 0} <span className="text-xs font-bold text-blue-300">ml</span></div>
          </div>
          <div className="text-right">
             <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Glasses</div>
             <div className="text-lg font-black text-white">{waterLogs.length}</div>
          </div>
        </div>

        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar mt-2">
          {waterLogs.map(w => (
            <div key={w.id} className="text-xs flex items-center justify-between p-2 bg-slate-800/30 border border-slate-700/50 rounded-lg group">
              <span className="font-bold text-slate-300">{w.amount_ml}ml <span className="text-slate-500 font-medium ml-2">@{w.time}</span></span>
              <button onClick={() => removeWater(w.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all p-1">✕</button>
            </div>
          ))}
        </div>
      </div>

      {/* Energy & Wellness */}
      <div className="space-y-4 p-5 bg-slate-900/30 border border-slate-700/50 rounded-xl">
        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
          <div className="p-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg"><Zap className="w-5 h-5" /></div>
          Energy & Wellness
        </h4>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">Weight (kg)</label>
              <input type="number" value={log.weight || ''} onChange={e => handleUpdate({ weight: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white outline-none focus:border-yellow-500 text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase tracking-tighter">Screen Time (h)</label>
              <input type="number" value={log.screen_time || ''} onChange={e => handleUpdate({ screen_time: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white outline-none focus:border-teal-500 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase flex items-center gap-1"><Smile className="w-3 h-3" /> Mood Score (1-5)</label>
            {renderScoreButtons('mood_score', 'bg-pink-600 border-pink-500')}
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Afternoon Energy</label>
              {renderScoreButtons('energy_afternoon', 'bg-yellow-600 border-yellow-500')}
            </div>
            <div className="flex-1">
              <label className="block text-[10px] font-black text-slate-500 mb-1 uppercase">Evening Energy</label>
              {renderScoreButtons('energy_evening', 'bg-orange-600 border-orange-500')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
