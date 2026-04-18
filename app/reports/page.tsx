"use client";
import React, { useEffect, useState } from "react";
import { 
  Download, Thermometer, Wind, Archive, 
  FileText, Activity, ShieldCheck, AlertCircle, 
  CheckCircle2, Settings2, X 
} from "lucide-react";

export default function ReportsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- STATE UNTUK PENGATURAN DOWNLOAD ---
  const [showSettings, setShowSettings] = useState(false);
  const [exportLimit, setExportLimit] = useState(50); // Default ambil 50 data terakhir
  const [fileName, setFileName] = useState("SkyWatch_Report_Group4");

  const fetchData = async () => {
    try {
      const res = await fetch("/api/sensor");
      const result = await res.json();
      if (Array.isArray(result)) setData(result);
    } catch (error) {
      console.error("Failed to fetch archives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FUNGSI EKSPOR DENGAN PENGATURAN ---
  const handleExport = () => {
    const headers = ["Timestamp,Temp,Hum,CO2,Status\n"];
    
    // Filter data berdasarkan limit yang di-set user
    const filteredData = data.slice(0, exportLimit);

    const rows = filteredData.map(i => 
      `${new Date(i.created_at).toLocaleString('en-GB')},${i.temp},${i.hum},${i.co2},${i.is_unhealthy ? 'Unhealthy' : 'Safe'}\n`
    );

    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.csv`;
    a.click();
    setShowSettings(false); // Tutup modal setelah download
  };

  const hasData = data.length > 0;
  const avgTemp = hasData ? data.reduce((a, b) => a + b.temp, 0) / data.length : 0;
  const peakCO2 = hasData ? Math.max(...data.map(i => i.co2)) : 0;
  const unhealthyLogs = data.filter(i => i.is_unhealthy === 1).length;

  return (
    <main className="min-h-screen p-6 md:p-12 space-y-10 bg-[#020617] relative">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* --- HEADER SECTION --- */}
        <section className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600/20 rounded-2xl text-blue-400">
              <FileText size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-tighter text-white font-bold">Data Archives</h1>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Documentation & Export Hub</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full md:w-auto flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest text-white transition-all shadow-lg active:scale-95"
          >
            <Settings2 size={20} /> Configure Export
          </button>
        </section>

        {/* --- SUMMARY STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard title="Average Temp" value={`${avgTemp.toFixed(1)}°C`} icon={<Thermometer size={20}/>} color="orange" />
          <StatCard title="Peak CO2" value={`${peakCO2} ppm`} icon={<Wind size={20}/>} color="blue" />
          <StatCard title="Critical Events" value={unhealthyLogs} icon={<AlertCircle size={20}/>} color="red" />
          <StatCard title="Total Logs" value={data.length} icon={<Archive size={20}/>} color="emerald" />
        </div>

        {/* --- DATA PREVIEW TABLE --- */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center">
            <h3 className="font-bold uppercase tracking-widest text-slate-400 text-sm flex items-center gap-2">
              <Activity size={18} className="text-blue-500" /> Recent Log Preview
            </h3>
            <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">Live Database Feed</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-5">Timestamp</th>
                  <th className="px-6 py-5 text-center">Temperature</th>
                  <th className="px-6 py-5 text-center">Humidity</th>
                  <th className="px-6 py-5 text-center">CO2 Level</th>
                  <th className="px-8 py-5 text-right">Air Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {data.slice(0, 10).map((item, i) => (
                  <tr key={i} className="hover:bg-blue-500/[0.02] transition-colors">
                    <td className="px-8 py-4 text-xs font-mono text-slate-400">{new Date(item.created_at).toLocaleString('en-GB')}</td>
                    <td className="px-6 py-4 text-center text-orange-400 font-bold">{item.temp?.toFixed(1)}°C</td>
                    <td className="px-6 py-4 text-center text-blue-400 font-bold">{item.hum?.toFixed(1)}%</td>
                    <td className="px-6 py-4 text-center text-white font-bold">{item.co2} <small className="opacity-40">ppm</small></td>
                    <td className="px-8 py-4 text-right">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black ${item.is_unhealthy ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {item.is_unhealthy ? "CRITICAL" : "STABLE"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* --- SYSTEM INTEGRITY FOOTER --- */}
        <div className="bg-blue-600/5 border border-blue-500/10 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <ShieldCheck size={40} className="text-blue-500 opacity-50" />
            <p className="text-slate-400 text-sm italic max-w-md">
              "This report verifies that Group 4's SkyWatch node has successfully transmitted and archived environmental data."
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Report Generator</p>
            <p className="text-sm font-bold text-white uppercase tracking-tight">SkyWatch v1.0.4 - stable</p>
          </div>
        </div>
      </div>

      {/* --- EXPORT SETTINGS MODAL --- */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-[2rem] p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
               <button onClick={() => setShowSettings(false)} className="text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
            </div>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-600/20 rounded-xl text-blue-400"><Download size={24}/></div>
              <h2 className="text-xl font-black uppercase italic text-white leading-none">Export Settings</h2>
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">File Name (.csv)</label>
                <input 
                  type="text" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Limit (Rows)</label>
                <select 
                  value={exportLimit}
                  onChange={(e) => setExportLimit(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-all appearance-none"
                >
                  <option value={10}>Latest 10 Logs</option>
                  <option value={50}>Latest 50 Logs</option>
                  <option value={100}>Latest 100 Logs</option>
                  <option value={data.length}>All Logs ({data.length})</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleExport}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-4 rounded-xl uppercase tracking-widest text-sm transition-all shadow-lg shadow-emerald-900/20"
            >
              Start Download
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorMap: any = {
    orange: "text-orange-400 bg-orange-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    red: "text-red-400 bg-red-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10"
  };
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl shadow-xl">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colorMap[color]}`}>{icon}</div>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">{title}</p>
      <h2 className="text-2xl font-black text-white tracking-tight leading-none">{value}</h2>
    </div>
  );
}