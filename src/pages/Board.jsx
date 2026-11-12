import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.js';
import PageHeader from '../components/PageHeader.jsx';
import TaskColumn from '../components/TaskColumn.jsx';
import ActiveFilters from '../components/ActiveFilters.jsx';
import Popover, { MenuItem } from '../components/Popover.jsx';
import Icon from '../components/Icon.jsx';
import { filterTasks, PRIORITIES, STATUSES } from '../utils/tasks.js';
import { withTransition } from '../utils/motion.js';

const SORTS = [
  { id: 'vencimiento', label: 'Fecha de vencimiento' },
  { id: 'prioridad', label: 'Prioridad' },
  { id: 'recientes', label: 'Más recientes' },
];
const EMPTY = { query: '', status: 'todas', priority: 'todas', sort: 'vencimiento', day: '' };

// Los filtros pueden llegar por la URL (p. ej. desde "Hoy": /tablero?dia=vencidas).
const fromSearch = (search) => {
  const p = new URLSearchParams(search);
  return { ...EMPTY, query: p.get('q') ?? '', day: p.get('dia') ?? '', status: p.get('estado') ?? 'todas' };
};

export default function BoardRoute() {
  const { search } = useLocation();
  return <Board key={search} initial={fromSearch(search)} />;
}

function Board({ initial }) {
  const { tasks, openTask, changeStatus, openCreate, selectedId } = useWorkspace();
  const navigate = useNavigate();
  const [filters, setFilters] = useState(initial);

  const visible = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const hidden = useMemo(() => {
    if (!filters.query.trim()) return 0;
    return filterTasks(tasks, { ...filters, status: 'todas', priority: 'todas', day: '' }).length - visible.length;
  }, [tasks, filters, visible]);
  const columns = STATUSES.filter((s) => filters.status === 'todas' || s.id === filters.status);
  const menuCount = (filters.status !== 'todas') + (filters.priority !== 'todas');

  // Recibe solo lo que cambia y lo combina con el estado más reciente (evita que dos cambios rápidos se pisen).
  function update(patch) {
    const apply = () => setFilters((f) => ({ ...f, ...patch }));
    if ('query' in patch) apply();
    else withTransition(apply);
  }

  return (
    <>
      <PageHeader title="Tablero" sub="Arrastra las tarjetas para cambiar su estado. Toca una para ver sus detalles." />

      <div className="toolbar">
        <label className="search">
          <Icon name="search" size={17} />
          <input data-search type="search" value={filters.query} onChange={(e) => update({ query: e.target.value })} placeholder="Buscar en el tablero" aria-label="Buscar tareas" />
          {!filters.query && <kbd className="kbd">/</kbd>}
        </label>
        <Popover label="Filtros" icon="sliders" count={menuCount}>
          <p className="menu__title">Estado</p>
          {[{ id: 'todas', label: 'Todos' }, ...STATUSES].map((s) => (
            <MenuItem key={s.id} radio on={filters.status === s.id} onClick={() => update({ status: s.id })}>{s.label}</MenuItem>
          ))}
          <div className="menu__sep" />
          <p className="menu__title">Prioridad</p>
          {[{ id: 'todas', label: 'Todas' }, ...PRIORITIES].map((p) => (
            <MenuItem key={p.id} radio on={filters.priority === p.id} onClick={() => update({ priority: p.id })}>{p.label}</MenuItem>
          ))}
        </Popover>
        <Popover label="Ordenar" icon="shuffle">
          {SORTS.map((s) => <MenuItem key={s.id} radio on={filters.sort === s.id} onClick={() => update({ sort: s.id })}>{s.label}</MenuItem>)}
        </Popover>
        <span className="toolbar__count">{visible.length === tasks.length ? `${tasks.length} tareas` : `${visible.length} de ${tasks.length}`}</span>
      </div>

      <ActiveFilters
        filters={filters}
        onChange={update}
        onClear={() => update({ query: '', status: 'todas', priority: 'todas', day: '' })}
        hidden={hidden}
        onExplore={() => navigate(`/explorar?q=${encodeURIComponent(filters.query)}`)}
      />

      {tasks.length === 0 ? (
        <section className="empty">
          <h2>Tu tablero está en blanco.</h2>
          <p>Crea tu primera tarea y aparecerá en «Pendiente».</p>
          <button className="btn btn--primary" onClick={openCreate}><Icon name="plus" size={16} strokeWidth={2} /> Nueva tarea</button>
        </section>
      ) : (
        <div className={`board board--${columns.length}`}>
          {columns.map((s) => (
            <TaskColumn
              key={s.id}
              status={s.id}
              label={s.label}
              tasks={visible.filter((t) => t.status === s.id)}
              onDropTask={changeStatus}
              onOpen={openTask}
              onSetStatus={changeStatus}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </>
  );
}
