// Lógica del apartado "Explorar": filtros por facetas (estado, prioridad, fecha, etiqueta)
// con conteos dinámicos. Dentro de una faceta las opciones se suman (O); entre facetas se cruzan (Y).
import { taskMatches, todayISO } from './tasks.js';

export const NO_TAG = '__sin_etiqueta';

export const WHEN = [
  { id: 'vencidas', label: 'Vencidas' },
  { id: 'hoy', label: 'Hoy' },
  { id: 'semana', label: 'Próximos 7 días' },
  { id: 'despues', label: 'Más adelante' },
  { id: 'anteriores', label: 'Ya pasaron' },
];

const inDaysISO = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return todayISO(d);
};

export function whenOf(task) {
  const today = todayISO();
  if (!task.dueDate) return 'despues';
  if (task.dueDate < today) return task.status === 'completada' ? 'anteriores' : 'vencidas';
  if (task.dueDate === today) return 'hoy';
  return task.dueDate <= inDaysISO(7) ? 'semana' : 'despues';
}

const FACETS = {
  status: (t) => [t.status],
  priority: (t) => [t.priority],
  when: (t) => [whenOf(t)],
  tags: (t) => (t.tags?.length ? t.tags : [NO_TAG]),
};

export const EMPTY_EXPLORE = { query: '', status: [], priority: [], when: [], tags: [] };

function passes(task, filters, skipFacet) {
  if (!taskMatches(task, filters.query)) return false;
  return Object.entries(FACETS).every(([facet, valuesOf]) => {
    if (facet === skipFacet) return true;
    const selected = filters[facet];
    return selected.length === 0 || valuesOf(task).some((v) => selected.includes(v));
  });
}

export const applyExplore = (tasks, filters) => tasks.filter((t) => passes(t, filters));

// Cuántas tareas quedarían al elegir cada opción, respetando los demás filtros.
export function facetCounts(tasks, filters, facet) {
  const counts = {};
  for (const t of tasks) {
    if (!passes(t, filters, facet)) continue;
    for (const v of FACETS[facet](t)) counts[v] = (counts[v] ?? 0) + 1;
  }
  return counts;
}

export function allTags(tasks) {
  const freq = new Map();
  tasks.forEach((t) => (t.tags ?? []).forEach((tag) => freq.set(tag, (freq.get(tag) ?? 0) + 1)));
  return [...freq.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([tag]) => tag);
}

export const activeCount = (f) => f.status.length + f.priority.length + f.when.length + f.tags.length + (f.query.trim() ? 1 : 0);
