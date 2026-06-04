"use client";
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Wind, Lock, Mail, User, ArrowRight, Loader2, UserCheck } from 'lucide-react';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil email & flag undangan dari URL
  const invitedEmail = searchParams.get('email') || '';
  const isInvited = searchParams.get('invited') === '1';

  useEffect(() => {
    if (invitedEmail) setEmail(invitedEmail);
  }, [invitedEmail]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      if (res.ok) {
        router.push('/login?registered=1');
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal mendaftar');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#070d1a] p-6">
      <div className="w-full max-w-md">

        {/* Banner Undangan */}
        {isInvited && (
          <div className="mb-5 bg-[#4edea3]/10 border border-[#4edea3]/30 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-[#4edea3]/15 rounded-xl flex-shrink-0">
              <UserCheck size={18} className="text-[#4edea3]" />
            </div>
            <div>
              <p className="text-[11px] font-black text-[#4edea3] uppercase tracking-widest mb-1">Undangan Diterima 🎉</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Anda menerima undangan untuk memantau sensor SkyWatch. Daftar dengan email 
                <strong className="text-[#4edea3] font-mono ml-1">{invitedEmail}</strong> untuk mendapatkan akses otomatis.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#FFFFFF] dark:bg-[#0d1425] rounded-3xl p-8 shadow-2xl border border-[#E2E8F0] dark:border-white/10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#4edea3] flex items-center justify-center mb-4 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-emerald-500/20">
              <Wind size={32} className="text-[#0a0f1a]" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {isInvited ? 'Aktivasi Akun' : 'Daftar Akun'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isInvited ? 'Buat akun untuk mulai monitoring' : 'Buat akses untuk SkyWatch Dashboard'}
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 text-sm font-bold p-4 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full bg-[#F8F9FA] dark:bg-[#0a0f1a] border border-[#E2E8F0] dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Nama Anda"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  readOnly={isInvited && !!invitedEmail}
                  className={`w-full bg-[#F8F9FA] dark:bg-[#0a0f1a] border rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none transition-colors ${
                    isInvited && invitedEmail
                      ? 'border-[#4edea3]/40 text-[#4edea3] cursor-not-allowed opacity-80'
                      : 'border-[#E2E8F0] dark:border-white/10 focus:border-emerald-500'
                  }`}
                  placeholder="nama@email.com"
                />
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${isInvited && invitedEmail ? 'text-[#4edea3]' : 'text-slate-400'}`} size={18} />
              </div>
              {isInvited && invitedEmail && (
                <p className="text-[10px] text-[#4edea3]/70 ml-1">✓ Email terkunci sesuai undangan</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#F8F9FA] dark:bg-[#0a0f1a] border border-[#E2E8F0] dark:border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#4edea3] hover:bg-[#5cebb2] text-[#0a0f1a] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-6 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>{isInvited ? 'Aktivasi & Mulai Monitoring' : 'Mendaftar'} <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <p className="text-center mt-6 text-xs text-slate-500 font-bold">
            Sudah punya akun? <Link href="/login" className="text-emerald-600 dark:text-emerald-500 hover:underline">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070d1a] flex items-center justify-center"><div className="text-white animate-pulse">Memuat...</div></div>}>
      <RegisterForm />
    </Suspense>
  );
}

