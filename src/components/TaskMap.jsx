import { useMemo, useState } from 'react';
import { StatusGlyph } from './Icon.jsx';
import { formatDue, priorityLabel, statusLabel } from '../utils/tasks.js';
import { NO_TAG } from '../utils/explore.js';

const W = 1000;
const H = 700;
const CX = W / 2;
const CY = H / 2;
const RADIUS = { alta: 12, media: 9, baja: 6.5 };

// Distribuye las tareas alrededor de "nodos" de etiqueta, que a su vez orbitan el centro.
function buildLayout(tasks) {
  const groups = new Map();
  tasks.forEach((t) => {
    const key = t.tags?.[0] ?? NO_TAG;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(t);
  });
  const entries = [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
  const n = entries.length;
  const R = n === 1 ? 0 : Math.min(230, 130 + n * 16);

  const hubs = [];
  const nodes = [];
  const hubPos = {};
  entries.forEach(([key, list], i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    const hx = CX + R * Math.cos(a);
    const hy = CY + R * Math.sin(a);
    hubPos[key] = { x: hx, y: hy };
    hubs.push({ key, x: hx, y: hy, count: list.length, label: key === NO_TAG ? 'sin etiqueta' : `#${key}` });

    const k = list.length;
    const full = n === 1;
    const span = full ? 2 * Math.PI : Math.min(Math.PI * 1.5, Math.max(0.9, k * 0.45));
    list.forEach((task, j) => {
      const t = full ? j / k : k === 1 ? 0.5 : j / (k - 1);
      const ang = a - (full ? 0 : span / 2) + span * t;
      const r = (full ? 120 : 74) + (k > 7 ? (j % 2) * 36 : 0);
      nodes.push({ task, hub: key, x: hx + r * Math.cos(ang), y: hy + r * Math.sin(ang) });
    });
  });

  // Tareas con varias etiquetas: enlaces secundarios hacia sus otros nodos.
  const extra = [];
  nodes.forEach((nd) => (nd.task.tags ?? []).slice(1).forEach((tag) => {
    if (hubPos[tag]) extra.push({ id: `${nd.task.id}-${tag}`, task: nd.task.id, x1: nd.x, y1: nd.y, x2: hubPos[tag].x, y2: hubPos[tag].y });
  }));
  return { hubs, nodes, extra };
}

const curve = (x1, y1, x2, y2) => {
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.12;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.12;
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
};

// Vista "Mapa": cada punto es una tarea agrupada por etiqueta.
// Lo que coincide con la búsqueda/filtros se ilumina; el resto se atenúa.
export default function TaskMap({ tasks, matched, onEdit }) {
  const [hover, setHover] = useState(null);
  const { hubs, nodes, extra } = useMemo(() => buildLayout(tasks), [tasks]);
  const filtering = matched.size !== tasks.length;
  const showLabels = filtering && matched.size <= 6;
  const hovered = nodes.find((n) => n.task.id === hover);
  const hubLit = (key) => !filtering || nodes.some((n) => n.hub === key && matched.has(n.task.id));

  if (tasks.length === 0) return <div className="tbl-empty"><p className="tbl-empty__title">Aún no hay tareas para dibujar.</p></div>;

  return (
    <div className="map">
      <div className="map__scroll">
        <svg viewBox={`0 0 ${W} ${H}`} className="map__svg" role="img" aria-label="Mapa de tareas agrupadas por etiqueta">
          <g className="map__links">
            {hubs.map((h) => (
              <path key={h.key} d={curve(CX, CY, h.x, h.y)} className={`link link--hub ${hubLit(h.key) ? '' : 'is-dim'}`} />
            ))}
            {nodes.map((n) => {
              const hub = hubs.find((h) => h.key === n.hub);
              const on = matched.has(n.task.id);
              return <path key={n.task.id} d={curve(hub.x, hub.y, n.x, n.y)} className={`link ${on ? '' : 'is-dim'} ${hover === n.task.id ? 'is-hover' : ''}`} />;
            })}
            {extra.map((e) => (
              <path key={e.id} d={curve(e.x1, e.y1, e.x2, e.y2)} className={`link link--extra ${matched.has(e.task) ? '' : 'is-dim'} ${hover === e.task ? 'is-hover' : ''}`} />
            ))}
          </g>

          <g className="map__center" style={{ transform: `translate(${CX}px, ${CY}px)` }}>
            <circle r="40" />
            <text className="map__total" y="6">{filtering ? matched.size : tasks.length}</text>
            <text className="map__total-label" y="24">{filtering ? `de ${tasks.length}` : 'tareas'}</text>
          </g>

          {hubs.map((h, i) => (
            <g key={h.key} className={`hub ${hubLit(h.key) ? '' : 'is-dim'}`} style={{ transform: `translate(${h.x}px, ${h.y}px)`, '--d': `${i * 60}ms` }}>
              <circle r={10 + Math.min(h.count, 10) * 1.2} />
              <text y={-20 - Math.min(h.count, 10) * 1.2} className="hub__label">{h.label}</text>
              <text y="4" className="hub__count">{h.count}</text>
            </g>
          ))}

          {nodes.map((n, i) => {
            const { task } = n;
            const on = matched.has(task.id);
            const r = RADIUS[task.priority] ?? 8;
            return (
              <g
                key={task.id}
                className={`node node--${task.status} ${on ? '' : 'is-dim'} ${on && filtering ? 'is-hit' : ''} ${hover === task.id ? 'is-hover' : ''}`}
                style={{ transform: `translate(${n.x}px, ${n.y}px)`, '--d': `${200 + i * 25}ms` }}
                onMouseEnter={() => setHover(task.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(task.id)}
                onBlur={() => setHover(null)}
                onClick={() => onEdit(task)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onEdit(task))}
                tabIndex={on ? 0 : -1}
                role="button"
                aria-label={`${task.title}, ${statusLabel(task.status)}, prioridad ${priorityLabel(task.priority)}`}
              >
                {on && filtering && <circle className="node__ring" r={r + 7} />}
                <circle className="node__dot" r={r} />
                {task.status === 'en_progreso' && <path className="node__half" d={`M0,${-r} A${r},${r} 0 0 1 0,${r} Z`} />}
                {showLabels && on && <text className="node__label" x={r + 8} y="4">{task.title.length > 30 ? `${task.title.slice(0, 28)}…` : task.title}</text>}
              </g>
            );
          })}
        </svg>

        {hovered && (
          <div className="map__tip" style={{ left: `${(hovered.x / W) * 100}%`, top: `${(hovered.y / H) * 100}%` }}>
            <strong>{hovered.task.title}</strong>
            <span><StatusGlyph status={hovered.task.status} size={11} /> {statusLabel(hovered.task.status)} · {priorityLabel(hovered.task.priority)} · {formatDue(hovered.task.dueDate)}</span>
            {hovered.task.tags?.length > 0 && <span className="map__tip-tags">{hovered.task.tags.map((t) => `#${t}`).join('  ')}</span>}
          </div>
        )}
      </div>

      <ul className="map__legend" aria-label="Leyenda">
        <li><StatusGlyph status="pendiente" size={12} /> Pendiente</li>
        <li><StatusGlyph status="en_progreso" size={12} /> En progreso</li>
        <li className="map__legend-done"><StatusGlyph status="completada" size={12} /> Completada</li>
        <li className="map__legend-size"><i style={{ width: 13, height: 13 }} /><i style={{ width: 18, height: 18 }} /><i style={{ width: 24, height: 24 }} /> Tamaño = prioridad</li>
        <li className="map__legend-hint">Clic en un punto para editarlo</li>
      </ul>
    </div>
  );
}
