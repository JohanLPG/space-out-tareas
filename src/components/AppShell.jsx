import { useCallback, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTasks } from '../context/TaskContext.jsx';
import { WorkspaceContext } from '../context/WorkspaceContext.js';
import Nav, { SECTIONS } from './Nav.jsx';
import TaskPanel from './TaskPanel.jsx';
import CreateSheet from './CreateSheet.jsx';
import TaskForm from './TaskForm.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import Toast from './Toast.jsx';
import Tour from './Tour.jsx';
import { formatDue, isOverdue, todayISO } from '../utils/tasks.js';
import { withTransition } from '../utils/motion.js';
import { KEYS, read, uid, write } from '../services/storage.js';

const short = (s) => (s.length > 34 ? `${s.slice(0, 32)}…` : s);

// Estructura común de la app autenticada: navegación fija + sección actual (<Outlet />)
// + capas globales (panel de tarea, crear, confirmar, avisos y guía de bienvenida).
export default function AppShell() {
  const { user, logout } = useAuth();
  const { tasks, addTask, updateTask, setStatus, deleteTask, restoreTask } = useTasks();
  const navigate = useNavigate();
  const location = useLocation();

  const [panelId, setPanelId] = useState(null);
  const [creating, setCreating] = useState(false);
  const [fullForm, setFullForm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const [touring, setTouring] = useState(() => !read(KEYS.tour(user.id), false));

  const panelTask = tasks.find((t) => t.id === panelId) ?? null;
  const today = todayISO();
  const openToday = tasks.filter((t) => t.dueDate === today && t.status !== 'completada').length;
  const late = tasks.filter(isOverdue).length;

  const notify = useCallback((t) => setToast({ id: Date.now(), ...t }), []);
  const closeToast = useCallback(() => setToast(null), []);
  const closePanel = useCallback(() => setPanelId(null), []);
  const closeCreate = useCallback(() => setCreating(false), []);
  const closeFullForm = useCallback(() => setFullForm(false), []);
  const closeConfirm = useCallback(() => setToDelete(null), []);

  function changeStatus(id, status) {
    const task = tasks.find((t) => t.id === id);
    if (!task || task.status === status) return;
    withTransition(() => setStatus(id, status));
    if (status !== 'completada') return;
    const openTodayLeft = tasks.filter((t) => t.dueDate === today && t.status !== 'completada' && t.id !== id).length;
    if (task.dueDate === today && openTodayLeft === 0) {
      notify({ tone: 'celebrate', message: 'Día cerrado. Todo lo de hoy está hecho.', duration: 6000 });
    } else {
      notify({
        message: `«${short(task.title)}» completada`,
        action: { label: 'Deshacer', run: () => withTransition(() => setStatus(id, task.status)) },
      });
    }
  }

  function createTask(data) {
    const id = uid();
    withTransition(() => addTask({ ...data, id }));
    notify({
      message: `Anotada para ${formatDue(data.dueDate).toLowerCase()}: «${short(data.title)}»`,
      action: { label: 'Ver', run: () => setPanelId(id) },
    });
  }

  function confirmDelete() {
    const task = toDelete;
    setToDelete(null);
    if (panelId === task.id) setPanelId(null);
    withTransition(() => deleteTask(task.id));
    notify({ message: 'Tarea eliminada', action: { label: 'Deshacer', run: () => withTransition(() => restoreTask(task)) } });
  }

  function finishTour() {
    write(KEYS.tour(user.id), true);
    setTouring(false);
  }

  // Atajos: N = nueva tarea · / = buscar en la sección · 1-4 = cambiar de sección · Esc = cerrar panel.
  useEffect(() => {
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || creating || fullForm || toDelete || touring) return;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setCreating(true); }
      else if (e.key === '/') {
        const search = document.querySelector('[data-search]');
        if (search) { e.preventDefault(); search.focus(); }
      } else if (['1', '2', '3', '4'].includes(e.key)) navigate(SECTIONS[Number(e.key) - 1].to);
      else if (e.key === 'Escape') setPanelId(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [creating, fullForm, toDelete, touring, navigate]);

  const workspace = {
    tasks,
    selectedId: panelId,
    openTask: setPanelId,
    openCreate: () => setCreating(true),
    changeStatus,
    updateTask,
    requestDelete: setToDelete,
    notify,
  };

  return (
    <WorkspaceContext.Provider value={workspace}>
      <div className={`shell ${panelTask ? 'has-panel' : ''}`}>
        <Nav
          user={user}
          badges={{ '/hoy': openToday, '/tablero': late }}
          onCreate={() => setCreating(true)}
          onLogout={logout}
          onHelp={() => setTouring(true)}
        />
        <main className="page" key={location.pathname}>
          <Outlet />
        </main>

        {panelTask && <TaskPanel key={panelTask.id} task={panelTask} onClose={closePanel} />}
        {creating && (
          <CreateSheet
            onCreate={createTask}
            onClose={closeCreate}
            onFullForm={() => { setCreating(false); setFullForm(true); }}
          />
        )}
        {fullForm && (
          <TaskForm task={{}} onClose={closeFullForm} onSave={(data) => { createTask(data); setFullForm(false); }} />
        )}
        {toDelete && <ConfirmDialog task={toDelete} onClose={closeConfirm} onConfirm={confirmDelete} />}
        <Toast toast={toast} onClose={closeToast} />
        {touring && <Tour onDone={finishTour} />}
      </div>
    </WorkspaceContext.Provider>
  );
}
