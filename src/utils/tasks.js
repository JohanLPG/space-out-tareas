import { fold } from './text.js';

export const STATUSES = [
  { id: 'pendiente', label: 'Pendiente' },
  { id: 'en_progreso', label: 'En progreso' },
  { id: 'completada', label: 'Completada' },
];

export const PRIORITIES = [
  { id: 'alta', label: 'Alta', weight: 0 },
  { id: 'media', label: 'Media', weight: 1 },
  { id: 'baja', label: 'Baja', weight: 2 },
];

export const statusLabel = (id) => STATUSES.find((s) => s.id === id)?.label ?? id;
export const priorityLabel = (id) => PRIORITIES.find((p) => p.id === id)?.label ?? id;

export function todayISO(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const parseISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const isOverdue = (task) => Boolean(task.dueDate) && task.status !== 'completada' && task.dueDate < todayISO();

export function formatDue(iso) {
  if (!iso) return 'Sin fecha';
  const diff = Math.round((parseISO(iso) - parseISO(todayISO())) / 86400000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Mañana';
  if (diff === -1) return 'Ayer';
  return parseISO(iso).toLocaleDateString('es', { day: 'numeric', month: 'short' }).replace('.', '');
}

// Búsqueda sin tildes ni mayúsculas ("reunion" encuentra "Reunión") en título, descripción y etiquetas.
// Acepta "#tesis" o "tesis" por igual.
export function taskMatches(task, query) {
  const q = fold(query.trim().replace(/^#/, ''));
  if (!q) return true;
  return fold(task.title).includes(q)
    || fold(task.description).includes(q)
    || (task.tags ?? []).some((tag) => fold(tag).includes(q));
}

export function filterTasks(tasks, { query, status, priority, sort, day = '' }) {
  const weight = (p) => PRIORITIES.find((x) => x.id === p)?.weight ?? 9;

  return tasks
    .filter((t) => taskMatches(t, query))
    .filter((t) => status === 'todas' || t.status === status)
    .filter((t) => priority === 'todas' || t.priority === priority)
    .filter((t) => !day || (day === 'vencidas' ? isOverdue(t) : t.dueDate === day))
    .sort((a, b) => {
      if (sort === 'prioridad') return weight(a.priority) - weight(b.priority) || (a.dueDate || '9').localeCompare(b.dueDate || '9');
      if (sort === 'recientes') return b.createdAt.localeCompare(a.createdAt);
      return (a.dueDate || '9999').localeCompare(b.dueDate || '9999') || weight(a.priority) - weight(b.priority);
    });
}
