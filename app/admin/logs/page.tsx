"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Activity, RefreshCw, AlertTriangle, ShieldAlert, ShieldCheck,
  Clock, Zap, Wind, Thermometer, Droplets, Database,
  Users, ChevronDown, X, LogIn, LogOut, UserPlus, Settings,
  CreditCard, Cpu, Pencil, Key, Trash2, PackagePlus, UserCheck
} from 'lucide-react';
import { useLanguage } from '@/app/hooks/useLanguage';

const T = { co2: 250, nh3: 30, voc: 70, temp: 32, hum: 80 };

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
  user_name?: string;
  user_email?: string;
}

interface ActivityLog {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  description: string | null;
  ip_address: string | null;
  created_at: string;
}

interface UserOption { id: number; name: string; email: string; }

function timeAgo(d: string, t: any) {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 60) return `${Math.floor(s)}${t('d lalu', 'd ago')}`;
  if (s < 3600) return `${Math.floor(s / 60)}${t('m lalu', 'm ago')}`;
  if (s < 86400) return `${Math.floor(s / 3600)}${t('j lalu', 'h ago')}`;
  return `${Math.floor(s / 86400)} ${t('hari lalu', 'days ago')}`;
}

function getActionIcon(action: string) {
  switch (action) {
    case 'login': return LogIn;
    case 'logout': return LogOut;
    case 'register': return UserPlus;
    case 'edit_profile': return Pencil;
    case 'change_password': return Key;
    case 'add_device': return Cpu;
    case 'delete_device': return Trash2;
    case 'add_employee': return UserCheck;
    case 'transaction': return CreditCard;
    case 'delete_transaction': return Trash2;
    case 'delete_user': return Trash2;
    case 'update_role': return Settings;
    case 'activate_subscription': return PackagePlus;
    default: return Activity;
  }
}

function getActionColor(action: string) {
  switch (action) {
    case 'login': case 'register': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' };
    case 'logout': return { bg: 'bg-slate-500/10', border: 'border-slate-500/20', text: 'text-slate-600 dark:text-slate-400' };
    case 'delete_user': case 'delete_device': case 'delete_transaction': return { bg: 'bg-red-500/10', border: 'border-red-500/20', text: 'text-red-600 dark:text-red-400' };
    case 'transaction': case 'activate_subscription': return { bg: 'bg-[#4edea3]/10', border: 'border-[#4edea3]/20', text: 'text-emerald-700 dark:text-[#4edea3]' };
    case 'add_device': case 'add_employee': return { bg: 'bg-blue-500/10', border: 'border-blue-500/20', text: 'text-blue-600 dark:text-blue-400' };
    default: return { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-600 dark:text-purple-400' };
  }
}

function getActionLabel(action: string, t: any) {
  const labels: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    register: t('Registrasi', 'Register'),
    edit_profile: t('Edit Profil', 'Edit Profile'),
    change_password: t('Ubah Password', 'Change Password'),
    add_device: t('Tambah Alat', 'Add Device'),
    delete_device: t('Hapus Alat', 'Delete Device'),
    add_employee: t('Tambah Pegawai', 'Add Employee'),
    transaction: t('Transaksi', 'Transaction'),
    delete_transaction: t('Hapus Transaksi', 'Delete Transaction'),
    delete_user: t('Hapus User', 'Delete User'),
    update_role: t('Ubah Role', 'Update Role'),
    activate_subscription: t('Aktifkan Langganan', 'Activate Subscription'),
  };
  return labels[action] || action;
}

export default function AdminLogsPage() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'sensor' | 'activity'>('activity');

  // Sensor Log state
  const [rows, setRows] = useState<SensorRow[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [total, setTotal] = useState(0);
  const [sensorLoading, setSensorLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserOption | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [hasUserIdCol, setHasUserIdCol] = useState(false);
  const [filter, setFilter] = useState<'all' | 'danger' | 'safe'>('all');

  // Activity Log state
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [activityActions, setActivityActions] = useState<string[]>([]);

  const fetchSensorData = useCallback(async (uid?: number | null) => {
    setSensorLoading(true);
    setDropdownOpen(false);
    try {
      const params = new URLSearchParams({ limit: '100' });
      if (uid) params.set('user_id', String(uid));
      const res = await fetch(`/api/admin/sensor?${params}`);
      if (res.status === 403) { router.replace('/'); return; }
      const data = await res.json();
      setRows(data.rows || []);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setHasUserIdCol(data.hasUserIdCol || false);
    } catch { }
    finally { setSensorLoading(false); }
  }, [router]);

  const fetchActivityLogs = useCallback(async () => {
    setActivityLoading(true);
    try {
      const params = new URLSearchParams({ limit: '200' });
      if (activityFilter !== 'all') params.set('action', activityFilter);
      const res = await fetch(`/api/admin/activity-logs?${params}`);
      if (res.status === 403) { router.replace('/'); return; }
      const data = await res.json();
      setActivityLogs(data.logs || []);
      setActivityActions(data.actions || []);
    } catch { }
    finally { setActivityLoading(false); }
  }, [router, activityFilter]);

  useEffect(() => { fetchSensorData(null); }, [fetchSensorData]);
  useEffect(() => { fetchActivityLogs(); }, [fetchActivityLogs]);

  const handleSelectUser = (u: UserOption | null) => {
    setSelectedUser(u);
    fetchSensorData(u?.id ?? null);
  };

  const isDanger = (r: SensorRow) => {
    const t = r.temp ?? r.temperature ?? 0;
    return r.co2 > T.co2 || r.nh3 > T.nh3 || (r.voc || 0) > T.voc || t > T.temp;
  };

  const filtered = rows.filter(r => {
    if (filter === 'danger') return isDanger(r);
    if (filter === 'safe') return !isDanger(r);
    return true;
  });

  const dangerRows = rows.filter(isDanger);
  const safeRows = rows.filter(r => !isDanger(r));
  const dangerRate = rows.length ? ((dangerRows.length / rows.length) * 100).toFixed(1) : '0';

  return (
    <div className="px-6 md:px-10 xl:px-12 pt-7 pb-8 space-y-6 w-full transition-colors duration-300">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{t('Sistem Log', 'System Logs')}</h1>
          <p className="text-slate-500 text-xs mt-1 font-mono">{t('Riwayat aktivitas pengguna dan data sensor', 'User activity history and sensor data')}</p>
        </div>
        <button
          onClick={() => activeTab === 'sensor' ? fetchSensorData(selectedUser?.id ?? null) : fetchActivityLogs()}
          disabled={activeTab === 'sensor' ? sensorLoading : activityLoading}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 text-[#1E293B] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
        >
          <RefreshCw size={12} className={(activeTab === 'sensor' ? sensorLoading : activityLoading) ? 'animate-spin' : ''} /> {t('Refresh', 'Refresh')}
        </button>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2">
        {[
          { key: 'activity', label: t('Aktivitas User', 'User Activity'), icon: Activity, count: activityLogs.length },
          { key: 'sensor', label: t('Log Sensor', 'Sensor Log'), icon: Database, count: rows.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border ${
              activeTab === tab.key
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300'
                : 'bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 border-[#E2E8F0] dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:dark:text-slate-300'
            }`}
          >
            <tab.icon size={12} />
            {tab.label}
            <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#FFFFFF]/10">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ============ ACTIVITY LOG TAB ============ */}
      {activeTab === 'activity' && (
        <>
          {/* Activity Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActivityFilter('all')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                activityFilter === 'all'
                  ? 'bg-purple-500/20 border-purple-500/30 text-purple-700 dark:text-purple-400'
                  : 'bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 border-[#E2E8F0] dark:border-white/10 text-slate-500 hover:text-slate-700'
              }`}
            >
              {t('Semua', 'All')} ({activityLogs.length})
            </button>
            {activityActions.map(action => (
              <button
                key={action}
                onClick={() => setActivityFilter(action)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
                  activityFilter === action
                    ? 'bg-purple-500/20 border-purple-500/30 text-purple-700 dark:text-purple-400'
                    : 'bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 border-[#E2E8F0] dark:border-white/10 text-slate-500 hover:text-slate-700'
                }`}
              >
                {getActionLabel(action, t)}
              </button>
            ))}
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center gap-3 bg-[#F8F9FA]/50 dark:bg-[#FFFFFF]/[0.01]">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                <Activity size={15} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400">{t('Timeline Aktivitas Pengguna', 'User Activity Timeline')}</p>
                <p className="text-xs text-slate-500 mt-0.5">{activityLogs.length} {t('aktivitas tercatat', 'activities recorded')}</p>
              </div>
            </div>

            {activityLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw size={22} className="text-purple-600 dark:text-purple-400 animate-spin" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E293B] dark:text-slate-400 animate-pulse">{t('Memuat log aktivitas...', 'Loading activity log...')}</p>
              </div>
            ) : activityLogs.length === 0 ? (
              <div className="text-center py-20">
                <Activity size={28} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest">{t('Belum ada aktivitas tercatat', 'No activities recorded yet')}</p>
                <p className="text-slate-400 text-xs mt-1">{t('Log akan muncul setelah ada aksi dari pengguna', 'Logs will appear once actions are performed by users')}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/[0.03] max-h-[640px] overflow-y-auto">
                {activityLogs.map((log) => {
                  const ActionIcon = getActionIcon(log.action);
                  const colors = getActionColor(log.action);
                  return (
                    <div key={log.id} className="px-6 py-4 hover:bg-[#F8F9FA]/50 dark:hover:bg-[#FFFFFF]/[0.02] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${colors.bg} ${colors.border}`}>
                          <ActionIcon size={14} className={colors.text} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${colors.bg} ${colors.border} ${colors.text}`}>
                                  {getActionLabel(log.action, t)}
                                </span>
                                {log.user_name && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10">
                                    👤 {log.user_name}
                                  </span>
                                )}
                              </div>
                              {log.description && (
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{log.description}</p>
                              )}
                              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-600 mt-1">
                                <Clock size={9} />
                                <span className="text-[9px] font-mono">
                                  {log.created_at ? new Date(log.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US') : '—'}
                                  {log.created_at && <span className="ml-2 text-slate-500 dark:text-slate-700">({timeAgo(log.created_at, t)})</span>}
                                </span>
                                {log.ip_address && (
                                  <span className="text-[9px] font-mono text-slate-400 ml-2">· IP: {log.ip_address}</span>
                                )}
                              </div>
                            </div>
                            <span className="text-[9px] text-slate-500 dark:text-slate-700 font-mono bg-[#F8F9FA] dark:bg-[#FFFFFF]/5 px-2 py-1 rounded border border-slate-100 dark:border-white/5 flex-shrink-0">#{log.id}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}

      {/* ============ SENSOR LOG TAB ============ */}
      {activeTab === 'sensor' && (
        <>
          {/* USER FILTER */}
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400 flex items-center gap-2">
              <Users size={12} /> {t('Filter Per User:', 'Filter By User:')}
            </p>

            <div className="relative">
              <button onClick={() => setDropdownOpen(o => !o)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all min-w-[200px] justify-between ${
                  selectedUser ? 'bg-purple-500/15 border-purple-500/30 text-purple-700 dark:text-purple-300' : 'bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 border-[#E2E8F0] dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none'
                }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold uppercase ${selectedUser ? 'bg-purple-500/30 text-purple-700 dark:text-purple-300' : 'bg-slate-100 dark:bg-[#FFFFFF]/10 text-[#1E293B] dark:text-slate-400'}`}>
                    {selectedUser ? selectedUser.name.charAt(0) : '?'}
                  </div>
                  <span>{selectedUser ? selectedUser.name : t('Semua Pengguna', 'All Users')}</span>
                </div>
                <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-[#FFFFFF] dark:bg-slate-900 border border-[#E2E8F0] dark:border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <button onClick={() => handleSelectUser(null)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-[#F8F9FA] dark:hover:bg-[#FFFFFF]/5 ${!selectedUser ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300' : 'text-slate-700 dark:text-slate-300'}`}>
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#FFFFFF]/10 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center">
                      <Users size={14} className="text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold">{t('Semua Pengguna', 'All Users')}</p>
                      <p className="text-[10px] text-slate-500">{users.length} {t('akun', 'accounts')}</p>
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
                          <p className="font-bold capitalize truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-500 font-mono truncate">{u.email}</p>
                        </div>
                        {selectedUser?.id === u.id && <div className="ml-auto w-2 h-2 rounded-full bg-purple-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {selectedUser && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-400 text-[11px] font-black">
                Log: {selectedUser.name}
                <button onClick={() => handleSelectUser(null)} className="hover:text-purple-900 dark:hover:text-white transition-colors">
                  <X size={12} />
                </button>
              </div>
            )}

            {!hasUserIdCol && (
              <span className="text-[10px] text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-xl font-bold">
                ⚠ {t('Jalankan migrasi untuk filter per user', 'Run migrations to filter by user')}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('Total Log', 'Total Logs'), value: rows.length, color: '#8b5cf6', icon: Database },
              { label: t('Event Bahaya', 'Danger Events'), value: dangerRows.length, color: '#ef4444', icon: AlertTriangle },
              { label: t('Event Aman', 'Safe Events'), value: safeRows.length, color: '#22c55e', icon: ShieldCheck },
              { label: t('Rasio Bahaya', 'Danger Ratio'), value: `${dangerRate}%`, color: '#f59e0b', icon: Activity },
            ].map(s => (
              <div key={s.label} className="relative rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] p-4 overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none">
                <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full blur-xl opacity-20 pointer-events-none" style={{ background: s.color }} />
                <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg,transparent,${s.color}60,transparent)` }} />
                <div className="p-2 rounded-lg w-fit mb-3" style={{ background: `${s.color}15` }}>
                  <s.icon size={13} style={{ color: s.color }} />
                </div>
                <p className="text-[9px] font-semibold uppercase tracking-widest text-[#1E293B] dark:text-slate-400 mb-0.5">{s.label}</p>
                <p className="text-xl font-black text-slate-900 dark:text-white font-mono">{sensorLoading ? '—' : s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2">
            {[
              { key: 'all', label: t('Semua', 'All'), count: rows.length },
              { key: 'danger', label: t('Bahaya', 'Danger'), count: dangerRows.length },
              { key: 'safe', label: t('Aman', 'Safe'), count: safeRows.length },
            ].map(f => (
              <button key={f.key} onClick={() => setFilter(f.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all ${
                  filter === f.key
                    ? f.key === 'danger' ? 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30'
                      : f.key === 'safe' ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-purple-500/20 text-purple-700 dark:text-purple-400 border border-purple-500/30'
                    : 'bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 text-slate-500 dark:text-slate-400 border border-[#E2E8F0] dark:border-white/10 hover:text-slate-900 hover:dark:text-slate-300 hover:bg-[#F8F9FA] hover:dark:bg-[#FFFFFF]/[0.07]'
                }`}>
                {f.label}
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-[#FFFFFF]/10">{f.count}</span>
              </button>
            ))}
          </div>

          {/* Sensor Timeline */}
          <div className="rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center gap-3 bg-[#F8F9FA]/50 dark:bg-[#FFFFFF]/[0.01]">
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
                <Activity size={15} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400">
                  {selectedUser ? `Log: ${selectedUser.name}` : t('Timeline Sensor Semua Pengguna', 'All Users Sensor Timeline')}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">{filtered.length} {t('log sensor', 'sensor logs')}</p>
              </div>
            </div>

            {sensorLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw size={22} className="text-purple-600 dark:text-purple-400 animate-spin" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#1E293B] dark:text-slate-400 animate-pulse">{t('Memuat log sensor...', 'Loading sensor logs...')}</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-sm font-semibold uppercase tracking-widest">
                {t('Tidak ada log sensor', 'No sensor logs')}
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-white/[0.03] max-h-[640px] overflow-y-auto">
                {filtered.map((row, i) => {
                  const tVal = row.temp ?? row.temperature ?? 0;
                  const h = row.hum ?? row.humidity ?? 0;
                  const danger = isDanger(row);

                  return (
                    <div key={row.id ?? i} className="px-6 py-4 hover:bg-[#F8F9FA]/50 dark:hover:bg-[#FFFFFF]/[0.02] transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${danger ? 'bg-red-500/10 border-red-500/20' : 'bg-emerald-500/10 border-emerald-500/20'}`}>
                          {danger ? <ShieldAlert size={15} className="text-red-600 dark:text-red-400" /> : <ShieldCheck size={15} className="text-emerald-600 dark:text-emerald-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className={`text-sm font-black ${danger ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                  {danger ? `${t('Peringatan', 'Warning')} ${row.co2 > T.co2 ? 'CO₂' : row.nh3 > T.nh3 ? 'NH₃' : (row.voc || 0) > T.voc ? 'VOC' : t('Suhu', 'Temp')}` : t('Kondisi Normal', 'Normal Condition')}
                                </p>
                                {hasUserIdCol && !selectedUser && row.user_name && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20 uppercase tracking-wider">
                                    👤 {row.user_name}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-600 mt-0.5">
                                <Clock size={10} />
                                <span className="text-[10px] font-mono">
                                  {row.created_at ? new Date(row.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US') : '—'}
                                  {row.created_at && <span className="ml-2 text-slate-500 dark:text-slate-700">({timeAgo(row.created_at, t)})</span>}
                                </span>
                              </div>
                            </div>
                            {row.id && <span className="text-[9px] text-slate-500 dark:text-slate-700 font-mono bg-[#F8F9FA] dark:bg-[#FFFFFF]/5 px-2 py-1 rounded border border-slate-100 dark:border-white/5 flex-shrink-0">#{row.id}</span>}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { icon: Zap, label: 'CO₂', value: `${row.co2?.toFixed(0)} PPM`, over: row.co2 > T.co2 },
                              { icon: Wind, label: 'NH₃', value: `${row.nh3?.toFixed(2)} PPM`, over: row.nh3 > T.nh3 },
                              { icon: Activity, label: 'VOC', value: `${(row.voc || 0).toFixed(2)} PPM`, over: (row.voc || 0) > T.voc },
                              { icon: Thermometer, label: t('Suhu', 'Temp'), value: `${tVal.toFixed(1)}°C`, over: tVal > T.temp },
                              { icon: Droplets, label: t('Hum', 'Hum'), value: `${h.toFixed(0)}%`, over: false },
                            ].map(s => (
                              <div key={s.label} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold ${s.over ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400' : 'bg-[#F8F9FA] dark:bg-[#FFFFFF]/[0.04] border-slate-150 dark:border-white/[0.06] text-slate-500 dark:text-slate-400'}`}>
                                <s.icon size={10} />
                                <span className="text-slate-400 dark:text-slate-500">{s.label}:</span>
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
            )}
          </div>
        </>
      )}
    </div>
  );
}
