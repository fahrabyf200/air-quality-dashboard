"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Database,
  Activity,
  ShieldCheck,
  Wind,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  Bell,
} from "lucide-react";
import { useTheme } from "next-themes";

const adminMenu = [
  { name: "Overview", icon: LayoutDashboard, path: "/admin" },
  { name: "Kelola User", icon: Users, path: "/admin/users" },
  { name: "Data Sensor", icon: Database, path: "/admin/sensor" },
  { name: "Aktivitas Log", icon: Activity, path: "/admin/logs" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all shadow-sm dark:shadow-none"
    >
      {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

function AdminSidebar({
  pathname,
  user,
  onClose,
}: {
  pathname: string;
  user: any;
  onClose?: () => void;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0a0514] border-r border-slate-200 dark:border-white/[0.06] transition-colors duration-300">
      {/* Top gradient accent */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      {/* Logo */}
      <div className="px-5 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 dark:border-purple-500/30 flex items-center justify-center">
              <ShieldCheck size={18} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="absolute inset-0 bg-purple-500/10 dark:bg-purple-500/20 blur-xl rounded-xl -z-10" />
          </div>
          <div>
            <p className="text-slate-900 dark:text-white font-black text-[14px] tracking-tight">
              SkyWatch
            </p>
            <p className="text-[9px] text-purple-600 dark:text-purple-400 font-black uppercase tracking-[0.25em]">
              Admin Panel
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Admin Info */}
      <div className="mx-4 mb-5 p-3.5 rounded-2xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/10 dark:border-purple-500/20 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-black text-sm uppercase flex-shrink-0 shadow-sm">
            {user?.name?.charAt(0) || "A"}
          </div>
          <div className="min-w-0">
            <p className="text-slate-900 dark:text-white font-bold text-sm capitalize truncate">
              {user?.name || "Admin"}
            </p>
            <p className="text-[9px] text-purple-600 dark:text-purple-400 font-black uppercase tracking-wider">
              Administrator
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-3 flex-1 space-y-1">
        <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-600 px-2 mb-3">
          Menu Utama
        </p>

        {adminMenu.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                active
                  ? "bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20 dark:border-purple-500/30"
                  : "text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04]"
              }`}
            >
              {active && (
                <div className="absolute inset-0 rounded-xl bg-purple-500/5 blur-sm" />
              )}
              <div
                className={`relative w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  active
                    ? "bg-purple-500/20 dark:bg-purple-500/30 text-purple-600 dark:text-purple-300"
                    : "text-slate-500 dark:text-slate-600 group-hover:text-slate-900 group-hover:dark:text-slate-300 group-hover:bg-slate-100 group-hover:dark:bg-white/5"
                }`}
              >
                <Icon size={16} />
              </div>
              <span className="relative">{item.name}</span>
              {active && (
                <ChevronRight size={14} className="ml-auto text-purple-600 dark:text-purple-400" />
              )}
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-600 px-2 mb-3">
            Sistem
          </p>
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all group"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-600 group-hover:text-slate-900 group-hover:dark:text-slate-300 group-hover:bg-slate-100 group-hover:dark:bg-white/5 transition-all">
              <Wind size={16} />
            </div>
            Lihat Dashboard User
          </Link>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-4 border-t border-slate-200 dark:border-white/[0.06] space-y-2">
        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-600">Tema</span>
          <ThemeToggle />
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-black text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all group"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-red-500/10 transition-all">
            <LogOut size={16} />
          </div>
          Keluar
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.role !== "admin") {
          router.replace("/");
        } else {
          setUser(d.user);
        }
      });
  }, [router]);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#060410] text-slate-900 dark:text-white transition-colors duration-300">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 z-30">
        <AdminSidebar pathname={pathname} user={user} />
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 dark:bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden">
            <AdminSidebar
              pathname={pathname}
              user={user}
              onClose={() => setSidebarOpen(false)}
            />
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* MOBILE TOP BAR */}
        <header className="lg:hidden sticky top-0 z-30 h-14 px-4 flex items-center justify-between border-b border-slate-200 dark:border-white/[0.06] bg-white/95 dark:bg-[#060410]/95 backdrop-blur-xl">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            <Menu size={18} />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20 dark:border-purple-500/30 flex items-center justify-center">
              <ShieldCheck size={14} className="text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-slate-900 dark:text-white font-black text-sm">Admin Panel</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 relative">
              <Bell size={15} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-500" />
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* DESKTOP TOP BAR */}
        <header className="hidden lg:flex sticky top-0 z-20 h-[60px] px-8 items-center justify-between border-b border-slate-200 dark:border-white/[0.05] bg-white/80 dark:bg-[#060410]/80 backdrop-blur-xl">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-400 dark:text-slate-600">
              Admin Panel
            </p>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">
              {adminMenu.find((m) => m.path === pathname)?.name ?? "Overview"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
              <Bell size={15} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-purple-500 dark:bg-purple-400 animate-pulse" />
            </button>
            <ThemeToggle />
            <div className="w-px h-5 bg-slate-200 dark:bg-white/10" />
            <div className="flex items-center gap-2.5 border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white font-black text-xs uppercase shadow-sm">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white capitalize leading-none">
                  {user?.name || "Admin"}
                </p>
                <p className="text-[9px] text-purple-600 dark:text-purple-400 font-black uppercase tracking-wider mt-0.5">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
