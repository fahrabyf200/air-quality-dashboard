"use client";
import React, { useEffect, useState, useCallback } from 'react';
import {
  Wind, AlertTriangle, CheckCircle, Activity,
  Thermometer, Droplets, ArrowUpRight, RefreshCw,
  Cpu, Zap, TrendingUp
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

// ─── THRESHOLDS (Dapur) ──────────────────────────────────────────────────────
const T = { co2: 800, nh3: 2, temp: 35, hum: 80 };

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1425] border border-slate-700/60 rounded-2xl px-4 py-3 shadow-2xl text-xs">
      <p className="text-slate-400 font-bold mb-2 uppercase tracking-wider">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} className="font-bold" style={{ color: p.color }}>
          {p.name}: <span className="text-white">{p.value?.toFixed(1)}</span>
        </p>
      ))}
    </div>
  );
};

// ─── STAT HEADER CARD ────────────────────────────────────────────────────────
function StatHeaderCard({
  label, value, unit, delta, color, danger
}: {
  label: string; value: string; unit: string;
  delta?: string; color: string; danger: boolean;
}) {
  return (
    <div
      className="flex-1 min-w-0 px-6 py-5 border-r border-slate-800/50 last:border-r-0 group cursor-default transition-all duration-300 hover:bg-slate-800/20"
    >
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-2 leading-none">
        {label}
      </p>
      <div className="flex items-baseline gap-1.5 mb-1">
        <span
          className="text-3xl font-black tracking-tighter tabular-nums"
          style={{
            color: danger ? '#f87171' : 'white',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {value}
        </span>
        <span className="text-xs text-slate-500 font-bold">{unit}</span>
      </div>
      {delta && (
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp size={10} style={{ color }} />
          <span className="text-[10px] font-bold" style={{ color }}>{delta}</span>
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
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
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <Wind size={40} className="text-blue-500 animate-spin" />
          <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full" />
        </div>
        <p
          className="text-slate-500 text-xs font-black uppercase tracking-[0.4em] animate-pulse"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          Initializing SkyWatch...
        </p>
      </div>
    );
  }

  const isDanger =
    data.co2 > T.co2 || data.nh3 > T.nh3 || data.temp > T.temp;

  const dangerLabels: string[] = [];
  if (data.co2 > T.co2) dangerLabels.push('CO₂');
  if (data.nh3 > T.nh3) dangerLabels.push('NH₃');
  if (data.temp > T.temp) dangerLabels.push('TEMP');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 pb-20">
      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800/60 px-6 md:px-10 py-4 flex items-center justify-between gap-4">
        <div>
          <h1
            className="text-lg font-black text-white tracking-tight uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Environmental Dashboard
          </h1>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
            Kitchen Sensor Node • Real-time Stream
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Pill */}
          <div
            className={`hidden sm:flex items-center gap-2.5 px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-widest transition-all duration-500 ${
              isDanger
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${isDanger ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`}
            />
            {isDanger ? `⚠ ${dangerLabels.join(' • ')} DANGER` : '✓ Optimal & Safe'}
          </div>

          {/* Refresh */}
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700/60 bg-slate-800/40 text-slate-400 hover:text-white hover:border-slate-600 text-xs font-bold uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      <div className="px-6 md:px-10 pt-6 space-y-5 max-w-7xl mx-auto">

        {/* ── TOP STATS BAR (Salesforce-style) ──────────────────────────────── */}
        <div
          className="rounded-2xl border border-slate-800/60 bg-slate-900/30 backdrop-blur-sm overflow-hidden"
          style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.4)' }}
        >
          {/* Sub-header */}
          <div className="px-6 py-3 border-b border-slate-800/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-slate-500" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                Live Sensor Metrics
              </span>
            </div>
            {lastSync && (
              <span
                className="text-[10px] text-slate-600 font-mono"
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                Last sync {lastSync}
              </span>
            )}
          </div>

          {/* Metric columns — horizontal scroll on mobile */}
          <div className="flex overflow-x-auto divide-x divide-slate-800/50">
            <StatHeaderCard
              label="CO₂ Concentration"
              value={data.co2?.toFixed(0) ?? '--'}
              unit="PPM"
              delta={data.co2 > T.co2 ? `+${(data.co2 - T.co2).toFixed(0)} above threshold` : 'Within threshold'}
              color={data.co2 > T.co2 ? '#f87171' : '#4ade80'}
              danger={data.co2 > T.co2}
            />
            <StatHeaderCard
              label="Ammonia NH₃"
              value={data.nh3?.toFixed(2) ?? '--'}
              unit="PPM"
              delta={data.nh3 > T.nh3 ? 'Elevated — ventilate now' : 'Normal range'}
              color={data.nh3 > T.nh3 ? '#f87171' : '#4ade80'}
              danger={data.nh3 > T.nh3}
            />
            <StatHeaderCard
              label="Temperature"
              value={data.temp?.toFixed(1) ?? '--'}
              unit="°C"
              delta={data.temp > T.temp ? 'Above comfort zone' : 'Comfortable'}
              color={data.temp > T.temp ? '#f87171' : '#4ade80'}
              danger={data.temp > T.temp}
            />
            <StatHeaderCard
              label="Humidity"
              value={data.hum?.toFixed(0) ?? '--'}
              unit="%"
              delta={data.hum > T.hum ? 'High — check ventilation' : 'Optimal range'}
              color={data.hum > T.hum ? '#f87171' : '#4ade80'}
              danger={data.hum > T.hum}
            />
            {data.voc !== undefined && (
              <StatHeaderCard
                label="VOC"
                value={data.voc?.toFixed(2) ?? '--'}
                unit="PPM"
                delta="Volatile organics"
                color="#60a5fa"
                danger={false}
              />
            )}
          </div>
        </div>

        {/* ── STATUS ALERT BANNER ──────────────────────────────────────────── */}
        <div
          className={`rounded-2xl border px-6 py-4 flex items-center justify-between gap-4 transition-all duration-700 ${
            isDanger
              ? 'bg-red-500/8 border-red-500/30'
              : 'bg-emerald-500/8 border-emerald-500/20'
          }`}
        >
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl flex-shrink-0 ${isDanger ? 'bg-red-500/15' : 'bg-emerald-500/15'}`}
            >
              {isDanger
                ? <AlertTriangle size={22} className="text-red-400" />
                : <CheckCircle size={22} className="text-emerald-400" />
              }
            </div>
            <div>
              <p
                className={`font-black text-base uppercase tracking-wide ${isDanger ? 'text-red-400' : 'text-emerald-400'}`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {isDanger
                  ? `DANGER DETECTED: ${dangerLabels.join(', ')} EXCEEDED`
                  : 'ENVIRONMENTAL HEALTH: OPTIMAL & SAFE'}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {isDanger
                  ? 'Segera buka ventilasi dapur dan aktifkan exhaust fan.'
                  : 'Semua parameter sensor berada dalam batas aman. Dapur aman digunakan.'}
              </p>
            </div>
          </div>
          <div
            className={`hidden lg:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border flex-shrink-0 ${
              isDanger
                ? 'text-red-500 border-red-500/30 bg-red-500/10 animate-pulse'
                : 'text-emerald-500 border-emerald-500/20 bg-emerald-500/8'
            }`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            <Zap size={11} />
            {isDanger ? 'ACTION REQUIRED' : 'ALL SYSTEMS GO'}
          </div>
        </div>

        {/* ── CHART + SIDE CARDS ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart */}
          <div
            className="lg:col-span-2 rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden"
            style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.3)' }}
          >
            <div className="px-6 py-4 border-b border-slate-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Activity size={14} className="text-blue-400" />
                <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
                  Air Quality Trend
                </span>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-blue-500 rounded inline-block" />
                  CO₂
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-orange-400 rounded inline-block" />
                  Temp
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-emerald-400 rounded inline-block" />
                  NH₃
                </span>
              </div>
            </div>
            <div className="p-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gradCO2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.6} />
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
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      name="CO₂"
                      type="monotone"
                      dataKey="co2"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      fill="url(#gradCO2)"
                      dot={false}
                    />
                    <Area
                      name="Temp"
                      type="monotone"
                      dataKey="temp"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      fill="url(#gradTemp)"
                      dot={false}
                    />
                    <Line
                      name="NH₃"
                      type="monotone"
                      dataKey="nh3"
                      stroke="#4ade80"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="4 4"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Side cards */}
          <div className="flex flex-col gap-5">
            {/* Temperature card */}
            <div
              className="flex-1 rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
              <div className="px-5 py-3.5 border-b border-slate-800/50 flex items-center gap-2">
                <Thermometer size={13} className="text-orange-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                  Ambient Temperature
                </span>
              </div>
              <div className="px-5 py-5">
                <div className="flex items-baseline gap-2 mb-4">
                  <span
                    className="font-black text-5xl tabular-nums"
                    style={{
                      color: data.temp > T.temp ? '#f87171' : '#fb923c',
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {data.temp?.toFixed(1)}
                  </span>
                  <span className="text-slate-500 font-bold text-lg">°C</span>
                </div>
                {/* Gauge bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                    <span>0°C</span>
                    <span>Threshold {T.temp}°C</span>
                  </div>
                  <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min((data.temp / (T.temp * 1.4)) * 100, 100)}%`,
                        background: data.temp > T.temp
                          ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                          : 'linear-gradient(90deg, #3b82f6, #fb923c)',
                        boxShadow: data.temp > T.temp ? '0 0 10px #ef444460' : '0 0 10px #fb923c60',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Humidity card */}
            <div
              className="flex-1 rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
            >
              <div className="px-5 py-3.5 border-b border-slate-800/50 flex items-center gap-2">
                <Droplets size={13} className="text-blue-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                  Relative Humidity
                </span>
              </div>
              <div className="px-5 py-5">
                <div className="flex items-baseline gap-2 mb-4">
                  <span
                    className="font-black text-5xl tabular-nums"
                    style={{
                      color: data.hum > T.hum ? '#f87171' : '#60a5fa',
                      fontFamily: "'IBM Plex Mono', monospace",
                    }}
                  >
                    {data.hum?.toFixed(0)}
                  </span>
                  <span className="text-slate-500 font-bold text-lg">%</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] text-slate-600 font-bold uppercase tracking-widest">
                    <span>0%</span>
                    <span>Threshold {T.hum}%</span>
                  </div>
                  <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min((data.hum / 100) * 100, 100)}%`,
                        background: data.hum > T.hum
                          ? 'linear-gradient(90deg, #a855f7, #ef4444)'
                          : 'linear-gradient(90deg, #06b6d4, #3b82f6)',
                        boxShadow: data.hum > T.hum ? '0 0 10px #ef444460' : '0 0 10px #3b82f660',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BOTTOM: Dominant Pollutant + Recommendation ───────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Dominant pollutant */}
          <div
            className="rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
          >
            <div className="px-6 py-3.5 border-b border-slate-800/50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                Dominant Pollutant
              </span>
              <ArrowUpRight size={14} className="text-slate-700" />
            </div>
            <div className="px-6 py-6 flex items-center justify-between">
              <div>
                <p
                  className="text-4xl font-black uppercase tracking-tight"
                  style={{
                    color: data.dominant_pollutant === 'None' ? '#4ade80' : '#f87171',
                    fontFamily: "'IBM Plex Mono', monospace",
                  }}
                >
                  {data.dominant_pollutant === 'None' ? 'Clean Air' : data.dominant_pollutant}
                </p>
                <p className="text-slate-600 text-xs font-bold mt-1 uppercase tracking-widest">
                  {data.dominant_pollutant === 'None'
                    ? 'No pollutants detected'
                    : 'Primary contaminant detected'}
                </p>
              </div>
              <div
                className={`p-4 rounded-2xl ${
                  data.dominant_pollutant === 'None'
                    ? 'bg-emerald-500/10 border border-emerald-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                {data.dominant_pollutant === 'None'
                  ? <CheckCircle size={32} className="text-emerald-400" />
                  : <AlertTriangle size={32} className="text-red-400" />
                }
              </div>
            </div>
          </div>

          {/* SkyWatch Recommendation */}
          <div
            className="rounded-2xl border border-slate-800/60 bg-slate-900/30 overflow-hidden"
            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}
          >
            <div className="px-6 py-3.5 border-b border-slate-800/50 flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">
                SkyWatch Recommendation
              </span>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-[9px] text-blue-500 font-black uppercase tracking-widest">AI</span>
              </div>
            </div>
            <div className="px-6 py-6">
              <p className="text-slate-300 text-sm leading-relaxed mb-5">
                {isDanger
                  ? `⚠️ Kadar ${dangerLabels.join(', ')} melebihi ambang batas. Segera tingkatkan ventilasi atau aktifkan exhaust fan. Jauhkan dari area ini hingga kondisi aman.`
                  : '✨ Kondisi saat ini optimal. Pastikan sirkulasi udara segar tetap terjaga untuk mempertahankan kualitas udara yang sehat di dapur.'}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                <div>
                  <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">Cloud Sync</p>
                  <p
                    className="text-[10px] text-blue-400 font-bold mt-0.5"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    LIVE • {data.created_at ? new Date(data.created_at).toLocaleTimeString('id-ID') : '--:--'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <Activity size={11} className="text-blue-400" />
                  <span className="text-[9px] text-blue-400 font-black uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SYSTEM ARCHITECTURE INFO BAR ─────────────────────────────────── */}
        <div
          className="rounded-2xl border border-slate-800/40 bg-slate-900/20 px-6 py-4 flex flex-wrap items-center gap-3 overflow-hidden"
        >
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest">
            <Cpu size={12} className="text-slate-600" />
            Architecture:
          </div>
          {['MQ Sensors', '→', 'ESP32', '→', 'REST API', '→', 'MySQL (Aiven)', '→', 'SkyWatch UI'].map((node, i) => (
            <span
              key={i}
              className={`text-[10px] font-bold uppercase tracking-wider ${
                node === '→'
                  ? 'text-slate-700'
                  : 'text-slate-500 bg-slate-800/50 px-3 py-1 rounded-lg border border-slate-700/40'
              }`}
            >
              {node}
            </span>
          ))}
          <span className="ml-auto text-[9px] text-slate-700 font-black uppercase tracking-widest hidden md:block">
            Group 4 • Polinema IT
          </span>
        </div>

      </div>
    </div>
  );
}