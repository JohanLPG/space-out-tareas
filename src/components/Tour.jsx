import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

const STEPS = [
  { target: 'create', title: 'Crea en segundos', text: 'Escribe la tarea como la dirías: «Entregar informe el viernes !alta #tesis». Atajo: N.' },
  { target: 'nav-hoy', title: 'Hoy', text: 'Tu día de un vistazo: lo que toca hoy y tu siguiente paso.' },
  { target: 'nav-tablero', title: 'Tablero', text: 'Arrastra tus tareas entre Pendiente, En progreso y Completada.' },
  { target: 'nav-explorar', title: 'Explorar', text: 'Busca y filtra cualquier tarea, incluso las que ya terminaste.' },
  { target: 'nav-mapa', title: 'Mapa', text: 'Tus tareas como un mapa de ideas, agrupadas por etiqueta. Toca una para abrir su panel.' },
];
const CARD_W = 300;

const visibleTarget = (name) =>
  [...document.querySelectorAll(`[data-tour="${name}"]`)].find((el) => el.getClientRects().length > 0 && el.offsetParent !== null);

// Guía de bienvenida: ilumina cada parte de la navegación y explica para qué sirve.
export default function Tour({ onDone }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  const measure = useCallback(() => {
    const el = visibleTarget(STEPS[step].target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useLayoutEffect(measure, [measure]);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onDone();
      if (e.key === 'ArrowRight' || e.key === 'Enter') next();
    };
    window.addEventListener('resize', measure);
    document.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('resize', measure); document.removeEventListener('keydown', onKey); };
  });

  const last = step === STEPS.length - 1;
  function next() { if (last) onDone(); else setStep((s) => s + 1); }

  // La tarjeta se ubica al lado del elemento (barra lateral) o encima (barra inferior del celular).
  let cardStyle = { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  if (rect) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (rect.bottom > vh - 140) {
      cardStyle = { left: Math.min(Math.max(16, rect.left + rect.width / 2 - CARD_W / 2), vw - CARD_W - 16), bottom: vh - rect.top + 18 };
    } else {
      cardStyle = { left: Math.min(rect.right + 20, vw - CARD_W - 16), top: Math.max(16, Math.min(rect.top - 8, vh - 240)) };
    }
  }
  const s = STEPS[step];

  return (
    <div className="tour" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {rect && <div className="tour__spot" style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12 }} />}
      <div className="tour__card" style={cardStyle} key={step}>
        <p className="tour__step">Paso {step + 1} de {STEPS.length}</p>
        <h3 id="tour-title">{s.title}</h3>
        <p className="tour__text">{s.text}</p>
        <div className="tour__foot">
          <span className="tour__dots" aria-hidden="true">{STEPS.map((_, i) => <i key={i} className={i === step ? 'is-on' : ''} />)}</span>
          {!last && <button className="link-btn" onClick={onDone}>Saltar</button>}
          <button className="btn btn--primary btn--sm tour__next" onClick={next} autoFocus>{last ? 'Empezar' : 'Siguiente'}</button>
        </div>
      </div>
    </div>
  );
}
