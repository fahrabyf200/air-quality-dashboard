"use client";
import React, { useState, useEffect } from 'react';
import { useThresholds } from '@/app/hooks/useThresholds';
import { Cpu, RefreshCw, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminThresholdsPage() {
  const { thresholds, saveThresholds, isLoaded } = useThresholds();
  const [localThresholds, setLocalThresholds] = useState<typeof thresholds | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.headers.get('content-type')?.includes('application/json') ? r.json() : { user: null })
      .then(d => {
        if (d.user) {
          setUser(d.user);
          if (d.user.role !== 'admin') {
            router.replace('/');
          }
        } else {
          router.replace('/login');
        }
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  // Sync state lokal ketika data sudah berhasil dimuat dari server
  useEffect(() => {
    if (isLoaded && thresholds && !localThresholds) {
      setLocalThresholds(thresholds);
    }
  }, [isLoaded, thresholds, localThresholds]);

  if (!user || user.role !== 'admin') return null;

  const handleSave = async () => {
    if (localThresholds) {
      setIsSaving(true);
      await saveThresholds(localThresholds);
      setTimeout(() => setIsSaving(false), 500); // efek loading sebentar
    }
  };

  return (
    <div className="px-6 md:px-10 xl:px-12 pt-7 pb-8 space-y-6 w-full transition-colors duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full border-b border-slate-200/60 dark:border-slate-800/40 pb-5">
        <div>
          <p className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">System Administration</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Gas Threshold Settings
          </h1>
          <p className="text-slate-555 dark:text-slate-400 text-xs mt-1">Sesuaikan nilai ambang batas toleransi deteksi bahaya sensor</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm p-6 md:p-8 relative overflow-hidden group transition-all duration-300">
        <p className="text-xs text-slate-500 dark:text-slate-450 mb-8 leading-relaxed">
          Atur nilai batas maksimal toleransi untuk masing-masing parameter sensor di bawah ini. Ketika salah satu titik sensor mendeteksi nilai yang melebihi ambang batas ini, sistem akan otomatis mengaktifkan status bahaya (danger) dan membunyikan alarm darurat di dasbor pengguna.
        </p>

        {isLoaded && localThresholds ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
              {Object.entries(localThresholds).map(([key, val]) => (
                <div key={key} className="flex flex-col gap-2">
                  <label className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between">
                    <span>Maksimal {key === 'hum' ? 'Kelembapan' : key === 'temp' ? 'Suhu' : key.toUpperCase()}</span>
                    {key === 'co2' || key === 'nh3' || key === 'voc' ? (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-500 uppercase tracking-wider">Gas</span>
                    ) : (
                      <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-500 uppercase tracking-wider">Udara</span>
                    )}
                  </label>
                  <div className="relative group">
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => setLocalThresholds({ ...localThresholds, [key]: Number(e.target.value) })}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl pl-4 pr-14 py-2.5 text-xs font-bold text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/60 px-2 py-0.5 rounded text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pointer-events-none group-focus-within:border-emerald-500/30 group-focus-within:text-emerald-600 dark:text-emerald-500 transition-all">
                      {key === 'co2' || key === 'nh3' || key === 'voc' ? 'PPM' : key === 'temp' ? '°C' : '%'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800/60">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm"
              >
                {isSaving ? <RefreshCw size={12} className="animate-spin" /> : <Save size={12} />}
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-500 flex items-center py-6 animate-pulse gap-2.5 font-bold uppercase tracking-widest">
            <RefreshCw size={14} className="animate-spin" />
            <span>Memuat konfigurasi...</span>
          </div>
        )}
      </div>
    </div>
  );
}
