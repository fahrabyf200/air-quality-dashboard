"use client";
import React, { useState } from 'react';
import { BookOpen, ChevronDown, Wind, Thermometer, Droplets, Zap, Flame } from 'lucide-react';
import { useLanguage } from '@/app/hooks/useLanguage';

interface Topic {
  id: string;
  label: string;
  labelEn: string;
  icon: React.ReactNode;
  color: string;
  threshold: string;
  thresholdEn: string;
  safe: string;
  safeEn: string;
  danger: string;
  dangerEn: string;
  image: string;
  desc: string;
  descEn: string;
  symptoms: string;
  symptomsEn: string;
  tips: string;
  tipsEn: string;
}

const topics: Topic[] = [
  {
    id: 'voc',
    label: 'VOC — Sensor Utama Kebocoran Gas LPG',
    labelEn: 'VOC — Primary LPG Gas Leak Sensor',
    icon: <Flame size={16} />,
    color: '#ec4899',
    threshold: '70 PPM (Batas Kebocoran)',
    thresholdEn: '70 PPM (Leak Threshold)',
    safe: '< 70 PPM (Aman)',
    safeEn: '< 70 PPM (Safe)',
    danger: '> 70 PPM (AWAS KEBOCORAN)',
    dangerEn: '> 70 PPM (DANGER: LEAK DETECTED)',
    image: '/voc.png',
    desc: 'Sensor VOC (Volatile Organic Compounds) dalam sistem keselamatan ini dirancang khusus untuk menjadi BARISAN UTAMA penilai partikel gas elpiji (Propana & Butana) mentah di udara dapur Anda. Kebocoran tabung elpiji sering terjadi di area selang regulator yang usang atau pemasangan seal karet yang kurang rapat. Sensor ini akan menangkap partikel tersebut sebelum konsentrasinya mencapai batas pemicu ledakan.',
    descEn: 'The VOC (Volatile Organic Compounds) sensor in this safety system is specifically designed to be the FRONT LINE detector of raw LPG gas particles (Propane & Butane) in your kitchen air. LPG cylinder leaks often occur around worn regulator hoses or poorly fitted rubber seals. This sensor captures these particles before their concentration reaches the explosion trigger limit.',
    symptoms: 'Mulai tercium bau menyengat khas gas belerang (mercaptan yang sengaja ditambahkan ke elpiji agar mudah dikenali), rasa mual, sakit kepala ringan, hingga risiko fatal ledakan hebat jika tersulut sekecil apa pun percikan listrik.',
    symptomsEn: 'A strong sulfur-like smell (mercaptan, intentionally added to LPG for easy detection) starts to become noticeable, followed by nausea, mild headache, up to a fatal risk of a major explosion if ignited by even the smallest electrical spark.',
    tips: '1. JANGAN menyentuh saklar lampu atau mencabut stopkontak kabel (ini dapat menghasilkan percikan listrik mikro yang memicu ledakan!).\n2. JANGAN menyalakan korek api atau kompor.\n3. Segera lepaskan regulator dari kepala tabung gas.\n4. Buka lebar semua pintu, jendela, dan ventilasi dapur agar gas segera menguap keluar.',
    tipsEn: '1. DO NOT touch light switches or unplug any cables (this can produce micro electrical sparks that trigger an explosion!).\n2. DO NOT light matches or use the stove.\n3. Immediately disconnect the regulator from the gas cylinder head.\n4. Open all doors, windows, and kitchen ventilation wide to allow the gas to disperse quickly.',
  },
  {
    id: 'co2',
    label: 'CO₂ — Sisa Gas Pembakaran Api Kompor',
    labelEn: 'CO₂ — Stove Flame Combustion Residue',
    icon: <Wind size={16} />,
    color: '#3b82f6',
    threshold: '250 PPM (Batas Wajar)',
    thresholdEn: '250 PPM (Normal Limit)',
    safe: '< 250 PPM',
    safeEn: '< 250 PPM',
    danger: '> 250 PPM',
    dangerEn: '> 250 PPM',
    image: '/co2.png',
    desc: 'Karbon Dioksida (CO₂) merupakan produk pembuangan dari nyala api kompor gas. Pemantauan gas CO₂ di dapur sangat penting untuk mengukur kualitas sirkulasi udara. Jika area dapur Anda terlalu tertutup rapat saat Anda memasak, kadar gas CO₂ akan meningkat pesat, menggantikan volume oksigen yang kita hirup sehari-hari.',
    descEn: 'Carbon Dioxide (CO₂) is a byproduct of the gas stove flame. Monitoring CO₂ gas in the kitchen is highly important to evaluate air circulation quality. If your kitchen area is too tightly closed while cooking, CO₂ levels will rise rapidly, displacing the oxygen volume we breathe daily.',
    symptoms: 'Napas terasa berat, rasa kantuk luar biasa secara tiba-tiba saat memasak, pusing berdenyut di pelipis, dan dalam skenario terburuk bisa memicu pingsan (asfiksia) akibat paru-paru kekurangan oksigen.',
    symptomsEn: 'Breathing feels heavy, sudden onset of extreme drowsiness while cooking, throbbing headache in the temples, and in the worst-case scenario can trigger fainting (asphyxiation) due to oxygen deprivation in the lungs.',
    tips: '1. Selalu pastikan api kompor menyala dengan sempurna berwarna biru (warna jingga/merah menandakan sisa pembakaran CO₂ yang jauh lebih tinggi).\n2. Nyalakan exhaust fan atau penyedot udara di atas kompor selama aktivitas memasak berlangsung.\n3. Biarkan jendela dapur terbuka minimal sebagian saat kompor menyala.',
    tipsEn: '1. Always ensure the stove flame burns blue (orange/red flame indicates incomplete combustion with much higher CO₂ residue).\n2. Turn on the exhaust fan or cooker hood above the stove during cooking activities.\n3. Keep the kitchen window open at least partially when the stove is on.',
  },
  {
    id: 'nh3',
    label: 'NH₃ — Kebocoran Senyawa Gas Kimia Beracun',
    labelEn: 'NH₃ — Toxic Chemical Compound Leak',
    icon: <Zap size={16} />,
    color: '#f59e0b',
    threshold: '30 PPM (Peringatan)',
    thresholdEn: '30 PPM (Warning)',
    safe: '< 30 PPM',
    safeEn: '< 30 PPM',
    danger: '> 30 PPM',
    dangerEn: '> 30 PPM',
    image: '/nh3.png',
    desc: 'Amonia (NH₃) dipantau di dapur sebagai pelacak keselamatan sekunder. Gas amonia adalah senyawa kimia beracun yang memiliki sifat korosif tajam. Deteksi dini kebocoran gas kimia seperti amonia sangat penting agar tidak terhirup atau terakumulasi pekat di ruangan dapur tertutup yang dapat membahayakan sistem pernapasan dan mata.',
    descEn: 'Ammonia (NH₃) is monitored in the kitchen as a secondary safety indicator. Ammonia is a toxic chemical compound with sharp corrosive properties. Early detection of chemical gas leaks like ammonia is vital to prevent inhalation or accumulation in closed kitchen spaces, which can damage the respiratory system and eyes.',
    symptoms: 'Bau menyengat menusuk hidung seperti bau air kencing pekat, mata terasa sangat perih berair seperti terbakar, tenggorokan teriritasi parah, dan sesak napas akut.',
    symptomsEn: 'Pungent odor piercing the nose like strong urine, eyes feeling highly irritated, watery, or burning, throat severely irritated, and acute shortness of breath.',
    tips: '1. Segera tinggalkan area dapur dan evakuasi seluruh anggota keluarga ke luar rumah.\n2. Jangan menyalakan kompor atau kipas ventilasi listrik jika konsentrasi gas terlampau pekat.\n3. Buka lebar-lebar semua pintu dan jendela dari arah luar agar embusan angin mengusir uap gas kimia beracun tersebut.',
    tipsEn: '1. Immediately leave the kitchen area and evacuate all family members outside the house.\n2. Do not light the stove or switch on electrical ventilation fans if the gas concentration is too high.\n3. Open all doors and windows wide from the outside to let the wind disperse the toxic chemical gas vapors.',
  },
  {
    id: 'temp',
    label: 'Suhu Panas — Alarm Kebakaran & Titik Api',
    labelEn: 'Temperature — Fire Alarm & Hotspot',
    icon: <Thermometer size={16} />,
    color: '#ef4444',
    threshold: '32°C (Dapur)',
    thresholdEn: '32°C (Kitchen)',
    safe: 'Normal (Sesuai Cuaca)',
    safeEn: 'Normal (Weather-based)',
    danger: 'Lonjakan Panas Mendadak',
    dangerEn: 'Sudden Heat Spike',
    image: '/temp.png',
    desc: 'Sensor Suhu berfungsi sebagai sistem pertahanan berlapis untuk mendeteksi dini keberadaan titik api kebakaran. Ketika gas elpiji bocor, potensi gas tersebut tersulut api sangat tinggi. Sensor suhu dapur dirancang sensitif mendeteksi adanya lompatan suhu yang janggal dalam durasi singkat, sebelum api menyebar luas ke dinding dapur Anda.',
    descEn: 'The Temperature Sensor acts as a multi-layered defense system to detect fire hotspots early. When LPG leaks, the potential for it to catch fire is extremely high. The kitchen temperature sensor is designed to sensitively detect unusual temperature jumps in a short duration, before fire spreads to your kitchen walls.',
    symptoms: 'Rasa gerah memanggang yang tiba-tiba di sekitar kulit wajah, tercium bau benda plastik atau kabel yang meleleh di dekat kompor, serta terdengar suara letupan kecil dari arah dapur.',
    symptomsEn: 'A sudden baking heat around the face skin, the smell of melting plastic or cables near the stove, and small popping sounds from the kitchen.',
    tips: '1. Jauhkan kain lap dapur, minyak goreng, tisu gulung, dan tabung semprotan aerosol (seperti obat nyamuk) dari jangkauan kompor.\n2. Selalu bersihkan sisa-sisa minyak kompor yang menempel di dinding agar tidak menjadi bahan bakar api.\n3. Sediakan APAR (Alat Pemadam Api Ringan) berbahan powder di dapur.',
    tipsEn: '1. Keep kitchen cloths, cooking oil, paper rolls, and aerosol spray cans (like insect repellent) out of reach of the stove.\n2. Always clean grease residue off the stove walls to prevent it from acting as fuel.\n3. Keep a powder-type fire extinguisher in the kitchen.',
  },
  {
    id: 'hum',
    label: 'Kelembapan — Hambatan Evakuasi Gas LPG',
    labelEn: 'Humidity — LPG Gas Evacuation Barrier',
    icon: <Droplets size={16} />,
    color: '#8b5cf6',
    threshold: '80% (Batas Lembap)',
    thresholdEn: '80% (Damp Limit)',
    safe: '30% – 70%',
    safeEn: '30% – 70%',
    danger: '> 80% (Gas Terjebak)',
    dangerEn: '> 80% (Trapped Gas)',
    image: '/hum.png',
    desc: 'Sensor Kelembapan di dapur memiliki peran ilmiah yang sangat penting. Gas elpiji (LPG) memiliki massa yang jauh lebih berat dibanding udara. Dalam ruangan yang sangat lembap dan basah, partikel air di udara akan menghalangi pergerakan gas elpiji untuk naik ke atas, sehingga gas yang bocor akan mengendap pekat di bawah lantai dan kolong lemari dapur, membuatnya tidak bisa terbuang lewat jendela atas.',
    descEn: 'The Humidity Sensor in the kitchen plays a very important scientific role. LPG gas is much heavier than air. In a very humid and wet room, water particles in the air block LPG gas from rising, causing the leaked gas to settle heavily near the floor and under kitchen cabinets, preventing it from escaping through upper windows.',
    symptoms: 'Lantai dapur sering terasa basah/licin berembun, ruangan terasa apek menyengat, dan bau gas tercium sangat pekat saat Anda menunduk atau membersihkan area kolong dapur.',
    symptomsEn: 'The kitchen floor often feels wet/slippery with condensation, the room feels musty, and the smell of gas is very strong when you bend down or clean under the cabinets.',
    tips: '1. Hindari genangan air yang dibiarkan lama di lantai dapur.\n2. Jika terdeteksi kebocoran gas di ruang lembap, gunakan sapu lantai atau hembusan kipas angin listrik yang diletakkan di lantai untuk meniup gas keluar menuju pintu terdekat.\n3. Buka kabinet lemari bawah kompor agar aliran udara di bawah kompor tidak tersumbat.',
    tipsEn: '1. Avoid leaving standing water on the kitchen floor for a long time.\n2. If a gas leak is detected in a humid space, use a floor broom or an electric fan placed on the floor to blow the gas out toward the nearest door.\n3. Open the cabinet under the stove so the air flow under the stove is not blocked.',
  },
];

export default function EducationPage() {
  const [open, setOpen] = useState<string | null>('voc');
  const { lang, t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      {/* PAGE HEADER */}
      <div className="px-6 md:px-8 pt-7 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
          <div>
            <p className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-[0.35em] mb-1">
              {t('About & Safety Guide', 'About & Safety Guide')}
            </p>
            <h1 className="text-2xl md:text-[28px] font-black tracking-tight text-slate-900 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
              {t('Tentang & Panduan Keselamatan', 'About & Safety Guide')}
            </h1>
            <p className="text-slate-650 text-xs mt-1 font-mono">
              {t('Mitigasi Cerdas Kebocoran Gas Dapur Pintar', 'Smart Gas Leak Mitigation for Smart Kitchen')}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 md:px-10 xl:px-12 pb-8 space-y-5 w-full">

        {/* ABOUT SYSTEM SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="md:col-span-2 rounded-2xl border-2 border-slate-300 dark:border-slate-600 bg-[#FFFFFF] dark:bg-[#FFFFFF]/[0.04] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:shadow-none transition-all flex flex-col justify-between">
            <div>
              <p className="text-[9px] font-black text-[#4edea3] uppercase tracking-[0.25em] mb-2">
                {t('Tujuan Proyek', 'Project Goal')}
              </p>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {t('Sistem Deteksi Dini & Mitigasi Kebocoran Gas Dapur', 'Early Detection & Mitigation System for Kitchen Gas Leaks')}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed mb-4">
                {lang === 'id' ? (
                  <>
                    <strong>SkyWatch</strong> dirancang khusus sebagai solusi preventif rumah tangga modern untuk memitigasi bahaya kebocoran gas LPG dan polusi udara dapur secara real-time. Dengan integrasi mikrokontroler <strong className="text-[#4edea3]">ESP32</strong>, sensor gas <strong className="text-[#4edea3]">MQ Series</strong>, serta sensor suhu-kelembapan <strong className="text-[#4edea3]">DHT22</strong>, alat ini mampu memberikan sinyal evakuasi instan sebelum potensi ledakan atau kebakaran terjadi.
                  </>
                ) : (
                  <>
                    <strong>SkyWatch</strong> is specifically designed as a modern household preventive solution to mitigate the danger of LPG gas leaks and kitchen air pollution in real-time. With the integration of <strong className="text-[#4edea3]">ESP32</strong> microcontroller, <strong className="text-[#4edea3]">MQ Series</strong> gas sensors, and <strong className="text-[#4edea3]">DHT22</strong> temperature-humidity sensor, this device is capable of providing instant evacuation signals before potential explosions or fires occur.
                  </>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-white/5 text-[10px] text-slate-555 dark:text-slate-450 font-mono">
              <span>Platform: Next.js + MySQL + IoT Node</span>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-3xl border-2 border-[#4edea3]/40 dark:border-[#4edea3]/20 bg-[#4edea3]/5 p-6 transition-all flex flex-col justify-between group">
            {/* Glow Lampu */}
            <div 
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-[0.25] dark:opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.35]" 
              style={{ backgroundColor: '#4edea3' }} 
            />
            <div className="relative z-10">
              <p className="text-[9px] font-black text-[#4edea3] uppercase tracking-[0.25em] mb-2">
                {t('Cara Kerja IoT', 'How IoT Works')}
              </p>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {t('Bagaimana Alat Bekerja?', 'How the Device Works')}
              </h2>
              <div className="space-y-3 mt-2">
                {[
                  {
                    num: "01",
                    text: t(
                      "Sensor membaca kadar VOC (LPG), CO₂, NH₃, Suhu, & Kelembapan di area dapur secara berkelanjutan.",
                      "Sensors continuously read VOC (LPG), CO₂, NH₃, Temperature, & Humidity levels in the kitchen area."
                    )
                  },
                  {
                    num: "02",
                    text: t(
                      "Data dikirimkan secara instan melalui Wi-Fi ke Cloud Database MySQL setiap kali terjadi perubahan data.",
                      "Data is instantly sent via Wi-Fi to the MySQL Cloud Database whenever data changes."
                    )
                  },
                  {
                    num: "03",
                    text: t(
                      "Dashboard SkyWatch menganalisis batas aman, memberikan alarm visual, serta log histori deteksi lengkap.",
                      "The SkyWatch dashboard analyzes safe limits, provides visual alarms, and logs full detection history."
                    )
                  }
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-2">
                    <span className="text-xs font-black text-[#4edea3] font-mono shrink-0">{step.num}</span>
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
            {t('Panduan & Indikator Batas Aman Sensor', 'Guide & Sensor Safe Limit Indicators')}
          </h3>
        </div>

        {/* Accordion topics */}
        {topics.map(topic => {
          const isOpen = open === topic.id;
          return (
            <div
              key={topic.id}
              className={`border-2 rounded-2xl overflow-hidden transition-all duration-300 relative group`}
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
                <div className="flex items-center gap-3 flex-wrap">
                  <span style={{ color: topic.color }}>{topic.icon}</span>
                  <span className={`font-semibold text-sm uppercase tracking-wide transition-colors ${isOpen ? 'text-slate-900 dark:text-white' : 'text-[#1E293B] dark:text-slate-300'}`}>
                    {t(topic.label, topic.labelEn)}
                  </span>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border whitespace-nowrap"
                    style={{ background: topic.color + '15', color: topic.color, borderColor: topic.color + '30' }}
                  >
                    {t('Ambang Batas:', 'Threshold:')} {t(topic.threshold, topic.thresholdEn)}
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
                      <img src={topic.image} alt={t(topic.label, topic.labelEn)} className="w-full h-40 object-cover rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] border border-[#E2E8F0] dark:border-white/10" />
                    </div>
                    <div className="md:w-2/3 space-y-4">
                      <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                        {t(topic.desc, topic.descEn)}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/8 px-4 py-3 transition-colors">
                          <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1.5">
                            ✓ {t('Kondisi Aman', 'Safe Condition')}
                          </p>
                          <p className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                            {t(topic.safe, topic.safeEn)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-500/8 px-4 py-3 transition-colors">
                          <p className="text-[9px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest mb-1.5">
                            ⚠ {t('Kondisi Bahaya', 'Danger Condition')}
                          </p>
                          <p className="text-red-700 dark:text-red-300 font-bold text-sm">
                            {t(topic.danger, topic.dangerEn)}
                          </p>
                        </div>
                        <div
                          className="rounded-xl border px-4 py-3 transition-colors"
                          style={{ background: topic.color + '10', borderColor: topic.color + '30' }}
                        >
                          <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: topic.color }}>
                            {t('Gejala / Dampak', 'Symptoms / Impact')}
                          </p>
                          <p className="text-slate-650 dark:text-slate-300 text-xs leading-relaxed">
                            {t(topic.symptoms, topic.symptomsEn)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 space-y-3">
                        <div className="rounded-2xl border border-[#E2E8F0] border-t-[1.5px] dark:border-white/15 bg-[#F8F9FA] dark:bg-[#FFFFFF]/[0.06] px-4 py-3 transition-colors shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] dark:shadow-none">
                          <p className="text-[9px] font-semibold text-[#1E293B] dark:text-slate-550 uppercase tracking-widest mb-1.5">
                            💡 {t('Tips Pencegahan', 'Prevention Tips')}
                          </p>
                          <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed whitespace-pre-line">
                            {t(topic.tips, topic.tipsEn)}
                          </p>
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