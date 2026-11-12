import { useMemo, useState } from 'react';
import Icon, { StatusGlyph } from './Icon.jsx';
import TaskTable from './TaskTable.jsx';
import TaskMap from './TaskMap.jsx';
import { PRIORITIES, STATUSES } from '../utils/tasks.js';
import { activeCount, allTags, applyExplore, EMPTY_EXPLORE, facetCounts, NO_TAG, WHEN } from '../utils/explore.js';
import { withTransition } from '../utils/motion.js';

// Apartado "Explorar": encuentra cualquier tarea, de cualquier estado o fecha,
// combinando búsqueda + facetas con conteos en vivo, y la muestra como tabla o como mapa.
export default function Explorer({ tasks, onEdit, onSetStatus, searchRef, initial }) {
  const [filters, setFilters] = useState(() => ({
    ...EMPTY_EXPLORE,
    query: initial?.query ?? '',
    tags: initial?.tag ? [initial.tag] : [],
  }));
  const [mode, setMode] = useState('lista');

  const results = useMemo(() => applyExplore(tasks, filters), [tasks, filters]);
  const matched = useMemo(() => new Set(results.map((t) => t.id)), [results]);
  const tags = useMemo(() => allTags(tasks), [tasks]);
  const active = activeCount(filters);

  const toggle = (facet, value) => withTransition(() => setFilters((f) => ({
    ...f,
    [facet]: f[facet].includes(value) ? f[facet].filter((v) => v !== value) : [...f[facet], value],
  })));
  const clearFacet = (facet) => withTransition(() => setFilters((f) => ({ ...f, [facet]: [] })));
  const clearAll = () => withTransition(() => setFilters(EMPTY_EXPLORE));
  const onTag = (tag) => withTransition(() => setFilters((f) => ({ ...f, tags: [tag] })));

  const facets = [
    { id: 'status', title: 'Estado', options: STATUSES.map((s) => ({ id: s.id, label: s.label, icon: <StatusGlyph status={s.id} size={12} /> })) },
    { id: 'priority', title: 'Prioridad', options: PRIORITIES.map((p) => ({ id: p.id, label: p.label, icon: <span className={`prio-dot prio-dot--${p.id}`} /> })) },
    { id: 'when', title: 'Fecha', options: WHEN },
    {
      id: 'tags',
      title: 'Etiquetas',
      options: [...tags.map((t) => ({ id: t, label: `#${t}` })), { id: NO_TAG, label: 'Sin etiqueta' }],
    },
  ];

  return (
    <section className="explorer" aria-label="Explorar tareas">
      <label className="xsearch">
        <Icon name="search" size={20} />
        <input
          ref={searchRef}
          type="search"
          value={filters.query}
          onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
          placeholder="Busca lo que sea: tesis, #universidad, informe…"
          aria-label="Buscar en todas las tareas"
        />
        {filters.query
          ? <button className="icon-btn icon-btn--sm" onClick={() => setFilters((f) => ({ ...f, query: '' }))} aria-label="Borrar búsqueda"><Icon name="close" size={16} /></button>
          : <kbd className="kbd">/</kbd>}
      </label>

      <div className="facets">
        {facets.map((facet, fi) => {
          const counts = facetCounts(tasks, filters, facet.id);
          const max = Math.max(1, ...Object.values(counts));
          const selected = filters[facet.id];
          return (
            <div className="facet" key={facet.id} style={{ '--d': `${fi * 70}ms` }}>
              <div className="facet__head">
                <h3>{facet.title}</h3>
                {selected.length > 0 && <button className="facet__clear" onClick={() => clearFacet(facet.id)}>Quitar</button>}
              </div>
              <div className="facet__opts">
                {facet.options.map((o) => {
                  const n = counts[o.id] ?? 0;
                  const on = selected.includes(o.id);
                  if (facet.id === 'tags' && n === 0 && !on && o.id === NO_TAG) return null;
                  return (
                    <button
                      key={o.id}
                      className={`opt ${on ? 'is-on' : ''} ${n === 0 && !on ? 'is-empty' : ''}`}
                      aria-pressed={on}
                      onClick={() => toggle(facet.id, o.id)}
                    >
                      <span className="opt__bar" style={{ transform: `scaleX(${n / max})` }} />
                      <span className="opt__label">{o.icon}{o.label}</span>
                      <span className="opt__n">{n}</span>
                    </button>
                  );
                })}
                {facet.id === 'tags' && tags.length === 0 && (
                  <p className="facet__hint">Escribe <code>#tesis</code> al crear una tarea para agruparla aquí.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="explorer__bar">
        <p className="explorer__count">
          <strong>{results.length}</strong> de {tasks.length} tareas
          {active > 0 && <button className="link-btn explorer__reset" onClick={clearAll}>Limpiar todo</button>}
        </p>
        <div className="segmented" role="radiogroup" aria-label="Forma de ver los resultados">
          {[['lista', 'Lista'], ['mapa', 'Mapa']].map(([id, label]) => (
            <button key={id} role="radio" aria-checked={mode === id} className={`segmented__item ${mode === id ? 'is-active' : ''}`} onClick={() => withTransition(() => setMode(id))}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {mode === 'lista'
        ? <TaskTable tasks={results} query={filters.query} onEdit={onEdit} onSetStatus={onSetStatus} onTag={onTag} />
        : <TaskMap tasks={tasks} matched={matched} onEdit={onEdit} />}
    </section>
  );
}
