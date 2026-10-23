# Pendientes con el cliente — Home (pantalla "Comidas")

Notas en español simple sobre qué quedó distinto del diseño (`designs/02-inicio-comidas.png`
y `designs/03-inicio-suplementos.png`) y por qué. Nada de esto es un bug del código:
son cosas que dependen del Dashboard de Ordering, de un archivo que falta, o de una
decisión de diseño que hay que confirmar.

## 1. Barra de "Entrega / Levantar" + dirección

El diseño del cliente no la muestra. Es una función real del sistema (elegir si el
pedido es delivery o pickup, y qué dirección usar) — no se puede sacar sin romper
cómo se piden productos.

**Qué hice:** la saqué de la barra superior (donde chocaba con el logo) y la puse
chica, debajo del buscador, dentro de la banda amarilla. Sigue siendo el mismo
componente real (`AddressOrderType`), solo que más chico y discreto.

**Pendiente:** confirmar con el cliente si esa ubicación les sirve, o si prefieren
que viva en otro lado (por ejemplo, dentro del menú de la izquierda).

## 2. Colores azules (botón "Buscar", "Entrega" activo, "Registrate")

No salen de `theme.json` — ya está confirmado (cambiamos `primary` a amarillo ahí y
sigue saliendo azul en todos lados). Vienen pisados por la configuración del
Dashboard de Ordering (`My products → Website theme settings → primary_btn_color`),
que hoy tiene cargado el azul por defecto de la plataforma.

**Pendiente:** pedirle a quien tenga acceso al Dashboard que cargue el amarillo
(`#FFE104`) ahí. No es algo que se arregle desde el código de este repo.

## 3. Logo "GlutenFre" e insignia "Sin Gluten"

A diferencia de la pantalla de login (donde el logo era una imagen externa que no
vino incluida), en **este** diseño (`02-inicio-comidas.svg`) el logo y la insignia
sí estaban como dibujos vectoriales reales dentro del archivo. Los extraje tal cual:

- `src/assets/images/logotype-glutenfre.svg`
- `src/assets/images/badge-sin-gluten.svg`

Se usan como reemplazo del logo del Dashboard (si el Dashboard carga un logo propio
en `My products → Images → Logo`, ese tiene prioridad automáticamente — esto es
solo el respaldo mientras no haya nada cargado ahí).

**Pendiente:** confirmar con el cliente si este es el logo final o si hay una
versión más actualizada / en otro formato.

## 4. Íconos de las subsecciones (Desayunos, Almuerzos, Fast Food, Postres, Meriendas, Cena)

También estaban como vectores reales en el SVG del diseño — los extraje tal cual
(no son una aproximación, son los íconos exactos del cliente). Viven en
`src/ui/src/components/HomeCategories/subsectionIcons.js`.

Las subsecciones solo existen hoy para la sección "Comidas". Si el cliente quiere
subsecciones para "Suplementos", "Productos" o "Lugares", hay que definir cuáles
son y mandar (o confirmar que no hay) íconos para esas también — hoy ese archivo
no tiene nada cargado para esas tres secciones
(`src/ui/src/components/HomeCategories/sectionsHierarchy.js`).

## 5. Banner promocional vacío

Antes mostraba un texto en inglés cuando no había banner cargado. Ahora, si no hay
ningún banner configurado en el Dashboard para la posición `web_home_page`, no se
muestra nada (como pidieron) — vuelve a su comportamiento original de no renderizar
nada cuando está vacío.

## 6. Textos en español

"No categories configured yet" / "No subcategories configured for this section yet"
(estados vacíos de las categorías) ahora tienen el texto en español directamente en
el código, porque son claves nuevas que todavía no existen en el diccionario de
traducciones del sistema (`t()` cae al texto en inglés cuando la clave no está
cargada ahí). Si en algún momento cargan esas claves en el diccionario real
(`HOME_CATEGORIES_EMPTY`, `HOME_SUBCATEGORIES_EMPTY`), ese texto pisaría al nuestro.

## 7. Hueco en blanco entre el buscador y las pestañas (solo en celular, sin login)

Para un usuario que no inició sesión, abajo del buscador aparece "Usa tu cuenta"
con dos botones (Iniciar sesión / Registrate) — es una función existente del
sistema, no algo que yo agregué. El diseño del cliente no contempla esa sección,
y como reserva un espacio fijo (30% de la altura de pantalla) para posicionarse,
queda un hueco en blanco antes de llegar a las pestañas de categorías.

**Pendiente:** decidir con el cliente si ese bloque debe seguir mostrándose en esta
pantalla y, si sí, si hay que ajustarle el espaciado para que no deje ese hueco.
No lo toqué todavía porque es una función de login existente, no solo estilo.

## 8. Fuente Averta

Sigue sin estar el archivo de la fuente en el proyecto (licencia por confirmar,
ver `CLAUDE.md`). Todo el texto usa el fallback sans-serif del sistema.
