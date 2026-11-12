import { NavLink } from 'react-router-dom';
import Logo from './Logo.jsx';
import Icon from './Icon.jsx';

// eslint-disable-next-line react-refresh/only-export-components
export const SECTIONS = [
  { to: '/hoy', label: 'Hoy', icon: 'sun', tour: 'nav-hoy' },
  { to: '/tablero', label: 'Tablero', icon: 'columns', tour: 'nav-tablero' },
  { to: '/explorar', label: 'Explorar', icon: 'search', tour: 'nav-explorar' },
  { to: '/mapa', label: 'Mapa', icon: 'nodes', tour: 'nav-mapa' },
];

function Badge({ to, value }) {
  if (!value) return null;
  return <span className={`badge ${to === '/tablero' ? 'badge--alert' : ''}`} aria-label={to === '/tablero' ? `${value} vencidas` : `${value} para hoy`}>{value}</span>;
}

// Navegación fija: barra lateral en computador, barra inferior con "+" central en el celular.
export default function Nav({ user, badges, onCreate, onLogout, onHelp }) {
  const linkClass = (base) => ({ isActive }) => `${base} ${isActive ? 'is-active' : ''}`;

  return (
    <>
      <aside className="side" aria-label="Navegación principal">
        <div className="side__brand"><Logo /></div>

        <button className="side__create" onClick={onCreate} data-tour="create">
          <Icon name="plus" size={17} strokeWidth={2} /> Nueva tarea <kbd className="kbd">N</kbd>
        </button>

        <nav className="side__nav">
          {SECTIONS.map((s, i) => (
            <NavLink key={s.to} to={s.to} className={linkClass('side__link')} data-tour={s.tour}>
              <Icon name={s.icon} size={19} />
              <span>{s.label}</span>
              <Badge to={s.to} value={badges[s.to]} />
              <kbd className="kbd side__key">{i + 1}</kbd>
            </NavLink>
          ))}
        </nav>

        <div className="side__foot">
          <button className="side__help" onClick={onHelp}><Icon name="help" size={18} /> Guía rápida</button>
          <div className="side__user">
            <span className="avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
            <span className="side__name">{user.name}</span>
            <button className="icon-btn icon-btn--sm" onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      </aside>

      <header className="mtop">
        <Logo />
        <div className="mtop__tools">
          <button className="icon-btn" onClick={onHelp} aria-label="Guía rápida"><Icon name="help" /></button>
          <button className="icon-btn" onClick={onLogout} aria-label="Cerrar sesión"><Icon name="logout" /></button>
        </div>
      </header>

      <nav className="tabbar" aria-label="Secciones">
        {SECTIONS.slice(0, 2).map((s) => (
          <NavLink key={s.to} to={s.to} className={linkClass('tabbar__link')} data-tour={s.tour}>
            <Icon name={s.icon} size={21} /><span>{s.label}</span><Badge to={s.to} value={badges[s.to]} />
          </NavLink>
        ))}
        <button className="tabbar__create" onClick={onCreate} aria-label="Nueva tarea" data-tour="create">
          <Icon name="plus" size={24} strokeWidth={2.2} />
        </button>
        {SECTIONS.slice(2).map((s) => (
          <NavLink key={s.to} to={s.to} className={linkClass('tabbar__link')} data-tour={s.tour}>
            <Icon name={s.icon} size={21} /><span>{s.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
