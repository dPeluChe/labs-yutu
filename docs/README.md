# Documentación - Yutu Labs

Esta carpeta contiene documentación técnica, histórica y de troubleshooting del proyecto.

---

## 📄 Archivos

### [ATTEMPTS_AND_ALTERNATIVES.md](./ATTEMPTS_AND_ALTERNATIVES.md)
**Historial de intentos técnicos previos**

Documento creado por el desarrollador anterior que detalla:
- Intentos fallidos de embedding (iframe modal, parámetros de origen, no-cookie domain, proxy local)
- Errores encontrados (152/153, embedder.identity.missing.referrer)
- Alternativas propuestas (PiP API, Miniplayer nativo, manipulación de `<video>`)

**Útil para**: Entender qué se intentó antes y por qué falló.

---

### [TECHNICAL_EVALUATION.md](./TECHNICAL_EVALUATION.md)
**Análisis técnico completo de soluciones**

Evaluación profunda de las 3 opciones principales:
- **Opción A**: Document Picture-in-Picture API ⭐⭐⭐⭐⭐ (Implementada)
- **Opción B**: Manipulación del Miniplayer Nativo ⭐⭐⚠️ (No viable)
- **Opción C**: Player Nativo Directo ⭐⭐⭐⭐ (Requiere investigación)

Incluye:
- Código completo de implementación
- Pros/contras de cada opción
- Estrategia de implementación en 3 fases
- Referencias y fuentes

**Útil para**: Entender decisiones de arquitectura y alternativas futuras.

---

### [TESTING.md](./TESTING.md)
**Guía completa de pruebas y validación**

Contiene 12+ escenarios de testing:
- Tests funcionales (botón PiP, apertura de ventana, navegación)
- Tests en diferentes layouts de YouTube (Home, Búsqueda, Sidebar, Canal)
- Tests de errores (navegador no soportado, permisos bloqueados)
- Tests de rendimiento (memory leaks, MutationObserver)
- Checklist de release

**Útil para**: Validar funcionalidad antes de cada commit/release.

---

### [REFACTOR_SUMMARY.md](./REFACTOR_SUMMARY.md)
**Resumen de refactorización completa**

Detalla todos los cambios realizados en la migración a Document PiP:
- Archivos modificados (content.js, content.css, manifest.json, etc.)
- Archivos nuevos creados
- Cambios técnicos internos
- Mejoras de UX/UI
- Trade-offs aceptados

**Útil para**: Entender qué cambió y por qué.

---

### [ERROR_153_DEBUGGING.md](./ERROR_153_DEBUGGING.md)
**Guía de debugging específica para Error 153**

Documentación del error `embedder.identity.missing.referrer`:
- Detalles del error y logs de YouTube
- Intentos de solución (directa, proxy HTML)
- Opciones alternativas a explorar
- Herramientas de debugging
- Network analysis

**Útil para**: Resolver el error 153 si persiste.

---

## 🗂️ Organización

```
docs/
├── README.md                      # Este archivo
├── ATTEMPTS_AND_ALTERNATIVES.md   # Historia (dev anterior)
├── TECHNICAL_EVALUATION.md        # Investigación y análisis
├── TESTING.md                     # Guía de testing
├── REFACTOR_SUMMARY.md            # Cambios realizados
└── ERROR_153_DEBUGGING.md         # Troubleshooting Error 153
```

---

## 📖 Orden de Lectura Sugerido

### Para nuevos desarrolladores:
1. **TECHNICAL_EVALUATION.md** - Entender arquitectura y decisiones
2. **REFACTOR_SUMMARY.md** - Ver estado actual del código
3. **TESTING.md** - Aprender a probar la extensión
4. **ERROR_153_DEBUGGING.md** - Si encuentras el error

### Para debugging de Error 153:
1. **ERROR_153_DEBUGGING.md** - Guía específica
2. **ATTEMPTS_AND_ALTERNATIVES.md** - Contexto histórico
3. **TECHNICAL_EVALUATION.md** - Opciones alternativas

### Para contribuir:
1. **TECHNICAL_EVALUATION.md** - Entender decisiones de arquitectura
2. **TESTING.md** - Validar cambios
3. **REFACTOR_SUMMARY.md** - Ver estructura actual

---

## 🔄 Mantenimiento

Estos documentos deben actualizarse cuando:
- Se encuentren nuevas soluciones al Error 153
- Se implementen alternativas (Opción C, etc.)
- Se agreguen nuevos tests
- Se hagan refactorizaciones mayores

**Responsable**: Mantener sincronizado con el código actual.
