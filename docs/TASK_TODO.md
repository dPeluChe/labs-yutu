# Task TODO List

Backlog priorizado para las proximas sesiones.
Ultima actualizacion: 2026-10-02

---

## Critical - Bloquean Publicacion en Chrome Web Store

Sin bloqueos abiertos: iconos, permisos y descripcion estan resueltos (ver `TASK_COMPLETED/2610.md`).
El resto del trabajo de publicacion esta en la tarea 5.

---

## Medium Priority - Mejoras y Testing

### 1) Speed Control Reliability `added: 2026-03-24`
- [ ] Validar por que el control de velocidad no cubre todos los escenarios esperados
- [ ] Definir alcance exacto: pestana principal, ventana flotante, o ambas
- [ ] Probar en: YouTube watch normal, YouTube shorts, ventana flotante
- [ ] Integrar botones `+` y `-` opcionales para ajuste incremental
- [ ] Asegurar compatibilidad con ocultado de elementos (`hider.js`)

### 2) Keep Injection Stable on Dynamic SERPs `added: 2026-03-24`
- [ ] Probar mas variantes de Google SERP (bloques expandidos, carruseles, modulos mixtos)
- [ ] Confirmar que no reaparecen botones duplicados ni girados
- [ ] Ajustar selectores si Google cambia wrappers

### 3) Popup UX Polish `added: 2026-03-24`
- [ ] Revisar estados del popup para velocidad y mensajes de error
- [ ] Ajustar copy/feedback para que sea mas claro cuando no hay tab valida
- [ ] Considerar mostrar velocidad actual al abrir popup

---

## Low Priority - Features Futuras

### 4) Transcript Extractor (requiere backend o approach MAIN world) `added: 2026-03-24`
- [ ] **Approach recomendado**: Backend service con `youtube-transcript-api` (Python). La extension envia videoId a un endpoint propio, recibe transcript. Requiere hosting.
- [ ] **Approach alternativo**: Content script `world: "MAIN"` declarado en manifest (bypasa CSP en Chrome 111+). Accede a `player.getPlayerResponse()` para obtener caption tracks, luego fetch timedtext URLs desde page context.
- **Approaches descartados** (documentados en marzo 2026):
  - Innertube `get_transcript` con protobuf: encoding fragil, 0 bytes response
  - `captionTracks` baseUrl fetch desde content script: URLs firmadas con IP, devuelven 0 bytes fuera del page context
  - URL limpia `timedtext?v=ID&lang=en`: YouTube rechaza sin firma
  - Inline script injection al MAIN world: CSP de YouTube bloquea
  - DOM click en "Show transcript": requiere user gesture real, panel no aparece con click programatico
- [ ] Disenar UI: boton en barra de speed controls, panel colapsable a la derecha
- [ ] Selector de idioma basado en captionTracks disponibles
- [ ] Research base documentado en `docs/ARCHIVED/YOUTUBE_API_INVESTIGATION.md`

### 5) Preparacion Chrome Web Store `added: 2026-03-24`
- [ ] Publicar `PRIVACY_POLICY.md` en una URL estable para el listing
- [ ] Crear screenshots para la tienda (al menos 1)
- [ ] Crear promotional tile (440x280)
- [ ] Considerar pagina de bienvenida/onboarding (`chrome.runtime.onInstalled`)
- [ ] Agregar `content_security_policy` explicita en manifest

### 6) Ideas Futuras `added: 2026-03-24`
- [ ] AI summary extractor (si YouTube lo expone en DOM)
- [ ] Soporte de multiples ventanas flotantes simultaneas
- [ ] Custom button themes and positions
- [ ] Internacionalizacion (i18n) para espanol/ingles

---

## References
- Historial y research: `docs/ARCHIVED/`
- Changelog: `CHANGELOG.md`
- Tareas completadas: `docs/TASK_COMPLETED/` (archivos mensuales YYMM.md)
