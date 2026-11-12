import Icon from './Icon.jsx';
import { PRIORITIES, STATUSES } from '../utils/tasks.js';

const STATUS_OPTIONS = [{ id: 'todas', label: 'Todas' }, ...STATUSES];
const PRIORITY_OPTIONS = [{ id: 'todas', label: 'Toda prioridad' }, ...PRIORITIES];

// Componente "tonto": recibe los filtros por props y avisa los cambios al padre.
export default function FilterBar({ filters, onChange, shown, total, searchRef }) {
  const set = (key) => (value) => onChange({ [key]: value });

  return (
    <div className="filters">
      <label className="search">
        <Icon name="search" size={17} />
        <input
          ref={searchRef}
          type="search"
          value={filters.query}
          onChange={(e) => set('query')(e.target.value)}
          placeholder="Buscar por título o descripción"
          aria-label="Buscar tareas"
        />
        {!filters.query && <kbd className="kbd" title="Atajo de teclado">/</kbd>}
      </label>

      <div className="segmented" role="radiogroup" aria-label="Filtrar por estado">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.id}
            role="radio"
            aria-checked={filters.status === s.id}
            className={`segmented__item ${filters.status === s.id ? 'is-active' : ''}`}
            onClick={() => set('status')(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <select className="select" value={filters.priority} onChange={(e) => set('priority')(e.target.value)} aria-label="Filtrar por prioridad">
        {PRIORITY_OPTIONS.map((p) => <option key={p.id} value={p.id}>{p.id === 'todas' ? p.label : `Prioridad ${p.label.toLowerCase()}`}</option>)}
      </select>

      <select className="select" value={filters.sort} onChange={(e) => set('sort')(e.target.value)} aria-label="Ordenar tareas">
        <option value="vencimiento">Por vencimiento</option>
        <option value="prioridad">Por prioridad</option>
        <option value="recientes">Más recientes</option>
      </select>

      <p className="filters__count" aria-live="polite">
        {shown === total ? `${total} tareas` : `${shown} de ${total} tareas`}
      </p>
    </div>
  );
}
