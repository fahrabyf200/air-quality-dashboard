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
  UserCircle
} from 'lucide-react';

export default function ProfilePage() {
  const { thresholds, saveThresholds, isLoaded } = useThresholds();
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
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[2rem] bg-[#a3e635] flex items-center justify-center text-[#0a0f1a] shadow-xl shadow-lime-500/20">
            <UserCircle size={48} strokeWidth={1.5} />
          </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-[#070d1a] border-4 border-slate-50 dark:border-[#070d1a] rounded-full flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-[#a3e635] animate-pulse" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Agna Putra</h1>
          <p className="text-slate-500 dark:text-[#3d5070] text-[10px] font-bold uppercase tracking-[0.2em] mt-1">NIM: 2341720065 • Mahasiswa</p>
        </div>
      </div>

      {/* Grid Informasi Utama */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/15 p-5 rounded-3xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)]">
          <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Terdaftar</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">agna@student.polinema.ac.id</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/15 p-5 rounded-3xl flex items-center gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)]">
          <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl text-slate-400">
            <Smartphone size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perangkat Aktif</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">ESP32 - SkyWatch v1.0</p>
          </div>
        </div>
      </div>

      {/* Pengaturan Ambang Batas (Threshold) */}
      <div className="space-y-3">
        <p className="px-2 text-[10px] font-black text-slate-400 dark:text-[#2a3a55] uppercase tracking-[0.3em]">Pengaturan Ambang Batas (Threshold)</p>
        
        <div className="bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/15 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)]">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">Atur nilai ambang batas (threshold) untuk menentukan status aman atau bahaya pada masing-masing sensor.</p>
          {isLoaded ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {Object.entries(thresholds).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Batas Maksimal {key === 'hum' ? 'Humidity' : key === 'temp' ? 'Temperature' : key.toUpperCase()}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => saveThresholds({ ...thresholds, [key]: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#a3e635] transition-colors"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest pointer-events-none">
                      {key === 'co2' || key === 'nh3' ? 'PPM' : key === 'temp' ? '°C' : '%'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-slate-500 flex items-center justify-center py-4 animate-pulse">Memuat pengaturan...</div>
          )}
        </div>
      </div>

      {/* Menu Pengaturan (List Style) */}
      <div className="space-y-3">
        <p className="px-2 text-[10px] font-black text-slate-400 dark:text-[#2a3a55] uppercase tracking-[0.3em]">Pengaturan Aplikasi</p>
        
        <div className="bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/15 rounded-3xl divide-y divide-slate-200 dark:divide-white/10 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)]">
          {[
            { label: 'Keamanan Akun', icon: ShieldCheck, color: 'text-blue-500' },
            { label: 'Notifikasi Bahaya', icon: Bell, color: 'text-orange-500' },
            { label: 'Informasi Kelompok', icon: User, color: 'text-[#a3e635]' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors group">
              <div className="flex items-center gap-4">
                <item.icon size={20} className={item.color} />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-[#1a2235]" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button className="w-full bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 py-5 rounded-3xl flex items-center justify-center gap-3 transition-all">
        <LogOut size={20} className="text-red-500" />
        <span className="text-sm font-black text-red-500 uppercase tracking-widest">Keluar Akun</span>
      </button>
    </div>
    </div>
  );
}