import { useState } from 'react';
import { StatusGlyph } from './Icon.jsx';
import TaskCard from './TaskCard.jsx';

const EMPTY_COPY = {
  pendiente: 'Nada esperando. Crea una tarea o arrastra una aquí.',
  en_progreso: 'Nada en marcha. Arrastra una tarea para empezarla.',
  completada: 'Aún no hay tareas terminadas. La primera es la que más cuesta.',
};

// Columna del tablero: agrupa las tareas de un estado y acepta tareas arrastradas.
export default function TaskColumn({ status, label, tasks, onDropTask, ...cardHandlers }) {
  const [over, setOver] = useState(false);

  return (
    <section
      className={`column ${over ? 'column--over' : ''}`}
      aria-label={`${label}: ${tasks.length} tareas`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const id = e.dataTransfer.getData('text/plain');
        if (id) onDropTask(id, status);
      }}
    >
      <header className="column__head">
        <span className={`column__glyph column__glyph--${status}`}><StatusGlyph status={status} /></span>
        <h2>{label}</h2>
        <span className="column__count">{tasks.length}</span>
      </header>
      <div className="column__list">
        {tasks.length === 0
          ? <p className="column__empty">{EMPTY_COPY[status]}</p>
          : tasks.map((t) => <TaskCard key={t.id} task={t} {...cardHandlers} />)}
      </div>
    </section>
  );
}
