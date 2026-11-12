import { isOverdue, todayISO } from '../utils/tasks.js';

const MAX_DOTS = 5;

// Cinta "Tu semana": carga de trabajo de los próximos 7 días. Un clic filtra el tablero por ese día.
export default function WeekStrip({ tasks, selected, onSelect }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });
  const late = tasks.filter(isOverdue).length;
  const toggle = (value) => onSelect(selected === value ? '' : value);

  return (
    <nav className="week" aria-label="Tu semana">
      {late > 0 && (
        <button className={`week__day week__day--late ${selected === 'vencidas' ? 'is-active' : ''}`} onClick={() => toggle('vencidas')} aria-pressed={selected === 'vencidas'}>
          <span className="week__name">Vencidas</span>
          <span className="week__num">{late}</span>
          <span className="week__dots">{Array.from({ length: Math.min(late, MAX_DOTS) }, (_, i) => <i key={i} className="dot dot--late" />)}</span>
        </button>
      )}
      {days.map((d, i) => {
        const iso = todayISO(d);
        const dayTasks = tasks.filter((t) => t.dueDate === iso);
        const open = dayTasks.filter((t) => t.status !== 'completada').length;
        const done = dayTasks.length - open;
        const dots = [...Array(open).fill('open'), ...Array(done).fill('done')];
        const name = i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : d.toLocaleDateString('es', { weekday: 'short' }).replace('.', '');
        return (
          <button
            key={iso}
            className={`week__day ${i === 0 ? 'is-today' : ''} ${selected === iso ? 'is-active' : ''} ${dayTasks.length === 0 ? 'is-free' : ''}`}
            onClick={() => toggle(iso)}
            aria-pressed={selected === iso}
            aria-label={`${d.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}: ${open} por hacer, ${done} hechas`}
            style={{ '--i': i }}
          >
            <span className="week__name">{name}</span>
            <span className="week__num">{d.getDate()}</span>
            <span className="week__dots">
              {dots.slice(0, MAX_DOTS).map((k, j) => <i key={j} className={`dot dot--${k}`} />)}
              {dots.length > MAX_DOTS && <small>+{dots.length - MAX_DOTS}</small>}
              {dots.length === 0 && <small className="week__free">libre</small>}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
