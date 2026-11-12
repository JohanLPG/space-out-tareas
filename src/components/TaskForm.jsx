import { useState } from 'react';
import Modal from './Modal.jsx';
import { PRIORITIES, STATUSES } from '../utils/tasks.js';
import { parseTags } from '../utils/text.js';

const EMPTY = { title: '', description: '', dueDate: '', priority: 'media', status: 'pendiente', tags: [] };

// Formulario controlado para crear (task = null) o editar una tarea existente.
export default function TaskForm({ task, onSave, onClose }) {
  const isEdit = Boolean(task?.id);
  const [form, setForm] = useState(() => ({ ...EMPTY, ...task, tagsText: (task?.tags ?? []).join(', ') }));
  const tags = parseTags(form.tagsText);
  const [error, setError] = useState('');

  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  function onSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError('La tarea necesita un título.');
    if (!form.dueDate) return setError('Elige una fecha de vencimiento.');
    onSave({
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate,
      priority: form.priority,
      status: form.status,
      tags,
    });
  }

  return (
    <Modal title={isEdit ? 'Editar tarea' : 'Nueva tarea'} onClose={onClose}>
      <form className="form" onSubmit={onSubmit} noValidate>
        <label className="field">
          <span>Título</span>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={80} placeholder="Ej. Preparar la exposición del viernes" />
        </label>
        <label className="field">
          <span>Descripción</span>
          <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={400} placeholder="Detalles, enlaces o pasos a seguir" />
        </label>
        <div className="form__row">
          <label className="field">
            <span>Fecha de vencimiento</span>
            <input type="date" value={form.dueDate} onChange={(e) => set('dueDate', e.target.value)} />
          </label>
          <label className="field">
            <span>Estado</span>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              {STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Etiquetas <small className="field__hint">separadas por coma</small></span>
          <input value={form.tagsText} onChange={(e) => set('tagsText', e.target.value)} placeholder="tesis, universidad" />
          {tags.length > 0 && (
            <span className="tag-preview">{tags.map((t) => <span key={t} className="tagchip">#{t}</span>)}</span>
          )}
        </label>
        <fieldset className="field">
          <legend>Prioridad</legend>
          <div className="segmented segmented--wide">
            {PRIORITIES.map((p) => (
              <label key={p.id} className={`segmented__item ${form.priority === p.id ? 'is-active' : ''}`}>
                <input type="radio" name="priority" value={p.id} checked={form.priority === p.id} onChange={() => set('priority', p.id)} />
                <span className={`prio-dot prio-dot--${p.id}`} /> {p.label}
              </label>
            ))}
          </div>
        </fieldset>
        {error && <p className="form__error" role="alert">{error}</p>}
        <div className="form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn--primary">{isEdit ? 'Guardar cambios' : 'Crear tarea'}</button>
        </div>
      </form>
    </Modal>
  );
}
