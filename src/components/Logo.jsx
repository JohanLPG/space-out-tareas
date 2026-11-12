// Logotipo "space-out": el guion es una barra de acento que se estira al pasar el mouse,
// como si las letras tomaran aire. Guiño al nombre: darle espacio a tu día.
export default function Logo({ inverse = false }) {
  return (
    <span className={`logo ${inverse ? 'logo--inverse' : ''}`} aria-label="Space-out">
      <span aria-hidden="true">space</span>
      <span className="logo__dash" aria-hidden="true" />
      <span aria-hidden="true">out</span>
    </span>
  );
}
