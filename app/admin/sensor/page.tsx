"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Database, RefreshCw, AlertTriangle, ShieldAlert, ShieldCheck,
  TrendingUp, Thermometer, Droplets, Zap, Wind, Users, ChevronDown, X, Activity
} from 'lucide-react';

const T = { co2: 250, nh3: 30, voc: 70, temp: 32, hum: 80 };
const PER_PAGE = 20;

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
  created_at?: string;
  user_name?: string;
  user_email?: string;
}

interface UserOption { id: number; name: string; email: string; role?: string; }

export default function AdminSensorPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SensorRow[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasUserIdCol, setHasUserIdCol] = useState(false);

  const fetchData = useCallback(async (p = 1, uid?: number | null) => {
    setLoading(true);
    setDropdownOpen(false);
    try {
      const params = new URLSearchParams({ page: String(p), limit: String(PER_PAGE) });
      if (uid) params.set('user_id', String(uid));
      const res = await fetch(`/api/admin/sensor?${params}`);
      if (res.status === 403) { router.replace('/'); return; }
      const data = await res.json();
      setRows(data.rows || []);
      setStats(data.stats);
      setTotal(data.total || 0);
      setUsers(data.users || []);
      setHasUserIdCol(data.hasUserIdCol || false);
      setPage(p);
      setError('');
    } catch { setError('Gagal memuat data sensor.'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchData(1, null); }, [fetchData]);

  const handleSelectUser = (u: UserOption | null) => {
    setSelectedUser(u);
    fetchData(1, u?.id ?? null);
  };

  const totalPages = Math.ceil(total / PER_PAGE);
  const dangerCount = isNaN(Number(stats?.danger_count)) ? 0 : Number(stats?.danger_count);
  const co2Avg = Number(stats?.avg_co2 ?? 0);
  const nh3Avg = Number(stats?.avg_nh3 ?? 0);
  const tempAvg = Number(stats?.avg_temp ?? 0);
  const humAvg = Number(stats?.avg_hum ?? 0);
  const vocAvg = Number(stats?.avg_voc ?? 0);

  return (
    <div className="px-6 md:px-10 xl:px-12 pt-7 pb-8 space-y-6 w-full transition-colors duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Data Sensor</h1>
          <p className="text-slate-500 text-xs mt-1 font-mono">Seluruh rekaman dari perangkat ESP32</p>
        </div>
        <button onClick={() => fetchData(page, selectedUser?.id ?? null)} disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 text-[#1E293B] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {/* USER FILTER */}
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400 flex items-center gap-2">
          <Users size={12} /> Filter Per User:
        </p>

        {/* Dropdown */}
        <div className="relative">
          <button onClick={() => setDropdownOpen(o => !o)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all min-w-[200px] justify-between ${
              selectedUser
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300'
                : 'bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 border-[#E2E8F0] dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none'
            }`}>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold uppercase ${selectedUser ? 'bg-purple-500/30 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-[#FFFFFF]/10 text-[#1E293B] dark:text-slate-400'}`}>
                {selectedUser ? selectedUser.name.charAt(0) : '?'}
              </div>
              <span className="text-sm">{selectedUser ? selectedUser.name : 'Semua Pengguna'}</span>
            </div>
            <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 bg-[#FFFFFF] dark:bg-slate-900 border border-[#E2E8F0] dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {/* All users option */}
              <button onClick={() => handleSelectUser(null)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-[#F8F9FA] dark:hover:bg-[#FFFFFF]/5 ${!selectedUser ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#FFFFFF]/10 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center">
                  <Users size={14} className="text-slate-500 dark:text-slate-400" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">Semua Pengguna</p>
                  <p className="text-[10px] text-slate-500">{users.length} akun terdaftar</p>
                </div>
                {!selectedUser && <div className="ml-auto w-2 h-2 rounded-full bg-purple-400" />}
              </button>

              <div className="border-t border-slate-100 dark:border-white/5 max-h-60 overflow-y-auto">
                {users.map(u => (
                  <button key={u.id} onClick={() => handleSelectUser(u)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-[#F8F9FA] dark:hover:bg-[#FFFFFF]/5 ${selectedUser?.id === u.id ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-xs font-semibold text-[#1E293B] dark:text-slate-300 uppercase flex-shrink-0">
                      {u.name.charAt(0)}
                    </div>
                    <div className="text-left min-w-0">
                      <p className="font-bold text-sm capitalize truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{u.email}</p>
                    </div>
                    {selectedUser?.id === u.id && <div className="ml-auto w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active filter badge */}
        {selectedUser && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-[11px] font-black">
            Menampilkan: {selectedUser.name}
            <button onClick={() => handleSelectUser(null)} className="hover:text-purple-900 dark:hover:text-white transition-colors">
              <X size={12} />
            </button>
          </div>
        )}

        {!hasUserIdCol && (
          <span className="text-[10px] text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl font-bold">
            ⚠ Jalankan migrasi untuk filter per user
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Rekaman', value: total, color: '#8b5cf6', icon: Database },
          { label: 'Event Bahaya', value: dangerCount, color: '#ef4444', icon: ShieldAlert },
          { label: 'Event Aman', value: total - dangerCount, color: '#22c55e', icon: ShieldCheck },
          { label: 'Avg CO₂', value: `${co2Avg.toFixed(0)}`, color: '#3b82f6', icon: TrendingUp, unit: 'PPM' },
          { label: 'Avg Suhu', value: `${tempAvg.toFixed(1)}`, color: '#f97316', icon: Thermometer, unit: '°C' },
        ].map(s => (
          <div key={s.label} className="relative rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] p-4 overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none">
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full blur-xl opacity-20 pointer-events-none" style={{ background: s.color }} />
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${s.color}60,transparent)` }} />
            <div className="p-2 rounded-lg w-fit mb-3" style={{ background: `${s.color}15` }}>
              <s.icon size={13} style={{ color: s.color }} />
            </div>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-[#1E293B] dark:text-slate-400 mb-0.5">{s.label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{s.value}{(s as any).unit ? <span className="text-slate-500 text-xs font-normal ml-1">{(s as any).unit}</span> : null}</p>
          </div>
        ))}
      </div>

      {/* Avg row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Avg CO₂', value: co2Avg.toFixed(0), unit: 'PPM', icon: Zap, color: '#3b82f6' },
          { label: 'Avg NH₃', value: nh3Avg.toFixed(2), unit: 'PPM', icon: Wind, color: '#a78bfa' },
          { label: 'Avg VOC', value: vocAvg.toFixed(2), unit: 'PPM', icon: Activity, color: '#ec4899' },
          { label: 'Avg Suhu', value: tempAvg.toFixed(1), unit: '°C', icon: Thermometer, color: '#f97316' },
          { label: 'Avg Hum', value: humAvg.toFixed(0), unit: '%', icon: Droplets, color: '#38bdf8' },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 p-3.5 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.02] shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
              <s.icon size={14} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-widest text-[#1E293B] dark:text-slate-400">{s.label}</p>
              <p className="text-sm font-black text-slate-800 dark:text-white font-mono">{s.value} <span className="text-slate-500 font-normal text-xs">{s.unit}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold animate-shake">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center justify-between flex-wrap gap-3 bg-[#F8F9FA]/50 dark:bg-[#FFFFFF]/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/20 flex items-center justify-center">
              <Database size={15} className="text-blue-600 dark:text-blue-500 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400">
                {selectedUser ? `Sensor: ${selectedUser.name}` : 'Semua Rekaman Sensor'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{total} data • Halaman {page}/{totalPages || 1}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw size={22} className="text-blue-600 dark:text-blue-500 dark:text-blue-400 animate-spin" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E293B] dark:text-slate-400 animate-pulse">Memuat...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Database size={28} className="text-slate-300 dark:text-slate-600" />
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Tidak ada data</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.05]">
                    {['#', 'Waktu', ...(hasUserIdCol && !selectedUser ? ['User'] : []), 'CO₂', 'NH₃', 'VOC', 'Suhu', 'Hum', 'Status'].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                  {rows.map((row, i) => {
                    const t = row.temp ?? row.temperature ?? 0;
                    const h = row.hum ?? row.humidity ?? 0;
                    const danger = row.co2 > T.co2 || row.nh3 > T.nh3 || (row.voc || 0) > T.voc || t > T.temp;
                    return (
                      <tr key={row.id ?? i} className={`hover:bg-[#F8F9FA]/50 dark:hover:bg-[#FFFFFF]/[0.02] transition-colors ${danger ? 'bg-red-500/[0.03]' : ''}`}>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-600 font-mono text-xs">{(page - 1) * PER_PAGE + i + 1}</td>
                        <td className="px-5 py-3.5 text-slate-500 dark:text-slate-500 text-xs font-mono whitespace-nowrap">
                          {row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '—'}
                        </td>
                        {hasUserIdCol && !selectedUser && (
                          <td className="px-5 py-3.5">
                            {row.user_name ? (
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-[10px] font-semibold text-[#1E293B] dark:text-slate-300 uppercase flex-shrink-0">
                                  {row.user_name.charAt(0)}
                                </div>
                                <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold capitalize">{row.user_name}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 dark:text-slate-600 italic">Tidak ada</span>
                            )}
                          </td>
                        )}
                        <td className="px-5 py-3.5 font-black text-sm font-mono" style={{ color: row.co2 > T.co2 ? '#f87171' : '#64748b' }}>{row.co2?.toFixed(0)}</td>
                        <td className="px-5 py-3.5 font-black text-sm font-mono" style={{ color: row.nh3 > T.nh3 ? '#f87171' : '#64748b' }}>{row.nh3?.toFixed(2)}</td>
                        <td className="px-5 py-3.5 font-black text-sm font-mono" style={{ color: (row.voc || 0) > T.voc ? '#f87171' : '#64748b' }}>{(row.voc || 0).toFixed(2)}</td>
                        <td className="px-5 py-3.5 font-black text-sm font-mono" style={{ color: t > T.temp ? '#f87171' : '#64748b' }}>{t.toFixed(1)}</td>
                        <td className="px-5 py-3.5 font-black text-sm font-mono text-slate-400 dark:text-slate-400">{h.toFixed(0)}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border ${danger ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}`}>
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-white/[0.04]">
              {rows.map((row, i) => {
                const t = row.temp ?? row.temperature ?? 0;
                const h = row.hum ?? row.humidity ?? 0;
                const danger = row.co2 > T.co2 || row.nh3 > T.nh3 || (row.voc || 0) > T.voc || t > T.temp;
                return (
                  <div key={row.id ?? i} className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-slate-500 font-mono">{row.created_at ? new Date(row.created_at).toLocaleString('id-ID') : '—'}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${danger ? 'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20' : 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>{danger ? 'Danger' : 'Safe'}</span>
                    </div>
                    {hasUserIdCol && !selectedUser && row.user_name && (
                      <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mb-2 capitalize">👤 {row.user_name}</p>
                    )}
                    <div className="grid grid-cols-5 gap-2">
                      {[{ l: 'CO₂', v: `${row.co2?.toFixed(0)}`, over: row.co2 > T.co2 }, { l: 'NH₃', v: `${row.nh3?.toFixed(2)}`, over: row.nh3 > T.nh3 }, { l: 'VOC', v: `${(row.voc || 0).toFixed(2)}`, over: (row.voc || 0) > T.voc }, { l: 'Temp', v: `${t.toFixed(1)}°`, over: t > T.temp }, { l: 'Hum', v: `${h.toFixed(0)}%`, over: false }].map(s => (
                        <div key={s.l} className="bg-[#F8F9FA] dark:bg-[#FFFFFF]/[0.03] border border-slate-100 dark:border-white/5 p-2 rounded-xl text-center">
                          <p className="text-[9px] text-slate-400 dark:text-slate-600 font-black mb-0.5">{s.l}</p>
                          <p className={`text-xs font-black font-mono ${s.over ? 'text-red-600 dark:text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>{s.v}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-white/[0.05] flex items-center justify-between bg-[#F8F9FA]/25 dark:bg-[#FFFFFF]/[0.005]">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#1E293B] dark:text-slate-400">Hal {page} / {totalPages}</span>
                <div className="flex gap-2">
                  <button onClick={() => fetchData(page - 1, selectedUser?.id)} disabled={page === 1}
                    className="px-4 py-2 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 text-[#1E293B] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 text-xs font-semibold uppercase transition-all">← Prev</button>
                  <button onClick={() => fetchData(page + 1, selectedUser?.id)} disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-purple-500/20 bg-purple-500/10 text-purple-700 dark:text-purple-400 hover:bg-purple-500/20 disabled:opacity-30 text-xs font-black uppercase transition-all">Next →</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
