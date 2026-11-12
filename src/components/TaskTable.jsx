import { useMemo, useState } from 'react';
import Icon, { StatusGlyph } from './Icon.jsx';
import Highlight from './Highlight.jsx';
import { formatDue, isOverdue, PRIORITIES, priorityLabel, statusLabel, STATUSES } from '../utils/tasks.js';
import { fold } from '../utils/text.js';

const COLUMNS = [
  { id: 'title', label: 'Tarea' },
  { id: 'status', label: 'Estado' },
  { id: 'priority', label: 'Prioridad' },
  { id: 'dueDate', label: 'Vence' },
];
const ORDER = {
  title: (t) => fold(t.title),
  status: (t) => STATUSES.findIndex((s) => s.id === t.status),
  priority: (t) => PRIORITIES.find((p) => p.id === t.priority)?.weight ?? 9,
  dueDate: (t) => t.dueDate || '9999',
};

// Vista de tabla: ordenable por columna, con lo buscado resaltado.
export default function TaskTable({ tasks, query, onEdit, onSetStatus, onTag }) {
  const [sort, setSort] = useState({ key: 'dueDate', dir: 1 });

  const rows = useMemo(() => {
    const key = ORDER[sort.key];
    return [...tasks].sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * sort.dir);
  }, [tasks, sort]);

  const toggleSort = (key) => setSort((s) => ({ key, dir: s.key === key ? -s.dir : 1 }));
  const q = fold(query.trim().replace(/^#/, ''));

  if (rows.length === 0) {
    return (
      <div className="tbl-empty">
        <p className="tbl-empty__title">Nada coincide.</p>
        <p>Prueba con otra palabra o quita alguno de los filtros de arriba.</p>
      </div>
    );
  }

  return (
    <div className="tbl-wrap">
      <table className="tbl">
        <thead>
          <tr>
            <th className="tbl__check" aria-label="Completar" />
            {COLUMNS.map((c) => (
              <th key={c.id} className={`tbl__col tbl__col--${c.id}`} aria-sort={sort.key === c.id ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none'}>
                <button onClick={() => toggleSort(c.id)} className={sort.key === c.id ? 'is-sorted' : ''}>
                  {c.label}
                  <span className={`tbl__arrow ${sort.dir === -1 ? 'is-desc' : ''}`} aria-hidden="true">↑</span>
                </button>
              </th>
            ))}
            <th className="tbl__actions" aria-label="Acciones" />
          </tr>
        </thead>
        <tbody>
          {rows.map((t, i) => {
            const done = t.status === 'completada';
            const descHit = q && fold(t.description).includes(q);
            return (
              <tr key={t.id} className={done ? 'is-done' : ''} style={{ '--i': Math.min(i, 14) }} onDoubleClick={() => onEdit(t)}>
                <td className="tbl__check">
                  <button
                    className={`check ${done ? 'is-checked' : ''}`}
                    onClick={() => onSetStatus(t.id, done ? 'pendiente' : 'completada')}
                    aria-label={done ? `Marcar «${t.title}» como pendiente` : `Marcar «${t.title}» como completada`}
                    aria-pressed={done}
                  >
                    <Icon name="check" size={13} strokeWidth={2.4} />
                  </button>
                </td>
                <td className="tbl__col--title">
                  <span className="tbl__title"><Highlight text={t.title} query={query} /></span>
                  {t.description && (
                    <span className={`tbl__desc ${descHit ? 'is-hit' : ''}`}><Highlight text={t.description} query={query} /></span>
                  )}
                  {t.tags?.length > 0 && (
                    <span className="tbl__tags">
                      {t.tags.map((tag) => (
                        <button key={tag} className="tagchip tagchip--btn" onClick={() => onTag(tag)}>
                          #<Highlight text={tag} query={query} />
                        </button>
                      ))}
                    </span>
                  )}
                </td>
                <td className="tbl__col--status">
                  <span className={`pill pill--${t.status}`}><StatusGlyph status={t.status} size={11} /> {statusLabel(t.status)}</span>
                </td>
                <td className="tbl__col--priority">
                  <span className="tbl__prio"><span className={`prio-dot prio-dot--${t.priority}`} /> {priorityLabel(t.priority)}</span>
                </td>
                <td className={`tbl__col--dueDate ${isOverdue(t) ? 'is-late' : ''}`}>{formatDue(t.dueDate)}</td>
                <td className="tbl__actions">
                  <button className="icon-btn icon-btn--sm" onClick={() => onEdit(t)} aria-label={`Editar «${t.title}»`}>
                    <Icon name="edit" size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
