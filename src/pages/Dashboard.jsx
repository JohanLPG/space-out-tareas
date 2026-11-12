import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';
import Header from '../components/Header.jsx';
import SummaryHeader from '../components/SummaryHeader.jsx';
import QuickAdd from '../components/QuickAdd.jsx';
import WeekStrip from '../components/WeekStrip.jsx';
import FilterBar from '../components/FilterBar.jsx';
import TaskColumn from '../components/TaskColumn.jsx';
import TaskForm from '../components/TaskForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Toast from '../components/Toast.jsx';
import ViewTabs from '../components/ViewTabs.jsx';
import ActiveFilters from '../components/ActiveFilters.jsx';
import Explorer from '../components/Explorer.jsx';
import { filterTasks, formatDue, STATUSES, todayISO } from '../utils/tasks.js';
import { withTransition } from '../utils/motion.js';

const INITIAL_FILTERS = { query: '', status: 'todas', priority: 'todas', sort: 'vencimiento', day: '' };
const short = (s) => (s.length > 34 ? `${s.slice(0, 32)}…` : s);

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { tasks, addTask, updateTask, setStatus, deleteTask, restoreTask } = useTasks();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [editing, setEditing] = useState(null); // null = cerrado, {} = nueva, task = edición
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [view, setView] = useState('tablero');
  const [explore, setExplore] = useState({ key: 0, initial: null });
  const quickRef = useRef(null);
  const searchRef = useRef(null);

  // Estado derivado: se recalcula solo cuando cambian tareas o filtros.
  const visible = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  // Coincidencias de la búsqueda que los demás filtros están escondiendo.
  const hidden = useMemo(() => {
    if (!filters.query.trim()) return 0;
    return filterTasks(tasks, { ...filters, status: 'todas', priority: 'todas', day: '' }).length - visible.length;
  }, [tasks, filters, visible]);

  const switchView = useCallback((next) => withTransition(() => setView(next)), []);
  const openExplorer = useCallback((initial = null) => {
    withTransition(() => {
      setExplore((e) => ({ key: e.key + 1, initial }));
      setView('explorar');
    });
  }, []);
  const columns = STATUSES.filter((s) => filters.status === 'todas' || s.id === filters.status);

  const notify = useCallback((t) => setToast({ id: Date.now(), ...t }), []);
  const closeToast = useCallback(() => setToast(null), []);
  const closeForm = useCallback(() => setEditing(null), []);
  const closeConfirm = useCallback(() => setToDelete(null), []);

  // Atajos de teclado: N = nueva tarea rápida, / = buscar.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || editing || toDelete) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); quickRef.current?.focus(); }
      if (e.key === '/') { e.preventDefault(); searchRef.current?.focus(); }
      if (e.key === 'e' || e.key === 'E') { e.preventDefault(); switchView(view === 'explorar' ? 'tablero' : 'explorar'); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [editing, toDelete, view, switchView]);

  // La búsqueda filtra al instante; el resto de filtros anima el reacomodo de tarjetas.
  // Recibe solo lo que cambia (p. ej. { status: 'pendiente' }) y lo combina con el estado más reciente.
  function updateFilters(patch) {
    const apply = () => setFilters((f) => ({ ...f, ...patch }));
    if ('query' in patch) apply();
    else withTransition(apply);
  }

  function changeStatus(id, status) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    withTransition(() => setStatus(id, status));
    if (status !== 'completada') return;

    const today = todayISO();
    const openToday = tasks.filter((t) => t.dueDate === today && t.status !== 'completada' && t.id !== id).length;
    if (task.dueDate === today && openToday === 0) {
      notify({ tone: 'celebrate', message: 'Día cerrado. Todo lo de hoy está hecho.', duration: 6000 });
    } else {
      notify({
        message: `«${short(task.title)}» completada`,
        action: { label: 'Deshacer', run: () => withTransition(() => setStatus(id, task.status)) },
      });
    }
  }

  function quickCreate(data) {
    withTransition(() => addTask(data));
    notify({ message: `Anotada para ${formatDue(data.dueDate).toLowerCase()}: «${short(data.title)}»` });
  }

  function handleSave(data) {
    if (editing?.id) updateTask(editing.id, data);
    else withTransition(() => addTask(data));
    setEditing(null);
  }

  function confirmDelete() {
    const task = toDelete;
    setToDelete(null);
    withTransition(() => deleteTask(task.id));
    notify({ message: 'Tarea eliminada', action: { label: 'Deshacer', run: () => withTransition(() => restoreTask(task)) } });
  }

  return (
    <div className="app">
      <Header user={user} onLogout={logout} onNewTask={() => setEditing({})} />
      <main className="dashboard">
        <SummaryHeader name={user.name} tasks={tasks} />
        <QuickAdd onCreate={quickCreate} inputRef={quickRef} />
        <ViewTabs view={view} onChange={switchView} total={tasks.length} />

        {view === 'explorar' ? (
          <Explorer
            key={explore.key}
            initial={explore.initial}
            tasks={tasks}
            onEdit={setEditing}
            onSetStatus={changeStatus}
            searchRef={searchRef}
          />
        ) : (
          <>
            <WeekStrip tasks={tasks} selected={filters.day} onSelect={(day) => updateFilters({ day })} />
            <FilterBar filters={filters} onChange={updateFilters} shown={visible.length} total={tasks.length} searchRef={searchRef} />
            <ActiveFilters
              filters={filters}
              onChange={updateFilters}
              onClear={() => updateFilters({ query: '', status: 'todas', priority: 'todas', day: '' })}
              hidden={hidden}
              onExplore={() => openExplorer({ query: filters.query })}
            />
          </>
        )}

        {view === 'explorar' ? null : tasks.length === 0 ? (
          <section className="empty">
            <h2>Tu tablero está en blanco.</h2>
            <p>Escribe arriba lo primero que tienes que hacer, tal como lo dirías: «Estudiar para el parcial mañana !alta».</p>
            <button className="btn btn--ghost" onClick={() => setEditing({})}>Prefiero el formulario completo</button>
          </section>
        ) : (
          <div className={`board board--${columns.length}`}>
            {columns.map((s) => (
              <TaskColumn
                key={s.id}
                status={s.id}
                label={s.label}
                tasks={visible.filter((t) => t.status === s.id)}
                onDropTask={changeStatus}
                onEdit={setEditing}
                onDelete={setToDelete}
                onSetStatus={changeStatus}
                onTag={(tag) => openExplorer({ tag })}
              />
            ))}
          </div>
        )}
      </main>

      {editing && <TaskForm task={editing} onSave={handleSave} onClose={closeForm} />}
      {toDelete && <ConfirmDialog task={toDelete} onClose={closeConfirm} onConfirm={confirmDelete} />}
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}
