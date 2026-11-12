import Modal from './Modal.jsx';

export default function ConfirmDialog({ task, onConfirm, onClose }) {
  return (
    <Modal title="¿Eliminar esta tarea?" onClose={onClose} size="sm">
      <p className="confirm__text">
        «{task.title}» se borrará de tu tablero. Esta acción no se puede deshacer.
      </p>
      <div className="form__actions">
        <button type="button" className="btn btn--ghost" onClick={onClose}>Cancelar</button>
        <button type="button" className="btn btn--danger" onClick={onConfirm}>Eliminar</button>
      </div>
    </Modal>
  );
}
