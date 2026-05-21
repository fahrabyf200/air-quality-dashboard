"use client";
import React, { useState, useEffect } from 'react';
import { useThresholds } from '@/app/hooks/useThresholds';
import { 
  User, Mail, ShieldCheck, Bell, Smartphone, LogOut,
  ChevronRight, UserCircle, RefreshCw, Camera, Check, AlertTriangle,
  Crown, Zap, MessageCircle, UserPlus, Trash2, Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { thresholds, saveThresholds, isLoaded } = useThresholds();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [savingDevice, setSavingDevice] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [alarmSound, setAlarmSound] = useState('siren');
  const [pwForm, setPwForm] = useState({ old: '', new: '' });
  const [pwStatus, setPwStatus] = useState({ type: '', text: '' });
  const [savingPw, setSavingPw] = useState(false);
  
  // States sharing alat (invite pegawai)
  const [shares, setShares] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState({ type: '', text: '' });

  // States multi-device (banyak sensor)
  const [devices, setDevices] = useState<any[]>([]);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [addingDevice, setAddingDevice] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [deviceStatus, setDeviceStatus] = useState({ type: '', text: '' });
  
  // State copy link pegawai
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // State collapsible daftar paket (jika sudah berlangganan)
  const [showPlans, setShowPlans] = useState(false);

  const handleCopyLink = (shareId: number, email: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const link = `${origin}/register?email=${encodeURIComponent(email)}&invited=1`;
    navigator.clipboard.writeText(link);
    setCopiedId(shareId);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const router = useRouter();

  useEffect(() => {
    const saved = localStorage.getItem('alarmSound');
    if (saved) setAlarmSound(saved);
  }, []);

  const handleSaveAlarm = (sound: string) => {
    setAlarmSound(sound);
    localStorage.setItem('alarmSound', sound);
    
    // Test the sound
    const audio = new Audio(`/${sound}.mp3`);
    audio.play().catch(e => console.log('Audio play failed', e));
  };

  const handleSavePassword = async () => {
    if (!pwForm.old || !pwForm.new) {
      setPwStatus({ type: 'error', text: 'Harap isi kedua kolom password' });
      return;
    }
    setSavingPw(true);
    setPwStatus({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword: pwForm.old, newPassword: pwForm.new })
      });
      const data = await res.json();
      if (res.ok) {
        setPwStatus({ type: 'success', text: 'Password berhasil diubah!' });
        setPwForm({ old: '', new: '' });
      } else {
        setPwStatus({ type: 'error', text: data.error || 'Gagal mengubah password' });
      }
    } catch {
      setPwStatus({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setSavingPw(false);
    }
  };

  const fetchShares = async () => {
    setSharesLoading(true);
    try {
      const res = await fetch('/api/shares');
      const data = await res.json();
      setShares(data.shares || []);
    } catch {}
    finally { setSharesLoading(false); }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setShareStatus({ type: '', text: '' });
    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setShareStatus({ type: 'success', text: data.message });
        setInviteEmail('');
        fetchShares();
      } else {
        setShareStatus({ type: 'error', text: data.error || 'Gagal mengirim undangan' });
      }
    } catch {
      setShareStatus({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setInviting(false);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Cabut akses untuk pengguna ini?')) return;
    try {
      const res = await fetch('/api/shares', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const data = await res.json();
      if (res.ok) {
        fetchShares();
      }
    } catch {}
  };

  const fetchDevices = async () => {
    setDevicesLoading(true);
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      setDevices(data.devices || []);
    } catch {}
    finally { setDevicesLoading(false); }
  };

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceId || !newDeviceName) return;
    setAddingDevice(true);
    setDeviceStatus({ type: '', text: '' });
    try {
      const res = await fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: newDeviceId, device_name: newDeviceName })
      });
      const data = await res.json();
      if (res.ok) {
        setDeviceStatus({ type: 'success', text: data.message });
        setNewDeviceId('');
        setNewDeviceName('');
        fetchDevices();
        await fetchProfile();
      } else {
        setDeviceStatus({ type: 'error', text: data.error || 'Gagal memasangkan sensor' });
      }
    } catch {
      setDeviceStatus({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setAddingDevice(false);
    }
  };

  const handleRemoveDevice = async (id: number, deviceId: string) => {
    if (!confirm(`Putuskan hubungan sensor ini (${deviceId})?`)) return;
    try {
      const res = await fetch('/api/devices', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, device_id: deviceId })
      });
      if (res.ok) {
        fetchDevices();
        await fetchProfile();
      }
    } catch {}
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        setDeviceIdInput(data.user.device_id || '');
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchProfile();
    fetchShares();
    fetchDevices();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfilePic(url);
    }
  };

  const handleSaveDevice = async () => {
    setSavingDevice(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceIdInput })
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Perangkat berhasil dipasangkan!' });
        await fetchProfile();
      } else {
        setStatusMsg({ type: 'error', text: data.error || 'Gagal menyimpan perangkat' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setSavingDevice(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('skywatch_logged_in');
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const handleWhatsAppRedirect = (packageName: string, price: string, isPromo = false) => {
    const adminNum = "6285792524863";
    const name = user?.name || '-';
    const email = user?.email || '-';
    
    let text = `Halo Admin SkyWatch 👋\n\nSaya tertarik untuk memesan:\n📌 *${packageName}*\n💰 *${isPromo ? 'Harga Promo' : 'Harga'}:* ${price}`;
    if (isPromo) {
      text += " (Harga Coret Rp 749.000)";
    }
    text += `\n\nBerikut detail akun saya:\n👤 *Nama Akun:* ${name}\n✉️ *Email Akun:* ${email}\n\nMohon informasi mengenai prosedur pembayaran dan pengiriman alat. Terima kasih!`;
    
    const url = `https://wa.me/${adminNum}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderPackageGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Paket 1 Bulan — Bundle Alat + Web */}
      <div className="relative rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/5 bg-[#F8F9FA] dark:bg-[#FFFFFF]/[0.01] p-5 flex flex-col justify-between hover:border-purple-500/40 dark:hover:border-purple-500/40 transition-all group">
        <div className="space-y-3 text-left">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bundle Alat + Web</p>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">Langganan 1 Bulan</h3>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 dark:text-white">Rp 349.000</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Alat + Web 1 Bln</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <li className="flex items-center gap-1.5">✓ Alat Sensor ESP32 Fisik</li>
            <li className="flex items-center gap-1.5">✓ Dashboard Web Monitoring</li>
            <li className="flex items-center gap-1.5">✓ Multi-device &amp; Invite Pegawai</li>
            <li className="flex items-center gap-1.5">✓ Notifikasi &amp; Laporan Real-time</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => handleWhatsAppRedirect("Paket Langganan 1 Bulan (Bundle Alat + Web)", "Rp 349.000")}
          className="mt-5 w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:text-white text-center font-black text-[10px] uppercase tracking-wider transition-all"
        >
          Pilih Paket
        </button>
      </div>

      {/* Paket 1 Tahun — Bundle Best Value */}
      <div className="relative rounded-2xl border-2 border-[#a3e635]/40 bg-[#a3e635]/5 p-5 flex flex-col justify-between hover:border-[#a3e635] transition-all group shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)]">
        <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#a3e635] text-[#0a0f1a] text-[8px] font-black uppercase tracking-wider">Hemat</div>
        <div className="space-y-3 text-left">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Bundle Alat + Web</p>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">Langganan 1 Tahun</h3>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 line-through font-bold">Rp 749.000</span>
            <span className="text-lg font-black text-[#a3e635]">Rp 599.000</span>
            <span className="text-[9px] text-[#a3e635]/80 font-black uppercase tracking-wider mt-0.5">Alat + Web 12 Bln (Best Offer)</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <li className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">✓ Semua Fitur Paket Bulanan</li>
            <li className="flex items-center gap-1.5">✓ Akses 12 Bulan Penuh</li>
            <li className="flex items-center gap-1.5">✓ Harga Lebih Hemat</li>
            <li className="flex items-center gap-1.5">✓ Prioritas Dukungan CS</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => handleWhatsAppRedirect("Paket Langganan 1 Tahun (Bundle Alat + Web - Best Value)", "Rp 599.000", true)}
          className="mt-5 w-full py-2.5 rounded-xl bg-[#a3e635] hover:bg-[#b6f041] text-[#0a0f1a] text-center font-black text-[10px] uppercase tracking-wider transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-[#a3e635]/20"
        >
          Pilih Paket
        </button>
      </div>

      {/* Hanya Beli Alat — Tanpa Akses Dashboard */}
      <div className="relative rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/5 bg-[#F8F9FA] dark:bg-[#FFFFFF]/[0.01] p-5 flex flex-col justify-between hover:border-slate-400/40 transition-all group">
        <div className="space-y-3 text-left">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alat Saja</p>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">Hanya Beli Alat</h3>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 dark:text-white">Rp 249.000</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Modul Sensor ESP32 Saja</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">⚠ Tanpa Akses Dashboard Web Monitoring</p>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <li className="flex items-center gap-1.5">✓ Alat Sensor ESP32 Fisik</li>
            <li className="flex items-center gap-1.5 line-through opacity-50">✗ Akses Dashboard Web</li>
            <li className="flex items-center gap-1.5 line-through opacity-50">✗ Grafik &amp; Laporan Online</li>
            <li className="flex items-center gap-1.5">✓ Bisa Upgrade Kapan Saja</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => handleWhatsAppRedirect("Pembelian Hanya Alat Sensor (Modul ESP32 Saja)", "Rp 249.000")}
          className="mt-5 w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-[#FFFFFF]/10 dark:hover:bg-[#FFFFFF]/20 text-[#1E293B] dark:text-slate-400 dark:text-slate-300 text-center font-semibold text-[10px] uppercase tracking-wider transition-all"
        >
          Beli Alat Saja
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#070d1a] text-slate-900 dark:text-white transition-colors duration-300">
      {/* PAGE HEADER */}
      <div className="px-6 md:px-8 pt-7 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
          <div>
            <p className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-[0.35em] mb-1">User Settings</p>
            <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Profile
            </h1>
            <p className="text-slate-600 text-xs mt-1 font-mono">Pengaturan Akun & Aplikasi</p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 xl:px-12 pb-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Profil */}
        <div className="flex flex-col items-center text-center space-y-3 mt-2 md:mt-4">
          <div className="relative group cursor-pointer">
            <label htmlFor="profile-upload" className="cursor-pointer block relative">
              <div className="w-20 h-20 rounded-[1.5rem] bg-[#a3e635] flex items-center justify-center text-[#0a0f1a] shadow-xl shadow-lime-500/20 transition-transform group-hover:scale-105 overflow-hidden relative">
                {profilePic ? (
                  <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={40} strokeWidth={1.5} />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
            </label>
            <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#F8F9FA] dark:bg-[#070d1a] rounded-full flex items-center justify-center pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white capitalize tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {user?.name || 'Loading...'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
              Level Akses: {user?.role === 'admin' ? (
                <span className="text-purple-500">Administrator</span>
              ) : (
                <span>User</span>
              )}
            </p>
          </div>
        </div>

        {/* Grid Informasi Utama */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] border-2 border-slate-300 dark:border-slate-600 p-5 rounded-3xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors">
            <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-600 dark:text-blue-400">
              <Mail size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Email Terdaftar</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {user?.email || 'Loading...'}
              </p>
            </div>
          </div>
          
          <div className="bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] border-2 border-slate-300 dark:border-slate-600 p-5 rounded-3xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors w-full">
            <div className="p-3.5 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400 flex-shrink-0">
              <Smartphone size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Kode Unik Alat</p>
              {devices.length === 0 ? (
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                  Belum dihubungkan
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {devices.map((d: any) => (
                    <span 
                      key={d.id} 
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400"
                      title={d.device_name}
                    >
                      <span className="w-1 h-1 rounded-full bg-purple-400 dark:bg-purple-500" />
                      {d.device_id} <span className="opacity-60 font-sans font-normal">({d.device_name})</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* === KARTU STATUS LANGGANAN === */}
        {user?.role !== 'admin' && (
          <div className="mt-2 space-y-4">
            {user?.is_invited ? (
              // --- PEGAWAI / UNDANGAN ACTIVE ---
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#a3e635]/40 dark:border-[#a3e635]/20 bg-[#FFFFFF] dark:bg-[#0d1a08]/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] animate-in fade-in slide-in-from-bottom-2 duration-300 text-left group">
                <div className="absolute inset-0 bg-[#a3e635]/5" />
                <div 
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-[0.25] dark:opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.35]" 
                  style={{ backgroundColor: '#a3e635' }} 
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-[#a3e635]/40 blur-xl rounded-2xl" />
                      <div className="relative p-3.5 bg-[#a3e635]/10 border border-[#a3e635]/30 rounded-2xl">
                        <UserPlus size={22} className="text-[#a3e635]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#a3e635]/20 border border-[#a3e635]/40 text-[#a3e635]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
                          PEGAWAI / UNDANGAN AKTIF
                        </span>
                      </div>
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        Akses Monitoring Penuh
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold mt-1">
                        Hubungan Akun: Pegawai dari <span className="text-[#a3e635]">{user.invited_by_name}</span> ({user.invited_by_email})
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : user?.subscription_status === 'active' && user?.subscription_end_date && new Date(user.subscription_end_date) > new Date() ? (
              // --- PREMIUM ACTIVE ---
              <div className="relative rounded-3xl overflow-hidden border-2 border-[#a3e635]/40 dark:border-[#a3e635]/20 bg-[#FFFFFF] dark:bg-[#0d1a08]/60 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] text-left group">
                <div className="absolute inset-0 bg-[#a3e635]/5" />
                <div 
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-[0.25] dark:opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.35]" 
                  style={{ backgroundColor: '#a3e635' }} 
                />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4 text-left">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-[#a3e635]/40 blur-xl rounded-2xl" />
                      <div className="relative p-3.5 bg-[#a3e635]/10 border border-[#a3e635]/30 rounded-2xl">
                        <Crown size={22} className="text-[#a3e635]" />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-[#a3e635]/20 border border-[#a3e635]/40 text-[#a3e635]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] animate-pulse" />
                          PREMIUM ACTIVE
                        </span>
                      </div>
                      <p className="text-base font-black text-slate-900 dark:text-white">
                        {Math.max(0, Math.ceil((new Date(user.subscription_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} Hari Tersisa
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        Berakhir: {new Date(user.subscription_end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Render collapsible plans if already active, otherwise show expanded normal for Free Member */}
            {(user?.is_invited || (user?.subscription_status === 'active' && user?.subscription_end_date && new Date(user.subscription_end_date) > new Date())) ? (
              <div className="border border-[#E2E8F0] dark:border-white/10 rounded-3xl overflow-hidden bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] transition-colors">
                <button
                  type="button"
                  onClick={() => setShowPlans(!showPlans)}
                  className="w-full py-4 px-6 flex items-center justify-between text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-[#FFFFFF]/[0.04] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-purple-500/10 rounded-lg text-purple-600 dark:text-purple-400">
                      <Crown size={14} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-left">Pilihan Opsi Alat &amp; Upgrade Langganan</span>
                  </div>
                  <ChevronRight 
                    size={16} 
                    className={`transform transition-transform duration-300 text-slate-400 ${showPlans ? 'rotate-90' : 'rotate-0'}`} 
                  />
                </button>
                
                {showPlans && (
                  <div className="p-6 border-t border-[#E2E8F0] dark:border-white/10 bg-[#F8F9FA]/50 dark:bg-black/15 animate-in slide-in-from-top-2 duration-300">
                    {renderPackageGrid()}
                  </div>
                )}
              </div>
            ) : (
              // --- FREE MEMBER (Daftar paket terbuka penuh seperti biasa) ---
              <div className="relative rounded-3xl overflow-hidden border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.03] p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] space-y-6 text-left group transition-all duration-300">
                <div 
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full blur-3xl opacity-[0.25] dark:opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.35]" 
                  style={{ backgroundColor: '#94a3b8' }} 
                />
                
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-[#E2E8F0] dark:border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-slate-100 dark:bg-[#FFFFFF]/5 border border-[#E2E8F0] dark:border-white/10 rounded-2xl">
                      <Crown size={22} className="text-slate-400 dark:text-slate-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-widest bg-slate-100 dark:bg-[#FFFFFF]/5 border-2 border-slate-300 dark:border-slate-600 text-[#1E293B] dark:text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                          FREE MEMBER
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Akses Terbatas (Dasbor Terkunci)</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Pilih salah satu opsi paket di bawah untuk mengaktifkan seluruh fitur monitoring dan multi-device sharing
                      </p>
                    </div>
                  </div>
                </div>

                {renderPackageGrid()}
              </div>
            )}
          </div>
        )}

        {/* Form Pemasangan Alat (Multi-Device) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Hubungkan Alat (Multi-Device Pairing)</h2>
          </div>
          
          <div className="bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] border-2 border-slate-300 dark:border-slate-600 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors space-y-6">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Daftarkan satu atau **beberapa sensor ESP32 sekaligus** ke akun ini. Anda dapat memantau, memberi nama, dan beralih di antara sensor-sensor ini secara langsung dari halaman Dasbor Utama.
            </p>
            
            {/* Form Tambah Alat */}
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Perangkat (Device ID)</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: ESP32_SKY_01"
                    value={newDeviceId}
                    onChange={e => setNewDeviceId(e.target.value)}
                    className="w-full bg-[#F8F9FA] dark:bg-[#0a0f1a] border-2 border-slate-300 dark:border-slate-600 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lokasi/Sensor</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Restoran Area Depan"
                    value={newDeviceName}
                    onChange={e => setNewDeviceName(e.target.value)}
                    className="w-full bg-[#F8F9FA] dark:bg-[#0a0f1a] border-2 border-slate-300 dark:border-slate-600 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={addingDevice || !newDeviceId || !newDeviceName}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-purple-500/10 hover:shadow-purple-500/25"
              >
                {addingDevice ? <RefreshCw size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Hubungkan Sensor Baru
              </button>
            </form>

            {deviceStatus.text && (
              <div className={`px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                deviceStatus.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                {deviceStatus.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                {deviceStatus.text}
              </div>
            )}

            {/* List Alat Terhubung */}
            <div className="pt-5 border-t border-[#E2E8F0] dark:border-white/5 space-y-3">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daftar Sensor Terhubung ({devices.length})</h3>

              {devicesLoading ? (
                <div className="text-xs text-slate-400 flex items-center gap-2 py-3">
                  <RefreshCw size={12} className="animate-spin" /> Memuat daftar alat...
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-6 border-2 border-dashed border-[#E2E8F0] dark:border-white/5 rounded-2xl">
                  <p className="text-xs text-slate-400 italic">Belum ada sensor yang terhubung ke akun ini.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {devices.map((dev: any) => (
                    <div key={dev.id} className="flex items-center justify-between p-4 bg-[#F8F9FA] dark:bg-[#FFFFFF]/[0.02] border-2 border-slate-300 dark:border-slate-600 rounded-2xl">
                      <div className="min-w-0 pr-3">
                        <p className="text-xs font-black text-slate-800 dark:text-slate-200">{dev.device_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{dev.device_id}</p>
                      </div>
                      <button 
                        onClick={() => handleRemoveDevice(dev.id, dev.device_id)}
                        className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500/20 transition-all flex-shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>



        {/* Pengaturan Ambang Batas (Read-Only) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Ambang Batas Sensor</h2>
          </div>
          
          <div className="bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] border-2 border-slate-300 dark:border-slate-600 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-2xl leading-relaxed">
              Berikut adalah nilai ambang batas sensor saat ini. Pengaturan ini hanya dapat diubah oleh Administrator melalui halaman dasbor admin.
            </p>
            {isLoaded ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {Object.entries(thresholds).map(([key, val]) => (
                  <div key={key} className="bg-[#F8F9FA] dark:bg-[#FFFFFF]/[0.03] border-2 border-slate-300 dark:border-slate-600 p-3 rounded-2xl text-center">
                    <p className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-1">
                      {key}
                    </p>
                    <p className="text-lg font-black text-slate-800 dark:text-slate-200 font-mono">
                      {val} <span className="text-[10px] text-slate-400 font-sans">{key === 'co2' || key === 'nh3' || key === 'voc' ? 'PPM' : key === 'temp' ? '°C' : '%'}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 flex items-center py-6 animate-pulse gap-3 font-bold uppercase tracking-widest">
                <RefreshCw size={16} className="animate-spin" />
                Memuat konfigurasi...
              </div>
            )}
          </div>
        </div>

        {/* Menu Pengaturan Aplikasi */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Pengaturan Aplikasi</h2>
          </div>
          
          <div className="bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] border-2 border-slate-300 dark:border-slate-600 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors">
            
            {/* Keamanan Akun */}
            <div className="border-b border-[#E2E8F0] dark:border-white/10">
              <button onClick={() => setActiveMenu(activeMenu === 'security' ? null : 'security')} className="w-full flex items-center justify-between p-5 hover:bg-[#F8F9FA] dark:hover:bg-[#FFFFFF]/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Keamanan Akun (Ganti Password)
                  </span>
                </div>
                <div className={`w-8 h-8 rounded-full border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center transition-transform ${activeMenu === 'security' ? 'rotate-90' : ''}`}>
                  <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
                </div>
              </button>
              
              {activeMenu === 'security' && (
                <div className="p-6 pt-2 bg-[#F8F9FA]/50 dark:bg-[#FFFFFF]/[0.01] animate-in slide-in-from-top-2">
                  <div className="space-y-3 max-w-sm">
                    <input type="password" placeholder="Password Lama" value={pwForm.old} onChange={e => setPwForm({...pwForm, old: e.target.value})} className="w-full bg-[#FFFFFF] dark:bg-[#0a0f1a] border border-[#E2E8F0] dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    <input type="password" placeholder="Password Baru" value={pwForm.new} onChange={e => setPwForm({...pwForm, new: e.target.value})} className="w-full bg-[#FFFFFF] dark:bg-[#0a0f1a] border border-[#E2E8F0] dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    <button onClick={handleSavePassword} disabled={savingPw} className="w-full px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50">
                      {savingPw ? 'Menyimpan...' : 'Simpan Password'}
                    </button>
                    {pwStatus.text && (
                      <p className={`text-xs font-bold mt-2 ${pwStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {pwStatus.text}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Kelola Akses Pegawai / Share Alat */}
            <div className="border-b border-[#E2E8F0] dark:border-white/10">
              <button onClick={() => setActiveMenu(activeMenu === 'sharing' ? null : 'sharing')} className="w-full flex items-center justify-between p-5 hover:bg-[#F8F9FA] dark:hover:bg-[#FFFFFF]/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                    <UserPlus size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Kelola Akses Pegawai (Undang User)
                  </span>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center transition-transform ${activeMenu === 'sharing' ? 'rotate-90' : ''}`}>
                  <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
                </div>
              </button>
              
              {activeMenu === 'sharing' && (
                <div className="p-6 pt-2 bg-[#F8F9FA]/50 dark:bg-[#FFFFFF]/[0.01] animate-in slide-in-from-top-2">
                  {user?.role !== 'admin' && !(user?.subscription_status === 'active' && user?.subscription_end_date && new Date(user.subscription_end_date) > new Date()) ? (
                    // NOT PREMIUM
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold space-y-2">
                      <p>Fitur Kelola Pegawai/Akses Multi-User hanya tersedia untuk pelanggan Premium Active.</p>
                      <a
                        href={`https://wa.me/6285792524863?text=${encodeURIComponent(`Halo Admin, saya ingin upgrade ke Premium agar bisa mengundang pegawai saya untuk monitoring alat.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black text-[10px] uppercase tracking-wider shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] hover:bg-amber-600 transition-colors"
                      >
                        <Crown size={11} /> Upgrade Sekarang
                      </a>
                    </div>
                  ) : (
                    // PREMIUM ACTIVE
                    <div className="space-y-5">
                      {/* Panduan Cara Akses Pegawai */}
                      <div className="p-4 rounded-2xl bg-blue-500/8 border border-blue-500/15 space-y-3">
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
                          <span>ℹ️</span> Cara Pegawai Mengakses Dashboard
                        </p>
                        <ol className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                          <li className="flex gap-2.5">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-500 text-[9px] font-black flex items-center justify-center">1</span>
                            <span>Pegawai membuka halaman <strong>Register</strong> di SkyWatch</span>
                          </li>
                          <li className="flex gap-2.5">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-500 text-[9px] font-black flex items-center justify-center">2</span>
                            <span>Mendaftar menggunakan <strong>email yang sama persis</strong> dengan yang Anda undang di bawah</span>
                          </li>
                          <li className="flex gap-2.5">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500/15 border border-blue-500/20 text-blue-500 text-[9px] font-black flex items-center justify-center">3</span>
                            <span>Setelah login, dashboard pegawai otomatis menampilkan data sensor milik Anda</span>
                          </li>
                        </ol>
                        <div className="flex flex-wrap gap-2 pt-1">
                          <a
                            href="/register"
                            className="text-[10px] font-black bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-500 px-3 py-1.5 rounded-lg transition-all"
                          >
                            Buka Halaman Register →
                          </a>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        Masukkan email pegawai/pengawas yang ingin Anda undang untuk memantau sensor Anda:
                      </p>

                      <form onSubmit={handleInvite} className="flex gap-2">
                        <input
                          type="email"
                          placeholder="email.pegawai@anda.com"
                          value={inviteEmail}
                          onChange={e => setInviteEmail(e.target.value)}
                          className="flex-1 bg-[#FFFFFF] dark:bg-[#0a0f1a] border-2 border-[#E2E8F0] dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-white"
                        />
                        <button type="submit" disabled={inviting || !inviteEmail}
                          className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50">
                          {inviting ? 'Mengundang...' : 'Undang'}
                        </button>
                      </form>

                      {shareStatus.text && (
                        <p className={`text-xs font-bold ${shareStatus.type === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {shareStatus.text}
                        </p>
                      )}

                      <div className="pt-3 border-t border-[#E2E8F0] dark:border-white/5">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Daftar Pegawai yang Diundang ({shares.length})</p>
                        
                        {sharesLoading ? (
                          <div className="text-xs text-slate-400 flex items-center gap-2 py-3"><RefreshCw size={12} className="animate-spin" /> Memuat data...</div>
                        ) : shares.length === 0 ? (
                          <p className="text-xs text-slate-400 py-3 italic">Belum ada pegawai yang diundang.</p>
                        ) : (
                          <div className="space-y-2">
                            {shares.map((s: any) => (
                              <div key={s.id} className="flex items-center justify-between p-3.5 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.02] border-2 border-slate-300 dark:border-slate-600 rounded-2xl">
                                <div className="min-w-0-fake flex-1 min-w-0 pr-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{s.member_name || '—'}</p>
                                    {s.member_name ? (
                                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 uppercase tracking-wider">Aktif</span>
                                    ) : (
                                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 uppercase tracking-wider">Belum Daftar</span>
                                    )}
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-mono truncate">{s.member_email}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {/* Tombol Salin Link */}
                                  <button
                                    onClick={() => handleCopyLink(s.id, s.member_email)}
                                    title="Salin Link Undangan"
                                    className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                                      copiedId === s.id
                                        ? 'bg-[#a3e635]/15 border-[#a3e635]/30 text-[#a3e635]'
                                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-[#FFFFFF]/5 dark:hover:bg-[#FFFFFF]/10 border-[#E2E8F0] dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    {copiedId === s.id ? (
                                      <span className="text-[9px] font-black uppercase tracking-wider px-1 flex items-center gap-1">
                                        <Check size={11} strokeWidth={3} /> Salin!
                                      </span>
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                  </button>

                                  <button onClick={() => handleRevoke(s.id)} title="Cabut Akses" className="p-2 rounded-xl bg-red-500/15 border border-red-500/20 text-red-500 hover:bg-red-500/25 transition-all">
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notifikasi Bahaya */}
            <div className="border-b border-[#E2E8F0] dark:border-white/10">
              <button onClick={() => setActiveMenu(activeMenu === 'alarm' ? null : 'alarm')} className="w-full flex items-center justify-between p-5 hover:bg-[#F8F9FA] dark:hover:bg-[#FFFFFF]/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                    <Bell size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Notifikasi Bahaya (Suara Alarm)
                  </span>
                </div>
                <div className={`w-8 h-8 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center transition-transform ${activeMenu === 'alarm' ? 'rotate-90' : ''}`}>
                  <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
                </div>
              </button>
              
              {activeMenu === 'alarm' && (
                <div className="p-6 pt-2 bg-[#F8F9FA]/50 dark:bg-[#FFFFFF]/[0.01] animate-in slide-in-from-top-2">
                  <p className="text-xs text-slate-500 mb-4">Pilih suara peringatan saat sensor mendeteksi bahaya:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'siren', label: 'Sirine Polisi' },
                      { id: 'beep', label: 'Beep Cepat' },
                      { id: 'bell', label: 'Lonceng Alarm' }
                    ].map(sound => (
                      <button 
                        key={sound.id}
                        onClick={() => handleSaveAlarm(sound.id)}
                        className={`py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                          alarmSound === sound.id 
                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400' 
                            : 'bg-[#FFFFFF] dark:bg-[#FFFFFF]/5 border-[#E2E8F0] dark:border-white/10 text-slate-500 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        {sound.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Layanan Pengaduan */}
            <div>
              <button 
                onClick={() => router.push('/complaints')} 
                className="w-full flex items-center justify-between p-5 hover:bg-[#F8F9FA] dark:hover:bg-[#FFFFFF]/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-teal-500/10 text-teal-500 group-hover:scale-110 transition-transform">
                    <MessageCircle size={20} />
                  </div>
                  <div className="text-left">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors block">
                      Layanan Pengaduan (Bantuan Teknis)
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Laporkan kendala alat, sistem, atau ajukan keluhan teknis lainnya
                    </span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full border border-[#E2E8F0] dark:border-white/10 flex items-center justify-center">
                  <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full bg-[#FFFFFF] dark:bg-red-500/[0.02] hover:bg-red-50 dark:hover:bg-red-500/[0.05] border-2 border-red-500/20 py-5 rounded-3xl flex items-center justify-center gap-3 transition-all group shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mt-8"
        >
          <LogOut size={20} className="text-red-500 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black text-red-500 uppercase tracking-widest">Keluar Akun</span>
        </button>
      </div>
    </div>
  );
}