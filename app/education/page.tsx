"use client";
import React, { useState } from 'react';
import { BookOpen, ChevronDown, Wind, Thermometer, Droplets, Zap, Flame } from 'lucide-react';

const topics = [
  {
    id: 'voc',
    label: 'VOC — Sensor Utama Kebocoran Gas LPG',
    icon: <Flame size={16} />,
    color: '#ec4899',
    threshold: '70 PPM (Batas Kebocoran)',
    safe: '< 70 PPM (Aman)',
    danger: '> 70 PPM (AWAS KEBOCORAN)',
    image: '/voc.png',
    desc: 'Sensor VOC (Volatile Organic Compounds) dalam sistem keselamatan ini dirancang khusus untuk menjadi BARISAN UTAMA penilai partikel gas elpiji (Propana & Butana) mentah di udara dapur Anda. Kebocoran tabung elpiji sering terjadi di area selang regulator yang usang atau pemasangan seal karet yang kurang rapat. Sensor ini akan menangkap partikel tersebut sebelum konsentrasinya mencapai batas pemicu ledakan.',
    symptoms: 'Mulai tercium bau menyengat khas gas belerang (mercaptan yang sengaja ditambahkan ke elpiji agar mudah dikenali), rasa mual, sakit kepala ringan, hingga risiko fatal ledakan hebat jika tersulut sekecil apa pun percikan listrik.',
    tips: '1. JANGAN menyentuh saklar lampu atau mencabut stopkontak kabel (ini dapat menghasilkan percikan listrik mikro yang memicu ledakan!).\n2. JANGAN menyalakan korek api atau kompor.\n3. Segera lepaskan regulator dari kepala tabung gas.\n4. Buka lebar semua pintu, jendela, dan ventilasi dapur agar gas segera menguap keluar.',
  },
  {
    id: 'co2',
    label: 'CO₂ — Sisa Gas Pembakaran Api Kompor',
    icon: <Wind size={16} />,
    color: '#3b82f6',
    threshold: '250 PPM (Batas Wajar)',
    safe: '< 250 PPM',
    danger: '> 250 PPM',
    image: '/co2.png',
    desc: 'Karbon Dioksida (CO₂) merupakan produk pembuangan dari nyala api kompor gas. Pemantauan gas CO₂ di dapur sangat penting untuk mengukur kualitas sirkulasi udara. Jika area dapur Anda terlalu tertutup rapat saat Anda memasak, kadar gas CO₂ akan meningkat pesat, menggantikan volume oksigen yang kita hirup sehari-hari.',
    symptoms: 'Napas terasa berat, rasa kantuk luar biasa secara tiba-tiba saat memasak, pusing berdenyut di pelipis, dan dalam skenario terburuk bisa memicu pingsan (asfiksia) akibat paru-paru kekurangan oksigen.',
    tips: '1. Selalu pastikan api kompor menyala dengan sempurna berwarna biru (warna jingga/merah menandakan sisa pembakaran CO₂ yang jauh lebih tinggi).\n2. Nyalakan exhaust fan atau penyedot udara di atas kompor selama aktivitas memasak berlangsung.\n3. Biarkan jendela dapur terbuka minimal sebagian saat kompor menyala.',
  },
  {
    id: 'nh3',
    label: 'NH₃ — Kebocoran Senyawa Gas Kimia Beracun',
    icon: <Zap size={16} />,
    color: '#f59e0b',
    threshold: '30 PPM (Peringatan)',
    safe: '< 30 PPM',
    danger: '> 30 PPM',
    image: '/nh3.png',
    desc: 'Amonia (NH₃) dipantau di dapur sebagai pelacak keselamatan sekunder. Gas amonia adalah senyawa kimia beracun yang memiliki sifat korosif tajam. Deteksi dini kebocoran gas kimia seperti amonia sangat penting agar tidak terhirup atau terakumulasi pekat di ruangan dapur tertutup yang dapat membahayakan sistem pernapasan dan mata.',
    symptoms: 'Bau menyengat menusuk hidung seperti bau air kencing pekat, mata terasa sangat perih berair seperti terbakar, tenggorokan teriritasi parah, dan sesak napas akut.',
    tips: '1. Segera tinggalkan area dapur dan evakuasi seluruh anggota keluarga ke luar rumah.\n2. Jangan menyalakan kompor atau kipas ventilasi listrik jika konsentrasi gas terlampau pekat.\n3. Buka lebar-lebar semua pintu dan jendela dari arah luar agar embusan angin mengusir uap gas kimia beracun tersebut.',
  },
  {
    id: 'temp',
    label: 'Suhu Panas — Alarm Kebakaran & Titik Api',
    icon: <Thermometer size={16} />,
    color: '#ef4444',
    threshold: '32°C (Dapur)',
    safe: 'Normal (Sesuai Cuaca)',
    danger: 'Lonjakan Panas Mendadak',
    image: '/temp.png',
    desc: 'Sensor Suhu berfungsi sebagai sistem pertahanan berlapis untuk mendeteksi dini keberadaan titik api kebakaran. Ketika gas elpiji bocor, potensi gas tersebut tersulut api sangat tinggi. Sensor suhu dapur dirancang sensitif mendeteksi adanya lompatan suhu yang janggal dalam durasi singkat, sebelum api menyebar luas ke dinding dapur Anda.',
    symptoms: 'Rasa gerah memanggang yang tiba-tiba di sekitar kulit wajah, tercium bau benda plastik atau kabel yang meleleh di dekat kompor, serta terdengar suara letupan kecil dari arah dapur.',
    tips: '1. Jauhkan kain lap dapur, minyak goreng, tisu gulung, dan tabung semprotan aerosol (seperti obat nyamuk) dari jangkauan kompor.\n2. Selalu bersihkan sisa-sisa minyak kompor yang menempel di dinding agar tidak menjadi bahan bakar api.\n3. Sediakan APAR (Alat Pemadam Api Ringan) berbahan powder di dapur.',
  },
  {
    id: 'hum',
    label: 'Kelembapan — Hambatan Evakuasi Gas LPG',
    icon: <Droplets size={16} />,
    color: '#8b5cf6',
    threshold: '80% (Batas Lembap)',
    safe: '30% – 70%',
    danger: '> 80% (Gas Terjebak)',
    image: '/hum.png',
    desc: 'Sensor Kelembapan di dapur memiliki peran ilmiah yang sangat penting. Gas elpiji (LPG) memiliki massa yang jauh lebih berat dibanding udara. Dalam ruangan yang sangat lembap dan basah, partikel air di udara akan menghalangi pergerakan gas elpiji untuk naik ke atas, sehingga gas yang bocor akan mengendap pekat di bawah lantai dan kolong lemari dapur, membuatnya tidak bisa terbuang lewat jendela atas.',
    symptoms: 'Lantai dapur sering terasa basah/licin berembun, ruangan terasa apek menyengat, dan bau gas tercium sangat pekat saat Anda menunduk atau membersihkan area kolong dapur.',
    tips: '1. Hindari genangan air yang dibiarkan lama di lantai dapur.\n2. Jika terdeteksi kebocoran gas di ruang lembap, gunakan sapu lantai atau hembusan kipas angin listrik yang diletakkan di lantai untuk meniup gas keluar menuju pintu terdekat.\n3. Buka kabinet lemari bawah kompor agar aliran udara di bawah kompor tidak tersumbat.',
  },
];

export default function EducationPage() {
  const [open, setOpen] = useState<string | null>('co2');

  return (
    <div className="min-h-screen bg-[#F1F5F9] dark:bg-[#070d1a] text-slate-900 dark:text-white transition-colors duration-300">
      {/* PAGE HEADER */}
      <div className="px-6 md:px-8 pt-7 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
          <div>
            <p className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-[0.35em] mb-1">About & Safety Guide</p>
            <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Tentang & Panduan Keselamatan
            </h1>
            <p className="text-slate-600 text-xs mt-1 font-mono">Mitigasi Cerdas Kebocoran Gas Dapur Pintar</p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 xl:px-12 pb-8 max-w-5xl mx-auto space-y-5">

        {/* ABOUT SYSTEM SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="md:col-span-2 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-black text-[#a3e635] uppercase tracking-[0.25em] mb-2">Tujuan Proyek</p>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Sistem Deteksi Dini & Mitigasi Kebocoran Gas Dapur
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-4">
                <strong>SkyWatch</strong> dirancang khusus sebagai solusi preventif rumah tangga modern untuk memitigasi bahaya kebocoran gas LPG dan polusi udara dapur secara real-time. Dengan integrasi mikrokontroler <strong className="text-[#a3e635]">ESP32</strong>, sensor gas <strong className="text-[#a3e635]">MQ Series</strong>, serta sensor suhu-kelembapan <strong className="text-[#a3e635]">DHT22</strong>, alat ini mampu memberikan sinyal evakuasi instan sebelum potensi ledakan atau kebakaran terjadi.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-500 font-mono">
              <span>Platform: Next.js + MySQL + IoT Node</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border-2 border-[#a3e635]/40 dark:border-[#a3e635]/20 bg-[#a3e635]/5 p-6 transition-all flex flex-col justify-between group">
            {/* Glow Lampu */}
            <div 
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-[0.25] dark:opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.35]" 
              style={{ backgroundColor: '#a3e635' }} 
            />
            <div className="relative z-10">
              <p className="text-[9px] font-black text-[#a3e635] uppercase tracking-[0.25em] mb-2">Cara Kerja IoT</p>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Bagaimana Alat Bekerja?
              </h2>
              <div className="space-y-3 mt-2">
                {[
                  { num: "01", text: "Sensor membaca kadar VOC (LPG), CO₂, NH₃, Suhu, & Kelembapan di area dapur secara berkelanjutan." },
                  { num: "02", text: "Data dikirimkan secara instan melalui Wi-Fi ke Cloud Database MySQL setiap kali terjadi perubahan data." },
                  { num: "03", text: "Dashboard SkyWatch menganalisis batas aman, memberikan alarm visual, serta log histori deteksi lengkap." }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-xs font-black text-[#a3e635] font-mono shrink-0">{step.num}</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[10px] leading-relaxed">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="pt-2 pb-1">
          <h3 className="text-xs font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-[0.3em] font-mono">
            Panduan & Indikator Batas Aman Sensor
          </h3>
        </div>

        {/* Accordion topics */}
        {topics.map(topic => {
          const isOpen = open === topic.id;
          return (
            <div
              key={topic.id}
                className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 relative group ${
                  isOpen 
                  ? 'border-blue-500/40 dark:border-blue-500/50 bg-[#FFFFFF] dark:bg-[#070d1a] shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-[0_8px_30px_rgba(59,130,246,0.1)]' 
                  : 'border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.05] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.02)] hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              style={{
                borderColor: isOpen ? topic.color + '60' : undefined,
                backgroundColor: isOpen ? topic.color + '08' : undefined,
              }}
            >
              <div 
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-[0.15] dark:group-hover:opacity-[0.1]" 
                style={{ backgroundColor: topic.color }} 
              />
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(isOpen ? null : topic.id)}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: topic.color }}>{topic.icon}</span>
                  <span className={`font-semibold text-sm uppercase tracking-wide transition-colors ${isOpen ? 'text-slate-900 dark:text-white' : 'text-[#1E293B] dark:text-slate-400 dark:text-slate-300'}`}>
                    {topic.label}
                  </span>
                  <span
                    className="hidden sm:inline text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border"
                    style={{ background: topic.color + '15', color: topic.color, borderColor: topic.color + '30' }}
                  >
                    Threshold: {topic.threshold}
                  </span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 flex-shrink-0 ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}
                  style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
                />
              </button>

              {isOpen && (
                <div className="px-6 pb-6 space-y-4 border-t border-[#E2E8F0] dark:border-white/5 pt-5 transition-colors">
                  <div className="flex flex-col md:flex-row gap-5">
                    <div className="md:w-1/3 flex-shrink-0">
                      <img src={topic.image} alt={topic.label} className="w-full h-40 object-cover rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] border border-[#E2E8F0] dark:border-white/10" />
                    </div>
                    <div className="md:w-2/3 space-y-4">
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{topic.desc}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/8 px-4 py-3 transition-colors">
                          <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1.5">✓ Kondisi Aman</p>
                          <p className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">{topic.safe}</p>
                        </div>
                        <div className="rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-500/8 px-4 py-3 transition-colors">
                          <p className="text-[9px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest mb-1.5">⚠ Kondisi Bahaya</p>
                          <p className="text-red-700 dark:text-red-300 font-bold text-sm">{topic.danger}</p>
                        </div>
                        <div
                          className="rounded-xl border px-4 py-3 transition-colors"
                          style={{ background: topic.color + '10', borderColor: topic.color + '30' }}
                        >
                          <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: topic.color }}>
                            Gejala / Dampak
                          </p>
                          <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{topic.symptoms}</p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        <div className="rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/15 bg-[#F8F9FA] dark:bg-[#FFFFFF]/[0.06] px-4 py-3 transition-colors shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none">
                          <p className="text-[9px] font-semibold text-[#1E293B] dark:text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">💡 Tips Pencegahan</p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{topic.tips}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer note */}
        <p className="text-center text-slate-400 dark:text-slate-700 text-[9px] uppercase font-black tracking-[0.4em] pt-6 transition-colors">
          SkyWatch About & Safety Guide — Group 4 Polinema IT
        </p>
      </div>
    </div>
  );
}