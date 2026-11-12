const R = 38;
const C = 2 * Math.PI * R;

// Anillo de progreso del día (hechas / programadas para hoy).
export default function ProgressRing({ done, total }) {
  const pct = total ? done / total : 0;
  return (
    <svg className="ring" width="96" height="96" viewBox="0 0 96 96" role="img" aria-label={`${done} de ${total} tareas de hoy hechas`}>
      <circle className="ring__track" cx="48" cy="48" r={R} fill="none" strokeWidth="7" />
      <circle
        className="ring__fill"
        cx="48" cy="48" r={R} fill="none" strokeWidth="7"
        strokeDasharray={C}
        strokeDashoffset={C * (1 - pct)}
        transform="rotate(-90 48 48)"
      />
      <text className="ring__num" x="48" y="52" textAnchor="middle">{done}<tspan className="ring__den">/{total}</tspan></text>
    </svg>
  );
}
