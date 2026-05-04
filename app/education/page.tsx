"use client";
import React, { useState } from 'react';
import { BookOpen, ChevronDown, Wind, Thermometer, Droplets, Zap } from 'lucide-react';

const topics = [
  {
    id: 'co2',
    label: 'CO₂ — Carbon Dioxide',
    icon: <Wind size={16} />,
    color: '#3b82f6',
    threshold: '800 PPM (Dapur)',
    safe: '< 800 PPM',
    danger: '> 800 PPM',
    desc: 'Karbon Dioksida adalah gas hasil pembakaran bahan bakar dan respirasi manusia. Di dapur, CO₂ dapat meningkat drastis saat menggunakan kompor gas.',
    symptoms: 'Pusing, mengantuk, sesak napas, penurunan konsentrasi.',
    tips: 'Buka jendela dapur saat memasak. Gunakan exhaust fan. Periksa kebocoran gas secara berkala.',
  },
  {
    id: 'nh3',
    label: 'NH₃ — Ammonia',
    icon: <Zap size={16} />,
    color: '#f59e0b',
    threshold: '2 PPM (Dapur)',
    safe: '< 2 PPM',
    danger: '> 2 PPM',
    desc: 'Amonia adalah gas berbau tajam yang bisa berasal dari produk pembersih, kebocoran kulkas, atau pembusukan bahan organik.',
    symptoms: 'Iritasi mata, hidung, tenggorokan. Paparan tinggi bisa menyebabkan kerusakan paru.',
    tips: 'Jangan mencampur produk pembersih. Periksa kondisi kompresor kulkas. Ventilasi saat membersihkan.',
  },
  {
    id: 'temp',
    label: 'Suhu — Temperature',
    icon: <Thermometer size={16} />,
    color: '#ef4444',
    threshold: '35°C (Dapur)',
    safe: '20°C – 35°C',
    danger: '> 35°C',
    desc: 'Suhu dapur yang terlalu tinggi memengaruhi kenyamanan kerja, mempercepat pertumbuhan bakteri pada makanan, dan meningkatkan risiko kesehatan.',
    symptoms: 'Kelelahan panas (heat exhaustion), dehidrasi, gangguan konsentrasi.',
    tips: 'Gunakan AC atau kipas angin. Simpan makanan di kulkas. Hindari memasak dalam waktu lama tanpa ventilasi.',
  },
  {
    id: 'hum',
    label: 'Kelembapan — Humidity',
    icon: <Droplets size={16} />,
    color: '#8b5cf6',
    threshold: '80% (Dapur)',
    safe: '30% – 70%',
    danger: '> 80%',
    desc: 'Kelembapan tinggi mendorong pertumbuhan jamur dan bakteri, mempercepat korosi peralatan, serta menciptakan lingkungan tidak nyaman.',
    symptoms: 'Pertumbuhan jamur pada dinding, bau apek, gangguan pernapasan bagi penderita asma.',
    tips: 'Gunakan dehumidifier. Lap permukaan basah setelah memasak. Pastikan ventilasi lancar.',
  },
];

export default function EducationPage() {
  const [open, setOpen] = useState<string | null>('co2');

  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 pb-20 transition-colors duration-300">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/90 dark:bg-[#020617]/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/60 px-6 md:px-10 py-4 transition-colors">
        <h1 className="text-lg font-black tracking-tight uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Education Center
        </h1>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-widest mt-0.5">
          Panduan Kualitas Udara Dapur
        </p>
      </div>

      <div className="px-6 md:px-10 pt-6 max-w-4xl mx-auto space-y-3">

        {/* Intro card */}
        <div className="rounded-2xl border border-blue-500/20 bg-blue-50 dark:bg-blue-500/5 px-6 py-5 flex items-start gap-4 mb-6 transition-colors">
          <div className="p-2.5 bg-blue-100 dark:bg-blue-500/15 rounded-xl border border-blue-200 dark:border-blue-500/20 flex-shrink-0">
            <BookOpen size={18} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-blue-700 dark:text-blue-300 font-bold text-sm mb-1">Tentang Sensor SkyWatch</p>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              SkyWatch menggunakan sensor <strong className="text-slate-900 dark:text-slate-300">MQ Series</strong> dan <strong className="text-slate-900 dark:text-slate-300">DHT22</strong> yang terpasang pada ESP32 untuk memantau kualitas udara dapur secara real-time. Pelajari ambang batas dan cara menjaga lingkungan dapur yang sehat di bawah ini.
            </p>
          </div>
        </div>

        {/* Accordion topics */}
        {topics.map(topic => {
          const isOpen = open === topic.id;
          return (
            <div
              key={topic.id}
              className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                isOpen 
                  ? 'shadow-lg shadow-black/5 dark:shadow-none' 
                  : 'border-slate-200 dark:border-slate-800/60 bg-white dark:bg-slate-900/30'
              }`}
              style={{
                borderColor: isOpen ? topic.color + '60' : undefined,
                backgroundColor: isOpen ? topic.color + '08' : undefined,
              }}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(isOpen ? null : topic.id)}
              >
                <div className="flex items-center gap-3">
                  <span style={{ color: topic.color }}>{topic.icon}</span>
                  <span className={`font-black text-sm uppercase tracking-wide transition-colors ${isOpen ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>
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
                <div className="px-6 pb-6 space-y-4 border-t border-slate-200 dark:border-slate-800/40 pt-5 transition-colors">
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{topic.desc}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/8 px-4 py-3 transition-colors">
                      <p className="text-[9px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-1.5">✓ Safe Level</p>
                      <p className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">{topic.safe}</p>
                    </div>
                    <div className="rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-500/8 px-4 py-3 transition-colors">
                      <p className="text-[9px] font-black text-red-600 dark:text-red-500 uppercase tracking-widest mb-1.5">⚠ Danger Level</p>
                      <p className="text-red-700 dark:text-red-300 font-bold text-sm">{topic.danger}</p>
                    </div>
                    <div
                      className="rounded-xl border px-4 py-3 transition-colors"
                      style={{ background: topic.color + '10', borderColor: topic.color + '30' }}
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest mb-1.5" style={{ color: topic.color }}>
                        Symptoms
                      </p>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed">{topic.symptoms}</p>
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700/40 bg-slate-100 dark:bg-slate-800/30 px-4 py-3 transition-colors">
                    <p className="text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-1.5">💡 Tips Pencegahan</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{topic.tips}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Footer note */}
        <p className="text-center text-slate-400 dark:text-slate-700 text-[9px] uppercase font-black tracking-[0.4em] pt-6 transition-colors">
          SkyWatch Education Center — Group 4 Polinema IT
        </p>
      </div>
    </div>
  );
}