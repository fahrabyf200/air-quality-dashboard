"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft, Database, Activity, RefreshCw, AlertTriangle,
  ShieldAlert, ShieldCheck, Thermometer, Droplets, Zap, Wind,
  Clock, Crown, UserCircle, Calendar
} from 'lucide-react';

const DEFAULT_T = { co2: 800, nh3: 2, temp: 35, hum: 80 };

interface SensorRow {
  id?: number;
  co2: number;
  nh3: number;
  temp?: number;
  temperature?: number;
  hum?: number;
  humidity?: number;
  voc?: number;
  created_at?: string;
}

function timeAgo(d: string) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}d lalu`;
  if (s < 3600) return `${Math.floor(s / 60)}m lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)}j lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;

  const [T] = useState(DEFAULT_T);
  const [user, setUser] = useState<any>(null);
  const [sensor, setSensor] = useState<SensorRow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'sensor' | 'logs'>('sensor');
  const PER_PAGE = 20;

  const fetchData = useCallback(async (p = 1) => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}?page=${p}&limit=${PER_PAGE}`);
      if (res.status === 403) { router.replace('/admin'); return; }
      if (res.status === 404) { setError('User tidak ditemukan'); return; }
      const data = await res.json();
      setUser(data.user);
      setSensor(data.sensor || []);
      setStats(data.stats);
      setTotal(data.total || 0);
      setPage(p);
    } catch { setError('Gagal memuat data.'); }
    finally { setLoading(false); }
  }, [userId, router]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const totalPages = Math.ceil(total / PER_PAGE);
  const dangerCount = stats?.danger_count ?? 0;
  const safeCount = (stats?.total ?? 0) - dangerCount;

  if (loading && !user) return (
    <div className="p-8 flex items-center justify-center min-h-[50vh] gap-3">
      <RefreshCw size={20} className="text-purple-400 animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 animate-pulse">Memuat...</p>
    </div>
  );

  if (error && !user) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <AlertTriangle size={30} className="text-red-400" />
      <p className="text-red-400 font-bold text-sm">{error}</p>
      <button onClick={() => router.push('/admin/users')}
        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-sm font-bold border border-white/10">
        <ArrowLeft size={14} /> Kembali
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/admin/users')}
            className="w-10 h-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all">
            <ArrowLeft size={16} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center text-xl font-black text-slate-200 uppercase">
              {user?.name?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-xl font-black text-white capitalize">{user?.name}</h1>
              <p className="text-slate-500 text-xs font-mono">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                {user?.role === 'admin'
                  ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-purple-500/15 text-purple-400 border border-purple-500/25"><Crown size={9} /> Admin</span>
                  : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-black uppercase bg-white/5 text-slate-400 border border-white/10"><UserCircle size={9} /> User</span>}
                {user?.created_at && (
                  <span className="text-[9px] text-slate-600 font-mono flex items-center gap-1">
                    <Calendar size={9} /> {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => fetchData(page)} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white text-[11px] font-black uppercase tracking-wider disabled:opacity-50 transition-all">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Rekaman', value: stats?.total ?? 0, color: '#8b5cf6', icon: Database },
          { label: 'Event Bahaya', value: dangerCount, color: '#ef4444', icon: ShieldAlert },
          { label: 'Event Aman', value: safeCount, color: '#22c55e', icon: ShieldCheck },
          { label: 'Rasio Aman', value: stats?.total ? `${((safeCount / stats.total) * 100).toFixed(1)}%` : '—', color: '#f59e0b', icon: Activity },
        ].map(s => (
          <div key={s.label} className="relative rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full blur-xl opacity-20 pointer-events-none" style={{ background: s.color }} />
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${s.color}60,transparent)` }} />
            <div className="p-2 rounded-lg w-fit mb-3" style={{ background: `${s.color}15` }}>
              <s.icon size={13} style={{ color: s.color }} />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{s.label}</p>
            <p className="text-xl font-black text-white font-mono">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Sensor averages */}
      {stats && Number(stats.total) > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Avg CO₂', val: Number(stats.avg_co2).toFixed(0), max: Number(stats.max_co2).toFixed(0), unit: 'PPM', icon: Zap, color: '#3b82f6' },
            { label: 'Avg NH₃', val: Number(stats.avg_nh3).toFixed(2), max: Number(stats.max_nh3).toFixed(2), unit: 'PPM', icon: Wind, color: '#a78bfa' },
            { label: 'Avg Suhu', val: Number(stats.avg_temp).toFixed(1), max: Number(stats.max_temp).toFixed(1), unit: '°C', icon: Thermometer, color: '#f97316' },
            { label: 'Avg Hum', val: Number(stats.avg_hum).toFixed(0), max: '—', unit: '%', icon: Droplets, color: '#38bdf8' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl border border-white/[0.07] bg-white/[0.02]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <s.icon size={12} style={{ color: s.color }} />
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{s.label}</p>
              </div>
              <p className="text-base font-black text-white font-mono">{s.val} <span className="text-slate-500 text-xs font-normal">{s.unit}</span></p>
              <p className="text-[10px] text-slate-600 font-mono">Maks: {s.max} {s.unit}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.06]">
        {[
          { key: 'sensor', label: 'Data Sensor', icon: Database, count: total },
          { key: 'logs', label: 'Aktivitas Log', icon: Activity, count: total },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)}
            className={`flex items-center gap-2 px-5 py-3 text-[11px] font-black uppercase tracking-wider transition-all border-b-2 -mb-[1px] ${
              tab === t.key ? 'text-purple-400 border-purple-500' : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}>
            <t.icon size={13} /> {t.label}
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-white/10 font-mono">{t.count}</span>
          </button>
        ))}
      </div>

      {/* No data */}
      {!loading && sensor.length === 0 && (
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
            <Database size={24} className="text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-sm font-black text-slate-500 uppercase tracking-widest mb-2">Belum Ada Data Sensor</p>
            <p className="text-xs text-slate-600 mb-1">User ini belum memiliki rekaman sensor yang terhubung.</p>
            <p className="text-[10px] text-slate-700">Jalankan migrasi terlebih dahulu:</p>
            <code className="text-[10px] text-purple-400 bg-purple-500/10 px-3 py-1 rounded-lg mt-1 inline-block">node scripts/migrate.js</code>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <RefreshCw size={20} className="text-purple-400 animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 animate-pulse">Memuat...</p>
        </div>
      )}

      {/* DATA SENSOR TAB */}
      {!loading && sensor.length > 0 && tab === 'sensor' && (
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
                <Database size={15} className="text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Rekaman Sensor</p>
                <p className="text-xs text-slate-600 mt-0.5">{total} total • Hal {page}/{totalPages}</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-white/[0.05]">
                  {['#', 'Waktu', 'CO₂', 'NH₃', 'Suhu', 'Kelembapan', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {sensor.map((row, i) => {
                  const t = row.temp ?? row.temperature ?? 0;
                  const h = row.hum ?? row.humidity ?? 0;
                  const danger = row.co2 > T.co2 || row.nh3 > T.nh3 || t > T.temp;
                  return (
                    <tr key={row.id ?? i} className={`hover:bg-white/[0.02] transition-colors ${danger ? 'bg-red-500/[0.03]' : ''}`}>
                      <td className="px-5 py-3.5 text-slate-600 font-mono text-xs">{(page - 1) * PER_PAGE + i + 1}</td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs font-mono whitespace-nowrap">
                        {row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '—'}
                      </td>
                      <td className="px-5 py-3.5 font-black text-sm font-mono" style={{ color: row.co2 > T.co2 ? '#f87171' : '#94a3b8' }}>{row.co2?.toFixed(0)}</td>
                      <td className="px-5 py-3.5 font-black text-sm font-mono" style={{ color: row.nh3 > T.nh3 ? '#f87171' : '#94a3b8' }}>{row.nh3?.toFixed(2)}</td>
                      <td className="px-5 py-3.5 font-black text-sm font-mono" style={{ color: t > T.temp ? '#f87171' : '#94a3b8' }}>{t.toFixed(1)}</td>
                      <td className="px-5 py-3.5 font-black text-sm font-mono text-slate-400">{h.toFixed(0)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${danger ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${danger ? 'bg-red-500' : 'bg-emerald-500'}`} />
                          {danger ? 'Danger' : 'Safe'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-white/[0.04]">
            {sensor.map((row, i) => {
              const t = row.temp ?? row.temperature ?? 0;
              const h = row.hum ?? row.humidity ?? 0;
              const danger = row.co2 > T.co2 || row.nh3 > T.nh3 || t > T.temp;
              return (
                <div key={row.id ?? i} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-slate-500 font-mono">{row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '—'}</span>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${danger ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                      {danger ? 'Danger' : 'Safe'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[{ l: 'CO₂', v: `${row.co2?.toFixed(0)}`, over: row.co2 > T.co2 }, { l: 'NH₃', v: `${row.nh3?.toFixed(2)}`, over: row.nh3 > T.nh3 }, { l: 'Temp', v: `${t.toFixed(1)}°`, over: t > T.temp }, { l: 'Hum', v: `${h.toFixed(0)}%`, over: false }].map(s => (
                      <div key={s.l} className="bg-white/[0.03] border border-white/5 p-2 rounded-xl text-center">
                        <p className="text-[9px] text-slate-600 font-black mb-0.5">{s.l}</p>
                        <p className={`text-xs font-black font-mono ${s.over ? 'text-red-400' : 'text-slate-300'}`}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/[0.05] flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Hal {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => fetchData(page - 1)} disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 text-xs font-black uppercase">← Prev</button>
                <button onClick={() => fetchData(page + 1)} disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-30 text-xs font-black uppercase">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ACTIVITY LOG TAB */}
      {!loading && sensor.length > 0 && tab === 'logs' && (
        <div className="rounded-3xl border border-white/[0.07] bg-white/[0.03] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/[0.05] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <Activity size={15} className="text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Timeline Aktivitas</p>
              <p className="text-xs text-slate-600 mt-0.5">{sensor.length} event</p>
            </div>
          </div>

          <div className="divide-y divide-white/[0.03] max-h-[600px] overflow-y-auto">
            {sensor.map((row, i) => {
              const t = row.temp ?? row.temperature ?? 0;
              const h = row.hum ?? row.humidity ?? 0;
              const danger = row.co2 > T.co2 || row.nh3 > T.nh3 || t > T.temp;
              return (
                <div key={row.id ?? i} className="px-6 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${danger ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                      {danger ? <ShieldAlert size={15} className="text-red-400" /> : <ShieldCheck size={15} className="text-emerald-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className={`text-sm font-black ${danger ? 'text-red-400' : 'text-emerald-400'}`}>
                            {danger ? `Peringatan ${row.co2 > T.co2 ? 'CO₂' : row.nh3 > T.nh3 ? 'NH₃' : 'Suhu'}` : 'Kondisi Normal'}
                          </p>
                          <div className="flex items-center gap-1.5 text-slate-600 mt-0.5">
                            <Clock size={10} />
                            <span className="text-[10px] font-mono">
                              {row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '—'}
                              {row.created_at && <span className="ml-2 text-slate-700">({timeAgo(row.created_at)})</span>}
                            </span>
                          </div>
                        </div>
                        {row.id && <span className="text-[9px] text-slate-700 font-mono bg-white/5 px-2 py-1 rounded border border-white/5">#{row.id}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { icon: Zap, label: 'CO₂', value: `${row.co2?.toFixed(0)} PPM`, over: row.co2 > T.co2 },
                          { icon: Wind, label: 'NH₃', value: `${row.nh3?.toFixed(2)} PPM`, over: row.nh3 > T.nh3 },
                          { icon: Thermometer, label: 'Suhu', value: `${t.toFixed(1)}°C`, over: t > T.temp },
                          { icon: Droplets, label: 'Hum', value: `${h.toFixed(0)}%`, over: false },
                        ].map(s => (
                          <div key={s.label} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold ${s.over ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-white/[0.04] border-white/[0.06] text-slate-400'}`}>
                            <s.icon size={10} />
                            <span className="text-slate-500">{s.label}:</span>
                            <span className="font-mono">{s.value}</span>
                            {s.over && <AlertTriangle size={9} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-white/[0.05] flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Hal {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => fetchData(page - 1)} disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white disabled:opacity-30 text-xs font-black uppercase">← Prev</button>
                <button onClick={() => fetchData(page + 1)} disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 disabled:opacity-30 text-xs font-black uppercase">Next →</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
