"use client";
import React, { useEffect, useState, useCallback } from 'react';
import {
  Wind, AlertTriangle, CheckCircle, Activity,
  Thermometer, Droplets, RefreshCw,
  Cpu, TrendingUp, X, Info
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart, Line
} from 'recharts';

// --- KONFIGURASI ---
const T = { co2: 800, nh3: 2, temp: 35, hum: 80 };

const SENSOR_INFO = {
  co2: "Karbon Dioksida adalah gas hasil pembakaran bahan bakar dan respirasi manusia. Di dapur, CO₂ dapat meningkat drastis saat menggunakan kompor gas.",
  nh3: "Amonia adalah gas berbau tajam yang bisa berasal dari produk pembersih, kebocoran kulkas, atau pembusukan bahan organik.",
  temp: "Suhu dapur yang terlalu tinggi memengaruhi kenyamanan kerja dan mempercepat pertumbuhan bakteri pada makanan.",
  hum: "Kelembapan tinggi mendorong pertumbuhan jamur dan bakteri serta menciptakan lingkungan tidak nyaman."
};

const METRIC_UNITS: Record<string, string> = {
  co2: 'PPM', temp: '°C', nh3: 'PPM'
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1425]/95 backdrop-blur-md border border-slate-700/60 rounded-2xl px-4 py-3 shadow-2xl text-xs" style={{ minWidth: 150 }}>
      <p className="text-slate-500 font-bold mb-2.5 uppercase tracking-widest text-[9px]">{label}</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">{p.name}</span>
            </div>
            <span className="font-black tabular-nums text-white" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {p.value?.toFixed(p.dataKey === 'nh3' ? 2 : 1)}
              <span className="text-slate-500 font-normal ml-0.5 text-[9px]">{METRIC_UNITS[p.dataKey]}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MODAL INFO UNTUK MOBILE ---
function InfoModal({
  open,
  onClose,
  label,
  value,
  unit,
  description,
  danger,
  delta,
  color,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  value: string;
  unit: string;
  description: string;
  danger: boolean;
  delta?: string;
  color: string;
}) {
  // Tutup saat klik backdrop
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[201] bg-white dark:bg-[#0d1425] rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-700/60 px-6 pt-4 pb-10 animate-slide-up"
        style={{
          animation: 'slideUp 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Handle bar */}
        <div className="w-10 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-slate-400" />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              Informasi Sensor
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Metric Display */}
        <div
          className={`rounded-2xl px-5 py-4 mb-4 border ${
            danger
              ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30'
              : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20'
          }`}
        >
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">{label}</p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-5xl font-black tabular-nums"
              style={{
                color: danger ? '#f87171' : '#4ade80',
                fontFamily: "'IBM Plex Mono', monospace",
              }}
            >
              {value}
            </span>
            <span className="text-slate-400 font-bold text-xl">{unit}</span>
          </div>
          {delta && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={10} style={{ color }} />
              <span className="text-[11px] font-bold" style={{ color }}>{delta}</span>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl px-5 py-4 border border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Penjelasan</p>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{description}</p>
        </div>

        {/* Status Tag */}
        <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-wider ${
          danger
            ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${danger ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
          {danger ? 'Melebihi Batas Aman — Perlu Perhatian' : 'Dalam Batas Aman'}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

// --- KOMPONEN KARTU DENGAN TOOLTIP DESKTOP + MODAL MOBILE ---
function StatHeaderCard({
  label, value, unit, delta, color, danger, description
}: {
  label: string; value: string; unit: string;
  delta?: string; color: string; danger: boolean;
  description: string;
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      {/* Kartu — onClick untuk mobile, hover tooltip untuk desktop */}
      <div
        className="flex-1 min-w-[160px] px-6 py-5 border-r border-slate-100 dark:border-slate-800/50 last:border-r-0 group cursor-pointer lg:cursor-default transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/20 relative overflow-visible select-none"
        onClick={() => setModalOpen(true)}
      >
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em] mb-2 leading-none flex items-center gap-1">
          {label}
          {/* Ikon "i" kecil — hanya terlihat di mobile sebagai petunjuk bisa diklik */}
          <span className="text-[8px] bg-slate-100 dark:bg-slate-800 px-1 rounded font-mono italic lg:opacity-0 group-hover:opacity-100 transition-opacity">i</span>
        </p>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span
            className="text-3xl font-black tracking-tighter tabular-nums transition-colors"
            style={{
              color: danger ? '#f87171' : undefined,
              fontFamily: "'IBM Plex Mono', monospace",
            }}
          >
            {value}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold">{unit}</span>
        </div>
        {delta && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp size={10} style={{ color }} />
            <span className="text-[10px] font-bold" style={{ color }}>{delta}</span>
          </div>
        )}

        {/* Ripple effect hint di mobile */}
        <div className="absolute bottom-2 right-3 lg:hidden">
          <Info size={11} className="text-slate-300 dark:text-slate-700" />
        </div>

        {/* TOOLTIP HOVER — desktop only (lg+) */}
        <div className="hidden lg:block absolute left-1/2 -translate-x-1/2 bottom-[110%] w-60 p-4 bg-slate-900 dark:bg-slate-800 text-white text-[11px] leading-relaxed rounded-2xl shadow-2xl border border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[100] pointer-events-none">
          <p className="font-bold mb-1 text-[#a3e635] uppercase tracking-tighter"></p>
          {description}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900 dark:border-t-slate-800" />
        </div>
      </div>

      {/* Modal — mobile */}
      <InfoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        label={label}
        value={value}
        unit={unit}
        description={description}
        danger={danger}
        delta={delta}
        color={color}
      />
    </>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastSync, setLastSync] = useState('');
  const [mounted, setMounted] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sensor');
      const result = await res.json();
      if (Array.isArray(result) && result.length > 0) {
        setData(result[0]);
        const formatted = result
          .slice(0, 20)
          .map((item: any) => ({
            ...item,
            time: new Date(item.created_at).toLocaleTimeString('id-ID', {
              hour: '2-digit', minute: '2-digit'
            }),
          }))
          .reverse();
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

  if (!mounted || !data) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#020617] flex flex-col items-center justify-center gap-4 transition-colors">
        <Wind size={40} className="text-blue-500 animate-spin" />
        <p className="text-slate-400 dark:text-slate-600 text-xs font-black uppercase tracking-[0.4em] animate-pulse">
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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      {/* HEADER */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-black tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Environmental Dashboard
          </h1>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest mt-0.5">
            Kitchen Sensor Node • Real-time Stream
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-500 ${
            isDanger ? 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isDanger ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
            {isDanger ? `⚠ ${dangerLabels.join(' • ')} DANGER` : '✓ Optimal & Safe'}
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">Refresh</span>
          </button>
        </div>
      </div>

      <div className="px-6 md:px-10 pt-6 space-y-5 max-w-7xl mx-auto">
        {/* STATS BAR */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-sm transition-colors overflow-visible">
          <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-slate-400 dark:text-slate-500" />
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.25em]">Live Metrics</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Hint mobile */}
              <span className="lg:hidden text-[9px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-wider flex items-center gap-1">
                <Info size={9} /> Ketuk untuk info
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">Last sync {lastSync}</span>
            </div>
          </div>
          <div className="flex overflow-x-auto lg:overflow-visible divide-x divide-slate-100 dark:divide-slate-800/50">
            <StatHeaderCard label="CO₂" value={data.co2?.toFixed(0) ?? '--'} unit="PPM" description={SENSOR_INFO.co2} delta={data.co2 > T.co2 ? "Elevated" : "Normal"} color={data.co2 > T.co2 ? '#f87171' : '#4ade80'} danger={data.co2 > T.co2} />
            <StatHeaderCard label="NH₃" value={data.nh3?.toFixed(2) ?? '--'} unit="PPM" description={SENSOR_INFO.nh3} delta={data.nh3 > T.nh3 ? "High" : "Safe"} color={data.nh3 > T.nh3 ? '#f87171' : '#4ade80'} danger={data.nh3 > T.nh3} />
            <StatHeaderCard label="Temp" value={data.temp?.toFixed(1) ?? '--'} unit="°C" description={SENSOR_INFO.temp} delta={data.temp > T.temp ? "Hot" : "Normal"} color={data.temp > T.temp ? '#f87171' : '#4ade80'} danger={data.temp > T.temp} />
            <StatHeaderCard label="Humidity" value={data.hum?.toFixed(0) ?? '--'} unit="%" description={SENSOR_INFO.hum} delta={data.hum > T.hum ? "Humid" : "Ideal"} color={data.hum > T.hum ? '#f87171' : '#4ade80'} danger={data.hum > T.hum} />
          </div>
        </div>

        {/* ALERT BANNER */}
        <div className={`rounded-2xl border px-6 py-4 flex items-center justify-between transition-all duration-700 ${
          isDanger ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/30' : 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/20'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isDanger ? 'bg-red-100 dark:bg-red-500/15' : 'bg-emerald-100 dark:bg-emerald-500/15'}`}>
              {isDanger ? <AlertTriangle size={22} className="text-red-600 dark:text-red-400" /> : <CheckCircle size={22} className="text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div>
              <p className={`font-black text-base uppercase tracking-wide ${isDanger ? 'text-red-700 dark:text-red-400' : 'text-emerald-700 dark:text-emerald-400'}`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {isDanger ? `DANGER: ${dangerLabels.join(', ')} EXCEEDED` : 'SYSTEM STATUS: OPTIMAL'}
              </p>
              <p className="text-slate-500 dark:text-slate-500 text-xs">
                {isDanger ? 'Segera aktifkan exhaust fan.' : 'Kondisi dapur aman digunakan.'}
              </p>
            </div>
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-[#080f1e] overflow-hidden shadow-lg">
            {/* Chart Header */}
            <div className="px-6 pt-5 pb-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Activity size={13} className="text-blue-400" />
                  <span className="text-xs font-black text-slate-400 dark:text-slate-300 uppercase tracking-[0.2em]">Air Quality Trend</span>
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">20 pembacaan terakhir</p>
              </div>
              {/* Legend Pills */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <div className="flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-wider">CO₂</span>
                </div>
                <div className="flex items-center gap-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg px-2.5 py-1">
                  <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />
                  <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">Temp</span>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="px-2 pb-5 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 4, right: 12, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradCO2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f97316" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#1e293b"
                    vertical={false}
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey="time"
                    stroke="#334155"
                    fontSize={10}
                    tickMargin={10}
                    axisLine={false}
                    tickLine={false}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                  <YAxis
                    stroke="#334155"
                    fontSize={10}
                    axisLine={false}
                    tickLine={false}
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    name="CO₂"
                    type="monotone"
                    dataKey="co2"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fill="url(#gradCO2)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
                  />
                  <Area
                    name="Temp"
                    type="monotone"
                    dataKey="temp"
                    stroke="#f97316"
                    strokeWidth={2.5}
                    fill="url(#gradTemp)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#f97316', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* SIDE GAUGES */}
          <div className="flex flex-col gap-5">
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-sm transition-colors duration-300">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Temperature</span>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl font-black tabular-nums dark:text-white" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{data.temp?.toFixed(1)}</span>
                <span className="text-slate-400 font-bold text-lg">°C</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(data.temp / 50) * 100}%` }} />
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30 shadow-sm transition-colors duration-300">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Humidity</span>
              <div className="flex items-baseline gap-2 my-2">
                <span className="text-4xl font-black tabular-nums dark:text-white" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{data.hum?.toFixed(0)}</span>
                <span className="text-slate-400 font-bold text-lg">%</span>
              </div>
              <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${data.hum}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}