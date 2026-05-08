"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { FileBarChart, RefreshCw, TrendingUp, Activity, Wind, Thermometer, Droplets, ShieldCheck, Database, AlertTriangle, CheckCircle } from 'lucide-react';

function SummaryCard({
  label,
  value,
  unit,
  color,
  danger,
  icon: Icon,
}: {
  label: string;
  value: any;
  unit: string;
  color: string;
  danger: boolean;
  icon: any;
}) {
  return (
    <div className="relative rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/15 overflow-hidden group transition-all duration-300 bg-white dark:bg-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] flex flex-col justify-between">
      {/* glow desktop only */}
      <div
        className="hidden md:block absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-10"
        style={{ background: color }}
      />

      {/* top line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}70, transparent)`,
        }}
      />

      <div className="p-4 md:p-5 flex-1 flex flex-col justify-between">
        {/* MOBILE */}
        <div className="flex md:hidden items-center justify-between mb-2">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500 mb-1">
              {label}
            </p>

            <div className="flex items-baseline gap-1">
              <h2
                className="text-2xl font-black text-slate-900 dark:text-white leading-none tabular-nums"
                style={{ fontFamily: "'IBM Plex Mono', monospace", color: danger ? '#f87171' : undefined }}
              >
                {value}
              </h2>
              <span className="text-slate-400 text-[10px] font-bold uppercase">{unit}</span>
            </div>
          </div>

          <div
            className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/8 flex items-center justify-center shrink-0"
            style={{ background: `${color}15` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block">
          <div className="flex items-start justify-between mb-4">
            <div
              className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-white/8 flex items-center justify-center"
              style={{ background: `${color}15` }}
            >
              <Icon size={16} style={{ color }} />
            </div>
          </div>

          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500 mb-2">
            {label}
          </p>

          <div className="flex items-baseline gap-1">
            <h2
              className="text-3xl xl:text-4xl font-black text-slate-900 dark:text-white leading-none tabular-nums"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: danger ? '#f87171' : undefined }}
            >
              {value}
            </h2>
            <span className="text-slate-400 text-xs font-bold uppercase">{unit}</span>
          </div>
        </div>
        
        {/* Danger indicator */}
        <div
          className="mt-3 md:mt-4 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5"
          style={{ color: danger ? '#f87171' : '#4ade80' }}
        >
          {danger ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
          {danger ? 'Above threshold' : 'Normal'}
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
    <div className="bg-[#0a0f1a] border border-white/10 p-3 rounded-xl shadow-2xl flex flex-col gap-2 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <p className="text-[10px] text-slate-400 font-mono font-black mb-1 relative z-10">{label}</p>
      {payload.map((p: any) => {
        const color = p.stroke && p.stroke !== 'none' && !p.stroke.includes('url') ? p.stroke : p.fill;
        const cleanName = p.name.replace('Avg ', '');
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-4 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ background: color, color: color }} />
              <span className="text-[10px] font-black uppercase text-slate-300">{cleanName}</span>
            </div>
            <span className="text-xs font-mono font-bold text-white">
              {p.value?.toFixed(1) || 0}
              <span className="text-[9px] ml-1 text-slate-500">{cleanName === 'CO₂' || cleanName === 'NH₃' ? 'PPM' : cleanName === 'Temp' ? '°C' : '%'}</span>
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
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('day');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sensor');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRows(Array.isArray(json) ? json : [json]);
      setError('');
    } catch (e: any) {
      setError('Gagal memuat data laporan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const co2s = rows.map(r => r.co2);
  const nh3s = rows.map(r => r.nh3);
  const temps = rows.map(r => r.temp ?? r.temperature ?? 0);
  const hums = rows.map(r => r.hum ?? r.humidity ?? 0);

  const dangerCount = rows.filter(r => {
    const t = r.temp ?? r.temperature ?? 0;
    return r.co2 > T.co2 || r.nh3 > T.nh3 || t > T.temp;
  }).length;

  const safeRate = rows.length ? (((rows.length - dangerCount) / rows.length) * 100).toFixed(1) : '0';

  const summaryStats = [
    { label: 'Avg CO₂', value: avg(co2s).toFixed(0), unit: 'PPM', color: '#3b82f6', danger: avg(co2s) > T.co2, icon: Wind },
    { label: 'Max CO₂', value: maxVal(co2s).toFixed(0), unit: 'PPM', color: '#60a5fa', danger: maxVal(co2s) > T.co2, icon: TrendingUp },
    { label: 'Avg NH₃', value: avg(nh3s).toFixed(2), unit: 'PPM', color: '#f59e0b', danger: avg(nh3s) > T.nh3, icon: Activity },
    { label: 'Max NH₃', value: maxVal(nh3s).toFixed(2), unit: 'PPM', color: '#fbbf24', danger: maxVal(nh3s) > T.nh3, icon: TrendingUp },
    { label: 'Avg Temp', value: avg(temps).toFixed(1), unit: '°C', color: '#ef4444', danger: avg(temps) > T.temp, icon: Thermometer },
    { label: 'Avg Humidity', value: avg(hums).toFixed(0), unit: '%', color: '#8b5cf6', danger: avg(hums) > T.hum, icon: Droplets },
    { label: 'Safe Rate', value: safeRate, unit: '%', color: '#4ade80', danger: Number(safeRate) < 80, icon: ShieldCheck },
    { label: 'Total Records', value: rows.length.toString(), unit: 'entries', color: '#94a3b8', danger: false, icon: Database },
  ];

  const groupedMap: Record<string, { co2: number[]; nh3: number[]; temp: number[]; hum: number[] }> = {};
  
  rows.forEach(r => {
    const ts = r.created_at ?? r.timestamp;
    if (!ts) return;
    
    const date = new Date(ts);
    let key = '';
    
    if (timeRange === 'day') {
      key = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } else if (timeRange === 'week') {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      key = 'Wk ' + monday.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    } else if (timeRange === 'month') {
      key = date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    }
    
    if (!groupedMap[key]) groupedMap[key] = { co2: [], nh3: [], temp: [], hum: [] };
    groupedMap[key].co2.push(r.co2);
    groupedMap[key].nh3.push(r.nh3 ?? 0);
    groupedMap[key].temp.push(r.temp ?? r.temperature ?? 0);
    groupedMap[key].hum.push(r.hum ?? r.humidity ?? 0);
  });

  const chartData = Object.entries(groupedMap)
    .slice(-15) // Limit to last 15 entries for readability
    .map(([time, d]) => ({
      time,
      'Avg CO₂': avg(d.co2),
      'Avg NH₃': avg(d.nh3),
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d1a] text-slate-900 dark:text-white transition-colors duration-300">
      {/* PAGE HEADER */}
      <div className="px-6 md:px-8 pt-7 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.35em] mb-1">Kitchen Sensor Node</p>
            <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Reports
            </h1>
            <p className="text-slate-600 text-xs mt-1 font-mono">Ringkasan Statistik Sensor</p>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all text-[11px] font-black uppercase tracking-wider active:scale-95 disabled:opacity-50 shadow-sm dark:shadow-none"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="px-6 md:px-10 xl:px-12 pb-8 space-y-5 w-full">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-600 dark:text-red-400 text-sm font-bold uppercase tracking-widest">
            ⚠ {error}
          </div>
        )}

        {loading || !thresholdsLoaded ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <RefreshCw size={24} className="text-blue-400 animate-spin" />
              </div>
              <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl animate-pulse" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-600">
              Loading report data...
            </p>
          </div>
        ) : (
          <>
            {/* Summary grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
              {summaryStats.map(s => (
                <SummaryCard
                  key={s.label}
                  label={s.label}
                  value={s.value}
                  unit={s.unit}
                  color={s.color}
                  danger={s.danger}
                  icon={s.icon}
                />
              ))}
            </div>

            {/* Bar Chart */}
            {displayChartData.length > 0 && (
              <div className="rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/[0.05] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] transition-colors duration-300">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-2">
                      <FileBarChart size={13} className="text-blue-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                        All Sensors Trend
                      </span>
                    </div>

                    {/* Sensor Legend */}
                    <div className="flex items-center gap-2">
                      {[
                        { k: 'CO₂', c: 'bg-blue-500' },
                        { k: 'NH₃', c: 'bg-yellow-500' },
                        { k: 'TEMP', c: 'bg-orange-500' },
                        { k: 'HUM', c: 'bg-purple-500' }
                      ].map(i => (
                        <div key={i.k} className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded border border-slate-200 dark:border-white/10">
                          <span className={`w-2 h-2 rounded-full ${i.c}`} />
                          <span className="text-[9px] font-black uppercase text-slate-500">{i.k}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Time Range Toggle */}
                  <div className="flex bg-slate-100 dark:bg-[#0d1425] p-1 rounded-xl w-max">
                    {[
                      { id: 'day', label: 'Per Hari' },
                      { id: 'week', label: 'Per Minggu' },
                      { id: 'month', label: 'Per Bulan' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTimeRange(t.id as any)}
                        className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                          timeRange === t.id 
                            ? 'bg-white dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="p-6 h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={displayChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNh3" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-slate-200 dark:stroke-white/5" />
                      <XAxis
                        dataKey="time"
                        stroke="#94a3b8"
                        fontSize={10}
                        tickMargin={12}
                        axisLine={false}
                        tickLine={false}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                      <YAxis 
                        yAxisId="left" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(val) => `${val}`}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                      <YAxis 
                        yAxisId="right" 
                        orientation="right" 
                        stroke="#94a3b8" 
                        fontSize={10} 
                        axisLine={false} 
                        tickLine={false}
                        tickFormatter={(val) => `${val}°`}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }} />
                      
                      <Area yAxisId="left" name="CO₂" type="monotone" dataKey="Avg CO₂" stroke="#3b82f6" strokeWidth={2} fill="url(#colorCo2)" dot={displayChartData.length <= 2} activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }} />
                      <Area yAxisId="left" name="NH₃" type="monotone" dataKey="Avg NH₃" stroke="#eab308" strokeWidth={2} fill="url(#colorNh3)" dot={displayChartData.length <= 2} activeDot={{ r: 4, fill: '#eab308', strokeWidth: 0 }} />
                      <Area yAxisId="right" name="Temp" type="monotone" dataKey="Avg Temp" stroke="#f97316" strokeWidth={2} fill="url(#colorTemp)" dot={displayChartData.length <= 2} activeDot={{ r: 4, fill: '#f97316', strokeWidth: 0 }} />
                      <Area yAxisId="right" name="Hum" type="monotone" dataKey="Avg Hum" stroke="#a855f7" strokeWidth={2} fill="url(#colorHum)" dot={displayChartData.length <= 2} activeDot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Threshold reference table */}
            <div className="rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/[0.05] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] transition-colors duration-300">
              <div className="px-6 py-5 border-b border-slate-200 dark:border-white/5">
                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">
                  Kitchen Threshold Reference
                </span>
              </div>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/5">
                      {['Parameter', 'Threshold', 'Dataset Average', 'Dataset Max', 'Status'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/[0.03]">
                    {[
                      { name: 'CO₂', threshold: `${T.co2} PPM`, avg: `${avg(co2s).toFixed(0)} PPM`, max: `${maxVal(co2s).toFixed(0)} PPM`, ok: avg(co2s) <= T.co2 },
                      { name: 'NH₃', threshold: `${T.nh3} PPM`, avg: `${avg(nh3s).toFixed(2)} PPM`, max: `${maxVal(nh3s).toFixed(2)} PPM`, ok: avg(nh3s) <= T.nh3 },
                      { name: 'Temperature', threshold: `${T.temp}°C`, avg: `${avg(temps).toFixed(1)}°C`, max: `${maxVal(temps).toFixed(1)}°C`, ok: avg(temps) <= T.temp },
                      { name: 'Humidity', threshold: `${T.hum}%`, avg: `${avg(hums).toFixed(0)}%`, max: `${maxVal(hums).toFixed(0)}%`, ok: avg(hums) <= T.hum },
                    ].map(row => (
                      <tr key={row.name} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                        <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-tight">{row.name}</td>
                        <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 text-xs font-mono" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{row.threshold}</td>
                        <td className="px-5 py-3.5 font-bold text-xs font-mono" style={{ color: row.ok ? undefined : '#f87171', fontFamily: "'IBM Plex Mono', monospace" }}>{row.avg}</td>
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
              <div className="md:hidden flex flex-col divide-y divide-slate-200 dark:divide-white/[0.03]">
                {[
                  { name: 'CO₂', threshold: `${T.co2} PPM`, avg: `${avg(co2s).toFixed(0)} PPM`, max: `${maxVal(co2s).toFixed(0)} PPM`, ok: avg(co2s) <= T.co2 },
                  { name: 'NH₃', threshold: `${T.nh3} PPM`, avg: `${avg(nh3s).toFixed(2)} PPM`, max: `${maxVal(nh3s).toFixed(2)} PPM`, ok: avg(nh3s) <= T.nh3 },
                  { name: 'Temperature', threshold: `${T.temp}°C`, avg: `${avg(temps).toFixed(1)}°C`, max: `${maxVal(temps).toFixed(1)}°C`, ok: avg(temps) <= T.temp },
                  { name: 'Humidity', threshold: `${T.hum}%`, avg: `${avg(hums).toFixed(0)}%`, max: `${maxVal(hums).toFixed(0)}%`, ok: avg(hums) <= T.hum },
                ].map(row => (
                  <div key={row.name} className="p-5 hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
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
                      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-2 rounded-xl text-center flex flex-col items-center justify-center">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 mb-1">THRESHOLD</p>
                        <p className="text-xs font-black text-slate-600 dark:text-slate-300 font-mono">{row.threshold}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-2 rounded-xl text-center flex flex-col items-center justify-center">
                        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 mb-1">AVERAGE</p>
                        <p className="text-xs font-black font-mono" style={{ color: row.ok ? undefined : '#f87171' }}>{row.avg}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-2 rounded-xl text-center flex flex-col items-center justify-center">
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