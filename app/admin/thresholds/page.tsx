"use client";
import React, { useState, useEffect } from 'react';
import { useThresholds } from '@/app/hooks/useThresholds';
import { Cpu, RefreshCw, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminThresholdsPage() {
  const { thresholds, saveThresholds, isLoaded } = useThresholds();
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (d.user) {
        setUser(d.user);
        if (d.user.role !== 'admin') {
          router.replace('/');
        }
      } else {
        router.replace('/login');
      }
    });
  }, [router]);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>Pengaturan Ambang Batas</h1>
          <p className="text-slate-500 text-xs mt-1 font-mono">Sesuaikan nilai ambang batas peringatan sensor</p>
        </div>
      </div>

      <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-3xl p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.01)] transition-colors max-w-4xl">
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 max-w-2xl leading-relaxed">
          Ubah nilai maksimal sensor di bawah ini. Jika ada perangkat sensor yang mengirim nilai melebihi ambang batas ini, sistem akan otomatis mendeteksinya sebagai status bahaya/darurat di seluruh sistem (Dashboard, Monitoring, dan Laporan).
        </p>

        {isLoaded ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
            {Object.entries(thresholds).map(([key, val]) => (
              <div key={key} className="flex flex-col gap-2.5">
                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center justify-between">
                  <span>Maksimal {key === 'hum' ? 'Kelembapan' : key === 'temp' ? 'Suhu' : key.toUpperCase()}</span>
                  {key === 'co2' || key === 'nh3' || key === 'voc' ? (
                    <span className="text-[9px] text-blue-500">Gas</span>
                  ) : (
                    <span className="text-[9px] text-orange-500">Udara</span>
                  )}
                </label>
                <div className="relative group">
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => saveThresholds({ ...thresholds, [key]: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 rounded-2xl pl-5 pr-14 py-4 text-base font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner dark:shadow-none"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-200 dark:bg-white/10 px-2 py-1 rounded-md text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pointer-events-none group-focus-within:bg-blue-500/10 group-focus-within:text-blue-500 transition-colors">
                    {key === 'co2' || key === 'nh3' || key === 'voc' ? 'PPM' : key === 'temp' ? '°C' : '%'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-slate-500 flex items-center py-6 animate-pulse gap-3 font-bold uppercase tracking-widest">
            <RefreshCw size={16} className="animate-spin" />
            Memuat konfigurasi...
          </div>
        )}
      </div>
    </div>
  );
}
