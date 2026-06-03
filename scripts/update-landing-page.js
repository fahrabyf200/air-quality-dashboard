const fs = require('fs');
const file = 'c:\\xampp\\htdocs\\air-quality-dashboard\\components\\landing-page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  'bg-[#070d1a] text-slate-100 min-h-screen relative font-sans selection:bg-[#4edea3]/30 selection:text-white',
  'bg-slate-50 dark:bg-[#070d1a] text-slate-900 dark:text-slate-100 min-h-screen relative font-sans selection:bg-[#4edea3]/30 selection:text-white transition-colors duration-300'
);

data = data.replace(
  "isScrolled \n          ? 'border-b border-white/10 bg-[#070d1a]/95 backdrop-blur-xl shadow-lg shadow-black/40 h-16' \n          : 'border-b border-white/5 bg-[#070d1a]/80 backdrop-blur-xl h-20'",
  "isScrolled \n          ? 'border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#070d1a]/95 backdrop-blur-xl shadow-lg shadow-slate-200/50 dark:shadow-black/40 h-16' \n          : 'border-b border-transparent dark:border-white/5 bg-slate-50/80 dark:bg-[#070d1a]/80 backdrop-blur-xl h-20'"
);

data = data.replace(
  '<h1 className="text-white font-black text-sm tracking-tight leading-none uppercase">SkyWatch</h1>',
  '<h1 className="text-slate-900 dark:text-white font-black text-sm tracking-tight leading-none uppercase">SkyWatch</h1>'
);
data = data.replace(
  '<h1 className="text-white font-black text-xs uppercase leading-none">SkyWatch</h1>',
  '<h1 className="text-slate-900 dark:text-white font-black text-xs uppercase leading-none">SkyWatch</h1>'
);

data = data.replace(
  '<nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-400">',
  '<nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">'
);

data = data.replace(
  'border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-wider text-slate-300 hover:text-white',
  'border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05] text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
);

data = data.replace(
  'border border-white/20 bg-[#070d1a] text-[10px] font-black uppercase tracking-widest text-white',
  'border border-slate-200 dark:border-white/20 bg-white dark:bg-[#070d1a] text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white'
);

data = data.replace(
  'border border-white/20 bg-white/[0.01] hover:bg-white/[0.05] flex items-center justify-center text-slate-300 hover:text-white',
  'border border-slate-200 dark:border-white/20 bg-white dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.05] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
);

data = data.replace('bg-[#070d1a]/98', 'bg-white/98 dark:bg-[#070d1a]/98');
data = data.replace('border-white/5', 'border-slate-200 dark:border-white/5');
data = data.replace('border border-white/10 flex items-center justify-center text-slate-400 hover:text-white', 'border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white');
data = data.replace('text-xs font-bold uppercase tracking-wider text-slate-400', 'text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400');
data = data.replace(/border-white\/\[0\.02\]/g, 'border-slate-100 dark:border-white/[0.02]');
data = data.replace('bg-white/[0.02] text-center text-xs font-black uppercase tracking-widest text-white', 'bg-white dark:bg-white/[0.02] text-center text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white');

data = data.replace('<h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-[1.08]" style={{ fontFamily: "\'Outfit\', sans-serif" }}>', '<h2 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.08]" style={{ fontFamily: "\'Outfit\', sans-serif" }}>');
data = data.replace('<p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">', '<p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">');

data = data.replace('border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.05] text-slate-300 hover:text-white', 'border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.05] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white');

data = data.replace(/<p className="text-2xl md:text-3xl font-black text-white"/g, '<p className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white"');

data = data.replace('rounded-[2.5rem] border border-white/10 p-6 bg-slate-900/60 backdrop-blur-3xl shadow-2xl', 'rounded-[2.5rem] border border-slate-200 dark:border-white/10 p-6 bg-white/60 dark:bg-slate-900/60 backdrop-blur-3xl shadow-2xl shadow-slate-200/50 dark:shadow-2xl');
data = data.replace('text-xs font-black uppercase tracking-wider text-white', 'text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white');
data = data.replace('text-[11px] text-slate-400 leading-relaxed', 'text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed');
data = data.replace('text-[10px] text-slate-500 font-mono', 'text-[10px] text-slate-500 dark:text-slate-500 font-mono');

data = data.replace('bg-slate-950/30 border-y border-white/5 relative', 'bg-slate-100 dark:bg-slate-950/30 border-y border-slate-200 dark:border-white/5 relative');
data = data.replace('<h3 className="text-3xl md:text-4xl font-black text-white tracking-tight"', '<h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight"');
data = data.replace('<p className="text-slate-400 text-sm">', '<p className="text-slate-600 dark:text-slate-400 text-sm">');

data = data.replace('bg-[#070d1a]/90 backdrop-blur-xl border-2 border-red-500/80', 'bg-white/90 dark:bg-[#070d1a]/90 backdrop-blur-xl border-2 border-red-500/80');
data = data.replace('text-slate-300 mb-6 font-bold text-xs md:text-sm leading-relaxed', 'text-slate-700 dark:text-slate-300 mb-6 font-bold text-xs md:text-sm leading-relaxed');
data = data.replace('text-slate-300 text-xs list-disc pl-5 space-y-1.5 font-medium', 'text-slate-700 dark:text-slate-300 text-xs list-disc pl-5 space-y-1.5 font-medium');

data = data.replace('rounded-[2rem] border border-white/10 overflow-hidden bg-[#0a1020]/90 shadow-2xl', 'rounded-[2rem] border border-slate-200 dark:border-white/10 overflow-hidden bg-white/90 dark:bg-[#0a1020]/90 shadow-xl dark:shadow-2xl');
data = data.replace('bg-slate-900/80 border-b border-white/5', 'bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/5');
data = data.replace('bg-white/[0.02] border-white/10 text-slate-400 hover:text-white', 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white');
data = data.replace('border border-white/10 hover:border-white/20 bg-white/[0.02] text-xs font-bold text-slate-400 hover:text-white', 'border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.02] text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white');

data = data.replace(/border-white\/10 hover:border-white\/20 bg-white\/\[0\.03\]/g, 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 bg-white dark:bg-white/[0.03] shadow-sm dark:shadow-none');
data = data.replace(/bg-white\/5 border border-white\/5/g, 'bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5');
data = data.replace(/text-2xl font-black text-white font-mono/g, 'text-2xl font-black text-slate-900 dark:text-white font-mono');

data = data.replace('bg-slate-900 border-t border-white/5', 'bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-white/5');
data = data.replace('uppercase tracking-wider text-white flex items-center', 'uppercase tracking-wider text-slate-900 dark:text-white flex items-center');
data = data.replace('bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white', 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-transparent');
data = data.replace(/bg-slate-950\/40 p-4\.5 rounded-2xl border border-white\/5/g, 'bg-white dark:bg-slate-950/40 p-4.5 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none');

data = data.replace(/<h3 className="text-3xl md:text-4xl font-black text-white tracking-tight"/g, '<h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight"');

data = data.replace(/border border-white\/5 p-8 bg-\[#0a1020\]\/40 backdrop-blur-md text-left hover:border-\[#4edea3\]\/30/g, 'border border-slate-200 dark:border-white/5 p-8 bg-white dark:bg-[#0a1020]/40 backdrop-blur-md text-left hover:border-[#4edea3]/50 dark:hover:border-[#4edea3]/30 shadow-sm hover:shadow-md dark:shadow-none');

data = data.replace(/text-lg font-black text-white mb-3/g, 'text-lg font-black text-slate-900 dark:text-white mb-3');
data = data.replace(/text-slate-400 text-xs leading-relaxed/g, 'text-slate-600 dark:text-slate-400 text-xs leading-relaxed');

data = data.replace('bg-slate-950/20 border-t border-white/5', 'bg-slate-100 dark:bg-slate-950/20 border-t border-slate-200 dark:border-white/5');

data = data.replace(/border border-white\/5 bg-\[#0a1020\]\/20/g, 'border border-slate-200 dark:border-white/5 bg-white dark:bg-[#0a1020]/20 shadow-sm dark:shadow-none');
data = data.replace(/text-xl font-black text-white/g, 'text-xl font-black text-slate-900 dark:text-white');
data = data.replace(/text-2xl font-black text-white/g, 'text-2xl font-black text-slate-900 dark:text-white');
data = data.replace(/hover:border-slate-700/g, 'hover:border-slate-300 dark:hover:border-slate-700');
data = data.replace('border-2 border-[#4edea3] bg-[#4edea3]/5', 'border-2 border-[#4edea3] bg-white dark:bg-[#4edea3]/5');

data = data.replace('border-t border-white/5', 'border-t border-slate-100 dark:border-white/5');
data = data.replace('border-t border-white/10', 'border-t border-slate-200 dark:border-white/10');

fs.writeFileSync(file, data, 'utf8');
console.log("Updated landing page!");
