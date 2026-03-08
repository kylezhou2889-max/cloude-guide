import { useState, useEffect } from 'react';
import type { Lang } from '@/i18n';
import { t } from '@/i18n';

export function useT() {
  const [lang, setLangState] = useState<Lang>(
    (localStorage.getItem('lang') as Lang) || 'zh',
  );

  useEffect(() => {
    const handler = (e: Event) => {
      setLangState((e as CustomEvent<Lang>).detail);
    };
    window.addEventListener('langchange', handler);
    return () => window.removeEventListener('langchange', handler);
  }, []);

  const setLang = (l: Lang) => {
    localStorage.setItem('lang', l);
    setLangState(l);
    window.dispatchEvent(new CustomEvent('langchange', { detail: l }));
  };

  return { strings: t[lang], lang, setLang };
}
