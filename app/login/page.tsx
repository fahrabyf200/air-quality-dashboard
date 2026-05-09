"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wind, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

      if (res.ok) {
        router.push('/');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Gagal login');
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#070d1a] p-6">
      <div className="w-full max-w-md bg-white dark:bg-[#0d1425] rounded-3xl p-8 shadow-2xl border border-slate-200 dark:border-white/10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#a3e635] flex items-center justify-center mb-4 shadow-lg shadow-lime-500/20">
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
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:border-lime-500 transition-colors"
                placeholder="nama@email.com"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-[#0a0f1a] border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-bold focus:outline-none focus:border-lime-500 transition-colors"
                placeholder="••••••••"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#a3e635] hover:bg-[#8ecb2f] text-[#0a0f1a] font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all mt-4 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>Masuk <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <p className="text-center mt-8 text-xs text-slate-500 font-bold">
          Belum punya akun? <Link href="/register" className="text-lime-500 hover:underline">Daftar sekarang</Link>
        </p>
      </div>
    </div>
  );
}
