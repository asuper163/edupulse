// Locale-aware formatting helpers (ar-EG / en-US)
export function formatDate(iso, locale, opts = { year: 'numeric', month: 'long', day: 'numeric' }) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat(locale, opts).format(d);
}

export function formatDateTime(iso, locale) {
  return formatDate(iso, locale, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function formatNumber(n, locale) {
  return new Intl.NumberFormat(locale).format(Number(n || 0));
}

export function formatPercent(n, locale, digits = 0) {
  return new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: digits }).format(Number(n || 0) / 100);
}

// Price formatting — Egyptian Pounds (Arabic-only demo product)
export function formatPrice(n, locale = 'ar-EG') {
  const value = Math.max(0, Number(n) || 0);
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)} ج.م`;
}

export function finalPrice(course) {
  if (!course) return 0;
  const gross = Number(course.price) || 0;
  const discount = Number(course.discount) || 0;
  return Math.round(gross * (1 - discount / 100));
}

// ── EDUPULSE seed/catalog uses week-based duration (not minutes) ─────────────
export function formatWeeks(weeks) {
  const n = Math.max(0, Number(weeks) || 0);
  if (n === 0) return '—';
  if (n === 1) return 'أسبوع';
  if (n === 2) return 'أسبوعان';
  if (n <= 10) return `${n} أسابيع`;
  return `${n} أسبوع`;
}

export function formatDuration(minutes, lang) {
  const total = Math.max(0, Number(minutes || 0));
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (lang === 'ar') {
    if (h === 0) return `${m} دقيقة`;
    if (m === 0) return `${h} ساعة`;
    return `${h} ساعة و ${m} دقيقة`;
  }
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} hr`;
  return `${h} hr ${m} min`;
}

export function timeAgo(iso, locale) {
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return '';
  const diff = Date.now() - d;
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const units = [
    ['year', 31536000000], ['month', 2592000000], ['week', 604800000],
    ['day', 86400000], ['hour', 3600000], ['minute', 60000],
  ];
  for (const [unit, ms] of units) {
    if (Math.abs(diff) >= ms) return rtf.format(-Math.round(diff / ms), unit);
  }
  return rtf.format(0, 'minute');
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0600-\u06ff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || `item-${Date.now()}`;
}
