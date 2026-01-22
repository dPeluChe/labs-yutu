# Yutu Labs Extension

Una extensión de Chrome para mejorar la experiencia de usuario en YouTube abriendo videos en ventanas flotantes.

## Características Principales

*   **Botón "Abrir" en Miniaturas:**
    *   Inyecta automáticamente un botón en las miniaturas de los videos (Home, Feed, Sidebar, Búsqueda).
    *   Permite visualizar el video sin salir de la página actual.
*   **Ventana Flotante:**
    *   Al hacer clic en "Abrir", se abre el video en una ventana nueva pequeña (854x480).
    *   Posicionada en la esquina inferior derecha de tu pantalla.
    *   Usa el reproductor oficial de YouTube (sin restricciones de embed).
    *   Puedes redimensionar y mover la ventana libremente.

## Instalación (Modo Desarrollador)

1.  Clona o descarga este repositorio.
2.  Abre Google Chrome y ve a `chrome://extensions/`.
3.  Activa el "Modo de desarrollador" (esquina superior derecha).
4.  Haz clic en "Cargar descomprimida" (Load unpacked).
5.  Selecciona la carpeta `labs-yutu/dist` dentro del proyecto.

## Requisitos del Sistema

*   **Google Chrome** (cualquier versión moderna)
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

*   **window.open()**: Solución pragmática que abre videos en ventanas nativas del navegador
*   **Vanilla JavaScript**: Sin frameworks, bundle mínimo
*   **esbuild**: Build system ultra-rápido
*   **Chrome Manifest V3**: Última versión del sistema de extensiones

## Cómo Funciona

1. **Inyección de Botones**: La extensión usa `MutationObserver` para detectar videos en YouTube
2. **Apertura de Ventana**: Al hacer clic, usa `window.open()` para abrir el video en ventana flotante
3. **Posicionamiento**: La ventana se abre en esquina inferior derecha (854x480, aspecto 16:9)
4. **Player Oficial**: La ventana carga directamente YouTube.com (sin restricciones de embed)

## Troubleshooting

### Ventana no se abre

**Causa**: Ventanas emergentes bloqueadas por Chrome

**Solución**:
1. Ve a `chrome://settings/content/popups`
2. Agrega `youtube.com` a la lista de permitidos
3. O haz click en el ícono de bloqueo en la barra de direcciones y permite popups

### Botones no aparecen

1. Verifica que la extensión está activa en `chrome://extensions/`
2. Refresca la página de YouTube (F5)
3. Revisa la consola (F12) para errores
4. Si YouTube cambió su estructura, los selectores pueden necesitar actualización

## Documentación

Ver carpeta `docs/` para documentación técnica completa:
- **TECHNICAL_EVALUATION.md**: Análisis de soluciones
- **TESTING.md**: Guía de pruebas (12+ escenarios)
- **ERROR_153_DEBUGGING.md**: Troubleshooting del error de embed
- **REFACTOR_SUMMARY.md**: Historial de cambios
