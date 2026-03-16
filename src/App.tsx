/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  Dice5, 
  Coins, 
  Layers, 
  Info, 
  RefreshCw, 
  TrendingUp,
  BrainCircuit,
  ChevronRight,
  HelpCircle,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utility for Tailwind class merging */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Utility for Indonesian number formatting (dot for thousands, comma for decimals) */
const formatNum = (val: number, decimals: number = 2) => {
  return val.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// --- Mathematical Logic Helpers ---

/** Factorial function */
const factorial = (n: number): number => {
  if (n < 0) return 0;
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
};

/** Combination (nCr) */
const nCr = (n: number, r: number): number => {
  if (r < 0 || r > n) return 0;
  return factorial(n) / (factorial(r) * factorial(n - r));
};

/** Permutation (nPr) */
const nPr = (n: number, r: number): number => {
  if (r < 0 || r > n) return 0;
  return factorial(n) / factorial(n - r);
};

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  icon: any;
  description?: string;
  error?: string;
}

const InputField = ({ label, value, onChange, icon: Icon, min, max, description, error }: InputFieldProps) => {
  const increment = () => {
    if (max === undefined || value < max) onChange(value + 1);
  };
  const decrement = () => {
    if (min === undefined || value > min) onChange(value - 1);
  };

  return (
    <div className="group space-y-2">
      <div className="flex justify-between items-end">
        <label className={cn(
          "text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-1.5 transition-colors",
          error ? "text-red-500" : "text-zinc-400"
        )}>
          {Icon && <Icon className={cn("w-3 h-3", error ? "text-red-500" : "text-emerald-500")} />}
          {label}
        </label>
        {description && (
          <div className="group/tip relative">
            <HelpCircle className="w-3 h-3 text-zinc-300 cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-zinc-800 text-white text-[10px] rounded-lg opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
              {description}
            </div>
          </div>
        )}
      </div>
      <div className="relative flex items-center">
        <button 
          onClick={decrement}
          disabled={min !== undefined && value <= min}
          className="absolute left-1 p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all z-10"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className={cn(
            "w-full pl-10 pr-10 py-3 bg-white border rounded-xl text-center font-bold text-zinc-700 focus:outline-none focus:ring-4 transition-all shadow-sm",
            error 
              ? "border-red-300 focus:ring-red-500/10 focus:border-red-500" 
              : "border-zinc-200 focus:ring-emerald-500/10 focus:border-emerald-500 group-hover:border-zinc-300"
          )}
        />
        <button 
          onClick={increment}
          disabled={max !== undefined && value >= max}
          className="absolute right-1 p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition-all z-10"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {error && (
        <p className="text-[10px] text-red-500 font-medium flex items-center gap-1 animate-in fade-in slide-in-from-top-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'basic' | 'dice' | 'coins' | 'combinatorics'>('basic');
  
  // Basic Probability State
  const [nA, setNA] = useState<number>(1);
  const [nS, setNS] = useState<number>(6);
  
  // Dice State
  const [numDice, setNumDice] = useState<number>(1);
  
  // Coin State
  const [numCoins, setNumCoins] = useState<number>(3);

  // Combinatorics State
  const [nVal, setNVal] = useState<number>(10);
  const [rVal, setRVal] = useState<number>(3);

  // Validation Errors
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    
    if (activeTab === 'basic') {
      if (nA < 0) errs.nA = "Jumlah kejadian tidak boleh negatif";
      if (nS <= 0) errs.nS = "Ruang sampel harus lebih besar dari 0";
      if (nA > nS) errs.nA_warn = "n(A) melebihi n(S), peluang > 100%";
    }
    
    if (activeTab === 'dice') {
      if (numDice < 1) errs.numDice = "Minimal 1 dadu";
      if (numDice > 3) errs.numDice = "Maksimal 3 dadu untuk visualisasi";
    }
    
    if (activeTab === 'coins') {
      if (numCoins < 1) errs.numCoins = "Minimal 1 koin";
      if (numCoins > 10) errs.numCoins = "Maksimal 10 koin";
    }
    
    if (activeTab === 'combinatorics') {
      if (nVal < 0) errs.nVal = "n tidak boleh negatif";
      if (rVal < 0) errs.rVal = "r tidak boleh negatif";
      if (rVal > nVal) errs.rVal = "r tidak boleh lebih besar dari n";
      if (nVal > 170) errs.nVal = "n terlalu besar untuk perhitungan faktorial";
    }
    
    return errs;
  }, [activeTab, nA, nS, numDice, numCoins, nVal, rVal]);

  const hasErrors = Object.keys(errors).filter(k => !k.endsWith('_warn')).length > 0;

  // Calculations
  const basicProb = useMemo(() => (nS > 0 ? (nA / nS) : 0), [nA, nS]);
  
  const diceData = useMemo(() => {
    if (numDice > 3) return []; // Limit for performance in UI
    const totalOutcomes = Math.pow(6, numDice);
    const sums: Record<number, number> = {};
    
    // Recursive function to find all possible sums
    const findSums = (diceLeft: number, currentSum: number) => {
      if (diceLeft === 0) {
        sums[currentSum] = (sums[currentSum] || 0) + 1;
        return;
      }
      for (let i = 1; i <= 6; i++) {
        findSums(diceLeft - 1, currentSum + i);
      }
    };
    
    findSums(numDice, 0);
    return Object.entries(sums).map(([sum, count]) => ({
      name: sum,
      value: (count / totalOutcomes) * 100,
      count
    }));
  }, [numDice]);

  const coinData = useMemo(() => {
    const totalOutcomes = Math.pow(2, numCoins);
    return Array.from({ length: numCoins + 1 }, (_, i) => {
      const combinations = nCr(numCoins, i);
      return {
        name: `${i} Heads`,
        value: (combinations / totalOutcomes) * 100,
        count: combinations
      };
    });
  }, [numCoins]);

  const combResult = useMemo(() => ({
    permutation: nPr(nVal, rVal),
    combination: nCr(nVal, rVal)
  }), [nVal, rVal]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-zinc-900 font-sans selection:bg-emerald-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-bottom border-zinc-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
              <Calculator className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">ProbLogic</h1>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Mathematical Logic Engine</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
            {[
              { id: 'basic', label: 'Dasar', icon: Layers },
              { id: 'dice', label: 'Dadu', icon: Dice5 },
              { id: 'coins', label: 'Koin', icon: Coins },
              { id: 'combinatorics', label: 'Kombinatorika', icon: BrainCircuit },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  activeTab === tab.id 
                    ? "bg-white text-emerald-600 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar / Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Parameter Input
            </h2>

            {activeTab === 'basic' && (
              <div className="space-y-6">
                <InputField 
                  label="Jumlah Kejadian (n(A))" 
                  value={nA} 
                  icon={Layers}
                  error={errors.nA}
                  description="Banyaknya hasil yang kita harapkan terjadi dalam suatu percobaan."
                  onChange={(v) => setNA(v)} 
                />
                <InputField 
                  label="Ruang Sampel (n(S))" 
                  value={nS} 
                  icon={RefreshCw}
                  error={errors.nS}
                  description="Total seluruh kemungkinan hasil yang mungkin terjadi."
                  onChange={(v) => setNS(v)} 
                />
                
                {errors.nA_warn && !errors.nA && !errors.nS && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
                    <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-700 leading-tight">
                      <strong>Peringatan:</strong> {errors.nA_warn}
                    </p>
                  </div>
                )}

                <div className={cn(
                  "pt-4 p-5 rounded-2xl border transition-all shadow-inner",
                  hasErrors ? "bg-zinc-50 border-zinc-100 opacity-50 grayscale" : "bg-emerald-50 border-emerald-100"
                )}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Peluang P(A)</span>
                    <span className="text-2xl font-black text-emerald-600 tabular-nums">
                      {hasErrors ? "---" : `${formatNum(basicProb * 100, 2)}%`}
                    </span>
                  </div>
                  <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full transition-all duration-700 ease-out" style={{ width: `${hasErrors ? 0 : Math.min(100, basicProb * 100)}%` }} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'dice' && (
              <div className="space-y-6">
                <InputField 
                  label="Jumlah Dadu" 
                  value={numDice} 
                  icon={Dice5}
                  error={errors.numDice}
                  description="Jumlah dadu yang dilempar secara bersamaan."
                  onChange={(v) => setNumDice(v)} 
                />
                <div className={cn(
                  "p-4 rounded-xl border transition-all",
                  hasErrors ? "bg-zinc-50 border-zinc-100 opacity-50" : "bg-zinc-50 border-zinc-100"
                )}>
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Info Ruang Sampel</h4>
                  <p className="text-sm font-bold text-zinc-600">
                    {hasErrors ? "Input tidak valid" : `6^${numDice} = ${Math.pow(6, numDice)} kemungkinan`}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'coins' && (
              <div className="space-y-6">
                <InputField 
                  label="Jumlah Koin" 
                  value={numCoins} 
                  icon={Coins}
                  error={errors.numCoins}
                  description="Jumlah koin yang dilempar secara bersamaan."
                  onChange={(v) => setNumCoins(v)} 
                />
                <div className={cn(
                  "p-4 rounded-xl border transition-all",
                  hasErrors ? "bg-zinc-50 border-zinc-100 opacity-50" : "bg-zinc-50 border-zinc-100"
                )}>
                  <h4 className="text-[10px] font-bold text-zinc-400 uppercase mb-2">Info Ruang Sampel</h4>
                  <p className="text-sm font-bold text-zinc-600">
                    {hasErrors ? "Input tidak valid" : `2^${numCoins} = ${Math.pow(2, numCoins)} kemungkinan`}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'combinatorics' && (
              <div className="space-y-6">
                <InputField 
                  label="Total Objek (n)" 
                  value={nVal} 
                  icon={Layers}
                  error={errors.nVal}
                  description="Jumlah seluruh anggota himpunan objek."
                  onChange={(v) => setNVal(v)} 
                />
                <InputField 
                  label="Objek Dipilih (r)" 
                  value={rVal} 
                  icon={ChevronRight}
                  error={errors.rVal}
                  description="Jumlah objek yang akan diambil atau disusun."
                  onChange={(v) => setRVal(v)} 
                />
              </div>
            )}
          </Card>

          <Card className="p-6 bg-zinc-900 text-white border-none">
            <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-emerald-400">
              <Info className="w-4 h-4" />
              Logika Matematika
            </h3>
            <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
              {activeTab === 'basic' && (
                <p>Peluang klasik didefinisikan sebagai rasio antara jumlah hasil yang diinginkan dengan total kemungkinan hasil dalam ruang sampel yang sama kemungkinannya.</p>
              )}
              {activeTab === 'dice' && (
                <p>Setiap dadu memiliki 6 sisi. Untuk n dadu, total ruang sampel adalah 6^n. Distribusi jumlah mata dadu mengikuti pola binomial yang mendekati distribusi normal.</p>
              )}
              {activeTab === 'coins' && (
                <p>Peluang koin menggunakan Distribusi Binomial. Peluang mendapatkan k angka dari n lemparan adalah C(n,k) * (0.5)^n.</p>
              )}
              {activeTab === 'combinatorics' && (
                <p>Permutasi (P) memperhatikan urutan, sedangkan Kombinasi (C) tidak. Rumus: nPr = n!/(n-r)! dan nCr = n!/(r!(n-r)!).</p>
              )}
              <div className="pt-2 font-mono text-[10px] text-zinc-500">
                {activeTab === 'basic' && "Formula: P(A) = n(A) / n(S)"}
                {activeTab === 'dice' && `Sample Space: 6^${numDice} = ${Math.pow(6, numDice)}`}
                {activeTab === 'coins' && `Sample Space: 2^${numCoins} = ${Math.pow(2, numCoins)}`}
                {activeTab === 'combinatorics' && "nCr = n! / (r!(n-r)!)"}
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content / Visualization */}
        <div className="lg:col-span-8 space-y-6">
          {hasErrors ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-zinc-200 text-center px-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <HelpCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-zinc-800">Input Tidak Valid</h3>
              <p className="text-sm text-zinc-500 max-w-xs mt-2">
                Silakan perbaiki kesalahan pada parameter input di sebelah kiri untuk melihat hasil kalkulasi.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTab === 'combinatorics' ? (
                  <>
                    <Card className="p-6 flex flex-col justify-center items-center text-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase mb-2">Permutasi (nPr)</span>
                      <span className="text-4xl font-black text-emerald-600 tabular-nums">
                        {formatNum(combResult.permutation, 0)}
                      </span>
                      <p className="mt-4 text-xs text-zinc-500 italic">Memperhatikan urutan (AB ≠ BA)</p>
                    </Card>
                    <Card className="p-6 flex flex-col justify-center items-center text-center">
                      <span className="text-xs font-bold text-zinc-400 uppercase mb-2">Kombinasi (nCr)</span>
                      <span className="text-4xl font-black text-blue-600 tabular-nums">
                        {formatNum(combResult.combination, 0)}
                      </span>
                      <p className="mt-4 text-xs text-zinc-500 italic">Tidak memperhatikan urutan (AB = BA)</p>
                    </Card>
                  </>
                ) : (
                  <Card className="p-6 md:col-span-2">
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <h3 className="text-lg font-bold">Distribusi Peluang</h3>
                        <p className="text-xs text-zinc-500">Visualisasi probabilitas berdasarkan parameter input</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-lg text-[10px] font-bold text-zinc-600">
                        <RefreshCw className="w-3 h-3" />
                        REAL-TIME SYNC
                      </div>
                    </div>

                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={activeTab === 'dice' ? diceData : activeTab === 'coins' ? coinData : [{ name: 'P(A)', value: basicProb * 100 }, { name: 'P(A\')', value: (1 - basicProb) * 100 }]}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                          <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: '#71717a' }}
                            dy={10}
                          />
                          <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fontWeight: 600, fill: '#71717a' }}
                            tickFormatter={(v) => `${formatNum(v, 0)}%`}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f4f4f5' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                            formatter={(value: number) => [`${formatNum(value, 2)}%`, 'Peluang']}
                          />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                            {(activeTab === 'dice' ? diceData : activeTab === 'coins' ? coinData : []).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#10b981' : '#3b82f6'} />
                            ))}
                            {activeTab === 'basic' && [
                              <Cell key="c1" fill="#10b981" />,
                              <Cell key="c2" fill="#ef4444" />
                            ]}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                )}
              </div>

              {/* Detailed Stats / Table */}
              <Card className="overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                  <h3 className="font-bold">Detail Kalkulasi</h3>
                  <button className="text-emerald-600 text-xs font-bold hover:underline flex items-center gap-1">
                    Export Data <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-zinc-500 text-[10px] uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-6 py-4">Kejadian</th>
                        <th className="px-6 py-4">Peluang (Fraksi)</th>
                        <th className="px-6 py-4">Persentase</th>
                        <th className="px-6 py-4">Frekuensi Harapan (100x)</th>
                        <th className="px-6 py-4">Status Logika</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {(activeTab === 'dice' ? diceData : activeTab === 'coins' ? coinData : []).map((item: any, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-zinc-100 rounded-lg flex items-center justify-center text-zinc-500 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
                                {activeTab === 'dice' ? <Dice5 className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                              </div>
                              <span className="font-bold text-zinc-700">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                            {item.count} / {activeTab === 'dice' ? Math.pow(6, numDice) : Math.pow(2, numCoins)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${item.value}%` }} />
                              </div>
                              <span className="text-xs font-bold text-zinc-600">{formatNum(item.value, 1)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 tabular-nums font-medium text-zinc-600">
                            {formatNum(item.value, 1)} kali
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                              item.value > 25 ? "bg-emerald-100 text-emerald-700" : 
                              item.value > 10 ? "bg-blue-100 text-blue-700" : 
                              "bg-zinc-100 text-zinc-500"
                            )}>
                              {item.value > 25 ? "Sangat Mungkin" : item.value > 10 ? "Mungkin" : "Langka"}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {activeTab === 'basic' && (
                        <tr className="hover:bg-zinc-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                                <Layers className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-zinc-700">Kejadian A</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-zinc-400">
                            {nA} / {nS}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{ width: `${Math.min(100, basicProb * 100)}%` }} />
                              </div>
                              <span className="text-xs font-bold text-emerald-600">{formatNum(basicProb * 100, 2)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 tabular-nums font-medium text-zinc-600">
                            {formatNum(basicProb * 100, 1)} kali
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">
                              Terverifikasi
                            </span>
                          </td>
                        </tr>
                      )}
                      {activeTab === 'combinatorics' && (
                        <tr>
                          <td className="px-6 py-4 font-medium" colSpan={5}>
                            <div className="flex items-center gap-2 text-zinc-500 italic">
                              <HelpCircle className="w-4 h-4" />
                              Kombinatorika tidak memiliki distribusi peluang tunggal tanpa konteks kejadian spesifik.
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-zinc-200 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-50">
            <Calculator className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">ProbLogic Engine v1.0</span>
          </div>
          <div className="flex gap-8 text-xs font-medium text-zinc-500">
            <a href="#" className="hover:text-emerald-600 transition-colors">Dokumentasi</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Teori Peluang</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Kontak</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
