# Space-out · Gestor de tareas diarias

Aplicación web construida con **React 19 + Vite** que permite a cada usuario registrarse, iniciar sesión y gestionar sus tareas en un tablero por estados.

## Lo que la hace distinta: «Escribe como hablas»
Escribe la tarea en una línea, en español, y Space-out la entiende mientras escribes:

> `Entregar informe el viernes !alta // con anexos`
> → título «Entregar informe», vence el viernes, prioridad alta, descripción «con anexos».

Entiende `hoy`, `mañana`, `pasado mañana`, `el viernes`, `el próximo lunes`, `en 3 días`, `la próxima semana`, `15 nov`, `30/11`, `!alta` / `!!` / `!baja` / `urgente`, `#progreso` y `// nota`. Atajos: **N** (nueva tarea rápida) y **/** (buscar).

También incluye la cinta «Tu semana» (carga por día, clic para filtrar), tarjetas que se deslizan entre columnas (View Transitions API), «Deshacer» al completar o eliminar, y un aviso de «Día cerrado».

## Explorar: encontrar cualquier tarea
- **Etiquetas:** escribe `#tesis`, `#universidad`… al crear la tarea (o edítalas en el formulario).
- **Filtros siempre visibles** en el tablero, con aviso cuando una búsqueda tiene coincidencias ocultas por otros filtros.
- **Apartado Explorar** (atajo **E**): búsqueda global + facetas (Estado, Prioridad, Fecha, Etiquetas) con conteos en vivo; resultados como **Lista** (tabla ordenable con resaltado) o **Mapa** (nodos agrupados por etiqueta).

## Funcionalidades
- Registro e inicio de sesión (contraseñas con hash SHA-256 + sal, sesión persistente).
- Crear tareas con título, descripción, fecha de vencimiento y prioridad.
- Tablero organizado por estado: Pendiente, En progreso, Completada (también por arrastrar y soltar).
- Editar y eliminar tareas (con confirmación).
- Marcar como completada con un clic.
- Búsqueda por título o descripción (ignora tildes) y filtros por estado y prioridad; orden por vencimiento, prioridad o recientes.

## Ejecutar en local
```bash
npm install
npm run dev
```
Abrir http://localhost:5173

## Estructura
```
src/
  App.jsx                 Rutas (react-router-dom)
  context/AuthContext.jsx Registro, login, logout y sesión
  context/TaskContext.jsx CRUD de tareas con useReducer + persistencia
  services/storage.js     Acceso a localStorage y hash de contraseñas
  utils/tasks.js          Estados, prioridades, fechas, búsqueda y filtros
  components/             Header, SummaryHeader, FilterBar, TaskColumn, TaskCard, TaskForm, Modal, ConfirmDialog, RouteGuards
  pages/                  Login, Register, Dashboard
```

## Despliegue en Render
El archivo `render.yaml` define un *Static Site*: build `npm install && npm run build`, carpeta publicada `dist`, y una regla de reescritura `/* → /index.html` para que funcionen las rutas del navegador.

> Nota: los datos se guardan en el `localStorage` del navegador (no hay servidor), por lo que cada navegador tiene sus propias cuentas y tareas.
