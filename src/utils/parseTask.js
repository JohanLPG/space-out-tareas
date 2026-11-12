// "Escribe como hablas": convierte una frase en español en una tarea estructurada.
// Ej.: "Entregar informe el viernes !alta // con anexos"
//   → { title: "Entregar informe", dueDate: <viernes>, priority: "alta", description: "con anexos" }
// Devuelve además los "tokens" reconocidos (posición + tipo) para resaltarlos en vivo.
import { todayISO } from './tasks.js';
import { fold } from './text.js';

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const word = (src) => new RegExp(`(?<![a-z0-9!#])(?:${src})(?![a-z0-9])`);

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const addDays = (base, n) => { const d = new Date(base); d.setDate(d.getDate() + n); return d; };
const nextWeekday = (base, target, strict) => {
  let diff = (target - base.getDay() + 7) % 7;
  if (strict && diff === 0) diff = 7;
  return addDays(base, diff);
};
const safeDate = (y, m, d) => {
  const date = new Date(y, m, d);
  return date.getMonth() === m && date.getDate() === d ? date : null;
};
const monthDay = (now, day, month) => {
  const date = safeDate(now.getFullYear(), month, day);
  if (!date) return null;
  return date < now ? safeDate(now.getFullYear() + 1, month, day) : date;
};

const DATE_RULES = [
  [word('pasado manana'), (m, now) => addDays(now, 2)],
  [word('manana'), (m, now) => addDays(now, 1)],
  [word('hoy'), (m, now) => now],
  [word('en (\\d{1,2}) (dias?|semanas?)'), (m, now) => addDays(now, Number(m[1]) * (m[2].startsWith('semana') ? 7 : 1))],
  [word('(?:la )?(?:proxima|siguiente) semana'), (m, now) => nextWeekday(now, 1, true)],
  [word('(?:el |este )?fin de semana'), (m, now) => nextWeekday(now, 6, false)],
  [word('(?:el |este |(?:el )?proximo )?(lunes|martes|miercoles|jueves|viernes|sabado|domingo)'),
    (m, now) => nextWeekday(now, WEEKDAYS.indexOf(m[1]), m[0].includes('proximo'))],
  [word(`(\\d{1,2}) (?:de )?(${MONTHS.join('|')})[a-z]*`), (m, now) => monthDay(now, Number(m[1]), MONTHS.indexOf(m[2]))],
  [word('(\\d{1,2})/(\\d{1,2})(?:/(\\d{2,4}))?'), (m, now) => m[3]
    ? safeDate(Number(m[3].length === 2 ? `20${m[3]}` : m[3]), Number(m[2]) - 1, Number(m[1]))
    : monthDay(now, Number(m[1]), Number(m[2]) - 1)],
];

const PRIORITY_RE = word('!alta|!media|!baja|!!!|!!|!a|!m|!b|!|urgente');
const PRIORITY_MAP = { '!alta': 'alta', '!!!': 'alta', '!a': 'alta', urgente: 'alta', '!media': 'media', '!!': 'media', '!m': 'media', '!baja': 'baja', '!b': 'baja', '!': 'baja' };

const STATUS_RE = word('#(?:en progreso|progreso|empezada|haciendo|completada|hecha|lista|pendiente)');
const STATUS_MAP = { pendiente: 'pendiente', completada: 'completada', hecha: 'completada', lista: 'completada' };
// Cualquier otra #palabra es una etiqueta: #tesis, #universidad, #casa…
const TAG_RE = /(?<![a-z0-9!#])#([a-z0-9_-]+)/g;

const TRAILING = /\s+(?:para|antes de|antes del|hasta|el|la|de|del|en|a)$/i;

export function parseTask(text, now = startOfToday()) {
  const noteAt = text.indexOf('//');
  const head = noteAt === -1 ? text : text.slice(0, noteAt);
  const folded = fold(head);
  const tokens = [];
  const result = { title: '', description: '', dueDate: '', priority: '', status: '', tags: [], tokens };

  for (const [re, toDate] of DATE_RULES) {
    const m = folded.match(re);
    const date = m && toDate(m, now);
    if (date) {
      result.dueDate = todayISO(date);
      tokens.push({ start: m.index, end: m.index + m[0].length, type: 'date' });
      break;
    }
  }

  const p = folded.match(PRIORITY_RE);
  if (p) {
    result.priority = PRIORITY_MAP[p[0]];
    tokens.push({ start: p.index, end: p.index + p[0].length, type: 'priority' });
  }

  const s = folded.match(STATUS_RE);
  if (s) {
    result.status = STATUS_MAP[s[0].slice(1)] ?? 'en_progreso';
    tokens.push({ start: s.index, end: s.index + s[0].length, type: 'status' });
  }

  for (const m of folded.matchAll(TAG_RE)) {
    if (s && m.index === s.index) continue; // ya es el estado
    const tag = head.slice(m.index + 1, m.index + m[0].length).toLowerCase();
    if (!result.tags.includes(tag)) result.tags.push(tag);
    tokens.push({ start: m.index, end: m.index + m[0].length, type: 'tag' });
  }

  if (noteAt !== -1) {
    result.description = text.slice(noteAt + 2).trim();
    tokens.push({ start: noteAt, end: text.length, type: 'note' });
  }

  tokens.sort((a, b) => a.start - b.start);

  // El título es lo que queda al quitar los fragmentos reconocidos.
  let title = '';
  let i = 0;
  for (const t of tokens) {
    title += head.slice(i, Math.min(t.start, head.length)) + ' ';
    i = t.end;
  }
  title += head.slice(Math.min(i, head.length));
  title = title.replace(/\s+/g, ' ').trim();
  while (TRAILING.test(title)) title = title.replace(TRAILING, '');
  result.title = title.charAt(0).toUpperCase() + title.slice(1);

  return result;
}

export const EXAMPLES = ['mañana', 'el viernes', 'en 3 días', '15 nov', '!alta', '#tesis', '#progreso', '// nota'];
