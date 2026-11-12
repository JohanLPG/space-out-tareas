// Encabezado de cada sección: dice dónde estás y qué puedes hacer aquí, en una línea.
export default function PageHeader({ eyebrow, title, sub, children }) {
  return (
    <header className="phead">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="phead__title">{title}</h1>
        {sub && <p className="phead__sub">{sub}</p>}
      </div>
      {children && <div className="phead__actions">{children}</div>}
    </header>
  );
}
