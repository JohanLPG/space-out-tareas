import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Icon, { StatusGlyph } from './Icon.jsx';
import { formatDue, priorityLabel, statusLabel, taskMatches } from '../utils/tasks.js';
import { bounds, buildLayout, GROUPINGS } from '../utils/mapLayout.js';
import { KEYS, read, write } from '../services/storage.js';

const NODE_R = { alta: 11, media: 8.5, baja: 6.5 };
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const curve = (x1, y1, x2, y2) => {
  const mx = (x1 + x2) / 2 + (y2 - y1) * 0.18;
  const my = (y1 + y2) / 2 - (x2 - x1) * 0.18;
  return `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
};

// Mapa tipo lienzo infinito: arrastra el fondo para moverte, rueda o botones para acercar,
// arrastra cualquier punto para reorganizarlo a tu gusto y tócalo para abrir su panel.
export default function TaskCanvas({ tasks, userId, grouping, query, selectedId, onOpen }) {
  const wrapRef = useRef(null);
  const drag = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1, smooth: false });
  const [hover, setHover] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [overrides, setOverrides] = useState(() => read(KEYS.map(userId), {})[grouping] ?? {});

  const { clusters, positions: base, links } = useMemo(() => buildLayout(tasks, grouping), [tasks, grouping]);
  const positions = useMemo(() => {
    const merged = { ...base };
    Object.entries(overrides).forEach(([id, p]) => { if (merged[id]) merged[id] = p; });
    return merged;
  }, [base, overrides]);

  const searching = query.trim().length > 0;
  const matched = useMemo(() => new Set(tasks.filter((t) => taskMatches(t, query)).map((t) => t.id)), [tasks, query]);
  const focus = hover ?? selectedId;
  const linked = useMemo(() => {
    const set = new Set();
    if (focus) links.forEach((l) => { if (l.a === focus || l.b === focus) { set.add(l.a); set.add(l.b); } });
    return set;
  }, [links, focus]);

  const fit = useCallback((smooth = true) => {
    const el = wrapRef.current;
    if (!el) return;
    const { width: w, height: h } = el.getBoundingClientRect();
    if (!clusters.length) { setView({ x: w / 2, y: h / 2, k: 1, smooth }); return; }
    const b = bounds(clusters, positions);
    const bw = b.maxX - b.minX;
    const bh = b.maxY - b.minY;
    const k = clamp(Math.min((w - 96) / bw, (h - 150) / bh), 0.3, 1.5);
    setView({ k, x: w / 2 - (b.minX + bw / 2) * k, y: h / 2 + 10 - (b.minY + bh / 2) * k, smooth });
  }, [clusters, positions]);

  // Encaja todo al abrir el mapa (o al cambiar la forma de agrupar).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => fit(false), [grouping]);

  // Zoom con la rueda, centrado en el puntero.
  useEffect(() => {
    const el = wrapRef.current;
    const onWheel = (e) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      setView((v) => {
        const k = clamp(v.k * Math.exp(-e.deltaY * 0.0016), 0.3, 2.6);
        return { x: mx - (mx - v.x) * (k / v.k), y: my - (my - v.y) * (k / v.k), k, smooth: false };
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Al abrir el panel de un punto, el mapa se desliza para que ese punto quede visible a su lado.
  useEffect(() => {
    if (!selectedId || !positions[selectedId] || !wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const panel = document.querySelector('.panel')?.getBoundingClientRect();
    const covered = panel && panel.left < rect.right && panel.width < window.innerWidth * 0.9 ? rect.right - panel.left : 0;
    const visibleW = rect.width - covered;
    const p = positions[selectedId];
    setView((v) => {
      const sx = v.x + p.x * v.k;
      const sy = v.y + p.y * v.k;
      if (sx > 60 && sx < visibleW - 60 && sy > 60 && sy < rect.height - 60) return v;
      return { ...v, x: visibleW / 2 - p.x * v.k, y: rect.height / 2 - p.y * v.k, smooth: true };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const zoomBy = (factor) => {
    const { width: w, height: h } = wrapRef.current.getBoundingClientRect();
    setView((v) => {
      const k = clamp(v.k * factor, 0.3, 2.6);
      return { x: w / 2 - (w / 2 - v.x) * (k / v.k), y: h / 2 - (h / 2 - v.y) * (k / v.k), k, smooth: true };
    });
  };

  function onPointerDown(e) {
    if (e.button !== 0 || e.target.closest('.canvas__ui')) return;
    const node = e.target.closest('[data-node]');
    const id = node?.dataset.node;
    drag.current = id
      ? { type: 'node', id, sx: e.clientX, sy: e.clientY, ox: positions[id].x, oy: positions[id].y, moved: false }
      : { type: 'pan', sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y, moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (!d.moved && Math.hypot(dx, dy) < 4) return;
    if (!d.moved) { d.moved = true; setDragging(d.type === 'node' ? d.id : 'pan'); setHover(null); }
    if (d.type === 'pan') setView((v) => ({ ...v, x: d.ox + dx, y: d.oy + dy, smooth: false }));
    else setOverrides((o) => ({ ...o, [d.id]: { x: d.ox + dx / view.k, y: d.oy + dy / view.k } }));
  }

  function onPointerUp() {
    const d = drag.current;
    drag.current = null;
    setDragging(null);
    if (!d) return;
    if (d.type === 'node' && !d.moved) onOpen(d.id);
    if (d.type === 'node' && d.moved) {
      const saved = read(KEYS.map(userId), {});
      write(KEYS.map(userId), { ...saved, [grouping]: overrides });
    }
  }

  function resetLayout() {
    setOverrides({});
    const saved = read(KEYS.map(userId), {});
    delete saved[grouping];
    write(KEYS.map(userId), saved);
    setTimeout(() => fit(true), 50);
  }

  const showLabel = (id) => view.k >= 1.15 || id === focus || linked.has(id) || (searching && matched.has(id) && matched.size <= 8);
  const hovered = hover && !dragging ? tasks.find((t) => t.id === hover) : null;
  const hp = hovered ? positions[hovered.id] : null;
  const moved = Object.keys(overrides).length > 0;

  return (
    <div
      ref={wrapRef}
      className={`canvas ${dragging === 'pan' ? 'is-panning' : ''} ${dragging && dragging !== 'pan' ? 'is-dragging' : ''}`}
      style={{ backgroundPosition: `${view.x}px ${view.y}px`, backgroundSize: `${26 * view.k}px ${26 * view.k}px` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <svg role="img" aria-label={`Mapa de ${tasks.length} tareas agrupadas por ${GROUPINGS[grouping].label.toLowerCase()}`}>
        <g className={`world ${view.smooth ? 'is-smooth' : ''}`} style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}>
          {clusters.map((c, i) => {
            const lit = !searching || c.tasks.some((t) => matched.has(t.id));
            const circ = 2 * Math.PI * (c.r + 6);
            return (
              <g key={c.key} className={`cl ${lit ? '' : 'is-dim'}`} transform={`translate(${c.x} ${c.y})`} style={{ '--d': `${i * 80}ms` }}>
                <circle className="cl__halo" r={c.r} />
                <circle className="cl__track" r={c.r + 6} />
                <circle
                  className="cl__arc"
                  r={c.r + 6}
                  strokeDasharray={`${(c.done / c.tasks.length) * circ} ${circ}`}
                  transform="rotate(-90)"
                />
                <text className="cl__name" y={-c.r - 30}>{c.name}</text>
                <text className="cl__count" y={-c.r - 14}>{c.tasks.length} {c.tasks.length === 1 ? 'tarea' : 'tareas'} · {c.done} {c.done === 1 ? 'hecha' : 'hechas'}</text>
              </g>
            );
          })}

          {links.map((l) => {
            const a = positions[l.a];
            const b = positions[l.b];
            if (!a || !b) return null;
            const on = focus && (l.a === focus || l.b === focus);
            const dim = (searching && !(matched.has(l.a) && matched.has(l.b))) || (focus && !on);
            return <path key={l.id} d={curve(a.x, a.y, b.x, b.y)} className={`lk ${on ? 'is-on' : ''} ${dim ? 'is-dim' : ''}`} />;
          })}

          {tasks.map((t, i) => {
            const p = positions[t.id];
            if (!p) return null;
            const r = NODE_R[t.priority] ?? 8;
            const dim = searching && !matched.has(t.id);
            const faded = !dim && focus && t.id !== focus && !linked.has(t.id);
            return (
              <g
                key={t.id}
                data-node={t.id}
                className={`nd nd--${t.status} ${dim ? 'is-dim' : ''} ${faded ? 'is-faded' : ''} ${selectedId === t.id ? 'is-selected' : ''} ${dragging === t.id ? 'is-drag' : ''}`}
                style={{ transform: `translate(${p.x}px, ${p.y}px)`, '--d': `${150 + i * 18}ms` }}
                onPointerEnter={() => !drag.current && setHover(t.id)}
                onPointerLeave={() => setHover((h) => (h === t.id ? null : h))}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(t.id); } }}
                onFocus={() => setHover(t.id)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="button"
                aria-label={`${t.title}, ${statusLabel(t.status)}, prioridad ${priorityLabel(t.priority)}`}
              >
                <circle className="nd__hit" r={r + 8} />
                {selectedId === t.id && <circle className="nd__ring" r={r + 7} />}
                <g className="nd__body">
                  <circle className="nd__dot" r={r} />
                  {t.status === 'en_progreso' && <path className="nd__half" d={`M0,${-r} A${r},${r} 0 0 1 0,${r} Z`} />}
                  {t.status === 'completada' && <path className="nd__tick" d={`M${-r * 0.42},0 L${-r * 0.1},${r * 0.32} L${r * 0.45},${-r * 0.3}`} />}
                </g>
                {showLabel(t.id) && <text className="nd__label" x={r + 8} y="4">{t.title.length > 30 ? `${t.title.slice(0, 28)}…` : t.title}</text>}
              </g>
            );
          })}
        </g>
      </svg>

      {hovered && hp && (
        <div className="canvas__tip" style={{ left: view.x + hp.x * view.k, top: view.y + hp.y * view.k }}>
          <strong>{hovered.title}</strong>
          <span><StatusGlyph status={hovered.status} size={11} /> {statusLabel(hovered.status)} · {priorityLabel(hovered.priority)} · {formatDue(hovered.dueDate)}</span>
          <em>Clic para abrir · arrastra para mover</em>
        </div>
      )}

      {tasks.length === 0 && (
        <div className="canvas__empty">
          <p>Tu mapa aparecerá aquí cuando crees tareas.</p>
        </div>
      )}

      <div className="canvas__ui canvas__zoom glass">
        <button className="icon-btn icon-btn--sm" onClick={() => zoomBy(1 / 1.25)} aria-label="Alejar"><Icon name="minus" size={16} /></button>
        <span className="canvas__pct">{Math.round(view.k * 100)}%</span>
        <button className="icon-btn icon-btn--sm" onClick={() => zoomBy(1.25)} aria-label="Acercar"><Icon name="plus" size={16} /></button>
        <span className="canvas__sep" />
        <button className="icon-btn icon-btn--sm" onClick={() => fit(true)} aria-label="Encajar todo" title="Encajar todo"><Icon name="fit" size={16} /></button>
        {moved && <button className="canvas__reset" onClick={resetLayout}>Reordenar</button>}
      </div>

      <ul className="canvas__ui canvas__legend glass" aria-label="Leyenda">
        <li><StatusGlyph status="pendiente" size={12} /> Pendiente</li>
        <li><StatusGlyph status="en_progreso" size={12} /> En progreso</li>
        <li className="is-done"><StatusGlyph status="completada" size={12} /> Hecha</li>
        <li className="canvas__sizes"><i /><i /><i /> Prioridad</li>
      </ul>
    </div>
  );
}
