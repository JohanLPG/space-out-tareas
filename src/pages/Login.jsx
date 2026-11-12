import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password) return setError('Escribe tu correo y tu contraseña.');
    setBusy(true);
    try {
      await login(form); // al haber sesión, PublicOnlyRoute redirige al tablero
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <AuthLayout>
      <h2 className="auth__title">Bienvenido de vuelta</h2>
      <p className="auth__sub">Inicia sesión para ver tu tablero.</p>
      <form className="form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>Correo electrónico</span>
          <input name="email" type="email" autoComplete="email" value={form.email} onChange={onChange} placeholder="nombre@correo.com" autoFocus />
        </label>
        <label className="field">
          <span>Contraseña</span>
          <input name="password" type="password" autoComplete="current-password" value={form.password} onChange={onChange} placeholder="••••••••" />
        </label>
        {error && <p className="form__error" role="alert">{error}</p>}
        <button className="btn btn--primary btn--block" disabled={busy}>
          {busy ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>
      <p className="auth__switch">¿Aún no tienes cuenta? <Link to="/registro">Crear cuenta</Link></p>
    </AuthLayout>
  );
}
