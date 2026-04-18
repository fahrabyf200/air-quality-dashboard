"use client";
import React, { useEffect, useState } from 'react';
import { 
  Wind, AlertTriangle, CheckCircle, Activity, 
  Thermometer, Droplets, ShieldCheck, Cpu, Users, ArrowUpRight, Info
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/sensor');
      const result = await res.json();
      
      if (Array.isArray(result) && result.length > 0) {
        setData(result[0]); 
        const formattedHistory = result.map((item: any) => ({
          ...item,
          time: new Date(item.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        })).reverse();
        setHistory(formattedHistory);
      } else {
        const mockNow = new Date().toISOString();
        const dummy = { id: "OFFLINE", co2: 415, nh3: 2.5, voc: 0.4, temp: 28.2, hum: 87.7, is_unhealthy: 0, dominant_pollutant: "None", created_at: mockNow };
        setData(dummy);
        setHistory([
          { ...dummy, time: "12:00 PM", co2: 405, temp: 27 },
          { ...dummy, time: "02:00 PM", co2: 430, temp: 28 },
          { ...dummy, time: "04:00 PM", co2: 415, temp: 27.5 }
        ]);
      }
    } catch (e) {
      console.error("Failed to sync SkyWatch data");
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, []);

  if (!mounted || !data) return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center font-mono">
      <Wind size={48} className="text-blue-500 animate-spin mb-4" />
      <p className="text-slate-400 animate-pulse uppercase tracking-[0.3em] text-xs font-bold">SkyWatch: Initializing System...</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-12 relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-10 relative z-10 pb-20">

        {/* --- SECTION: ABOUT PROGRAM & PHILOSOPHY --- */}
        <section className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-12 -right-12 p-10 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-1000 rotate-12 group-hover:rotate-0">
            <Wind size={300} />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30 text-blue-400">
                  <Info size={24} />
                </div>
                <div>
                  <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-1">Project Philosophy</h2>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter">SkyWatch Analytics</h3>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed italic border-l-4 border-blue-600 pl-6 text-xl font-medium text-pretty">
                  "SkyWatch represents vigilance toward air quality. 
                  'Sky' symbolizes the atmospheric environment, while 'Watch' 
                  embodies our system's commitment to real-time health monitoring."
                </p>
                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                  This Smart Air Quality Monitoring System is an IoT-based solution 
                  integrating <strong>ESP32</strong> hardware with <strong>MQ Series</strong> gas sensors and 
                  <strong>DHT22</strong>. Designed for continuous tracking of CO₂, NH3, VOCs, 
                  temperature, and humidity levels.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-800/50 px-4 py-2 rounded-xl border border-slate-700/50 uppercase">
                  <Cpu size={14} className="text-emerald-500" />
                  <span>Architecture: Sensors → ESP32 → REST API → MySQL → Dashboard</span>
                </div>
              </div>
            </div>

            {/* Team Card */}
            <div className="bg-gradient-to-br from-blue-600/10 to-transparent backdrop-blur-md p-8 rounded-[2rem] border border-blue-500/20 flex flex-col justify-center items-center text-center shadow-inner relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
                 <Users size={40} className="text-blue-400 mb-4" />
                 <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black mb-1">Developed By</p>
                 <p className="text-4xl font-black text-white uppercase tracking-tight leading-none mb-3 text-nowrap">Group 4</p>
                 <div className="h-[1px] w-12 bg-slate-800 mb-3"></div>
                 <p className="text-[11px] text-blue-400/80 font-mono font-bold">State Polytechnic of Malang</p>
                 <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest">IT Department Project</p>
            </div>
          </div>
        </section>

        {/* --- SECTION: LIVE MONITORING HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 via-emerald-400 to-blue-600 bg-clip-text text-transparent tracking-tight">
              Environmental Insights
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Real-time Sensor Stream</p>
            </div>
          </div>

          <div className={`px-10 py-5 rounded-[2.5rem] flex items-center gap-5 border-2 transition-all duration-700 shadow-2xl ${
            data.is_unhealthy 
              ? 'bg-red-500/10 border-red-500/40 text-red-400 shadow-red-500/5' 
              : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-emerald-500/5'
          }`}>
            <div className={`p-3 rounded-2xl ${data.is_unhealthy ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
              {data.is_unhealthy ? <AlertTriangle size={36} /> : <CheckCircle size={36} />}
            </div>
            <div>
              <p className="text-[10px] uppercase font-black opacity-50 tracking-widest mb-1 leading-none text-nowrap">Environmental Health</p>
              <span className="font-black text-2xl tracking-tight leading-none uppercase">
                {data.is_unhealthy ? "Unhealthy Air" : "Optimal & Safe"}
              </span>
            </div>
          </div>
        </div>

        {/* --- SENSOR METRICS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <MetricCard title="CO2 Concentration" value={data.co2} unit="ppm" color="#3b82f6" threshold={400} />
          <MetricCard title="Ammonia (NH3)" value={data.nh3} unit="ppm" color="#f59e0b" threshold={5} />
          <MetricCard title="Total VOCs" value={data.voc} unit="ppm" color="#ef4444" threshold={2} />
        </div>

        {/* --- CLIMATE METRICS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <ClimateCard title="Ambient Temperature" value={data.temp} unit="°C" icon={<Thermometer size={36}/>} color="orange" />
          <ClimateCard title="Relative Humidity" value={data.hum} unit="%" icon={<Droplets size={36}/>} color="blue" />
        </div>

        {/* --- CHART & INTELLIGENCE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-10 rounded-[3rem] shadow-2xl overflow-hidden">
            <h3 className="flex items-center gap-3 mb-10 font-black text-slate-300 uppercase tracking-widest text-sm text-center md:text-left">
              <Activity size={20} className="text-blue-500" /> Statistical Air Trends
            </h3>
            <div className="w-full aspect-[2/1] min-h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
                  <XAxis dataKey="time" stroke="#475569" fontSize={11} tickMargin={15} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '20px', padding: '15px' }} 
                    itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                  />
                  <Legend iconType="circle" verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: '20px' }} />
                  <Line name="CO2 Level" type="monotone" dataKey="co2" stroke="#3b82f6" strokeWidth={4} dot={false} animationDuration={2000} />
                  <Line name="Temperature" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={4} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-8">
             {/* Pollutant Card */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 rounded-[2.5rem] shadow-xl text-center group">
              <h3 className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Dominant Pollutant</h3>
              <div className="py-6 px-4 bg-slate-800/50 rounded-[2rem] border border-blue-500/20 group-hover:border-blue-500/40 transition-all">
                <p className="text-3xl font-black text-blue-400 leading-none tracking-tight uppercase">
                  {data.dominant_pollutant === "None" ? "Clean Air" : data.dominant_pollutant}
                </p>
              </div>
            </div>

            {/* AI Recommendation Card */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 rounded-[2.5rem] shadow-xl flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] mb-4">SkyWatch Recommendation</h3>
                <div className="p-6 bg-slate-800/30 rounded-[2rem] border border-slate-700/50 group hover:border-blue-500/20 transition-all duration-500">
                  <p className="text-slate-200 italic text-sm leading-relaxed">
                    {data.is_unhealthy 
                      ? "⚠️ Air quality is declining. Please increase ventilation or activate air purifiers immediately." 
                      : "✨ Conditions are currently optimal. Ensure fresh air circulation to maintain this healthy state."}
                  </p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/50 flex items-center justify-between">
                 <div>
                   <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest leading-none mb-1 text-nowrap">Cloud Sync Status</p>
                   <p className="text-xs text-blue-400 font-mono font-bold leading-none uppercase">
                    ONLINE • {new Date(data.created_at).toLocaleTimeString('en-US')}
                   </p>
                 </div>
                 <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700">
                    <Activity size={18} className="text-slate-500" />
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Branding Footer */}
        <p className="text-center text-slate-700 text-[9px] uppercase font-black tracking-[0.5em] pt-10">
          Integrated SkyWatch System — Group 4 Polinema IT
        </p>
      </div>
    </main>
  );
}

// Sub-components
function MetricCard({ title, value, unit, color, threshold }: any) {
  const percentage = Math.min((value / (threshold * 2)) * 100, 100);
  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 rounded-[2.5rem] hover:border-blue-500/30 transition-all shadow-2xl group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/10 transition-all" />
      <div className="flex justify-between items-start mb-6">
        <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest leading-none">{title}</p>
        <ArrowUpRight size={16} className="text-slate-700 group-hover:text-blue-400 transition-colors" />
      </div>
      <div className="flex items-baseline gap-2 mb-8 relative z-10">
        <span className="text-6xl font-black tracking-tighter text-white tabular-nums drop-shadow-xl">{value?.toFixed(0)}</span>
        <span className="text-slate-500 text-xs font-black uppercase">{unit}</span>
      </div>
      <div className="w-full bg-slate-800/50 h-3 rounded-full overflow-hidden border border-slate-700/30 shadow-inner">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage}%`, backgroundColor: color, boxShadow: `0 0 15px ${color}` }} 
        />
      </div>
    </div>
  );
}

function ClimateCard({ title, value, unit, icon, color }: any) {
  const bgColor = color === 'orange' ? 'bg-orange-500/10' : 'bg-blue-500/10';
  const textColor = color === 'orange' ? 'text-orange-400' : 'text-blue-400';
  const borderColor = color === 'orange' ? 'group-hover:border-orange-500/30' : 'group-hover:border-blue-500/30';
  return (
    <div className={`bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-10 rounded-[2.5rem] flex items-center gap-10 shadow-xl group transition-all ${borderColor}`}>
      <div className={`p-8 ${bgColor} ${textColor} rounded-[2rem] border border-white/5 group-hover:scale-110 transition-all duration-500 shadow-lg`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2 leading-none text-nowrap">{title}</p>
        <h2 className="text-5xl font-black text-white tracking-tighter leading-none tabular-nums uppercase">
          {value?.toFixed(1)}<span className="text-2xl text-slate-500 ml-1 font-bold">{unit}</span>
        </h2>
      </div>
    </div>
  );
}