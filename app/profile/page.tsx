"use client";
import React from 'react';
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
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 lg:pb-6">
      {/* Header Profil */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <div className="w-24 h-24 rounded-[2rem] bg-[#a3e635] flex items-center justify-center text-[#0a0f1a] shadow-xl shadow-lime-500/20">
            <UserCircle size={48} strokeWidth={1.5} />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white dark:bg-[#111c2e] border-4 border-slate-50 dark:border-[#070d1a] rounded-full flex items-center justify-center">
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
        <div className="bg-white dark:bg-[#111c2e] border border-slate-100 dark:border-[#1a2235] p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-slate-50 dark:bg-[#080e1c] rounded-2xl text-slate-400">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Terdaftar</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">agna@student.polinema.ac.id</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-[#111c2e] border border-slate-100 dark:border-[#1a2235] p-5 rounded-3xl flex items-center gap-4">
          <div className="p-3 bg-slate-50 dark:bg-[#080e1c] rounded-2xl text-slate-400">
            <Smartphone size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Perangkat Aktif</p>
            <p className="text-sm font-bold text-slate-900 dark:text-white">ESP32 - SkyWatch v1.0</p>
          </div>
        </div>
      </div>

      {/* Menu Pengaturan (List Style) */}
      <div className="space-y-3">
        <p className="px-2 text-[10px] font-black text-slate-400 dark:text-[#2a3a55] uppercase tracking-[0.3em]">Pengaturan Aplikasi</p>
        
        <div className="bg-white dark:bg-[#111c2e] border border-slate-100 dark:border-[#1a2235] rounded-3xl divide-y divide-slate-50 dark:divide-[#1a2235] overflow-hidden">
          {[
            { label: 'Keamanan Akun', icon: ShieldCheck, color: 'text-blue-500' },
            { label: 'Notifikasi Bahaya', icon: Bell, color: 'text-orange-500' },
            { label: 'Informasi Kelompok', icon: User, color: 'text-[#a3e635]' },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-[#080e1c] transition-colors group">
              <div className="flex items-center gap-4">
                <item.icon size={20} className={item.color} />
                <span className="text-sm font-bold text-slate-700 dark:text-[#6b8ab5] group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {item.label}
                </span>
              </div>
              <ChevronRight size={18} className="text-slate-300 dark:text-[#1a2235]" />
            </button>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <button className="w-full bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/20 py-5 rounded-3xl flex items-center justify-center gap-3 transition-all">
        <LogOut size={20} className="text-red-500" />
        <span className="text-sm font-black text-red-500 uppercase tracking-widest">Keluar Akun</span>
      </button>
    </div>
  );
}