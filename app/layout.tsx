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
} from "lucide-react";

import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";

import "./globals.css";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Monitoring", icon: Table, path: "/monitoring" },
  { name: "Reports", icon: FileBarChart, path: "/reports" },
  { name: "About & Safety", icon: BookOpen, path: "/education" },
  { name: "Pengaduan", icon: MessageSquare, path: "/complaints" },
  { name: "Profile", icon: User, path: "/profile" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-10 h-10" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
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

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async () => {
    if (unread > 0) {
      await fetch('/api/notifications', { method: 'PATCH' });
      setUnread(0);
      setNotifs(n => n.map(x => ({ ...x, is_read: 1 })));
    }
    setOpen(o => !o);
  };

  return (
    <div className="relative">
      <button
        onClick={markRead}
        className="relative w-10 h-10 rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
      >
        <Bell size={16} />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px] font-black shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
        {unread === 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#a3e635]" />}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 z-[200] bg-[#FFFFFF] dark:bg-[#0d1527] border border-[#E2E8F0] dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-white/[0.06]">
            <p className="text-xs font-black text-slate-700 dark:text-white uppercase tracking-widest">Notifikasi</p>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X size={14} /></button>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <Bell size={24} className="mb-2 opacity-30" />
                <p className="text-xs font-bold">Tidak ada notifikasi</p>
              </div>
            ) : notifs.map(n => (
              <div key={n.id} className={`px-4 py-3 border-b border-slate-50 dark:border-white/[0.04] last:border-0 ${!n.is_read ? 'bg-[#a3e635]/5' : ''}`}>
                <p className={`text-xs font-bold mb-0.5 ${!n.is_read ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{n.title}</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">{n.message}</p>
                <p className="text-[9px] text-slate-300 dark:text-slate-600 font-mono mt-1">{new Date(n.created_at).toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DesktopNav({ pathname, user }: { pathname: string, user: any }) {
  const isAdminActive = pathname.startsWith('/admin');

  return (
    <header className="hidden lg:flex h-[72px] items-center justify-between px-8 border-b border-[#E2E8F0] dark:border-white/5 bg-[#FFFFFF]/95 dark:bg-[#070d1a]/95 backdrop-blur-xl sticky top-0 z-40 transition-colors duration-300">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-[#a3e635] flex items-center justify-center shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-[#a3e635]/15">
            <Wind className="text-[#0a0f1a]" size={18} strokeWidth={2.8} />
          </div>

          <div className="absolute inset-0 bg-[#a3e635]/30 blur-xl rounded-2xl -z-10" />
        </div>

        <div>
          <h1 className="text-slate-900 dark:text-white font-black text-[15px] tracking-tight">
            SkyWatch
          </h1>

          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.25em]">
            Air Analytics
          </p>
        </div>
      </div>

      {/* CENTER */}
      <nav className="flex items-center gap-2 bg-slate-100 dark:bg-[#FFFFFF]/[0.03] border border-[#E2E8F0] dark:border-white/[0.06] p-1.5 rounded-2xl transition-colors duration-300">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
                active
                  ? "bg-[#a3e635] text-[#0a0f1a] shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-[#a3e635]/10 dark:shadow-none"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-[#FFFFFF] dark:hover:bg-[#FFFFFF]/[0.04]"
              }`}
            >
              <Icon size={15} strokeWidth={active ? 2.6 : 2.2} />
              {item.name}
            </Link>
          );
        })}
        {/* Admin-only link */}
        {user?.role === 'admin' && (
          <Link
            href="/admin"
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95 ${
              isAdminActive
                ? 'bg-purple-500 text-white shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-purple-500/20'
                : 'text-purple-500 hover:bg-purple-500/10 hover:text-purple-600 border border-purple-500/20'
            }`}
          >
            <ShieldCheck size={15} strokeWidth={isAdminActive ? 2.6 : 2.2} />
            Admin
          </Link>
        )}
      </nav>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <NotificationBell />

        <ThemeToggle />

        <div className="w-px h-6 bg-slate-200 dark:bg-[#FFFFFF]/10 transition-colors duration-300" />

        <div className="flex items-center gap-3 border border-[#E2E8F0] dark:border-white/10 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] rounded-2xl px-2 py-1.5 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none transition-colors duration-300">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a3e635] to-lime-600 flex items-center justify-center text-[#0a0f1a] font-black text-sm uppercase shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)]">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>

          <div className="leading-none text-left">
            <p className="text-sm font-bold text-slate-900 dark:text-white capitalize">
              {user?.name || 'Loading...'}
            </p>

            <p className={`text-[10px] uppercase tracking-wider mt-1 ${
              user?.role === 'admin' ? 'text-purple-500 font-black' : 'text-slate-500'
            }`}>
              {user?.role === 'admin' ? 'Admin' : 'User'}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 h-14 px-4 flex items-center justify-between border-b border-[#E2E8F0] dark:border-white/5 bg-[#FFFFFF]/95 dark:bg-[#070d1a]/95 backdrop-blur-xl transition-colors duration-300">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-[#a3e635] flex items-center justify-center shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-[#a3e635]/15">
          <Wind size={16} className="text-[#0a0f1a]" strokeWidth={2.8} />
        </div>

        <div className="text-left">
          <h1 className="text-slate-900 dark:text-white font-black text-[14px]">
            SkyWatch
          </h1>

          <p className="text-[9px] text-slate-600 uppercase tracking-[0.25em] font-bold">
            Live Monitor
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />

        <ThemeToggle />
      </div>
    </header>
  );
}

function MobileBottomNav({ pathname, user }: { pathname: string; user: any }) {
  const items = [...menuItems];
  const isAdmin = user?.role === 'admin';
  if (isAdmin) {
    items.push({ name: "Admin", icon: ShieldCheck, path: "/admin" });
  }

  const numCols = items.length;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <nav
        className="relative h-[72px] rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/10 overflow-hidden bg-[#FFFFFF]/90 dark:bg-[#0a101e]/90 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300"
      >
        {/* glow */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              isAdmin
                ? "linear-gradient(90deg, transparent, rgba(168,85,247,0.45), transparent)"
                : "linear-gradient(90deg, transparent, rgba(163,230,53,0.45), transparent)",
          }}
        />

        <div 
          className="grid h-full" 
          style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
        >
          {items.map((item) => {
            const Icon = item.icon;
            const active = item.path === '/admin' ? pathname.startsWith('/admin') : pathname === item.path;
            const isPurpleTheme = item.path === '/admin';

            return (
              <Link
                key={item.path}
                href={item.path}
                className="relative flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform duration-100"
              >
                {/* active bubble */}
                {active && (
                  <div 
                    className={`absolute top-2.5 w-11 h-11 rounded-2xl border ${
                      isPurpleTheme 
                        ? "bg-purple-500/15 border-purple-500/25 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                        : "bg-[#a3e635]/15 border-[#a3e635]/25 shadow-[0_0_15px_rgba(163,230,53,0.15)]"
                    }`} 
                  />
                )}

                <div className="relative z-10 flex flex-col items-center justify-center gap-0.5">
                  <Icon
                    size={active ? 18 : 22}
                    strokeWidth={active ? 2.8 : 2.0}
                    className={
                      active 
                        ? (isPurpleTheme ? "text-purple-500 dark:text-purple-400 animate-in zoom-in-95 duration-150" : "text-[#a3e635] animate-in zoom-in-95 duration-150") 
                        : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-200"
                    }
                  />

                  {active && (
                    <span
                      className={`text-[8px] font-black tracking-widest uppercase animate-in fade-in slide-in-from-bottom-1 duration-200 ${
                        isPurpleTheme ? "text-purple-500 dark:text-purple-400" : "text-[#a3e635]"
                      }`}
                    >
                      {item.name}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

// Nomor WhatsApp Admin untuk Upgrade Premium
const WA_ADMIN = "6285792524863";

// Halaman yang dikunci untuk Free Member
// Education DIBUKA untuk semua (free & premium), Pengaduan DIKUNCI untuk free member
const LOCKED_PATHS = ["/", "/monitoring", "/reports", "/complaints"];

// Cek apakah user premium aktif (atau admin)
function isPremiumActive(user: any): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.subscription_status === 'active') {
    // Cek apakah belum expired
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
    <div className="fixed inset-0 z-[150] flex items-start justify-center pt-16 md:items-center md:pt-0 overflow-y-auto">
      {/* Blurred background blocker */}
      <div className="absolute inset-0 backdrop-blur-md bg-slate-900/10 dark:bg-[#070d1a]/30" />

      {/* Lock Card */}
      <div className="relative z-10 mx-4 my-8 max-w-sm w-full">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-[#a3e635]/10 blur-3xl rounded-3xl" />

        <div className="relative bg-[#FFFFFF]/80 dark:bg-[#0d1527]/80 backdrop-blur-2xl border border-white/30 dark:border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          {/* Lock icon with neon glow */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-[#a3e635]/30 blur-2xl rounded-full" />
            <div className="relative w-20 h-20 rounded-2xl bg-[#a3e635]/10 border border-[#a3e635]/30 flex items-center justify-center">
              <Lock size={32} className="text-[#a3e635]" strokeWidth={2.5} />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Crown size={14} className="text-[#a3e635]" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a3e635]">SkyWatch Premium</p>
          </div>

          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Fitur Terkunci
          </h2>

          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
            Halaman ini hanya dapat diakses oleh pengguna <span className="text-[#a3e635] font-black">Premium Active</span>. Upgrade sekarang untuk memantau kualitas udara secara real-time.
          </p>

          {/* Feature list */}
          <div className="space-y-2 mb-7 text-left">
            {[
              "📊 Dashboard Real-time (CO₂, NH₃, VOC, Suhu)",
              "📡 Log Histori Data Sensor Lengkap",
              "📈 Laporan & Grafik Tren Analisis",
              "💬 Kirim Pengaduan & Bantuan",
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2.5 w-full py-4 rounded-2xl bg-[#a3e635] hover:bg-[#b6f041] text-[#0a0f1a] font-black text-sm transition-all duration-200 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-[#a3e635]/30 hover:shadow-[#a3e635]/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageCircle size={18} strokeWidth={2.5} />
            Upgrade Sekarang via WhatsApp
          </a>

          <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-4">
            Atau kunjungi halaman{" "}
            <a href="/profile" className="text-[#a3e635] underline font-bold">Profile</a>{" "}
            untuk info lebih lanjut.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isAdminPage = pathname.startsWith("/admin");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!isAuthPage) {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.user) setUser(data.user);
        })
        .catch(err => console.error(err));
    }
  }, [isAuthPage]);

  // Apakah halaman ini perlu dikunci untuk free member?
  const isLockedPage = LOCKED_PATHS.includes(pathname);
  const isLocked = !isAuthPage && !isAdminPage && isLockedPage && user !== null && !isPremiumActive(user);

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-[#F1F5F9] dark:bg-[#070d1a] text-slate-900 dark:text-white antialiased transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div className="min-h-screen flex flex-col">
            {!isAuthPage && !isAdminPage && <DesktopNav pathname={pathname} user={user} />}
            {!isAuthPage && !isAdminPage && <MobileHeader />}

            <main className="flex-1 overflow-y-auto pb-28 lg:pb-0 relative">
              {/* Konten halaman — diberi blur jika terkunci */}
              <div className={isLocked ? "filter blur-sm pointer-events-none select-none opacity-60 transition-all duration-500" : ""}>
                {children}
              </div>

              {/* Lock Overlay muncul di atas konten yang diblur */}
              {isLocked && user && (
                <SubscriptionLockOverlay userEmail={user.email} />
              )}
            </main>

            {!isAuthPage && !isAdminPage && <MobileBottomNav pathname={pathname} user={user} />}

            {/* ========== FLOATING WHATSAPP CALL CENTER BUTTON ========== */}
            {!isAuthPage && !isAdminPage && (
              <a
                href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent("Halo Admin SkyWatch, saya butuh bantuan.")}`}
                target="_blank"
                rel="noopener noreferrer"
                id="wa-float-btn"
                className="fixed bottom-28 right-5 lg:bottom-8 lg:right-8 z-[100] group flex items-center gap-3"
                title="Hubungi Admin via WhatsApp"
              >
                {/* Tooltip label */}
                <span className="hidden lg:block opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 bg-[#25D366] text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] whitespace-nowrap">
                  Hubungi Admin
                </span>

                {/* Button */}
                <div className="relative">
                  {/* Pulse glow */}
                  <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-25" />
                  <div className="relative w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20c45c] flex items-center justify-center shadow-xl shadow-[#25D366]/40 hover:shadow-[#25D366]/60 hover:scale-110 transition-all duration-300">
                    {/* WhatsApp SVG icon */}
                    <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
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