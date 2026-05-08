"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Activity,
  RefreshCw,
  AlertTriangle,
  Database,
  ShieldAlert,
  ShieldCheck,
  Clock3,
  TrendingUp,
} from "lucide-react";

const T = { co2: 800, nh3: 2, temp: 35, hum: 80 };

interface SensorRow {
  id?: number;
  co2: number;
  nh3: number;
  temp?: number;
  temperature?: number;
  hum?: number;
  humidity?: number;
  voc?: number;
  is_unhealthy?: number;
  dominant_pollutant?: string;
  created_at?: string;
  timestamp?: string;
}

function StatusDot({ danger }: { danger: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all ${
        danger
          ? "bg-red-500/10 text-red-400 border-red-500/20"
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          danger ? "bg-red-500 animate-ping" : "bg-emerald-500 animate-pulse"
        }`}
      />
      {danger ? "Danger" : "Safe"}
    </span>
  );
}

function NumCell({
  v,
  threshold,
  digits = 1,
}: {
  v: number;
  threshold: number;
  digits?: number;
}) {
  const over = v > threshold;

  return (
    <span
      className={`font-black tabular-nums text-sm ${
        over ? "text-red-400" : "text-slate-200"
      }`}
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {v?.toFixed(digits)}
    </span>
  );
}

function SummaryCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: any;
  color: string;
  icon: any;
}) {
  return (
    <div
      className="relative rounded-2xl md:rounded-3xl border border-white/8 overflow-hidden group transition-all duration-300"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
      }}
    >
      {/* glow desktop only */}
      <div
        className="hidden md:block absolute -top-10 -right-10 w-28 h-28 rounded-full blur-3xl opacity-10"
        style={{ background: color }}
      />

      {/* top line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}70, transparent)`,
        }}
      />

      <div className="p-4 md:p-6">
        {/* MOBILE */}
        <div className="flex md:hidden items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-slate-500 mb-1">
              {label}
            </p>

            <h2
              className="text-2xl font-black text-white leading-none tabular-nums"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {value}
            </h2>
          </div>

          <div
            className="w-10 h-10 rounded-xl border border-white/8 flex items-center justify-center"
            style={{ background: `${color}15` }}
          >
            <Icon size={16} style={{ color }} />
          </div>
        </div>

        {/* DESKTOP */}
        <div className="hidden md:block">
          <div className="flex items-start justify-between mb-10">
            <div
              className="w-12 h-12 rounded-2xl border border-white/8 flex items-center justify-center"
              style={{ background: `${color}15` }}
            >
              <Icon size={18} style={{ color }} />
            </div>
          </div>

          <p className="text-xs font-black uppercase tracking-[0.28em] text-slate-500 mb-3">
            {label}
          </p>

          <h2
            className="text-5xl xl:text-6xl font-black text-white leading-none tabular-nums"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {value}
          </h2>
        </div>
      </div>
    </div>
  );
}

const PER_PAGE = 25;

export default function MonitoringPage() {
  const [rows, setRows] = useState<SensorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/sensor");

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();

      setRows(Array.isArray(json) ? json : [json]);
      setError("");
    } catch (e: any) {
      setError("Gagal memuat data dari API sensor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(rows.length / PER_PAGE);

  const paged = rows.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  const dangerCount = rows.filter((r) => {
    const t = r.temp ?? r.temperature ?? 0;

    return r.co2 > T.co2 || r.nh3 > T.nh3 || t > T.temp;
  }).length;

  return (
    <div className="min-h-screen bg-[#070d1a] text-white">
      {/* HEADER */}
      <div className="px-4 sm:px-5 md:px-8 xl:px-10 pt-7 pb-5">
        <div className="max-w-[1700px] mx-auto flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.35em] mb-1">
              Kitchen Sensor Node
            </p>

            <h1
              className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Monitoring Data
            </h1>

            <p className="text-slate-600 text-xs mt-1 font-mono">
              Real-time Sensor Log • SkyWatch Analytics
            </p>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-white/8 bg-white/[0.04] text-slate-400 hover:text-white hover:border-white/20 transition-all text-[11px] font-black uppercase tracking-wider active:scale-95 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
            />

            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-5 md:px-8 xl:px-10 pb-10 space-y-5 md:space-y-6 max-w-[1700px] mx-auto">
        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5">
          <SummaryCard
            label="Total Records"
            value={rows.length}
            color="#3b82f6"
            icon={Database}
          />

          <SummaryCard
            label="Danger Events"
            value={dangerCount}
            color="#ef4444"
            icon={ShieldAlert}
          />

          <SummaryCard
            label="Safe Events"
            value={rows.length - dangerCount}
            color="#22c55e"
            icon={ShieldCheck}
          />

          <SummaryCard
            label="Latest Sync"
            value={
              rows[0]?.created_at
                ? new Date(rows[0].created_at).toLocaleTimeString("id-ID")
                : "--"
            }
            color="#a855f7"
            icon={Clock3}
          />
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-5 py-4 flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-400" />

            <div>
              <p className="font-black uppercase text-sm tracking-wide text-red-400">
                Connection Error
              </p>

              <p className="text-xs text-slate-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* TABLE */}
        <div
          className="rounded-3xl border border-white/8 overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))",
          }}
        >
          {/* TABLE HEADER */}
          <div className="px-4 sm:px-6 py-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Activity size={15} className="text-blue-400" />
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                  Sensor Activity Log
                </p>

                <p className="text-xs text-slate-600 mt-1">
                  {rows.length} total records collected
                </p>
              </div>
            </div>
          </div>

          {/* LOADING */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <RefreshCw
                    size={24}
                    className="text-blue-400 animate-spin"
                  />
                </div>

                <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl animate-pulse" />
              </div>

              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-slate-600">
                Loading Sensor Data...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-white/10">
              <table className="w-full min-w-[850px] md:min-w-[1000px]">
                <thead>
                  <tr className="border-b border-white/5">
                    {[
                      "#",
                      "Timestamp",
                      "CO₂",
                      "NH₃",
                      "Temperature",
                      "Humidity",
                      "VOC",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.03]">
                  {paged.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-20 text-slate-600 text-sm font-black uppercase tracking-[0.3em]"
                      >
                        No sensor data available
                      </td>
                    </tr>
                  ) : (
                    paged.map((row, i) => {
                      const t = row.temp ?? row.temperature ?? 0;

                      const h = row.hum ?? row.humidity ?? 0;

                      const isDanger =
                        row.co2 > T.co2 ||
                        row.nh3 > T.nh3 ||
                        t > T.temp;

                      const ts =
                        row.created_at ?? row.timestamp;

                      return (
                        <tr
                          key={row.id ?? i}
                          className={`transition-all hover:bg-white/[0.03] ${
                            isDanger ? "bg-red-500/[0.03]" : ""
                          }`}
                        >
                          <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                            {(page - 1) * PER_PAGE + i + 1}
                          </td>

                          <td
                            className="px-6 py-4 text-slate-400 text-xs whitespace-nowrap"
                            style={{
                              fontFamily:
                                "'IBM Plex Mono', monospace",
                            }}
                          >
                            {ts
                              ? new Date(ts).toLocaleString(
                                  "id-ID"
                                )
                              : "—"}
                          </td>

                          <td className="px-6 py-4">
                            <NumCell
                              v={row.co2}
                              threshold={T.co2}
                              digits={0}
                            />
                          </td>

                          <td className="px-6 py-4">
                            <NumCell
                              v={row.nh3}
                              threshold={T.nh3}
                              digits={2}
                            />
                          </td>

                          <td className="px-6 py-4">
                            <NumCell
                              v={t}
                              threshold={T.temp}
                            />
                          </td>

                          <td className="px-6 py-4">
                            <NumCell
                              v={h}
                              threshold={T.hum}
                              digits={0}
                            />
                          </td>

                          <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                            {row.voc?.toFixed(2) ?? "—"}
                          </td>

                          <td className="px-6 py-4">
                            <StatusDot danger={isDanger} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="px-4 sm:px-6 py-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-600">
                Page {page} / {totalPages}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setPage((p) => Math.max(1, p - 1))
                  }
                  disabled={page === 1}
                  className="px-4 py-2 rounded-xl border border-white/8 bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/15 disabled:opacity-30 transition-all text-xs font-black uppercase tracking-wider"
                >
                  ← Prev
                </button>

                <button
                  onClick={() =>
                    setPage((p) =>
                      Math.min(totalPages, p + 1)
                    )
                  }
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-xl border border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 disabled:opacity-30 transition-all text-xs font-black uppercase tracking-wider"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}