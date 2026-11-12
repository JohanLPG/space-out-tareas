import Icon from './Icon.jsx';
import { formatDue, isOverdue } from '../utils/tasks.js';
import { transitionName } from '../utils/motion.js';

// Tarjeta del tablero: solo lo esencial. Todo lo demás vive en el panel de la tarea.
export default function TaskCard({ task, onOpen, onSetStatus, selected }) {
  const done = task.status === 'completada';
  const overdue = isOverdue(task);
  const tags = task.tags ?? [];

  return (
    <article
      className={`card card--${task.priority} ${done ? 'card--done' : ''} ${selected ? 'is-selected' : ''}`}
      style={{ viewTransitionName: transitionName(task.id) }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={() => onOpen(task.id)}
      onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && onOpen(task.id)}
      tabIndex={0}
      aria-label={`${task.title}. Abrir detalles`}
    >
      <div className="card__top">
        <button
          className={`check ${done ? 'is-checked' : ''}`}
          onClick={(e) => { e.stopPropagation(); onSetStatus(task.id, done ? 'pendiente' : 'completada'); }}
          aria-label={done ? `Marcar «${task.title}» como pendiente` : `Marcar «${task.title}» como completada`}
          aria-pressed={done}
        >
          <Icon name="check" size={13} strokeWidth={2.4} />
        </button>
        <h3 className="card__title">{task.title}</h3>
      </div>

      <div className="card__meta">
        {task.priority === 'alta' && !done && <span className="tag tag--alta"><span className="prio-dot prio-dot--alta" /> Alta</span>}
        <span className={`due ${overdue ? 'due--late' : ''}`}>
          <Icon name="calendar" size={13} /> {overdue ? `Vencida · ${formatDue(task.dueDate)}` : formatDue(task.dueDate)}
        </span>
        {tags.slice(0, 2).map((tag) => <span key={tag} className="tagchip">#{tag}</span>)}
        {tags.length > 2 && <span className="tagchip">+{tags.length - 2}</span>}
        {task.description && <Icon name="text" size={14} className="card__notes" aria-label="Tiene notas" />}
      </div>
    </article>
  );
}
