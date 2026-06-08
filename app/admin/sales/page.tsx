"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign, Trash2, RefreshCw, Check,
  TrendingUp, Calendar, CreditCard
} from 'lucide-react';
import { useLanguage } from '@/app/hooks/useLanguage';

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

const inputClass = "w-full bg-[#F8F9FA] dark:bg-[#FFFFFF]/5 border border-[#E2E8F0] dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500/50 transition-colors";

export default function AdminSalesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');
  const { lang, t } = useLanguage();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const salesRes = await fetch('/api/admin/sales');
      const salesData = await salesRes.json();
      setTransactions(salesData.transactions || []);
      setStats(salesData.stats || null);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSuccessMsg = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 3000); };

  const handleDelete = async (id: number) => {
    if (!confirm(t('Hapus transaksi ini?', 'Delete this transaction?'))) return;
    await fetch('/api/admin/sales', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    await fetchData();
    showSuccessMsg(t('Transaksi dihapus', 'Transaction deleted'));
  };

  const formatRupiah = (n: number) =>
    'Rp ' + Number(n || 0).toLocaleString('id-ID');

  return (
    <div className="px-6 md:px-10 xl:px-12 pt-7 pb-8 space-y-6 w-full transition-colors duration-300">
      {/* Create Modal */}
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>{t('Data Penjualan', 'Sales Data')}</h1>
          <p className="text-slate-500 text-xs mt-1 font-mono">{t('Log transaksi langganan premium', 'Premium subscription transaction log')}</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
          <Check size={16} /> {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t('Total Transaksi', 'Total Transactions'), value: stats?.total_transactions ?? 0, format: 'number', color: '#8b5cf6', icon: CreditCard },
          { label: t('Total Pendapatan', 'Total Revenue'), value: stats?.total_revenue ?? 0, format: 'rupiah', color: '#4edea3', icon: TrendingUp },
          { label: t('Pendapatan Bulan Ini', "This Month's Revenue"), value: stats?.this_month_revenue ?? 0, format: 'rupiah', color: '#3b82f6', icon: Calendar },
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
                <p className="text-xl font-black text-slate-900 dark:text-white font-mono">
                  {s.format === 'rupiah' ? formatRupiah(s.value) : s.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/[0.07] bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)]">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex items-center gap-3">
          <DollarSign size={16} className="text-[#4edea3]" />
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1E293B] dark:text-slate-400">{t('Riwayat Transaksi', 'Transaction History')} ({transactions.length})</p>
          <button onClick={fetchData} disabled={loading} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 text-[#1E293B] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-[10px] font-semibold uppercase tracking-wider transition-all">
            <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> {t('Refresh', 'Refresh')}
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <RefreshCw size={20} className="animate-spin text-[#4edea3]" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400 animate-pulse">{t('Memuat data...', 'Loading data...')}</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm font-black uppercase tracking-widest">{t('Belum ada transaksi', 'No transactions yet')}</div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.05]">
                    {['#', t('Pengguna', 'User'), t('Paket', 'Package'), t('Jumlah', 'Amount'), t('Metode', 'Method'), t('Tanggal', 'Date'), ''].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                  {transactions.map((tVal, i) => (
                    <tr key={tVal.id} className="hover:bg-[#F8F9FA]/50 dark:hover:bg-[#FFFFFF]/[0.02] transition-all">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{tVal.user_name || '—'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{tVal.user_email || '—'}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#4edea3]/10 text-[#047857] dark:text-[#4edea3] border border-[#4edea3]/20">
                          {tVal.package_name === '1 Bulan' ? t('1 Bulan', '1 Month') : tVal.package_name === '1 Tahun' ? t('1 Tahun', '1 Year') : tVal.package_name}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-black text-slate-900 dark:text-white font-mono">{formatRupiah(tVal.amount)}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs">
                        {tVal.payment_method === 'Transfer Bank' ? t('Transfer Bank', 'Bank Transfer') : tVal.payment_method === 'Tunai' ? t('Tunai', 'Cash') : tVal.payment_method}
                      </td>
                      <td className="px-5 py-4 text-slate-400 text-xs font-mono whitespace-nowrap">
                        {new Date(tVal.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleDelete(tVal.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all">
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
              {transactions.map(tVal => (
                <div key={tVal.id} className="p-5 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">{tVal.user_name || '—'}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {tVal.package_name === '1 Bulan' ? t('1 Bulan', '1 Month') : tVal.package_name === '1 Tahun' ? t('1 Tahun', '1 Year') : tVal.package_name} · {tVal.payment_method === 'Transfer Bank' ? t('Transfer Bank', 'Bank Transfer') : tVal.payment_method === 'Tunai' ? t('Tunai', 'Cash') : tVal.payment_method}
                    </p>
                    <p className="font-black text-[#4edea3] mt-1 text-sm">{formatRupiah(tVal.amount)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-slate-400 font-mono">{new Date(tVal.created_at).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US')}</p>
                    <button onClick={() => handleDelete(tVal.id)} className="mt-2 p-1.5 rounded-lg bg-red-500/10 text-red-600 dark:text-red-500 border border-red-500/20">
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
