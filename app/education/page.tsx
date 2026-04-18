"use client";
import React from 'react';
import { 
  BookOpen, Info, AlertCircle, Wind, 
  ShieldCheck, Thermometer, Droplets, Zap 
} from 'lucide-react';

export default function EducationPage() {
  const pollutants = [
    {
      name: "Carbon Dioxide (CO2)",
      icon: <Wind className="text-blue-400" />,
      desc: "A colorless gas that in high concentrations can cause headaches, dizziness, and fatigue.",
      safety: "Safe: < 600 ppm | Drowsiness: > 1000 ppm",
      impact: "High levels indicate poor ventilation and can reduce cognitive performance."
    },
    {
      name: "Ammonia (NH3)",
      icon: <Zap className="text-yellow-400" />,
      desc: "A pungent gas often found in cleaning products or waste decomposition.",
      safety: "Safe: < 5 ppm | Irritation: > 25 ppm",
      impact: "Can cause respiratory irritation and eye discomfort even at low levels."
    },
    {
      name: "VOCs (Volatile Organic Compounds)",
      icon: <AlertCircle className="text-red-400" />,
      desc: "Organic chemicals that evaporate easily, found in paints, sprays, and new furniture.",
      safety: "Optimal: < 0.3 mg/m³ | High: > 3 mg/m³",
      impact: "Long-term exposure is linked to various health issues including allergies."
    }
  ];

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-6 md:p-12 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="max-w-6xl mx-auto space-y-10 pb-20 relative z-10">
        
        {/* Header Section */}
        <section className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/60 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400">
              <BookOpen size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">SkyWatch Academy</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Environmental Awareness & Safety Standards</p>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed max-w-3xl italic">
            "Understanding what you breathe is the first step toward a healthier life. 
            SkyWatch provides the data, but knowledge empowers the action."
          </p>
        </section>

        {/* Pollutant Encyclopedia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pollutants.map((p, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800/60 p-8 rounded-[2rem] hover:border-blue-500/30 transition-all group">
              <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {p.icon}
              </div>
              <h3 className="text-xl font-black text-white mb-3 uppercase tracking-tight">{p.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{p.desc}</p>
              
              <div className="space-y-4 pt-4 border-t border-slate-800">
                <div className="flex items-start gap-3">
                  <ShieldCheck size={16} className="text-emerald-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">Safety Threshold</p>
                    <p className="text-xs text-slate-300">{p.safety}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info size={16} className="text-blue-500 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase">Health Impact</p>
                    <p className="text-xs text-slate-300">{p.impact}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Climate Standards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-orange-500/5 border border-orange-500/20 p-8 rounded-[2.5rem] flex items-center gap-6">
            <Thermometer size={48} className="text-orange-400 opacity-50" />
            <div>
              <h4 className="font-black text-white uppercase tracking-tight mb-1">Optimal Temperature</h4>
              <p className="text-sm text-slate-400">Standard indoor comfort is between <strong>22°C - 25°C</strong>. Higher temps can increase the off-gassing of VOCs.</p>
            </div>
          </div>
          <div className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-[2.5rem] flex items-center gap-6">
            <Droplets size={48} className="text-blue-400 opacity-50" />
            <div>
              <h4 className="font-black text-white uppercase tracking-tight mb-1">Ideal Humidity</h4>
              <p className="text-sm text-slate-400">Relative humidity of <strong>45% - 55%</strong> is ideal to prevent mold growth and respiratory dryness.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}