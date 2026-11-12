import { useEffect, useState } from 'react';
import { TokenText, ParsedChips } from './TokenText.jsx';
import { parseTask } from '../utils/parseTask.js';

const PHRASES = [
  'Entregar informe de laboratorio el viernes !alta',
  'Repasar para el parcial mañana #progreso',
  'Comprar materiales en 3 días // cartulina y marcadores',
];
const REDUCED = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Demostración en vivo en la pantalla de acceso: se escribe una frase y la app la entiende.
export default function TypingDemo() {
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(REDUCED ? PHRASES[0].length : 0);

  useEffect(() => {
    if (REDUCED) return;
    const full = PHRASES[index];
    const id = count < full.length
      ? setTimeout(() => setCount(count + 1), 38 + Math.random() * 45)
      : setTimeout(() => { setIndex((index + 1) % PHRASES.length); setCount(0); }, 2800);
    return () => clearTimeout(id);
  }, [index, count]);

  const text = PHRASES[index].slice(0, count);
  const parsed = parseTask(text);
  const done = count === PHRASES[index].length;

  return (
    <div className="demo" aria-hidden="true">
      <p className="demo__label">Escribe como hablas<span className="demo__sep">·</span>Space-out entiende</p>
      <div className="demo__line">
        <TokenText text={text} tokens={parsed.tokens} />
        <span className="demo__caret" />
      </div>
      <div className={`demo__result ${done ? 'is-done' : ''}`}>
        <span className="demo__title">{parsed.title || ' '}</span>
        <ParsedChips parsed={parsed} />
      </div>
    </div>
  );
}
