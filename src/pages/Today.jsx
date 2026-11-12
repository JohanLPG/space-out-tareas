import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useWorkspace } from '../context/WorkspaceContext.js';
import PageHeader from '../components/PageHeader.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import TaskRow from '../components/TaskRow.jsx';
import WeekStrip from '../components/WeekStrip.jsx';
import Icon from '../components/Icon.jsx';
import { formatDue, isOverdue, priorityLabel, todayISO } from '../utils/tasks.js';

const WEIGHT = { alta: 0, media: 1, baja: 2 };

// Elige UNA tarea para hacer ahora: primero lo vencido, luego lo de hoy, luego lo empezado.
function pickNext(tasks) {
  const today = todayISO();
  const rank = (t) => [
    t.dueDate < today ? 0 : t.dueDate === today ? 1 : t.status === 'en_progreso' ? 2 : 3,
    WEIGHT[t.priority] ?? 3,
    t.dueDate || '9999',
  ];
  return tasks
    .filter((t) => t.status !== 'completada')
    .sort((a, b) => {
      const A = rank(a);
      const B = rank(b);
      for (let i = 0; i < A.length; i++) if (A[i] !== B[i]) return A[i] < B[i] ? -1 : 1;
      return 0;
    })[0];
}

function reasonFor(task) {
  const today = todayISO();
  if (isOverdue(task)) return { text: `Venció ${formatDue(task.dueDate).toLowerCase()}`, late: true };
  if (task.dueDate === today) return { text: 'Vence hoy' };
  if (task.status === 'en_progreso') return { text: `Ya la empezaste · vence ${formatDue(task.dueDate).toLowerCase()}` };
  return { text: `Vence ${formatDue(task.dueDate).toLowerCase()}` };
}

// Sección "Hoy": responde a una sola pregunta, ¿qué hago ahora?
export default function Today() {
  const { user } = useAuth();
  const { tasks, openTask, changeStatus, openCreate, selectedId } = useWorkspace();
  const navigate = useNavigate();

  const today = todayISO();
  const dueToday = tasks.filter((t) => t.dueDate === today);
  const doneToday = dueToday.filter((t) => t.status === 'completada').length;
  const late = tasks.filter(isOverdue);
  const list = [...dueToday].sort((a, b) => (a.status === 'completada') - (b.status === 'completada') || (WEIGHT[a.priority] - WEIGHT[b.priority]));
  const next = pickNext(tasks);
  const first = user.name.split(' ')[0];
  const dateLabel = new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
  const openCount = dueToday.length - doneToday;

  let sub = 'No tienes nada programado para hoy.';
  if (dueToday.length) sub = openCount === 0 ? 'Terminaste todo lo de hoy. Buen trabajo.' : `Hoy tienes ${openCount === 1 ? '1 tarea' : `${openCount} tareas`} por hacer.`;

  return (
    <>
      <PageHeader eyebrow={dateLabel} title={<>Hola, {first}.</>} sub={sub} />

      <div className="today-top">
        {next ? (
          <section className="tile next" aria-label="Tu siguiente paso">
            <p className="tile__label">Tu siguiente paso</p>
            <button className="next__title" onClick={() => openTask(next.id)}>{next.title}</button>
            <p className={`next__why ${reasonFor(next).late ? 'is-late' : ''}`}>
              {reasonFor(next).text} · prioridad {priorityLabel(next.priority).toLowerCase()}
              {(next.tags ?? []).map((t) => <span key={t} className="next__tag">#{t}</span>)}
            </p>
            <div className="next__actions">
              {next.status === 'pendiente' && (
                <button className="btn btn--ghost" onClick={() => changeStatus(next.id, 'en_progreso')}>Empezar</button>
              )}
              <button className="btn btn--primary" onClick={() => changeStatus(next.id, 'completada')}>
                <Icon name="check" size={16} strokeWidth={2.2} /> Completar
              </button>
              <button className="link-btn next__more" onClick={() => openTask(next.id)}>Ver detalles <Icon name="arrow" size={15} /></button>
            </div>
          </section>
        ) : (
          <section className="tile next next--calm">
            <p className="tile__label">Tu siguiente paso</p>
            <p className="next__title">{tasks.length ? 'Estás al día.' : 'Empecemos.'}</p>
            <p className="next__why">{tasks.length ? 'No tienes tareas abiertas. Disfruta el espacio.' : 'Crea tu primera tarea escribiéndola como hablas.'}</p>
            <div className="next__actions">
              <button className="btn btn--light" onClick={openCreate}><Icon name="plus" size={16} strokeWidth={2} /> Nueva tarea</button>
            </div>
          </section>
        )}

        <section className="tile ringtile" aria-label="Progreso de hoy">
          <ProgressRing done={doneToday} total={dueToday.length} />
          <div>
            <p className="tile__label">Progreso de hoy</p>
            <p className="ringtile__big">{dueToday.length ? `${Math.round((doneToday / dueToday.length) * 100)}%` : '—'}</p>
            <p className="ringtile__small">{dueToday.length ? `${doneToday} de ${dueToday.length} hechas` : 'Sin tareas para hoy'}</p>
          </div>
        </section>
      </div>

      {late.length > 0 && (
        <button className="guide" onClick={() => navigate('/tablero?dia=vencidas')}>
          <span className="guide__icon"><Icon name="alert" size={18} /></span>
          <span className="guide__text">
            <b>{late.length === 1 ? '1 tarea vencida' : `${late.length} tareas vencidas`}</b>
            Revisa lo que quedó pendiente de días anteriores.
          </span>
          <span className="guide__go">Revisar <Icon name="arrow" size={16} /></span>
        </button>
      )}

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Para hoy <span>{dueToday.length}</span></h2>
        </div>
        {list.length ? (
          <div className="rows">
            {list.map((t, i) => <TaskRow key={t.id} task={t} index={i} onOpen={openTask} onSetStatus={changeStatus} selected={selectedId === t.id} />)}
          </div>
        ) : (
          <div className="hint-empty">
            <p>Nada programado para hoy.</p>
            <button className="link-btn" onClick={openCreate}><Icon name="plus" size={15} /> Agregar algo para hoy</button>
          </div>
        )}
      </section>

      <section className="section">
        <div className="section__head">
          <h2 className="section__title">Tu semana</h2>
          <span className="section__hint">Toca un día para verlo en el tablero</span>
        </div>
        <WeekStrip tasks={tasks} selected="" onSelect={(day) => day && navigate(`/tablero?dia=${day}`)} />
      </section>
    </>
  );
}
