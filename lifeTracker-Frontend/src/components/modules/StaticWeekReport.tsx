import React from 'react';
import { Target, Clock, Zap, Target as TargetIcon, BrainCircuit, Activity, BarChart2, Dumbbell, Github, Search, CheckCircle2, TrendingUp, AlertTriangle, ChevronRight, Utensils } from 'lucide-react';

export function StaticWeekReport() {
  return (
    <div className="space-y-6 mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-white flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-indigo-500" />
          Week 1 Retrospective
        </h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Deep-Dive Analysis & Performance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: 7-Day Trend & Numbers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 7-DAY TREND TABLE */}
          <div className="p-6 bg-slate-800 border border-slate-700 rounded-[2rem] shadow-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">7-Day Trend</h3>
            </div>
            
            <div className="overflow-x-auto relative z-10 w-full">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700/50 text-[10px] uppercase tracking-widest text-slate-500 font-black">
                    <th className="py-4 px-4 bg-slate-800/50 sticky left-0 z-20">Metric</th>
                    <th className="py-4 px-2 text-center text-slate-400">D1</th>
                    <th className="py-4 px-2 text-center text-slate-400">D2</th>
                    <th className="py-4 px-2 text-center text-slate-400">D3</th>
                    <th className="py-4 px-2 text-center text-slate-400">D4</th>
                    <th className="py-4 px-2 text-center text-slate-400">D5</th>
                    <th className="py-4 px-2 text-center text-slate-400">D6</th>
                    <th className="py-4 px-2 text-center text-indigo-400">D7</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold text-slate-300">
                  <tr className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 px-4 text-blue-400 bg-slate-800/50 sticky left-0 z-20 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Study hrs
                    </td>
                    <td className="py-4 px-2 text-center text-white">5.8</td>
                    <td className="py-4 px-2 text-center text-red-400">5.2</td>
                    <td className="py-4 px-2 text-center text-green-400">8.0</td>
                    <td className="py-4 px-2 text-center text-white">5.9</td>
                    <td className="py-4 px-2 text-center text-green-500 font-black">9.0</td>
                    <td className="py-4 px-2 text-center text-green-400">8.3</td>
                    <td className="py-4 px-2 text-center text-white">7.5</td>
                  </tr>
                  <tr className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 px-4 text-purple-400 bg-slate-800/50 sticky left-0 z-20 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Sleep at
                    </td>
                    <td className="py-4 px-2 text-center text-red-500">4:30</td>
                    <td className="py-4 px-2 text-center text-green-400">1:10</td>
                    <td className="py-4 px-2 text-center text-yellow-400">2:20</td>
                    <td className="py-4 px-2 text-center text-green-400">1:38</td>
                    <td className="py-4 px-2 text-center text-red-400">3:00</td>
                    <td className="py-4 px-2 text-center text-red-400">3:00</td>
                    <td className="py-4 px-2 text-center text-yellow-400">2:45</td>
                  </tr>
                  <tr className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 px-4 text-emerald-400 bg-slate-800/50 sticky left-0 z-20 flex items-center gap-2">
                        <Search className="w-4 h-4" /> Job search
                    </td>
                    <td className="py-4 px-2 text-center text-yellow-400">50%</td>
                    <td className="py-4 px-2 text-center text-slate-500">0%</td>
                    <td className="py-4 px-2 text-center text-green-400">75%</td>
                    <td className="py-4 px-2 text-center text-slate-500">0%</td>
                    <td className="py-4 px-2 text-center text-slate-500">0%</td>
                    <td className="py-4 px-2 text-center text-slate-500">0%</td>
                    <td className="py-4 px-2 text-center text-emerald-500 font-black">100%</td>
                  </tr>
                  <tr className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 px-4 text-orange-400 bg-slate-800/50 sticky left-0 z-20 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> DSA
                    </td>
                    <td className="py-4 px-2 text-center text-white">4/5</td>
                    <td className="py-4 px-2 text-center text-white">4/5</td>
                    <td className="py-4 px-2 text-center text-green-400">5/5</td>
                    <td className="py-4 px-2 text-center text-green-400">5/5</td>
                    <td className="py-4 px-2 text-center text-green-400">5/5</td>
                    <td className="py-4 px-2 text-center text-green-400">5/5</td>
                    <td className="py-4 px-2 text-center text-slate-300">~4/5</td>
                  </tr>
                  <tr className="hover:bg-slate-700/20 transition-colors">
                    <td className="py-4 px-4 text-yellow-400 bg-slate-800/50 sticky left-0 z-20 flex items-center gap-2">
                        <Zap className="w-4 h-4" /> Score
                    </td>
                    <td className="py-4 px-2 text-center text-red-400">6.5</td>
                    <td className="py-4 px-2 text-center text-yellow-500">6.8</td>
                    <td className="py-4 px-2 text-center text-green-400 font-black">9.2</td>
                    <td className="py-4 px-2 text-center text-yellow-400">7.0</td>
                    <td className="py-4 px-2 text-center text-green-400">7.5</td>
                    <td className="py-4 px-2 text-center text-green-400">7.6</td>
                    <td className="py-4 px-2 text-center text-green-400">7.7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* WEEK 1 NUMBERS */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                <span className="text-2xl font-black text-blue-400">49.6<span className="text-sm">h</span></span>
                <span className="text-[10px] font-black uppercase text-slate-500 mt-1">Total Study</span>
            </div>
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                <span className="text-2xl font-black text-white">7.09<span className="text-sm">h</span></span>
                <span className="text-[10px] font-black uppercase text-slate-500 mt-1">Avg / Day</span>
            </div>
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                <span className="text-lg font-black text-yellow-500 mt-1">7.47<span className="text-xs text-slate-500">/10</span></span>
                <span className="text-[10px] font-black uppercase text-slate-500 mt-1">Avg Score</span>
            </div>
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                <span className="text-xl font-black text-emerald-400">7/7 <CheckCircle2 className="w-4 h-4 inline" /></span>
                <span className="text-[10px] font-black uppercase text-slate-500 mt-1">Interview Prep</span>
            </div>
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                <span className="text-xl font-black text-emerald-400">4/7</span>
                <span className="text-[10px] font-black uppercase text-slate-500 mt-1">DSA 5/5</span>
            </div>
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl flex flex-col justify-center items-center text-center shadow-lg hover:-translate-y-1 transition-transform">
                <span className="text-xl font-black text-red-400">3/7</span>
                <span className="text-[10px] font-black uppercase text-slate-500 mt-1">AI 5/5</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500">Avg Wake</span>
                <span className="text-sm font-bold text-white">~10:40 AM</span>
            </div>
            <div className="p-4 bg-slate-800/50 border border-red-900/30 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500">Avg Sleep</span>
                <span className="text-sm font-bold text-red-400">~2:20 AM</span>
            </div>
            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500">Exercise</span>
                <span className="text-sm font-bold text-white">6/7 Days</span>
            </div>
            <div className="p-4 bg-slate-800/50 border border-red-900/30 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-slate-500">Job Search</span>
                <span className="text-sm font-bold text-red-400">2/7 Days</span>
            </div>
          </div>

        </div>

        {/* Right Column: GOAL SCORECARD */}
        <div className="bg-slate-800 border border-slate-700 rounded-[2rem] shadow-xl p-6 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full rotate-12 -mr-10 -mt-10 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
           <div className="flex items-center gap-3 mb-6 relative z-10">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <TargetIcon className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Goal Scorecard</h3>
            </div>
            
            <div className="space-y-4 relative z-10">
              
              {/* DSA */}
              <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4 text-orange-400" />
                        <span className="text-sm font-black text-white uppercase">DSA</span>
                      </div>
                      <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-md uppercase tracking-wider border border-emerald-500/20">Strong ✓</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 leading-snug">Ahead of plan. Goal milestone pace is <strong className="text-emerald-400">6 days ahead 🔥</strong>.</p>
              </div>

               {/* Interview Prep */}
               <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-emerald-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" />
                        <span className="text-sm font-black text-white uppercase">Interview</span>
                      </div>
                      <span className="text-[10px] font-black bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md uppercase tracking-wider border border-blue-500/20">Perfect</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 leading-snug">Consistency maintained. <strong className="text-white">7/7 days ✓</strong></p>
              </div>

               {/* AI Study */}
               <div className="p-4 bg-slate-900/50 rounded-2xl border border-red-500/20 hover:border-red-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-black text-white uppercase">AI Study</span>
                      </div>
                      <span className="text-[10px] font-black bg-red-500/20 text-red-400 px-2 py-1 rounded-md uppercase tracking-wider border border-red-500/20">Weak</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 leading-snug flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-red-500" /> Needs fix. Only completed 3/7 days.</p>
              </div>

               {/* Job Search */}
               <div className="p-4 bg-slate-900/50 rounded-2xl border border-red-500/20 hover:border-red-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-black text-white uppercase">Job Search</span>
                      </div>
                      <span className="text-[10px] font-black bg-rose-500/20 text-rose-500 px-2 py-1 rounded-md uppercase tracking-wider border border-rose-500/20">Critical</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 leading-snug">Falling behind pace. Only <strong className="text-rose-400">2/7 days</strong> active.</p>
              </div>

               {/* Sleep */}
               <div className="p-4 bg-slate-900/50 rounded-2xl border border-rose-500/30 hover:border-rose-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-black text-white uppercase">Sleep Disp.</span>
                      </div>
                      <span className="text-[10px] font-black bg-rose-500/20 text-rose-500 px-2 py-1 rounded-md uppercase tracking-wider border border-rose-500/20">Broken</span>
                  </div>
                  <p className="text-xs font-bold text-slate-400 leading-snug">Average cycle is ruined. Sleeping at <strong className="text-rose-400">~2:20 AM</strong>.</p>
              </div>

              {/* Grid for minor subgoals */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="px-3 py-2 bg-slate-900/50 rounded-xl border border-slate-700/50">
                     <span className="text-[9px] font-black uppercase text-slate-500 flex items-center gap-1 mb-1"><Dumbbell className="w-3 h-3" /> Exercise</span>
                     <span className="text-xs font-bold text-white block">Building (6/7)</span>
                  </div>
                  <div className="px-3 py-2 bg-slate-900/50 rounded-xl border border-slate-700/50">
                     <span className="text-[9px] font-black uppercase text-slate-500 flex items-center gap-1 mb-1"><Github className="w-3 h-3" /> READMEs</span>
                     <span className="text-xs font-bold text-red-400 block">Not done yet</span>
                  </div>
              </div>

            </div>
        </div>

      </div>

    </div>
  );
}
