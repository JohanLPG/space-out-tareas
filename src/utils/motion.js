import { flushSync } from 'react-dom';

// Envuelve un cambio de estado en la View Transitions API del navegador:
// las tarjetas "viajan" suavemente entre columnas en vez de saltar.
// Si el navegador no la soporta o el usuario prefiere menos movimiento, aplica el cambio directo.
export function withTransition(update) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!document.startViewTransition || reduce) {
    update();
    return;
  }
  const transition = document.startViewTransition(() => flushSync(update));
  // Si llega otro cambio antes de terminar, el navegador salta esta animación: es esperado.
  transition.ready.catch(() => {});
  transition.finished.catch(() => {});
}

export const transitionName = (id) => `t-${id}`;
