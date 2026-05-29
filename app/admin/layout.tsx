"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.headers.get('content-type')?.includes('application/json') ? r.json() : { user: null })
      .then((d) => {
        if (!d.user || d.user.role !== "admin") {
          router.replace("/");
        } else {
          setIsAdmin(true);
        }
      })
      .catch(() => {
        router.replace("/");
      });
  }, [router]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Memuat Hak Akses Admin...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {children}
    </div>
  );
}
