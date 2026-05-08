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
} from "lucide-react";

import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";

import "./globals.css";

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Monitoring", icon: Table, path: "/monitoring" },
  { name: "Reports", icon: FileBarChart, path: "/reports" },
  { name: "Education", icon: BookOpen, path: "/education" },
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
      className="w-10 h-10 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all duration-200"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  return (
    <header className="hidden lg:flex h-[72px] items-center justify-between px-8 border-b border-white/5 bg-[#070d1a]/95 backdrop-blur-xl sticky top-0 z-40">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-[#a3e635] flex items-center justify-center">
            <Wind className="text-[#0a0f1a]" size={18} strokeWidth={2.8} />
          </div>

          <div className="absolute inset-0 bg-[#a3e635]/30 blur-xl rounded-2xl -z-10" />
        </div>

        <div>
          <h1 className="text-white font-black text-[15px] tracking-tight">
            SkyWatch
          </h1>

          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.25em]">
            Air Analytics
          </p>
        </div>
      </div>

      {/* CENTER */}
      <nav className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] p-1.5 rounded-2xl">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.path;

          return (
            <Link
              key={item.path}
              href={item.path}
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-[#a3e635] text-[#0a0f1a]"
                  : "text-slate-500 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              <Icon size={15} strokeWidth={active ? 2.6 : 2.2} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
        <button className="relative w-10 h-10 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white hover:border-white/20 transition-all">
          <Bell size={16} />

          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#a3e635]" />
        </button>

        <ThemeToggle />

        <div className="w-px h-6 bg-white/10" />

        <div className="flex items-center gap-3 border border-white/10 bg-white/[0.04] rounded-2xl px-2 py-1.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#a3e635] to-lime-600 flex items-center justify-center text-[#0a0f1a] font-black text-sm">
            A
          </div>

          <div className="leading-none">
            <p className="text-sm font-bold text-white">
              Agna Putra
            </p>

            <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1">
              Operator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileHeader() {
  return (
    <header className="lg:hidden sticky top-0 z-40 h-14 px-4 flex items-center justify-between border-b border-white/5 bg-[#070d1a]/95 backdrop-blur-xl">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-2xl bg-[#a3e635] flex items-center justify-center">
          <Wind size={16} className="text-[#0a0f1a]" strokeWidth={2.8} />
        </div>

        <div>
          <h1 className="text-white font-black text-[14px]">
            SkyWatch
          </h1>

          <p className="text-[9px] text-slate-600 uppercase tracking-[0.25em] font-bold">
            Live Monitor
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative w-10 h-10 rounded-2xl border border-white/10 bg-white/[0.04] flex items-center justify-center text-slate-400">
          <Bell size={15} />

          <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#a3e635]" />
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
}

function MobileBottomNav({ pathname }: { pathname: string }) {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <nav
        className="relative h-[72px] rounded-3xl border border-white/10 overflow-hidden"
        style={{
          background: "rgba(10,16,30,0.88)",
          backdropFilter: "blur(22px)",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.45)",
        }}
      >
        {/* glow */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(163,230,53,0.45), transparent)",
          }}
        />

        <div className="grid grid-cols-5 h-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;

            return (
              <Link
                key={item.path}
                href={item.path}
                className="relative flex flex-col items-center justify-center gap-1"
              >
                {/* active bubble */}
                {active && (
                  <div className="absolute top-2 w-11 h-11 rounded-2xl bg-[#a3e635]/15 border border-[#a3e635]/20" />
                )}

                <div className="relative z-10 flex flex-col items-center gap-1">
                  <Icon
                    size={20}
                    strokeWidth={active ? 2.8 : 2.2}
                    className={
                      active ? "text-[#a3e635]" : "text-slate-600"
                    }
                  />

                  <span
                    className={`text-[10px] font-black tracking-wide ${
                      active
                        ? "text-[#a3e635]"
                        : "text-slate-600"
                    }`}
                  >
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="bg-[#070d1a] text-white antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div className="min-h-screen flex flex-col">
            <DesktopNav pathname={pathname} />

            <MobileHeader />

            <main className="flex-1 overflow-y-auto pb-28 lg:pb-0">
              {children}
            </main>

            <MobileBottomNav pathname={pathname} />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}