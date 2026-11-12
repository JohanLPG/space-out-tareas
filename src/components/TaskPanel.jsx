import { useEffect, useRef, useState } from 'react';
import Icon, { StatusGlyph } from './Icon.jsx';
import { useWorkspace } from '../context/WorkspaceContext.js';
import { formatDue, isOverdue, PRIORITIES, STATUSES, statusLabel } from '../utils/tasks.js';
import { parseTags } from '../utils/text.js';

const longDate = (iso) => (iso ? new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '') : '');

// Panel lateral de una tarea: se abre al tocarla en cualquier sección.
// Todo se edita ahí mismo (estilo Notion/Linear): estado, prioridad, fecha, etiquetas y notas.
export default function TaskPanel({ task, onClose }) {
  const { updateTask, changeStatus, requestDelete } = useWorkspace();
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.description ?? '');
  const [tagDraft, setTagDraft] = useState('');
  const ref = useRef(null);
  const tags = task.tags ?? [];
  const done = task.status === 'completada';
  const late = isOverdue(task);

  useEffect(() => { ref.current?.focus({ preventScroll: true }); }, []);

  const saveTitle = () => {
    const clean = title.trim();
    if (!clean) return setTitle(task.title);
    if (clean !== task.title) updateTask(task.id, { title: clean });
  };
  const saveNotes = () => {
    if (notes.trim() !== (task.description ?? '')) updateTask(task.id, { description: notes.trim() });
  };
  const addTags = () => {
    const next = parseTags(tagDraft);
    if (next.length) updateTask(task.id, { tags: [...new Set([...tags, ...next])] });
    setTagDraft('');
  };

  return (
    <>
      <div className="panel-scrim" onClick={onClose} aria-hidden="true" />
      <aside
        className="panel"
        role="dialog"
        aria-label={`Tarea: ${task.title}`}
        tabIndex={-1}
        ref={ref}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
      >
        <header className="panel__head">
          <span className={`pill pill--${task.status}`}><StatusGlyph status={task.status} size={11} /> {statusLabel(task.status)}</span>
          <div className="panel__tools">
            <button className="icon-btn icon-btn--danger" onClick={() => requestDelete(task)} aria-label="Eliminar tarea" title="Eliminar">
              <Icon name="trash" />
            </button>
            <button className="icon-btn" onClick={onClose} aria-label="Cerrar panel" title="Cerrar (Esc)"><Icon name="close" /></button>
          </div>
        </header>

        <div className="panel__body">
          <textarea
            className="panel__title"
            value={title}
            rows={1}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); } }}
            aria-label="Título de la tarea"
          />

          <dl className="props">
            <div className="prop">
              <dt><Icon name="circle" size={16} /> Estado</dt>
              <dd className="seg">
                {STATUSES.map((s) => (
                  <button key={s.id} className={`seg__item ${task.status === s.id ? 'is-on' : ''}`} aria-pressed={task.status === s.id} onClick={() => changeStatus(task.id, s.id)}>
                    <StatusGlyph status={s.id} size={11} /> {s.label}
                  </button>
                ))}
              </dd>
            </div>
            <div className="prop">
              <dt><Icon name="flag" size={16} /> Prioridad</dt>
              <dd className="seg">
                {PRIORITIES.map((p) => (
                  <button key={p.id} className={`seg__item ${task.priority === p.id ? 'is-on' : ''}`} aria-pressed={task.priority === p.id} onClick={() => updateTask(task.id, { priority: p.id })}>
                    <span className={`prio-dot prio-dot--${p.id}`} /> {p.label}
                  </button>
                ))}
              </dd>
            </div>
            <div className="prop">
              <dt><Icon name="calendar" size={16} /> Vence</dt>
              <dd className="prop__date">
                <input type="date" value={task.dueDate} onChange={(e) => e.target.value && updateTask(task.id, { dueDate: e.target.value })} aria-label="Fecha de vencimiento" />
                <span className={late ? 'is-late' : ''}>{late ? `Vencida · ${formatDue(task.dueDate)}` : formatDue(task.dueDate)}</span>
              </dd>
            </div>
            <div className="prop">
              <dt><Icon name="tag" size={16} /> Etiquetas</dt>
              <dd className="tags-edit">
                {tags.map((t) => (
                  <span key={t} className="tagchip">
                    #{t}
                    <button onClick={() => updateTask(task.id, { tags: tags.filter((x) => x !== t) })} aria-label={`Quitar etiqueta ${t}`}>×</button>
                  </span>
                ))}
                <input
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTags(); } }}
                  onBlur={addTags}
                  placeholder={tags.length ? 'Añadir…' : 'Añadir etiqueta'}
                  aria-label="Añadir etiqueta"
                />
              </dd>
            </div>
          </dl>

          <label className="panel__notes">
            <span><Icon name="text" size={16} /> Notas</span>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={saveNotes} placeholder="Añade detalles, enlaces o pasos…" rows={4} maxLength={400} />
          </label>

          <p className="panel__meta">
            Creada el {longDate(task.createdAt)}{task.completedAt ? ` · Completada el ${longDate(task.completedAt)}` : ''}
          </p>
        </div>

        <footer className="panel__foot">
          <button className={`btn btn--block ${done ? 'btn--ghost' : 'btn--primary'}`} onClick={() => changeStatus(task.id, done ? 'pendiente' : 'completada')}>
            {done ? 'Reabrir tarea' : <><Icon name="check" size={17} strokeWidth={2.2} /> Marcar como completada</>}
          </button>
        </footer>
      </aside>
    </>
  );
}
