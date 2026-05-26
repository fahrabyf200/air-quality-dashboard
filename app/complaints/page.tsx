"use client";
import React, { useState, useEffect } from 'react';
import {
  MessageSquareWarning, Send, CheckCircle, Clock, AlertTriangle,
  Phone, Mail, MessageCircle, RefreshCw, Check
} from 'lucide-react';

const WA_ADMIN = "6285792524863";

export default function ComplaintsPage() {
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ type: string; text: string }>({ type: '', text: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.headers.get('content-type')?.includes('application/json') ? r.json() : { user: null })
      .then(d => {
        if (d.user) {
          setUser(d.user);
          setForm(f => ({ ...f, name: d.user.name || '', email: d.user.email || '' }));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus({ type: 'error', text: 'Semua field wajib diisi' });
      return;
    }
    setSending(true);
    setStatus({ type: '', text: '' });
    try {
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
        setStatus({ type: 'success', text: data.message });
        setForm(f => ({ ...f, subject: '', message: '' }));
      } else {
        setStatus({ type: 'error', text: data.error || 'Gagal mengirim pengaduan' });
      }
    } catch {
      setStatus({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="px-6 md:px-10 xl:px-12 pt-7 pb-8 space-y-6 w-full transition-colors duration-300">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full border-b border-slate-200/60 dark:border-slate-800/40 pb-5">
        <div>
          <p className="text-[9px] font-black text-slate-450 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">Pusat Bantuan</p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Pengaduan & Bantuan
          </h1>
          <p className="text-slate-550 dark:text-slate-400 text-xs mt-1">Laporkan kendala atau pertanyaan Anda kepada kami</p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            icon: MessageCircle,
            color: '#25D366',
            label: 'WhatsApp',
            value: '+62 857-9252-4863',
            action: () => {
              fetch('/api/notifications/whatsapp', { method: 'POST' }).catch(() => {});
              window.open(`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent('Halo Admin SkyWatch, saya butuh bantuan.')}`, '_blank');
            },
            cta: 'Chat Sekarang'
          },
          {
            icon: Mail,
            color: '#3b82f6',
            label: 'Email Support',
            value: 'Via Formulir di bawah',
            action: null,
            cta: null
          },
          {
            icon: Clock,
            color: '#f59e0b',
            label: 'Jam Operasional',
            value: 'Senin–Sabtu, 08:00–17:00',
            action: null,
            cta: null
          },
        ].map((c) => (
          <div
            key={c.label}
            onClick={c.action || undefined}
            className={`relative rounded-2xl border border-slate-200 border-t-[1.5px] dark:border-slate-800 bg-white dark:bg-slate-900/60 p-5 overflow-hidden shadow-sm transition-all group ${c.action ? 'cursor-pointer hover:scale-[1.01] hover:border-slate-350 dark:hover:border-slate-700' : ''}`}
          >
            <div 
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-[0.25] dark:opacity-20 blur-3xl pointer-events-none transition-opacity duration-300 group-hover:opacity-[0.35]" 
              style={{ backgroundColor: c.color }} 
            />
            <div className="relative z-10 p-2.5 rounded-xl w-fit mb-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
              <c.icon size={18} style={{ color: c.color }} />
            </div>
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{c.label}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">{c.value}</p>
              {c.cta && (
                <p className="text-[10px] font-black mt-2" style={{ color: c.color }}>{c.cta} →</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Pengaduan */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-[#4edea3] rounded-full" />
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Formulir Pengaduan
            </h2>
          </div>

          <div className="bg-white dark:bg-slate-900/60 border border-slate-200 border-t-[1.5px] dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
            {sent && (
              <div className="mb-6 flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                  <CheckCircle size={28} className="text-emerald-500" />
                </div>
                <p className="font-black text-slate-900 dark:text-white text-base mb-1">Pengaduan Terkirim!</p>
                <p className="text-sm text-slate-500">{status.text}</p>
                <button
                  onClick={() => { setSent(false); setStatus({ type: '', text: '' }); }}
                  className="mt-4 px-5 py-2 rounded-xl bg-[#4edea3] text-[#0a0f1a] font-black text-xs uppercase tracking-wider"
                >
                  Kirim Pengaduan Lain
                </button>
              </div>
            )}

            {!sent && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Lengkap</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Nama Anda..."
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4edea3]/20 focus:border-[#4edea3] transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="email@anda.com"
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4edea3]/20 focus:border-[#4edea3] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subjek Pengaduan</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="Contoh: Sensor tidak mengirim data..."
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4edea3]/20 focus:border-[#4edea3] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detail Pesan</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    placeholder="Jelaskan masalah atau pertanyaan Anda secara detail..."
                    rows={5}
                    className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4edea3]/20 focus:border-[#4edea3] transition-all resize-none"
                  />
                </div>

                {status.text && !sent && (
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-bold ${
                    status.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                      : 'bg-red-500/10 border-red-500/20 text-red-600'
                  }`}>
                    {status.type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
                    {status.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#4edea3] hover:bg-[#5cebb2] text-[#0a0f1a] font-black text-sm uppercase tracking-wider transition-all shadow-[#4edea3]/20 hover:shadow-[#4edea3]/40 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {sending ? <RefreshCw size={15} className="animate-spin" /> : <Send size={15} />}
                  {sending ? 'Mengirim...' : 'Kirim Pengaduan'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* FAQ / Info Panel */}
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 bg-blue-500 rounded-full" />
            <h2 className="text-sm font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
              Pertanyaan Umum (FAQ)
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: 'Bagaimana cara upgrade ke Premium?',
                a: 'Klik tombol "Upgrade ke Premium" di halaman Profile Anda, lalu hubungi Admin via WhatsApp. Pembayaran akan dikonfirmasi dan akun Anda akan diaktifkan.',
              },
              {
                q: 'Sensor ESP32 saya tidak mengirim data, apa yang harus dilakukan?',
                a: 'Pastikan perangkat terhubung ke WiFi dan device_id sudah didaftarkan di halaman Profile. Jika masih bermasalah, kirim pengaduan ke kami.',
              },
              {
                q: 'Berapa lama respon pengaduan saya?',
                a: 'Kami berusaha merespons dalam 1x24 jam di hari kerja (Senin–Sabtu). Untuk masalah mendesak, hubungi via WhatsApp.',
              },
              {
                q: 'Apakah data sensor saya aman?',
                a: 'Ya, seluruh data tersimpan di server kami dengan enkripsi dan tidak dibagikan ke pihak ketiga manapun.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900/60 border border-slate-200 border-t-[1.5px] dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-slate-350 dark:hover:border-slate-700 transition-all">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <span className="text-[9px] font-black text-blue-600">Q</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 dark:text-white mb-2">{item.q}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick WA Button */}
          <a
            href={`https://wa.me/${WA_ADMIN}?text=${encodeURIComponent('Halo Admin SkyWatch, saya perlu bantuan.')}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => fetch('/api/notifications/whatsapp', { method: 'POST' }).catch(() => {})}
            className="flex items-center justify-center gap-3 w-full py-3.5 rounded-2xl border border-[#25D366]/30 bg-[#25D366]/5 hover:bg-[#25D366]/10 text-[#25D366] font-black text-xs uppercase tracking-wider transition-all group"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <span>Chat Langsung via WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
