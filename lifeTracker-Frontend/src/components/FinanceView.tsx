import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
  IndianRupee,
  PlusCircle,
  Trash2,
  TrendingDown,
  Gift,
  CalendarDays,
  Hash,
  X,
  Wallet,
  ShoppingBag,
  Landmark,
  RefreshCw,
} from 'lucide-react';
import { AppData, FinanceTransaction } from '../data/types';
import { cn } from '../lib/utils';
import { FinanceAnalytics } from './FinanceAnalytics';
import { WealthTracker } from './WealthTracker';

interface FinanceViewProps {
  appData: AppData;
  updateAppData: (updates: Partial<AppData> | ((prev: AppData) => AppData)) => void;
}

export function FinanceView({ appData, updateAppData }: FinanceViewProps) {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(todayStr);
  const [bonusPct, setBonusPct] = useState(5);
  const [label, setLabel] = useState('');
  const [txMode, setTxMode] = useState<'regular' | 'personal' | 'fund_add'>('regular');
  const [selectedBank, setSelectedBank] = useState<'SBI' | 'JIO' | 'Airtel' | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState('');

  const transactions: FinanceTransaction[] = useMemo(() => {
    const txs = [...(appData.finance_transactions ?? [])];
    return txs.sort((a, b) => {
      // sort by date descending, then by created id descending
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.id.localeCompare(a.id);
    });
  }, [appData.finance_transactions]);

  // ── computed stats ──────────────────────────────────────────────────
  const stats = useMemo(() => {
    let totalAllTime = 0;
    let totalToday = 0;
    let bonusAllTime = 0;
    let bonusToday = 0;
    let personalAllTime = 0;
    let fundAllTime = 0;
    const uniqueDates = new Set<string>();

    for (const t of transactions) {
      uniqueDates.add(t.date);
      if (t.is_fund_add) {
        fundAllTime += t.amount;
        continue;
      }
      totalAllTime += t.amount;
      bonusAllTime += t.bonus;
      if (t.is_personal) personalAllTime += t.amount;
      if (t.date === todayStr) {
        totalToday += t.amount;
        bonusToday += t.bonus;
      }
    }

    const dayCount = uniqueDates.size || 1;
    const avgBonus = bonusAllTime / dayCount;
    const avgPersonal = personalAllTime / dayCount;

    // Bank balance starts from 1000
    const bankBalance = 1000 + bonusAllTime + fundAllTime - personalAllTime;

    return { 
      totalAllTime, 
      totalToday, 
      bonusAllTime, 
      bonusToday, 
      personalAllTime, 
      bankBalance, 
      count: transactions.length,
      avgBonus,
      avgPersonal
    };
  }, [transactions, todayStr]);

  // ── handlers ────────────────────────────────────────────────────────
  const handleAdd = () => {
    const amtNum = parseFloat(amount);
    if (!amount || isNaN(amtNum) || amtNum <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    setError('');

    const effectiveBonusPct = txMode === 'regular' ? bonusPct : 0;
    const bonus = parseFloat(((amtNum * effectiveBonusPct) / 100).toFixed(2));

    const newTx: FinanceTransaction = {
      id: `tx_${Date.now()}`,
      date,
      amount: amtNum,
      bonus_percent: effectiveBonusPct,
      bonus,
      is_personal: txMode === 'personal',
      is_fund_add: txMode === 'fund_add',
      label: label.trim() || undefined,
      bank: selectedBank,
    };

    updateAppData((prev) => ({
      ...prev,
      finance_transactions: [newTx, ...(prev.finance_transactions ?? [])],
    }));

    // reset form
    setAmount('');
    setDate(todayStr);
    setBonusPct(5);
    setLabel('');
    setTxMode('regular');
    setSelectedBank(undefined);
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    updateAppData((prev) => ({
      ...prev,
      finance_transactions: (prev.finance_transactions ?? []).filter((t) => t.id !== id),
    }));
  };

  const closeModal = () => {
    setModalOpen(false);
    setError('');
    setAmount('');
    setDate(todayStr);
    setBonusPct(5);
    setLabel('');
    setTxMode('regular');
    setSelectedBank(undefined);
  };

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(n);

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
          <Wallet className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Finance Tracker</h2>
          <p className="text-slate-400 text-sm flex items-center leading-none mt-1">
            Bank Balance: <span className="font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded ml-2">₹{fmt(stats.bankBalance)}</span>
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-emerald-600/30 active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        <StatCard
          icon={<Landmark className="w-5 h-5 text-indigo-400" />}
          label="Bank Balance"
          value={`₹${fmt(stats.bankBalance)}`}
          accent="indigo"
          action={
            <button
              onClick={() => {
                setTxMode('fund_add');
                setLabel('Balance Audit');
                setModalOpen(true);
              }}
              className="p-1 rounded-md hover:bg-indigo-500/20 text-indigo-400/70 hover:text-indigo-400 transition-colors"
              title="Audit / Adjust Balance"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          }
        />
        <StatCard
          icon={<Hash className="w-5 h-5 text-slate-300" />}
          label="Transactions"
          value={String(stats.count)}
          accent="slate"
        />
        <StatCard
          icon={<TrendingDown className="w-5 h-5 text-rose-400" />}
          label="Total Spent (All Time)"
          value={`₹${fmt(stats.totalAllTime)}`}
          accent="rose"
        />
        <StatCard
          icon={<CalendarDays className="w-5 h-5 text-amber-400" />}
          label="Spent Today"
          value={`₹${fmt(stats.totalToday)}`}
          accent="amber"
        />
        <StatCard
          icon={<Gift className="w-5 h-5 text-emerald-400" />}
          label="Bonus (All Time)"
          value={`₹${fmt(stats.bonusAllTime)}`}
          accent="emerald"
          subValue={`Avg. ₹${fmt(stats.avgBonus)} / day`}
        />
        <StatCard
          icon={<Gift className="w-5 h-5 text-sky-400" />}
          label="Bonus Today"
          value={`₹${fmt(stats.bonusToday)}`}
          accent="sky"
        />
        <StatCard
          icon={<ShoppingBag className="w-5 h-5 text-purple-400" />}
          label="Personal Expenses"
          value={`₹${fmt(stats.personalAllTime)}`}
          accent="purple"
          subValue={`Avg. ₹${fmt(stats.avgPersonal)} / day`}
        />
      </div>

      {/* ── Analytics (separate component) ── */}
      <FinanceAnalytics transactions={transactions} />

      {/* ── Total Wealth Tracker ── */}
      <WealthTracker appData={appData} updateAppData={updateAppData} />

      {/* ── Transactions List ── */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest">
          Transaction History
        </h3>

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-600 space-y-3">
            <Wallet className="w-12 h-12 opacity-30" />
            <p className="text-base">No transactions yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} onDelete={handleDelete} fmt={fmt} todayStr={todayStr} />
            ))}
          </div>
        )}
      </div>

      {/* ── Add Transaction Modal ── */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl shadow-black/60 space-y-5 animate-in fade-in slide-in-from-top-4 duration-250">
            {/* Modal header */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">New Transaction</h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Transaction type toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setTxMode('regular')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200',
                  txMode === 'regular'
                    ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400'
                    : 'bg-slate-800/50 border-slate-700/40 text-slate-500 hover:text-slate-300'
                )}
              >
                <Gift className="w-4 h-4" />
                With Bonus
              </button>
              <button
                onClick={() => setTxMode('personal')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200',
                  txMode === 'personal'
                    ? 'bg-purple-600/20 border-purple-500/50 text-purple-400'
                    : 'bg-slate-800/50 border-slate-700/40 text-slate-500 hover:text-slate-300'
                )}
              >
                <ShoppingBag className="w-4 h-4" />
                Personal Exp
              </button>
              <button
                onClick={() => setTxMode('fund_add')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold border transition-all duration-200',
                  txMode === 'fund_add'
                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-400'
                    : 'bg-slate-800/50 border-slate-700/40 text-slate-500 hover:text-slate-300'
                )}
              >
                <PlusCircle className="w-4 h-4" />
                Add Funds
              </button>
            </div>

            {error && (
              <div className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  max={todayStr}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all [color-scheme:dark]"
                />
              </div>
            </div>

            {/* Bank Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Select Bank <span className="normal-case text-slate-600">(optional)</span>
              </label>
              <div className="flex gap-2">
                {[
                  { id: 'SBI', color: 'bg-[#2a64b2]', text: 'S' },
                  { id: 'JIO', color: 'bg-[#0a2885]', text: 'J' },
                  { id: 'Airtel', color: 'bg-[#e40000]', text: 'A' },
                ].map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(selectedBank === bank.id ? undefined : (bank.id as any))}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200',
                      selectedBank === bank.id
                        ? 'bg-slate-700 border-slate-500 text-white'
                        : 'bg-slate-800/40 border-slate-700/40 text-slate-400 hover:border-slate-600'
                    )}
                  >
                    <div className={cn('w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white', bank.color)}>
                      {bank.text}
                    </div>
                    <span className="text-xs font-medium">{bank.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Label <span className="normal-case text-slate-600">(optional)</span>
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder={txMode === 'personal' ? 'e.g. Groceries, Petrol…' : txMode === 'fund_add' ? 'e.g. Salary, Pocket Money...' : 'e.g. Online shopping…'}
                className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>

            {/* Bonus % — hidden if not regular */}
            {txMode === 'regular' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                  Bonus %{' '}
                  {amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && (
                    <span className="text-emerald-400 normal-case ml-1">
                      → ₹{fmt((parseFloat(amount) * bonusPct) / 100)}
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={bonusPct}
                    onChange={(e) => setBonusPct(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500"
                  />
                  <div className="relative w-20 flex-shrink-0">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={bonusPct}
                      onChange={(e) => setBonusPct(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 text-xs pointer-events-none">
                      %
                    </span>
                  </div>
                </div>
              </div>
            )}

            {txMode === 'personal' && (
              <div className="flex items-center gap-2 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2.5">
                <ShoppingBag className="w-3.5 h-3.5 flex-shrink-0" />
                Personal expense — no bonus will be earned on this transaction.
              </div>
            )}

            {txMode === 'fund_add' && (
              <div className="flex items-center gap-2 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2.5">
                <PlusCircle className="w-3.5 h-3.5 flex-shrink-0" />
                This amount will be added directly to your Bank Balance.
              </div>
            )}

            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={closeModal}
                className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 font-medium text-sm transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className={cn(
                  'px-6 py-2.5 rounded-xl text-white font-semibold text-sm shadow-lg transition-all active:scale-95',
                  txMode === 'personal'
                    ? 'bg-purple-600 hover:bg-purple-500 shadow-purple-600/30'
                    : txMode === 'fund_add'
                    ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                )}
              >
                Add Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'rose' | 'amber' | 'emerald' | 'sky' | 'slate' | 'purple' | 'indigo';
  subValue?: string;
  action?: React.ReactNode;
}

function StatCard({ icon, label, value, accent, subValue, action }: StatCardProps) {
  const ring: Record<string, string> = {
    rose: 'border-rose-500/20 bg-rose-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    emerald: 'border-emerald-500/20 bg-emerald-500/5',
    sky: 'border-sky-500/20 bg-sky-500/5',
    slate: 'border-slate-600/40 bg-slate-700/20',
    purple: 'border-purple-500/20 bg-purple-500/5',
    indigo: 'border-indigo-500/20 bg-indigo-500/5',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 flex flex-col gap-3 backdrop-blur-sm shadow-sm',
        ring[accent]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500 font-medium uppercase tracking-wide leading-tight">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {action}
          {icon}
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {subValue && (
          <p className="text-[10px] text-slate-500 mt-1.5 leading-none font-medium opacity-80">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

interface TransactionRowProps {
  tx: FinanceTransaction;
  onDelete: (id: string) => void;
  fmt: (n: number) => string;
  todayStr: string;
}

function BankLogo({ bank, className }: { bank: string, className?: string }) {
  const configs: Record<string, { color: string, text: string }> = {
    SBI: { color: 'bg-[#2a64b2]', text: 'S' },
    JIO: { color: 'bg-[#0a2885]', text: 'J' },
    Airtel: { color: 'bg-[#e40000]', text: 'A' },
  };
  const config = configs[bank];
  if (!config) return null;

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className={cn('w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white', config.color)}>
        {config.text}
      </div>
      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{bank}</span>
    </div>
  );
}

function TransactionRow({ tx, onDelete, fmt, todayStr }: TransactionRowProps) {
  const isToday = tx.date === todayStr;

  return (
    <div className="group flex items-center gap-4 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40 hover:border-slate-600/60 rounded-xl px-5 py-4 transition-all duration-200">
      {/* Left: date + badges */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-white font-medium">{tx.date}</p>
          {isToday && (
            <span className="text-xs font-semibold bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded-md">
              Today
            </span>
          )}
          {tx.is_personal && (
            <span className="text-xs font-semibold bg-purple-500/15 text-purple-400 px-2 py-0.5 rounded-md flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" />
              Personal
            </span>
          )}
          {tx.is_fund_add && (
            <span className="text-xs font-semibold bg-blue-500/15 text-blue-400 px-2 py-0.5 rounded-md flex items-center gap-1">
              <PlusCircle className="w-3 h-3" />
              Fund Add
            </span>
          )}
          {tx.bank && <BankLogo bank={tx.bank} className="ml-1" />}
        </div>
        {tx.label && (
          <p className="text-xs text-slate-500 mt-0.5">{tx.label}</p>
        )}
      </div>

      {/* Center: bonus */}
      <div className="text-right hidden sm:block">
        {tx.is_personal ? (
          <p className="text-xs text-slate-600 italic">No bonus</p>
        ) : tx.is_fund_add ? (
          <p className="text-xs text-slate-600 italic">Added to Bank</p>
        ) : (
          <>
            <p className="text-xs text-slate-500">Bonus ({tx.bonus_percent}%)</p>
            <p className="text-emerald-400 font-semibold text-sm">+₹{fmt(tx.bonus)}</p>
          </>
        )}
      </div>

      {/* Right: amount + delete */}
      <div className="flex items-center gap-4 min-w-[100px] justify-end">
        <div className="text-right">
          <p className="text-xs text-slate-500">{tx.is_fund_add ? 'Added' : 'Spent'}</p>
          <p className={cn('font-bold text-lg', tx.is_fund_add ? 'text-blue-400' : tx.is_personal ? 'text-purple-400' : 'text-rose-400')}>
            {tx.is_fund_add ? '+' : ''}₹{fmt(tx.amount)}
          </p>
        </div>
        <button
          onClick={() => onDelete(tx.id)}
          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
          title="Delete transaction"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
