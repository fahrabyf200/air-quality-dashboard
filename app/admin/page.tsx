"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Database, Activity, RefreshCw, AlertTriangle,
  ArrowLeft, BarChart3, Cpu, Wallet, MessageSquare,
  TrendingUp, Package, ShieldAlert, DollarSign
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';

interface Stats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
  totalSensor: number;
  todaySensor: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  totalComplaints: number;
  openComplaints: number;
  revenueByMonth: { label: string; revenue: number; transactions: number }[];
  packageDist: { package_name: string; count: number; total: number }[];
  complaintsByStatus: { status: string; count: number }[];
  dangerTrend: { label: string; total_events: number }[];
  subscribers: { package_name: string; user_name: string; user_email: string; amount: number; created_at: string }[];
}

const PIE_COLORS = ['#4edea3', '#3b82f6', '#f97316', '#a855f7', '#ef4444'];
const STATUS_COLORS: Record<string, string> = {
  open: '#ef4444',
  in_progress: '#f97316',
  resolved: '#22c55e',
};

function formatRupiah(n: number) {
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(1)}jt`;
  if (n >= 1000) return `Rp ${(n / 1000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function StatCard({ label, value, icon: Icon, color, sub, onClick }: {
  label: string; value: any; icon: any; color: string; sub?: string; onClick?: () => void;
}) {
  return (
    <div 
      onClick={onClick} 
      className={`relative rounded-2xl border-2 border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 overflow-hidden group transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.04)] ${onClick ? 'cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-slate-400 dark:hover:border-slate-700 hover:scale-[1.02] active:scale-[0.98]' : ''}`}
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-[0.25] dark:opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.35]" style={{ backgroundColor: color }} />
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-start justify-between mb-5">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 shadow-sm">
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

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 shadow-lg text-xs">
      <p className="text-slate-500 font-semibold uppercase tracking-wider text-[9px] mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-slate-500 text-[9px] uppercase">{p.name}</span>
          </div>
          <span className="font-black text-slate-900 dark:text-white">
            {typeof p.value === 'number' && p.name === 'Revenue' ? formatRupiah(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.headers.get('content-type')?.includes('application/json') ? r.json() : { user: null })
      .then(d => { if (d.user) setSession(d.user); })
      .catch(() => {});
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) fetchStats();
  }, [session, fetchStats]);

  if (!session) return null;

  const statCards = [
    { label: 'Total Pengguna', value: stats?.totalUsers ?? 0, icon: Users, color: '#8b5cf6', sub: `${stats?.userCount ?? 0} user aktif`, onClick: () => router.push('/admin/users') },
    { label: 'Total Pendapatan', value: loading ? '—' : formatRupiah(stats?.totalRevenue ?? 0), icon: Wallet, color: '#4edea3', sub: `Bulan ini: ${formatRupiah(stats?.thisMonthRevenue ?? 0)}`, onClick: () => router.push('/admin/sales') },
    { label: 'Total Pengaduan', value: stats?.totalComplaints ?? 0, icon: MessageSquare, color: '#3b82f6', sub: `${stats?.openComplaints ?? 0} belum ditangani`, onClick: () => router.push('/admin/complaints') },
    { label: 'Total Data Sensor', value: stats?.totalSensor ?? 0, icon: Database, color: '#22c55e', sub: 'Total rekaman', onClick: () => router.push('/admin/sensor') },
    { label: 'Data Hari Ini', value: stats?.todaySensor ?? 0, icon: Activity, color: '#f97316', sub: 'Sejak 00:00', onClick: () => router.push('/admin/sensor') },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="px-6 md:px-10 xl:px-12 pb-10 space-y-6 w-full pt-8">

        {/* STATS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map(card => (
            <StatCard
              key={card.label}
              label={card.label}
              value={loading ? '—' : card.value}
              icon={card.icon}
              color={card.color}
              sub={card.sub}
              onClick={card.onClick}
            />
          ))}
        </div>

        {/* CHARTS ROW 1: Revenue + Package Dist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Revenue per Month */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-[#4edea3]" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">Pendapatan 6 Bulan Terakhir</span>
              </div>
              <button onClick={fetchStats} disabled={loading} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition-all">
                <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
            <div className="p-4 h-64">
              {stats?.revenueByMonth && stats.revenueByMonth.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.revenueByMonth} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" fontSize={9} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis fontSize={9} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#4edea3" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm font-semibold">
                  {loading ? 'Memuat data...' : 'Belum ada data pendapatan'}
                </div>
              )}
            </div>
          </div>

          {/* Package Distribution */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={14} className="text-blue-500" />
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">Distribusi Paket</span>
              </div>
              {selectedPackage && (
                <button 
                  onClick={() => setSelectedPackage(null)} 
                  className="text-[9px] font-black uppercase tracking-wider text-purple-500 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
            <div className="p-4 flex flex-col items-center justify-center flex-1">
              {stats?.packageDist && stats.packageDist.length > 0 ? (
                <>
                  <div className="h-44 w-full flex items-center justify-center relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.packageDist}
                          dataKey="count"
                          nameKey="package_name"
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          onMouseEnter={(data) => {
                            const pkgName = data?.package_name || data?.payload?.package_name;
                            if (pkgName) {
                              setSelectedPackage(pkgName);
                            }
                          }}
                          onClick={(data) => {
                            const pkgName = data?.package_name || data?.payload?.package_name;
                            if (pkgName) {
                              setSelectedPackage(selectedPackage === pkgName ? null : pkgName);
                            }
                          }}
                        >
                          {stats.packageDist.map((entry, index) => {
                            const isSelected = selectedPackage === entry.package_name;
                            const hasSelection = selectedPackage !== null;
                            return (
                              <Cell 
                                key={entry.package_name} 
                                fill={PIE_COLORS[index % PIE_COLORS.length]} 
                                style={{ outline: 'none', cursor: 'pointer' }}
                                opacity={hasSelection ? (isSelected ? 1 : 0.35) : 1}
                              />
                            );
                          })}
                        </Pie>
                        <Tooltip formatter={(val, name) => [val, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mt-2 w-full px-2">
                    {stats.packageDist.map((p, i) => {
                      const isSelected = selectedPackage === p.package_name;
                      return (
                        <button 
                          key={p.package_name} 
                          onClick={() => setSelectedPackage(isSelected ? null : p.package_name)}
                          onMouseEnter={() => setSelectedPackage(p.package_name)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-all text-[10px] font-bold cursor-pointer ${
                            isSelected 
                              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white scale-[1.03]' 
                              : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                          }`}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span>{p.package_name} ({p.count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* List of subscribers of the selected package */}
                  {selectedPackage && (
                    <div className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4 w-full animate-in fade-in slide-in-from-top-2 duration-200">
                      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                        Daftar Pengguna ({stats.subscribers?.filter(s => s.package_name === selectedPackage).length ?? 0})
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {(stats.subscribers?.filter(s => s.package_name === selectedPackage) || []).map((sub, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900">
                            <div>
                              <p className="font-bold text-slate-800 dark:text-white capitalize leading-tight">{sub.user_name || '—'}</p>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 leading-none">{sub.user_email}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-black text-[#4edea3] font-mono leading-none">{formatRupiah(sub.amount)}</p>
                              <p className="text-[8px] text-slate-400 font-mono mt-1 leading-none">
                                {new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-slate-400 text-sm font-semibold">
                  {loading ? 'Memuat...' : 'Belum ada transaksi'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CHARTS ROW 2: Complaints + Danger Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Complaints by Status */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">Pengaduan per Status</span>
            </div>
            <div className="p-4 h-52">
              {stats?.complaintsByStatus && stats.complaintsByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.complaintsByStatus} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="status" fontSize={9} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis fontSize={9} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Jumlah" radius={[6, 6, 0, 0]}>
                      {stats.complaintsByStatus.map((entry) => (
                        <Cell key={entry.status} fill={STATUS_COLORS[entry.status] || '#94a3b8'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm font-semibold">
                  {loading ? 'Memuat...' : 'Belum ada pengaduan'}
                </div>
              )}
            </div>
          </div>

          {/* Danger Events Trend */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:text-slate-300">Tren Event Bahaya (Total Keseluruhan)</span>
            </div>
            <div className="p-4 h-52">
              {stats?.dangerTrend && stats.dangerTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.dangerTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="label" fontSize={9} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis fontSize={9} tick={{ fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line type="monotone" dataKey="total_events" name="Event Bahaya" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: '#ef4444', r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <ShieldAlert size={28} className="text-emerald-400 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm font-semibold">
                      {loading ? 'Memuat...' : 'Tidak ada event bahaya tercatat 🎉'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Laporan Penjualan', desc: 'Ringkasan transaksi premium', icon: Wallet, href: '/admin/sales', color: '#22c55e' },
            { label: 'Tiket Pengaduan', desc: 'Kelola feedback pengguna', icon: MessageSquare, href: '/admin/complaints', color: '#3b82f6' },
            { label: 'Pengaturan Threshold', desc: 'Ubah ambang batas peringatan', icon: Cpu, href: '/admin/thresholds', color: '#f59e0b' },
          ].map(item => (
            <button key={item.href} onClick={() => router.push(item.href)}
              className="relative text-left p-5 rounded-2xl border border-slate-200 border-t-[1.5px] dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] transition-all group overflow-hidden"
            >
              <div className="absolute -top-5 -right-5 w-20 h-20 rounded-full blur-2xl opacity-15 group-hover:opacity-25 transition-opacity pointer-events-none" style={{ background: item.color }} />
              <div className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 w-fit mb-3" style={{ background: `${item.color}15` }}>
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
