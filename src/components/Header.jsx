import Logo from './Logo.jsx';
import Icon from './Icon.jsx';

export default function Header({ user, onLogout, onNewTask }) {
  return (
    <header className="topbar">
      <Logo />
      <div className="topbar__right">
        <button className="btn btn--primary btn--sm topbar__new" onClick={onNewTask}>
          <Icon name="plus" size={16} strokeWidth={2} /> Nueva tarea
        </button>
        <div className="user">
          <span className="user__avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</span>
          <span className="user__name">{user.name}</span>
        </div>
        <button className="icon-btn" onClick={onLogout} aria-label="Cerrar sesión" title="Cerrar sesión">
          <Icon name="logout" />
        </button>
      </div>
    </header>
  );
}
