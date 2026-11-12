// Distribución del mapa: cada grupo es un "lóbulo" circular y sus tareas se acomodan
// en espiral de girasol (filotaxis), que llena el círculo de forma pareja y orgánica.
import { NO_TAG } from './explore.js';
import { priorityLabel, PRIORITIES, statusLabel, STATUSES } from './tasks.js';

export const GROUPINGS = {
  tag: {
    label: 'Etiqueta',
    keyOf: (t) => t.tags?.[0] ?? NO_TAG,
    nameOf: (k) => (k === NO_TAG ? 'Sin etiqueta' : `#${k}`),
    order: null,
  },
  status: { label: 'Estado', keyOf: (t) => t.status, nameOf: statusLabel, order: STATUSES.map((s) => s.id) },
  priority: {
    label: 'Prioridad',
    keyOf: (t) => t.priority,
    nameOf: (k) => `Prioridad ${priorityLabel(k).toLowerCase()}`,
    order: PRIORITIES.map((p) => p.id),
  },
};

const GOLDEN = Math.PI * (3 - Math.sqrt(5));
const SPACING = 31;
const GAP = 90;
const RANK = { en_progreso: 0, pendiente: 1, completada: 2 };
const WEIGHT = { alta: 0, media: 1, baja: 2 };

export function buildLayout(tasks, grouping) {
  const g = GROUPINGS[grouping];
  const groups = new Map();
  tasks.forEach((t) => {
    const key = g.keyOf(t);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  });

  const entries = [...groups.entries()];
  if (g.order) entries.sort((a, b) => g.order.indexOf(a[0]) - g.order.indexOf(b[0]));
  else entries.sort((a, b) => b[1].length - a[1].length || String(a[0]).localeCompare(String(b[0])));

  const clusters = entries.map(([key, list]) => ({
    key,
    name: g.nameOf(key),
    tasks: [...list].sort((a, b) => RANK[a.status] - RANK[b.status] || WEIGHT[a.priority] - WEIGHT[b.priority]),
    r: SPACING * Math.sqrt(list.length + 0.6) + 30,
  }));

  // Los grupos se reparten en un anillo con radio suficiente para que vecinos no se toquen.
  const n = clusters.length;
  if (n === 1) {
    clusters[0].x = 0;
    clusters[0].y = 0;
  } else if (n > 1) {
    let R = 0;
    clusters.forEach((c, i) => {
      const next = clusters[(i + 1) % n];
      R = Math.max(R, (c.r + next.r + GAP) / (2 * Math.sin(Math.PI / n)));
    });
    clusters.forEach((c, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      c.x = R * Math.cos(a);
      c.y = R * Math.sin(a);
    });
  }

  const positions = {};
  clusters.forEach((c) => {
    c.done = c.tasks.filter((t) => t.status === 'completada').length;
    c.tasks.forEach((t, i) => {
      const rr = SPACING * Math.sqrt(i + 0.5);
      const a = i * GOLDEN;
      positions[t.id] = { x: c.x + rr * Math.cos(a), y: c.y + rr * Math.sin(a) };
    });
  });

  // Enlaces: tareas que comparten una etiqueta quedan conectadas (en cadena, sin repetir pares).
  const links = [];
  const seen = new Set();
  const byTag = new Map();
  tasks.forEach((t) => (t.tags ?? []).forEach((tag) => {
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag).push(t.id);
  }));
  byTag.forEach((ids, tag) => {
    for (let i = 1; i < ids.length; i++) {
      const a = ids[i - 1];
      const b = ids[i];
      const id = a < b ? `${a}|${b}` : `${b}|${a}`;
      // Agrupando por etiqueta, los enlaces dentro del mismo lóbulo serían ruido: solo se dibujan los que cruzan.
      if (grouping === 'tag' && tag === (tasks.find((t) => t.id === a)?.tags?.[0]) && tag === (tasks.find((t) => t.id === b)?.tags?.[0])) continue;
      if (!seen.has(id)) { seen.add(id); links.push({ id, a, b, tag }); }
    }
  });

  return { clusters, positions, links };
}

export function bounds(clusters, positions) {
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  clusters.forEach((c) => {
    minX = Math.min(minX, c.x - c.r); maxX = Math.max(maxX, c.x + c.r);
    minY = Math.min(minY, c.y - c.r - 46); maxY = Math.max(maxY, c.y + c.r);
  });
  Object.values(positions).forEach((p) => {
    minX = Math.min(minX, p.x - 20); maxX = Math.max(maxX, p.x + 20);
    minY = Math.min(minY, p.y - 20); maxY = Math.max(maxY, p.y + 20);
  });
  return { minX, minY, maxX, maxY };
}
