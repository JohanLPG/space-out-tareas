import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useWorkspace } from '../context/WorkspaceContext.js';
import PageHeader from '../components/PageHeader.jsx';
import Popover, { MenuItem } from '../components/Popover.jsx';
import TaskTable from '../components/TaskTable.jsx';
import Icon, { StatusGlyph } from '../components/Icon.jsx';
import { PRIORITIES, STATUSES } from '../utils/tasks.js';
import { activeCount, allTags, applyExplore, EMPTY_EXPLORE, facetCounts, NO_TAG, WHEN } from '../utils/explore.js';
import { withTransition } from '../utils/motion.js';

const fromSearch = (search) => {
  const p = new URLSearchParams(search);
  return { ...EMPTY_EXPLORE, query: p.get('q') ?? '', tags: p.get('tag') ? [p.get('tag')] : [] };
};

export default function ExploreRoute() {
  const { search } = useLocation();
  return <Explore key={search} initial={fromSearch(search)} />;
}

// "Explorar": búsqueda global + filtros desplegables con conteos en vivo + tabla.
function Explore({ initial }) {
  const { tasks, openTask, changeStatus, selectedId } = useWorkspace();
  const [filters, setFilters] = useState(initial);

  const results = useMemo(() => applyExplore(tasks, filters), [tasks, filters]);
  const tags = useMemo(() => allTags(tasks), [tasks]);
  const active = activeCount(filters);

  const toggle = (facet, value) => withTransition(() => setFilters((f) => ({
    ...f,
    [facet]: f[facet].includes(value) ? f[facet].filter((v) => v !== value) : [...f[facet], value],
  })));

  const facets = [
    { id: 'status', label: 'Estado', options: STATUSES.map((s) => ({ id: s.id, label: <><StatusGlyph status={s.id} size={12} /> {s.label}</> })) },
    { id: 'priority', label: 'Prioridad', options: PRIORITIES.map((p) => ({ id: p.id, label: <><span className={`prio-dot prio-dot--${p.id}`} /> {p.label}</> })) },
    { id: 'when', label: 'Fecha', options: WHEN },
    { id: 'tags', label: 'Etiquetas', options: [...tags.map((t) => ({ id: t, label: `#${t}` })), { id: NO_TAG, label: 'Sin etiqueta' }] },
  ];

  return (
    <>
      <PageHeader title="Explorar" sub="Encuentra cualquier tarea: pendiente, en progreso o ya terminada." />

      <label className="xsearch">
        <Icon name="search" size={20} />
        <input
          data-search
          type="search"
          value={filters.query}
          onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
          placeholder="Busca lo que sea: tesis, informe, #universidad…"
          aria-label="Buscar en todas las tareas"
        />
        {filters.query
          ? <button className="icon-btn icon-btn--sm" onClick={() => setFilters((f) => ({ ...f, query: '' }))} aria-label="Borrar búsqueda"><Icon name="close" size={16} /></button>
          : <kbd className="kbd">/</kbd>}
      </label>

      <div className="facetbar">
        {facets.map((facet) => {
          const counts = facetCounts(tasks, filters, facet.id);
          return (
            <Popover key={facet.id} label={facet.label} count={filters[facet.id].length}>
              <p className="menu__title">{facet.label}</p>
              {facet.options.map((o) => (
                <MenuItem key={o.id} on={filters[facet.id].includes(o.id)} onClick={() => toggle(facet.id, o.id)} count={counts[o.id] ?? 0} empty={!counts[o.id]}>
                  {o.label}
                </MenuItem>
              ))}
              {facet.id === 'tags' && tags.length === 0 && <p className="menu__hint">Escribe <code>#tesis</code> al crear una tarea para agruparla.</p>}
            </Popover>
          );
        })}
        {active > 0 && <button className="link-btn facetbar__reset" onClick={() => withTransition(() => setFilters(EMPTY_EXPLORE))}>Limpiar todo</button>}
      </div>

      {tags.length > 0 && (
        <div className="quick" aria-label="Etiquetas">
          {tags.slice(0, 10).map((t) => {
            const on = filters.tags.includes(t);
            return (
              <button key={t} className={`quick__tag ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggle('tags', t)}>
                #{t}
              </button>
            );
          })}
        </div>
      )}

      <p className="results">
        <strong>{results.length}</strong> {results.length === 1 ? 'resultado' : 'resultados'}
        {active === 0 && <span> · todas tus tareas</span>}
      </p>

      <TaskTable tasks={results} query={filters.query} onOpen={openTask} onSetStatus={changeStatus} onTag={(t) => toggle('tags', t)} selectedId={selectedId} />
    </>
  );
}
