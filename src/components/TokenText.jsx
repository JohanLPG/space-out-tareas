import Icon, { StatusGlyph } from './Icon.jsx';
import { priorityLabel, statusLabel } from '../utils/tasks.js';

// Pinta el texto con los fragmentos reconocidos resaltados (fecha, prioridad, estado, nota).
export function TokenText({ text, tokens }) {
  const out = [];
  let i = 0;
  tokens.forEach((t, k) => {
    if (t.start > i) out.push(text.slice(i, t.start));
    out.push(<mark key={k} className={`tok tok--${t.type}`}>{text.slice(t.start, t.end)}</mark>);
    i = t.end;
  });
  out.push(text.slice(i));
  return <>{out}</>;
}

const longDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '');
};

// Vista previa de cómo quedará la tarea: título + chips con lo que se entendió.
export function ParsedChips({ parsed, defaultDate }) {
  const date = parsed.dueDate || defaultDate;
  return (
    <ul className="chips">
      {date && (
        <li className={`chip chip--date ${parsed.dueDate ? 'is-on' : ''}`}>
          <Icon name="calendar" size={13} /> {longDate(date)}
        </li>
      )}
      {parsed.priority && (
        <li className="chip chip--priority is-on">
          <span className={`prio-dot prio-dot--${parsed.priority}`} /> {priorityLabel(parsed.priority)}
        </li>
      )}
      {parsed.status && (
        <li className="chip chip--status is-on">
          <StatusGlyph status={parsed.status} size={11} /> {statusLabel(parsed.status)}
        </li>
      )}
      {parsed.tags?.map((tag) => <li key={tag} className="chip chip--tag is-on">#{tag}</li>)}
      {parsed.description && <li className="chip chip--note is-on">“{parsed.description}”</li>}
    </ul>
  );
}
