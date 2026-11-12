import { useEffect, useRef } from 'react';
import Icon from './Icon.jsx';

// Diálogo accesible: cierra con Esc o clic fuera, bloquea el scroll y enfoca el primer campo.
export default function Modal({ title, onClose, children, size = 'md' }) {
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = ref.current;
    (panel?.querySelector('input, textarea, select') ?? panel?.querySelector('button'))?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal__panel modal__panel--${size}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={ref}>
        <header className="modal__head">
          <h2 id="modal-title">{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar" type="button">
            <Icon name="close" />
          </button>
        </header>
        {children}
      </div>
    </div>
  );
}
