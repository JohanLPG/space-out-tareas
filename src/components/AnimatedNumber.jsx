import { useEffect, useRef, useState } from 'react';

// Número que "cuenta" hasta su nuevo valor (600 ms, ease-out).
export default function AnimatedNumber({ value }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);

  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    let raf;
    const tick = (t) => {
      const p = reduce ? 1 : Math.min(1, (t - t0) / 600);
      setShown(Math.round(start + (value - start) * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(raf); from.current = value; };
  }, [value]);

  return <span className="num">{shown}</span>;
}
