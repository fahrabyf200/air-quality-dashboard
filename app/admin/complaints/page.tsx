"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquareWarning, RefreshCw, Check, Trash2, X,
  Clock, AlertTriangle, CheckCircle, Search, Filter, ChevronDown
} from 'lucide-react';
import { useLanguage } from '@/app/hooks/useLanguage';

interface Complaint {
  id: number;
  user_id: number | null;
  user_name?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'pending' | 'in_progress' | 'resolved';
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useLanguage();
  const map: Record<string, { label: string; color: string; bg: string }> = {
    pending:     { label: t('Menunggu', 'Pending'),    color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400' },
    in_progress: { label: t('Diproses', 'In Progress'),   color: '#3b82f6', bg: 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' },
    resolved:    { label: t('Selesai', 'Resolved'),    color: '#22c55e', bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${s.bg}`}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selected, setSelected] = useState<Complaint | null>(null);
  const [success, setSuccess] = useState('');
  const { lang, t } = useLanguage();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      setComplaints(data.complaints || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSuccess = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const handleStatusUpdate = async (id: number, status: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch('/api/complaints', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (res.ok) { await fetchData(); showSuccess(t('Status pengaduan diperbarui', 'Complaint status updated')); setSelected(null); }
    } finally { setUpdatingId(null); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t('Hapus pengaduan ini?', 'Delete this complaint?'))) return;
    await fetch('/api/complaints', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchData();
    showSuccess(t('Pengaduan dihapus', 'Complaint deleted'));
    setSelected(null);
  };

  const filtered = complaints.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in_progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <div className="px-6 md:px-10 xl:px-12 pt-7 pb-8 space-y-6 w-full transition-colors duration-300">
      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 backdrop-blur-md px-4">
          <div className="bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-3xl p-7 max-w-lg w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{t('Detail Pengaduan', 'Complaint Detail')} #{selected.id}</h2>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#FFFFFF]/5 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{t('Nama', 'Name')}</p><p className="font-bold text-slate-900 dark:text-white">{selected.name}</p></div>
                <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{t('Email', 'Email')}</p><p className="font-bold text-slate-900 dark:text-white font-mono text-xs">{selected.email}</p></div>
              </div>
              <div><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-0.5">{t('Subjek', 'Subject')}</p><p className="text-sm font-bold text-slate-900 dark:text-white">{selected.subject}</p></div>
              <div><p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mb-0.5">{t('Pesan', 'Message')}</p><p className="text-sm text-[#1E293B] dark:text-slate-300 leading-relaxed">{selected.message}</p></div>
              <div className="flex items-center justify-between"><StatusBadge status={selected.status} /><span className="text-[10px] text-slate-400 font-mono">{new Date(selected.created_at).toLocaleString(lang === 'id' ? 'id-ID' : 'en-US')}</span></div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.status !== 'in_progress' && (
                <button onClick={() => handleStatusUpdate(selected.id, 'in_progress')} disabled={updatingId === selected.id}
                  className="flex-1 py-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-wider hover:bg-blue-500/20 transition-all disabled:opacity-50">
                  {t('Tandai Diproses', 'Mark In Progress')}
                </button>
              )}
              {selected.status !== 'resolved' && (
                <button onClick={() => handleStatusUpdate(selected.id, 'resolved')} disabled={updatingId === selected.id}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider hover:bg-emerald-500/20 transition-all disabled:opacity-50">
                  {t('Tandai Selesai', 'Mark Resolved')}
                </button>
              )}
              <button onClick={() => handleDelete(selected.id)}
                className="py-2.5 px-4 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-black hover:bg-red-500/20 transition-all">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{t('Data Pengaduan', 'Complaints Data')}</h1>
          <p className="text-slate-500 text-xs mt-1 font-mono">{t('Kelola laporan dan keluhan dari pengguna', 'Manage user feedback and reports')}</p>
        </div>
        <button onClick={fetchData} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 text-[#1E293B] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[11px] font-semibold uppercase tracking-wider transition-all disabled:opacity-50">
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> {t('Refresh', 'Refresh')}
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
          <Check size={16} /> {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('Menunggu', 'Pending'),  value: pendingCount,    color: '#f59e0b', icon: Clock },
          { label: t('Diproses', 'In Progress'),  value: inProgressCount, color: '#3b82f6', icon: AlertTriangle },
          { label: t('Selesai', 'Resolved'),   value: resolvedCount,   color: '#22c55e', icon: CheckCircle },
        ].map(s => (
          <div key={s.label} className="relative rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] p-5 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-slate-400 dark:hover:border-slate-500 group transition-all duration-300">
            {/* Glow Lampu */}
            <div 
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-[0.25] dark:opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.35]" 
              style={{ backgroundColor: s.color }} 
            />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-start justify-between mb-5">
                <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white dark:bg-[#FFFFFF]/10 border border-slate-100 dark:border-white/5 shadow-sm">
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400 mb-1.5">{s.label}</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-mono">{s.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/[0.07] bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <MessageSquareWarning size={16} className="text-amber-600 dark:text-amber-500" />
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1E293B] dark:text-slate-400">{t('Daftar Pengaduan', 'Complaints List')} ({filtered.length})</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                className="flex items-center gap-2 bg-white dark:bg-[#FFFFFF]/5 border border-[#E2E8F0] dark:border-white/10 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 dark:text-slate-350 focus:outline-none hover:border-slate-350 dark:hover:border-white/20 transition-all shadow-sm active:scale-95 cursor-pointer min-w-[130px] justify-between relative z-10"
              >
                <span>
                  {filterStatus === 'all' && t('Semua Status', 'All Statuses')}
                  {filterStatus === 'pending' && t('Menunggu', 'Pending')}
                  {filterStatus === 'in_progress' && t('Diproses', 'In Progress')}
                  {filterStatus === 'resolved' && t('Selesai', 'Resolved')}
                </span>
                <ChevronDown size={11} className={`text-slate-400 transition-transform duration-200 ${statusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {statusDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setStatusDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-40 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl overflow-hidden py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    {[
                      { v: 'all', l: t('Semua Status', 'All Statuses') },
                      { v: 'pending', l: t('Menunggu', 'Pending') },
                      { v: 'in_progress', l: t('Diproses', 'In Progress') },
                      { v: 'resolved', l: t('Selesai', 'Resolved') },
                    ].map(opt => {
                      const isSelected = filterStatus === opt.v;
                      return (
                        <button
                          key={opt.v}
                          onClick={() => {
                            setFilterStatus(opt.v);
                            setStatusDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-slate-50 dark:bg-slate-850 text-purple-650 dark:text-[#a855f7]'
                              : 'text-slate-600 dark:text-slate-450 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>{opt.l}</span>
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder={`${t('Cari...', 'Search...')}`} value={search} onChange={e => setSearch(e.target.value)}
                className="bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 border border-[#E2E8F0] dark:border-white/10 rounded-xl pl-8 pr-4 py-2 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-purple-500/40 w-40 transition-colors" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <RefreshCw size={20} className="animate-spin text-purple-600 dark:text-purple-500" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">{t('Memuat data...', 'Loading data...')}</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm font-black uppercase tracking-widest">{t('Tidak ada pengaduan', 'No complaints found')}</div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
            {filtered.map(c => (
              <div key={c.id} onClick={() => setSelected(c)}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#F8F9FA]/70 dark:hover:bg-[#FFFFFF]/[0.02] cursor-pointer transition-all group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.subject}</p>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className="text-xs text-slate-500 font-mono truncate">{c.name} · {c.email}</p>
                </div>
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-[10px] text-slate-400 font-mono">{new Date(c.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
