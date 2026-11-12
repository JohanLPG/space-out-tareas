import Icon, { StatusGlyph } from './Icon.jsx';
import { formatDue, isOverdue, priorityLabel, STATUSES } from '../utils/tasks.js';
import { transitionName } from '../utils/motion.js';

export default function TaskCard({ task, onEdit, onDelete, onSetStatus, onTag }) {
  const done = task.status === 'completada';
  const overdue = isOverdue(task);
  const nextIndex = STATUSES.findIndex((s) => s.id === task.status) + 1;
  const next = STATUSES[nextIndex];

  return (
    <article
      className={`card card--${task.priority} ${done ? 'card--done' : ''}`}
      style={{ viewTransitionName: transitionName(task.id) }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
    >
      <div className="card__top">
        <button
          className={`check ${done ? 'is-checked' : ''}`}
          onClick={() => onSetStatus(task.id, done ? 'pendiente' : 'completada')}
          aria-label={done ? `Marcar «${task.title}» como pendiente` : `Marcar «${task.title}» como completada`}
          aria-pressed={done}
        >
          <Icon name="check" size={13} strokeWidth={2.4} />
        </button>
        <h3 className="card__title">{task.title}</h3>
      </div>

      {task.description && <p className="card__desc">{task.description}</p>}

      <div className="card__meta">
        <span className={`tag tag--${task.priority}`}>
          <span className={`prio-dot prio-dot--${task.priority}`} /> {priorityLabel(task.priority)}
        </span>
        <span className={`due ${overdue ? 'due--late' : ''}`} title={task.dueDate}>
          <Icon name="calendar" size={14} /> {overdue ? `Vencida · ${formatDue(task.dueDate)}` : formatDue(task.dueDate)}
        </span>
        {task.tags?.map((tag) => (
          <button key={tag} className="tagchip tagchip--btn" onClick={() => onTag?.(tag)} title={`Ver todo lo de #${tag}`}>#{tag}</button>
        ))}
      </div>

      <footer className="card__actions">
        {next && !done ? (
          <button className="link-btn" onClick={() => onSetStatus(task.id, next.id)}>
            <StatusGlyph status={next.id} size={12} /> {next.id === 'completada' ? 'Completar' : 'Empezar'}
          </button>
        ) : (
          <button className="link-btn" onClick={() => onSetStatus(task.id, 'pendiente')}>
            <StatusGlyph status="pendiente" size={12} /> Reabrir
          </button>
        )}
        <div className="card__icons">
          <button className="icon-btn icon-btn--sm" onClick={() => onEdit(task)} aria-label={`Editar «${task.title}»`}>
            <Icon name="edit" size={16} />
          </button>
          <button className="icon-btn icon-btn--sm icon-btn--danger" onClick={() => onDelete(task)} aria-label={`Eliminar «${task.title}»`}>
            <Icon name="trash" size={16} />
          </button>
        </div>
      </footer>
    </article>
  );
}
