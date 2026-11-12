import { fold } from '../utils/text.js';

// Resalta cada aparición de la búsqueda dentro del texto (ignorando tildes y mayúsculas).
export default function Highlight({ text = '', query = '' }) {
  const q = fold(query.trim().replace(/^#/, ''));
  if (!q) return text;
  const folded = fold(text);
  const parts = [];
  let i = 0;
  let idx = folded.indexOf(q);
  while (idx !== -1) {
    parts.push(text.slice(i, idx));
    parts.push(<mark key={idx} className="hl">{text.slice(idx, idx + q.length)}</mark>);
    i = idx + q.length;
    idx = folded.indexOf(q, i);
  }
  parts.push(text.slice(i));
  return <>{parts}</>;
}
