"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Wind, Flame, Droplets, Zap, ShieldCheck, Lock, 
  Activity, ArrowRight, Check, AlertTriangle, RotateCcw, 
  Cpu, Layers, Bell, ExternalLink, ChevronRight, HelpCircle,
  Play, Volume2, VolumeX, ShieldAlert, MessageCircle
} from 'lucide-react';

function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          setVisible(true);
        }, delay);
        observer.unobserve(ref);
      }
    }, { threshold: 0.05, rootMargin: "0px 0px -45px 0px" });
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, delay]);

  return (
    <div
      ref={setRef as any}
      className={`${className} transition-all duration-1000 ease-out transform ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.98]"
      }`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  // Mobile Menu drawer state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simulator States
  const [voc, setVoc] = useState(0.2); // VOC/LPG
  const [co2, setCo2] = useState(450); // CO2
  const [temp, setTemp] = useState(28); // Temp
  const [hum, setHum] = useState(48); // Humidity
  const [nh3, setNh3] = useState(0.12); // NH3

  // Audio state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [simulatedAlarmAck, setSimulatedAlarmAck] = useState(false);

  // Threshold constants
  const thresholds = {
    voc: 1.5,
    co2: 1000,
    temp: 45,
    hum: 70,
    nh3: 0.25
  };

  // Determine danger status
  const isVocDanger = voc > thresholds.voc;
  const isCo2Danger = co2 > thresholds.co2;
  const isTempDanger = temp > thresholds.temp;
  const isHumDanger = hum > thresholds.hum;
  const isNh3Danger = nh3 > thresholds.nh3;
  const isAnyDanger = isVocDanger || isCo2Danger || isTempDanger || isHumDanger || isNh3Danger;

  // Track danger labels
  const dangerLabels: string[] = [];
  if (isVocDanger) dangerLabels.push('VOC (LPG)');
  if (isCo2Danger) dangerLabels.push('CO2');
  if (isTempDanger) dangerLabels.push('TEMPERATUR');
  if (isHumDanger) dangerLabels.push('KELEMBAPAN');
  if (isNh3Danger) dangerLabels.push('NH3');

  // Trigger Sound Effect when simulator enters danger
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAnyDanger && soundEnabled && !simulatedAlarmAck) {
      const playBeep = () => {
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (!AudioContext) return;
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          if (isVocDanger) {
            // Urgent high pitch alarm
            osc.type = 'square';
            osc.frequency.setValueAtTime(1200, ctx.currentTime);
            osc.frequency.setValueAtTime(900, ctx.currentTime + 0.15);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
          } else {
            // Warning beep
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.start();
            osc.stop(ctx.currentTime + 0.15);
          }
        } catch (e) {}
      };
      playBeep();
      interval = setInterval(playBeep, isVocDanger ? 400 : 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAnyDanger, soundEnabled, simulatedAlarmAck, isVocDanger]);

  // Reset simulated acknowledgement if system becomes safe again
  useEffect(() => {
    if (!isAnyDanger) {
      setSimulatedAlarmAck(false);
    }
  }, [isAnyDanger]);

  // Scroll handler to make landing page navbar beautiful and dynamic on scroll
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const mainEl = document.querySelector('main');
      const scrollTop = mainEl ? mainEl.scrollTop : window.scrollY;
      if (scrollTop > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Use capture phase to handle scroll events from nested scrollable containers
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const resetSimulator = () => {
    setVoc(0.2);
    setCo2(450);
    setTemp(28);
    setHum(48);
    setNh3(0.12);
    setSimulatedAlarmAck(false);
  };

  const setPresetDanger = () => {
    setVoc(2.8);
    setCo2(1200);
    setTemp(55);
    setHum(55);
    setNh3(0.15);
    setSimulatedAlarmAck(false);
  };

  return (
    <div className="bg-[#070d1a] text-slate-100 min-h-screen relative font-sans selection:bg-[#4edea3]/30 selection:text-white">
      {/* Background Neon Elements Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#4edea3]/5 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-purple-500/5 blur-[180px]" />
      </div>

      {/* HEADER / NAVIGATION */}
      <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${
        isScrolled 
          ? 'border-b border-white/10 bg-[#070d1a]/95 backdrop-blur-xl shadow-lg shadow-black/40 h-16' 
          : 'border-b border-white/5 bg-[#070d1a]/80 backdrop-blur-xl h-20'
      }`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#4edea3] flex items-center justify-center shadow-lg shadow-[#4edea3]/20">
                <Wind className="text-[#0a0f1a]" size={18} strokeWidth={2.8} />
              </div>
              <div className="absolute inset-0 bg-[#4edea3]/30 blur-lg rounded-xl -z-10 animate-pulse" />
            </div>
            <div>
              <h1 className="text-white font-black text-sm tracking-tight leading-none uppercase">SkyWatch</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-0.5">Air Analytics</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <a href="#features" className="hover:text-[#4edea3] transition-colors">Fitur Utama</a>
            <a href="#simulator" className="hover:text-[#4edea3] transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Demo Live
            </a>
            <a href="#pricing" className="hover:text-[#4edea3] transition-colors">Pilihan Paket</a>
            <a href="#about" className="hover:text-[#4edea3] transition-colors">Cara Kerja</a>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white transition-all active:scale-95"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              className="px-4 py-2 rounded-xl bg-[#4edea3] hover:bg-[#5cebb2] text-[#0a0f1a] text-[10px] font-black uppercase tracking-wider transition-all shadow-lg shadow-[#4edea3]/20 hover:shadow-[#4edea3]/30 active:scale-95 flex items-center gap-1"
            >
              Daftar <ArrowRight size={12} strokeWidth={2.5} />
            </Link>
          </div>

          {/* Mobile Right Actions (Matches Image 1) */}
          <div className="flex md:hidden items-center gap-2">
            <Link 
              href="/login" 
              className="px-3.5 py-1.5 rounded-lg border border-white/20 bg-[#070d1a] text-[10px] font-black uppercase tracking-widest text-white transition-all active:scale-95 flex items-center justify-center h-8"
              style={{ letterSpacing: '0.05em' }}
            >
              MASUK
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="w-8 h-8 rounded-lg border border-white/20 bg-white/[0.01] hover:bg-white/[0.05] flex items-center justify-center text-slate-300 hover:text-white transition-all"
              aria-label="Buka Menu"
            >
              <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU DRAWER OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[200] md:hidden bg-[#070d1a]/98 backdrop-blur-2xl flex flex-col justify-between p-6 animate-in fade-in duration-300">
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4edea3] flex items-center justify-center">
                  <Wind className="text-[#0a0f1a]" size={16} strokeWidth={2.8} />
                </div>
                <div>
                  <h1 className="text-white font-black text-xs uppercase leading-none">SkyWatch</h1>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Air Analytics</p>
                </div>
              </div>
              
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white"
                aria-label="Tutup Menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-5 pt-8 text-xs font-bold uppercase tracking-wider text-slate-400">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)} 
                className="hover:text-[#4edea3] transition-colors py-2.5 border-b border-white/[0.02]"
              >
                Fitur Utama
              </a>
              <a 
                href="#simulator" 
                onClick={() => setMobileMenuOpen(false)} 
                className="hover:text-[#4edea3] transition-colors py-2.5 border-b border-white/[0.02] flex items-center justify-between"
              >
                <span>Demo Live</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </a>
              <a 
                href="#pricing" 
                onClick={() => setMobileMenuOpen(false)} 
                className="hover:text-[#4edea3] transition-colors py-2.5 border-b border-white/[0.02]"
              >
                Pilihan Paket
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)} 
                className="hover:text-[#4edea3] transition-colors py-2.5 border-b border-white/[0.02]"
              >
                Cara Kerja
              </a>
            </nav>
          </div>

          {/* Action buttons at bottom */}
          <div className="space-y-3 pb-8">
            <Link 
              href="/login" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] text-center text-xs font-black uppercase tracking-widest text-white transition-all block"
            >
              Masuk
            </Link>
            <Link 
              href="/register" 
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-xl bg-[#4edea3] hover:bg-[#5cebb2] text-[#0a0f1a] text-center text-xs font-black uppercase tracking-widest transition-all block shadow-lg shadow-[#4edea3]/20"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Hero Left */}
          <ScrollReveal className="lg:col-span-7 space-y-6 text-left" delay={0}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
              <Cpu size={12} /> IoT-Powered Smart System
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.08]" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Dapur Aman,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4edea3] to-[#89ceff]">Kerja Nyaman.</span>
            </h2>
            
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
              Sistem deteksi dini kebocoran gas LPG dan polutan dapur berbasis Internet of Things (IoT). Pantau kadar udara, terima peringatan suara seketika, dan lindungi dapur Anda dari risiko kebocoran tabung sebelum terlambat.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Link 
                href="/register" 
                className="px-8 py-4.5 rounded-2xl bg-[#4edea3] hover:bg-[#5cebb2] text-[#0a0f1a] font-black text-sm uppercase tracking-wider text-center transition-all shadow-lg shadow-[#4edea3]/20 hover:shadow-[#4edea3]/40 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5"
              >
                Mulai Monitoring Sekarang
                <ArrowRight size={16} strokeWidth={2.8} />
              </Link>
              <a 
                href="#simulator" 
                className="px-8 py-4.5 rounded-2xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white font-black text-sm uppercase tracking-wider text-center transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Play size={14} fill="currentColor" />
                Coba Demo Live
              </a>
            </div>

            {/* Quick Metrics stats */}
            <div className="grid grid-cols-3 gap-6 pt-10 border-t border-white/5">
              <div>
                <p className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>&lt; 3 Detik</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Respon Alarm Real-time</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-white" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>5 Sensor</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Dipantau Sekaligus</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-black text-[#4edea3]" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Premium</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">WhatsApp & Sound Alert</p>
              </div>
            </div>
          </ScrollReveal>

          {/* Hero Right: Floating Device Presentation */}
          <ScrollReveal className="lg:col-span-5 relative flex justify-center items-center" delay={150}>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 to-[#4edea3]/10 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Animated Device Mockup */}
            <div className="relative rounded-[2.5rem] border border-white/10 p-6 bg-slate-900/60 backdrop-blur-3xl shadow-2xl w-full max-w-sm hover:scale-[1.01] transition-transform duration-500 group">
              <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
              {/* Embbeded generate_image mockup */}
              <div className="relative rounded-[2rem] overflow-hidden border border-white/5 aspect-[4/3] bg-black/40 mb-6">
                <img 
                  src="/landing_hero.png" 
                  alt="SkyWatch IoT Smart Device" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent" />
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#4edea3]/10 border border-[#4edea3]/20 rounded-lg text-[#4edea3]">
                    <ShieldCheck size={16} />
                  </div>
                  <p className="text-xs font-black uppercase tracking-wider text-white">SkyWatch IoT Node-01</p>
                </div>
                
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Modul sensor nirkabel ESP32 presisi tinggi. Mengirimkan data kadar udara real-time ke dashboard cloud Anda setiap detik dengan enkripsi aman.
                </p>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Model: SW-ESP32-V2</span>
                  <span className="text-[#4edea3] font-bold">Online</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION INTERACTIVE SIMULATOR (SANDBOX) */}
      <section id="simulator" className="py-20 bg-slate-950/30 border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal delay={0}>
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#4edea3]/10 border border-[#4edea3]/20 text-[#4edea3] text-[10px] font-black uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-ping" />
                Eksplorasi Interaktif
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
                IoT Dashboard Live Sandbox
              </h3>
              <p className="text-slate-400 text-sm">
                Cobalah simulator dashboard di bawah! Geser slider kontrol di panel bawah untuk mensimulasikan kejadian gas bocor atau kenaikan suhu ekstrem, dan saksikan bagaimana sistem SkyWatch merespon seketika.
              </p>
            </div>
          </ScrollReveal>

          {/* DANGER EMERGENCY MODAL PREVIEW */}
          {isVocDanger && !simulatedAlarmAck && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center bg-red-950/45 backdrop-blur-md px-4">
              <div className="bg-[#070d1a]/90 backdrop-blur-xl border-2 border-red-500/80 rounded-3xl p-6 md:p-10 max-w-lg w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.35)] animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                  <AlertTriangle size={40} className="text-red-500 animate-ping absolute opacity-30" />
                  <AlertTriangle size={40} className="text-red-500 relative z-10" />
                </div>
                <h2 className="text-xl md:text-2xl font-black text-red-500 uppercase tracking-widest mb-3">KEBOCORAN DARURAT (SIMULASI)</h2>
                <p className="text-slate-300 mb-6 font-bold text-xs md:text-sm leading-relaxed">
                  Sensor mensimulasikan level kritis pada: <span className="text-red-500 font-black">VOC (LPG)</span>.<br/>Tindakan pengamanan manual harus segera dipraktikkan!
                </p>

                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 text-left">
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-wider mb-2">Tindakan Penyelamatan Dapur:</p>
                  <ul className="text-slate-300 text-xs list-disc pl-5 space-y-1.5 font-medium">
                    <li>Segera cabut regulator tabung gas dari kompor.</li>
                    <li>Buka pintu bawah dapur, ventilasi udara, dan jendela lebar-lebar.</li>
                    <li>JANGAN menyentuh saklar lampu / memantik korek api!</li>
                    <li>Evakuasi penghuni rumah keluar dari ruangan.</li>
                  </ul>
                </div>
                
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setSimulatedAlarmAck(true)}
                    className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/35 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Check size={16} /> Matikan Suara Alarm Simulasi
                  </button>
                  <button 
                    onClick={resetSimulator}
                    className="w-full py-3 text-slate-400 hover:text-white font-semibold text-xs transition-colors"
                  >
                    Atur Ulang Simulator ke Aman
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR DASHBOARD CONTAINER */}
          <ScrollReveal delay={100} className="rounded-[2rem] border border-white/10 overflow-hidden bg-[#0a1020]/90 shadow-2xl relative">
            
            {/* Simulator Header */}
            <div className="px-6 py-4.5 bg-slate-900/80 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-500/30 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  SkyWatch Live Monitor (Interactive Demo Sandbox)
                </span>
              </div>

              <div className="flex items-center gap-3.5">
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-[10px] font-black uppercase tracking-wider transition-all ${
                    soundEnabled 
                      ? 'bg-[#4edea3]/10 border-[#4edea3]/25 text-[#4edea3]' 
                      : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-white'
                  }`}
                  title={soundEnabled ? "Nonaktifkan Alarm" : "Aktifkan Alarm"}
                >
                  {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                  <span>Alarm Suara: {soundEnabled ? 'Aktif' : 'Mute'}</span>
                </button>

                <button
                  onClick={resetSimulator}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] text-xs font-bold text-slate-400 hover:text-white transition-colors"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>
            </div>

            {/* Dashboard Alert Banner Preview */}
            <div className="px-6 pt-6">
              <div className={`relative rounded-2xl border border-t-[1.5px] px-5 py-4 overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-500 ${
                isAnyDanger 
                  ? 'bg-red-500/5 border-red-500/20' 
                  : 'bg-emerald-500/5 border-emerald-500/15'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`absolute inset-y-0 left-0 w-[3px] rounded-r ${isAnyDanger ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <div className={`p-2 rounded-xl flex-shrink-0 ${isAnyDanger ? 'bg-red-500/12' : 'bg-emerald-500/12'}`}>
                    {isAnyDanger 
                      ? <AlertTriangle size={16} className="text-red-400" />
                      : <Check size={16} className="text-emerald-400" />}
                  </div>
                  <div className="text-left">
                    <p className={`font-black text-xs uppercase tracking-wider ${isAnyDanger ? 'text-red-400' : 'text-emerald-400'}`}
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                      {isAnyDanger ? `DARURAT — ${dangerLabels.join(' · ')} MELEBIHI BATAS` : 'SISTEM STATUS — SEMUA SENSOR OPTIMAL'}
                    </p>
                    <p className="text-slate-400 text-[10.5px] mt-0.5 font-medium">
                      {isAnyDanger 
                        ? 'Simulasi Bahaya Aktif: Tingkat konsentrasi gas/suhu membahayakan pernapasan & titik api.' 
                        : 'Simulasi Normal: Seluruh indikator berada dalam batas normal. Dapur aman.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAnyDanger && simulatedAlarmAck && (
                    <span className="text-[9px] font-black bg-red-500/10 text-red-400 px-2.5 py-1.5 rounded-lg border border-red-500/20 uppercase tracking-widest">
                      Alarm Sirene Bisukan
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Dashboard Cards Grid */}
            <div className="px-6 py-6 grid grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Card CO2 */}
              <div className={`relative rounded-2xl border-2 p-4.5 text-left transition-all duration-300 overflow-hidden ${
                isCo2Danger 
                  ? 'border-red-500/80 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                  : 'border-white/10 hover:border-white/20 bg-white/[0.03]'
              }`}>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/5">
                    <Zap size={14} className="text-blue-400" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${
                    isCo2Danger ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  }`}>
                    {isCo2Danger ? 'Danger' : 'Safe'}
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">CO2 (Gas Pembakaran)</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black text-white font-mono" style={{ color: isCo2Danger ? '#f87171' : undefined }}>{co2.toFixed(0)}</span>
                  <span className="text-slate-400 text-xs font-bold">PPM</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min((co2 / thresholds.co2) * 100, 100)}%` }} />
                </div>
                <p className="text-[9.5px] text-slate-400 font-bold leading-normal font-mono">Batas: {thresholds.co2} PPM</p>
              </div>

              {/* Card NH3 */}
              <div className={`relative rounded-2xl border-2 p-4.5 text-left transition-all duration-300 overflow-hidden ${
                isNh3Danger 
                  ? 'border-red-500/80 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                  : 'border-white/10 hover:border-white/20 bg-white/[0.03]'
              }`}>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/5">
                    <Wind size={14} className="text-purple-400" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${
                    isNh3Danger ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  }`}>
                    {isNh3Danger ? 'Danger' : 'Safe'}
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">NH3 (Kadar Amonia)</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black text-white font-mono" style={{ color: isNh3Danger ? '#f87171' : undefined }}>{nh3.toFixed(2)}</span>
                  <span className="text-slate-400 text-xs font-bold">PPM</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${Math.min((nh3 / thresholds.nh3) * 100, 100)}%` }} />
                </div>
                <p className="text-[9.5px] text-slate-400 font-bold leading-normal font-mono">Batas: {thresholds.nh3} PPM</p>
              </div>

              {/* Card VOC (LPG) */}
              <div className={`relative rounded-2xl border-2 p-4.5 text-left transition-all duration-300 overflow-hidden ${
                isVocDanger 
                  ? 'border-red-500/80 bg-red-950/10 shadow-[0_0_30px_rgba(239,68,68,0.3)] border-red-500 animate-pulse' 
                  : 'border-white/10 hover:border-white/20 bg-white/[0.03]'
              }`}>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/5">
                    <Activity size={14} className="text-[#4edea3]" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${
                    isVocDanger ? 'bg-red-500 border-red-500/25 text-red-400 font-black animate-ping' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  }`}>
                    {isVocDanger ? 'LEAK' : 'Safe'}
                  </span>
                </div>
                <p className="text-[9px] font-black text-[#4edea3] uppercase tracking-wider mb-1">VOC (Kebocoran Gas)</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black text-white font-mono" style={{ color: isVocDanger ? '#f87171' : undefined }}>{voc.toFixed(2)}</span>
                  <span className="text-slate-400 text-xs font-bold">PPM</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-[#4edea3] transition-all duration-300" style={{ width: `${Math.min((voc / thresholds.voc) * 100, 100)}%` }} />
                </div>
                <p className="text-[9.5px] text-slate-400 font-bold leading-normal font-mono">Batas: {thresholds.voc} PPM</p>
              </div>

              {/* Card Temp */}
              <div className={`relative rounded-2xl border-2 p-4.5 text-left transition-all duration-300 overflow-hidden ${
                isTempDanger 
                  ? 'border-red-500/80 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                  : 'border-white/10 hover:border-white/20 bg-white/[0.03]'
              }`}>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/5">
                    <Flame size={14} className="text-orange-400" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${
                    isTempDanger ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  }`}>
                    {isTempDanger ? 'Danger' : 'Safe'}
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Temperatur (Api)</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black text-white font-mono" style={{ color: isTempDanger ? '#f87171' : undefined }}>{temp.toFixed(1)}</span>
                  <span className="text-slate-400 text-xs font-bold">°C</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${Math.min((temp / thresholds.temp) * 100, 100)}%` }} />
                </div>
                <p className="text-[9.5px] text-slate-400 font-bold leading-normal font-mono">Batas: {thresholds.temp}°C</p>
              </div>

              {/* Card Humidity */}
              <div className={`relative rounded-2xl border-2 p-4.5 text-left transition-all duration-300 overflow-hidden ${
                isHumDanger 
                  ? 'border-red-500/80 bg-red-950/10 shadow-[0_0_20px_rgba(239,68,68,0.15)]' 
                  : 'border-white/10 hover:border-white/20 bg-white/[0.03]'
              }`}>
                <div className="flex items-center justify-between mb-3.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 border border-white/5">
                    <Droplets size={14} className="text-sky-400" />
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[8.5px] font-black uppercase tracking-wider border ${
                    isHumDanger ? 'bg-red-500/10 border-red-500/25 text-red-400' : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                  }`}>
                    {isHumDanger ? 'Danger' : 'Safe'}
                  </span>
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Kelembapan Ruang</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-black text-white font-mono" style={{ color: isHumDanger ? '#f87171' : undefined }}>{hum.toFixed(0)}</span>
                  <span className="text-slate-400 text-xs font-bold">%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-sky-400 transition-all duration-300" style={{ width: `${Math.min((hum / thresholds.hum) * 100, 100)}%` }} />
                </div>
                <p className="text-[9.5px] text-slate-400 font-bold leading-normal font-mono">Batas: {thresholds.hum}%</p>
              </div>

            </div>

            {/* INTERACTIVE CONTROLS BOX (SLIDERS) */}
            <div className="p-6 bg-slate-900 border-t border-white/5">
              <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
                <div className="text-left">
                  <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Cpu size={14} className="text-[#4edea3]" />
                    Simulator Controller Panel
                  </h4>
                  <p className="text-[10px] text-slate-400">Geser indikator di bawah untuk mensimulasikan perubahan data IoT sensor dapur Anda secara live.</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={setPresetDanger}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wider transition-colors shadow-md shadow-red-500/20"
                  >
                    🚨 Pemicu Kebocoran Gas
                  </button>
                  <button 
                    onClick={resetSimulator}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold text-[10px] uppercase tracking-wider transition-colors"
                  >
                    Reset Normal
                  </button>
                </div>
              </div>

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* VOC Slider */}
                <div className="space-y-1.5 bg-slate-950/40 p-4.5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">LPG / VOC Gas</span>
                    <span className={`text-[10px] font-bold font-mono ${isVocDanger ? 'text-red-400' : 'text-slate-300'}`}>{voc.toFixed(2)} PPM</span>
                  </div>
                  <input 
                    type="range" 
                    min="0.05" 
                    max="5.0" 
                    step="0.05"
                    value={voc} 
                    onChange={e => {
                      setVoc(parseFloat(e.target.value));
                      if (parseFloat(e.target.value) <= thresholds.voc) setSimulatedAlarmAck(false);
                    }}
                    className="w-full accent-[#4edea3]"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                    <span>Aman (0.2)</span>
                    <span className="text-red-400">Kebocoran (&gt;1.5)</span>
                  </div>
                </div>

                {/* CO2 Slider */}
                <div className="space-y-1.5 bg-slate-950/40 p-4.5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CO2 (Asap Kompor)</span>
                    <span className={`text-[10px] font-bold font-mono ${isCo2Danger ? 'text-red-400' : 'text-slate-300'}`}>{co2.toFixed(0)} PPM</span>
                  </div>
                  <input 
                    type="range" 
                    min="300" 
                    max="2000" 
                    step="10"
                    value={co2} 
                    onChange={e => setCo2(parseInt(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                    <span>Ventilasi Baik (400)</span>
                    <span className="text-red-400">Sesak Napas (&gt;1000)</span>
                  </div>
                </div>

                {/* Temp Slider */}
                <div className="space-y-1.5 bg-slate-950/40 p-4.5 rounded-2xl border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suhu (Titik Api)</span>
                    <span className={`text-[10px] font-bold font-mono ${isTempDanger ? 'text-red-400' : 'text-slate-300'}`}>{temp.toFixed(1)} °C</span>
                  </div>
                  <input 
                    type="range" 
                    min="15" 
                    max="80" 
                    step="0.5"
                    value={temp} 
                    onChange={e => setTemp(parseFloat(e.target.value))}
                    className="w-full accent-orange-500"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                    <span>Suhu Kamar (28)</span>
                    <span className="text-red-400">Kebakaran (&gt;45)</span>
                  </div>
                </div>
              </div>
            </div>

          </ScrollReveal>

          <ScrollReveal delay={200} className="text-center mt-8">
            <Link 
              href="/register" 
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#4edea3]/10 hover:bg-[#4edea3]/20 border border-[#4edea3]/30 text-[#4edea3] text-xs font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Hubungkan Alat Sensor Fisik Anda Sendiri
              <ChevronRight size={14} strokeWidth={2.5} />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="py-20 max-w-7xl mx-auto px-6">
        <ScrollReveal delay={0}>
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
              Fitur Teknologi
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Deteksi Dini Untuk Keamanan Penuh
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dilengkapi dengan fitur canggih terintegrasi yang menjamin Anda langsung sigap bertindak saat terjadi kebocoran gas LPG di area dapur.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <ScrollReveal delay={0} className="rounded-3xl border border-white/5 p-8 bg-[#0a1020]/40 backdrop-blur-md text-left hover:border-[#4edea3]/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center text-[#4edea3] mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <ShieldAlert size={16} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <h4 className="text-lg font-black text-white mb-3">Deteksi LPG Super Sensitif</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Menggunakan sensor VOC canggih yang mendeteksi partikel gas elpiji mentah (propana dan butana) yang mengendap sebelum gas tersebut sempat tersulut oleh titik api.
            </p>
          </ScrollReveal>

          {/* Feature 2 */}
          <ScrollReveal delay={100} className="rounded-3xl border border-white/5 p-8 bg-[#0a1020]/40 backdrop-blur-md text-left hover:border-[#4edea3]/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center text-[#4edea3] mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Volume2 size={16} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <h4 className="text-lg font-black text-white mb-3">Sirene & Alarm Suara Browser</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Begitu sensor membaca adanya gas melampaui batas aman, browser Anda akan langsung membunyikan suara sirene kencang yang berfungsi membangunkan/mengevakuasi orang.
            </p>
          </ScrollReveal>

          {/* Feature 3 */}
          <ScrollReveal delay={200} className="rounded-3xl border border-white/5 p-8 bg-[#0a1020]/40 backdrop-blur-md text-left hover:border-[#4edea3]/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center text-[#4edea3] mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Layers size={16} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <h4 className="text-lg font-black text-white mb-3">Multi-Device & Multi-User</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Hubungkan beberapa sensor di berbagai ruangan (misal: area dapur, tabung gas luar, dsb) dan bagikan akses monitoring kepada staf, karyawan, atau anggota keluarga Anda.
            </p>
          </ScrollReveal>

          {/* Feature 4 */}
          <ScrollReveal delay={0} className="rounded-3xl border border-white/5 p-8 bg-[#0a1020]/40 backdrop-blur-md text-left hover:border-[#4edea3]/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center text-[#4edea3] mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Activity size={16} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <h4 className="text-lg font-black text-white mb-3">Analisis Grafik Tren 24 Jam</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Pantau kestabilan temperatur, sirkulasi gas CO2 sisa pembakaran, dan tingkat kelembapan ruangan Anda melalui grafik tren interaktif untuk memastikan kelancaran ventilasi dapur.
            </p>
          </ScrollReveal>

          {/* Feature 5 */}
          <ScrollReveal delay={100} className="rounded-3xl border border-white/5 p-8 bg-[#0a1020]/40 backdrop-blur-md text-left hover:border-[#4edea3]/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center text-[#4edea3] mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Bell size={16} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <h4 className="text-lg font-black text-white mb-3">Notifikasi Darurat WhatsApp</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Menerima notifikasi darurat langsung di WhatsApp saat level gas dapur kritis, menjaga keamanan Anda meskipun Anda sedang bepergian jauh dari rumah atau restoran.
            </p>
          </ScrollReveal>

          {/* Feature 6 */}
          <ScrollReveal delay={200} className="rounded-3xl border border-white/5 p-8 bg-[#0a1020]/40 backdrop-blur-md text-left hover:border-[#4edea3]/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-[#4edea3]/10 border border-[#4edea3]/20 flex items-center justify-center text-[#4edea3] mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
              <Check size={16} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <h4 className="text-lg font-black text-white mb-3">Dukungan Pengaduan Instan</h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Alami kendala pada alat sensor atau sistem? Ajukan laporan keluhan atau hubungi admin teknis secara instan melalui sistem bantuan WhatsApp terintegrasi.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* SECTION PRICING */}
      <section id="pricing" className="py-20 bg-slate-950/20 border-t border-white/5 relative">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal delay={0}>
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-wider">
              Pilihan Langganan
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white tracking-tight" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Skema Paket Yang Fleksibel
            </h3>
            <p className="text-slate-400 text-sm">
              Mulai gratis untuk pengenalan dasar, atau upgrade ke Premium untuk mengaktifkan dashboard nirkabel real-time dan notifikasi alarm darurat.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          
          {/* Paket 1 Bulan — Bundle Alat + Web */}
          <ScrollReveal delay={0} className="rounded-3xl border border-white/5 bg-[#0a1020]/20 p-8 flex flex-col justify-between hover:border-slate-700 transition-all text-left">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bundle Alat + Web</p>
              <h4 className="text-xl font-black text-white">Langganan 1 Bulan</h4>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">Rp 349.000</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Alat + Web 1 Bln</span>
              </div>
              
              <ul className="space-y-2.5 text-xs text-slate-400 pt-4 border-t border-white/5">
                <li className="flex items-center gap-2">✓ Alat Sensor ESP32 Fisik</li>
                <li className="flex items-center gap-2">✓ Dashboard Web Monitoring</li>
                <li className="flex items-center gap-2">✓ Multi-device &amp; Invite Pegawai</li>
                <li className="flex items-center gap-2">✓ Notifikasi &amp; Laporan Real-time</li>
              </ul>
            </div>

            <Link 
              href="/register" 
              className="mt-8 w-full py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white text-center font-black text-[11px] uppercase tracking-wider transition-all block active:scale-95"
            >
              Pilih Paket
            </Link>
          </ScrollReveal>

          {/* Paket 1 Tahun — Bundle Best Value (Featured) */}
          <ScrollReveal delay={100} className="rounded-3xl border-2 border-[#4edea3] bg-[#4edea3]/5 p-8 flex flex-col justify-between hover:border-[#5cebb2] transition-all text-left relative shadow-xl shadow-[#4edea3]/5">
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-[#4edea3] text-[#0a0f1a] text-[9px] font-black uppercase tracking-widest">
              Hemat
            </div>
            
            <div className="space-y-4">
              <p className="text-[10px] font-black text-[#4edea3] uppercase tracking-widest">Bundle Alat + Web</p>
              <h4 className="text-xl font-black text-white">Langganan 1 Tahun</h4>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 line-through font-bold">Rp 749.000</span>
                <span className="text-3xl font-black text-[#4edea3]">Rp 599.000</span>
                <span className="text-[9px] text-[#4edea3]/80 font-black uppercase tracking-wider mt-1">Alat + Web 12 Bln (Best Offer)</span>
              </div>
              
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-white/10">
                <li className="flex items-center gap-2 font-bold text-[#4edea3]">✓ Semua Fitur Paket Bulanan</li>
                <li className="flex items-center gap-2">✓ Akses 12 Bulan Penuh</li>
                <li className="flex items-center gap-2">✓ Harga Lebih Hemat</li>
                <li className="flex items-center gap-2">✓ Prioritas Dukungan CS</li>
              </ul>
            </div>

            <Link 
              href="/register" 
              className="mt-8 w-full py-4 rounded-xl bg-[#4edea3] hover:bg-[#5cebb2] text-[#0a0f1a] text-center font-black text-xs uppercase tracking-widest transition-all block shadow-lg shadow-[#4edea3]/20 hover:scale-[1.02] active:scale-[0.98]"
            >
              Pilih Paket
            </Link>
          </ScrollReveal>

          {/* Hanya Beli Alat — Tanpa Akses Dashboard */}
          <ScrollReveal delay={200} className="rounded-3xl border border-white/5 bg-[#0a1020]/20 p-8 flex flex-col justify-between hover:border-slate-700 transition-all text-left">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alat Saja</p>
              <h4 className="text-xl font-black text-white">Hanya Beli Alat</h4>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white">Rp 249.000</span>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Modul Sensor ESP32 Saja</span>
              </div>
              
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 my-2">
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">⚠ Tanpa Akses Dashboard Web Monitoring</p>
              </div>
              
              <ul className="space-y-2.5 text-xs text-slate-400 pt-4 border-t border-white/5">
                <li className="flex items-center gap-2">✓ Alat Sensor ESP32 Fisik</li>
                <li className="flex items-center gap-2 line-through opacity-50">✗ Akses Dashboard Web</li>
                <li className="flex items-center gap-2 line-through opacity-50">✗ Grafik &amp; Laporan Online</li>
                <li className="flex items-center gap-2">✓ Bisa Upgrade Kapan Saja</li>
              </ul>
            </div>

            <Link 
              href="/register" 
              className="mt-8 w-full py-3.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white text-center font-black text-[11px] uppercase tracking-wider transition-all block active:scale-95"
            >
              Beli Alat Saja
            </Link>
          </ScrollReveal>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 dark:border-white/5 bg-slate-100/90 dark:bg-[#0b0f10]/95 backdrop-blur-md transition-colors mt-auto">
        <div className="max-w-7xl mx-auto py-8 md:py-12 px-6 md:px-10 xl:px-12 text-slate-600 dark:text-slate-400 text-xs transition-colors">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12 text-left">
            {/* Column 1: Brand & Socials */}
            <div className="md:col-span-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4edea3] flex items-center justify-center">
                  <Wind className="text-[#0a0f1a]" size={16} strokeWidth={2.8} />
                </div>
                <div>
                  <h5 className="text-slate-900 dark:text-white font-black uppercase text-sm tracking-wider leading-none">SkyWatch</h5>
                  <p className="text-[9px] text-[#059669] dark:text-[#4edea3] font-bold uppercase tracking-[0.2em] mt-0.5">Air Analytics</p>
                </div>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px] max-w-sm">
                Sistem IoT terintegrasi untuk pemantauan kualitas sirkulasi udara dan proteksi darurat kebocoran gas dapur secara real-time.
              </p>
              {/* WhatsApp Contact Button */}
              <div className="pt-2">
                <a 
                  href="https://wa.me/6285792524863?text=Halo%20Admin%20SkyWatch" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  onClick={() => fetch('/api/notifications/whatsapp', { method: 'POST' }).catch(() => {})}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20c45c] text-white text-xs font-bold transition-all shadow-md active:scale-95 hover:scale-[1.02] shrink-0"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>WhatsApp CS</span>
                </a>
              </div>
            </div>

            {/* Column 2: Navigasi */}
            <div className="md:col-span-3 space-y-4">
              <h6 className="text-slate-900 dark:text-white font-bold uppercase tracking-wider text-[11px]">Navigasi</h6>
              <ul className="space-y-2.5 font-semibold text-slate-500 dark:text-slate-400">
                <li><a href="#features" className="hover:text-emerald-600 dark:hover:text-[#4edea3] transition-colors">Fitur Utama</a></li>
                <li><a href="#simulator" className="hover:text-emerald-600 dark:hover:text-[#4edea3] transition-colors">Demo Live</a></li>
                <li><a href="#pricing" className="hover:text-emerald-600 dark:hover:text-[#4edea3] transition-colors">Pilihan Paket</a></li>
                <li><Link href="/login" className="hover:text-emerald-600 dark:hover:text-[#4edea3] transition-colors">Masuk Portal</Link></li>
              </ul>
            </div>

            {/* Column 3: Fitur Sistem */}
            <div className="md:col-span-4 space-y-4">
              <h6 className="text-slate-900 dark:text-white font-bold uppercase tracking-wider text-[11px]">Fitur Sistem</h6>
              <ul className="space-y-2.5 font-semibold text-slate-500 dark:text-slate-400">
                <li><span className="cursor-default hover:text-slate-800 dark:hover:text-white transition-colors">Dashboard IoT Real-time</span></li>
                <li><span className="cursor-default hover:text-slate-800 dark:hover:text-white transition-colors">Mikrokontroler ESP32</span></li>
                <li><span className="cursor-default hover:text-slate-800 dark:hover:text-white transition-colors">Sirene Alarm Browser</span></li>
                <li><span className="cursor-default hover:text-slate-800 dark:hover:text-white transition-colors">Notifikasi WhatsApp Otomatis</span></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-white/10 my-6"></div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 font-semibold text-[11px] text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} SkyWatch. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">Privacy Policy</a>
              <span>•</span>
              <a href="#" className="hover:text-slate-800 dark:hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
