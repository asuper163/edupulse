// EDUPULSE — Arabic ONLY. The site was converted from bilingual to a single language (user command).
// No language switching exists in this codebase. Keys resolve from the Arabic bundle only.
import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import ar from './translations/ar';

const LanguageContext = createContext(null);
const LOCALE = 'ar-EG';

function resolveKey(bundle, key) {
  return key.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), bundle);
}

function interpolate(str, vars) {
  if (!vars || typeof str !== 'string') return str;
  return str.replace(/\{(\w+)\}/g, (_, name) => (vars[name] !== undefined ? String(vars[name]) : `{${name}}`));
}

export function LanguageProvider({ children }) {
  useEffect(() => {
    document.documentElement.lang = 'ar';
    document.documentElement.dir = 'rtl';
  }, []);

  const t = useCallback((key, vars) => {
    const value = resolveKey(ar, key);
    if (value === undefined) {
      if (import.meta.env.DEV) console.warn(`[i18n] Missing translation key: ${key}`);
      return key; // safe fallback — never crash, never blank
    }
    return interpolate(value, vars);
  }, []);

  const value = useMemo(() => ({ lang: 'ar', t, locale: LOCALE, dir: 'rtl', isRTL: true }), [t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
