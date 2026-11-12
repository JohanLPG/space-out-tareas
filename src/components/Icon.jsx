const PATHS = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4.35-4.35',
  calendar: 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z',
  edit: 'M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10',
  close: 'M6 6l12 12M18 6 6 18',
  sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4',
  columns: 'M5 4h3a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM11 4h2.5a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H11a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM16.5 4H19a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-2.5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z',
  nodes: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.6 7.5l1.9 7.8M15.6 8.6l-2.4 6.8M9 6.3l6 .7',
  sliders: 'M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4',
  chevron: 'm7 10 5 5 5-5',
  chevronRight: 'm10 7 5 5-5 5',
  fit: 'M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4',
  help: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9.6 9.4a2.5 2.5 0 1 1 3.4 2.4c-.6.3-1 .8-1 1.5v.4M12 17h.01',
  tag: 'M3.5 12.5V5a1.5 1.5 0 0 1 1.5-1.5h7.5l8 8a1.5 1.5 0 0 1 0 2.1l-6.4 6.4a1.5 1.5 0 0 1-2.1 0l-8-8ZM8 8h.01',
  flag: 'M5 21V4.5M5 4.5h11.5l-2.2 4.2 2.2 4.3H5',
  alert: 'M12 9v4M12 17h.01M10.3 3.9 2.4 17.6A2 2 0 0 0 4.1 20.6h15.8a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  text: 'M5 6h14M5 11h14M5 16h9',
  circle: 'M12 20.5a8.5 8.5 0 1 0 0-17 8.5 8.5 0 0 0 0 17Z',
  shuffle: 'M4 7h3.5c4 0 5 10 9 10H20M4 17h3.5c1.5 0 2.5-1.4 3.3-3M16.5 7H20M17 4l3 3-3 3M17 14l3 3-3 3',
};

export default function Icon({ name, size = 18, strokeWidth = 1.7, ...rest }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      <path d={PATHS[name]} />
    </svg>
  );
}

// Glifo de estado: círculo vacío, medio lleno o completo. Es el lenguaje visual de la app.
export function StatusGlyph({ status, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true" className={`glyph glyph--${status}`}>
      <circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {status === 'en_progreso' && <path d="M8 1.75a6.25 6.25 0 0 1 0 12.5Z" fill="currentColor" />}
      {status === 'completada' && <circle cx="8" cy="8" r="6.25" fill="currentColor" />}
    </svg>
  );
}
