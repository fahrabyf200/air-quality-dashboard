"use client";
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Wind, Lock, Mail, ArrowRight, Loader2, UserCheck } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get('registered') === '1';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('skywatch_logged_in', 'true');
        if (data.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      } else {
        setError(data.error || 'Gagal login');
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-[#070d1a] p-6">
      <div className="w-full max-w-md">

        {/* Banner sukses registrasi */}
        {justRegistered && (
          <div className="mb-5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl p-4 flex items-start gap-3">
            <div className="p-2 bg-emerald-500/15 rounded-xl flex-shrink-0">
              <UserCheck size={18} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-1">Akun Berhasil Dibuat ✅</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Akun Anda sudah aktif. Silakan masuk untuk mulai monitoring.
              </p>
            </div>
          </div>
        )}

        <div className="bg-[#FFFFFF] dark:bg-[#0d1425] rounded-3xl p-8 shadow-2xl border border-[#E2E8F0] dark:border-white/10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#4edea3] flex items-center justify-center mb-4 shadow-[0px_4px_20px_rgba(0,0,0,0.05),0px_2px_6px_rgba(0,0,0,0.02)] shadow-emerald-500/20">
              <Wind size={32} className="text-[#0a0f1a]" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Selamat Datang</h1>
            <p className="text-sm text-slate-500 mt-1">Masuk ke SkyWatch Dashboard</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold p-4 rounded-xl mb-6 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#F8F9FA] dark:bg-[#0a0f1a] border border-[#E2E8F0] dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="nama@email.com"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-[#1E293B] dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#F8F9FA] dark:bg-[#0a0f1a] border border-[#E2E8F0] dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#4edea3] hover:bg-[#5cebb2] text-[#0a0f1a] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>Masuk <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <p className="text-center text-xs text-slate-500 font-bold">
              Belum punya akun?{' '}
              <Link href="/register" className="text-emerald-500 hover:underline">Daftar sekarang</Link>
            </p>

            {/* Banner undangan */}
            <div className="border-t border-slate-100 dark:border-white/5 pt-4">
              <Link
                href="/register"
                className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#4edea3]/20 bg-[#4edea3]/5 hover:bg-[#4edea3]/10 transition-all group"
              >
                <div className="p-2 bg-[#4edea3]/15 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                  <UserCheck size={16} className="text-[#4edea3]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-black text-[#4edea3] uppercase tracking-wider">Menerima Undangan?</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Klik di sini dan gunakan email yang diundang untuk daftar →
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#070d1a] flex items-center justify-center">
        <div className="text-white animate-pulse text-sm">Memuat...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
