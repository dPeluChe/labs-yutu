# Yutu Labs Extension

Una extensión de Chrome experimental para mejorar la experiencia de usuario en YouTube usando Document Picture-in-Picture.

## Características Principales

*   **Botón Picture-in-Picture ("PiP"):**
    *   Inyecta automáticamente un botón "PiP" en las miniaturas de los videos (Home, Feed, Sidebar, Búsqueda).
    *   Permite visualizar el video sin salir de la página actual ni navegar a una nueva URL.
*   **Reproductor Flotante (Always-on-Top):**
    *   Al hacer clic en "PiP", se abre una ventana flotante que permanece siempre visible.
    *   Diseño moderno con gradiente morado y controles integrados.
    *   Ventana 16:9 con player de YouTube completamente funcional.
    *   Continúa reproduciendo mientras navegas por YouTube o cualquier otra pestaña.

## Instalación (Modo Desarrollador)

1.  Clona o descarga este repositorio.
2.  Abre Google Chrome y ve a `chrome://extensions/`.
3.  Activa el "Modo de desarrollador" (esquina superior derecha).
4.  Haz clic en "Cargar descomprimida" (Load unpacked).
5.  Selecciona la carpeta `labs-yutu/dist` dentro del proyecto.

## Requisitos del Sistema

*   **Google Chrome 116+** (requerido para Document Picture-in-Picture API)
*   **Node.js 16+** (solo para desarrollo)
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

*   `/content`: Scripts y estilos que se inyectan en la página de YouTube.
    *   `content.js`: Lógica principal (YutuPiPManager) con Document Picture-in-Picture API
    *   `content.css`: Estilos del botón PiP
*   `/background`: Service worker de la extensión.
*   `/popup`: Interfaz del popup de la extensión (icono en la barra).
*   `/scripts`: Scripts de construcción (esbuild).
*   `/dist`: Carpeta de salida del build (generada automáticamente).

## Tecnología

*   **Document Picture-in-Picture API**: API oficial de Chrome para ventanas flotantes
*   **Vanilla JavaScript**: Sin frameworks, bundle mínimo
*   **esbuild**: Build system ultra-rápido
*   **Chrome Manifest V3**: Última versión del sistema de extensiones
