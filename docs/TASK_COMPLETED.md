# Task Completed Log

Registro resumido de trabajo completado y validado.

---

## 2026-02-20 - Context Segmentation + External Links

### Completed
- Split de content scripts por contexto:
  - `content/youtube-content.js`
  - `content/google-content.js`
  - `content/external-content.js`
- Refactor de `content/content.js` a núcleo compartido (`YutuPiPManager`)
- Soporte de inyección de botón `View` para enlaces YouTube/Vimeo en Google y otras webs
- Ajustes de inyección en Google para evitar:
  - botones duplicados
  - botón con orientación/rotación incorrecta
- Debounce en `MutationObserver` para reducir reinyecciones
- Apertura de ventana flotante por `targetUrl` (YouTube/Vimeo)
- Actualización de `manifest.json` y `scripts/build.mjs` para entrypoints segmentados
- Build validado con `npm run build`
- Controles inline de velocidad dentro de la ventana flotante
- Hotkeys de velocidad (`⌥/Alt + 1..4`)
- Toggle `Close on finish`:
  - en popup global de la extensión
  - en widget inline del player flotante
- Cierre automático de ventana al terminar video (si la opción está activa)
- Nuevos toggles de ocultamiento en popup:
  - `Hide all (default)`
  - `Hide Like/More actions`
  - `Hide Merch shelf`
- Soporte de inyección de botón en estructura de Shorts lockup

### Notes
- Este bloque consolida trabajo reciente de integración por contexto.
- Detalles históricos anteriores a 2026 se movieron a `docs/archives/TASK_COMPLETED_2025.md`.

---

## Historical Logs
- `docs/archives/TASK_COMPLETED_2025.md`
