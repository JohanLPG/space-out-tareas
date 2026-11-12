import Icon from './Icon.jsx';
import { priorityLabel, statusLabel, todayISO } from '../utils/tasks.js';

const dayLabel = (day) => {
  if (day === 'vencidas') return 'Vencidas';
  if (day === todayISO()) return 'Hoy';
  const [y, m, d] = day.split('-').map(Number);
  const label = new Date(y, m - 1, d).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'short' }).replace('.', '');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// Muestra SIEMPRE qué filtros están activos en el tablero (para que nada quede escondido sin saberlo)
// y avisa si la búsqueda encontró tareas que esos filtros están ocultando.
export default function ActiveFilters({ filters, onChange, onClear, hidden, onExplore }) {
  const chips = [];
  if (filters.query.trim()) chips.push({ key: 'query', label: `«${filters.query.trim()}»`, reset: { query: '' } });
  if (filters.status !== 'todas') chips.push({ key: 'status', label: statusLabel(filters.status), reset: { status: 'todas' } });
  if (filters.priority !== 'todas') chips.push({ key: 'priority', label: `Prioridad ${priorityLabel(filters.priority).toLowerCase()}`, reset: { priority: 'todas' } });
  if (filters.day) chips.push({ key: 'day', label: dayLabel(filters.day), reset: { day: '' } });

  if (chips.length === 0) return null;

  return (
    <div className="active">
      <div className="active__row">
        <span className="active__label">Filtrando por</span>
        {chips.map((c) => (
          <button key={c.key} className="active__chip" onClick={() => onChange(c.reset)} aria-label={`Quitar filtro ${c.label}`}>
            {c.label} <Icon name="close" size={12} strokeWidth={2.2} />
          </button>
        ))}
        {chips.length > 1 && <button className="link-btn" onClick={onClear}>Quitar todos</button>}
      </div>
      {hidden > 0 && (
        <div className="active__notice" role="status">
          <span><b>{hidden === 1 ? '1 tarea más coincide' : `${hidden} tareas más coinciden`}</b> con «{filters.query.trim()}», pero los otros filtros la{hidden === 1 ? '' : 's'} ocultan.</span>
          <button className="btn btn--primary btn--sm" onClick={() => onChange({ status: 'todas', priority: 'todas', day: '' })}>Mostrar todas</button>
          <button className="link-btn" onClick={onExplore}>Abrir en Explorar →</button>
        </div>
      )}
    </div>
  );
}
