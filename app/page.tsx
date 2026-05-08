"use client";
import React, { useEffect, useState, useCallback } from 'react';
import {
  Wind, AlertTriangle, CheckCircle, Activity,
  RefreshCw, TrendingUp, X, Info,
  Thermometer, Droplets, Flame, Zap, ShieldCheck
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { useThresholds } from '@/app/hooks/useThresholds';

const SENSOR_INFO = {
  co2: "Karbon Dioksida hasil pembakaran & respirasi. Di dapur bisa meningkat drastis saat kompor gas aktif.",
  nh3: "Amonia berbau tajam dari produk pembersih, kebocoran kulkas, atau pembusukan bahan organik.",
  temp: "Suhu tinggi memengaruhi kenyamanan kerja dan mempercepat pertumbuhan bakteri pada makanan.",
  hum: "Kelembapan tinggi mendorong pertumbuhan jamur & bakteri serta menciptakan lingkungan tidak nyaman."
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-[#0a1020]/95 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 shadow-2xl text-xs">
      <p className="text-slate-600 font-bold mb-2 uppercase tracking-widest text-[9px]">{label}</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">{p.name}</span>
            </div>
            <span className="font-black tabular-nums text-slate-900 dark:text-white text-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {p.value?.toFixed(p.dataKey === 'nh3' ? 2 : 1)}
              <span className="text-slate-600 font-normal ml-0.5 text-[9px]">
                {p.dataKey === 'co2' || p.dataKey === 'nh3' ? ' PPM' : p.dataKey === 'temp' ? '°C' : '%'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- INFO DRAWER MOBILE ---
function InfoDrawer({ open, onClose, label, value, unit, description, danger, delta, color }: any) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[201] rounded-t-3xl border-t border-slate-200 dark:border-white/10 px-6 pt-4 pb-10 bg-white dark:bg-[#0d1525]"
        style={{ animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}
      >
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/15 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
            <Info size={12} /> Detail Sensor
          </span>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/8">
            <X size={13} />
          </button>
        </div>
        <div className={`rounded-2xl px-5 py-5 mb-4 border ${danger ? 'bg-red-500/8 border-red-500/20' : 'bg-emerald-500/8 border-emerald-500/15'}`}>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{label}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tabular-nums" style={{ color: danger ? '#f87171' : '#4ade80', fontFamily: "'IBM Plex Mono', monospace" }}>{value}</span>
            <span className="text-slate-400 font-bold text-xl">{unit}</span>
          </div>
          {delta && (
            <div className="flex items-center gap-1.5 mt-2.5">
              <TrendingUp size={10} style={{ color }} />
              <span className="text-[11px] font-bold" style={{ color }}>{delta}</span>
            </div>
          )}
        </div>
        <div className="bg-slate-50 dark:bg-white/3 rounded-2xl px-5 py-4 border border-slate-200 dark:border-white/5 mb-4">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Penjelasan</p>
          <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
        </div>
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-wider ${
          danger ? 'bg-red-500/8 border-red-500/20 text-red-400' : 'bg-emerald-500/8 border-emerald-500/20 text-emerald-400'
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${danger ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
          {danger ? 'Melebihi Batas Aman — Perlu Perhatian' : 'Dalam Batas Aman'}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </>
  );
}

// --- SENSOR METRIC CARD — info langsung tampil di dalam card ---
function SensorCard({
  label, value, unit, danger, color, bgColor,
  description, delta, icon: Icon, threshold, infoKey
}: {
  label: string; value: string; unit: string; danger: boolean;
  color: string; bgColor: string; description: string; delta: string;
  icon: any; threshold: number; infoKey: keyof typeof SENSOR_INFO;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const numVal = parseFloat(value);
  const pct = Math.min((numVal / threshold) * 100, 100);

  return (
    <>
      <div
        onClick={() => setDrawerOpen(true)}
        className="relative rounded-2xl border border-slate-200 dark:border-white/15 overflow-hidden cursor-pointer group transition-all duration-300 hover:border-slate-300 dark:hover:border-white/25 hover:scale-[1.015] active:scale-[0.99] bg-white dark:bg-white/[0.06] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)]"
      >
        {/* Top color line */}
        <div className="absolute inset-x-0 top-0 h-[2px] opacity-60 dark:opacity-100" style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

        {/* Glow bg */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-25 dark:opacity-10 group-hover:opacity-40 dark:group-hover:opacity-20 transition-opacity pointer-events-none"
          style={{ background: color }} />

        <div className="px-5 py-5">
          {/* Row 1 — icon + status badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl border border-slate-200 dark:border-white/8" style={{ background: `${color}12` }}>
              <Icon size={15} style={{ color }} />
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
              danger
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${danger ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              {danger ? 'Danger' : 'Safe'}
            </div>
          </div>

          {/* Row 2 — label */}
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.28em] mb-1">{label}</p>

          {/* Row 3 — value */}
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-black tabular-nums text-slate-900 dark:text-white transition-colors"
              style={{ fontFamily: "'IBM Plex Mono', monospace", color: danger ? '#f87171' : undefined }}>
              {value}
            </span>
            <span className="text-slate-500 font-bold text-sm">{unit}</span>
          </div>

          {/* Row 4 — delta */}
          <div className="flex items-center gap-1 mb-4 h-4">
            <TrendingUp size={9} style={{ color }} />
            <span className="text-[10px] font-bold" style={{ color }}>{delta}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mb-3">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${pct}%`,
                background: danger
                  ? 'linear-gradient(90deg, #f87171, #ef4444)'
                  : `linear-gradient(90deg, ${color}60, ${color})`
              }} />
          </div>

          {/* Row 5 — threshold info */}
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-600 font-mono">
              Batas: <span className="text-slate-500">{threshold} {unit}</span>
            </p>
            <span className="text-[9px] text-slate-600 font-bold uppercase tracking-wider flex items-center gap-0.5">
              <Info size={9} /> Info
            </span>
          </div>

          {/* Description snippet — always visible */}
          <p className="mt-2 text-[11px] text-slate-600 leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      <InfoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        label={label} value={value} unit={unit}
        description={description} danger={danger}
        delta={delta} color={color}
      />
    </>
  );
}

// --- MAIN DASHBOARD ---
export default function Dashboard() {
  const { thresholds: T, isLoaded: thresholdsLoaded } = useThresholds();
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // Emergency state
  const [alarmAcknowledged, setAlarmAcknowledged] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sensor');
      const result = await res.json();
      if (Array.isArray(result) && result.length > 0) {
        setData(result[0]);
        const formatted = result.slice(0, 20).map((item: any) => ({
          ...item,
          time: new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        })).reverse();
        setHistory(formatted);
        setLastSync(new Date().toLocaleTimeString('id-ID'));
      }
    } catch (e) {
      console.error('SkyWatch fetch error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchData();
    const iv = setInterval(fetchData, 10000);
    return () => clearInterval(iv);
  }, [fetchData]);

  // Audio Alarm Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mounted && data && !alarmAcknowledged) {
      const isDangerNow = data.co2 > T.co2 || data.nh3 > T.nh3 || data.temp > T.temp;
      if (isDangerNow) {
        const playAlarm = () => {
          try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'square';
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
          } catch (e) {}
        };
        playAlarm(); // Play immediately
        interval = setInterval(playAlarm, 1000);
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mounted, data, alarmAcknowledged, T]);

  // Reset acknowledged if it becomes safe again
  useEffect(() => {
    if (data) {
      const isDangerNow = data.co2 > T.co2 || data.nh3 > T.nh3 || data.temp > T.temp;
      if (!isDangerNow) {
        setAlarmAcknowledged(false);
      }
    }
  }, [data, T]);

  if (!mounted || !data || !thresholdsLoaded) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#070d1a] flex flex-col items-center justify-center gap-4 transition-colors duration-300">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-[#a3e635]/10 border border-[#a3e635]/20 flex items-center justify-center">
            <Wind size={22} className="text-[#a3e635] animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-[#a3e635]/15 blur-xl animate-pulse" />
        </div>
        <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
          Initializing SkyWatch...
        </p>
      </div>
    );
  }

  const isDanger = data.co2 > T.co2 || data.nh3 > T.nh3 || data.temp > T.temp;
  const dangerLabels: string[] = [];
  if (data.co2 > T.co2) dangerLabels.push('CO₂');
  if (data.nh3 > T.nh3) dangerLabels.push('NH₃');
  if (data.temp > T.temp) dangerLabels.push('TEMP');

  const sensors = [
    {
      key: 'co2' as const,
      label: 'CO₂', value: data.co2?.toFixed(0) ?? '--', unit: 'PPM',
      danger: data.co2 > T.co2, color: '#3b82f6', bgColor: '#3b82f610',
      delta: data.co2 > T.co2 ? 'Elevated' : 'Normal',
      icon: Zap, threshold: T.co2, infoKey: 'co2' as const,
      description: SENSOR_INFO.co2,
    },
    {
      key: 'nh3' as const,
      label: 'NH₃', value: data.nh3?.toFixed(2) ?? '--', unit: 'PPM',
      danger: data.nh3 > T.nh3, color: '#a78bfa', bgColor: '#a78bfa10',
      delta: data.nh3 > T.nh3 ? 'High' : 'Safe',
      icon: Wind, threshold: T.nh3, infoKey: 'nh3' as const,
      description: SENSOR_INFO.nh3,
    },
    {
      key: 'temp' as const,
      label: 'Temperature', value: data.temp?.toFixed(1) ?? '--', unit: '°C',
      danger: data.temp > T.temp, color: '#f97316', bgColor: '#f9731610',
      delta: data.temp > T.temp ? 'Hot' : 'Normal',
      icon: Flame, threshold: T.temp, infoKey: 'temp' as const,
      description: SENSOR_INFO.temp,
    },
    {
      key: 'hum' as const,
      label: 'Humidity', value: data.hum?.toFixed(0) ?? '--', unit: '%',
      danger: data.hum > T.hum, color: '#38bdf8', bgColor: '#38bdf810',
      delta: data.hum > T.hum ? 'Humid' : 'Ideal',
      icon: Droplets, threshold: T.hum, infoKey: 'hum' as const,
      description: SENSOR_INFO.hum,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070d1a] text-slate-900 dark:text-white transition-colors duration-300">
      {/* PAGE HEADER */}
      <div className="px-6 md:px-8 pt-7 pb-5">
        <div className="flex items-start justify-between gap-4 w-full">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.35em] mb-1">Kitchen Sensor Node</p>
            <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              My Dashboard
            </h1>
            {lastSync && (
              <p className="text-slate-600 text-xs mt-1 font-mono">Last sync {lastSync}</p>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all duration-500 ${
              isDanger
                ? 'bg-red-500/8 border-red-500/20 text-red-400'
                : 'bg-emerald-500/8 border-emerald-500/15 text-emerald-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDanger ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="hidden sm:inline">{isDanger ? `⚠ ${dangerLabels.join(' · ')}` : 'Optimal'}</span>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/8 bg-white dark:bg-white/[0.04] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-all text-[11px] font-bold uppercase tracking-wider shadow-sm dark:shadow-none"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 xl:px-12 pb-8 space-y-5 w-full">

        {/* EMERGENCY MODAL */}
        {isDanger && !alarmAcknowledged && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-red-900/60 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-[#070d1a] border-2 border-red-500 rounded-3xl p-6 md:p-10 max-w-lg w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.4)] animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <AlertTriangle size={48} className="text-red-500 animate-ping absolute opacity-30" />
                <AlertTriangle size={48} className="text-red-500 relative z-10" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-red-500 uppercase tracking-widest mb-3">KEBOCORAN DARURAT!</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 font-bold text-sm md:text-base leading-relaxed">
                Sensor mendeteksi level kritis pada: <span className="text-red-500 font-black">{dangerLabels.join(', ')}</span>.<br/>Segera amankan area ruangan.
              </p>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-left">
                <p className="text-red-500 text-xs font-bold uppercase tracking-wider mb-2">Tindakan Manual yang harus dilakukan:</p>
                <ul className="text-slate-700 dark:text-slate-300 text-sm list-disc pl-5 space-y-1.5 font-medium">
                  <li>Segera matikan kompor & sumber api.</li>
                  <li>Cabut regulator gas jika aman dilakukan.</li>
                  <li>Buka jendela & pintu lebar-lebar.</li>
                  <li>Jangan menyalakan/mematikan saklar listrik!</li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setAlarmAcknowledged(true)}
                  className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-3 shadow-lg shadow-red-500/30"
                >
                  <CheckCircle size={20} /> Mengerti & Matikan Suara Alarm
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ALERT BANNER */}
        <div className={`relative rounded-2xl border px-5 py-4 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-700 ${
          isDanger ? 'bg-red-500/5 border-red-500/20' : 'bg-emerald-500/5 border-emerald-500/15'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`absolute inset-y-0 left-0 w-[3px] rounded-r ${isDanger ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${isDanger ? 'bg-red-500/12' : 'bg-emerald-500/12'}`}>
              {isDanger
                ? <AlertTriangle size={17} className="text-red-400" />
                : <CheckCircle size={17} className="text-emerald-400" />}
            </div>
            <div>
              <p className={`font-black text-sm uppercase tracking-wide ${isDanger ? 'text-red-400' : 'text-emerald-400'}`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {isDanger ? `DANGER — ${dangerLabels.join(', ')} MELEBIHI BATAS` : 'SYSTEM STATUS — SEMUA SENSOR OPTIMAL'}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {isDanger ? 'Peringatan: Level gas telah melebihi batas aman. Lakukan tindakan darurat manual.' : 'Kondisi dapur aman. Pemantauan aktif setiap 10 detik.'}
              </p>
            </div>
          </div>
          
          {/* Action indicators */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 ml-10 sm:ml-0">
            {isDanger && alarmAcknowledged && (
              <span className="text-[10px] font-black bg-red-500/10 text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20">
                Alarm Dimatikan
              </span>
            )}
          </div>
        </div>

        {/* SENSOR CARDS — 2×2 grid, info langsung di dalam */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
{sensors.map(({ key, ...sensor }) => (
  <SensorCard key={key} {...sensor} />
))}
        </div>

        {/* CHART + SIDE STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Area Chart */}
          <div
            className="lg:col-span-2 flex flex-col rounded-2xl border border-slate-200 dark:border-white/15 overflow-hidden bg-white dark:bg-white/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)]"
          >
            <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4 border-b border-slate-200 dark:border-white/5">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Activity size={12} className="text-blue-400" />
                  <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Air Quality Trend</span>
                </div>
                <p className="text-[10px] text-slate-700 font-mono">20 pembacaan terakhir</p>
              </div>
              <div className="flex items-center gap-2">
                {[
                  { k: 'CO₂', c: 'bg-blue-500' },
                  { k: 'NH₃', c: 'bg-yellow-500' },
                  { k: 'TEMP', c: 'bg-orange-500' },
                  { k: 'HUM', c: 'bg-purple-500' }
                ].map(i => (
                  <div key={i.k} className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded border border-slate-200 dark:border-white/10">
                    <span className={`w-2 h-2 rounded-full ${i.c}`} />
                    <span className="text-[9px] font-black uppercase text-slate-500">{i.k}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-2 pb-5 pt-2 flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNh3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area yAxisId="left" type="monotone" dataKey="co2" stroke="#3b82f6" strokeWidth={3} fill="url(#colorCo2)" />
                  <Area yAxisId="left" type="monotone" dataKey="nh3" stroke="#eab308" strokeWidth={3} fill="url(#colorNh3)" />
                  <Area yAxisId="right" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fill="url(#colorTemp)" />
                  <Area yAxisId="right" type="monotone" dataKey="hum" stroke="#a855f7" strokeWidth={3} fill="url(#colorHum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side — Device Info & Safety Summary */}
          <div className="flex flex-col gap-5 h-full">
            {/* Device Status Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 p-5 relative overflow-hidden bg-white dark:bg-white/[0.04] shadow-sm">
              <div className="absolute inset-x-0 top-0 h-[2px] opacity-60 dark:opacity-100"
                style={{ background: 'linear-gradient(90deg, transparent, #a3e635, transparent)' }} />
              
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-[#a3e635]" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">IoT Node Status</span>
                </div>
                <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md uppercase tracking-wider border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Device ID</span>
                  <span className="text-xs font-mono text-slate-900 dark:text-white font-bold">NODE-KITCHEN-01</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Sensors</span>
                  <span className="text-xs font-mono text-slate-900 dark:text-white font-bold">MQ135, DHT22</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Network</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-slate-900 dark:text-white font-bold">WiFi</span>
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-1 h-1.5 bg-slate-800 dark:bg-slate-300 rounded-sm"/>
                      <div className="w-1 h-2 bg-slate-800 dark:bg-slate-300 rounded-sm"/>
                      <div className="w-1 h-full bg-slate-800 dark:bg-slate-300 rounded-sm"/>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Last Sync</span>
                  <span className="text-xs font-mono text-slate-900 dark:text-white font-bold">{lastSync || '--:--:--'}</span>
                </div>
              </div>
            </div>

            {/* Safety Advice Card */}
            <div className={`rounded-2xl border p-5 relative overflow-hidden transition-colors flex-1 flex flex-col justify-center ${
              isDanger 
                ? 'bg-red-500/5 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.1)]' 
                : 'bg-emerald-500/5 border-emerald-500/15 shadow-[0_0_30px_rgba(16,185,129,0.05)]'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                {isDanger ? <AlertTriangle size={14} className="text-red-500" /> : <ShieldCheck size={14} className="text-emerald-500" />}
                <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDanger ? 'text-red-500' : 'text-emerald-500'}`}>
                  Rekomendasi Sistem
                </span>
              </div>
              
              <h3 className={`text-lg font-black mb-2 leading-tight ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isDanger ? 'Tindakan Evakuasi Diperlukan!' : 'Udara Dapur Terjaga Baik'}
              </h3>
              
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {isDanger 
                  ? 'Kadar gas telah melewati batas aman yang ditentukan. Segera cabut regulator gas, buka jendela lebar-lebar, dan jangan sentuh saklar listrik.' 
                  : 'Sirkulasi udara dan kadar gas saat ini terpantau berada dalam rentang normal. Tidak ada tindakan khusus yang diperlukan.'}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}