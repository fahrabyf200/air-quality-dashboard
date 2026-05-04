"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Table, FileBarChart, Wind, BookOpen, Settings, Menu, X, Bell, Sun, Moon
} from 'lucide-react';
import { ThemeProvider, useTheme } from 'next-themes';
import "./globals.css";

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Monitoring', icon: Table, path: '/monitoring' },
  { name: 'Reports', icon: FileBarChart, path: '/reports' },
  { name: 'Education', icon: BookOpen, path: '/education' },
];

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-xl transition-all duration-300 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-[#a3e635] hover:ring-2 ring-lime-400/50"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full bg-white dark:bg-[#080e1c] transition-colors duration-500">
      <div className="px-6 py-7 border-b border-slate-100 dark:border-[#1a2235]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#a3e635] rounded-xl flex items-center justify-center shadow-lg shadow-lime-500/20">
            <Wind size={18} className="text-[#0a0f1a]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-black text-[15px] tracking-tight leading-none uppercase">SkyWatch</p>
            <p className="text-slate-400 dark:text-[#3d5070] text-[10px] font-bold tracking-[0.2em] mt-0.5 uppercase">Air Analytics</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 text-[9px] font-black text-slate-400 dark:text-[#2a3a55] uppercase tracking-[0.3em] mb-3">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNav}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group border ${
                isActive 
                  ? 'bg-lime-50 dark:bg-[#a3e635]/5 border-lime-200 dark:border-[#a3e635]/10' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-[#111c2e]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon size={15} className={`transition-colors ${isActive ? 'text-[#a3e635]' : 'text-slate-500 dark:text-[#3d5070] group-hover:text-slate-700 dark:group-hover:text-[#6b8ab5]'}`} />
                <span className={`text-[13px] font-semibold tracking-tight transition-colors ${isActive ? 'text-slate-900 dark:text-[#a3e635]' : 'text-slate-600 dark:text-[#4a6080]'}`}>
                  {item.name}
                </span>
              </div>
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_8px_#a3e635]" />}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-5 border-t border-slate-100 dark:border-[#1a2235] space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-[#3d5070]">APPEARANCE</span>
          <ThemeToggle />
        </div>
        <div className="bg-slate-50 dark:bg-[#0d1525] border border-slate-100 dark:border-[#1a2235] rounded-xl p-3.5 relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-slate-400 dark:text-[#2a3a55] uppercase tracking-[0.2em]">System Online</span>
          </div>
          <p className="text-[11px] font-bold text-slate-600 dark:text-[#3d5070] uppercase tracking-tight">Group 4 • Polinema</p>
          <Settings size={36} className="absolute -bottom-3 -right-3 text-slate-200 dark:text-[#1a2235] group-hover:rotate-90 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased transition-colors duration-300" style={{ fontFamily: "'Outfit', sans-serif" }}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="flex h-screen overflow-hidden bg-white dark:bg-[#070d1a] transition-colors duration-500">
            
            {/* DESKTOP SIDEBAR (Hanya muncul di Layar Besar) */}
            <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-slate-100 dark:border-[#111c2e]">
              <SidebarContent />
            </aside>

            {/* MOBILE DRAWER OVERLAY */}
            {mobileDrawer && (
              <div className="fixed inset-0 z-40 lg:hidden bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => setMobileDrawer(false)} />
            )}

            {/* MOBILE DRAWER (Menu Samping di HP) */}
            <aside className={`fixed top-0 left-0 h-full w-[260px] z-50 flex flex-col lg:hidden border-r border-slate-100 dark:border-[#111c2e] bg-white dark:bg-[#080e1c] transition-transform duration-300 ease-in-out ${mobileDrawer ? 'translate-x-0' : '-translate-x-full'}`}>
              <button onClick={() => setMobileDrawer(false)} className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-[#111c2e]">
                <X size={16} />
              </button>
              <SidebarContent onNav={() => setMobileDrawer(false)} />
            </aside>

            {/* MAIN AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {/* Mobile top bar (Hanya muncul di HP) */}
              <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[#111c2e] bg-white dark:bg-[#080e1c] shrink-0">
                <button onClick={() => setMobileDrawer(true)} className="p-2 rounded-xl text-slate-500 dark:text-[#3d5070] hover:bg-slate-50 dark:hover:bg-[#111c2e]">
                  <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#a3e635] rounded-lg flex items-center justify-center shadow-lg shadow-lime-500/20">
                    <Wind size={16} className="text-[#0a0f1a]" strokeWidth={2.5} />
                  </div>
                  <span className="text-slate-900 dark:text-white font-black text-[15px] tracking-tight uppercase">SkyWatch</span>
                </div>
                <ThemeToggle />
              </header>

              <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-[#070d1a] transition-colors duration-500 pb-24 lg:pb-0">
                {children}
              </main>

              {/* MOBILE BOTTOM TASKBAR (Hanya muncul di HP) */}
              <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-slate-100 dark:border-[#111c2e] bg-white/90 dark:bg-[#080e1c]/90 backdrop-blur-xl px-2 pb-safe">
                {menuItems.map((item) => {
                  const isActive = pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link key={item.path} href={item.path} className="flex flex-col items-center gap-1 py-3 px-4 relative">
                      {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full bg-[#a3e635] shadow-[0_0_12px_#a3e635]" />}
                      <Icon size={20} className={isActive ? 'text-[#a3e635]' : 'text-slate-400 dark:text-[#2a3a55]'} />
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${isActive ? 'text-slate-900 dark:text-[#a3e635]' : 'text-slate-400 dark:text-[#2a3a55]'}`}>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}