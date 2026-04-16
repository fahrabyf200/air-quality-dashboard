"use client";
import React, { useEffect, useState } from 'react';
import { Wind, AlertTriangle, CheckCircle, Activity, Thermometer, Droplets } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/sensor');
      const result = await res.json();
      if (result.length > 0) {
        setData(result[0]); 
        const formattedHistory = result.map((item: any) => ({
          ...item,
          time: new Date(item.created_at).toLocaleTimeString()
        })).reverse();
        setHistory(formattedHistory);
      }
    } catch (e) {
      console.error("Gagal mengambil data");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 2000); 
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center font-mono animate-pulse text-xl">Menunggu Data dari Sensor...</div>;

  return (
    <main className="min-h-screen bg-[#020617] text-slate-100 p-4 md:p-12">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              Air Quality & Climate
            </h1>
            <p className="text-slate-400">Monitoring Real-time DHT22 + MQ Sensor</p>
          </div>
          <div className={`px-6 py-3 rounded-2xl flex items-center gap-3 border ${data.is_unhealthy ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-emerald-500/10 border-emerald-500 text-emerald-400'}`}>
            {data.is_unhealthy ? <AlertTriangle size={24} /> : <CheckCircle size={24} />}
            <span className="font-bold text-lg">{data.is_unhealthy ? "TIDAK SEHAT" : "AMAN & SEHAT"}</span>
          </div>
        </div>

        {/* Metric Cards Utama (Gas) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <MetricCard title="CO2 Level" value={data.co2} unit="ppm" color="#60a5fa" threshold={30} />
          <MetricCard title="NH3 (Amonia)" value={data.nh3} unit="ppm" color="#fbbf24" threshold={4} />
          <MetricCard title="VOCs Level" value={data.voc} unit="ppm" color="#f87171" threshold={10} />
        </div>

        {/* Metric Cards Tambahan (DHT22) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center gap-6">
            <div className="p-4 bg-orange-500/10 rounded-2xl text-orange-400"><Thermometer size={32} /></div>
            <div>
              <p className="text-slate-400 text-sm">Temperatur</p>
              <h2 className="text-3xl font-bold">{data.temp?.toFixed(1)}°C</h2>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl flex items-center gap-6">
            <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400"><Droplets size={32} /></div>
            <div>
              <p className="text-slate-400 text-sm">Kelembapan</p>
              <h2 className="text-3xl font-bold">{data.hum?.toFixed(1)}%</h2>
            </div>
          </div>
        </div>

        {/* Chart & Action */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
            <h3 className="flex items-center gap-2 mb-6 font-semibold"><Activity size={20} className="text-blue-400" /> Tren Sensor Terintegrasi</h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="time" hide />
                  <YAxis stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                  <Legend />
                  <Line name="CO2" type="monotone" dataKey="co2" stroke="#60a5fa" strokeWidth={2} dot={false} />
                  <Line name="Suhu (°C)" type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line name="Kelembapan" type="monotone" dataKey="hum" stroke="#06b6d4" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-3xl flex flex-col justify-between">
            <div>
              <h3 className="text-slate-400 text-sm uppercase mb-2">Polutan Dominan</h3>
              <p className="text-xl font-bold mb-6">{data.dominant_pollutant === "Tidak Ada" ? "Udara Bersih" : data.dominant_pollutant}</p>
              <h3 className="text-slate-400 text-sm uppercase mb-2">Saran Tindakan</h3>
              <p className="text-slate-200 italic leading-relaxed">
                {data.is_unhealthy 
                  ? "Kualitas udara memburuk. Segera aktifkan ventilasi atau penjernih udara." 
                  : "Kondisi ruangan optimal. Suhu dan kualitas udara dalam batas normal."}
              </p>
            </div>
            <div className="mt-6 text-xs text-slate-500 border-t border-slate-800 pt-4">
              ID Data: #{data.id} | Terakhir Update: {new Date(data.created_at).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function MetricCard({ title, value, unit, color, threshold }: any) {
  const percentage = Math.min((value / (threshold * 2)) * 100, 100);
  return (
    <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-3xl">
      <p className="text-slate-400 font-medium mb-1 text-sm uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-bold tracking-tight">{value?.toFixed(1)}</span>
        <span className="text-slate-500 text-sm font-medium">{unit}</span>
      </div>
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div className="h-full transition-all duration-700 ease-in-out" style={{ width: `${percentage}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}