import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import Icon from './Icon.jsx';
import { TokenText, ParsedChips } from './TokenText.jsx';
import { parseTask, EXAMPLES } from '../utils/parseTask.js';
import { todayISO } from '../utils/tasks.js';

// Barra "Escribe como hablas": una sola línea crea una tarea completa.
// Un espejo detrás del input resalta en vivo lo que la app entiende.
export default function QuickAdd({ onCreate, inputRef }) {
  const [text, setText] = useState('');
  const [shake, setShake] = useState(false);
  const mirrorRef = useRef(null);
  const parsed = useMemo(() => parseTask(text), [text]);

  const syncScroll = () => {
    if (mirrorRef.current && inputRef.current) {
      mirrorRef.current.style.transform = `translateX(${-inputRef.current.scrollLeft}px)`;
    }
  };
  useLayoutEffect(syncScroll);

  function onSubmit(e) {
    e.preventDefault();
    if (!parsed.title) {
      setShake(true);
      setTimeout(() => setShake(false), 450);
      return;
    }
    onCreate({
      title: parsed.title,
      description: parsed.description,
      dueDate: parsed.dueDate || todayISO(),
      priority: parsed.priority || 'media',
      status: parsed.status || 'pendiente',
      tags: parsed.tags,
    });
    setText('');
  }

  const typing = text.trim().length > 0;

  return (
    <form className={`qa ${typing ? 'is-typing' : ''} ${shake ? 'is-shaking' : ''}`} onSubmit={onSubmit}>
      <div className="qa__field">
        <span className="qa__icon"><Icon name="plus" size={18} strokeWidth={2} /></span>
        <div className="qa__stack">
          <div className="qa__mirror" aria-hidden="true" ref={mirrorRef}>
            <TokenText text={text} tokens={parsed.tokens} />
          </div>
          <input
            ref={inputRef}
            className="qa__input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyUp={syncScroll}
            onClick={syncScroll}
            onScroll={syncScroll}
            placeholder="Escribe como hablas: «Informe el viernes !alta»"
            aria-label="Crear tarea rápida. Puedes escribir fechas como mañana o el viernes, y prioridad con !alta"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        {typing
          ? <button className="qa__submit" aria-label="Crear tarea"><Icon name="arrow" size={17} strokeWidth={2} /></button>
          : <kbd className="kbd" title="Atajo de teclado">N</kbd>}
      </div>

      <div className="qa__preview" aria-live="polite">
        {typing ? (
          <>
            <span className="qa__title">{parsed.title || <em>Falta el título…</em>}</span>
            <ParsedChips parsed={parsed} defaultDate={todayISO()} />
          </>
        ) : (
          <p className="qa__hint">
            <span>Prueba con</span>
            {EXAMPLES.map((ex) => <code key={ex}>{ex}</code>)}
          </p>
        )}
      </div>
    </form>
  );
}
