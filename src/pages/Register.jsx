import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ name, email, password, confirm }) {
  if (name.trim().length < 2) return 'Escribe tu nombre (mínimo 2 letras).';
  if (!EMAIL_RE.test(email.trim())) return 'El correo no tiene un formato válido.';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  if (password !== confirm) return 'Las contraseñas no coinciden.';
  return '';
}

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  async function onSubmit(e) {
    e.preventDefault();
    const problem = validate(form);
    setError(problem);
    if (problem) return;
    setBusy(true);
    try {
      await register(form);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="auth__title">Crea tu cuenta</h2>
      <p className="auth__sub">Un minuto ahora, menos pendientes después.</p>
      <form className="form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>Nombre</span>
          <input name="name" autoComplete="name" value={form.name} onChange={onChange} placeholder="Tu nombre" autoFocus />
        </label>
        <label className="field">
          <span>Correo electrónico</span>
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} placeholder="nombre@correo.com" />
        </label>
        <div className="form__row">
          <label className="field">
            <span>Contraseña</span>
            <input name="password" type="password" autoComplete="new-password" value={form.password} onChange={onChange} placeholder="Mín. 6 caracteres" />
          </label>
          <label className="field">
            <span>Confirmar</span>
            <input name="confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={onChange} placeholder="Repite la contraseña" />
          </label>
        </div>
        {error && <p className="form__error" role="alert">{error}</p>}
        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <p className="auth__switch">¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </AuthLayout>
  );
}
