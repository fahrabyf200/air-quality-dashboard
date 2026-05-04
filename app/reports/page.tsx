"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { FileBarChart, RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const T = { co2: 800, nh3: 2, temp: 35, hum: 80 };

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
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1425] border border-slate-700/60 rounded-xl px-4 py-3 text-xs shadow-2xl">
      <p className="text-slate-500 font-bold mb-1 uppercase tracking-wider">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.fill }} className="font-bold">
          {p.name}: <span className="text-white">{p.value?.toFixed(1)}</span>
        </p>
      ))}
    </div>
  );
};

export default function ReportsPage() {
  const [rows, setRows] = useState<SensorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    { label: 'Avg CO₂', value: avg(co2s).toFixed(0), unit: 'PPM', color: '#3b82f6', danger: avg(co2s) > T.co2 },
    { label: 'Max CO₂', value: maxVal(co2s).toFixed(0), unit: 'PPM', color: '#60a5fa', danger: maxVal(co2s) > T.co2 },
    { label: 'Avg NH₃', value: avg(nh3s).toFixed(2), unit: 'PPM', color: '#f59e0b', danger: avg(nh3s) > T.nh3 },
    { label: 'Max NH₃', value: maxVal(nh3s).toFixed(2), unit: 'PPM', color: '#fbbf24', danger: maxVal(nh3s) > T.nh3 },
    { label: 'Avg Temp', value: avg(temps).toFixed(1), unit: '°C', color: '#ef4444', danger: avg(temps) > T.temp },
    { label: 'Avg Humidity', value: avg(hums).toFixed(0), unit: '%', color: '#8b5cf6', danger: avg(hums) > T.hum },
    { label: 'Safe Rate', value: safeRate, unit: '%', color: '#4ade80', danger: Number(safeRate) < 80 },
    { label: 'Total Records', value: rows.length.toString(), unit: 'entries', color: '#94a3b8', danger: false },
  ];

  // Hourly aggregation for bar chart
  const hourlyMap: Record<string, { co2: number[]; temp: number[] }> = {};
  rows.forEach(r => {
    const ts = r.created_at ?? r.timestamp;
    if (!ts) return;
    const hour = new Date(ts).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    if (!hourlyMap[hour]) hourlyMap[hour] = { co2: [], temp: [] };
    hourlyMap[hour].co2.push(r.co2);
    hourlyMap[hour].temp.push(r.temp ?? r.temperature ?? 0);
  });

  const chartData = Object.entries(hourlyMap)
    .slice(-15)
    .map(([time, d]) => ({
      time,
      'Avg CO₂': avg(d.co2),
      'Avg Temp': avg(d.temp),
    }));

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800/60 px-6 md:px-10 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-black text-white tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Reports
          </h1>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
            Ringkasan Statistik Sensor
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="px-6 md:px-10 pt-6 max-w-7xl mx-auto space-y-5">
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-400 text-sm font-bold">
            ⚠ {error}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            <p className="text-slate-600 text-xs font-bold uppercase tracking-widest">Loading report data...</p>
          </div>
        ) : (
          <>
            {/* Summary grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {summaryStats.map(s => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-slate-800/60 bg-slate-900/30 px-5 py-4 hover:bg-slate-800/20 transition-all"
                >
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">{s.label}</p>
                  <div className="flex items-baseline gap-1">
                    <span
                      className="text-2xl font-black tabular-nums"
                      style={{
                        color: s.danger ? '#f87171' : s.color,
                        fontFamily: "'IBM Plex Mono', monospace",
                      }}
                    >
                      {s.value}
                    </span>
                    <span className="text-slate-600 text-xs font-bold">{s.unit}</span>
                  </div>
                  <div
                    className="mt-2 text-[9px] font-black uppercase tracking-widest"
                    style={{ color: s.danger ? '#f87171' : '#4ade80' }}
                  >
                    {s.danger ? '⚠ Above threshold' : '✓ Normal'}
                  </div>
                </div>
              ))}
            </div>

            {/* Bar Chart */}
            {chartData.length > 0 && (
              <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden">
                <div className="px-6 py-3.5 border-b border-slate-800/50 flex items-center gap-2">
                  <FileBarChart size={13} className="text-blue-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
                    CO₂ & Temperature per Time Period
                  </span>
                </div>
                <div className="p-6 h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                      <XAxis
                        dataKey="time"
                        stroke="#334155"
                        fontSize={9}
                        tickMargin={10}
                        axisLine={false}
                        tickLine={false}
                        style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                      />
                      <YAxis stroke="#334155" fontSize={9} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="Avg CO₂" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry['Avg CO₂'] > T.co2 ? '#f87171' : '#3b82f6'}
                            opacity={0.85}
                          />
                        ))}
                      </Bar>
                      <Bar dataKey="Avg Temp" fill="#f97316" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry['Avg Temp'] > T.temp ? '#ef4444' : '#f97316'}
                            opacity={0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Threshold reference table */}
            <div className="rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden">
              <div className="px-6 py-3.5 border-b border-slate-800/50">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                  Kitchen Threshold Reference
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-800/40">
                      {['Parameter', 'Threshold', 'Dataset Average', 'Dataset Max', 'Status'].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.25em]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'CO₂', threshold: `${T.co2} PPM`, avg: `${avg(co2s).toFixed(0)} PPM`, max: `${maxVal(co2s).toFixed(0)} PPM`, ok: avg(co2s) <= T.co2 },
                      { name: 'NH₃', threshold: `${T.nh3} PPM`, avg: `${avg(nh3s).toFixed(2)} PPM`, max: `${maxVal(nh3s).toFixed(2)} PPM`, ok: avg(nh3s) <= T.nh3 },
                      { name: 'Temperature', threshold: `${T.temp}°C`, avg: `${avg(temps).toFixed(1)}°C`, max: `${maxVal(temps).toFixed(1)}°C`, ok: avg(temps) <= T.temp },
                      { name: 'Humidity', threshold: `${T.hum}%`, avg: `${avg(hums).toFixed(0)}%`, max: `${maxVal(hums).toFixed(0)}%`, ok: avg(hums) <= T.hum },
                    ].map(row => (
                      <tr key={row.name} className="border-b border-slate-800/30 hover:bg-slate-800/20 transition-colors">
                        <td className="px-5 py-3.5 text-slate-300 font-bold text-xs">{row.name}</td>
                        <td className="px-5 py-3.5 text-slate-500 text-xs font-mono" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{row.threshold}</td>
                        <td className="px-5 py-3.5 font-bold text-xs font-mono" style={{ color: row.ok ? '#94a3b8' : '#f87171', fontFamily: "'IBM Plex Mono', monospace" }}>{row.avg}</td>
                        <td className="px-5 py-3.5 font-bold text-xs font-mono" style={{ color: row.ok ? '#94a3b8' : '#fca5a5', fontFamily: "'IBM Plex Mono', monospace" }}>{row.max}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                            row.ok
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {row.ok ? '✓ Normal' : '⚠ Exceeded'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}