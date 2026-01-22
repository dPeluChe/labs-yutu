# Debugging Error 153 - embedder.identity.missing.referrer

## Estado Actual

**Error encontrado**: `"embedder.identity.missing.referrer"` (Error 153)
**Contexto**: Al abrir video en ventana Picture-in-Picture

---

## Detalles del Error

```json
{
  "debug_error": {
    "errorCode": "embedder.identity.missing.referrer",
    "errorDetail": "0",
    "errorMessage": "Watch video on YouTube",
    "bY": "Error 153\nVideo player configuration error"
  },
  "euri": "",
  "origin": "https://www.youtube.com"
}
```

### Interpretación

YouTube detecta que:
1. El embed viene desde `youtube.com` (mismo origen)
2. El referrer está ausente o no es válido
3. Bloquea el video por políticas de "recursive embedding"

---

## Intentos de Solución

### ✅ Intento 1: Document PiP con iframe directo
**Fecha**: 21 Enero 2026
**Código**:
```javascript
const iframe = document.createElement('iframe');
iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
pipWindow.document.body.appendChild(iframe);
```

**Resultado**: ❌ Error 153
**Causa**: Aunque la ventana PiP es independiente, YouTube sigue viendo el origen como `youtube.com` porque la extensión se ejecuta en el contexto de YouTube.

---

### ✅ Intento 2: Usar archivo HTML de extensión como proxy
**Fecha**: 21 Enero 2026
**Código**:
```javascript
// En content.js
const playerUrl = chrome.runtime.getURL(`content/player.html?v=${videoId}`);
iframe.src = playerUrl;

// En player.html
const iframe = document.createElement('iframe');
iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?origin=${extensionOrigin}`;
```

**Objetivo**: Cambiar el origen del embed a `chrome-extension://...` en lugar de `youtube.com`

**Resultado**: ❌ Error 153 persiste
**Causa**: YouTube aún detecta `"origin": "https://www.youtube.com"` a pesar de usar archivo HTML de la extensión como intermediario.

**Cambios realizados**:
1. ✅ `player.html` ahora usa `youtube-nocookie.com`
2. ✅ Agrega parámetro `origin` con el origen de la extensión
3. ✅ `referrerPolicy: "origin"` para controlar referrer
4. ✅ `player.html` agregado a `web_accessible_resources`

---

### ✅ Intento 3: YouTube IFrame Player API (Oficial)
**Fecha**: 21 Enero 2026
**Código**:
```javascript
// En player.html - Cargar API oficial
<script src="https://www.youtube.com/iframe_api"></script>

// Usar API en lugar de iframe directo
function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    videoId: videoId,
    playerVars: {
      'autoplay': 1,
      'enablejsapi': 1,
      'origin': window.location.origin,
      'widget_referrer': window.location.origin
    },
    events: {
      'onReady': onPlayerReady,
      'onError': onPlayerError
    }
  });
}
```

**Objetivo**: Usar la API oficial de YouTube IFrame Player que está diseñada específicamente para embeds de terceros.

**Ventajas**:
- ✅ API oficial y documentada
- ✅ Diseñada para embeds externos
- ✅ Manejo robusto de errores con códigos específicos
- ✅ Control programático completo del player

**Resultado**: ⏳ Por probar

**Cambios realizados**:
1. ✅ `player.html` ahora carga `https://www.youtube.com/iframe_api`
2. ✅ Usa `new YT.Player()` en lugar de crear iframe manualmente
3. ✅ Implementa callbacks `onReady`, `onError`, `onStateChange`
4. ✅ Manejo de errores específicos por código (100, 101, 150, etc.)
5. ✅ Timeout de 10 segundos en caso de que la API no cargue
6. ✅ Fallback con enlace directo a YouTube si falla

**Códigos de Error de la API**:
- `2`: Request contiene parámetro inválido
- `5`: Error del reproductor HTML5
- `100`: Video no encontrado o privado
- `101`: El propietario del video no permite reproducción embebida
- `150`: Similar a 101, embed no permitido

---

## Opciones Alternativas a Explorar

### Opción A: Native Miniplayer
**Idea**: Invocar el miniplayer nativo de YouTube programáticamente
**Investigación requerida**:
- Explorar `window.yt` API interna
- Buscar métodos para activar miniplayer
- Simular clicks en elementos de YouTube

**Pros**:
- ✅ Usa player oficial (sin restricciones)
- ✅ 100% compatible

**Contras**:
- ❌ No documentado
- ❌ Frágil ante actualizaciones
- ❌ Requiere ingeniería inversa

---

### Opción B: Manipular player nativo directamente
**Idea**: Clonar o mover el elemento `#movie_player` de YouTube
**Código conceptual**:
```javascript
// Encontrar el player nativo
const nativePlayer = document.querySelector('#movie_player');

// Clonarlo o moverlo a la ventana PiP
if (nativePlayer) {
  const clonedPlayer = nativePlayer.cloneNode(true);
  pipWindow.document.body.appendChild(clonedPlayer);
}
```

**Pros**:
- ✅ Player nativo completo
- ✅ Sin restricciones de embed

**Contras**:
- ❌ Muy complejo técnicamente
- ❌ Estado del player (tiempo, buffer, etc.) se puede perder
- ❌ Eventos y listeners no se clonan

---

### Opción C: Usar YT.Player API (JavaScript Player API)
**Idea**: Usar la API oficial de JavaScript de YouTube
**Código conceptual**:
```javascript
// En player.html
<div id="player"></div>
<script>
  var player;
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId: videoId,
      playerVars: {
        'autoplay': 1,
        'origin': window.location.origin
      }
    });
  }
</script>
<script src="https://www.youtube.com/iframe_api"></script>
```

**Pros**:
- ✅ API oficial documentada
- ✅ Control programático completo

**Contras**:
- ⚠️ Puede seguir teniendo restricciones de origen
- ⚠️ Agrega dependencia externa (iframe_api)

---

### Opción D: Fallback a navegación tradicional
**Idea**: Si PiP falla, ofrecer abrir en nueva pestaña o window
**Código**:
```javascript
async openPiPPlayer(videoId) {
  try {
    // Intentar PiP
    await this.openPiPWindow(videoId);
  } catch (error) {
    // Fallback: nueva ventana pequeña
    const width = 854;
    const height = 480;
    const left = screen.width - width - 50;
    const top = 50;

    window.open(
      `https://www.youtube.com/watch?v=${videoId}`,
      'YutuPlayer',
      `width=${width},height=${height},left=${left},top=${top}`
    );
  }
}
```

**Pros**:
- ✅ Siempre funciona
- ✅ Video garantizado

**Contras**:
- ❌ No es PiP real
- ❌ Requiere navegación (objetivo que queremos evitar)

---

## Parámetros de YouTube Embed Investigados

### Parámetros Estándar
- `autoplay=1` - Reproduce automáticamente
- `modestbranding=1` - Reduce branding de YouTube
- `rel=0` - No mostrar videos relacionados al final
- `playsinline=1` - Reproduce inline en mobile

### Parámetros de Origen/Seguridad
- `origin=ORIGIN` - Especifica origen del embedder (requerido para algunos casos)
- `enablejsapi=1` - Habilita control via JavaScript
- `widget_referrer=URL` - Referrer personalizado

### Parámetros Experimentados
- ✅ `origin=chrome-extension://...` - Ahora usando
- ⚠️ Cambio de `youtube.com` a `youtube-nocookie.com`
- ⚠️ `referrerPolicy: "origin"`

---

## Debugging Tools

### Console Checks

**En página de YouTube** (F12):
```javascript
// Verificar manager
window.yutuPiPManager

// Verificar soporte PiP
'documentPictureInPicture' in window

// Ver último error
// (Buscar en Network tab el request al embed que falla)
```

**En ventana PiP** (Click derecho en ventana PiP → Inspect):
```javascript
// Ver iframe
document.querySelector('iframe')

// Ver src del iframe
document.querySelector('iframe').src

// Ver errores en consola
// (Deberían aparecer logs de YouTube sobre el error)
```

---

### Network Analysis

1. Abrir DevTools en página de YouTube
2. Ir a pestaña **Network**
3. Click en botón PiP
4. Buscar requests a:
   - `youtube.com/embed/...`
   - `youtube-nocookie.com/embed/...`
5. Ver **Headers** del request:
   - `Referer`
   - `Origin`
   - `Sec-Fetch-Site`

---

## Logs Útiles

### Logs de la Extensión
```
🚀 Yutu Labs: Initializing...
🎬 Opening PiP for video: [VIDEO_ID]
```

### Logs de YouTube (Error 153)
```json
{
  "errorCode": "embedder.identity.missing.referrer",
  "errorDetail": "0",
  "errorMessage": "Watch video on YouTube"
}
```

---

## Próximos Pasos de Investigación

1. **Probar Intento 2**:
   - Recargar extensión en Chrome
   - Verificar que `player.html` está en `dist/content/`
   - Probar abrir video en PiP
   - Inspeccionar ventana PiP y verificar origen del iframe

2. **Si Intento 2 falla**:
   - Investigar Opción C (YT.Player API)
   - Considerar Opción B (manipulación directa)
   - Evaluar Opción D (fallback a window.open)

3. **Documentar hallazgos**:
   - Capturar errores específicos
   - Network traces
   - Headers completos de requests

---

## Referencias

- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube Player Parameters](https://developers.google.com/youtube/player_parameters)
- [Document PiP API](https://developer.chrome.com/docs/web-platform/document-picture-in-picture)
- [Chrome Extension Web Accessible Resources](https://developer.chrome.com/docs/extensions/mv3/manifest/web_accessible_resources/)

---

## Conclusión Actual

El error 153 es un bloqueo agresivo de YouTube para prevenir embeds no autorizados desde su propio dominio. La estrategia actual (Intento 2) usa un archivo HTML de la extensión como proxy para cambiar el origen del embed.

**Estado**: ⏳ Esperando prueba del usuario con la nueva build.

**Si esto falla**: Necesitaremos explorar alternativas más invasivas (manipulación del DOM de YouTube, uso de API interna, o fallback a navegación tradicional).
