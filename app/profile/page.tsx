"use client";
import React, { useState, useEffect } from 'react';
import { useThresholds } from '@/app/hooks/useThresholds';
import { 
  User, Mail, ShieldCheck, Bell, Smartphone, LogOut,
  ChevronRight, UserCircle, RefreshCw, Camera, Check, AlertTriangle
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
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d1a] text-slate-900 dark:text-white transition-colors duration-300">
      {/* PAGE HEADER */}
      <div className="px-6 md:px-8 pt-7 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.35em] mb-1">User Settings</p>
            <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Profile
            </h1>
            <p className="text-slate-600 text-xs mt-1 font-mono">Pengaturan Akun & Aplikasi</p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 xl:px-12 pb-8 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Profil */}
        <div className="flex flex-col items-center text-center space-y-3 -mt-16 md:-mt-20">
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
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-slate-50 dark:bg-[#070d1a] rounded-full flex items-center justify-center pointer-events-none">
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
          <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors">
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
          
          <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-5 rounded-3xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors">
            <div className="p-3.5 bg-purple-500/10 rounded-2xl text-purple-600 dark:text-purple-400">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Kode Unik Alat</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                {user?.device_id || 'Belum dihubungkan'}
              </p>
            </div>
          </div>
        </div>

        {/* Form Pemasangan Alat */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Hubungkan Alat (Device Pairing)</h2>
          </div>
          
          <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
              Masukkan **Device ID** alat ESP32 Anda untuk menghubungkannya ke akun ini. Jika Anda menggunakan satu alat bersama-sama untuk demo, beberapa user bisa mendaftarkan ID alat yang sama.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="text" 
                placeholder="Contoh: ESP32_SKY_01"
                value={deviceIdInput}
                onChange={e => setDeviceIdInput(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
              <button 
                onClick={handleSaveDevice}
                disabled={savingDevice}
                className="px-6 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingDevice ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                Simpan Alat
              </button>
            </div>

            {statusMsg.text && (
              <div className={`mt-4 px-4 py-3 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                statusMsg.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}>
                {statusMsg.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                {statusMsg.text}
              </div>
            )}
          </div>
        </div>



        {/* Pengaturan Ambang Batas (Read-Only) */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2 px-2">
            <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
            <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Ambang Batas Sensor</h2>
          </div>
          
          <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-2xl leading-relaxed">
              Berikut adalah nilai ambang batas sensor saat ini. Pengaturan ini hanya dapat diubah oleh Administrator melalui halaman dasbor admin.
            </p>
            {isLoaded ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                {Object.entries(thresholds).map(([key, val]) => (
                  <div key={key} className="bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 p-3 rounded-2xl text-center">
                    <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
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
          
          <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors">
            
            {/* Keamanan Akun */}
            <div className="border-b border-slate-200 dark:border-white/10">
              <button onClick={() => setActiveMenu(activeMenu === 'security' ? null : 'security')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                    <ShieldCheck size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Keamanan Akun (Ganti Password)
                  </span>
                </div>
                <div className={`w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center transition-transform ${activeMenu === 'security' ? 'rotate-90' : ''}`}>
                  <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
                </div>
              </button>
              
              {activeMenu === 'security' && (
                <div className="p-6 pt-2 bg-slate-50/50 dark:bg-white/[0.01] animate-in slide-in-from-top-2">
                  <div className="space-y-3 max-w-sm">
                    <input type="password" placeholder="Password Lama" value={pwForm.old} onChange={e => setPwForm({...pwForm, old: e.target.value})} className="w-full bg-white dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    <input type="password" placeholder="Password Baru" value={pwForm.new} onChange={e => setPwForm({...pwForm, new: e.target.value})} className="w-full bg-white dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
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

            {/* Notifikasi Bahaya */}
            <div>
              <button onClick={() => setActiveMenu(activeMenu === 'alarm' ? null : 'alarm')} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform">
                    <Bell size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    Notifikasi Bahaya (Suara Alarm)
                  </span>
                </div>
                <div className={`w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center transition-transform ${activeMenu === 'alarm' ? 'rotate-90' : ''}`}>
                  <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
                </div>
              </button>
              
              {activeMenu === 'alarm' && (
                <div className="p-6 pt-2 bg-slate-50/50 dark:bg-white/[0.01] animate-in slide-in-from-top-2">
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
                            : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 hover:border-slate-300 dark:hover:border-white/20'
                        }`}
                      >
                        {sound.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="w-full bg-white dark:bg-red-500/[0.02] hover:bg-red-50 dark:hover:bg-red-500/[0.05] border border-red-500/20 py-5 rounded-3xl flex items-center justify-center gap-3 transition-all group shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none mt-8"
        >
          <LogOut size={20} className="text-red-500 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-black text-red-500 uppercase tracking-widest">Keluar Akun</span>
        </button>
      </div>
    </div>
  );
}