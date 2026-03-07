import React, { useState } from 'react';
import { AppData, FoodLog, MealType } from '../../data/types';
import { Utensils, Plus, Trash2, Edit2, Check, X, Clock, Flame } from 'lucide-react';

interface Props {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
  selectedDate: string;
}

export function FoodModule({ appData, updateAppData, selectedDate }: Props) {
  const [time, setTime] = useState('12:00');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState<string>('');
  const [mealType, setMealType] = useState<MealType>('lunch');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FoodLog | null>(null);

  const todaysMeals = appData.food_logs.filter(f => f.date === selectedDate);

  const handleAddMeal = () => {
    if (!description.trim()) return;
    const newMeal: FoodLog = {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate,
      time,
      meal_type: mealType,
      description,
      calories: calories ? parseInt(calories) : undefined
    };
    updateAppData(prev => ({
      ...prev,
      food_logs: [...prev.food_logs, newMeal]
    }));
    setDescription('');
    setCalories('');
  };

  const deleteMeal = (id: string) => {
    updateAppData(prev => ({
      ...prev,
      food_logs: prev.food_logs.filter(f => f.id !== id)
    }));
  };

  const startEdit = (meal: FoodLog) => {
    setEditingId(meal.id);
    setEditForm({ ...meal });
  };

  const saveEdit = () => {
    if (!editForm || !editForm.description.trim()) return;
    updateAppData(prev => ({
      ...prev,
      food_logs: prev.food_logs.map(f => f.id === editForm.id ? editForm : f)
    }));
    setEditingId(null);
    setEditForm(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const totalCals = todaysMeals.reduce((sum, m) => sum + (m.calories || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-4 items-end bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} className="w-full lg:w-32 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-green-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Utensils className="w-3 h-3" /> Meal Type</label>
          <select value={mealType} onChange={e => setMealType(e.target.value as MealType)} className="w-full lg:w-40 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-green-500">
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
        </div>
        <div className="flex-1 w-full">
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">What did you eat?</label>
          <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Chicken salad, apple..." className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-green-500" />
        </div>
        <div className="w-full lg:w-24">
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Flame className="w-3 h-3" /> kcal</label>
          <div className="flex gap-2">
            <input type="number" value={calories} onChange={e => setCalories(e.target.value)} placeholder="0" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none focus:border-green-500" />
            <button onClick={handleAddMeal} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-green-600/20 lg:hidden">
              Add
            </button>
          </div>
        </div>
        <button onClick={handleAddMeal} className="hidden lg:flex px-6 py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg transition-all items-center gap-2 shadow-lg shadow-green-600/20">
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {todaysMeals.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2 text-sm">
            <div className="flex gap-4">
                <span className="text-slate-400 font-medium">Meals: <strong className="text-white bg-green-400/10 px-2 py-0.5 rounded-md">{todaysMeals.length}</strong></span>
                <span className="text-slate-400 font-medium">Energy: <strong className="text-white bg-orange-400/10 px-2 py-0.5 rounded-md">{totalCals} kcal</strong></span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {todaysMeals.sort((a, b) => a.time.localeCompare(b.time)).map(meal => (
              <div key={meal.id} className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl flex justify-between items-center group hover:border-green-500/50 transition-all">
                {editingId === meal.id && editForm ? (
                  <div className="flex-1 flex flex-col gap-2 pr-4">
                    <div className="flex gap-2">
                      <input type="time" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none" />
                      <input type="number" value={editForm.calories || ''} onChange={e => setEditForm({...editForm, calories: parseInt(e.target.value) || 0})} placeholder="kcal" className="w-20 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white outline-none" />
                    </div>
                    <input autoFocus type="text" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white outline-none" />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="px-3 py-1 bg-green-600 hover:bg-green-500 rounded text-xs font-bold text-white flex items-center gap-1"><Check className="w-3 h-3" /> Save</button>
                      <button onClick={cancelEdit} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs font-bold text-slate-300 flex items-center gap-1"><X className="w-3 h-3" /> Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-white capitalize flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          {meal.meal_type}
                        </span>
                        <span className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">{meal.time}</span>
                        {meal.calories && <span className="text-[10px] font-black text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded">{meal.calories} kcal</span>}
                      </div>
                      <div className="text-sm text-slate-300 mt-2 font-medium">{meal.description}</div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => startEdit(meal)} className="p-2 text-slate-500 hover:text-blue-400 transition-colors rounded-lg hover:bg-slate-700/50">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMeal(meal.id)} className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-700/50">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
