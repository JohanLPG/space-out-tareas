const FOLD = { á: 'a', à: 'a', ä: 'a', é: 'e', è: 'e', ë: 'e', í: 'i', ì: 'i', ï: 'i', ó: 'o', ò: 'o', ö: 'o', ú: 'u', ù: 'u', ü: 'u', ñ: 'n' };

// Minúsculas y sin tildes SIN cambiar la longitud del texto: así las posiciones
// de lo encontrado coinciden con el texto original (para resaltarlo).
export const fold = (s = '') => s.toLowerCase().replace(/[áàäéèëíìïóòöúùüñ]/g, (c) => FOLD[c]);

// Convierte "Tesis, #universidad  grupo" en ["tesis", "universidad", "grupo"].
export const parseTags = (text = '') =>
  [...new Set(text.split(/[\s,#]+/).map((t) => t.trim().toLowerCase()).filter(Boolean))].slice(0, 8);
