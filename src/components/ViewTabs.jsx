const VIEWS = [
  { id: 'tablero', label: 'Tablero', hint: 'Por estado' },
  { id: 'explorar', label: 'Explorar', hint: 'Busca y filtra todo' },
];

// Pestañas principales: el tablero del día a día y el explorador visual.
export default function ViewTabs({ view, onChange, total }) {
  return (
    <div className="views" role="tablist" aria-label="Vista">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          role="tab"
          aria-selected={view === v.id}
          className={`views__tab ${view === v.id ? 'is-active' : ''}`}
          onClick={() => onChange(v.id)}
        >
          <span className="views__label">{v.label}</span>
          <span className="views__hint">{v.id === 'tablero' ? `${total} tareas` : v.hint}</span>
        </button>
      ))}
      <span className="views__keys" aria-hidden="true"><kbd className="kbd">N</kbd> nueva <kbd className="kbd">/</kbd> buscar <kbd className="kbd">E</kbd> explorar</span>
    </div>
  );
}
