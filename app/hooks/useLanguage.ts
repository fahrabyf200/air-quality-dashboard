import { useState, useEffect, useCallback } from "react";

export function useLanguage() {
  const [lang, setLang] = useState<'id' | 'en'>('id');

  useEffect(() => {
    const updateLang = () => {
      const cached = localStorage.getItem('skywatch_lang') as 'id' | 'en';
      if (cached && (cached === 'id' || cached === 'en')) {
        setLang(cached);
      }
    };
    updateLang();
    window.addEventListener('skywatch_lang_change', updateLang);
    return () => window.removeEventListener('skywatch_lang_change', updateLang);
  }, []);

  const t = useCallback((idText: string, enText: string) => lang === 'id' ? idText : enText, [lang]);

  return { lang, t };
}
