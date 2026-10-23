/**
 * ⚠️ MOCK DE SOLO DESARROLLO — NUNCA se ejecuta en producción.
 *
 * `import.meta.env.DEV` es `false` en un build de producción (Vite lo
 * reemplaza en build time), así que el `if` que usa este archivo se
 * elimina del bundle final. Además, incluso en desarrollo, hace falta
 * agregar explícitamente `?mock=1` a la URL para activarlo.
 *
 * Sirve para poder ver el diseño de las secciones/subsecciones mientras
 * el Dashboard de glutenfre no tiene Business Types cargados (hoy
 * `GET /business_types` devuelve `[]`). Avisar antes de borrar este
 * archivo o de sacarlo del repo.
 */

export const isHomeCategoriesMockActive = () => {
  if (!import.meta.env.DEV) return false
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('mock') === '1'
}

// Misma forma que la respuesta real de GET {ordering.root}/business_types:
// [{ id, name, enabled, image }]. Los nombres coinciden exactamente con
// sectionsHierarchy.js para poder ver las dos jerarquías armadas.
export const DEV_MOCK_BUSINESS_TYPES = [
  { id: -101, name: 'Comidas', enabled: true, image: null },
  { id: -102, name: 'Suplementos', enabled: true, image: null },
  { id: -103, name: 'Productos', enabled: true, image: null },
  { id: -104, name: 'Lugares', enabled: true, image: null },
  { id: -201, name: 'Desayunos', enabled: true, image: null },
  { id: -202, name: 'Almuerzos', enabled: true, image: null },
  { id: -203, name: 'Fast Food', enabled: true, image: null },
  { id: -204, name: 'Postres', enabled: true, image: null },
  { id: -205, name: 'Meriendas', enabled: true, image: null },
  { id: -206, name: 'Cena', enabled: true, image: null }
]
