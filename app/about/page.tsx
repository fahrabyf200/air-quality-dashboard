"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wind, ShieldCheck, ArrowLeft, Cpu, ArrowRight,
  Zap, Lock, Target, Users, Mail, Phone, ChevronRight
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
      className={`${className} transition-all duration-1000 ease-out transform ${visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-[0.98]"
        }`}
    >
      {children}
    </div>
  );
}

export default function AboutPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="bg-slate-50 dark:bg-[#070d1a] text-slate-900 dark:text-slate-100 min-h-screen relative font-sans selection:bg-[#4edea3]/30 selection:text-white transition-colors duration-300 flex flex-col overflow-x-hidden">
      {/* Background Neon Elements Container */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 fixed">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[150px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#4edea3]/5 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-purple-500/5 blur-[180px]" />
      </div>

      {/* HEADER / NAVIGATION */}
      <header className={`fixed top-0 inset-x-0 z-[100] transition-all duration-300 ${isScrolled
          ? 'border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#070d1a]/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-black/40 h-16'
          : 'border-b border-transparent dark:border-white/5 bg-white/80 dark:bg-[#070d1a]/80 backdrop-blur-xl h-20'
        }`}>
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="relative group flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#4edea3] flex items-center justify-center shadow-lg shadow-[#4edea3]/20 group-hover:scale-105 transition-transform">
                <Wind className="text-[#0a0f1a]" size={18} strokeWidth={2.8} />
              </div>
              <div>
                <h1 className="text-slate-900 dark:text-white font-black text-sm tracking-tight leading-none uppercase">SkyWatch</h1>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.25em] mt-0.5">Air Analytics</p>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Link href="/#features" className="hover:text-[#4edea3] transition-colors">Fitur Utama</Link>
            <Link href="/#simulator" className="hover:text-[#4edea3] transition-colors flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Demo Live
            </Link>
            <Link href="/#pricing" className="hover:text-[#4edea3] transition-colors">Pilihan Paket</Link>
            <Link href="/about" className="text-[#4edea3] transition-colors">Tentang Kami</Link>
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all active:scale-95"
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

          {/* Mobile Right Actions */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/login"
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/20 bg-white dark:bg-[#070d1a] text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white transition-all active:scale-95 flex items-center justify-center h-8"
              style={{ letterSpacing: '0.05em' }}
            >
              MASUK
            </Link>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-white/20 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.05] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all"
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
        <div className="fixed inset-0 z-[200] md:hidden bg-white/98 dark:bg-[#070d1a]/98 backdrop-blur-2xl flex flex-col justify-between p-6 animate-in fade-in duration-300">
          <div>
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-5 border-b border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#4edea3] flex items-center justify-center">
                  <Wind className="text-[#0a0f1a]" size={16} strokeWidth={2.8} />
                </div>
                <div>
                  <h1 className="text-slate-900 dark:text-white font-black text-xs uppercase leading-none">SkyWatch</h1>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Air Analytics</p>
                </div>
              </div>

              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                aria-label="Tutup Menu"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col gap-5 pt-8 text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              <Link
                href="/#features"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#4edea3] transition-colors py-2.5 border-b border-slate-100 dark:border-white/[0.02]"
              >
                Fitur Utama
              </Link>
              <Link
                href="/#simulator"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#4edea3] transition-colors py-2.5 border-b border-slate-100 dark:border-white/[0.02] flex items-center justify-between"
              >
                <span>Demo Live</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              </Link>
              <Link
                href="/#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#4edea3] transition-colors py-2.5 border-b border-slate-100 dark:border-white/[0.02]"
              >
                Pilihan Paket
              </Link>
              <Link
                href="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="text-[#4edea3] transition-colors py-2.5 border-b border-slate-100 dark:border-white/[0.02]"
              >
                Tentang Kami
              </Link>
            </nav>
          </div>

          {/* Action buttons at bottom */}
          <div className="space-y-3 pb-8">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-xl border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.02] text-center text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white transition-all block"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full py-3.5 rounded-xl bg-[#4edea3] hover:bg-[#5cebb2] text-center text-xs font-black uppercase tracking-widest text-[#0a0f1a] transition-all block"
            >
              Daftar Akun Baru
            </Link>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 pb-20">
        {/* HERO SECTION */}
        <section className="pt-32 pb-20 max-w-7xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal delay={0}>
              <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 dark:border-white/10 aspect-square md:aspect-[4/3] bg-slate-100 dark:bg-[#0a1020] shadow-2xl group z-10">
                <img
                  src="/skywatch_poster.png"
                  alt="SkyWatch Poster"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-[#4edea3]/20 pointer-events-none opacity-40 mix-blend-overlay" />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={100} className="space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-wider">
                <Target size={12} /> Tujuan Kami
              </div>
              <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Melindungi Dapur,<br />Menyelamatkan Nyawa
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                SkyWatch berawal dari kepedulian kami terhadap tingginya angka kecelakaan akibat kebocoran gas LPG di rumah tangga dan restoran komersial. Kami percaya bahwa teknologi Internet of Things (IoT) tidak hanya untuk kemudahan, tapi juga untuk perlindungan jiwa secara aktif.
              </p>
              <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed">
                Melalui kolaborasi rekayasa perangkat keras dan analisis cloud, kami menciptakan ekosistem keamanan paling responsif. Sensor presisi kami (ESP32) mendeteksi anomali berbahaya secara real-time untuk memperingatkan Anda sebelum bencana terjadi.
              </p>
            </ScrollReveal>
          </div>
        </section>

        {/* CORE VALUES */}
        <section className="py-24 border-y border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/[0.01] backdrop-blur-md relative">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal>
              <div className="text-center max-w-2xl mx-auto mb-16">
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Nilai-Nilai Utama
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Tiga pilar dasar yang menjadi pondasi dalam perancangan produk dan layanan SkyWatch.
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheck, title: "Keamanan Terjamin", color: "text-[#4edea3]", bg: "bg-[#4edea3]/10 border-[#4edea3]/20",
                  desc: "Prioritas utama kami adalah meminimalisir risiko kebakaran dan keracunan gas secara preventif dengan akurasi 99.9%."
                },
                {
                  icon: Zap, title: "Respons Detik Pertama", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20",
                  desc: "Peringatan darurat dikirim seketika dalam hitungan milidetik. Kami tak membiarkan Anda terlambat bereaksi."
                },
                {
                  icon: Users, title: "Mudah & Transparan", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/20",
                  desc: "Dashboard interaktif kami dirancang agar dapat digunakan oleh siapapun, dari teknisi industri hingga ibu rumah tangga."
                }
              ].map((val, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-8 rounded-[2rem] hover:shadow-xl dark:hover:shadow-black/50 transition-shadow">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border mb-6 ${val.bg}`}>
                      <val.icon size={24} className={val.color} />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{val.title}</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{val.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* TEAM SECTION */}
        <section className="py-24 max-w-7xl mx-auto px-6">
          <ScrollReveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Tim di Balik Layar
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Project Mahasiswa Politeknik Negeri Malang
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Farhan", role: "Project Manager", img: "/team/farhan.jpeg" },
              { name: "Putra", role: "Hardware Engineer", img: "/team/putra.jpeg" },
              { name: "Agna", role: "Software Developer", img: "/team/agna.jpeg" },
              { name: "Fahreiza", role: "UI/UX Designer", img: "/team/fahreiza.jpg" }
            ].map((member, i) => (
              <ScrollReveal key={i} delay={i * 100}>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-6 rounded-[2rem] text-center hover:border-[#4edea3]/50 transition-colors group">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 mb-5 border-4 border-slate-50 dark:border-slate-950 group-hover:scale-105 transition-transform duration-300">
                    <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h5 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{member.name}</h5>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{member.role}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>



      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-200 dark:border-white/5 bg-slate-100/90 dark:bg-[#0b0f10]/95 backdrop-blur-md transition-colors mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-6 text-slate-600 dark:text-slate-400 text-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Wind className="text-[#4edea3]" size={16} strokeWidth={2.8} />
            <span className="font-bold tracking-widest uppercase text-slate-800 dark:text-slate-200">SkyWatch</span>
          </div>
          <p>© {new Date().getFullYear()} PBL Kelompok 4 Polinema. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
