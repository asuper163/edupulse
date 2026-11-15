import { useState } from 'react';

const PALETTE = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#14B8A6'];

export default function Avatar({ name = '', src = '', size = 40, className = '' }) {
  const [failed, setFailed] = useState(false);
  const initials = String(name).trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || '').join('') || '?';
  const hash = [...String(name)].reduce((a, c) => a + c.charCodeAt(0), 0);
  const bg = PALETTE[hash % PALETTE.length];
  const style = { width: size, height: size, fontSize: size * 0.38 };

  if (src && !failed) {
    return <img src={src} alt={name} width={size} height={size} onError={() => setFailed(true)} style={style} className={`rounded-full object-cover shrink-0 ring-1 ring-black/10 ${className}`} loading="lazy" />;
  }
  return (
    <span style={{ ...style, background: bg }} className={`rounded-full inline-flex items-center justify-center text-white font-bold select-none shrink-0 ring-1 ring-black/10 ${className}`} aria-hidden="true">
      {initials}
    </span>
  );
}
