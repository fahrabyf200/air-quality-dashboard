"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Table,
  FileBarChart,
  BookOpen,
  Wind,
  Sun,
  Moon,
  User,
  Bell,
  ShieldCheck,
  Lock,
  Crown,
  MessageCircle,
  MessageSquare,
  X,
  Users,
  Sliders,
  Database,
  DollarSign,
  Activity,
  LogOut,
} from "lucide-react";

import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";

import "./globals.css";

const monitoringMenu = [
  { name: "Dashboard Overview", icon: LayoutDashboard, path: "/" },
  { name: "Real-time Data Logs", icon: Table, path: "/monitoring" },
  { name: "Analytical Reports", icon: FileBarChart, path: "/reports" },
  { name: "About & Safety", icon: BookOpen, path: "/education" },
  { name: "User Profile", icon: User, path: "/profile" },
];

const managementMenu = [
  { name: "Admin Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "User Management", icon: Users, path: "/admin/users" },
  { name: "Gas Threshold Settings", icon: Sliders, path: "/admin/thresholds" },
  { name: "User Complaints", icon: MessageSquare, path: "/admin/complaints" },
  { name: "System Logs", icon: Activity, path: "/admin/logs" },
  { name: "Sensor DB", icon: Database, path: "/admin/sensor" },
  { name: "Sales", icon: DollarSign, path: "/admin/sales" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-350 dark:hover:border-slate-700 transition-all shadow-sm"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  const fetchNotifs = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      setNotifs(data.notifications || []);
      setUnread(data.unread_count || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifs();
    // Auto-refresh notifikasi setiap 30 detik
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async () => {
    if (unread > 0) {
      await fetch('/api/notifications', { method: 'PATCH' });
      setUnread(0);
      setNotifs(n => n.map(x => ({ ...x, is_read: 1 })));
    }
    setOpen(o => !o);
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'danger':
      case 'alert': return '🔴';
      case 'info': return '🔵';
      default: return '🟢';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={markRead}
        className="relative w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-350 dark:hover:border-slate-700 transition-all shadow-sm"
      >
        <Bell size={15} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[8px] font-black shadow-sm animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 z-[200] bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2">
              <Bell size={13} className="text-slate-500" />
              <p className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest">Notifikasi</p>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 text-[8px] font-black">
                  {unread} baru
                </span>
              )}
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={14} /></button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Bell size={24} className="mb-2 opacity-30" />
                <p className="text-xs font-bold">Tidak ada notifikasi</p>
              </div>
            ) : notifs.map(n => {
              const isDangerNotif = n.type === 'danger' || n.type === 'alert';
              const isInfoNotif = n.type === 'info';
              return (
                <div 
                  key={n.id} 
                  className={`px-4 py-3 border-b border-slate-50 dark:border-slate-800/50 last:border-0 transition-colors duration-200 ${
                    !n.is_read 
                      ? (isDangerNotif 
                          ? 'bg-red-500/10 border-l-2 border-l-red-500' 
                          : isInfoNotif
                            ? 'bg-blue-500/5 border-l-2 border-l-blue-400'
                            : 'bg-emerald-500/5 border-l-2 border-l-emerald-400') 
                      : (isDangerNotif ? 'border-l-2 border-l-red-500/20' : '')
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="text-[10px] mt-0.5 flex-shrink-0">{getNotifIcon(n.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold mb-0.5 leading-tight ${
                        !n.is_read 
                          ? (isDangerNotif ? 'text-red-600 dark:text-red-400' : 'text-slate-900 dark:text-white') 
                          : (isDangerNotif ? 'text-red-700/80 dark:text-red-400/80 font-semibold' : 'text-slate-600 dark:text-slate-350')
                      }`}>
                        {n.title}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                      <p className="text-[9px] text-slate-350 dark:text-slate-600 font-mono mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
            <p className="text-[9px] text-slate-400 font-mono text-center">Auto-refresh setiap 30 detik</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Primary top navbar links
const mainNavLinks = [
  { name: "Dashboard", path: "/" },
  { name: "Monitoring", path: "/monitoring" },
  { name: "Reports", path: "/reports" },
  { name: "About & Safety", path: "/education" },
  { name: "Profile", path: "/profile" },
];

// Fixed Top Navbar
function TopNavbar({ user, pathname, sidebarCollapsed }: { user: any; pathname: string; sidebarCollapsed: boolean }) {
  const isAdminPath = pathname.startsWith("/admin");
  const [espConnected, setEspConnected] = useState(false);

  useEffect(() => {
    if (!user) return;
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/sensor/status');
        if (res.ok) {
          const data = await res.json();
          setEspConnected(!!data.connected);
        }
      } catch {}
    };
    checkStatus();
    const iv = setInterval(checkStatus, 20000);
    return () => clearInterval(iv);
  }, [user]);

  return (
    <header className={`hidden lg:flex justify-between items-center h-20 px-8 fixed top-0 right-0 z-40 transition-all duration-300 border-b border-slate-200 dark:border-[#3c4a42] bg-white/92 dark:bg-[#101415]/92 backdrop-blur-xl shadow-sm ${
      isAdminPath
        ? sidebarCollapsed ? "left-20" : "left-64"
        : "left-0"
    }`}>
      {/* Logo + Status */}
      <div className="flex items-center gap-4 animate-in fade-in duration-300">
        {!isAdminPath ? (
          <>
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-xl bg-[#4edea3] flex items-center justify-center shadow-[0_4px_14px_rgba(78,222,163,0.3)] group-hover:scale-105 transition-transform">
                <Wind className="text-[#003824]" size={18} strokeWidth={2.8} />
              </div>
              <span className="font-bold text-[18px] text-slate-950 dark:text-[#e0e3e5] tracking-tight" style={{letterSpacing: '-0.02em'}}>SkyWatch</span>
            </Link>
            {espConnected ? (
              <div className="hidden xl:flex items-center gap-1.5 bg-[#4edea3]/12 dark:bg-[#4edea3]/10 border border-[#4edea3]/35 px-3 py-1 rounded-full transition-all">
                <span className="w-1.5 h-1.5 bg-[#4edea3] rounded-full animate-pulse shadow-[0_0_8px_rgba(78,222,163,0.7)]"></span>
                <span className="text-[10px] font-bold text-[#005236] dark:text-[#4edea3] uppercase tracking-widest">ESP32 Network: Aktif</span>
              </div>
            ) : (
              <div className="hidden xl:flex items-center gap-1.5 bg-red-500/12 dark:bg-red-500/10 border border-red-500/35 px-3 py-1 rounded-full transition-all">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.7)]"></span>
                <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">ESP32 Network: Tidak Aktif</span>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-400 dark:text-[#86948a] uppercase tracking-wider">Admin Control Center</span>
          </div>
        )}
      </div>

      {/* Center nav links */}
      {!isAdminPath && (
        <nav className="hidden lg:flex items-center gap-1">
          {mainNavLinks.map((item) => {
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`nav-item text-xs font-bold ${
                  active ? "active" : ""
                }`}
              >
                {item.name}
              </Link>
            );
          })}

          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`nav-item text-xs font-bold flex items-center gap-1.5 ${
                pathname.startsWith("/admin")
                  ? "active"
                  : "border border-blue-500/50 dark:border-[#89ceff]/60 text-blue-600 dark:text-[#89ceff] hover:bg-blue-50 dark:hover:bg-[#89ceff]/10"
              }`}
            >
              <ShieldCheck size={13} />
              Admin
            </Link>
          )}
        </nav>
      )}

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <div className="hidden xl:flex items-center relative w-48">
          <svg className="w-3.5 h-3.5 text-slate-400 absolute left-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input type="text" placeholder="Cari data, node..." className="w-full bg-slate-100 dark:bg-[#1d2022] border border-slate-200 dark:border-[#3c4a42] pl-8 pr-4 py-1.5 rounded-lg text-xs outline-none focus:ring-2 focus:ring-[#4edea3]/30 dark:text-[#e0e3e5] transition-all"/>
        </div>

        <NotificationBell />
        <ThemeToggle />

        <div className="w-px h-5 bg-slate-200 dark:bg-[#3c4a42]" />

        <Link href="/profile" className="flex items-center gap-2.5 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-semibold text-slate-900 dark:text-[#e0e3e5] leading-tight capitalize">{user?.name || "..."}</div>
            <div className={`text-[9px] uppercase tracking-widest font-bold mt-0.5 ${
              user?.role === 'admin' ? 'text-blue-600 dark:text-[#89ceff]' : 'text-slate-400 dark:text-[#86948a]'
            }`}>
              {user?.role === 'admin' ? '⬡ Admin' : 'User'}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br from-[#4edea3] to-[#00a2e6] flex items-center justify-center text-[#003824] font-bold text-sm uppercase shadow-sm group-hover:scale-105 transition-transform">
            {user?.profile_pic ? (
              <img src={user.profile_pic} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              user?.name ? user.name.charAt(0) : 'U'
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}

const manageMenu = [
  { name: "Admin Dashboard", icon: LayoutDashboard, path: "/admin" },
  { name: "User Management", icon: Users, path: "/admin/users" },
  { name: "User Complaints", icon: MessageSquare, path: "/admin/complaints" },
  { name: "System Logs", icon: Activity, path: "/admin/logs" },
  { name: "Sales", icon: DollarSign, path: "/admin/sales" },
];

const settingsMenu = [
  { name: "Gas Thresholds", icon: Sliders, path: "/admin/thresholds" },
  { name: "Sensor DB", icon: Database, path: "/admin/sensor" },
];

// Sticky Admin Sidebar / Collapsible Mobile Drawer
function SidebarNav({ 
  pathname, 
  user, 
  open, 
  onClose, 
  onLogout,
  collapsed,
  onToggleCollapse
}: { 
  pathname: string; 
  user: any; 
  open: boolean; 
  onClose: () => void; 
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const isMobileDrawer = open;
  const isCurrentlyCollapsed = collapsed && !isMobileDrawer;

  return (
    <>
      {/* Sidebar mobile backdrop */}
      {open && (
        <div 
          className="lg:hidden fixed inset-0 z-[190] bg-slate-950/40 backdrop-blur-md transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 bottom-0 h-screen bg-white dark:bg-[#0b0f10] border-r border-slate-200 dark:border-[#3c4a42] flex flex-col justify-between transition-all duration-300 z-[200] w-64 ${
        open 
          ? "left-0 shadow-2xl" 
          : "-left-64 lg:left-0"
      } ${
        !open && (isCurrentlyCollapsed ? "lg:w-20" : "lg:w-64")
      }`}>
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sidebar Header: Logo & Collapse Button */}
          <div className={`flex items-center justify-between px-4 py-5 border-b border-slate-100 dark:border-slate-800/60 relative ${
            isCurrentlyCollapsed ? "justify-center" : ""
          }`}>
            {/* Logo */}
            {isCurrentlyCollapsed ? (
              <Link href="/" className="w-9 h-9 rounded-xl bg-[#4edea3] flex items-center justify-center shadow-md shrink-0">
                <Wind className="text-[#003824]" size={16} strokeWidth={2.8} />
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-9 h-9 rounded-xl bg-[#4edea3] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
                  <Wind className="text-[#003824]" size={16} strokeWidth={2.8} />
                </div>
                <span className="font-bold text-base text-slate-950 dark:text-[#e0e3e5] tracking-tight leading-none">SkyWatch</span>
              </Link>
            )}

            {/* Close button on Mobile Drawer, Collapse Toggle on Desktop */}
            {open ? (
              <button 
                onClick={onClose} 
                className="lg:hidden p-1 rounded-lg text-slate-450 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Tutup Menu"
              >
                <X size={15} />
              </button>
            ) : (
              <button 
                onClick={onToggleCollapse}
                className="hidden lg:flex w-6 h-6 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101415] items-center justify-center text-slate-450 hover:text-slate-900 dark:hover:text-white hover:border-slate-350 dark:hover:border-slate-700 transition-all absolute -right-3 top-7 z-50 shadow-md"
                aria-label={isCurrentlyCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              >
                <svg className={`w-3.5 h-3.5 transform transition-transform duration-300 ${isCurrentlyCollapsed ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path>
                </svg>
              </button>
            )}
          </div>

          {/* Profile Card */}
          <div className={`px-4 py-4 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-[#1d2022]/10 relative ${
            isCurrentlyCollapsed ? "flex justify-center" : ""
          }`}>
            <Link href="/profile" onClick={onClose} className="block group w-full">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-[#4edea3] to-[#00a2e6] flex items-center justify-center text-[#003824] font-bold text-xs uppercase shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-200">
                  {user?.profile_pic ? (
                    <img src={user.profile_pic} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name ? user.name.charAt(0) : 'A'
                  )}
                </div>
                {!isCurrentlyCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[8px] font-black text-slate-400 dark:text-[#86948a] uppercase tracking-widest truncate">Administrator</span>
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_6px_#10b981]"></span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-[#e0e3e5] truncate group-hover:text-[#4edea3] transition-colors leading-tight capitalize">{user?.name || "Admin"}</p>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{user?.email || "admin@skywatch.com"}</p>
                  </div>
                )}
              </div>
              {isCurrentlyCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md border border-white/5 pointer-events-none">
                  {user?.name || "Admin"} ({user?.email || "admin@skywatch.com"})
                </div>
              )}
            </Link>
          </div>

          {/* Sidebar Menu Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
            {/* Section: MANAGE */}
            <div>
              {isCurrentlyCollapsed ? (
                <div className="border-t border-slate-200 dark:border-slate-800/80 my-3 mx-2" />
              ) : (
                <p className="text-[9px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase px-3 mb-2">Manage</p>
              )}
              
              <div className="space-y-1">
                {/* Back to User View (Tampilan User) */}
                <Link
                  href="/"
                  onClick={onClose}
                  className={`flex items-center text-xs font-bold gap-3 p-3 rounded-xl transition-all duration-200 relative group ${
                    pathname === "/"
                      ? "!text-emerald-600 dark:text-emerald-500 dark:!text-[#4edea3] bg-emerald-50/50 dark:bg-emerald-950/10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-emerald-500 dark:before:bg-[#4edea3]"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1d2022]/40"
                  }`}
                >
                  <LayoutDashboard size={15} className="shrink-0" />
                  {!isCurrentlyCollapsed && <span>Tampilan User</span>}
                  {isCurrentlyCollapsed && (
                    <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md border border-white/5 pointer-events-none">
                      Tampilan User
                    </div>
                  )}
                </Link>

                {manageMenu.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className={`flex items-center text-xs font-bold gap-3 p-3 rounded-xl transition-all duration-200 relative group ${
                        active
                          ? "!text-emerald-600 dark:text-emerald-500 dark:!text-[#4edea3] bg-emerald-50/50 dark:bg-emerald-950/10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-emerald-500 dark:before:bg-[#4edea3]"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1d2022]/40"
                      }`}
                    >
                      <Icon size={15} className="shrink-0" />
                      {!isCurrentlyCollapsed && <span>{item.name}</span>}
                      {isCurrentlyCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md border border-white/5 pointer-events-none">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Section: SETTINGS */}
            <div>
              {isCurrentlyCollapsed ? (
                <div className="border-t border-slate-200 dark:border-slate-800/80 my-3 mx-2" />
              ) : (
                <p className="text-[9px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase px-3 mb-2">Settings</p>
              )}

              <div className="space-y-1">
                {settingsMenu.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      onClick={onClose}
                      className={`flex items-center text-xs font-bold gap-3 p-3 rounded-xl transition-all duration-200 relative group ${
                        active
                          ? "!text-emerald-600 dark:text-emerald-500 dark:!text-[#4edea3] bg-emerald-50/50 dark:bg-emerald-950/10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:bg-emerald-500 dark:before:bg-[#4edea3]"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-[#1d2022]/40"
                      }`}
                    >
                      <Icon size={15} className="shrink-0" />
                      {!isCurrentlyCollapsed && <span>{item.name}</span>}
                      {isCurrentlyCollapsed && (
                        <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md border border-white/5 pointer-events-none">
                          {item.name}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/60 mt-auto">
          {isCurrentlyCollapsed ? (
            <button
              onClick={onLogout}
              className="flex items-center justify-center w-full py-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30 hover:bg-red-500/25 transition-all relative group"
              aria-label="Logout"
            >
              <LogOut size={15} className="shrink-0" />
              <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-md border border-white/5 pointer-events-none">
                Logout
              </div>
            </button>
          ) : (
            <button
              onClick={onLogout}
              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 dark:border-red-500/30 hover:bg-red-500/20 dark:hover:bg-red-500/20 text-xs font-black uppercase tracking-wider transition-all"
            >
              <LogOut size={14} className="shrink-0" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

// Mobile top header (compact)
function MobileHeader({ onMenuClick, showMenuButton, user }: { onMenuClick?: () => void; showMenuButton?: boolean; user?: any }) {
  return (
    <header className="lg:hidden fixed top-0 left-0 w-full z-50 h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-[#3c4a42] bg-white/95 dark:bg-[#101415]/95 backdrop-blur-xl transition-colors shadow-sm">
      <div className="flex items-center gap-2">
        {showMenuButton && (
          <button 
            onClick={onMenuClick} 
            className="p-2 -ml-2 text-slate-600 dark:text-[#bbcabf] hover:text-slate-900 dark:hover:text-white mr-1 transition-colors"
            aria-label="Menu Admin"
          >
            <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        )}
        <div className="w-7 h-7 rounded-lg bg-[#4edea3] flex items-center justify-center shadow-[0_2px_10px_rgba(78,222,163,0.35)]">
          <Wind className="text-[#003824]" size={14} strokeWidth={2.8} />
        </div>
        <span className="font-bold text-[15px] text-slate-900 dark:text-[#e0e3e5] tracking-tight" style={{letterSpacing: '-0.02em'}}>
          {showMenuButton ? "Admin Panel" : "SkyWatch"}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {user && (
          <Link href="/profile" className="flex items-center gap-1.5 mr-1 bg-slate-100 dark:bg-slate-850/50 border border-slate-200 dark:border-slate-800 py-1 px-2.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#4edea3] to-[#00a2e6] flex items-center justify-center text-[#003824] font-bold text-[8px] uppercase">
              {user.name ? user.name.charAt(0) : 'U'}
            </div>
            <span className="text-[10px] font-bold text-slate-700 dark:text-[#e0e3e5] max-w-[80px] truncate capitalize">{user.name || 'Profile'}</span>
          </Link>
        )}
        <NotificationBell />
        <ThemeToggle />
      </div>
    </header>
  );
}

// Mobile Bottom Navigation Bar
function MobileBottomNav({ pathname, user }: { pathname: string; user: any }) {
  const isAdmin = user?.role === 'admin';

  const bottomLinks = [
    { name: "Home", icon: LayoutDashboard, path: "/" },
    { name: "Monitor", icon: Table, path: "/monitoring" },
    { name: "Reports", icon: FileBarChart, path: "/reports" },
    { name: "Safety", icon: BookOpen, path: "/education" },
    { name: "Profile", icon: User, path: "/profile" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[90] bg-white/95 dark:bg-[#101415]/96 backdrop-blur-xl border-t border-slate-200 dark:border-[#3c4a42] shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)]">
      <div className="flex items-stretch h-16">
        {bottomLinks.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative group"
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#4edea3] rounded-full" />
              )}
              <div className={`w-9 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
                active
                  ? "bg-[#4edea3]/15 dark:bg-[#4edea3]/12"
                  : "group-hover:bg-slate-100 dark:group-hover:bg-[#1d2022]"
              }`}>
                <Icon size={18} className={active ? "text-[#005236] dark:text-[#4edea3]" : "text-slate-400 dark:text-[#86948a]"} />
              </div>
              <span className={`text-[9px] font-semibold tracking-wide transition-colors ${
                active ? "text-[#005236] dark:text-[#4edea3]" : "text-slate-400 dark:text-[#86948a]"
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all duration-200 relative group"
          >
            {pathname.startsWith("/admin") && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-500 dark:bg-[#89ceff] rounded-full" />
            )}
            <div className={`w-9 h-7 flex items-center justify-center rounded-lg transition-all duration-200 ${
              pathname.startsWith("/admin")
                ? "bg-blue-500/10 dark:bg-[#89ceff]/12"
                : "group-hover:bg-slate-100 dark:group-hover:bg-[#1d2022]"
            }`}>
              <ShieldCheck size={18} className={pathname.startsWith("/admin") ? "text-blue-600 dark:text-[#89ceff]" : "text-slate-400 dark:text-[#86948a]"} />
            </div>
            <span className={`text-[9px] font-semibold tracking-wide transition-colors ${
              pathname.startsWith("/admin") ? "text-blue-600 dark:text-[#89ceff]" : "text-slate-400 dark:text-[#86948a]"
            }`}>
              Admin
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}

const WA_ADMIN = "6285792524863";
const LOCKED_PATHS = ["/", "/monitoring", "/reports", "/complaints"];

function isPremiumActive(user: any): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.subscription_status === 'active') {
    if (!user.subscription_end_date) return true;
    return new Date(user.subscription_end_date) > new Date();
  }
  return false;
}

function SubscriptionLockOverlay({ userEmail }: { userEmail: string }) {
  const waMessage = encodeURIComponent(
    `Halo Admin, saya ingin upgrade ke Premium SkyWatch untuk akun dengan email: ${userEmail}`
  );
  const waLink = `https://wa.me/${WA_ADMIN}?text=${waMessage}`;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 backdrop-blur-md bg-slate-900/10 dark:bg-slate-950/30" />
      <div className="relative z-10 max-w-sm w-full bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl text-center">
        <div className="relative w-16 h-16 mx-auto mb-5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl flex items-center justify-center">
          <Lock size={26} className="text-emerald-600 dark:text-emerald-500" strokeWidth={2.5} />
        </div>
        <div className="flex items-center justify-center gap-1.5 mb-1.5">
          <Crown size={12} className="text-emerald-600 dark:text-emerald-500" />
          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">SkyWatch Premium</p>
        </div>
        <h2 className="text-xl font-display font-black text-slate-900 dark:text-white mb-2">Fitur Terkunci</h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mb-6">
          Halaman ini hanya dapat diakses oleh pengguna <span className="text-emerald-600 dark:text-emerald-500 font-bold">Premium Active</span>. Upgrade sekarang untuk memantau sirkulasi udara Anda.
        </p>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => fetch('/api/notifications/whatsapp', { method: 'POST' }).catch(() => {})}
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageCircle size={16} />
          Upgrade via WhatsApp
        </a>
      </div>
    </div>
  );
}

function Footer() {
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta',
      });
      setCurrentTime(formatted + ' WIB');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="w-full mt-auto border-t border-slate-200 dark:border-white/5 bg-slate-100/90 dark:bg-[#0b0f10]/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto py-8 md:py-12 px-6 md:px-10 xl:px-12 text-slate-600 dark:text-slate-400 text-xs transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 text-left">
          {/* Column 1: Brand & Socials */}
          <div className="md:col-span-5 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#4edea3] flex items-center justify-center shadow-sm">
                <Wind className="text-[#0a0f1a]" size={16} strokeWidth={2.8} />
              </div>
              <div>
                <h5 className="text-slate-900 dark:text-white font-black uppercase text-sm tracking-wider leading-none">SkyWatch</h5>
                <p className="text-[9px] text-[#059669] dark:text-[#4edea3] font-bold uppercase tracking-[0.2em] mt-0.5">Air Analytics</p>
              </div>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px] max-w-sm">
              Sistem IoT terintegrasi untuk pemantauan kualitas sirkulasi udara dan proteksi darurat kebocoran gas dapur secara real-time.
            </p>
            {/* Live Clock */}
            {mounted && (
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-200/60 dark:bg-slate-800/40 border border-slate-300/50 dark:border-slate-700/50">
                <span className="w-1.5 h-1.5 bg-[#4edea3] rounded-full animate-pulse shadow-[0_0_6px_rgba(78,222,163,0.7)]"></span>
                <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-[#4edea3]/80">{currentTime}</span>
              </div>
            )}
            {/* WhatsApp Contact Button */}
            <div className="pt-1">
              <a 
                href="https://wa.me/6285792524863?text=Halo%20Admin%20SkyWatch" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => fetch('/api/notifications/whatsapp', { method: 'POST' }).catch(() => {})}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20c45c] text-white text-xs font-bold transition-all shadow-md active:scale-95 hover:scale-[1.02] shrink-0"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp CS</span>
              </a>
            </div>
          </div>

          {/* Column 2: Navigasi */}
          <div className="md:col-span-3 space-y-4">
            <h6 className="text-slate-900 dark:text-white font-bold uppercase tracking-wider text-[11px]">Navigasi</h6>
            <ul className="space-y-2.5 font-semibold text-slate-500 dark:text-slate-400">
              <li><Link href="/" className="hover:text-emerald-600 dark:hover:text-[#4edea3] transition-colors">Overview</Link></li>
              <li><Link href="/monitoring" className="hover:text-emerald-600 dark:hover:text-[#4edea3] transition-colors">Data Logs</Link></li>
              <li><Link href="/reports" className="hover:text-emerald-600 dark:hover:text-[#4edea3] transition-colors">Laporan</Link></li>
              <li><Link href="/education" className="hover:text-emerald-600 dark:hover:text-[#4edea3] transition-colors">Tentang &amp; Edukasi</Link></li>
              <li><Link href="/complaints" className="hover:text-emerald-600 dark:hover:text-[#4edea3] transition-colors">Layanan Pengaduan</Link></li>
            </ul>
          </div>

          {/* Column 3: Fitur Sistem */}
          <div className="md:col-span-4 space-y-4">
            <h6 className="text-slate-900 dark:text-white font-bold uppercase tracking-wider text-[11px]">Fitur Sistem</h6>
            <ul className="space-y-2.5 font-semibold text-slate-500 dark:text-slate-400">
              <li><span className="cursor-default hover:text-slate-800 dark:hover:text-white transition-colors">Dashboard IoT Real-time</span></li>
              <li><span className="cursor-default hover:text-slate-800 dark:hover:text-white transition-colors">Mikrokontroler ESP32</span></li>
              <li><span className="cursor-default hover:text-slate-800 dark:hover:text-white transition-colors">Sirene Alarm Browser</span></li>
              <li><span className="cursor-default hover:text-slate-800 dark:hover:text-white transition-colors">Notifikasi WhatsApp Otomatis</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 dark:border-white/10 my-6"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-semibold text-[11px] text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} SkyWatch — Sistem Monitoring Kualitas Udara IoT. All rights reserved.</p>
          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-600">Group 4 Polinema IT</p>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const [user, setUser] = useState<any>(null);
  const [clientLoggedIn, setClientLoggedIn] = useState(false);

  useEffect(() => {
    const cached = typeof window !== 'undefined' && localStorage.getItem('skywatch_logged_in') === 'true';
    setClientLoggedIn(cached);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('skywatch_logged_in');
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  useEffect(() => {
    if (!isAuthPage) {
      fetch('/api/auth/me')
        .then(res => res.headers.get('content-type')?.includes('application/json') ? res.json() : { user: null })
        .then(data => {
          if (data.user) {
            setUser(data.user);
            setClientLoggedIn(true);
            localStorage.setItem('skywatch_logged_in', 'true');
          } else {
            setUser(null);
            setClientLoggedIn(false);
            localStorage.removeItem('skywatch_logged_in');
          }
        })
        .catch(() => {
          setUser(null);
          setClientLoggedIn(false);
          localStorage.removeItem('skywatch_logged_in');
        });
    }
  }, [isAuthPage]);

  const isLandingPage = pathname === "/" && !clientLoggedIn;
  const isLockedPage = LOCKED_PATHS.includes(pathname);
  const isLocked = !isAuthPage && isLockedPage && user !== null && !isPremiumActive(user);

  // Layout show criteria (logged in and not auth page)
  const showNavbarAndSidebar = !isAuthPage && !isLandingPage && clientLoggedIn && user;

  // Mobile sidebar open/close state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Desktop sidebar collapsed state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  useEffect(() => {
    const cached = typeof window !== 'undefined' && localStorage.getItem('skywatch_sidebar_collapsed') === 'true';
    setSidebarCollapsed(cached);
  }, []);

  const toggleSidebar = () => {
    const nextVal = !sidebarCollapsed;
    setSidebarCollapsed(nextVal);
    localStorage.setItem('skywatch_sidebar_collapsed', String(nextVal));
  };

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-[#f0f4f8] dark:bg-slate-950 text-slate-800 dark:text-slate-100 antialiased transition-colors duration-300 min-h-screen flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div className="min-h-screen flex flex-col flex-1">
            {/* Desktop top navbar */}
            {showNavbarAndSidebar && <TopNavbar user={user} pathname={pathname} sidebarCollapsed={sidebarCollapsed} />}
            {/* Mobile top header */}
            {showNavbarAndSidebar && (
              <MobileHeader 
                showMenuButton={pathname.startsWith("/admin")} 
                onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
                user={user}
              />
            )}
            {/* Mobile bottom nav bar - hidden in admin to focus on admin features */}
            {showNavbarAndSidebar && !pathname.startsWith("/admin") && (
              <MobileBottomNav pathname={pathname} user={user} />
            )}

            <div className={`flex flex-1 transition-all duration-300 ${
              showNavbarAndSidebar
                ? pathname.startsWith("/admin")
                  ? sidebarCollapsed ? "pt-14 lg:pt-20 lg:pl-20" : "pt-14 lg:pt-20 lg:pl-64"
                  : "pt-14 lg:pt-20"
                : ""
            }`}>
              {showNavbarAndSidebar && pathname.startsWith("/admin") && (
                <SidebarNav 
                  pathname={pathname} 
                  user={user} 
                  open={sidebarOpen} 
                  onClose={() => setSidebarOpen(false)} 
                  onLogout={handleLogout}
                  collapsed={sidebarCollapsed}
                  onToggleCollapse={toggleSidebar}
                />
              )}

              <main className="flex-1 flex flex-col justify-between relative min-w-0">
              <div 
                key={pathname}
                className={`flex-1 ${pathname.startsWith("/admin") ? "pb-0" : "pb-16 lg:pb-0"} page-transition ${isLocked ? "filter blur-sm pointer-events-none select-none opacity-60 transition-all duration-500" : ""}`}
              >
                {children}
              </div>

                {!isAuthPage && !isLandingPage && <Footer />}

                {isLocked && user && (
                  <SubscriptionLockOverlay userEmail={user.email} />
                )}
              </main>
            </div>
            
            {/* FLOATING WHATSAPP BUTTON */}
            {!isAuthPage && !isLandingPage && (
              <a
                href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent("Halo Admin SkyWatch, saya butuh bantuan.")}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => fetch('/api/notifications/whatsapp', { method: 'POST' }).catch(() => {})}
                className="fixed bottom-20 lg:bottom-6 right-6 z-[100] group flex items-center gap-2"
                title="Hubungi Admin via WhatsApp"
              >
                <span className="hidden lg:block opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 bg-[#25D366] text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md whitespace-nowrap">
                  Hubungi Admin
                </span>
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
                  <div className="relative w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20c45c] flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-300">
                    <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                </div>
              </a>
            )}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}