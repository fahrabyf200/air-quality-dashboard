"use client";
import React from 'react';
import { useThresholds } from '@/app/hooks/useThresholds';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Bell, 
  Smartphone, 
  LogOut,
  ChevronRight,
  UserCircle,
  RefreshCw,
  Camera
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { thresholds, saveThresholds, isLoaded } = useThresholds();
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
      });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfilePic(url);
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
              Level Akses: User
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
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Perangkat Aktif</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">ESP32 - SkyWatch v1.0</p>
          </div>
        </div>
      </div>

      {/* Pengaturan Ambang Batas (Threshold) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
          <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Pengaturan Ambang Batas</h2>
        </div>
        
        <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-2xl leading-relaxed">
            Sesuaikan nilai ambang batas sensor. Jika nilai sensor melewati batas ini, sistem akan otomatis memicu status peringatan darurat.
          </p>
          {isLoaded ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
              {Object.entries(thresholds).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-2.5">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                    <span>Maksimal {key === 'hum' ? 'Kelembapan' : key === 'temp' ? 'Suhu' : key.toUpperCase()}</span>
                    {key === 'co2' || key === 'nh3' ? (
                      <span className="text-[9px] text-blue-500">Gas</span>
                    ) : (
                      <span className="text-[9px] text-orange-500">Udara</span>
                    )}
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => saveThresholds({ ...thresholds, [key]: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 rounded-2xl pl-5 pr-14 py-4 text-base font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner dark:shadow-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-200 dark:bg-white/10 px-2 py-1 rounded-md text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pointer-events-none group-focus-within:bg-blue-500/10 group-focus-within:text-blue-500 transition-colors">
                      {key === 'co2' || key === 'nh3' ? 'PPM' : key === 'temp' ? '°C' : '%'}
                    </div>
                  </div>
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

      {/* Menu Pengaturan (List Style) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 px-2">
          <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
          <h2 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Pengaturan Aplikasi</h2>
        </div>
        
        <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-3xl divide-y divide-slate-200 dark:divide-white/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors">
          {[
            { label: 'Keamanan Akun', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
            { label: 'Notifikasi Bahaya', icon: Bell, color: 'text-orange-500', bg: 'bg-orange-500/10' },
            { label: 'Informasi Kelompok', icon: User, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon size={20} />
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:border-slate-300 dark:group-hover:border-white/20 transition-colors">
                <ChevronRight size={14} className="text-slate-400 dark:text-slate-500" />
              </div>
            </button>
          ))}
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