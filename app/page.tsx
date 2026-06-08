"use client";
import React, { useEffect, useState, useCallback } from 'react';
import {
  Wind, AlertTriangle, CheckCircle, Activity,
  RefreshCw, TrendingUp, X, Info,
  Thermometer, Droplets, Flame, Zap, ShieldCheck,
  ChevronDown, Cpu
} from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { useThresholds } from '@/app/hooks/useThresholds';
import LandingPage from '@/components/landing-page';

const SENSOR_INFO = {
  co2: {
    general_id: "Karbon Dioksida (CO2) adalah gas hasil sisa pembakaran api kompor. Di dapur, gas ini dipantau sebagai indikator kelancaran ventilasi udara. Pembakaran kompor yang terus-menerus tanpa ventilasi akan menyebabkan penumpukan gas CO2 beracun yang dapat memicu sesak napas.",
    general_en: "Carbon Dioxide (CO2) is a byproduct of stove combustion. In kitchens, this gas is monitored to indicate air ventilation efficiency. Continuous stove usage without ventilation will cause a build-up of toxic CO2 gas, which can lead to shortness of breath.",
    safe_id: "Kondisi saat ini: Sirkulasi gas hasil pembakaran kompor di area dapur Anda berjalan sangat baik.",
    safe_en: "Current condition: Gas circulation from stove combustion in your kitchen area is running very well.",
    danger_id: "Kondisi saat ini: Bahaya! Terjadi penumpukan gas hasil pembakaran yang dapat memicu sesak napas (asfiksia). Segera nyalakan exhaust fan atau buka jendela lebar-lebar!",
    danger_en: "Current condition: Danger! Combustion gas build-up has occurred, which can trigger asphyxiation. Turn on the exhaust fan or open windows immediately!"
  },
  nh3: {
    general_id: "Amonia (NH3) adalah senyawa gas kimia tajam dan beracun. Di dapur, sensor NH3 berfungsi sebagai detektor pendukung untuk melacak adanya kebocoran senyawa gas kimia berbahaya selain LPG. Hal ini bertujuan untuk memastikan udara dapur tidak tercemar oleh akumulasi uap gas kimia beracun yang dapat membahayakan pernapasan.",
    general_en: "Ammonia (NH3) is a sharp, toxic chemical gas compound. In kitchens, the NH3 sensor acts as a backup detector to track toxic chemical leaks other than LPG. This ensures kitchen air is not contaminated by toxic chemical vapor accumulation which can harm respiration.",
    safe_id: "Kondisi saat ini: Aman. Tidak terdeteksi adanya kebocoran senyawa gas kimia beracun (NH3) di dapur.",
    safe_en: "Current condition: Safe. No toxic chemical gas (NH3) leaks detected in the kitchen.",
    danger_id: "Kondisi saat ini: Peringatan! Terdeteksi adanya kebocoran gas kimia beracun (NH3) di udara dapur. Segera evakuasi ruangan dan buka jendela!",
    danger_en: "Current condition: Warning! Toxic chemical gas (NH3) leak detected in the kitchen air. Evacuate the room and open windows immediately!"
  },
  temp: {
    general_id: "Suhu Udara (Temperature) dipantau sebagai indikator awal terjadinya kebakaran (titik api). Jika tabung gas LPG bocor lalu tersulut percikan api, sensor suhu akan mendeteksi lonjakan panas ekstrem secara seketika untuk membunyikan alarm evakuasi.",
    general_en: "Air Temperature is monitored as an early indicator of fire hotspots. If an LPG gas cylinder leaks and catches a spark, the temperature sensor will detect an extreme heat spike instantly to sound the evacuation alarm.",
    safe_id: "Kondisi saat ini: Suhu area dapur normal dan stabil, tidak menunjukkan adanya tanda-tanda rambatan panas ekstrem.",
    safe_en: "Current condition: Kitchen area temperature is normal and stable, showing no signs of extreme heat propagation.",
    danger_id: "Kondisi saat ini: Bahaya! Terjadi lonjakan suhu ekstrem yang sangat cepat. Segera matikan kompor, evakuasi tabung gas, dan siapkan alat pemadam kebakaran!",
    danger_en: "Current condition: Danger! Sudden extreme temperature spike occurred. Turn off the stove, evacuate the gas cylinder, and prepare a fire extinguisher immediately!"
  },
  hum: {
    general_id: "Kelembapan Ruang (Humidity) dipantau karena gas elpiji (LPG) memiliki massa jenis yang lebih berat dibanding udara biasa. Pada kelembapan tinggi, gas elpiji yang bocor akan mengendap di bawah lantai dan sulit terbawa angin keluar melalui jendela atas.",
    general_en: "Room Humidity is monitored because liquefied petroleum gas (LPG) is heavier than normal air. Under high humidity, leaking LPG gas will settle under the floor level and struggle to be carried out by wind through upper windows.",
    safe_id: "Kondisi saat ini: Kelembapan ideal. Udara cukup kering sehingga membantu meminimalkan risiko terjebaknya gas elpiji di lantai.",
    safe_en: "Current condition: Ideal humidity. The air is dry enough to help minimize the risk of LPG gas being trapped on the floor.",
    danger_id: "Kondisi saat ini: Peringatan! Kelembapan terlalu tinggi. Gas bocor berisiko terperangkap pekat di bawah lantai. Segera buka pintu bawah dapur dan sapu udara di lantai ke arah luar.",
    danger_en: "Current condition: Warning! Humidity is too high. Leaked gas is at risk of being trapped densely under the floor. Open the kitchen lower doors immediately and sweep the floor air outwards."
  },
  voc: {
    general_id: "VOC (Volatile Organic Compounds) dalam sistem ini berfungsi sebagai sensor UTAMA pendeteksi kebocoran gas LPG (Propana & Butana). Sensor ini sangat sensitif terhadap partikel gas elpiji mentah yang bocor dari tabung sebelum sempat tersulut api.",
    general_en: "VOC (Volatile Organic Compounds) in this system acts as the PRIMARY LPG leak detector (Propane & Butane). This sensor is highly sensitive to raw LPG gas particles leaking from the cylinder before catching fire.",
    safe_id: "Kondisi saat ini: Aman terenkripsi. Tidak terdeteksi adanya kebocoran partikel gas elpiji sama sekali di udara dapur.",
    safe_en: "Current condition: Securely safe. No LPG gas particle leaks detected in the kitchen air.",
    danger_id: "Kondisi saat ini: ALARM KEBOCORAN GAS AKTIF! Gas elpiji bocor pekat di udara. JANGAN menyentuh saklar lampu/listrik, JANGAN menyalakan korek api. Cabut regulator tabung gas segera!",
    danger_en: "Current condition: GAS LEAK ALARM ACTIVE! LPG gas leaking heavily in the air. DO NOT touch light/electrical switches, DO NOT light matches. Disconnect gas regulator immediately!"
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] text-xs">
      <p className="text-slate-800 dark:text-slate-400 font-semibold mb-2 uppercase tracking-widest text-[9px]">{label}</p>
      <div className="flex flex-col gap-1.5">
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
              <span className="text-slate-600 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wider">{p.name}</span>
            </div>
            <span className="font-black tabular-nums text-slate-900 dark:text-white text-[11px]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
              {p.value?.toFixed(p.dataKey === 'nh3' ? 2 : 1)}
              <span className="text-slate-500 dark:text-slate-600 font-normal ml-0.5 text-[9px]">
                {p.dataKey === 'co2' || p.dataKey === 'nh3' || p.dataKey === 'voc' ? ' PPM' : p.dataKey === 'temp' ? '°C' : '%'}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- INFO DRAWER MOBILE ---
function InfoDrawer({ open, onClose, label, value, unit, description, danger, delta, color, lang }: any) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 z-[200] bg-slate-950/45 backdrop-blur-md" onClick={onClose} />
      <div
        className="fixed bottom-0 left-0 right-0 z-[201] rounded-t-3xl border-t-[1.5px] border-slate-200/50 dark:border-slate-800/80 px-6 pt-4 pb-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-[0px_-4px_20px_rgba(0,0,0,0.05)]"
        style={{ animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}
      >
        <div className="w-10 h-1 bg-slate-300 dark:bg-white/15 rounded-full mx-auto mb-5" />
        <div className="flex items-center justify-between mb-5">
          <span className="text-[10px] font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2">
            <Info size={12} /> {lang === 'id' ? 'Detail Sensor' : 'Sensor Details'}
          </span>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-900">
            <X size={13} />
          </button>
        </div>
        <div className={`rounded-2xl px-5 py-5 mb-4 border ${danger ? 'bg-red-500/8 border-red-500/20' : 'bg-emerald-500/8 border-emerald-500/15'}`}>
          <p className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-[0.3em] mb-2">{label}</p>
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
        <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl px-5 py-4 border border-slate-200 dark:border-slate-800 mb-4">
          <p className="text-[10px] font-semibold text-slate-800 dark:text-slate-400 uppercase tracking-widest mb-2">{lang === 'id' ? 'Penjelasan' : 'Explanation'}</p>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">{description}</p>
        </div>
        <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-wider ${
          danger ? 'bg-red-500/8 border-red-500/20 text-red-600 dark:text-red-400' : 'bg-emerald-500/8 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
        }`}>
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${danger ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
          {danger 
            ? (lang === 'id' ? 'Melebihi Batas Aman — Perlu Perhatian' : 'Exceeds Safe Limit — Attention Required') 
            : (lang === 'id' ? 'Dalam Batas Aman' : 'Within Safe Limit')}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
    </>
  );
}

// --- SENSOR METRIC CARD — info langsung tampil di dalam card ---
function SensorCard({
  label, value, unit, danger, color, bgColor,
  description, delta, icon: Icon, threshold, infoKey, lang
}: {
  label: string; value: string; unit: string; danger: boolean;
  color: string; bgColor: string; description: string; delta: string;
  icon: any; threshold: number; infoKey: keyof typeof SENSOR_INFO; lang: string;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const numVal = parseFloat(value);
  const pct = Math.min((numVal / threshold) * 100, 100);

  return (
    <>
      <div
        onClick={() => setDrawerOpen(true)}
        className={`relative rounded-2xl border-2 overflow-hidden cursor-pointer group transition-all duration-300 hover:scale-[1.015] active:scale-[0.99] ${
          danger
            ? "border-red-500/80 dark:border-red-500/60 bg-red-50/20 dark:bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.15)] dark:shadow-[0_0_25px_rgba(239,68,68,0.25)] hover:shadow-[0_0_30px_rgba(239,68,68,0.25)] dark:hover:shadow-[0_0_35px_rgba(239,68,68,0.35)]"
            : "border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        }`}
      >
        {/* Glow Lampu */}
        <div 
          className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-[0.25] dark:opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.35]" 
          style={{ backgroundColor: danger ? '#ef4444' : color }} 
        />

        <div className="px-5 py-5 relative z-10">
          {/* Row 1 — icon + status badge */}
          <div className="flex items-center justify-between mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-900 shadow-sm">
              <Icon size={15} style={{ color }} />
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
              danger
                ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${danger ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              {danger ? (lang === 'id' ? 'Bahaya' : 'Danger') : (lang === 'id' ? 'Aman' : 'Safe')}
            </div>
          </div>

          {/* Row 2 — label */}
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-[0.28em] mb-1">{label}</p>

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
          <div className="h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mb-3">
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
            <p className={`text-[10px] font-mono transition-colors duration-300 ${
              danger ? 'text-red-600 dark:text-red-500 font-bold animate-pulse' : 'text-slate-600 dark:text-slate-400'
            }`}>
              {lang === 'id' ? 'Batas:' : 'Limit:'} <span className={danger ? 'text-red-600 dark:text-red-400 font-black' : 'text-slate-500 dark:text-slate-400'}>{threshold} {unit}</span>
            </p>
            <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 transition-colors duration-300 ${
              danger ? 'text-red-600 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'
            }`}>
              <Info size={9} /> Info
            </span>
          </div>

          {/* Description snippet — always visible */}
          <p className={`mt-2 text-[11px] leading-relaxed line-clamp-3 transition-colors duration-300 ${
            danger 
              ? 'text-red-600 dark:text-red-500 font-semibold' 
              : 'text-slate-600 dark:text-slate-400'
          }`}>
            {danger 
              ? (lang === 'id' ? SENSOR_INFO[infoKey].danger_id : SENSOR_INFO[infoKey].danger_en) 
              : (lang === 'id' ? SENSOR_INFO[infoKey].general_id : SENSOR_INFO[infoKey].general_en)}
          </p>
        </div>
      </div>

      <InfoDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        label={label} value={value} unit={unit}
        description={description} danger={danger}
        delta={delta} color={color} lang={lang}
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
  const [realTimeClock, setRealTimeClock] = useState('');
  const [lang, setLang] = useState<'id' | 'en'>('id');

  useEffect(() => {
    const updateLang = () => {
      const cached = typeof window !== 'undefined' && localStorage.getItem('skywatch_lang') as 'id' | 'en';
      if (cached && (cached === 'id' || cached === 'en')) {
        setLang(cached);
      }
    };
    updateLang();
    window.addEventListener('skywatch_lang_change', updateLang);
    return () => window.removeEventListener('skywatch_lang_change', updateLang);
  }, []);

  const t = (idText: string, enText: string) => lang === 'id' ? idText : enText;

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      setRealTimeClock(now.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', options) + (lang === 'id' ? ' WIB' : ' WIB'));
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, [lang]);


  // States Multi-Device
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Emergency state
  const [alarmAcknowledged, setAlarmAcknowledged] = useState(false);

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        localStorage.setItem('skywatch_logged_in', 'true');
      } else {
        setUser(null);
        localStorage.removeItem('skywatch_logged_in');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('skywatch_logged_in');
    } finally {
      setAuthChecked(true);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await fetch('/api/devices');
      const data = await res.json();
      const devList = data.devices || [];
      setDevices(devList);
      if (devList.length > 0) {
        setSelectedDeviceId(devList[0].device_id);
      }
    } catch {}
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const url = selectedDeviceId
        ? `/api/sensor?device_id=${encodeURIComponent(selectedDeviceId)}`
        : '/api/sensor';
      const res = await fetch(url);
      const result = await res.json();
      if (Array.isArray(result) && result.length > 0) {
        setData(result[0]);
        const formatted = result.slice(0, 20).map((item: any) => ({
          ...item,
          time: new Date(item.created_at).toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' }),
        })).reverse();
        setHistory(formatted);
        setLastSync(new Date().toLocaleTimeString(lang === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      } else {
        setData(null);
        setHistory([]);
      }
    } catch (e) {
      console.error('SkyWatch fetch error', e);
    } finally {
      setLoading(false);
    }
  }, [selectedDeviceId, lang]);

  useEffect(() => {
    setMounted(true);
    fetchUser();
    fetchDevices();
  }, []);

  useEffect(() => {
    if (mounted && user) {
      fetchData();
      const iv = setInterval(fetchData, 1000);
      return () => clearInterval(iv);
    }
  }, [mounted, fetchData, user]);

  // Audio Alarm Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (mounted && user && data && !alarmAcknowledged) {
      const isDangerNow = data.co2 > T.co2 || data.nh3 > T.nh3 || data.voc > T.voc || data.temp > T.temp;
      if (isDangerNow) {
        const playAlarm = () => {
          try {
            const savedSound = localStorage.getItem('alarmSound') || 'siren';
            
            // Try to play mp3 first (if user provided it)
            const audio = new Audio(`/${savedSound}.mp3`);
            audio.play().catch(() => {
              // Fallback to web audio synthesis if mp3 is missing
              const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
              if (!AudioContext) return;
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain);
              gain.connect(ctx.destination);
              
              if (savedSound === 'beep') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1000, ctx.currentTime);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
                osc.start();
                osc.stop(ctx.currentTime + 0.1);
              } else if (savedSound === 'bell') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, ctx.currentTime);
                gain.gain.setValueAtTime(0.3, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
                osc.start();
                osc.stop(ctx.currentTime + 1.5);
              } else {
                // siren
                osc.type = 'square';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
              }
            });
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
      const isDangerNow = data.co2 > T.co2 || data.nh3 > T.nh3 || data.voc > T.voc || data.temp > T.temp;
      if (!isDangerNow) {
        setAlarmAcknowledged(false);
      }
    }
  }, [data, T]);

  if (!mounted || !thresholdsLoaded || !authChecked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4 transition-colors duration-300">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center">
            <Wind size={22} className="text-[#4edea3] animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-[#4edea3]/15 blur-xl animate-pulse" />
        </div>
        <p className="text-[#1E293B] dark:text-slate-400 text-[10px] font-semibold uppercase tracking-[0.4em] animate-pulse">
          Initializing SkyWatch...
        </p>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const isEspConnected = data ? (Date.now() - new Date(data.created_at).getTime() < 60000) : false;
  const isDanger = data ? (data.co2 > T.co2 || data.nh3 > T.nh3 || data.voc > T.voc || data.temp > T.temp) : false;
  const dangerLabels: string[] = [];
  if (data) {
    if (data.co2 > T.co2) dangerLabels.push('CO2');
    if (data.nh3 > T.nh3) dangerLabels.push('NH3');
    if (data.voc > T.voc) dangerLabels.push('VOC');
    if (data.temp > T.temp) dangerLabels.push(lang === 'id' ? 'SUHU' : 'TEMP');
  }

  // Nama sensor yang sedang aktif dipantau
  const activeDevice = devices.find(d => d.device_id === selectedDeviceId);
  const activeSensorLabel = activeDevice?.device_name || selectedDeviceId || (lang === 'id' ? 'Sensor Monitoring' : 'Monitoring Sensor');

  const sensors = [
    {
      key: 'co2' as const,
      label: t('CO2 (Sisa Pembakaran)', 'CO2 (Combustion residue)'), value: data?.co2?.toFixed(0) ?? '--', unit: 'PPM',
      danger: data ? data.co2 > T.co2 : false, color: '#3b82f6', bgColor: '#3b82f610',
      delta: data ? (data.co2 > T.co2 ? t('Tinggi', 'High') : t('Normal', 'Normal')) : t('No Data', 'No Data'),
      icon: Zap, threshold: T.co2, infoKey: 'co2' as const,
      description: (lang === 'id' ? SENSOR_INFO.co2.general_id : SENSOR_INFO.co2.general_en) + '\n' + (data ? (data.co2 > T.co2 ? (lang === 'id' ? SENSOR_INFO.co2.danger_id : SENSOR_INFO.co2.danger_en) : (lang === 'id' ? SENSOR_INFO.co2.safe_id : SENSOR_INFO.co2.safe_en)) : ''),
    },
    {
      key: 'nh3' as const,
      label: t('NH3 (Amonia Kimia)', 'NH3 (Chemical Ammonia)'), value: data?.nh3?.toFixed(2) ?? '--', unit: 'PPM',
      danger: data ? data.nh3 > T.nh3 : false, color: '#a78bfa', bgColor: '#a78bfa10',
      delta: data ? (data.nh3 > T.nh3 ? t('Bahaya', 'Danger') : t('Aman', 'Safe')) : t('No Data', 'No Data'),
      icon: Wind, threshold: T.nh3, infoKey: 'nh3' as const,
      description: (lang === 'id' ? SENSOR_INFO.nh3.general_id : SENSOR_INFO.nh3.general_en) + '\n' + (data ? (data.nh3 > T.nh3 ? (lang === 'id' ? SENSOR_INFO.nh3.danger_id : SENSOR_INFO.nh3.danger_en) : (lang === 'id' ? SENSOR_INFO.nh3.safe_id : SENSOR_INFO.nh3.safe_en)) : ''),
    },
    {
      key: 'voc' as const,
      label: t('VOC (GAS LPG MUDAH TERBAKAR)', 'VOC (FLAMMABLE LPG GAS)'), value: data?.voc?.toFixed(2) ?? '--', unit: 'PPM',
      danger: data ? data.voc > T.voc : false, color: '#14b8a6', bgColor: '#14b8a610',
      delta: data ? (data.voc > T.voc ? t('Tinggi', 'High') : t('Aman', 'Safe')) : t('No Data', 'No Data'),
      icon: Activity, threshold: T.voc, infoKey: 'voc' as const,
      description: (lang === 'id' ? SENSOR_INFO.voc.general_id : SENSOR_INFO.voc.general_en) + '\n' + (data ? (data.voc > T.voc ? (lang === 'id' ? SENSOR_INFO.voc.danger_id : SENSOR_INFO.voc.danger_en) : (lang === 'id' ? SENSOR_INFO.voc.safe_id : SENSOR_INFO.voc.safe_en)) : ''),
    },
    {
      key: 'temp' as const,
      label: t('Suhu Udara (Titik Api)', 'Air Temperature (Hotspot)'), value: data?.temp?.toFixed(1) ?? '--', unit: '°C',
      danger: data ? data.temp > T.temp : false, color: '#f97316', bgColor: '#f9731610',
      delta: data ? (data.temp > T.temp ? t('Panas', 'Hot') : t('Normal', 'Normal')) : t('No Data', 'No Data'),
      icon: Flame, threshold: T.temp, infoKey: 'temp' as const,
      description: (lang === 'id' ? SENSOR_INFO.temp.general_id : SENSOR_INFO.temp.general_en) + '\n' + (data ? (data.temp > T.temp ? (lang === 'id' ? SENSOR_INFO.temp.danger_id : SENSOR_INFO.temp.danger_en) : (lang === 'id' ? SENSOR_INFO.temp.safe_id : SENSOR_INFO.temp.safe_en)) : ''),
    },
    {
      key: 'hum' as const,
      label: t('Kelembapan Ruangan', 'Room Humidity'), value: data?.hum?.toFixed(0) ?? '--', unit: '%',
      danger: data ? data.hum > T.hum : false, color: '#38bdf8', bgColor: '#38bdf810',
      delta: data ? (data.hum > T.hum ? t('Lembap', 'Humid') : t('Ideal', 'Ideal')) : t('No Data', 'No Data'),
      icon: Droplets, threshold: T.hum, infoKey: 'hum' as const,
      description: (lang === 'id' ? SENSOR_INFO.hum.general_id : SENSOR_INFO.hum.general_en) + '\n' + (data ? (data.hum > T.hum ? (lang === 'id' ? SENSOR_INFO.hum.danger_id : SENSOR_INFO.hum.danger_en) : (lang === 'id' ? SENSOR_INFO.hum.safe_id : SENSOR_INFO.hum.safe_en)) : ''),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      {/* PAGE HEADER */}
      <div className="px-6 md:px-8 pt-7 pb-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 w-full">
          <div>
            {user?.is_invited && (
              <div className="inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-lg bg-[#4edea3]/10 border border-[#4edea3]/20 text-[#059669] dark:text-[#4edea3] text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse" />
                {t('Pegawai Diundang oleh: ', 'Employee Invited by: ')}{user.invited_by_name || 'Pemilik Alat'}
              </div>
            )}
            <p className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-[0.25em] mb-1 flex flex-wrap items-center gap-2">
              {isEspConnected ? (
                <span className="flex items-center gap-1.5 bg-[#4edea3]/10 text-[#059669] dark:text-[#4edea3] px-2 py-0.5 rounded-md"><Cpu size={10} /> {t('Monitoring Aktif', 'Monitoring Active')}</span>
              ) : (
                <span className="flex items-center gap-1.5 bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-md"><Cpu size={10} /> {t('Monitoring Tidak Aktif', 'Monitoring Inactive')}</span>
              )}
              {realTimeClock && <span className="text-slate-500 font-mono select-none">• {realTimeClock}</span>}
            </p>
            <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {activeSensorLabel}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {selectedDeviceId !== 'all' && activeDevice && (
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-lg">
                  ID: {activeDevice.device_id}
                </span>
              )}
              {lastSync && (
                <span className="text-slate-500 text-[10px] font-mono">{t('Sinkronisasi', 'Sync')} {lastSync}</span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {devices.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl pl-9 pr-8 py-2 text-[11px] font-black uppercase tracking-wider focus:outline-none hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-[0px_4px_20px_rgba(0,0,0,0.05)] active:scale-95 cursor-pointer min-w-[170px] justify-between z-40 relative"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Cpu size={11} className="text-slate-450 dark:text-slate-500 shrink-0" />
                    <span className="truncate">{activeSensorLabel}</span>
                  </div>
                  <ChevronDown 
                    size={10} 
                    className={`text-slate-450 dark:text-slate-500 transition-transform duration-200 shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 mt-1.5 w-60 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl overflow-hidden py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                      {devices.map((dev: any) => {
                        const isSelected = dev.device_id === selectedDeviceId;
                        return (
                          <button
                            key={dev.id}
                            onClick={() => {
                              setSelectedDeviceId(dev.device_id);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-slate-50 dark:bg-slate-850 text-[#059669] dark:text-[#4edea3]'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <Cpu size={11} className={isSelected ? 'text-[#059669] dark:text-[#4edea3]' : 'text-slate-400'} />
                              <span className="truncate">{dev.device_name}</span>
                            </div>
                            {isSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#4edea3] shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[11px] font-black uppercase tracking-wider transition-all duration-500 ${
              isDanger
                ? 'bg-red-500/8 border-red-500/20 text-red-600 dark:text-red-400'
                : 'bg-emerald-500/8 border-emerald-500/15 text-emerald-600 dark:text-emerald-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isDanger ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="hidden sm:inline">{isDanger ? `⚠ ${dangerLabels.join(' · ')}` : t('Optimal', 'Optimal')}</span>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl border border-slate-200 border-t-[1.5px] dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-800 transition-all text-[11px] font-bold uppercase tracking-wider shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 xl:px-12 pb-8 space-y-5 w-full">

        {/* EMERGENCY MODAL */}
        {isDanger && !alarmAcknowledged && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-red-950/45 backdrop-blur-md px-4">
            <div className="bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-2 border-red-500/80 rounded-3xl p-6 md:p-10 max-w-lg w-full text-center shadow-[0_0_80px_rgba(239,68,68,0.25)] dark:shadow-[0_0_100px_rgba(239,68,68,0.35)] animate-in zoom-in duration-300">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <AlertTriangle size={48} className="text-red-600 dark:text-red-500 animate-ping absolute opacity-30" />
                <AlertTriangle size={48} className="text-red-600 dark:text-red-500 relative z-10" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-red-600 dark:text-red-500 uppercase tracking-widest mb-3">{t('KEBOCORAN DARURAT!', 'EMERGENCY LEAK!')}</h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6 font-bold text-sm md:text-base leading-relaxed">
                {t('Sensor mendeteksi level kritis pada: ', 'Sensor detected critical level on: ')}<span className="text-red-600 dark:text-red-500 font-black">{dangerLabels.join(', ')}</span>.<br/>{t('Segera amankan area ruangan.', 'Secure the room area immediately.')}
              </p>

              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-left">
                <p className="text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-2">{t('Tindakan Manual yang harus dilakukan:', 'Manual Actions Required:')}</p>
                <ul className="text-slate-700 dark:text-slate-300 text-sm list-disc pl-5 space-y-1.5 font-medium">
                  <li>{t('Segera matikan kompor & sumber api.', 'Turn off stove & ignition sources immediately.')}</li>
                  <li>{t('Cabut regulator gas jika aman dilakukan.', 'Disconnect gas regulator if safe to do.')}</li>
                  <li>{t('Buka jendela & pintu lebar-lebar.', 'Open all windows & doors widely.')}</li>
                  <li>{t('Jangan menyalakan/mematikan saklar listrik!', 'DO NOT switch electrical lights/plugs on or off!')}</li>
                </ul>
              </div>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => setAlarmAcknowledged(true)}
                  className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-3 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-red-500/30"
                >
                  <CheckCircle size={20} /> {t('Mengerti & Matikan Suara Alarm', 'Acknowledge & Mute Alarm Sound')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ALERT BANNER */}
        <div className={`relative rounded-2xl border border-t-[1.5px] px-5 py-4 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-700 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] ${
          isDanger ? 'bg-white dark:bg-red-950/10 border-red-200 dark:border-red-900/30' : 'bg-white dark:bg-emerald-950/10 border-slate-200 dark:border-emerald-900/20'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`absolute inset-y-0 left-0 w-[3px] rounded-r ${isDanger ? 'bg-red-500' : 'bg-emerald-500'}`} />
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${isDanger ? 'bg-red-500/12' : 'bg-emerald-500/12'}`}>
              {isDanger
                ? <AlertTriangle size={17} className="text-red-600 dark:text-red-400" />
                : <CheckCircle size={17} className="text-emerald-600 dark:text-emerald-400" />}
            </div>
            <div>
              <p className={`font-black text-sm uppercase tracking-wide ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                {isDanger ? t(`DANGER — ${dangerLabels.join(', ')} MELEBIHI BATAS`, `DANGER — ${dangerLabels.join(', ')} EXCEEDED LIMITS`) : t('SYSTEM STATUS — SEMUA SENSOR OPTIMAL', 'SYSTEM STATUS — ALL SENSORS OPTIMAL')}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                {isDanger ? t('Peringatan: Level gas telah melebihi batas aman. Lakukan tindakan darurat manual.', 'Warning: Gas level has exceeded safe limits. Perform manual emergency actions.') : t('Kondisi dapur aman. Pemantauan aktif secara real-time.', 'Kitchen conditions are safe. Monitoring active in real-time.')}
              </p>
            </div>
          </div>
          
          {/* Action indicators */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 ml-10 sm:ml-0">
            {isDanger && alarmAcknowledged && (
              <span className="text-[10px] font-black bg-red-500/10 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20">
                {t('Alarm Dimatikan', 'Alarm Muted')}
              </span>
            )}
          </div>
        </div>

        {/* SENSOR CARDS — grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {sensors.map(({ key, ...sensor }) => (
            <SensorCard key={key} {...sensor} lang={lang} />
          ))}
        </div>

        {/* CHART + SIDE STATS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Area Chart */}
          <div
            className="lg:col-span-2 flex flex-col rounded-2xl border border-slate-200 border-t-[1.5px] dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)]"
          >
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Activity size={12} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold text-[#1E293B] dark:text-slate-300 uppercase tracking-[0.2em]">{t('Tren Kualitas Udara', 'Air Quality Trend')}</span>
                </div>
                <p className="text-[10px] text-slate-700 font-mono">{t('20 pembacaan terakhir', 'Last 20 readings')}</p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  { k: 'CO₂', c: 'bg-blue-500' },
                  { k: 'NH₃', c: 'bg-yellow-500' },
                  { k: 'VOC', c: 'bg-teal-500' },
                  { k: 'TEMP', c: 'bg-orange-500' },
                  { k: 'HUM', c: 'bg-purple-500' }
                ].map(i => (
                  <div key={i.k} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 sm:py-1 rounded border border-slate-200 dark:border-slate-800">
                    <span className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${i.c}`} />
                    <span className="text-[9px] font-semibold uppercase text-[#1E293B] dark:text-slate-400">{i.k}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="px-2 pb-5 pt-2 flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorNh3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVoc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
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
                  <Area yAxisId="left" type="monotone" dataKey="voc" stroke="#14b8a6" strokeWidth={3} fill="url(#colorVoc)" />
                  <Area yAxisId="right" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fill="url(#colorTemp)" />
                  <Area yAxisId="right" type="monotone" dataKey="hum" stroke="#a855f7" strokeWidth={3} fill="url(#colorHum)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side — Device Info & Safety Summary */}
          <div className="flex flex-col gap-5 h-full">
            {/* Device Status Card */}
            <div className="rounded-2xl border border-slate-200 border-t-[1.5px] dark:border-slate-800 p-5 relative overflow-hidden bg-white dark:bg-slate-900 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)]">
              <div className="absolute inset-x-0 top-0 h-[2px] opacity-60 dark:opacity-100"
                style={{ background: 'linear-gradient(90deg, transparent, #4edea3, transparent)' }} />
              
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-[#4edea3]" />
                  <span className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-[0.25em]">{t('Status Node IoT', 'IoT Node Status')}</span>
                </div>
                {isEspConnected ? (
                  <span className="flex items-center gap-1.5 text-[9px] font-black text-emerald-600 dark:text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md uppercase tracking-wider border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {t('Aktif / Online', 'Active / Online')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[9px] font-black text-red-600 dark:text-red-500 bg-red-500/10 px-2 py-1 rounded-md uppercase tracking-wider border border-red-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {t('Tidak Aktif / Offline', 'Inactive / Offline')}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{t('ID Perangkat', 'Device ID')}</span>
                  <span className="text-xs font-mono text-slate-900 dark:text-white font-bold truncate max-w-[150px]">
                    {selectedDeviceId || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{t('Nama Perangkat', 'Device Name')}</span>
                  <span className="text-xs text-slate-900 dark:text-white font-bold truncate max-w-[150px]">
                    {activeDevice?.device_name || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{t('Jaringan', 'Network')}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono text-slate-900 dark:text-white font-bold">WiFi</span>
                    <div className="flex gap-0.5 items-end h-3">
                      <div className="w-1 h-1.5 bg-slate-800 dark:bg-slate-400 rounded-sm"/>
                      <div className="w-1 h-2 bg-slate-800 dark:bg-slate-400 rounded-sm"/>
                      <div className="w-1 h-full bg-slate-800 dark:bg-slate-400 rounded-sm"/>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{t('Sinkronisasi Terakhir', 'Last Sync')}</span>
                  <span className="text-xs font-mono text-slate-900 dark:text-white font-bold">{lastSync || '--:--:--'}</span>
                </div>
              </div>
            </div>

            {/* Safety Advice Card */}
            <div className={`rounded-2xl border border-t-[1.5px] p-5 relative overflow-hidden transition-colors flex-1 flex flex-col justify-center shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] ${
              isDanger 
                ? 'bg-white dark:bg-red-500/5 border-red-200 dark:border-red-500/20' 
                : 'bg-white dark:bg-emerald-500/5 border-slate-200 dark:border-emerald-500/15'
            }`}>
              <div className="flex items-center gap-2 mb-4">
                {isDanger ? <AlertTriangle size={14} className="text-red-600 dark:text-red-500" /> : <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-500" />}
                <span className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDanger ? 'text-red-600 dark:text-red-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                  {t('Rekomendasi Sistem', 'System Recommendation')}
                </span>
              </div>
              
              <h3 className={`text-lg font-black mb-2 leading-tight ${isDanger ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isDanger ? t('Tindakan Evakuasi Diperlukan!', 'Evacuation Action Required!') : t('Udara Dapur Terjaga Baik', 'Kitchen Air is Well Maintained')}
              </h3>
              
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                {isDanger 
                  ? t('Kadar gas telah melewati batas aman yang ditentukan. Segera cabut regulator gas, buka jendela lebar-lebar, dan jangan sentuh saklar listrik.', 'Gas levels have crossed the designated safety limits. Disconnect gas regulator immediately, open windows widely, and do not touch electrical switches.') 
                  : t('Sirkulasi udara dan kadar gas saat ini terpantau berada dalam rentang normal. Tidak ada tindakan khusus yang diperlukan.', 'Air circulation and gas levels are currently monitored to be within the normal range. No special action is required.')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}