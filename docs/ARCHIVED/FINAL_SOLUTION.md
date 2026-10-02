> **ARCHIVED**: 2026-10-01
> Describes the window.open() decision. The current implementation uses chrome.windows.create() from the service worker (see CLAUDE.md).

---

# Solución Final - Yutu Labs

**Fecha**: 21 Enero 2026
**Decisión**: Usar `window.open()` para abrir videos en ventana flotante

---

## 🎯 Problema Original

YouTube bloquea agresivamente cualquier intento de embeber videos desde el mismo dominio (`youtube.com`) con el error:

```
Error 153: "embedder.identity.missing.referrer"
```

Este error aparece incluso cuando:
- Usas Document Picture-in-Picture API
- Usas archivos HTML de la extensión como proxy
- Cambias a `youtube-nocookie.com`
- Usas YouTube IFrame Player API oficial

**Causa raíz**: YouTube detecta el origen como `youtube.com` porque la extensión se ejecuta en el contexto de YouTube.

---

## 🔄 Historial de Intentos

### ✅ Intento 1: Iframe directo en Document PiP
**Resultado**: ❌ Error 153
```javascript
iframe.src = `https://www.youtube.com/embed/${videoId}`;
```

### ✅ Intento 2: player.html proxy + youtube-nocookie
**Resultado**: ❌ Error 153
```javascript
const playerUrl = chrome.runtime.getURL(`player.html?v=${videoId}`);
iframe.src = playerUrl; // → carga youtube-nocookie.com internamente
```

### ✅ Intento 3: YouTube IFrame Player API oficial
**Resultado**: ❌ Se queda en "Cargando..." (API no carga o falla silenciosamente)
```javascript
player = new YT.Player('player', {
  videoId: videoId,
  // ...
});
```

**Conclusión**: Todas las formas de embeber videos dentro de la extensión fallan debido a las restricciones de YouTube.

---

## ✅ Solución Final: window.open()

### Implementación

```javascript
openPiPPlayer(videoId) {
  // Dimensiones 16:9
  const width = 854;
  const height = 480;

  // Posición: esquina inferior derecha
  const left = window.screen.width - width - 50;
  const top = window.screen.height - height - 100;

  // Abrir video en ventana nativa
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}&autoplay=1`;

  this.currentPiPWindow = window.open(
    videoUrl,
    'YutuLabsPlayer',
    `width=${width},height=${height},left=${left},top=${top},resizable=yes`
  );
}
```

### Por Qué Funciona

1. **No es embed**: Abre directamente `youtube.com/watch` (página completa)
2. **Player oficial**: Usa el reproductor estándar de YouTube
3. **Sin restricciones**: No hay bloqueos de CORS, referrer, o identidad
4. **Siempre funciona**: Es una funcionalidad nativa del navegador

---

## 📊 Comparación

| Aspecto | Document PiP (Intentado) | window.open() (Final) |
|---------|--------------------------|------------------------|
| **Funciona** | ❌ Error 153 | ✅ Siempre |
| **Player** | Embed (bloqueado) | Oficial (completo) |
| **UX** | Ventana PiP nativa | Ventana flotante |
| **Always-on-top** | ✅ Nativo | ⚠️ Manual (usuario puede minimizar) |
| **Restricciones** | ❌ Muchas (YouTube) | ✅ Ninguna |
| **Estabilidad** | ❌ Frágil | ✅ Robusta |
| **Navegación** | ✅ No requiere | ⚠️ Sí (pero en ventana separada) |

---

## 🎨 Experiencia de Usuario Final

### Flujo:
1. Usuario está en YouTube Home
2. Hace hover sobre miniatura → Aparece botón **"Abrir"** (gradiente morado)
3. Click en botón → Se abre ventana flotante en esquina inferior derecha
4. Video reproduce automáticamente (autoplay=1)
5. Usuario puede:
   - Seguir navegando por YouTube en pestaña principal
   - Redimensionar la ventana
   - Mover la ventana a otra posición
   - Usar todos los controles de YouTube (calidad, subtítulos, etc.)

### Ventajas vs Objetivo Original:
- ✅ **Ver videos sin salir del feed** - CUMPLIDO (ventana separada pero visible)
- ✅ **No navegar en pestaña actual** - CUMPLIDO
- ⚠️ **Experiencia "inline/acordeón"** - NO (es ventana flotante, no inline)
- ✅ **Player funcional sin errores** - CUMPLIDO (100%)

---

## 🔧 Trade-offs Aceptados

### ❌ Perdido:
1. **Verdadero PiP "always-on-top"** - La ventana flotante puede ser minimizada por el usuario
2. **Experiencia inline** - No se expande dentro de la página como acordeón
3. **Ventana PiP nativa** - No usa Document PiP API

### ✅ Ganado:
1. **Funcionalidad garantizada** - Siempre funciona, sin errores
2. **Player completo de YouTube** - Todas las funciones disponibles
3. **Estabilidad** - No depende de APIs experimentales o restricciones de YouTube
4. **Simplicidad** - Código mucho más simple y mantenible
5. **Zero dependencias** - No requiere `player.html`, YouTube IFrame API, etc.

---

## 📝 Cambios en el Código

### Archivos Modificados:

**content/content.js**:
- ✅ Eliminado todo el código de Document PiP API
- ✅ Eliminados métodos `setupPiPWindow()`, `setupPiPEvents()`, `handlePiPError()`
- ✅ Simplificado `openPiPPlayer()` a usar `window.open()`
- ✅ Cambiado texto del botón: "PiP" → "Abrir"

**content/content.css**:
- ✅ Sin cambios funcionales (solo comentarios actualizados)

**manifest.json**:
- ✅ Eliminado `web_accessible_resources` (ya no se usa `player.html`)

**scripts/build.mjs**:
- ✅ Eliminada copia de `player.html` al build

**content/player.html**:
- ⚠️ Archivo obsoleto (ya no se usa, puede eliminarse)

---

## 🚀 Estado Actual

### ✅ Listo para Usar

**Archivos actualizados**:
- `content/content.js` - Implementación con window.open()
- `manifest.json` - Limpiado
- `scripts/build.mjs` - Optimizado
- `README.md` - Documentación actualizada
- `docs/FINAL_SOLUTION.md` - Este documento

**Build**:
```bash
npm run build  # ✅ Exitoso
```

**Instalación**:
1. Chrome → `chrome://extensions/`
2. Activar "Modo desarrollador"
3. "Cargar extensión sin empaquetar"
4. Seleccionar carpeta `dist/`

**Prueba**:
1. Ve a `youtube.com`
2. Hover sobre miniatura → Ver botón "Abrir"
3. Click → Ventana flotante se abre en esquina
4. Video reproduce automáticamente ✅

---

## 💡 Lecciones Aprendidas

### 1. YouTube tiene protecciones MUY agresivas
No es posible embeber videos de YouTube desde el propio dominio de YouTube, sin importar la técnica:
- Document PiP API ❌
- Proxy con archivos de extensión ❌
- YouTube IFrame API oficial ❌
- youtube-nocookie.com ❌

### 2. APIs experimentales pueden fallar
Document Picture-in-Picture API es moderna y oficial, pero tiene limitaciones con content security policies y contextos complejos.

### 3. Soluciones simples son mejores
`window.open()` es:
- Más simple que Document PiP
- Más confiable que embeds
- Más mantenible a largo plazo
- Compatible con todas las versiones de Chrome

### 4. Trade-offs son aceptables
Aunque la solución final no es exactamente la UX "inline/acordeón" original:
- ✅ Cumple el objetivo principal (ver videos sin salir del feed)
- ✅ Siempre funciona (sin errores)
- ✅ Usa player oficial (sin restricciones)

---

## 🔮 Futuras Mejoras (Opcionales)

### 1. Configuración de Posición
Permitir al usuario elegir dónde abrir la ventana:
- Esquina inferior derecha (actual)
- Esquina superior derecha
- Esquina inferior izquierda
- Centro de pantalla

### 2. Tamaños Presets
Ofrecer diferentes tamaños:
- Pequeño (640x360)
- Mediano (854x480) - actual
- Grande (1280x720)
- Custom (usuario define)

### 3. Recordar Última Ventana
Al abrir un nuevo video:
- Cerrar automáticamente la ventana anterior
- O permitir múltiples ventanas simultáneas

### 4. Atajos de Teclado
Agregar shortcuts:
- `Alt + P` → Abrir video bajo el mouse
- `Escape` → Cerrar ventana flotante

---

## ✅ Conclusión

La solución final con `window.open()` es:

**PRAGMÁTICA** - Acepta que embeds no funcionan y usa alternativa robusta
**FUNCIONAL** - Cumple el objetivo principal sin errores
**SIMPLE** - Código limpio y fácil de mantener
**ESTABLE** - No depende de APIs experimentales o restricciones de YouTube

**Veredicto**: ✅ **Solución exitosa y lista para producción**

---

## 📚 Referencias

- Intentos previos: `docs/ATTEMPTS_AND_ALTERNATIVES.md`
- Debugging Error 153: `docs/ERROR_153_DEBUGGING.md`
- Evaluación técnica: `docs/TECHNICAL_EVALUATION.md`
- Testing: `docs/TESTING.md`
