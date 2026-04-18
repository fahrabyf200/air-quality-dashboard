"use client";
import React, { useEffect, useState } from "react";
import { 
  Server, RefreshCw, ChevronLeft, ChevronRight, 
  Activity, Radio, Zap, Clock, X, Info, ShieldCheck, 
  Database, Wind, Thermometer, Droplets
} from "lucide-react";

export default function MonitoringPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<string>("--:--:--");
  const [selectedItem, setSelectedItem] = useState<any>(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10; 

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sensor");
      const result = await res.json();
      if (Array.isArray(result)) {
        setData(result);
        setLastSync(new Date().toLocaleTimeString('en-GB'));
      }
    } catch (error) { 
      console.error("Link Failure:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); 
    return () => clearInterval(interval);
  }, []);

  const currentRows = data.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalPages = Math.ceil(data.length / rowsPerPage);

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-6 md:p-12 relative">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-slate-900/40 border border-slate-800 p-8 rounded-[2rem] shadow-2xl">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400 relative">
                <Server size={28} />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
             </div>
             <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white leading-none">Live Stream</h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Node-01 Feed Output</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block mr-4">
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-none mb-1">Last Pulse</p>
               <p className="text-sm font-mono font-bold text-blue-400 leading-none">{lastSync}</p>
            </div>
            <button onClick={fetchData} className="group flex items-center gap-2 bg-slate-800 border border-slate-700 hover:border-blue-500/50 px-6 py-3 rounded-2xl transition-all active:scale-95">
               <RefreshCw size={18} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-all"} />
               <span className="text-sm font-black uppercase tracking-widest text-white italic">Sync Feed</span>
            </button>
          </div>
        </div>

        {/* --- DATA LOG TABLE --- */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Live Sequence Output</span>
             <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Click row for detail insight</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] border-b border-slate-800/50">
                  <th className="px-8 py-6 italic">Sequence</th>
                  <th className="px-6 py-6 text-center">Temp</th>
                  <th className="px-6 py-6 text-center">Hum</th>
                  <th className="px-6 py-6 text-center">CO2 Feed</th>
                  <th className="px-8 py-6 text-right">Node Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {currentRows.map((item, i) => (
                  <tr key={i} onClick={() => setSelectedItem(item)} className="group transition-all cursor-pointer hover:bg-blue-500/[0.05]">
                    <td className="px-8 py-5 font-mono text-xs text-slate-500 group-hover:text-blue-400 transition-colors">#{new Date(item.created_at).toLocaleTimeString('en-GB')}</td>
                    <td className="px-6 py-5 text-center text-orange-400 font-black text-lg">{item.temp?.toFixed(1)}°</td>
                    <td className="px-6 py-5 text-center text-blue-400 font-black text-lg">{item.hum?.toFixed(1)}%</td>
                    <td className="px-6 py-5 text-center font-bold text-slate-200">{item.co2} <span className="text-[10px] opacity-30">PPM</span></td>
                    <td className="px-8 py-5 text-right">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black border ${item.is_unhealthy ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                        {item.is_unhealthy ? "CRITICAL" : "STABLE"}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          <div className="p-6 bg-slate-800/10 border-t border-slate-800/50 flex justify-between items-center text-white">
            <button onClick={() => setCurrentPage(p => Math.max(p-1, 1))} disabled={currentPage === 1} className="p-2.5 border border-slate-700 rounded-xl disabled:opacity-20 hover:bg-slate-800 transition-all"><ChevronLeft size={18} /></button>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Page {currentPage} of {totalPages || 1}</span>
            <button onClick={() => setCurrentPage(p => Math.min(p+1, totalPages))} disabled={currentPage === totalPages || totalPages === 0} className="p-2.5 border border-slate-700 rounded-xl disabled:opacity-20 hover:bg-slate-800 transition-all"><ChevronRight size={18} /></button>
          </div>
        </div>

        {/* --- DETAIL MODAL (PERFECTED) --- */}
        {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedItem(null)} />
            
            <div className="relative bg-[#020617] border border-slate-800 w-full max-w-4xl rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in duration-300">
               <div className="p-10 space-y-8">
                  
                  {/* Modal Header */}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"><Activity size={24} /></div>
                      <div>
                        <h2 className="text-3xl font-black uppercase italic text-white tracking-tighter leading-none">Record Insight</h2>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Detailed Sensor Metadata</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedItem(null)} className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 hover:text-white transition-all shadow-xl active:scale-95"><X size={24} /></button>
                  </div>

                  {/* Main Metrics (Dashboard Style with barColor) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ModalStatBox title="CO2 CONCENTRATION" value={selectedItem.co2} unit="PPM" color="text-blue-400" barColor="#3b82f6" threshold={400} />
                    <ModalStatBox title="AMMONIA (NH3)" value={selectedItem.nh3 || 0} unit="PPM" color="text-orange-400" barColor="#f59e0b" threshold={5} />
                    <ModalStatBox title="TOTAL VOCS" value={selectedItem.voc || 0} unit="PPM" color="text-red-400" barColor="#ef4444" threshold={2} />
                  </div>

                  {/* Climate Info (Fixed floating points with .toFixed(1)) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex items-center gap-6 shadow-inner">
                      <div className="p-6 bg-orange-500/10 text-orange-400 rounded-2xl border border-white/5"><Thermometer size={32}/></div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">Ambient Temperature</p>
                        <h2 className="text-4xl font-black text-white leading-none mt-1">
                          {Number(selectedItem.temp).toFixed(1)}<span className="text-lg text-slate-500 ml-1">°C</span>
                        </h2>
                      </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex items-center gap-6 shadow-inner">
                      <div className="p-6 bg-blue-500/10 text-blue-400 rounded-2xl border border-white/5"><Droplets size={32}/></div>
                      <div>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1 leading-none">Relative Humidity</p>
                        <h2 className="text-4xl font-black text-white leading-none mt-1">
                          {Number(selectedItem.hum).toFixed(1)}<span className="text-lg text-slate-500 ml-1">%</span>
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Tech Details Footer */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-4">
                       <Clock size={18} className="text-slate-600" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Logged: {new Date(selectedItem.created_at).toLocaleString('en-GB')}</span>
                    </div>
                    <div className="p-5 bg-blue-600/5 border border-blue-500/10 rounded-2xl flex items-center gap-4">
                       <ShieldCheck size={18} className="text-blue-500" />
                       <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node ID: SKY-04-POLINEMA</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

// Sub-component for Modal Stats
function ModalStatBox({ title, value, unit, color, barColor, threshold }: any) {
  // Logic to calculate progress bar width
  const percentage = Math.min((value / (threshold * 2)) * 100, 100);

  return (
    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden shadow-xl">
      <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-4 leading-none">{title}</p>
      <div className="flex items-baseline gap-2 relative z-10">
        <span className={`text-5xl font-black tracking-tighter tabular-nums ${color}`}>{value}</span>
        <span className="text-slate-500 text-xs font-black uppercase">{unit}</span>
      </div>
      <div className="mt-6 w-full bg-slate-800/50 h-2 rounded-full overflow-hidden p-[px]">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out" 
          style={{ width: `${percentage || 5}%`, backgroundColor: barColor, boxShadow: `0 0 10px ${barColor}` }} 
        />
      </div>
    </div>
  );
}