import React, { useMemo, useState } from 'react';
import { format, subDays, parseISO } from 'date-fns';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Activity,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { FinanceTransaction } from '../data/types';
import { cn } from '../lib/utils';

interface FinanceAnalyticsProps {
  transactions: FinanceTransaction[];
}

type TimeRange = '7d' | '14d' | '30d' | 'all';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);

// ── Custom Tooltip ──────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, suffix }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0c1222]/95 backdrop-blur-xl border border-slate-700/60 rounded-xl px-4 py-3 shadow-2xl shadow-black/40">
      <p className="text-[11px] text-slate-500 font-medium mb-1.5 tracking-wide uppercase">
        {label}
      </p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="text-slate-400 text-xs">{p.name}:</span>
          <span className="text-white font-semibold text-sm">
            {suffix === '#' ? p.value : `₹${fmt(p.value)}`}
          </span>
        </div>
      ))}
    </div>
  );
}

// ── Sparkline mini chart ────────────────────────────────────────────────────
function Sparkline({
  data,
  dataKey,
  color,
  height = 40,
}: {
  data: any[];
  dataKey: string;
  color: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${dataKey})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Main Export ──────────────────────────────────────────────────────────────
export function FinanceAnalytics({ transactions }: FinanceAnalyticsProps) {
  const [range, setRange] = useState<TimeRange>('30d');

  // Build daily aggregated data
  const { chartData, filteredData, prevPeriodData } = useMemo(() => {
    // aggregate per day
    const map = new Map<string, { spend: number; bonus: number; count: number; personal: number }>();
    for (const t of transactions) {
      if (t.is_fund_add) continue;

      const entry = map.get(t.date) ?? { spend: 0, bonus: 0, count: 0, personal: 0 };
      entry.spend += t.amount;
      entry.bonus += t.bonus;
      entry.count += 1;
      if (t.is_personal) entry.personal += t.amount;
      map.set(t.date, entry);
    }

    const allData = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({
        date,
        label: format(parseISO(date), 'dd MMM'),
        spend: parseFloat(d.spend.toFixed(2)),
        bonus: parseFloat(d.bonus.toFixed(2)),
        count: d.count,
        personal: parseFloat(d.personal.toFixed(2)),
        cumulative: 0,
      }));

    // running cumulative spend
    let cum = 0;
    for (const d of allData) {
      cum += d.spend;
      d.cumulative = parseFloat(cum.toFixed(2));
    }

    // filter by range
    const today = new Date();
    const rangeDays: Record<TimeRange, number | null> = {
      '7d': 7,
      '14d': 14,
      '30d': 30,
      all: null,
    };
    const days = rangeDays[range];

    let filtered = allData;
    let prev: typeof allData = [];
    if (days) {
      const cutoff = format(subDays(today, days), 'yyyy-MM-dd');
      const prevCutoff = format(subDays(today, days * 2), 'yyyy-MM-dd');
      filtered = allData.filter((d) => d.date >= cutoff);
      prev = allData.filter((d) => d.date >= prevCutoff && d.date < cutoff);
    }

    return { chartData: allData, filteredData: filtered, prevPeriodData: prev };
  }, [transactions, range]);

  // Period totals
  const periodStats = useMemo(() => {
    const totalSpend = filteredData.reduce((s, d) => s + d.spend, 0);
    const totalBonus = filteredData.reduce((s, d) => s + d.bonus, 0);
    const totalCount = filteredData.reduce((s, d) => s + d.count, 0);
    const totalPersonal = filteredData.reduce((s, d) => s + d.personal, 0);
    const avgDaily =
      filteredData.length > 0 ? totalSpend / filteredData.length : 0;

    const prevSpend = prevPeriodData.reduce((s, d) => s + d.spend, 0);
    const spendChange =
      prevSpend > 0 ? ((totalSpend - prevSpend) / prevSpend) * 100 : 0;

    const prevCount = prevPeriodData.reduce((s, d) => s + d.count, 0);
    const countChange =
      prevCount > 0 ? ((totalCount - prevCount) / prevCount) * 100 : 0;

    return { totalSpend, totalBonus, totalCount, totalPersonal, avgDaily, spendChange, countChange };
  }, [filteredData, prevPeriodData]);

  if (transactions.length === 0) return null;

  const ranges: { key: TimeRange; label: string }[] = [
    { key: '7d', label: '7D' },
    { key: '14d', label: '14D' },
    { key: '30d', label: '30D' },
    { key: 'all', label: 'ALL' },
  ];

  const avgLine =
    filteredData.length > 0
      ? parseFloat(
          (
            filteredData.reduce((s, d) => s + d.spend, 0) / filteredData.length
          ).toFixed(2)
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* ── Header Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Activity className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Market Analytics
            </h3>
            <p className="text-xs text-slate-500">Spending performance overview</p>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex bg-slate-800/60 border border-slate-700/50 rounded-xl p-1 gap-0.5">
          {ranges.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={cn(
                'px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-200',
                range === r.key
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white shadow-md shadow-violet-600/25'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Metric Ticker Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <TickerCard
          label="Total Outflow"
          value={`₹${fmt(periodStats.totalSpend)}`}
          change={periodStats.spendChange}
          sparkData={filteredData}
          sparkKey="spend"
          sparkColor="#f43f5e"
        />
        <TickerCard
          label="Avg Daily Burn"
          value={`₹${fmt(periodStats.avgDaily)}`}
          sparkData={filteredData}
          sparkKey="spend"
          sparkColor="#f59e0b"
        />
        <TickerCard
          label="Total Bonus"
          value={`₹${fmt(periodStats.totalBonus)}`}
          sparkData={filteredData}
          sparkKey="bonus"
          sparkColor="#10b981"
        />
        <TickerCard
          label="Transactions"
          value={String(periodStats.totalCount)}
          change={periodStats.countChange}
          sparkData={filteredData}
          sparkKey="count"
          sparkColor="#818cf8"
        />
      </div>

      {/* ── Main Chart: Spend + Cumulative ── */}
      <div className="bg-[#0c1222]/60 border border-slate-700/30 rounded-2xl overflow-hidden">
        <div className="px-5 pt-5 pb-2 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-rose-400" />
              Daily Spend
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Bar = daily spend · Line = cumulative total
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-rose-500" /> Spend
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full bg-violet-400" />{' '}
              Cumulative
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-6 border-t border-dashed border-amber-500/60" />{' '}
              Avg
            </span>
          </div>
        </div>
        <div className="h-72 px-2 pb-3">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart
              data={filteredData}
              margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              barGap={0}
            >
              <defs>
                <linearGradient id="spendBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#e11d48" stopOpacity={0.4} />
                </linearGradient>
                <linearGradient id="cumLineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#c084fc" stopOpacity={1} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
                interval={filteredData.length > 20 ? 2 : 0}
              />
              <YAxis
                yAxisId="spend"
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `₹${v}`}
                width={55}
              />
              <YAxis
                yAxisId="cum"
                orientation="right"
                tick={{ fill: '#475569', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `₹${v}`}
                width={55}
              />
              <Tooltip content={<ChartTooltip />} />
              <ReferenceLine
                yAxisId="spend"
                y={avgLine}
                stroke="#f59e0b"
                strokeDasharray="6 4"
                strokeOpacity={0.5}
                label={{
                  value: `Avg ₹${fmt(avgLine)}`,
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />
              <Bar
                yAxisId="spend"
                dataKey="spend"
                name="Spend"
                fill="url(#spendBarGrad)"
                radius={[4, 4, 0, 0]}
                barSize={filteredData.length > 20 ? 10 : 20}
              />
              <Line
                yAxisId="cum"
                dataKey="cumulative"
                name="Cumulative"
                stroke="url(#cumLineGrad)"
                strokeWidth={2.5}
                dot={false}
                type="monotone"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Bottom Row: Bonus + Tx count ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Bonus Chart */}
        <div className="bg-[#0c1222]/60 border border-slate-700/30 rounded-2xl overflow-hidden">
          <div className="px-5 pt-5 pb-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Daily Bonus Earned
            </h4>
          </div>
          <div className="h-52 px-2 pb-3">
            <ResponsiveContainer width="100%" height={188}>
              <AreaChart
                data={filteredData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="bonusAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="60%" stopColor="#10b981" stopOpacity={0.08} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  interval={filteredData.length > 20 ? 2 : 0}
                />
                <YAxis
                  tick={{ fill: '#475569', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `₹${v}`}
                  width={50}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="bonus"
                  name="Bonus"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#bonusAreaGrad)"
                  dot={false}
                  activeDot={{
                    r: 4,
                    fill: '#10b981',
                    stroke: '#0c1222',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Tx Count */}
        <div className="bg-[#0c1222]/60 border border-slate-700/30 rounded-2xl overflow-hidden">
          <div className="px-5 pt-5 pb-2">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              Transactions / Day
            </h4>
          </div>
          <div className="h-52 px-2 pb-3">
            <ResponsiveContainer width="100%" height={188}>
              <BarChart
                data={filteredData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="countBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.35} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e293b"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#475569', fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                  interval={filteredData.length > 20 ? 2 : 0}
                />
                <YAxis
                  tick={{ fill: '#475569', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  width={30}
                />
                <Tooltip content={<ChartTooltip suffix="#" />} />
                <Bar
                  dataKey="count"
                  name="Transactions"
                  fill="url(#countBarGrad)"
                  radius={[4, 4, 0, 0]}
                  barSize={filteredData.length > 20 ? 10 : 20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Ticker Card ─────────────────────────────────────────────────────────────
interface TickerCardProps {
  label: string;
  value: string;
  change?: number;
  sparkData: any[];
  sparkKey: string;
  sparkColor: string;
}

function TickerCard({
  label,
  value,
  change,
  sparkData,
  sparkKey,
  sparkColor,
}: TickerCardProps) {
  const hasChange = change !== undefined && change !== 0;
  const isUp = (change ?? 0) > 0;

  return (
    <div className="relative bg-[#0c1222]/60 border border-slate-700/30 rounded-xl p-4 overflow-hidden group hover:border-slate-600/50 transition-all duration-300">
      {/* Sparkline background */}
      <div className="absolute bottom-0 left-0 right-0 opacity-40 group-hover:opacity-60 transition-opacity duration-300">
        <Sparkline data={sparkData} dataKey={sparkKey} color={sparkColor} height={36} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">
          {label}
        </p>
        <div className="flex items-end gap-2">
          <p className="text-xl font-bold text-white tracking-tight leading-none">
            {value}
          </p>
          {hasChange && (
            <span
              className={cn(
                'flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md',
                isUp
                  ? 'text-rose-400 bg-rose-500/10'
                  : 'text-emerald-400 bg-emerald-500/10'
              )}
            >
              {isUp ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              {Math.abs(change!).toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
