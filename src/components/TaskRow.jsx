import Icon from './Icon.jsx';
import { formatDue, isOverdue } from '../utils/tasks.js';

// Fila compacta (lista de "Hoy"): tocarla abre el panel de la tarea.
export default function TaskRow({ task, index = 0, onOpen, onSetStatus, selected }) {
  const done = task.status === 'completada';
  const late = isOverdue(task);
  return (
    <div
      className={`row ${done ? 'is-done' : ''} ${selected ? 'is-selected' : ''}`}
      style={{ '--i': Math.min(index, 12) }}
      onClick={() => onOpen(task.id)}
      onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && onOpen(task.id)}
      role="button"
      tabIndex={0}
      aria-label={`${task.title}. Abrir detalles`}
    >
      <button
        className={`check ${done ? 'is-checked' : ''}`}
        onClick={(e) => { e.stopPropagation(); onSetStatus(task.id, done ? 'pendiente' : 'completada'); }}
        aria-label={done ? `Marcar «${task.title}» como pendiente` : `Marcar «${task.title}» como completada`}
        aria-pressed={done}
      >
        <Icon name="check" size={13} strokeWidth={2.4} />
      </button>
      <div className="row__main">
        <span className="row__title">{task.title}</span>
        <span className="row__meta">
          {task.priority === 'alta' && <span className="row__prio"><span className="prio-dot prio-dot--alta" /> Alta</span>}
          <span className={late ? 'is-late' : ''}>{late ? `Vencida · ${formatDue(task.dueDate)}` : formatDue(task.dueDate)}</span>
          {(task.tags ?? []).slice(0, 3).map((t) => <span key={t}>#{t}</span>)}
        </span>
      </div>
      <Icon name="chevronRight" size={18} className="row__chev" />
    </div>
  );
}
