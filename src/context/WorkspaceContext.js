import { createContext, useContext } from 'react';

// Acciones compartidas por todas las secciones (Hoy, Tablero, Explorar, Mapa):
// abrir el panel de una tarea, crear, cambiar estado, eliminar con "Deshacer", avisos…
export const WorkspaceContext = createContext(null);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace debe usarse dentro de <AppShell>');
  return ctx;
}
