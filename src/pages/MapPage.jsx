import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useWorkspace } from '../context/WorkspaceContext.js';
import TaskCanvas from '../components/TaskCanvas.jsx';
import Icon from '../components/Icon.jsx';
import { GROUPINGS } from '../utils/mapLayout.js';
import { KEYS, read, write } from '../services/storage.js';

// Sección "Mapa": el lienzo ocupa toda la pantalla; los controles flotan encima sin estorbar.
export default function MapPage() {
  const { user } = useAuth();
  const { tasks, openTask, selectedId } = useWorkspace();
  const [grouping, setGrouping] = useState('tag');
  const [query, setQuery] = useState('');
  const [hint, setHint] = useState(() => !read(KEYS.mapHint, false));

  const closeHint = () => { write(KEYS.mapHint, true); setHint(false); };

  return (
    <div className="mappage">
      <div className="mapbar">
        <div>
          <h1 className="phead__title phead__title--sm">Mapa</h1>
          <p className="phead__sub">Tus tareas como un mapa de ideas.</p>
        </div>
        <div className="mapbar__tools">
          <label className="search search--sm">
            <Icon name="search" size={16} />
            <input data-search type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Iluminar en el mapa…" aria-label="Buscar en el mapa" />
          </label>
          <div className="segmented" role="radiogroup" aria-label="Agrupar por">
            {Object.entries(GROUPINGS).map(([id, g]) => (
              <button key={id} role="radio" aria-checked={grouping === id} className={`segmented__item ${grouping === id ? 'is-active' : ''}`} onClick={() => setGrouping(id)}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mapstage">
        <TaskCanvas key={grouping} tasks={tasks} userId={user.id} grouping={grouping} query={query} selectedId={selectedId} onOpen={openTask} />
        {hint && tasks.length > 0 && (
          <div className="canvas__hint glass" role="note">
            <span><b>Arrastra</b> el fondo para moverte · <b>rueda</b> para acercar · <b>toca</b> un punto para abrirlo · <b>arrástralo</b> para reubicarlo</span>
            <button className="icon-btn icon-btn--sm" onClick={closeHint} aria-label="Entendido"><Icon name="close" size={14} /></button>
          </div>
        )}
      </div>
    </div>
  );
}
