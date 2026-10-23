/**
 * Jerarquía de secciones -> subsecciones del Home (diseño del cliente,
 * ver designs/02-inicio-comidas.png y designs/03-inicio-suplementos.png).
 *
 * El backend NO tiene jerarquía: "Comidas", "Suplementos" y "Desayunos",
 * "Almuerzos", etc. son todos filas planas de `business_types`
 * (GET {ordering.root}/business_types), sin parent/children (ver análisis
 * en la conversación con el equipo). Esta jerarquía es una decisión tomada
 * SOLO en el frontend: este archivo es la única fuente de verdad de qué
 * subsección pertenece a qué sección.
 *
 * El match contra los tipos reales que devuelve la API es por NOMBRE EXACTO
 * (`type.name`), no por id — así, si en el Dashboard crean o recrean un
 * tipo con un id distinto pero el mismo nombre, esta jerarquía lo sigue
 * reconociendo. Si cambian el nombre acá no coincide más y la sub/sección
 * simplemente no se muestra (no se inventa nada: solo se listan tipos que
 * la API realmente devolvió, habilitados).
 *
 * Para agregar o reordenar secciones/subsecciones: editar solo este archivo.
 * El orden de los arrays define el orden en pantalla.
 */

export const HOME_SECTIONS_HIERARCHY = [
  {
    section: 'Comidas',
    subsections: ['Desayunos', 'Almuerzos', 'Fast Food', 'Postres', 'Meriendas', 'Cena']
  },
  {
    section: 'Suplementos',
    subsections: []
  },
  {
    section: 'Productos',
    subsections: []
  },
  {
    section: 'Lugares',
    subsections: []
  }
]

/**
 * Nombres de sección en el orden en que deben mostrarse las tabs.
 */
export const HOME_SECTION_NAMES = HOME_SECTIONS_HIERARCHY.map(({ section }) => section)

/**
 * Devuelve los nombres de subsección configurados para una sección,
 * o un array vacío si la sección no tiene subsecciones definidas.
 */
export const getSubsectionNames = (sectionName) =>
  HOME_SECTIONS_HIERARCHY.find(({ section }) => section === sectionName)?.subsections ?? []
