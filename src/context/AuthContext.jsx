import { createContext, useContext, useState } from 'react';
import { KEYS, read, write, remove, hashPassword, uid } from '../services/storage.js';

const AuthContext = createContext(null);

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email });

function restoreSession() {
  const session = read(KEYS.session, null);
  if (!session) return null;
  const user = read(KEYS.users, []).find((u) => u.id === session.userId);
  return user ? publicUser(user) : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(restoreSession);

  async function register({ name, email, password }) {
    const normalized = email.trim().toLowerCase();
    const users = read(KEYS.users, []);
    if (users.some((u) => u.email === normalized)) {
      throw new Error('Ya existe una cuenta con ese correo.');
    }
    const salt = uid();
    const newUser = {
      id: uid(),
      name: name.trim(),
      email: normalized,
      salt,
      passwordHash: await hashPassword(password, salt),
      createdAt: new Date().toISOString(),
    };
    write(KEYS.users, [...users, newUser]);
    write(KEYS.session, { userId: newUser.id });
    setUser(publicUser(newUser));
  }

  async function login({ email, password }) {
    const normalized = email.trim().toLowerCase();
    const found = read(KEYS.users, []).find((u) => u.email === normalized);
    const valid = found && (await hashPassword(password, found.salt)) === found.passwordHash;
    if (!valid) throw new Error('Correo o contraseña incorrectos.');
    write(KEYS.session, { userId: found.id });
    setUser(publicUser(found));
  }

  function logout() {
    remove(KEYS.session);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
