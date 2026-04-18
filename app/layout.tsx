"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Table, FileBarChart, Wind, BookOpen, Settings 
} from 'lucide-react';
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/' },
    { name: 'Monitoring', icon: <Table size={18} />, path: '/monitoring' },
    { name: 'Reports', icon: <FileBarChart size={18} />, path: '/reports' },
    { name: 'Education', icon: <BookOpen size={18} />, path: '/education' },
  ];

  return (
    <html lang="en">
      <body className="bg-[#020617] text-slate-100 flex min-h-screen overflow-hidden selection:bg-blue-500/30">
        {/* SIDEBAR */}
        <aside className="w-72 border-r border-slate-800/60 bg-[#020617] hidden md:flex flex-col relative z-20 shadow-2xl">
          <div className="p-8">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="p-2.5 bg-blue-600 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] group-hover:scale-110 transition-transform duration-300">
                <Wind size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter uppercase leading-none text-white">SkyWatch</span>
                <span className="text-[10px] text-slate-500 font-bold tracking-[0.2em] uppercase mt-1">Air Analytics</span>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-1.5 mt-4">
            <p className="px-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Main Menu</p>
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.path} href={item.path} className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_15px_rgba(59,130,246,0.1)]' : 'text-slate-500 hover:bg-slate-800/40 hover:text-slate-200'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`}>{item.icon}</span>
                    <span className="font-bold text-sm tracking-tight">{item.name}</span>
                  </div>
                  {isActive && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-6 mt-auto">
            <div className="bg-slate-900/50 border border-slate-800/60 rounded-2xl p-4 relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Online</span>
                </div>
                <p className="text-xs font-bold text-slate-300 uppercase tracking-tight">Group 4 • Polinema</p>
              </div>
              <Settings size={40} className="absolute -bottom-4 -right-4 text-slate-800/20 group-hover:rotate-90 transition-transform duration-1000" />
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col h-screen relative">
          <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}