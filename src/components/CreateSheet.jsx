import { useRef } from 'react';
import Modal from './Modal.jsx';
import QuickAdd from './QuickAdd.jsx';

// Hoja de creación: un solo campo enfocado en "Escribe como hablas".
export default function CreateSheet({ onCreate, onClose, onFullForm }) {
  const inputRef = useRef(null);
  return (
    <Modal title="Nueva tarea" onClose={onClose}>
      <p className="sheet__hint">Escríbela como se la dirías a alguien. Space-out entiende la fecha, la prioridad y las etiquetas.</p>
      <QuickAdd inputRef={inputRef} onCreate={(data) => { onCreate(data); onClose(); }} />
      <div className="sheet__alt">
        <span>¿Prefieres llenar campos?</span>
        <button className="link-btn" onClick={onFullForm}>Usar el formulario completo →</button>
      </div>
    </Modal>
  );
}
