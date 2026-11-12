# Space-out · Gestor de tareas diarias

Aplicación web construida con **React 19 + Vite + React Router** para registrar, organizar y gestionar tareas diarias.

**Demo:** https://space-out-tareas.onrender.com

## Secciones
Navegación fija (barra lateral en computador, barra inferior con «+» en el celular). Cada sección tiene un solo propósito:

| Sección | Atajo | Para qué |
|---|---|---|
| **Hoy** | `1` | Tu siguiente paso, progreso del día, lo que toca hoy y la semana |
| **Tablero** | `2` | Columnas Pendiente / En progreso / Completada (arrastrar y soltar) |
| **Explorar** | `3` | Buscar cualquier tarea y filtrar por estado, prioridad, fecha y etiqueta |
| **Mapa** | `4` | Lienzo interactivo: grupos por etiqueta/estado/prioridad, zoom, mover nodos |

Al tocar cualquier tarea se abre su **panel**, donde se edita todo en el lugar. **N** abre «Nueva tarea» y **/** busca en la sección actual. La primera vez aparece una guía de bienvenida (se repite desde «Guía rápida»).

## Escribe como hablas
> `Entregar informe el viernes !alta #tesis // con anexos`
> → título «Entregar informe», vence el viernes, prioridad alta, etiqueta #tesis, notas «con anexos».

Entiende `hoy`, `mañana`, `pasado mañana`, `el viernes`, `el próximo lunes`, `en 3 días`, `la próxima semana`, `15 nov`, `30/11`, `!alta` / `!!` / `!baja` / `urgente`, `#progreso`, `#hecha`, cualquier `#etiqueta` y `// notas`.

## Ejecutar en local
```bash
npm install
npm run dev
```

## Estructura
```
src/
  App.jsx                    Rutas anidadas (/hoy, /tablero, /explorar, /mapa)
  context/                   AuthContext, TaskContext (useReducer), WorkspaceContext
  pages/                     Login, Register, Today, Board, Explore, MapPage
  components/                AppShell, Nav, TaskPanel, CreateSheet, QuickAdd, TaskCanvas, Tour, …
  utils/                     parseTask (lenguaje natural), explore (facetas), mapLayout, tasks, motion
  services/storage.js        localStorage + hash SHA-256 de contraseñas
```

## Despliegue (Render)
Static Site · build `npm install && npm run build` · carpeta `dist` · regla de reescritura `/*` → `/index.html`.

> Nota: los datos se guardan en el `localStorage` del navegador (no hay servidor), por lo que cada navegador tiene sus propias cuentas y tareas.
