import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { TaskProvider } from '../context/TaskContext.jsx';

// Solo usuarios autenticados. Monta el proveedor de tareas del usuario actual
// (key = id, así al cambiar de cuenta el estado se reinicia limpio).
export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <TaskProvider key={user.id} userId={user.id}>
      {children}
    </TaskProvider>
  );
}

// Login y registro: si ya hay sesión, se redirige al tablero.
export function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}
