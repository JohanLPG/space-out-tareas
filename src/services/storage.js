// Capa de persistencia: encapsula localStorage para que el resto de la app
// no dependa directamente del navegador (se podría cambiar por una API REST).

export const KEYS = {
  users: 'orden.users',
  session: 'orden.session',
  tasks: (userId) => `orden.tasks.${userId}`,
};

export function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento lleno o bloqueado: la app sigue funcionando en memoria */
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignorado */
  }
}

// Hash SHA-256 con sal usando la Web Crypto API: nunca se guarda la contraseña en texto plano.
export async function hashPassword(password, salt) {
  const data = new TextEncoder().encode(`${salt}:${password}`);
  const buffer = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
