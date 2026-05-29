"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Crown, UserCircle, Search, RefreshCw, Plus,
  UserPlus, Pencil, Trash2, Eye, X, Check, AlertTriangle,
  UserX, Database, ShieldAlert, Zap
} from 'lucide-react';

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  device_id?: string;
  sensor_count?: number;
  created_at?: string;
  subscription_status?: string;
  subscription_end_date?: string;
  invited_by_name?: string;
  invited_by_email?: string;
}

function RoleBadge({ role }: { role: string }) {
  const isAdm = role === 'admin';
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
      isAdm 
        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' 
        : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isAdm ? 'bg-purple-500' : 'bg-blue-500'}`} />
      {role}
    </span>
  );
}

function SubscriptionBadge({ status, endDate, invitedByName }: { status?: string; endDate?: string; invitedByName?: string }) {
  const isActive = status === 'active' && endDate && new Date(endDate) > new Date();
  const daysLeft = endDate ? Math.max(0, Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
  
  if (invitedByName) {
    return (
      <div className="text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Pegawai
        </span>
        <p className="text-[9px] text-slate-500 dark:text-slate-400 mt-1 truncate max-w-[125px]" title={`Diundang oleh: ${invitedByName}`}>
          Oleh: {invitedByName}
        </p>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border bg-[#4edea3]/10 text-[#059669] dark:text-[#4edea3] border-[#4edea3]/30">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
          Premium
        </span>
        <p className="text-[10px] text-slate-400 font-mono mt-1">{daysLeft}h lagi</p>
      </div>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border bg-slate-100 dark:bg-[#FFFFFF]/5 text-[#1E293B] dark:text-slate-400 border-[#E2E8F0] dark:border-white/10">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Free
    </span>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 backdrop-blur-md px-4">
      <div className="bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#FFFFFF]/5 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

const inputClass = "w-full bg-[#F8F9FA] dark:bg-[#FFFFFF]/5 border border-[#E2E8F0] dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-colors";
const selectClass = "w-full bg-[#FFFFFF] dark:bg-slate-900 border border-[#E2E8F0] dark:border-white/10 rounded-xl px-4 py-3 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-purple-500/50 transition-colors";

export default function AdminUsersPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [subLoading, setSubLoading] = useState<number | null>(null);

  const handleSubscription = async (userId: number, action: string) => {
    setSubLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, subscription_action: action }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await fetchUsers();
      showSuccess(data.message);
    } catch { setError('Gagal mengubah status langganan.'); }
    finally { setSubLoading(null); }
  };
  // Modal states
  const [createModal, setCreateModal] = useState(false);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null);

  // Form states
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.headers.get('content-type')?.includes('application/json') ? r.json() : { user: null })
      .then(d => { if (d.user) setSession(d.user); })
      .catch(() => {});
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 403) { router.replace('/'); return; }
      const data = await res.json();
      setUsers(data.users || []);
      setError('');
    } catch { setError('Gagal memuat data pengguna.'); }
    finally { setLoading(false); }
  }, [router]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // CREATE
  const handleCreate = async () => {
    if (!form.name || !form.email || !form.password) { setError('Semua field wajib diisi'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setCreateModal(false);
      setForm({ name: '', email: '', password: '', role: 'user' });
      await fetchUsers();
      showSuccess('User berhasil dibuat!');
    } catch { setError('Gagal membuat user.'); }
    finally { setSaving(false); }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editUser.id, name: form.name, email: form.email, role: form.role }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setEditUser(null);
      await fetchUsers();
      showSuccess('User berhasil diupdate!');
    } catch { setError('Gagal update user.'); }
    finally { setSaving(false); }
  };

  // DELETE
  const handleDelete = async (user: UserRow) => {
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
      showSuccess('User berhasil dihapus!');
    } catch { setError('Gagal menghapus user.'); }
  };

  const openEdit = (u: UserRow) => {
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setEditUser(u);
  };

  const filtered = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount = users.length - adminCount;
  const premiumCount = users.filter(u => u.subscription_status === 'active' && u.subscription_end_date && new Date(u.subscription_end_date) > new Date()).length;
  const freeCount = users.filter(u => u.role !== 'admin').length - premiumCount;

  return (
    <div className="px-6 md:px-10 xl:px-12 pt-7 pb-8 space-y-6 w-full transition-colors duration-300">
      {/* CREATE MODAL */}
      {createModal && (
        <Modal title="Tambah User Baru" onClose={() => setCreateModal(false)}>
          <div className="space-y-4">
            <FormField label="Nama Lengkap">
              <input type="text" placeholder="Masukkan nama..." value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Email">
              <input type="email" placeholder="Masukkan email..." value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Password">
              <input type="password" placeholder="Minimal 6 karakter..." value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Hak Akses / Role">
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={selectClass}>
                <option value="user">User Biasa</option>
                <option value="admin">Administrator</option>
              </select>
            </FormField>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setCreateModal(false)} className="flex-1 py-3 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-[#FFFFFF]/10 transition-all">Batal</button>
              <button onClick={handleCreate} disabled={saving} className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all disabled:opacity-50 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-purple-500/10">
                {saving ? 'Menyimpan...' : 'Buat Akun'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {editUser && (
        <Modal title="Edit Akun Pengguna" onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            <FormField label="Nama Lengkap">
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Email">
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
            </FormField>
            <FormField label="Hak Akses / Role">
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={selectClass} disabled={editUser.id === session?.id}>
                <option value="user">User Biasa</option>
                <option value="admin">Administrator</option>
              </select>
            </FormField>
            {editUser.id === session?.id && (
              <p className="text-[10px] text-yellow-500 font-mono">⚠️ Anda tidak bisa menurunkan peran akun Anda sendiri.</p>
            )}
            <div className="flex gap-3 pt-4">
              <button onClick={() => setEditUser(null)} className="flex-1 py-3 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 dark:hover:bg-[#FFFFFF]/10 transition-all">Batal</button>
              <button onClick={handleUpdate} disabled={saving} className="flex-1 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition-all disabled:opacity-50 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-purple-500/10">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* CONFIRM DELETE MODAL */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-950/45 backdrop-blur-md px-4">
          <div className="bg-white/90 dark:bg-slate-950/85 backdrop-blur-xl border border-red-500/20 dark:border-red-500/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <UserX size={26} className="text-red-500" />
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white text-center mb-2">Hapus Pengguna?</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-1">Akun ini akan dihapus permanen:</p>
            <p className="text-sm font-black text-red-500 text-center mb-2 font-mono">{confirmDelete.email}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-600 text-center mb-6">Data sensor yang terhubung akan diputus namun tidak dihapus.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-3 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#F8F9FA] dark:bg-[#FFFFFF]/5 text-slate-600 dark:text-slate-300 font-black text-sm hover:bg-slate-100 dark:hover:bg-[#FFFFFF]/10 transition-all">Batal</button>
              <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-sm transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-red-500/10">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Kelola Pengguna</h1>
          <p className="text-slate-500 text-xs mt-1 font-mono">CRUD manajemen akun dan hak akses pengguna</p>
        </div>
        <button onClick={() => { setForm({ name: '', email: '', password: '', role: 'user' }); setError(''); setCreateModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-all text-[11px] font-black uppercase tracking-wider shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-purple-500/20">
          <UserPlus size={13} /> Tambah User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pengguna', value: users.length, color: '#8b5cf6', icon: Users },
          { label: 'Administrator', value: adminCount, color: '#f59e0b', icon: Crown },
          { label: 'Premium Active', value: premiumCount, color: '#4edea3', icon: ShieldAlert },
          { label: 'Free Member', value: freeCount, color: '#64748b', icon: UserCircle },
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

      {/* Success / Error */}
      {success && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold">
          <Check size={16} /> {success}
        </div>
      )}
      {error && (
        <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm font-bold animate-shake">
          <AlertTriangle size={16} /> {error}
          <button onClick={() => setError('')} className="ml-auto text-xs underline">Tutup</button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/[0.07] bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/[0.05] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F8F9FA]/50 dark:bg-[#FFFFFF]/[0.01]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center">
              <Users size={15} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400">Daftar Pengguna</p>
              <p className="text-xs text-slate-500 mt-0.5">{filtered.length} dari {users.length} akun</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" placeholder="Cari nama / email..." value={search} onChange={e => setSearch(e.target.value)}
                className="bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 border border-[#E2E8F0] dark:border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-purple-500/40 w-48 transition-colors shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none" />
            </div>
            <button onClick={fetchUsers} disabled={loading}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#F8F9FA] dark:bg-[#FFFFFF]/5 text-[#1E293B] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#FFFFFF]/10 transition-all text-[11px] font-semibold uppercase tracking-wider disabled:opacity-50">
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <RefreshCw size={22} className="text-purple-600 dark:text-purple-400 animate-spin" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400 animate-pulse">Memuat data...</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.05]">
                    {['#', 'Pengguna', 'Email', 'Role', 'Langganan', 'Data Sensor', 'Bergabung', 'Aksi'].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-[10px] font-semibold uppercase tracking-[0.3em] text-[#1E293B] dark:text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/[0.03]">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-16 text-[#1E293B] dark:text-slate-400 text-sm font-semibold uppercase tracking-widest">Tidak ada pengguna</td></tr>
                  ) : filtered.map((u, i) => (
                    <tr key={u.id} className={`transition-all hover:bg-[#F8F9FA]/50 dark:hover:bg-[#FFFFFF]/[0.02] ${u.id === session?.id ? 'bg-purple-500/[0.04]' : ''}`}>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-600 font-mono text-xs">{i + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-sm font-semibold text-[#1E293B] dark:text-slate-300 uppercase flex-shrink-0">
                            {u.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-900 dark:text-white capitalize leading-tight">{u.name}</p>
                            {u.id === session?.id && <p className="text-[9px] text-purple-600 dark:text-purple-400 font-black uppercase tracking-wider mt-0.5">Akun Anda</p>}
                            {u.invited_by_name && (
                              <p className="text-[8px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider mt-1.5 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md w-fit">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                Pegawai {u.invited_by_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs font-mono">{u.email}</td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4"><SubscriptionBadge status={u.subscription_status} endDate={u.subscription_end_date} invitedByName={u.invited_by_name} /></td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Database size={11} className="text-slate-400" />
                          <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">{u.sensor_count ?? 0}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-600">rekaman</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-600 text-xs font-mono whitespace-nowrap">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Subscription Controls — hanya untuk non-admin */}
                          {u.role !== 'admin' && (
                            <>
                              <button
                                onClick={() => handleSubscription(u.id, 'activate_1month')}
                                disabled={subLoading === u.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-[#4edea3]/10 text-[#047857] dark:text-[#4edea3] border border-[#4edea3]/30 hover:bg-[#4edea3]/20 transition-all disabled:opacity-50 whitespace-nowrap"
                                title="Aktifkan Premium 1 Bulan"
                              >
                                {subLoading === u.id ? <RefreshCw size={9} className="animate-spin" /> : <Zap size={9} />}
                                1 Bln
                              </button>
                              <button
                                onClick={() => handleSubscription(u.id, 'activate_1year')}
                                disabled={subLoading === u.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all disabled:opacity-50 whitespace-nowrap"
                                title="Aktifkan Premium 1 Tahun"
                              >
                                {subLoading === u.id ? <RefreshCw size={9} className="animate-spin" /> : <Crown size={9} />}
                                1 Thn
                              </button>
                              <button
                                onClick={() => handleSubscription(u.id, 'deactivate')}
                                disabled={subLoading === u.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                title="Nonaktifkan Premium"
                              >
                                {subLoading === u.id ? <RefreshCw size={9} className="animate-spin" /> : <ShieldAlert size={9} />}
                                Off
                              </button>
                            </>
                          )}
                          {/* View Detail */}
                          <button onClick={() => router.push(`/admin/users/${u.id}`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all" title="Lihat Detail">
                            <Eye size={10} /> Detail
                          </button>
                          {/* Edit */}
                          <button onClick={() => openEdit(u)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all" title="Edit">
                            <Pencil size={10} />
                          </button>
                          {/* Delete */}
                          {u.id !== session?.id && (
                            <button onClick={() => setConfirmDelete(u)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all" title="Hapus">
                              <Trash2 size={10} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden flex flex-col divide-y divide-slate-100 dark:divide-white/[0.04]">
              {filtered.map((u) => (
                <div key={u.id} className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center text-sm font-semibold text-[#1E293B] dark:text-slate-300 uppercase">
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-900 dark:text-white capitalize">{u.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{u.email}</p>
                        {u.invited_by_name && (
                          <p className="text-[8px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-wider mt-1 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md w-fit">
                            <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                            Pegawai {u.invited_by_name}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <RoleBadge role={u.role} />
                      <SubscriptionBadge status={u.subscription_status} endDate={u.subscription_end_date} invitedByName={u.invited_by_name} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 mb-3">
                    <Database size={10} />
                    <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300">{u.sensor_count ?? 0} rekaman sensor</span>
                  </div>
                  {/* Subscription Buttons (mobile) */}
                  {u.role !== 'admin' && (
                    <div className="flex gap-2 mb-2">
                      <button onClick={() => handleSubscription(u.id, 'activate_1month')} disabled={subLoading === u.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider bg-[#4edea3]/10 text-[#047857] dark:text-[#4edea3] border border-[#4edea3]/30 disabled:opacity-50">
                        {subLoading === u.id ? <RefreshCw size={9} className="animate-spin" /> : <Zap size={9} />} 1 Bln
                      </button>
                      <button onClick={() => handleSubscription(u.id, 'activate_1year')} disabled={subLoading === u.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 disabled:opacity-50">
                        {subLoading === u.id ? <RefreshCw size={9} className="animate-spin" /> : <Crown size={9} />} 1 Thn
                      </button>
                      <button onClick={() => handleSubscription(u.id, 'deactivate')} disabled={subLoading === u.id}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 disabled:opacity-50">
                        {subLoading === u.id ? <RefreshCw size={9} className="animate-spin" /> : <ShieldAlert size={9} />} Off
                      </button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button onClick={() => router.push(`/admin/users/${u.id}`)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                      <Eye size={10} /> Detail
                    </button>
                    <button onClick={() => openEdit(u)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <Pencil size={10} /> Edit
                    </button>
                    {u.id !== session?.id && (
                      <button onClick={() => setConfirmDelete(u)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        <Trash2 size={10} /> Hapus
                      </button>
                    )}
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
