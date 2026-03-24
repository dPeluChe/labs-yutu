# Task TODO List

Backlog priorizado para las proximas sesiones.
Ultima actualizacion: 2026-03-24

---

## Critical - Bloquean Publicacion en Chrome Web Store

### 1) Crear Iconos de Extension
- [ ] Disenar/generar iconos en 16x16, 48x48, 128x128 px (PNG)
- [ ] Crear carpeta `icons/` con los 3 tamanos
- [ ] Agregar campo `icons` en manifest.json
- [ ] Agregar `default_icon` en `action` del manifest.json
- [ ] Actualizar `scripts/build.mjs` para copiar iconos a `dist/`
- **Por que**: Chrome Web Store requiere iconos. Sin ellos la extension muestra un puzzle generico y no se puede publicar.

### 2) Reducir Host Permissions
- [ ] Evaluar si `external-content.js` (match `http://*/*`, `https://*/*`) es necesario para v1 de publicacion
- [ ] Opcion A: Eliminarlo del manifest y dejarlo como feature futura opt-in
- [ ] Opcion B: Moverlo a `optional_permissions` + `chrome.scripting.registerContentScripts()` dinamico
- [ ] Actualizar manifest.json segun decision
- **Por que**: Permisos en TODAS las webs levanta red flags en revision de Chrome Web Store y asusta a usuarios ("can read and change all your data on all websites").

### 3) Mejorar Descripcion del Manifest
- [ ] Cambiar `"description": "Experimental enhancements for YouTube"` por algo descriptivo
- [ ] Ejemplo: `"Open YouTube videos in floating windows. Speed controls, auto-close, and distraction-free viewing."`
- **Por que**: Chrome Web Store necesita descripcion clara. "Experimental" no genera confianza.

---

## Medium Priority - Mejoras y Testing

### 4) Speed Control Reliability
- [ ] Validar por que el control de velocidad no cubre todos los escenarios esperados
- [ ] Definir alcance exacto: pestana principal, ventana flotante, o ambas
- [ ] Probar en: YouTube watch normal, YouTube shorts, ventana flotante
- [ ] Integrar botones `+` y `-` opcionales para ajuste incremental
- [ ] Asegurar compatibilidad con ocultado de elementos (`hider.js`)

### 5) Keep Injection Stable on Dynamic SERPs
- [ ] Probar mas variantes de Google SERP (bloques expandidos, carruseles, modulos mixtos)
- [ ] Confirmar que no reaparecen botones duplicados ni girados
- [ ] Ajustar selectores si Google cambia wrappers

### 6) Popup UX Polish
- [ ] Revisar estados del popup para velocidad y mensajes de error
- [ ] Ajustar copy/feedback para que sea mas claro cuando no hay tab valida
- [ ] Considerar mostrar velocidad actual al abrir popup

---

## Low Priority - Features Futuras

### 7) Transcript Extractor
- [ ] Implementar extraccion de transcripts via hibrido DOM + Innertube API
- [ ] DOM: Click programatico en "Show transcript" -> parsear `ytd-transcript-segment-renderer`
- [ ] Fallback Innertube: POST `/youtubei/v1/player` -> `captionTracks[].baseUrl` + `&fmt=json3`
- [ ] Disenar UI para mostrar transcript (panel lateral o en ventana flotante)
- [ ] Manejar caso de videos sin subtitulos disponibles
- [ ] Research documentado en `docs/archives/YOUTUBE_API_INVESTIGATION.md`

### 8) Preparacion Chrome Web Store
- [ ] Preparar politica de privacidad (requerida por Chrome Web Store)
- [ ] Crear screenshots para la tienda (al menos 1)
- [ ] Crear promotional tile (440x280)
- [ ] Considerar pagina de bienvenida/onboarding (`chrome.runtime.onInstalled`)
- [ ] Agregar `content_security_policy` explicita en manifest

### 9) Ideas Futuras
- [ ] AI summary extractor (si YouTube lo expone en DOM)
- [ ] Soporte de multiples ventanas flotantes simultaneas
- [ ] Custom button themes and positions
- [ ] Internacionalizacion (i18n) para espanol/ingles

---

## References
- Historial y research: `docs/archives/`
- Changelog: `docs/CHANGELOG.md`
- Tareas completadas: `docs/TASK_COMPLETED/` (archivos mensuales YYMM.md)
