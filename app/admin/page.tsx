"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, ShieldCheck, ShieldAlert, Database,
  Activity, Trash2, Crown, UserCircle,
  RefreshCw, AlertTriangle, UserX, ArrowLeft,
  ChevronDown, BarChart3, Cpu, Wallet, MessageSquare
} from 'lucide-react';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role?: string;
  created_at?: string;
}

interface Stats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  totalSensor: number;
  todaySensor: number;
}

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string;
  value: any;
  icon: any;
  color: string;
  sub?: string;
}) {
  return (
    <div className="relative rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] p-5 overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-slate-400 dark:hover:border-slate-500 shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none">
      {/* Glow Lampu (Brightened in Light Mode) */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-[0.25] dark:opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.35]" 
        style={{ backgroundColor: color }} 
      />

      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white dark:bg-[#FFFFFF]/10 border border-slate-100 dark:border-white/5 shadow-sm">
            <Icon size={16} style={{ color }} />
          </div>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 mb-1.5">{label}</p>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-none tabular-nums" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            {value}
          </h2>
          {sub && <p className="text-[10px] text-slate-400 font-mono mt-1.5">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role?: string }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-500 border border-purple-500/20">
        <Crown size={10} /> Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-[#FFFFFF]/5 text-[#1E293B] dark:text-slate-400 border border-[#E2E8F0] dark:border-white/10">
      <UserCircle size={10} /> User
    </span>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [promotingId, setPromotingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) setSession(d.user);
    });
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) { router.replace('/'); return; }
      const data = await res.json();
      setUsers(data.users || []);
      setError('');
    } catch {
      setError('Gagal memuat data pengguna.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch {
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchUsers();
      fetchStats();
    }
  }, [session, fetchUsers, fetchStats]);

  const handleDelete = async (user: UserRow) => {
    setDeletingId(user.id);
    setConfirmDelete(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await fetchUsers();
      await fetchStats();
    } catch {
      setError('Gagal menghapus pengguna.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleRole = async (user: UserRow) => {
    setPromotingId(user.id);
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, role: newRole }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      await fetchUsers();
      await fetchStats();
    } catch {
      setError('Gagal mengubah role.');
    } finally {
      setPromotingId(null);
    }
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#060410] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#FFFFFF] dark:bg-[#0d1525] border border-red-500/30 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <UserX size={28} className="text-red-500" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white text-center mb-2">Hapus Pengguna?</h2>
            <p className="text-sm text-slate-500 text-center mb-1">
              Anda akan menghapus akun:
            </p>
            <p className="text-sm font-black text-red-500 text-center mb-6 font-mono">{confirmDelete.email}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-3 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 text-slate-600 dark:text-slate-300 font-black text-sm hover:border-slate-300 dark:hover:border-white/20 transition-all"
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-red-500/20"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-6 md:px-8 pb-10 space-y-6 max-w-7xl mx-auto pt-8">

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/5 border border-red-500/20 text-red-400 text-sm font-bold">
            <AlertTriangle size={16} />
            {error}
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300 text-xs underline">Tutup</button>
          </div>
        )}

        {/* STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Pengguna" value={loadingStats ? '—' : stats?.totalUsers ?? 0} icon={Users} color="#8b5cf6" />
          <StatCard label="Akun Admin" value={loadingStats ? '—' : stats?.adminCount ?? 0} icon={Crown} color="#f59e0b" />
          <StatCard label="Akun User" value={loadingStats ? '—' : stats?.userCount ?? 0} icon={UserCircle} color="#3b82f6" />
          <StatCard label="Total Data Sensor" value={loadingStats ? '—' : stats?.totalSensor ?? 0} icon={Database} color="#22c55e" sub="Total rekaman" />
          <StatCard label="Data Hari Ini" value={loadingStats ? '—' : stats?.todaySensor ?? 0} icon={Activity} color="#f97316" sub="Sejak 00:00" />
        </div>

        {/* USER TABLE */}
        <div className="rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)]">

          {/* Table Header */}
          <div className="px-6 py-5 border-b border-[#E2E8F0] dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <Users size={15} className="text-purple-400" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400">Daftar Pengguna</p>
                <p className="text-xs text-slate-500 mt-0.5">{users.length} akun terdaftar</p>
              </div>
            </div>
            <button
              onClick={() => { fetchUsers(); fetchStats(); }}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/8 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] text-[#1E293B] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)]"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                <RefreshCw size={20} className="text-purple-400 animate-spin" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400 animate-pulse">Memuat data...</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] dark:border-white/5">
                      {['#', 'Nama', 'Email', 'Role', 'Terdaftar', 'Aksi'].map(h => (
                        <th key={h} className="text-left px-6 py-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-[#1E293B] dark:text-slate-400 text-sm font-semibold uppercase tracking-widest">
                          Belum ada pengguna terdaftar
                        </td>
                      </tr>
                    ) : users.map((u, i) => (
                      <tr key={u.id} className={`transition-all hover:bg-[#F8F9FA] dark:hover:bg-[#FFFFFF]/[0.02] ${u.id === session?.id ? 'bg-purple-500/[0.03]' : ''}`}>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{i + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center text-sm font-black text-slate-700 dark:text-slate-300 uppercase flex-shrink-0">
                              {u.name?.charAt(0) || '?'}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white capitalize">{u.name}</p>
                              {u.id === session?.id && (
                                <p className="text-[9px] text-purple-500 font-black uppercase tracking-wider">Anda</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400 text-xs font-mono">{u.email}</td>
                        <td className="px-6 py-4">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="px-6 py-4 text-slate-500 dark:text-slate-500 text-xs font-mono whitespace-nowrap">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {/* Toggle Role Button */}
                            {u.id !== session?.id && (
                              <button
                                onClick={() => handleToggleRole(u)}
                                disabled={promotingId === u.id}
                                title={u.role === 'admin' ? 'Turunkan ke User' : 'Jadikan Admin'}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 ${
                                  u.role === 'admin'
                                    ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20'
                                    : 'bg-purple-500/10 text-purple-500 border border-purple-500/20 hover:bg-purple-500/20'
                                }`}
                              >
                                {promotingId === u.id ? (
                                  <RefreshCw size={10} className="animate-spin" />
                                ) : (
                                  <Crown size={10} />
                                )}
                                {u.role === 'admin' ? 'Turunkan' : 'Promosi'}
                              </button>
                            )}

                            {/* Delete Button */}
                            {u.id !== session?.id && (
                              <button
                                onClick={() => setConfirmDelete(u)}
                                disabled={deletingId === u.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                              >
                                {deletingId === u.id ? (
                                  <RefreshCw size={10} className="animate-spin" />
                                ) : (
                                  <Trash2 size={10} />
                                )}
                                Hapus
                              </button>
                            )}

                            {u.id === session?.id && (
                              <span className="text-[10px] text-slate-500 font-mono italic">Akun Anda</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-white/5">
                {users.length === 0 ? (
                  <div className="text-center py-16 text-[#1E293B] dark:text-slate-400 text-sm font-semibold uppercase tracking-widest">
                    Belum ada pengguna terdaftar
                  </div>
                ) : users.map((u) => (
                  <div key={u.id} className={`p-5 ${u.id === session?.id ? 'bg-purple-500/[0.03]' : 'hover:bg-[#F8F9FA]/50 dark:hover:bg-[#FFFFFF]/[0.02]'} transition-colors`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center text-sm font-black text-slate-700 dark:text-slate-300 uppercase">
                          {u.name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white capitalize">{u.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                        </div>
                      </div>
                      <RoleBadge role={u.role} />
                    </div>

                    {u.created_at && (
                      <p className="text-[10px] text-slate-500 font-mono mb-3">
                        Terdaftar: {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    )}

                    {u.id !== session?.id && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleToggleRole(u)}
                          disabled={promotingId === u.id}
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 ${
                            u.role === 'admin'
                              ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                              : 'bg-purple-500/10 text-purple-500 border border-purple-500/20'
                          }`}
                        >
                          <Crown size={10} />
                          {u.role === 'admin' ? 'Turunkan' : 'Jadikan Admin'}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(u)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20"
                        >
                          <Trash2 size={10} /> Hapus
                        </button>
                      </div>
                    )}
                    {u.id === session?.id && (
                      <p className="text-[10px] text-purple-500 font-black uppercase tracking-wider mt-2">✦ Akun Anda</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Laporan Penjualan', desc: 'Ringkasan transaksi premium', icon: Wallet, href: '/admin/sales', color: '#22c55e' },
            { label: 'Tiket Pengaduan', desc: 'Kelola feedback pengguna', icon: MessageSquare, href: '/admin/complaints', color: '#3b82f6' },
            { label: 'Pengaturan Threshold', desc: 'Ubah ambang batas peringatan', icon: Cpu, href: '/admin/thresholds', color: '#f59e0b' },
          ].map(item => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className="relative text-left p-5 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] hover:border-slate-300 dark:hover:border-white/20 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] transition-all group overflow-hidden"
            >
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none" style={{ background: item.color }} />
              <div className="p-2.5 rounded-xl border border-slate-100 dark:border-white/8 w-fit mb-3" style={{ background: `${item.color}15` }}>
                <item.icon size={16} style={{ color: item.color }} />
              </div>
              <p className="text-sm font-black text-slate-900 dark:text-white mb-1">{item.label}</p>
              <p className="text-[11px] text-slate-500">{item.desc}</p>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
