import Logo from './Logo.jsx';
import TypingDemo from './TypingDemo.jsx';

export default function AuthLayout({ children }) {
  return (
    <div className="auth">
      <aside className="auth__panel">
        <Logo inverse />
        <div className="auth__statement">
          <p className="eyebrow eyebrow--inverse">Gestor de tareas diarias</p>
          <h1 className="auth__headline">
            Menos ruido.<br />
            <em>Más hecho</em>
          </h1>
          <TypingDemo />
        </div>
        <p className="auth__foot">Sin formularios largos: escribe la tarea como se la dirías a alguien y Space-out pone la fecha y la prioridad por ti.</p>
      </aside>
      <main className="auth__main">
        <div className="auth__card">{children}</div>
      </main>
    </div>
  );
}
