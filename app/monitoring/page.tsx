"use client";
import React, { useEffect, useState, useCallback } from 'react';
import { Activity, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const T = { co2: 800, nh3: 2, temp: 35, hum: 80 };

interface SensorRow {
  id?: number;
  co2: number;
  nh3: number;
  temp?: number;
  temperature?: number;
  hum?: number;
  humidity?: number;
  voc?: number;
  is_unhealthy?: number;
  dominant_pollutant?: string;
  created_at?: string;
  timestamp?: string;
}

function StatusDot({ danger }: { danger: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-colors ${
        danger
          ? 'bg-red-500/10 text-red-500 dark:text-red-400 border-red-500/20'
          : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
      }`}
    >
      {danger ? <AlertTriangle size={9} /> : <CheckCircle size={9} />}
      {danger ? 'DANGER' : 'SAFE'}
    </span>
  );
}

function NumCell({ v, threshold, digits = 1 }: { v: number; threshold: number; digits?: number }) {
  const over = v > threshold;
  return (
    <span
      className={`font-bold tabular-nums text-sm transition-colors ${
        over ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
      }`}
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {v?.toFixed(digits)}
    </span>
  );
}

const PER_PAGE = 25;

export default function MonitoringPage() {
  const [rows, setRows] = useState<SensorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sensor');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setRows(Array.isArray(json) ? json : [json]);
      setError('');
    } catch (e: any) {
      setError('Gagal memuat data dari API sensor.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const totalPages = Math.ceil(rows.length / PER_PAGE);
  const paged = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const dangerCount = rows.filter(r => {
    const t = r.temp ?? r.temperature ?? 0;
    return r.co2 > T.co2 || r.nh3 > T.nh3 || t > T.temp;
  }).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Data Monitoring
          </h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest mt-0.5">
            Real-time Sensor Log • Kitchen Node
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="px-6 md:px-10 pt-6 space-y-5 max-w-7xl mx-auto">
        {/* Summary bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Records', value: rows.length, colorClass: 'text-blue-600 dark:text-blue-400' },
            { label: 'Danger Events', value: dangerCount, colorClass: 'text-red-600 dark:text-red-400' },
            { label: 'Safe Events', value: rows.length - dangerCount, colorClass: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Latest', value: rows[0]?.created_at ? new Date(rows[0].created_at).toLocaleTimeString('id-ID') : '--', colorClass: 'text-purple-600 dark:text-purple-400' },
          ].map(s => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 px-5 py-4 transition-colors"
            >
              <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-1.5">{s.label}</p>
              <p
                className={`text-2xl font-black tabular-nums ${s.colorClass}`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {s.value}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-red-600 dark:text-red-400 text-sm font-bold">
            ⚠ {error}
          </div>
        )}

        {/* Table Container */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 overflow-hidden transition-colors">
          <div className="px-6 py-3.5 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity size={13} className="text-blue-500 dark:text-blue-400" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-[0.25em]">
                Sensor Log — {rows.length} Records
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading sensor data...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800/50">
                    {['#', 'Timestamp', 'CO₂ (PPM)', 'NH₃ (PPM)', 'Temp (°C)', 'Hum (%)', 'VOC', 'Status'].map(h => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.25em] whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/30">
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-14 text-slate-400 text-sm font-bold uppercase tracking-widest">
                        No sensor data available
                      </td>
                    </tr>
                  ) : paged.map((row, i) => {
                    const t = row.temp ?? row.temperature ?? 0;
                    const h = row.hum ?? row.humidity ?? 0;
                    const isDanger = row.co2 > T.co2 || row.nh3 > T.nh3 || t > T.temp;
                    const ts = row.created_at ?? row.timestamp;
                    return (
                      <tr
                        key={row.id ?? i}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors ${
                          isDanger ? 'bg-red-50/30 dark:bg-red-500/5' : ''
                        }`}
                      >
                        <td className="px-5 py-3.5 text-slate-300 dark:text-slate-700 font-mono text-xs">
                          {(page - 1) * PER_PAGE + i + 1}
                        </td>
                        <td
                          className="px-5 py-3.5 text-slate-500 dark:text-slate-500 text-xs whitespace-nowrap"
                          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                        >
                          {ts ? new Date(ts).toLocaleString('id-ID') : '—'}
                        </td>
                        <td className="px-5 py-3.5"><NumCell v={row.co2} threshold={T.co2} digits={0} /></td>
                        <td className="px-5 py-3.5"><NumCell v={row.nh3} threshold={T.nh3} digits={2} /></td>
                        <td className="px-5 py-3.5"><NumCell v={t} threshold={T.temp} /></td>
                        <td className="px-5 py-3.5"><NumCell v={h} threshold={T.hum} digits={0} /></td>
                        <td className="px-5 py-3.5 font-mono text-xs text-slate-400 dark:text-slate-600">
                            {row.voc?.toFixed(2) ?? '—'}
                        </td>
                        <td className="px-5 py-3.5"><StatusDot danger={isDanger} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between bg-slate-50/50 dark:bg-transparent">
              <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest">
                Page {page} / {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 transition-all"
                >
                  ← Prev
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 disabled:opacity-30 transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}