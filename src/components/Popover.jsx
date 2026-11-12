import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

// Botón que despliega un menú flotante. Se cierra con clic afuera o Esc.
// Así los filtros existen pero no ocupan la vista hasta que los necesitas.
export default function Popover({ label, count = 0, icon, align = 'start', children }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  return (
    <div className="pop" ref={ref}>
      <button
        className={`pop__btn ${count ? 'is-active' : ''} ${open ? 'is-open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {icon && <Icon name={icon} size={15} />}
        {label}
        {count > 0 && <span className="pop__count">{count}</span>}
        <Icon name="chevron" size={14} />
      </button>
      {open && <div className={`pop__panel pop__panel--${align}`}>{children}</div>}
    </div>
  );
}

export function MenuItem({ on, onClick, children, count, radio = false, empty = false }) {
  return (
    <button className={`menu__item ${on ? 'is-on' : ''} ${empty && !on ? 'is-empty' : ''}`} onClick={onClick} role={radio ? 'menuitemradio' : 'menuitemcheckbox'} aria-checked={on}>
      <span className={`menu__check ${radio ? 'menu__check--radio' : ''}`}>{on && <Icon name="check" size={12} strokeWidth={2.6} />}</span>
      <span className="menu__label">{children}</span>
      {count !== undefined && <span className="menu__n">{count}</span>}
    </button>
  );
}
