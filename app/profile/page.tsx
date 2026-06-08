"use client";
import React, { useState, useEffect } from 'react';
import { useThresholds } from '@/app/hooks/useThresholds';
import { 
  User, Mail, ShieldCheck, Bell, Smartphone, LogOut,
  ChevronRight, UserCircle, RefreshCw, Camera, Check, AlertTriangle,
  Crown, Zap, MessageCircle, UserPlus, Trash2, Copy
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/app/hooks/useLanguage';

export default function ProfilePage() {
  const { lang, t } = useLanguage();
  const { thresholds, saveThresholds, isLoaded } = useThresholds();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [user, setUser] = useState<any>(null);
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileStatus, setProfileStatus] = useState({ type: '', text: '' });
  const [deviceIdInput, setDeviceIdInput] = useState('');
  const [savingDevice, setSavingDevice] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [alarmSound, setAlarmSound] = useState('siren');
  const [savedAlarmSound, setSavedAlarmSound] = useState('siren');
  const [alarmSuccess, setAlarmSuccess] = useState('');
  const [pwForm, setPwForm] = useState({ old: '', new: '' });
  const [pwStatus, setPwStatus] = useState({ type: '', text: '' });
  const [savingPw, setSavingPw] = useState(false);
  
  // States sharing alat (invite pegawai)
  const [shares, setShares] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDeviceId, setInviteDeviceId] = useState('');
  const [inviting, setInviting] = useState(false);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [shareStatus, setShareStatus] = useState({ type: '', text: '' });

  // States multi-device (banyak sensor)
  const [devices, setDevices] = useState<any[]>([]);
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState('real');
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
    if (saved) {
      setAlarmSound(saved);
      setSavedAlarmSound(saved);
    }
  }, []);

  const handleSelectAlarm = (sound: string) => {
    setAlarmSound(sound);
    // Test the sound
    const audio = new Audio(`/${sound}.mp3`);
    audio.play().catch(e => {
      console.log('Audio play failed, falling back to synthesis', e);
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (sound === 'beep') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
          osc.start();
          osc.stop(ctx.currentTime + 0.1);
        } else if (sound === 'bell') {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(600, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
          osc.start();
          osc.stop(ctx.currentTime + 1.5);
        } else {
          // siren
          osc.type = 'square';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.2);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch (err) {
        console.error('Web Audio synthesis failed', err);
      }
    });
  };

  const handleSaveAlarm = () => {
    localStorage.setItem('alarmSound', alarmSound);
    setSavedAlarmSound(alarmSound);
    setAlarmSuccess(t('Suara alarm berhasil disimpan!', 'Alarm sound saved successfully!'));
    setTimeout(() => setAlarmSuccess(''), 3000);
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
    if (!inviteEmail || !inviteDeviceId) return;
    setInviting(true);
    setShareStatus({ type: '', text: '' });
    try {
      const res = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, device_id: inviteDeviceId })
      });
      const data = await res.json();
      if (res.ok) {
        setShareStatus({ type: 'success', text: data.message });
        setInviteEmail('');
        setInviteDeviceId('');
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
        body: JSON.stringify({ 
          device_id: newDeviceId, 
          device_name: newDeviceName,
          device_type: devices.length === 0 ? 'real' : newDeviceType 
        })
      });
      const data = await res.json();
      if (res.ok) {
        setDeviceStatus({ type: 'success', text: data.message });
        setNewDeviceId('');
        setNewDeviceName('');
        setNewDeviceType('real');
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
        setNameInput(data.user.name || '');
        setPhoneInput(data.user.phone || '');
        setDeviceIdInput(data.user.device_id || '');
        // Load foto profil dari server jika ada
        if (data.user.profile_pic) {
          setProfilePic(data.user.profile_pic + '?t=' + Date.now());
        }
      }
    } catch (e) {}
  };

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) {
      setProfileStatus({ type: 'error', text: 'Nama Lengkap wajib diisi' });
      return;
    }
    setSavingProfile(true);
    setProfileStatus({ type: '', text: '' });
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: nameInput, phone: phoneInput })
      });
      const data = await res.json();
      if (res.ok) {
        setProfileStatus({ type: 'success', text: 'Profil berhasil diperbarui!' });
        await fetchProfile();
      } else {
        setProfileStatus({ type: 'error', text: data.error || 'Gagal memperbarui profil' });
      }
    } catch {
      setProfileStatus({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setSavingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchShares();
    fetchDevices();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Tampilkan preview lokal dulu
      const previewUrl = URL.createObjectURL(file);
      setProfilePic(previewUrl);
      setUploadingPic(true);
      setUploadStatus('');
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/auth/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          setProfilePic(data.url); // URL dari server dengan cache busting
          setUploadStatus('success');
          // Refresh data user
          await fetchProfile();
        } else {
          setUploadStatus('error');
          setUploadStatus(data.error || 'Gagal mengupload foto');
        }
      } catch {
        setUploadStatus('Terjadi kesalahan saat upload');
      } finally {
        setUploadingPic(false);
      }
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
      <div className="relative rounded-2xl border border-slate-200 border-t-[1.5px] dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5 flex flex-col justify-between hover:border-purple-500/40 dark:hover:border-purple-500/40 transition-all group">
        <div className="space-y-3 text-left">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Bundle Alat + Web', 'Device + Web Bundle')}</p>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">{t('Langganan 1 Bulan', '1 Month Subscription')}</h3>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 dark:text-white">Rp 349.000</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{t('Alat + Web 1 Bln', 'Device + Web 1 Month')}</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <li className="flex items-center gap-1.5">✓ {t('Alat Sensor ESP32 Fisik', 'Physical ESP32 Sensor Device')}</li>
            <li className="flex items-center gap-1.5">✓ {t('Dashboard Web Monitoring', 'Web Monitoring Dashboard')}</li>
            <li className="flex items-center gap-1.5">✓ {t('Multi-device & Invite Pegawai', 'Multi-device & Employee Invitation')}</li>
            <li className="flex items-center gap-1.5">✓ {t('Notifikasi & Laporan Real-time', 'Real-time Notifications & Reports')}</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => handleWhatsAppRedirect("Paket Langganan 1 Bulan (Bundle Alat + Web)", "Rp 349.000")}
          className="mt-5 w-full py-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500 border border-purple-500/20 text-purple-600 dark:text-purple-400 hover:text-white text-center font-black text-[10px] uppercase tracking-wider transition-all"
        >
          {t('Pilih Paket', 'Select Package')}
        </button>
      </div>

      {/* Paket 1 Tahun — Bundle Best Value */}
      <div className="relative rounded-2xl border-2 border-[#4edea3]/40 bg-[#4edea3]/5 p-5 flex flex-col justify-between hover:border-[#4edea3] transition-all group shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)]">
        <div className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full bg-[#4edea3] text-[#0a0f1a] text-[8px] font-black uppercase tracking-wider">{t('Hemat', 'Save')}</div>
        <div className="space-y-3 text-left">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Bundle Alat + Web', 'Device + Web Bundle')}</p>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">{t('Langganan 1 Tahun', '1 Year Subscription')}</h3>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 line-through font-bold">Rp 749.000</span>
            <span className="text-lg font-black text-[#059669] dark:text-[#4edea3]">Rp 599.000</span>
            <span className="text-[9px] text-[#047857] dark:text-[#4edea3]/80 font-black uppercase tracking-wider mt-0.5">{t('Alat + Web 12 Bln (Best Offer)', 'Device + Web 12 Months (Best Offer)')}</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <li className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-300">✓ {t('Semua Fitur Paket Bulanan', 'All Monthly Package Features')}</li>
            <li className="flex items-center gap-1.5">✓ {t('Akses 12 Bulan Penuh', 'Full 12-Month Access')}</li>
            <li className="flex items-center gap-1.5">✓ {t('Harga Lebih Hemat', 'More Cost-effective Price')}</li>
            <li className="flex items-center gap-1.5">✓ {t('Prioritas Dukungan CS', 'Priority CS Support')}</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => handleWhatsAppRedirect("Paket Langganan 1 Tahun (Bundle Alat + Web - Best Value)", "Rp 599.000", true)}
          className="mt-5 w-full py-2.5 rounded-xl bg-[#4edea3] hover:bg-[#5cebb2] text-[#0a0f1a] text-center font-black text-[10px] uppercase tracking-wider transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-[#4edea3]/20"
        >
          {t('Pilih Paket', 'Select Package')}
        </button>
      </div>

      {/* Hanya Beli Alat — Tanpa Akses Dashboard */}
      <div className="relative rounded-2xl border border-slate-200 border-t-[1.5px] dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 p-5 flex flex-col justify-between hover:border-slate-400/40 transition-all group">
        <div className="space-y-3 text-left">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t('Alat Saja', 'Device Only')}</p>
          <h3 className="text-sm font-black text-slate-800 dark:text-white">{t('Hanya Beli Alat', 'Buy Device Only')}</h3>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 dark:text-white">Rp 249.000</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{t('Modul Sensor ESP32 Saja', 'ESP32 Sensor Module Only')}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{t('⚠ Tanpa Akses Dashboard Web Monitoring', '⚠ Without Web Monitoring Dashboard Access')}</p>
          </div>
          <ul className="space-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <li className="flex items-center gap-1.5">✓ {t('Alat Sensor ESP32 Fisik', 'Physical ESP32 Sensor Device')}</li>
            <li className="flex items-center gap-1.5 line-through opacity-50">✗ {t('Akses Dashboard Web', 'Web Dashboard Access')}</li>
            <li className="flex items-center gap-1.5 line-through opacity-50">✗ {t('Grafik & Laporan Online', 'Online Charts & Reports')}</li>
            <li className="flex items-center gap-1.5">✓ {t('Bisa Upgrade Kapan Saja', 'Can Upgrade Anytime')}</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => handleWhatsAppRedirect("Pembelian Hanya Alat Sensor (Modul ESP32 Saja)", "Rp 249.000")}
          className="mt-5 w-full py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-center font-semibold text-[10px] uppercase tracking-wider transition-all"
        >
          {t('Beli Alat Saja', 'Buy Device Only')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="px-6 md:px-10 xl:px-12 pt-7 pb-8 space-y-6 w-full transition-colors duration-300">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full border-b border-slate-200/60 dark:border-slate-800/40 pb-5">
        <div>
          <p className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">{t('Pengaturan Pengguna', 'User Settings')}</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {t('Profil', 'Profile')}
          </h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs mt-1">{t('Pengaturan Akun & Konfigurasi Aplikasi', 'Account Settings & App Configuration')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Profile info & subscription */}
        <div className="lg:col-span-4 space-y-6">
          {/* Profile Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-6 text-center relative overflow-hidden group transition-all duration-300">
            {/* Glow effect */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-[0.15] dark:opacity-10 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.25]" style={{ backgroundColor: '#10b981' }} />
            
            <div className="relative z-10 flex flex-col items-center">
              <label htmlFor="profile-upload" className="cursor-pointer block relative mb-4">
                <div className={`w-24 h-24 rounded-2xl bg-emerald-500/10 border-2 ${uploadingPic ? 'border-[#4edea3] animate-pulse' : 'border-emerald-500/20'} flex items-center justify-center text-emerald-600 dark:text-emerald-500 shadow-sm transition-transform hover:scale-105 overflow-hidden relative`}>
                  {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle size={48} strokeWidth={1.5} />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    {uploadingPic ? (
                      <RefreshCw size={18} className="text-white animate-spin" />
                    ) : (
                      <Camera size={20} className="text-white" />
                    )}
                  </div>
                </div>
              </label>
              <input id="profile-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              {uploadingPic && (
                <p className="text-[10px] text-[#4edea3] font-bold mb-1 animate-pulse">{t('Mengupload foto...', 'Uploading photo...')}</p>
              )}
              {uploadStatus === 'success' && (
                <p className="text-[10px] text-emerald-600 dark:text-emerald-500 font-bold mb-1 flex items-center gap-1"><Check size={10} /> {t('Foto tersimpan!', 'Photo saved!')}</p>
              )}
              
              <h2 className="text-lg font-black text-slate-950 dark:text-white capitalize tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {user?.name || 'Loading...'}
              </h2>
              <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                {user?.role === 'admin' ? 'Administrator' : t('Pengguna', 'User')}
              </div>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/60 text-left space-y-4">
              <div>
                <p className="text-[9px] font-black text-slate-405 dark:text-slate-500 uppercase tracking-widest mb-1">{t('Email Terdaftar', 'Registered Email')}</p>
                <p className="text-xs font-bold text-slate-850 dark:text-slate-350 font-mono truncate">{user?.email || 'Loading...'}</p>
              </div>
            </div>
          </div>

          {/* Subscription Card */}
          {user?.role !== 'admin' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-6 relative overflow-hidden group transition-all duration-300">
              <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('Status Layanan', 'Service Status')}</h3>
              {user?.is_invited ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 border border-emerald-500/30">
                    {t('Karyawan Aktif', 'Active Employee')}
                  </span>
                  <p className="text-xs font-bold text-slate-850 dark:text-white">{t('Akses Penuh', 'Full Access')}</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-normal pt-1">
                    {t('Diundang oleh:', 'Invited by:')} <span className="font-semibold text-emerald-600 dark:text-emerald-450">{user.invited_by_name}</span> ({user.invited_by_email})
                  </p>
                </div>
              ) : user?.subscription_status === 'active' && user?.subscription_end_date && new Date(user.subscription_end_date) > new Date() ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl space-y-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-600 dark:text-emerald-500 border border-emerald-500/30">
                    Premium Active
                  </span>
                  <p className="text-sm font-black text-slate-900 dark:text-white leading-none">
                    {Math.max(0, Math.ceil((new Date(user.subscription_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} {t('Hari Tersisa', 'Days Remaining')}
                  </p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-550 font-mono pt-1">
                    Berakhir: {new Date(user.subscription_end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-850 p-4 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-450" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t('Anggota Gratis', 'Free Member')}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed">
                    {t('Akses pemantauan web dan notifikasi alarm darurat terbatas. Silakan upgrade untuk membuka sirkulasi dashboard penuh.', 'Web monitoring access and emergency alarm notifications are limited. Please upgrade to unlock the full dashboard.')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Threshold references */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-6 relative overflow-hidden group transition-all duration-300">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{t('Nilai Batas Sensor', 'Sensor Threshold Values')}</h3>
            {isLoaded ? (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(thresholds).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800/80 p-2.5 rounded-xl text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                      {key === 'co2' ? 'CO₂' : key === 'nh3' ? 'NH₃' : key === 'voc' ? 'VOC' : key === 'temp' ? t('Suhu', 'TEMP') : t('Kelembapan', 'HUM')}
                    </p>
                    <p className="text-sm font-black text-slate-900 dark:text-white font-mono">
                      {val} <span className="text-[9px] text-slate-400 font-normal font-sans">{key === 'co2' || key === 'nh3' || key === 'voc' ? 'PPM' : key === 'temp' ? '°C' : '%'}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-555 flex items-center py-4 animate-pulse gap-2">
                <RefreshCw size={12} className="animate-spin" />
                <span>{t('Memuat batas...', 'Loading thresholds...')}</span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Settings menu & device integration */}
        <div className="lg:col-span-8 space-y-6">
          {/* Collapsible plans package grid */}
          {user?.role !== 'admin' && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden transition-colors">
              <button
                type="button"
                onClick={() => setShowPlans(!showPlans)}
                className="w-full py-4 px-6 flex items-center justify-between text-slate-700 dark:text-slate-355 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition-all border-b border-transparent data-[open=true]:border-slate-100 dark:data-[open=true]:border-slate-800"
                data-open={showPlans}
              >
                <div className="flex items-center gap-2.5">
                  <Crown size={14} className="text-amber-600 dark:text-amber-500" />
                  <span className="text-xs font-black uppercase tracking-widest">{t('Opsi Upgrade & Paket Alat', 'Upgrade Options & Device Packages')}</span>
                </div>
                <ChevronRight 
                  size={14} 
                  className={`transform transition-transform duration-300 text-slate-400 ${showPlans ? 'rotate-90' : 'rotate-0'}`} 
                />
              </button>
              {(showPlans || !(user?.is_invited || (user?.subscription_status === 'active' && user?.subscription_end_date && new Date(user.subscription_end_date) > new Date()))) && (
                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 animate-in slide-in-from-top-2">
                  {renderPackageGrid()}
                </div>
              )}
            </div>
          )}

          {/* Device Management Pairing Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-6 relative overflow-hidden group transition-all duration-300">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-2">{t('Pasangkan Sensor (Multi-Device)', 'Pair Sensor (Multi-Device)')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              {t('Tambahkan satu atau beberapa perangkat ESP32 ke akun Anda untuk memonitor beberapa titik area dapur terpisah secara real-time.', 'Add one or more ESP32 devices to your account to monitor multiple separate kitchen areas in real-time.')}
            </p>

            <form onSubmit={handleAddDevice} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6">
              <div className={devices.length > 0 ? "sm:col-span-4" : "sm:col-span-5"}>
                <input 
                  type="text" 
                  placeholder={t('ID Perangkat (e.g. ESP32_KITCHEN_02)', 'Device ID (e.g. ESP32_KITCHEN_02)')}
                  value={newDeviceId}
                  onChange={e => setNewDeviceId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              <div className={devices.length > 0 ? "sm:col-span-3" : "sm:col-span-4"}>
                <input 
                  type="text" 
                  placeholder={t('Nama Lokasi/Sensor', 'Location/Sensor Name')}
                  value={newDeviceName}
                  onChange={e => setNewDeviceName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
              {devices.length > 0 && (
                <div className="sm:col-span-3">
                  <select
                    value={newDeviceType}
                    onChange={e => setNewDeviceType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer font-bold"
                  >
                    <option value="real">{t('Real (Alat Asli)', 'Real (Actual Device)')}</option>
                    <option value="sim">{t('Sim (Wokwi)', 'Sim (Wokwi)')}</option>
                  </select>
                </div>
              )}
              <div className={devices.length > 0 ? "sm:col-span-2" : "sm:col-span-3"}>
                <button 
                  type="submit"
                  disabled={addingDevice || !newDeviceId || !newDeviceName}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm"
                >
                  {addingDevice ? <RefreshCw size={12} className="animate-spin" /> : <UserPlus size={12} />}
                  <span>{t('Pasang', 'Pair')}</span>
                </button>
              </div>
            </form>

            {deviceStatus.text && (
              <div className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 mb-6 ${
                deviceStatus.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-500' 
                  : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-500'
              }`}>
                {deviceStatus.type === 'success' ? <Check size={12} /> : <AlertTriangle size={12} />}
                <span>{deviceStatus.text}</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
              <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('Daftar Sensor Aktif', 'Active Sensors List')} ({devices.length})</h4>
              {devicesLoading ? (
                <div className="text-xs text-slate-450 flex items-center gap-2 py-2">
                  <RefreshCw size={11} className="animate-spin" />
                  <span>{t('Memuat daftar alat...', 'Loading device list...')}</span>
                </div>
              ) : devices.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-transparent">
                  <p className="text-xs text-slate-400 italic">{t('Belum ada sensor yang dipasangkan ke akun ini.', 'No sensors have been paired with this account yet.')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {devices.map((dev: any) => (
                    <div key={dev.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl">
                      <div className="min-w-0 pr-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{dev.device_name}</p>
                          <span className={`text-[8px] font-black px-1.5 py-0.25 rounded uppercase tracking-wider ${
                            dev.device_type === 'sim' 
                              ? 'bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-450' 
                              : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450'
                          }`}>
                            {dev.device_type === 'sim' ? 'SIM' : 'REAL'}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-450 font-mono truncate">{dev.device_id}</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveDevice(dev.id, dev.device_id)}
                        className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 hover:bg-red-500/20 transition-all flex-shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Application Settings Accordion Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm overflow-hidden transition-colors">
            {/* Edit Profil & WhatsApp */}
            <div className="border-b border-slate-100 dark:border-slate-800/80">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'profile-edit' ? null : 'profile-edit')} 
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-850/45 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-xl">
                    <Smartphone size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-355">
                    {t('Edit Profil (Nama & WhatsApp)', 'Edit Profile (Name & WhatsApp)')}
                  </span>
                </div>
                <ChevronRight size={14} className={`text-slate-400 dark:text-slate-500 transform transition-transform ${activeMenu === 'profile-edit' ? 'rotate-90' : ''}`} />
              </button>
              
              {activeMenu === 'profile-edit' && (
                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 animate-in slide-in-from-top-2">
                  <div className="space-y-4 max-w-sm">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('Nama Lengkap', 'Full Name')}</label>
                      <input 
                        type="text" 
                        placeholder={t('Nama Lengkap', 'Full Name')} 
                        value={nameInput} 
                        onChange={e => setNameInput(e.target.value)} 
                        className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">{t('Nomor WhatsApp', 'WhatsApp Number')}</label>
                      <input 
                        type="text" 
                        placeholder={t('Contoh: 085792524863', 'Example: 085792524863')} 
                        value={phoneInput} 
                        onChange={e => setPhoneInput(e.target.value)} 
                        className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all dark:text-white" 
                      />
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{t('Masukkan nomor WhatsApp aktif Anda agar notifikasi bahaya dikirim langsung via chat.', 'Enter your active WhatsApp number so danger notifications can be sent directly via chat.')}</p>
                    </div>
                    <button 
                      onClick={handleSaveProfile} 
                      disabled={savingProfile} 
                      className="w-full px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
                    >
                      {savingProfile ? t('Menyimpan...', 'Saving...') : t('Simpan Perubahan', 'Save Changes')}
                    </button>
                    {profileStatus.text && (
                      <p className={`text-xs font-bold mt-2 ${profileStatus.type === 'success' ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                        {profileStatus.text}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Keamanan Akun */}
            <div className="border-b border-slate-100 dark:border-slate-800/80">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'security' ? null : 'security')} 
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-850/45 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-blue-500/10 text-blue-600 dark:text-blue-500 rounded-xl">
                    <ShieldCheck size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-355">
                    {t('Keamanan Akun (Ganti Password)', 'Account Security (Change Password)')}
                  </span>
                </div>
                <ChevronRight size={14} className={`text-slate-400 dark:text-slate-500 transform transition-transform ${activeMenu === 'security' ? 'rotate-90' : ''}`} />
              </button>
              
              {activeMenu === 'security' && (
                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 animate-in slide-in-from-top-2">
                  <div className="space-y-3 max-w-sm">
                    <input type="password" placeholder={t('Password Lama', 'Old Password')} value={pwForm.old} onChange={e => setPwForm({...pwForm, old: e.target.value})} className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    <input type="password" placeholder={t('Password Baru', 'New Password')} value={pwForm.new} onChange={e => setPwForm({...pwForm, new: e.target.value})} className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all" />
                    <button onClick={handleSavePassword} disabled={savingPw} className="w-full px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm">
                      {savingPw ? t('Menyimpan...', 'Saving...') : t('Simpan Password', 'Save Password')}
                    </button>
                    {pwStatus.text && (
                      <p className={`text-xs font-bold mt-2 ${pwStatus.type === 'success' ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                        {pwStatus.text}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Kelola Akses Pegawai */}
            <div className="border-b border-slate-100 dark:border-slate-800/80">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'sharing' ? null : 'sharing')} 
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-850/45 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-500 rounded-xl">
                    <UserPlus size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-355">
                    {t('Kelola Akses Pegawai (Undang User)', 'Manage Employee Access (Invite User)')}
                  </span>
                </div>
                <ChevronRight size={14} className={`text-slate-400 dark:text-slate-500 transform transition-transform ${activeMenu === 'sharing' ? 'rotate-90' : ''}`} />
              </button>
              
              {activeMenu === 'sharing' && (
                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 animate-in slide-in-from-top-2">
                  {user?.role !== 'admin' && !(user?.subscription_status === 'active' && user?.subscription_end_date && new Date(user.subscription_end_date) > new Date()) ? (
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold space-y-2.5">
                      <p>{t('Fitur Kelola Pegawai/Akses Multi-User hanya tersedia untuk pelanggan Premium Active.', 'The Manage Employee/Multi-User Access feature is only available for Premium Active subscribers.')}</p>
                      <a
                        href={`https://wa.me/6285792524863?text=${encodeURIComponent(`Halo Admin, saya ingin upgrade ke Premium agar bisa mengundang pegawai saya untuk monitoring alat.`)}`}
                        target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white font-black text-[9px] uppercase tracking-wider hover:bg-amber-600 transition-colors shadow-sm"
                      >
                        <Crown size={11} /> {t('Upgrade Sekarang', 'Upgrade Now')}
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Guide */}
                      <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-2.5 text-xs">
                        <p className="text-[10px] font-black text-blue-600 dark:text-blue-500 uppercase tracking-widest flex items-center gap-1.5">
                          <span>ℹ️</span> {t('Cara Pegawai Mengakses Dashboard', 'How Employees Access the Dashboard')}
                        </p>
                        <ol className="space-y-2 text-slate-600 dark:text-slate-350 list-decimal pl-4">
                          <li>{t('Pegawai membuka halaman <strong>Register</strong> di SkyWatch', 'Employee opens the Register page on SkyWatch')}</li>
                          <li>{t('Mendaftar menggunakan <strong>email yang sama persis</strong> dengan yang Anda undang di bawah', 'Registering using the exact same email as the one you invite below')}</li>
                          <li>{t('Setelah login, dashboard pegawai otomatis menampilkan data sensor milik Anda', 'After logging in, the employee dashboard automatically displays your sensor data')}</li>
                        </ol>
                        <div className="pt-1">
                          <Link href="/register" className="text-[10px] font-black bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-600 dark:text-blue-500 px-3 py-1.5 rounded-lg transition-all inline-block">
                            {t('Buka Halaman Register →', 'Open Register Page →')}
                          </Link>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('Masukkan email pegawai/pengawas yang ingin Anda undang untuk memantau sensor Anda:', 'Enter the email of the employee/supervisor you want to invite to monitor your sensor:')}
                      </p>

                      {devices.length === 0 ? (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-xl">
                          ⚠️ {t('Pasang sensor Anda terlebih dahulu di bagian "Pasangkan Sensor" sebelum mengundang pegawai.', 'Please pair your sensor first in the "Pair Sensor" section before inviting employees.')}
                        </div>
                      ) : (
                        <form onSubmit={handleInvite} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                          <div className="sm:col-span-5">
                            <input
                              type="email"
                              placeholder="email.pegawai@anda.com"
                              value={inviteEmail}
                              onChange={e => setInviteEmail(e.target.value)}
                              className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-white"
                            />
                          </div>
                          <div className="sm:col-span-4">
                            <select
                              value={inviteDeviceId}
                              onChange={e => setInviteDeviceId(e.target.value)}
                              className="w-full bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-slate-800 dark:text-white cursor-pointer"
                            >
                              <option value="">{t('-- Pilih Sensor --', '-- Select Sensor --')}</option>
                              {devices.map((d: any) => (
                                <option key={d.device_id} value={d.device_id}>
                                  {d.device_name} ({d.device_type === 'sim' ? t('SIM', 'SIM') : t('REAL', 'REAL')})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="sm:col-span-3">
                            <button type="submit" disabled={inviting || !inviteEmail || !inviteDeviceId}
                              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm">
                              {inviting ? t('Mengundang...', 'Inviting...') : t('Undang', 'Invite')}
                            </button>
                          </div>
                        </form>
                      )}

                      {shareStatus.text && (
                        <p className={`text-xs font-bold ${shareStatus.type === 'success' ? 'text-emerald-600 dark:text-emerald-500' : 'text-red-600 dark:text-red-500'}`}>
                          {shareStatus.text}
                        </p>
                      )}

                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t('Daftar Pegawai yang Diundang', 'List of Invited Employees')} ({shares.length})</p>
                        
                        {sharesLoading ? (
                          <div className="text-xs text-slate-400 flex items-center gap-2 py-2"><RefreshCw size={11} className="animate-spin" /> {t('Memuat data...', 'Loading data...')}</div>
                        ) : shares.length === 0 ? (
                          <p className="text-xs text-slate-450 py-2 italic">Belum ada pegawai yang diundang.</p>
                        ) : (
                          <div className="space-y-2">
                            {shares.map((s: any) => (
                              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <div className="min-w-0 flex-1 pr-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate">{s.member_name || '—'}</p>
                                    {s.member_name ? (
                                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-500 uppercase tracking-wider">{t('Aktif', 'Active')}</span>
                                    ) : (
                                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 uppercase tracking-wider">{t('Belum Daftar', 'Not Registered')}</span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-slate-450 font-mono truncate">{s.member_email}</p>
                                  <p className="text-[10px] text-slate-550 dark:text-slate-450 mt-1">
                                    {t('Sensor:', 'Sensor:')} <span className="font-semibold text-emerald-600 dark:text-emerald-400">{s.device_name ? `${s.device_name} (${s.device_id})` : (s.device_id || t('Semua Sensor', 'All Sensors'))}</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleCopyLink(s.id, s.member_email)}
                                    title="Salin Link Undangan"
                                    className={`p-1.5 rounded-lg border flex items-center justify-center transition-all ${
                                      copiedId === s.id
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-500'
                                        : 'bg-white hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                                  >
                                    {copiedId === s.id ? (
                                      <span className="text-[8px] font-black uppercase tracking-wider px-1 flex items-center gap-0.5">
                                        <Check size={10} strokeWidth={3} /> {t('Salin!', 'Copied!')}
                                      </span>
                                    ) : (
                                      <Copy size={12} />
                                    )}
                                  </button>

                                  <button onClick={() => handleRevoke(s.id)} title="Cabut Akses" className="p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 hover:bg-red-500/20 transition-all">
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

            {/* Suara Alarm */}
            <div className="border-b border-slate-100 dark:border-slate-800/80">
              <button 
                onClick={() => setActiveMenu(activeMenu === 'alarm' ? null : 'alarm')} 
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-850/45 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-orange-500/10 text-orange-500 rounded-xl">
                    <Bell size={16} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-355">
                    {t('Notifikasi Bahaya (Suara Alarm)', 'Danger Notification (Alarm Sound)')}
                  </span>
                </div>
                <ChevronRight size={14} className={`text-slate-400 dark:text-slate-500 transform transition-transform ${activeMenu === 'alarm' ? 'rotate-90' : ''}`} />
              </button>
              
              {activeMenu === 'alarm' && (
                <div className="p-6 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 animate-in slide-in-from-top-2">
                  <p className="text-xs text-slate-500 mb-4">{t('Pilih suara peringatan saat sensor mendeteksi bahaya:', 'Select the alert sound when the sensor detects danger:')}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'siren', label: t('Sirine Polisi', 'Police Siren') },
                      { id: 'beep', label: t('Beep Cepat', 'Fast Beep') },
                      { id: 'bell', label: t('Lonceng Alarm', 'Alarm Bell') }
                    ].map(sound => (
                      <button 
                        key={sound.id}
                        onClick={() => handleSelectAlarm(sound.id)}
                        className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all border ${
                          alarmSound === sound.id 
                            ? 'bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400' 
                            : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {sound.label}
                      </button>
                    ))}
                  </div>

                  {alarmSound !== savedAlarmSound && (
                    <div className="mt-4 flex items-center justify-end">
                      <button 
                        onClick={handleSaveAlarm}
                        className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5"
                      >
                        <Check size={12} />
                        {t('Simpan', 'Save')}
                      </button>
                    </div>
                  )}

                  {alarmSuccess && (
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-500 mt-3 flex items-center gap-1">
                      <Check size={12} />
                      {alarmSuccess}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Layanan Pengaduan */}
            <div>
              <button 
                onClick={() => router.push('/complaints')} 
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-850/45 transition-colors group"
              >
                <div className="flex items-center gap-3.5">
                  <div className="p-2 bg-teal-500/10 text-teal-500 rounded-xl">
                    <MessageCircle size={16} />
                  </div>
                  <div className="text-left">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-355 block">
                      {t('Layanan Pengaduan (Bantuan Teknis)', 'Complaint Service (Technical Assistance)')}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                      {t('Laporkan kendala alat, sistem, atau ajukan keluhan teknis lainnya', 'Report device/system issues, or submit other technical complaints')}
                    </span>
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="w-full bg-white dark:bg-red-500/[0.02] hover:bg-red-50 dark:hover:bg-red-500/[0.05] border border-red-500/20 py-4 rounded-xl flex items-center justify-center gap-2 transition-all group shadow-sm mt-8"
          >
            <LogOut size={16} className="text-red-600 dark:text-red-500 group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black text-red-600 dark:text-red-500 uppercase tracking-widest">{t('Keluar Akun', 'Logout')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}