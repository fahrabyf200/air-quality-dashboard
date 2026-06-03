"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { FileBarChart, RefreshCw, TrendingUp, Activity, Wind, Thermometer, Droplets, ShieldCheck, Database, AlertTriangle, CheckCircle } from 'lucide-react';

function SummaryCard({
  label,
  value,
  maxValue,
  unit,
  color,
  danger,
  icon: Icon,
}: {
  label: string;
  value: any;
  maxValue?: any;
  unit: string;
  color: string;
  danger: boolean;
  icon: any;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden group transition-all duration-300 bg-white dark:bg-slate-900/60 shadow-sm flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700">
      {/* Glow Lampu */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-[0.2] dark:opacity-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.3]" 
        style={{ backgroundColor: color }} 
      />

      <div className="relative z-10 p-5 flex-1 flex flex-col justify-between">
        {/* MOBILE */}
        <div className="flex md:hidden flex-col justify-between h-full">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <Icon size={14} style={{ color }} />
            </div>
            
            <div
              className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
              style={{ color: danger ? '#ef4444' : '#10b981' }}
            >
              {danger ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
            </div>
          </div>
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500 mb-1">
              {label}
            </p>

            <div className="flex items-baseline gap-1">
              <h2
                className="text-2xl font-black text-slate-950 dark:text-white leading-none tabular-nums"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {value}
              </h2>
              <span className="text-slate-500 text-[10px] font-bold uppercase">{unit}</span>
            </div>
            {maxValue !== undefined && (
              <div className="mt-1 text-[10px] text-slate-500 dark:text-slate-500 font-mono">
                MAX: <span className="font-bold text-slate-700 dark:text-slate-400">{maxValue} {unit}</span>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:flex flex-col h-full justify-between">
          <div className="flex items-start justify-between mb-5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <Icon size={16} style={{ color }} />
            </div>
            
            <div
              className={`text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 px-2 py-0.5 rounded-full border ${
                danger 
                  ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
              }`}
            >
              {danger ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
              {danger ? 'Melebihi Batas' : 'Dalam Batas Aman'}
            </div>
          </div>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-2">
              {label}
            </p>

            <div className="flex items-baseline gap-1">
              <h2
                className="text-3xl xl:text-4xl font-black text-slate-950 dark:text-white leading-none tabular-nums"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {value}
              </h2>
              <span className="text-slate-500 text-xs font-bold uppercase">{unit}</span>
            </div>
            {maxValue !== undefined && (
              <div className="mt-2 text-[10px] text-slate-500 dark:text-slate-500 font-mono tracking-wide">
                NILAI PUNCAK: <span className="font-bold text-slate-700 dark:text-slate-300">{maxValue} {unit}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useThresholds } from '@/app/hooks/useThresholds';

interface SensorRow {
  co2: number;
  nh3: number;
  voc?: number;
  temp?: number;
  temperature?: number;
  hum?: number;
  humidity?: number;
  created_at?: string;
  timestamp?: string;
}

function avg(arr: number[]) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}
function maxVal(arr: number[]) { return arr.length ? Math.max(...arr) : 0; }
function minVal(arr: number[]) { return arr.length ? Math.min(...arr) : 0; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-2xl flex flex-col gap-2 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-black/5 dark:from-white/5 to-transparent pointer-events-none" />
      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-black mb-1 relative z-10">{label}</p>
      {payload.map((p: any) => {
        const color = p.stroke && p.stroke !== 'none' && !p.stroke.includes('url') ? p.stroke : p.fill;
        const cleanName = p.name.replace('Avg ', '');
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: color, color: color }} />
              <span className="text-[10px] font-semibold uppercase text-[#1E293B] dark:text-slate-300">{cleanName}</span>
            </div>
            <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
              {p.value?.toFixed(1) || 0}
              <span className="text-[9px] ml-1 text-slate-400 dark:text-slate-500">{cleanName === 'CO₂' || cleanName === 'NH₃' || cleanName === 'VOC' ? 'PPM' : cleanName === 'Temp' ? '°C' : '%'}</span>
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function ReportsPage() {
  const { thresholds: T, isLoaded: thresholdsLoaded } = useThresholds();
  const [rows, setRows] = useState<SensorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'day' | 'week' | 'month'>('day');
  
  const getWeekStr = useCallback((d: Date) => {
    const date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    const week1 = new Date(date.getFullYear(), 0, 4);
    const week = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
    return `${date.getFullYear()}-W${week.toString().padStart(2, '0')}`;
  }, []);

  // Set default initial values on mount using useEffect to avoid hydration mismatch, or just set them initially
  // In Next.js client component, using new Date() directly in useState is fine if not SSR'd strictly.
  // We use standard strings.
  const [filterDate, setFilterDate] = useState(() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); });
  const [filterMonth, setFilterMonth] = useState(() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0'); });
  const [filterWeek, setFilterWeek] = useState(() => { return getWeekStr(new Date()); });

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await fetch('/api/sensor');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRows(Array.isArray(json) ? json : [json]);
      setError('');
    } catch (e: any) {
      if (!silent) setError('Gagal memuat data laporan.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchData(); 
    const iv = setInterval(() => fetchData(true), 5000);
    return () => clearInterval(iv);
  }, [fetchData]);

  const filteredRows = rows.filter(r => {
    if (filterType === 'all') return true;
    const d = new Date(r.created_at || r.timestamp || new Date());
    if (isNaN(d.getTime())) return false;
    
    // Manual formatting for YYYY-MM-DD
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dStr = `${y}-${m}-${day}`;
    
    if (filterType === 'day') {
      return dStr === filterDate;
    }
    if (filterType === 'month') {
      return `${y}-${m}` === filterMonth;
    }
    if (filterType === 'week') {
      return getWeekStr(d) === filterWeek;
    }
    return true;
  });

  const co2s = filteredRows.map(r => r.co2);
  const nh3s = filteredRows.map(r => r.nh3);
  const vocs = filteredRows.map(r => r.voc || 0);
  const temps = filteredRows.map(r => r.temp ?? r.temperature ?? 0);
  const hums = filteredRows.map(r => r.hum ?? r.humidity ?? 0);

  const dangerCount = filteredRows.filter(r => {
    const t = r.temp ?? r.temperature ?? 0;
    return r.co2 > T.co2 || r.nh3 > T.nh3 || (r.voc || 0) > T.voc || t > T.temp;
  }).length;

  const safeRate = filteredRows.length ? (((filteredRows.length - dangerCount) / filteredRows.length) * 100).toFixed(1) : '0';

  const summaryStats = [
    { label: 'CO₂ (Sisa Pembakaran)', value: avg(co2s).toFixed(0), maxValue: maxVal(co2s).toFixed(0), unit: 'PPM', color: '#3b82f6', danger: avg(co2s) > T.co2, icon: Wind },
    { label: 'NH₃ (Indikator Kimia)', value: avg(nh3s).toFixed(2), maxValue: maxVal(nh3s).toFixed(2), unit: 'PPM', color: '#f59e0b', danger: avg(nh3s) > T.nh3, icon: Activity },
    { label: 'VOC (GAS LPG MUDAH TERBAKAR)', value: avg(vocs).toFixed(2), maxValue: maxVal(vocs).toFixed(2), unit: 'PPM', color: '#ec4899', danger: avg(vocs) > T.voc, icon: Activity },
    { label: 'Suhu Udara', value: avg(temps).toFixed(1), maxValue: maxVal(temps).toFixed(1), unit: '°C', color: '#ef4444', danger: avg(temps) > T.temp, icon: Thermometer },
    { label: 'Kelembapan', value: avg(hums).toFixed(0), maxValue: maxVal(hums).toFixed(0), unit: '%', color: '#8b5cf6', danger: avg(hums) > T.hum, icon: Droplets },
    { label: 'Tingkat Keamanan Sistem', value: safeRate, unit: '%', color: '#4ade80', danger: Number(safeRate) < 80, icon: ShieldCheck },
  ];

  const groupedMap: Record<string, { co2: number[]; nh3: number[]; voc: number[]; temp: number[]; hum: number[] }> = {};
  
  filteredRows.forEach(r => {
    const ts = r.created_at ?? r.timestamp;
    if (!ts) return;
    
    const date = new Date(ts);
    let key = '';
    
    if (filterType === 'day') {
      key = date.toLocaleTimeString('id-ID', { hour: '2-digit' }) + ':00';
    } else if (filterType === 'week' || filterType === 'month') {
      key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } else {
      key = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    }
    
    if (!groupedMap[key]) groupedMap[key] = { co2: [], nh3: [], voc: [], temp: [], hum: [] };
    groupedMap[key].co2.push(r.co2);
    groupedMap[key].nh3.push(r.nh3 ?? 0);
    groupedMap[key].voc.push(r.voc || 0);
    groupedMap[key].temp.push(r.temp ?? r.temperature ?? 0);
    groupedMap[key].hum.push(r.hum ?? r.humidity ?? 0);
  });

  const chartData = Object.entries(groupedMap)
    .slice(-30) // Limit to last 30 entries (enough for 24h day or 30d month)
    .map(([time, d]) => ({
      time,
      'Avg CO₂': avg(d.co2),
      'Avg NH₃': avg(d.nh3),
      'Avg VOC': avg(d.voc),
      'Avg Temp': avg(d.temp),
      'Avg Hum': avg(d.hum),
    }));

  // Recharts cannot draw an Area or Line with only 1 data point.
  // We duplicate it to create a flat line if there's only 1 record group.
  const displayChartData = chartData.length === 1 
    ? [
        { ...chartData[0], time: `${chartData[0].time} (Awal)` },
        { ...chartData[0], time: `${chartData[0].time} (Akhir)` }
      ]
    : chartData;

  return (
    <div className="px-6 md:px-10 xl:px-12 pt-7 pb-8 space-y-6 w-full transition-colors duration-300">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full border-b border-slate-200/60 dark:border-slate-800/40 pb-5">
        <div>
          <p className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">Kitchen Sensor Node</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Reports
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Ringkasan Statistik &amp; Analisis Trend Sensor</p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
            >
              <option value="all">Semua Data</option>
              <option value="day">Harian</option>
              <option value="week">Mingguan</option>
              <option value="month">Bulanan</option>
            </select>
            
            {filterType === 'day' && (
              <input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
            )}
            {filterType === 'week' && (
              <input type="week" value={filterWeek} onChange={e => setFilterWeek(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
            )}
            {filterType === 'month' && (
              <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all" />
            )}
          </div>

          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold active:scale-95 disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="space-y-6 w-full">
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest">
            ⚠ {error}
          </div>
        )}

        {loading || !thresholdsLoaded ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <RefreshCw size={24} className="text-emerald-500 animate-spin" />
              </div>
              <div className="absolute inset-0 bg-emerald-500/10 rounded-2xl blur-xl animate-pulse" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
              Loading report data...
            </p>
          </div>
        ) : (
          <>
            {/* Summary grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {summaryStats.map(s => (
                <SummaryCard
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  maxValue={s.maxValue}
                  unit={s.unit}
                  color={s.color}
                  danger={s.danger}
                  icon={s.icon}
                />
              ))}
            </div>

            {/* Bar Chart */}
            {displayChartData.length > 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm transition-colors duration-300">
                <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileBarChart size={13} className="text-emerald-500" />
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">
                        All Sensors Trend
                      </span>
                    </div>

                    {/* Sensor Legend */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {[
                        { k: 'CO₂', c: 'bg-blue-500' },
                        { k: 'NH₃', c: 'bg-amber-500' },
                        { k: 'VOC', c: 'bg-pink-500' },
                        { k: 'TEMP', c: 'bg-rose-500' },
                        { k: 'HUM', c: 'bg-violet-500' }
                      ].map(i => (
                        <div key={i.k} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/40 px-2 py-0.5 rounded border border-slate-200/60 dark:border-slate-800/60">
                          <span className={`w-1.5 h-1.5 rounded-full ${i.c}`} />
                          <span className="text-[9px] font-bold uppercase text-slate-600 dark:text-slate-400">{i.k}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNh3" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorVoc" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-100 dark:stroke-slate-800/40" />
                      <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        fontSize={9}
                        tickMargin={12}
                        axisLine={false}
                        tickLine={false}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                      <YAxis 
                        yAxisId="left" 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(val) => `${val}`}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#94a3b8" 
                        fontSize={9} 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(val) => `${val}°`}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }} />
                      
                      <Area yAxisId="left" name="CO₂" type="monotone" dataKey="Avg CO₂" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCo2)" dot={displayChartData.length <= 2} activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                      <Area yAxisId="left" name="NH₃" type="monotone" dataKey="Avg NH₃" stroke="#f59e0b" strokeWidth={2} fill="url(#colorNh3)" dot={displayChartData.length <= 2} activeDot={{ r: 4, fill: '#f59e0b', strokeWidth: 0 }} />
                      <Area yAxisId="left" name="VOC" type="monotone" dataKey="Avg VOC" stroke="#ec4899" strokeWidth={2} fill="url(#colorVoc)" dot={displayChartData.length <= 2} activeDot={{ r: 4, fill: '#ec4899', strokeWidth: 0 }} />
                      <Area yAxisId="right" name="Temp" type="monotone" dataKey="Avg Temp" stroke="#ef4444" strokeWidth={2} fill="url(#colorTemp)" dot={displayChartData.length <= 2} activeDot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }} />
                      <Area yAxisId="right" name="Hum" type="monotone" dataKey="Avg Hum" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorHum)" dot={displayChartData.length <= 2} activeDot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col items-center justify-center p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/40 rounded-full flex items-center justify-center mb-4 border border-slate-200/50 dark:border-slate-800/50">
                  <Database size={24} className="text-slate-400 dark:text-slate-500 animate-pulse" />
                </div>
                <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-widest">Tidak Ada Data</h3>
                <p className="text-xs text-slate-500 dark:text-slate-500">Belum ada data sensor yang terekam pada tanggal/periode yang kamu pilih.</p>
              </div>
            )}

            {/* Threshold reference table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm transition-colors duration-300">
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-[0.2em]">
                  Kitchen Threshold Reference
                </span>
              </div>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/60">
                      {['Parameter', 'Threshold', 'Dataset Average', 'Dataset Max', 'Status'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {[
                      { name: 'CO₂', threshold: `${T.co2} PPM`, avg: `${avg(co2s).toFixed(0)} PPM`, max: `${maxVal(co2s).toFixed(0)} PPM`, ok: avg(co2s) <= T.co2 },
                      { name: 'NH₃', threshold: `${T.nh3} PPM`, avg: `${avg(nh3s).toFixed(2)} PPM`, max: `${maxVal(nh3s).toFixed(2)} PPM`, ok: avg(nh3s) <= T.nh3 },
                      { name: 'VOC', threshold: `${T.voc} PPM`, avg: `${avg(vocs).toFixed(2)} PPM`, max: `${maxVal(vocs).toFixed(2)} PPM`, ok: avg(vocs) <= T.voc },
                      { name: 'Temperature', threshold: `${T.temp}°C`, avg: `${avg(temps).toFixed(1)}°C`, max: `${maxVal(temps).toFixed(1)}°C`, ok: avg(temps) <= T.temp },
                      { name: 'Humidity', threshold: `${T.hum}%`, avg: `${avg(hums).toFixed(0)}%`, max: `${maxVal(hums).toFixed(0)}%`, ok: avg(hums) <= T.hum },
                    ].map(row => (
                      <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-400 font-bold text-xs uppercase tracking-tight">{row.name}</td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-500 text-xs font-mono" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{row.threshold}</td>
                        <td className="px-5 py-3.5 font-bold text-xs font-mono" style={{ color: row.ok ? undefined : '#ef4444', fontFamily: "'IBM Plex Mono', monospace" }}>{row.avg}</td>
                        <td className="px-5 py-3.5 font-bold text-xs font-mono" style={{ color: row.ok ? undefined : '#fca5a5', fontFamily: "'IBM Plex Mono', monospace" }}>{row.max}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 w-max ${
                            row.ok
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                          }`}>
                            {row.ok ? '✓ Normal' : '⚠ Exceeded'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-slate-800/40">
                {[
                  { name: 'CO₂', threshold: `${T.co2} PPM`, avg: `${avg(co2s).toFixed(0)} PPM`, max: `${maxVal(co2s).toFixed(0)} PPM`, ok: avg(co2s) <= T.co2 },
                  { name: 'NH₃', threshold: `${T.nh3} PPM`, avg: `${avg(nh3s).toFixed(2)} PPM`, max: `${maxVal(nh3s).toFixed(2)} PPM`, ok: avg(nh3s) <= T.nh3 },
                  { name: 'VOC', threshold: `${T.voc} PPM`, avg: `${avg(vocs).toFixed(2)} PPM`, max: `${maxVal(vocs).toFixed(2)} PPM`, ok: avg(vocs) <= T.voc },
                  { name: 'Temperature', threshold: `${T.temp}°C`, avg: `${avg(temps).toFixed(1)}°C`, max: `${maxVal(temps).toFixed(1)}°C`, ok: avg(temps) <= T.temp },
                  { name: 'Humidity', threshold: `${T.hum}%`, avg: `${avg(hums).toFixed(0)}%`, max: `${maxVal(hums).toFixed(0)}%`, ok: avg(hums) <= T.hum },
                ].map(row => (
                  <div key={row.name} className="p-5 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-slate-900 dark:text-white font-black text-sm uppercase tracking-tight">{row.name}</span>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md border flex items-center gap-1 ${
                        row.ok
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }`}>
                        {row.ok ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                        {row.ok ? 'Normal' : 'Exceeded'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-2 rounded-xl text-center flex flex-col items-center justify-center">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 mb-1">THRESHOLD</p>
                        <p className="text-xs font-black text-slate-600 dark:text-slate-300 font-mono">{row.threshold}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-2 rounded-xl text-center flex flex-col items-center justify-center">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 mb-1">AVERAGE</p>
                        <p className="text-xs font-black font-mono" style={{ color: row.ok ? undefined : '#ef4444' }}>{row.avg}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-2 rounded-xl text-center flex flex-col items-center justify-center">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 mb-1">MAXIMUM</p>
                        <p className="text-xs font-black font-mono" style={{ color: row.ok ? undefined : '#fca5a5' }}>{row.max}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}