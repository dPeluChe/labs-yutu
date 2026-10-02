# Yutu Labs Extension

Una extensión de Chrome para abrir videos de YouTube y Vimeo en ventanas flotantes, sin salir de la página actual.

## Características Principales

*   **Botones en Miniaturas:**
    *   Icono siempre visible sobre la miniatura y botón "Open" al pasar el cursor por la fila de metadata (Home, Feed, Sidebar, Búsqueda, Shorts).
    *   Pestaña "Selector" del popup: elige con el cursor (selector visual) dónde se coloca el botón si YouTube cambia su estructura.
*   **Botón "View" en Enlaces Externos:**
    *   Detecta enlaces de YouTube/Vimeo en Google y otras webs.
    *   Inyecta un botón compacto y discreto junto al enlace.
*   **Ventana Flotante:**
    *   Al hacer clic en "Open/View", se abre el video en una ventana nueva pequeña (854x480).
    *   Posicionada en la esquina inferior derecha de tu pantalla.
    *   Soporta URLs de YouTube y Vimeo.
    *   Puedes redimensionar y mover la ventana libremente.
*   **Controles Inline de Velocidad (Popup):**
    *   Incluye botones rápidos `1x`, `1.25x`, `1.5x`, `2x` dentro de la ventana flotante.
    *   El widget se centra en la fila superior del popup y se adapta al espacio disponible.
    *   Soporta hotkeys (`⌥/Alt + 1..4`).
    *   Incluye opción `Close on finish` para cerrar automáticamente al terminar el video.
*   **Controles de velocidad en Shorts:** también disponibles en la página del reproductor de Shorts.
*   **Sitios externos (opt-in):** el popup permite activar la extensión en dominios concretos; los permisos se piden solo para esos dominios.
*   **Limpieza Visual del Popup:**
    *   Permite ocultar descripción, recomendaciones, header, acciones y merch shelf.
    *   Los hide rules se reaplican después de navegación SPA dentro del popup.

## Instalación (Modo Desarrollador)

1.  Clona o descarga este repositorio y ejecuta `npm install && npm run build` (genera `dist/`).
2.  Abre Google Chrome y ve a `chrome://extensions/`.
3.  Activa el "Modo de desarrollador" (esquina superior derecha).
4.  Haz clic en "Cargar descomprimida" (Load unpacked).
5.  Selecciona la carpeta `labs-yutu/dist` dentro del proyecto.

## Requisitos del Sistema

*   **Google Chrome** (cualquier versión moderna)
*   **Node.js 18+** (necesario para generar `dist/`)
*   **NPM** (solo para desarrollo)

## Desarrollo

### Comandos

```bash
# Instalar dependencias
npm install

# Construir la extensión (genera carpeta dist/)
npm run build

# Desarrollo (reconstrucción automática)
npm run watch
```

## Estructura del Proyecto

*   `/content`: Scripts y estilos inyectados por contexto.
    *   `content.js`: Núcleo compartido (YutuPiPManager)
    *   `youtube-content.js`: Inyección para cards de YouTube + speed control messages
    *   `external-content.js`: Inyección en Google (alcance `google`) y sitios opt-in con enlaces YouTube/Vimeo
    *   `content.css`: Estilos del botón PiP
*   `/background`: Service worker de la extensión.
*   `/popup`: Interfaz del popup de la extensión (icono en la barra).
*   `/scripts`: Scripts de construcción (esbuild).
*   `/icons`: Iconos PNG (`npm run icons` los regenera)
*   `/dist`: Carpeta de salida (cargar esta carpeta en `chrome://extensions`) del build (generada automáticamente).

## Tecnología

*   **chrome.windows.create()**: Abre videos en ventanas popup nativas desde el service worker
*   **Vanilla JavaScript**: Sin frameworks, bundle mínimo
*   **esbuild**: Build system ultra-rápido
*   **Chrome Manifest V3**: Última versión del sistema de extensiones

## Cómo Funciona

1. **Inyección Segmentada**: La extensión usa content scripts separados para YouTube, Google y otras webs.
2. **Detección de Enlaces**: En sitios externos detecta enlaces YouTube/Vimeo y añade botón `View`.
3. **Observer con Debounce**: Reduce reinyecciones en páginas dinámicas.
4. **Apertura de Ventana**: Al hacer clic, usa la API de extensión para abrir el video en ventana flotante.
5. **Posicionamiento**: La ventana se abre en esquina inferior derecha (854x480, aspecto 16:9).
6. **Modo Popup Persistente**: La ventana marcada con `yutu_popup=true` conserva su comportamiento aun si YouTube rehidrata o navega internamente.

## Troubleshooting

### Ventana no se abre

1. Recarga la extensión en `chrome://extensions/` y refresca la pestaña de YouTube
2. Confirma que cargaste la carpeta `dist/` (no la raíz del repo) y que el build terminó sin errores
3. Revisa "Inspect service worker" en `chrome://extensions/` para ver errores de `chrome.windows.create`

### Botones no aparecen

1. Verifica que la extensión está activa en `chrome://extensions/`
2. Refresca la página de YouTube (F5)
3. Revisa la consola (F12) para errores
4. Si YouTube cambió su estructura, los selectores pueden necesitar actualización

## Calidad

```bash
npm run lint    # eslint + stylelint
npm test        # node:test (url-utils, manifest)
npm run check   # lint + test + build
npm run package # build + builds/yutu-labs-v<version>.zip (Chrome Web Store)
```

## Documentación

Estructura declarada en [`.doctos.yml`](./.doctos.yml), índice en [docs/README.md](./docs/README.md). Textos del Chrome Web Store en `docs/STORE/`, historial de embeds descartados en `docs/ARCHIVED/`.
