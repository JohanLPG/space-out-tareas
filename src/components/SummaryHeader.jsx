import { isOverdue } from '../utils/tasks.js';
import AnimatedNumber from './AnimatedNumber.jsx';

// Saludo + métricas del día calculadas a partir de todas las tareas del usuario.
export default function SummaryHeader({ name, tasks }) {
  const count = (s) => tasks.filter((t) => t.status === s).length;
  const pending = count('pendiente');
  const progress = count('en_progreso');
  const done = count('completada');
  const late = tasks.filter(isOverdue).length;
  const open = pending + progress;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const first = name.split(' ')[0];

  const today = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <section className="summary">
      <div className="summary__text">
        <p className="eyebrow">{today}</p>
        <h1 className="summary__headline">
          Hola, {first}.{' '}
          {open === 0
            ? <em>Todo está en orden.</em>
            : <em>{open === 1 ? 'Te queda 1 tarea' : `Te quedan ${open} tareas`} por mover.</em>}
        </h1>
      </div>
      <dl className="stats">
        <div><dt>Pendientes</dt><dd><AnimatedNumber value={pending} /></dd></div>
        <div><dt>En progreso</dt><dd><AnimatedNumber value={progress} /></dd></div>
        <div><dt>Completadas</dt><dd><AnimatedNumber value={done} /></dd></div>
        <div className={late ? 'stats__late' : ''}><dt>Vencidas</dt><dd><AnimatedNumber value={late} /></dd></div>
        <div className="stats__bar" aria-label={`${pct}% completado`}>
          <span className="stats__fill" style={{ width: `${pct}%` }} />
          <small><AnimatedNumber value={pct} />% completado</small>
        </div>
      </dl>
    </section>
  );
}
