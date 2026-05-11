"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Plus, Trash2, RefreshCw, Check,
  X, TrendingUp, Calendar, CreditCard, Users
} from 'lucide-react';

interface Transaction {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  package_name: string;
  amount: number;
  payment_method: string;
  notes: string;
  created_at: string;
}

const inputClass = "w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-colors";

export default function AdminSalesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  const [form, setForm] = useState({
    user_id: '',
    package_name: '1 Bulan',
    amount: '',
    payment_method: 'Transfer Bank',
    notes: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [salesRes, usersRes] = await Promise.all([
        fetch('/api/admin/sales'),
        fetch('/api/admin/users'),
      ]);
      const salesData = await salesRes.json();
      const usersData = await usersRes.json();
      setTransactions(salesData.transactions || []);
      setStats(salesData.stats || null);
      setUsers(usersData.users?.filter((u: any) => u.role !== 'admin') || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSuccessMsg = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const handleCreate = async () => {
    if (!form.user_id || !form.amount) return;
    setSaving(true);
    try {
      const selectedUser = users.find(u => u.id === Number(form.user_id));
      const res = await fetch('/api/admin/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          user_id: Number(form.user_id),
          user_name: selectedUser?.name,
          user_email: selectedUser?.email,
          amount: Number(form.amount),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowForm(false);
        setForm({ user_id: '', package_name: '1 Bulan', amount: '', payment_method: 'Transfer Bank', notes: '' });
        await fetchData();
        showSuccessMsg(data.message);
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus transaksi ini?')) return;
    await fetch('/api/admin/sales', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchData();
    showSuccessMsg('Transaksi dihapus');
  };

  const formatRupiah = (n: number) =>
    'Rp ' + Number(n || 0).toLocaleString('id-ID');

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-[#0d0720] border border-slate-200 dark:border-white/10 rounded-3xl p-7 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Catat Transaksi Baru</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X size={14} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pilih Pengguna</label>
                <select value={form.user_id} onChange={e => setForm({ ...form, user_id: e.target.value })}
                  className="w-full bg-white dark:bg-[#0d0720] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500/50">
                  <option value="">-- Pilih pengguna --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paket</label>
                <select value={form.package_name} onChange={e => setForm({ ...form, package_name: e.target.value })}
                  className="w-full bg-white dark:bg-[#0d0720] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500/50">
                  <option>1 Bulan</option>
                  <option>1 Tahun</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jumlah Pembayaran (Rp)</label>
                <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="Contoh: 50000" className={inputClass} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Metode Pembayaran</label>
                <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })}
                  className="w-full bg-white dark:bg-[#0d0720] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500/50">
                  <option>Transfer Bank</option>
                  <option>GoPay</option>
                  <option>OVO</option>
                  <option>Dana</option>
                  <option>ShopeePay</option>
                  <option>QRIS</option>
                  <option>Tunai</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan (Opsional)</label>
                <input type="text" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Catatan tambahan..." className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/10 transition-all">Batal</button>
                <button onClick={handleCreate} disabled={saving || !form.user_id || !form.amount}
                  className="flex-1 py-3 rounded-2xl bg-[#a3e635] hover:bg-[#b6f041] text-[#0a0f1a] font-black text-xs transition-all disabled:opacity-50 shadow-lg shadow-[#a3e635]/20">
                  {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Data Penjualan</h1>
          <p className="text-slate-500 text-xs mt-1 font-mono">Log transaksi langganan premium</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#b6f041] text-[#0a0f1a] font-black text-[11px] uppercase tracking-wider shadow-md shadow-[#a3e635]/20 transition-all">
          <Plus size={13} /> Catat Transaksi
        </button>
      </div>

      {success && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
          <Check size={16} /> {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Transaksi',    value: stats?.total_transactions ?? 0,          format: 'number', color: '#8b5cf6', icon: CreditCard },
          { label: 'Total Pendapatan',   value: stats?.total_revenue ?? 0,              format: 'rupiah', color: '#a3e635', icon: TrendingUp },
          { label: 'Pendapatan Bulan Ini', value: stats?.this_month_revenue ?? 0,       format: 'rupiah', color: '#3b82f6', icon: Calendar },
        ].map(s => (
          <div key={s.label} className="relative rounded-2xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-5 overflow-hidden shadow-sm">
            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-15" style={{ background: s.color }} />
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />
            <div className="p-2.5 rounded-xl w-fit mb-3" style={{ background: `${s.color}15` }}>
              <s.icon size={16} style={{ color: s.color }} />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{s.label}</p>
            <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
              {s.format === 'rupiah' ? formatRupiah(s.value) : s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center gap-3">
          <DollarSign size={16} className="text-[#a3e635]" />
          <p className="text-xs font-black uppercase tracking-widest text-slate-500">Riwayat Transaksi ({transactions.length})</p>
          <button onClick={fetchData} disabled={loading} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-900 dark:hover:text-white text-[10px] font-black uppercase tracking-wider transition-all">
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <RefreshCw size={20} className="animate-spin text-[#a3e635]" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">Memuat data...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm font-black uppercase tracking-widest">Belum ada transaksi</div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.05]">
                    {['#', 'Pengguna', 'Paket', 'Jumlah', 'Metode', 'Tanggal', ''].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                  {transactions.map((t, i) => (
                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{t.user_name || '—'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{t.user_email || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#a3e635]/10 text-[#5a8a0a] dark:text-[#a3e635] border border-[#a3e635]/20">
                          {t.package_name}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-slate-900 dark:text-white font-mono">{formatRupiah(t.amount)}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs">{t.payment_method}</td>
                      <td className="px-5 py-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                        {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all">
                          <Trash2 size={11} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-white/[0.04]">
              {transactions.map(t => (
                <div key={t.id} className="p-5 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{t.user_name || '—'}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{t.package_name} · {t.payment_method}</p>
                    <p className="font-black text-[#a3e635] mt-1 text-sm">{formatRupiah(t.amount)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-slate-400 font-mono">{new Date(t.created_at).toLocaleDateString('id-ID')}</p>
                    <button onClick={() => handleDelete(t.id)} className="mt-2 p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20">
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
