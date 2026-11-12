import { createContext, useContext, useEffect, useReducer } from 'react';
import { KEYS, read, write, uid } from '../services/storage.js';

const TaskContext = createContext(null);

// Reducer: única fuente de verdad para las operaciones CRUD sobre las tareas.
function tasksReducer(tasks, action) {
  switch (action.type) {
    case 'add':
      return [action.task, ...tasks];
    case 'update':
      return tasks.map((t) => (t.id === action.id ? { ...t, ...action.changes, updatedAt: new Date().toISOString() } : t));
    case 'remove':
      return tasks.filter((t) => t.id !== action.id);
    default:
      throw new Error(`Acción desconocida: ${action.type}`);
  }
}

export function TaskProvider({ userId, children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, userId, (id) => read(KEYS.tasks(id), []));

  // Persistencia automática: cada cambio del estado se guarda para el usuario actual.
  useEffect(() => {
    write(KEYS.tasks(userId), tasks);
  }, [tasks, userId]);

  const addTask = (data) =>
    dispatch({
      type: 'add',
      task: {
        id: uid(),
        status: 'pendiente',
        ...data,
        createdAt: new Date().toISOString(),
        completedAt: data.status === 'completada' ? new Date().toISOString() : null,
      },
    });

  const updateTask = (id, changes) => {
    const extra = {};
    if (changes.status) extra.completedAt = changes.status === 'completada' ? new Date().toISOString() : null;
    dispatch({ type: 'update', id, changes: { ...changes, ...extra } });
  };

  const setStatus = (id, status) => updateTask(id, { status });
  const deleteTask = (id) => dispatch({ type: 'remove', id });
  // Para "Deshacer": vuelve a insertar la tarea tal como estaba (mismo id).
  const restoreTask = (task) => dispatch({ type: 'add', task });

  return (
    <TaskContext.Provider value={{ tasks, addTask, updateTask, setStatus, deleteTask, restoreTask }}>
      {children}
    </TaskContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTasks() {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTasks debe usarse dentro de <TaskProvider>');
  return ctx;
}
