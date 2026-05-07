"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Table, FileBarChart, Wind, BookOpen, Settings, Sun, Moon, User
} from 'lucide-react';
import { ThemeProvider } from '@/components/theme-provider';
import { useTheme } from 'next-themes';
import "./globals.css";

// Menu navigasi lengkap (5 item)
const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Monitoring', icon: Table, path: '/monitoring' },
  { name: 'Reports', icon: FileBarChart, path: '/reports' },
  { name: 'Education', icon: BookOpen, path: '/education' },
  { name: 'User', icon: User, path: '/profile' },
];

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-xl transition-all duration-300 bg-slate-100 dark:bg-[#1e293b] text-slate-600 dark:text-[#a3e635] hover:ring-2 ring-lime-400/50"
    >
      {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-[#080e1c] transition-colors duration-500">
      {/* Branding Section */}
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

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <p className="px-3 text-[9px] font-black text-slate-400 dark:text-[#2a3a55] uppercase tracking-[0.3em] mb-3">Main Menu</p>
        {menuItems.slice(0, 4).map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
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
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section (Sidebar Bawah) */}
      <div className="px-3 py-5 border-t border-slate-100 dark:border-[#1a2235] space-y-3">
        <Link 
          href="/profile" 
          className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#111c2e] border border-slate-100 dark:border-[#1a2235] hover:border-[#a3e635]/50 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-[#a3e635] flex items-center justify-center text-[#0a0f1a] font-bold text-xs shadow-sm">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-black text-slate-900 dark:text-white uppercase truncate">Agna Putra</p>
            <p className="text-[10px] font-bold text-slate-400 dark:text-[#3d5070] uppercase tracking-wider">User Profile</p>
          </div>
          <Settings size={14} className="text-slate-400 group-hover:rotate-90 transition-transform" />
        </Link>
      </div>
    </div>
  );

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="antialiased bg-white dark:bg-[#070d1a] transition-colors duration-300">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex h-screen overflow-hidden">
            
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-slate-100 dark:border-[#111c2e]">
              <SidebarContent />
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              
              {/* Header Mobile (Tanpa Hamburger Menu) */}
              <header className="lg:hidden flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[#111c2e] bg-white dark:bg-[#080e1c] shrink-0">
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

              {/* Mobile Bottom Taskbar (5 Ikon) */}
              <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#080e1c]/80 backdrop-blur-xl border-t border-slate-100 dark:border-[#111c2e] px-4 pb-safe">
                <div className="flex items-center justify-between h-20 max-w-md mx-auto">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.path} 
                        href={item.path} 
                        className="relative flex flex-col items-center justify-center flex-1 transition-all duration-300"
                      >
                        {/* Indikator Aktif */}
                        {isActive && (
                          <div className="absolute -top-[1px] w-8 h-[2px] bg-[#a3e635] shadow-[0_-4px_12px_#a3e635]" />
                        )}
                        
                        <div className={`p-2 rounded-xl transition-all ${
                          isActive ? 'text-[#a3e635]' : 'text-slate-400 dark:text-[#2a3a55]'
                        }`}>
                          <Icon size={isActive ? 22 : 20} strokeWidth={isActive ? 2.5 : 2} />
                        </div>
                        
                        <span className={`text-[10px] font-black uppercase tracking-wider transition-all ${
                          isActive ? 'text-slate-900 dark:text-white scale-105' : 'text-slate-400 dark:text-[#2a3a55]'
                        }`}>
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}