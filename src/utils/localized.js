// Localized text helpers (bilingual entities)
export const localized = (obj, lang) => {
  if (obj == null) return '';
  if (typeof obj === 'string') return obj;
  return obj[lang] ?? obj.ar ?? obj.en ?? '';
};
export const localizedList = (obj, lang) => {
  if (!obj) return [];
  const list = obj[lang] ?? obj.ar ?? obj.en ?? [];
  return Array.isArray(list) ? list.filter((x) => String(x).trim()) : [];
};
