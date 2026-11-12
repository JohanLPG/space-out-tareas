import { useEffect } from 'react';
import { StatusGlyph } from './Icon.jsx';

// Aviso flotante con acción opcional (p. ej. "Deshacer"). Se cierra solo.
export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(onClose, toast.duration ?? 5000);
    return () => clearTimeout(id);
  }, [toast, onClose]);

  return (
    <div className="toast-region" aria-live="polite">
      {toast && (
        <div key={toast.id} className={`toast ${toast.tone ? `toast--${toast.tone}` : ''}`} role="status">
          {toast.tone === 'celebrate' && <span className="toast__stamp"><StatusGlyph status="completada" size={14} /></span>}
          <span className="toast__msg">{toast.message}</span>
          {toast.action && (
            <button className="toast__action" onClick={() => { toast.action.run(); onClose(); }}>
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
