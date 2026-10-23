# glutenfre: Website (rediseño de frontend)

## Qué es
Copia de trabajo del Website Marketplace de Ordering.co (React 18 + Vite + styled-components, pnpm, Node 24).
Proyecto backend: `glutenfre` (marketplace de comida sin gluten, varias tiendas).
Mi tarea: aplicar el diseño del cliente (colores, tipografía, logo, pantallas). No toco el backend.

## Reglas
- NO editar `src/@/components` (submódulo fijado de Ordering).
- La presentación va en `src/ui`, `src/pages`, `src/theme.json` y estilos propios.
- Sin claves, tokens ni archivos de Firebase en el código ni en el chat.
- Es producción y no hay sandbox: NUNCA hacer pedidos, ni crear o borrar datos reales.
- No hacer commit ni push sin que yo lo pida. Cambios chicos, uno por vez.
- Antes de cambiar algo, explicar qué archivo y por qué. Responder en español.

## Comandos
- Arrancar: `corepack pnpm marketplace:start` (http://127.0.0.1:3000)
- Diagnóstico: `corepack pnpm marketplace:doctor`
- Calidad antes de entregar: `pnpm lint:check`, `pnpm test`, `pnpm build`

## Diseño
Paleta: primary #FFE104, darkGreen #48B593, lightGreen #E0F0E8, secundary #F0F1F5, black/darkText #1E1E1C.
Referencias de pantalla en `designs/` (SVG del cliente). Fuente: Averta (licencia por confirmar).
Los diseños de `designs/` son de celular. La web se implementa mobile-first: fidelidad al diseño a 390px.
En escritorio: mismo diseño centrado con ancho máximo, sin rediseñar. Revisar siempre ambos anchos.

## Pendiente conocido
Cambié `src/theme.json` pero el color no se ve en la página. Hipótesis: el tema viene del backend
(configuración de la web en el Dashboard) y pisa el archivo local. Hay que investigarlo antes de seguir.
