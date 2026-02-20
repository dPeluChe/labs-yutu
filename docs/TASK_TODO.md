# Task TODO List

Backlog actual y priorizado para las próximas sesiones.

---

## High Priority

### 1) Speed Control Reliability (Pending)
- [ ] Validar por qué el control de velocidad no cubre todos los escenarios esperados
- [ ] Definir alcance exacto:
  - pestaña principal de YouTube
  - ventana flotante creada por la extensión
  - ambas
- [ ] Unificar una sola estrategia técnica (evitar duplicidad de enfoques)
- [ ] Añadir manejo robusto de errores/feedback en popup
- [ ] Probar en:
  - YouTube watch normal
  - YouTube shorts (si aplica)
  - ventana flotante

### 1.1) Floating Window Inline Speed Controls (New)
- [x] Inyectar controles propios de velocidad dentro de la ventana flotante (`yutu_popup=true`)
- [x] Evitar depender del panel nativo de YouTube para cambiar velocidad (menos clics)
- [x] Añadir botones rápidos: `1x`, `1.25x`, `1.5x`, `2x`
- [ ] Integrar `+` y `-` opcionales para ajuste incremental
- [x] Sincronizar estado visual con la velocidad real del video
- [x] Reinyectar controles después de navegación SPA dentro del popup
- [ ] Asegurar compatibilidad con ocultado de elementos (`hider.js`)
- [x] Documentar que no es necesario inspeccionar HTML interno del menú de YouTube (UI propia de extensión)

### 2) Keep Injection Stable on Dynamic SERPs
- [ ] Probar más variantes de Google SERP (bloques expandidos, carruseles, módulos mixtos)
- [ ] Confirmar que no reaparecen botones duplicados ni girados
- [ ] Ajustar selectores si Google cambia wrappers

---

## Medium Priority

### 3) Content Module Cleanup
- [ ] Revisar responsabilidades en `content/content.js` y extraer utilidades si crece más
- [ ] Documentar contratos internos de mensajería (`action`, payload esperado)
- [ ] Evaluar métricas básicas de performance del observer en páginas pesadas

### 4) Popup UX
- [ ] Revisar estados del popup para velocidad y mensajes de error
- [ ] Ajustar copy/feedback para que sea más claro cuando no hay tab válida

---

## Low Priority / Ideas

### 5) Future Features
- [ ] Transcript extractor (research ya documentado)
- [ ] AI summary extractor (si YouTube lo expone en DOM)
- [ ] Multiple floating windows
- [ ] Custom button themes and positions

---

## References
- Historial y research: `docs/archives/`
- Changelog consolidado: `docs/CHANGELOG.md`
