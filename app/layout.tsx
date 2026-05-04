"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Table, FileBarChart, Wind, BookOpen, Settings, Menu, X, Bell
} from 'lucide-react';
import "./globals.css";

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Monitoring', icon: Table, path: '/monitoring' },
  { name: 'Reports', icon: FileBarChart, path: '/reports' },
  { name: 'Education', icon: BookOpen, path: '/education' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-[#1a2235]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#a3e635] rounded-xl flex items-center justify-center shadow-lg">
            <Wind size={18} className="text-[#0a0f1a]" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-white font-black text-[15px] tracking-tight leading-none uppercase">SkyWatch</p>
            <p className="text-[#3d5070] text-[10px] font-bold tracking-[0.2em] mt-0.5 uppercase">Air Analytics</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="px-3 text-[9px] font-black text-[#2a3a55] uppercase tracking-[0.3em] mb-3">Main Menu</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onNav}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group"
              style={{
                background: isActive ? 'rgba(163,230,53,0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(163,230,53,0.15)' : '1px solid transparent',
              }}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  size={15}
                  style={{ color: isActive ? '#a3e635' : '#3d5070' }}
                  className="transition-colors group-hover:text-[#6b8ab5]"
                />
                <span
                  className="text-[13px] font-semibold tracking-tight transition-colors"
                  style={{ color: isActive ? '#a3e635' : '#4a6080' }}
                >
                  {item.name}
                </span>
              </div>
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#a3e635] shadow-[0_0_6px_#a3e635]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-5 border-t border-[#1a2235]">
        <div className="bg-[#0d1525] border border-[#1a2235] rounded-xl p-3.5 relative overflow-hidden group">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-[#a3e635] rounded-full animate-pulse" />
            <span className="text-[9px] font-black text-[#2a3a55] uppercase tracking-[0.2em]">System Online</span>
          </div>
          <p className="text-[11px] font-bold text-[#3d5070] uppercase tracking-tight">Group 4 • Polinema</p>
          <Settings size={36} className="absolute -bottom-3 -right-3 text-[#1a2235] group-hover:rotate-90 transition-transform duration-700" />
        </div>
      </div>
    </div>
  );

  return (
    <html lang="id">
      <head>
        <title>SkyWatch — Air Quality Analytics</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;700&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="overflow-hidden" style={{ background: '#070d1a', fontFamily: "'Outfit', sans-serif", margin: 0 }}>
        <div className="flex h-screen">

          {/* ── DESKTOP SIDEBAR ── */}
          <aside
            className="hidden lg:flex flex-col w-[220px] shrink-0 border-r border-[#111c2e]"
            style={{ background: '#080e1c' }}
          >
            <SidebarContent />
          </aside>

          {/* ── MOBILE DRAWER OVERLAY ── */}
          {mobileDrawer && (
            <div
              className="fixed inset-0 z-40 lg:hidden"
              style={{ background: 'rgba(7,13,26,0.8)', backdropFilter: 'blur(4px)' }}
              onClick={() => setMobileDrawer(false)}
            />
          )}

          {/* ── MOBILE DRAWER ── */}
          <aside
            className={`fixed top-0 left-0 h-full w-[220px] z-50 flex flex-col lg:hidden border-r border-[#111c2e] transition-transform duration-300 ${mobileDrawer ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ background: '#080e1c' }}
          >
            <button
              onClick={() => setMobileDrawer(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-[#3d5070] hover:text-white hover:bg-[#111c2e] transition-all"
            >
              <X size={15} />
            </button>
            <SidebarContent onNav={() => setMobileDrawer(false)} />
          </aside>

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* Mobile top bar */}
            <header
              className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-[#111c2e] shrink-0"
              style={{ background: '#080e1c' }}
            >
              <button
                onClick={() => setMobileDrawer(true)}
                className="p-1.5 rounded-lg text-[#3d5070] hover:text-white hover:bg-[#111c2e] transition-all"
              >
                <Menu size={18} />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-[#a3e635] rounded-lg flex items-center justify-center">
                  <Wind size={14} className="text-[#0a0f1a]" strokeWidth={2.5} />
                </div>
                <span className="text-white font-black text-[14px] tracking-tight uppercase">SkyWatch</span>
              </div>
              <button className="p-1.5 rounded-lg text-[#3d5070] hover:text-white hover:bg-[#111c2e] transition-all relative">
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-1 h-1 bg-[#a3e635] rounded-full" />
              </button>
            </header>

            {/* Page content */}
            <main
              className="flex-1 overflow-y-auto pb-20 lg:pb-0"
              style={{ background: '#070d1a' }}
            >
              {children}
            </main>

            {/* ── MOBILE BOTTOM TASKBAR ── */}
            <nav
              className="lg:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-[#111c2e] safe-area-pb"
              style={{ background: 'rgba(8,14,28,0.97)', backdropFilter: 'blur(16px)', paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className="flex flex-col items-center gap-1 py-3 px-5 transition-all duration-200 relative"
                  >
                    {isActive && (
                      <span
                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-b-full bg-[#a3e635]"
                        style={{ boxShadow: '0 0 8px #a3e635' }}
                      />
                    )}
                    <Icon
                      size={20}
                      style={{ color: isActive ? '#a3e635' : '#2a3a55' }}
                    />
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider"
                      style={{ color: isActive ? '#a3e635' : '#2a3a55' }}
                    >
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>

          </div>
        </div>
      </body>
    </html>
  );
}