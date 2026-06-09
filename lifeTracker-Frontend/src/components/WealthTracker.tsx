import React, { useState, useMemo } from 'react';
import { format, parse } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { PiggyBank, PlusCircle, Trash2, TrendingUp, CalendarDays, Clock, IndianRupee } from 'lucide-react';
import { AppData, WealthLog } from '../data/types';
import { cn } from '../lib/utils';

interface WealthTrackerProps {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
}

export function WealthTracker({ appData, updateAppData }: WealthTrackerProps) {
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [time, setTime] = useState(format(new Date(), 'HH:mm'));
  const [error, setError] = useState('');

  const logs = useMemo(() => {
    return [...(appData.wealth_logs ?? [])].sort((a, b) => {
      const dtA = `${a.date}T${a.time}`;
      const dtB = `${b.date}T${b.time}`;
      return dtA.localeCompare(dtB);
    });
  }, [appData.wealth_logs]);

  const chartData = useMemo(() => {
    return logs.map((log) => {
      const parsedDate = parse(`${log.date} ${log.time}`, 'yyyy-MM-dd HH:mm', new Date());
      return {
        ...log,
        label: format(parsedDate, 'dd MMM HH:mm'),
        amountNum: log.amount,
      };
    });
  }, [logs]);

  const latestWealth = logs.length > 0 ? logs[logs.length - 1].amount : 0;
  const previousWealth = logs.length > 1 ? logs[logs.length - 2].amount : 0;
  const change = latestWealth - previousWealth;
  const isUp = change >= 0;

  const handleAddLog = () => {
    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum < 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    setError('');

    const newLog: WealthLog = {
      id: `wl_${Date.now()}`,
      date,
      time,
      amount: amtNum,
    };

    updateAppData((prev) => ({
      ...prev,
      wealth_logs: [...(prev.wealth_logs ?? []), newLog],
    }));

    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setTime(format(new Date(), 'HH:mm'));
  };

  const handleDelete = (id: string) => {
    updateAppData((prev) => ({
      ...prev,
      wealth_logs: (prev.wealth_logs ?? []).filter((l) => l.id !== id),
    }));
  };

  const fmt = (n: number) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);

  return (
    <div className="space-y-6 mt-12 pt-8 border-t border-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <PiggyBank className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Total Wealth Tracker</h2>
          <p className="text-slate-400 text-xs">Log your actual total wealth to visualize growth over time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Add form & Stats */}
        <div className="space-y-6">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-white">Log Wealth</h3>
            {error && (
              <div className="text-rose-400 text-xs bg-rose-500/10 border border-rose-500/20 rounded-md px-3 py-1.5">
                {error}
              </div>
            )}
            
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Total Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 50000"
                    className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Date</label>
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-slate-900/60 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleAddLog}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-600/20 active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Save Total Wealth
              </button>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 backdrop-blur-sm shadow-sm flex flex-col items-center justify-center text-center space-y-2">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Current Total Wealth</p>
            <p className="text-3xl font-bold text-white tracking-tight">₹{fmt(latestWealth)}</p>
            {logs.length > 1 && (
              <p className={cn("text-xs font-semibold flex items-center gap-1", isUp ? "text-emerald-400" : "text-rose-400")}>
                <TrendingUp className={cn("w-3.5 h-3.5", !isUp && "rotate-180")} />
                {isUp ? "+" : "-"}₹{fmt(Math.abs(change))} since last log
              </p>
            )}
          </div>
        </div>

        {/* Right Col: Chart & List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0c1222]/60 border border-slate-700/30 rounded-2xl p-5 overflow-hidden">
            <h4 className="text-sm font-semibold text-white mb-4">Net Worth Over Time</h4>
            {chartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height={256}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="wealthGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      minTickGap={20}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fill: '#475569', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v: number) => `₹${v}`}
                      width={65}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-[#0c1222]/95 backdrop-blur-xl border border-slate-700/60 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
                            <p className="text-[11px] text-slate-500 font-medium mb-1.5">{label}</p>
                            <p className="text-amber-400 font-bold text-sm">₹{fmt(payload[0].value as number)}</p>
                          </div>
                        );
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amountNum"
                      name="Wealth"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      fill="url(#wealthGrad)"
                      activeDot={{ r: 5, fill: '#f59e0b', stroke: '#0c1222', strokeWidth: 2 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-600">
                <TrendingUp className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">No data logged yet</p>
              </div>
            )}
          </div>

          {/* Logs List */}
          {logs.length > 0 && (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm max-h-64 overflow-y-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-900/50 text-xs uppercase text-slate-500 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-medium">Date & Time</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {[...logs].reverse().map((log) => (
                    <tr key={log.id} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-slate-200">{log.date}</span>
                        <span className="text-slate-500 ml-2">{log.time}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-amber-400">
                        ₹{fmt(log.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded-md hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
