> **ARCHIVED**: 2026-10-01
> Evaluation of embed techniques, all discarded. Kept as historical context.

---

# Evaluación Técnica de Alternativas - Yutu Labs
## Análisis de Viabilidad y Propuesta de Implementación

**Fecha**: 21 de Enero, 2026
**Objetivo**: Encontrar solución viable para reproducción inline de videos de YouTube evitando las restricciones de iframe embedding

---

## 🔍 Resumen Ejecutivo

Después de investigar las opciones propuestas (A y B), la **Opción A (Document Picture-in-Picture API)** es la más viable técnicamente con soporte oficial de Chrome. Sin embargo, **no cumple exactamente con la UX deseada** de "inline/acordeón" ya que abre una ventana flotante separada.

**Recomendación**: Implementar una **solución híbrida** que combine:
1. **Document PiP API** para ofrecer reproducción sin navegación (ventana flotante)
2. **Manipulación del player nativo de YouTube** (Opción C mejorada) como alternativa experimental para lograr la experiencia inline real

---

## 📊 Evaluación Detallada por Opción

### OPCIÓN A: Document Picture-in-Picture API ⭐⭐⭐⭐⭐

#### Viabilidad Técnica: **ALTA (95%)**

#### ¿Qué es?
API oficial de Chrome (desde versión 116) que permite abrir una ventana flotante "siempre encima" con contenido HTML arbitrario.

#### Ventajas
✅ **API oficial con soporte estable** - No es un hack, es estándar web
✅ **Contexto independiente** - Evita completamente las restricciones CORS/Referrer de YouTube
✅ **Iframe sin bloqueos** - Al ser ventana separada, el embed funciona perfectamente
✅ **Control total del contenido** - Puedes agregar botones, controles, estilos personalizados
✅ **Detecta cierre de ventana** - Evento `pagehide` para limpiar recursos
✅ **Compatible con YouTube** - Funciona con iframe embed estándar

#### Desventajas
⚠️ **No es verdaderamente "inline"** - Abre ventana flotante, no expande dentro de la página
⚠️ **Requiere Chrome 116+** - No funciona en Firefox/Safari (aunque tu usuario objetivo usa Chrome)
⚠️ **Requiere gesto del usuario** - No puede abrirse automáticamente sin click
⚠️ **UX diferente** - La ventana PiP es controlada por el navegador (posición, tamaño inicial)

#### Implementación Técnica

**1. Detección de soporte:**
```javascript
if (!('documentPictureInPicture' in window)) {
  alert('Tu navegador no soporta Picture-in-Picture. Usa Chrome 116+');
  return;
}
```

**2. Abrir ventana PiP con player:**
```javascript
async openPiPPlayer(videoId) {
  try {
    // Abrir ventana PiP con dimensiones 16:9
    const pipWindow = await window.documentPictureInPicture.requestWindow({
      width: 1280,
      height: 720,
      disallowReturnToOpener: false
    });

    // Copiar estilos de la página principal (opcional)
    const styleLinks = [...document.querySelectorAll('link[rel="stylesheet"]')];
    styleLinks.forEach(link => {
      const newLink = pipWindow.document.createElement('link');
      newLink.rel = 'stylesheet';
      newLink.href = link.href;
      pipWindow.document.head.appendChild(newLink);
    });

    // Agregar estilos personalizados para el PiP
    const style = pipWindow.document.createElement('style');
    style.textContent = `
      body {
        margin: 0;
        padding: 0;
        background: #000;
        display: flex;
        flex-direction: column;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: none;
      }
      .pip-header {
        background: #0f0f0f;
        color: white;
        padding: 10px;
        font-family: Arial, sans-serif;
      }
    `;
    pipWindow.document.head.appendChild(style);

    // Crear estructura del player
    const header = pipWindow.document.createElement('div');
    header.className = 'pip-header';
    header.textContent = 'Yutu Labs Player';

    const iframe = pipWindow.document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;

    pipWindow.document.body.appendChild(header);
    pipWindow.document.body.appendChild(iframe);

    // Evento al cerrar ventana PiP
    pipWindow.addEventListener('pagehide', () => {
      console.log('PiP window cerrada');
    });

  } catch (error) {
    console.error('Error al abrir PiP:', error);
  }
}
```

**3. Integración con YutuManager:**
```javascript
// En content.js, modificar el método del botón Play:
btn.onclick = (e) => {
  e.preventDefault();
  e.stopPropagation();
  this.openPiPPlayer(videoId); // En vez de openInlinePlayer
};
```

#### Código de Producción Completo
Ver **Anexo A** al final del documento.

---

### OPCIÓN B: Manipulación del Miniplayer Nativo ⭐⭐⚠️

#### Viabilidad Técnica: **MEDIA (50%)**

#### ¿Qué es?
Intentar invocar programáticamente el miniplayer nativo de YouTube y modificarlo con CSS para hacerlo más grande y centrarlo.

#### Ventajas
✅ **Usa el player oficial** - Garantiza que el video funcione sin errores de embedding
✅ **No requiere iframe** - Evita problemas CORS

#### Desventajas
❌ **No hay API pública** - YouTube no expone métodos para invocar el miniplayer programáticamente
❌ **Requiere ingeniería inversa** - Necesitas analizar el código de YouTube y sus eventos internos
❌ **Muy frágil** - Cualquier actualización de YouTube puede romper la solución
❌ **Limitaciones de tamaño** - YouTube podría tener restricciones en el tamaño del miniplayer
❌ **UX inconsistente** - El miniplayer tiene comportamientos específicos (ej. se activa al navegar)

#### Hallazgos de la Investigación

De los userscripts encontrados:
- El miniplayer se identifica con el selector `ytd-miniplayer`
- YouTube dispara eventos `yt-navigate-finish` al cambiar de página
- El miniplayer se activa automáticamente al navegar desde `/watch` hacia otra página

**Problema principal**: No existe forma documentada de activar el miniplayer para un video específico sin navegar primero a ese video.

#### Implementación Experimental (No Recomendada)

```javascript
// ADVERTENCIA: Este código es experimental y frágil
async triggerMiniplayer(videoId) {
  // 1. Navegar al video (esto es lo que queremos evitar!)
  window.location.href = `https://www.youtube.com/watch?v=${videoId}`;

  // 2. Esperar a que cargue el video
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 3. Navegar de regreso (activa el miniplayer)
  window.history.back();

  // 4. Modificar estilos del miniplayer
  const miniplayer = document.querySelector('ytd-miniplayer');
  if (miniplayer) {
    miniplayer.style.cssText = `
      position: fixed !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 80vw !important;
      max-width: 1200px !important;
      height: auto !important;
      z-index: 9999 !important;
    `;
  }
}
```

**Veredicto**: Esta opción **no es viable** porque requiere navegación, que es exactamente lo que queremos evitar.

---

### OPCIÓN C (NUEVA): Manipulación Directa del Player Nativo ⭐⭐⭐⭐

#### Viabilidad Técnica: **MEDIA-ALTA (70%)**

#### ¿Qué es?
En lugar de crear un iframe, **clonar o reutilizar el elemento `<video>` nativo** de YouTube manipulando el DOM directamente.

#### Concepto
YouTube ya tiene un reproductor nativo (`#movie_player`) que funciona perfectamente. La idea es:
1. Detectar si ya hay un player cargado en la página
2. Si no, crear uno nuevo usando los componentes internos de YouTube
3. Inyectarlo en el lugar deseado (inline en el feed)

#### Ventajas
✅ **Player nativo de YouTube** - Sin problemas de CORS/embedding
✅ **Verdaderamente inline** - Se inserta en el DOM donde queremos
✅ **Experiencia consistente** - Usa el mismo player que YouTube

#### Desventajas
⚠️ **Ingeniería inversa requerida** - Necesitas entender la estructura interna de YouTube
⚠️ **Complejidad alta** - Requiere manipular el framework Polymer/Lit de YouTube
⚠️ **Frágil ante actualizaciones** - YouTube puede cambiar su estructura
⚠️ **No documentado** - No hay API oficial

#### Investigación Preliminar

YouTube usa el objeto `window.yt` para gestionar players:
```javascript
// YouTube expone algunos métodos internos
window.yt.player.Application.create('container-id', {
  videoId: 'VIDEO_ID',
  params: { /* configuración */ }
});
```

#### Implementación Experimental

```javascript
// EXPERIMENTAL - Requiere más investigación
async createInlineYouTubePlayer(videoId, container) {
  try {
    // 1. Verificar si window.yt existe
    if (!window.yt || !window.yt.player) {
      console.error('YouTube API no disponible');
      return;
    }

    // 2. Crear contenedor con ID único
    const playerId = `yutu-player-${videoId}`;
    const playerDiv = document.createElement('div');
    playerDiv.id = playerId;
    playerDiv.style.cssText = 'width: 100%; height: 100%;';
    container.appendChild(playerDiv);

    // 3. Intentar crear instancia de player
    const playerConfig = {
      videoId: videoId,
      playerVars: {
        autoplay: 1,
        modestbranding: 1
      }
    };

    // NOTA: Este método puede no estar expuesto o cambiar
    const player = window.yt.player.Application.create(playerId, playerConfig);

    return player;

  } catch (error) {
    console.error('Error creando player nativo:', error);
    // Fallback a iframe o PiP
  }
}
```

**Estado**: Esta opción requiere **más investigación** usando las Chrome DevTools en YouTube para identificar los métodos exactos disponibles en `window.yt`.

---

## 🎯 Propuesta de Implementación Recomendada

### Estrategia: Implementación Progresiva en 3 Fases

#### **FASE 1: Document PiP (Solución Inmediata)** - 1 semana
Implementar la Opción A como solución principal.

**Entregables**:
- Botón "Play" que abre ventana PiP con iframe de YouTube
- Ventana PiP con estilos personalizados (header, controles)
- Manejo de eventos de cierre de ventana
- Fallback para navegadores sin soporte

**Pros**: Solución robusta y estable inmediatamente.
**Contras**: No es la UX ideal (no inline).

#### **FASE 2: Investigación Profunda del Player Nativo** - 2 semanas
Investigar a fondo la Opción C usando Chrome DevTools.

**Tareas**:
1. Analizar `window.yt` y sus métodos disponibles
2. Estudiar cómo YouTube crea players dinámicamente
3. Probar creación de player nativo en contenedor custom
4. Evaluar estabilidad y viabilidad real

**Entregables**:
- Documento técnico con hallazgos
- Prototipo funcional (si es viable)
- Decisión final sobre viabilidad de Opción C

#### **FASE 3: Implementación Híbrida** - 1 semana
Ofrecer al usuario elegir entre PiP y Player Nativo (si la Fase 2 es exitosa).

**Entregables**:
- Toggle en popup de extensión: "Modo PiP" vs "Modo Inline"
- Implementación dual con fallback inteligente
- Documentación de usuario

---

## 💻 Código de Referencia - Anexo A

### Implementación Completa de Document PiP

**Archivo**: `content/content-pip.js`

```javascript
class YutuPiPManager {
  constructor() {
    this.currentPiPWindow = null;
    this.observer = null;
    this.init();
  }

  init() {
    console.log('Yutu Labs PiP: Initializing...');

    // Verificar soporte
    if (!('documentPictureInPicture' in window)) {
      console.warn('Document PiP no soportado en este navegador');
      return;
    }

    this.injectButtons();
    this.observe();
  }

  observe() {
    this.observer = new MutationObserver((mutations) => {
      let shouldInject = false;
      for (const m of mutations) {
        if (m.addedNodes.length) {
          shouldInject = true;
          break;
        }
      }
      if (shouldInject) {
        this.injectButtons();
      }
    });
    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  injectButtons() {
    const selectors = [
      'ytd-rich-item-renderer',
      'ytd-grid-video-renderer',
      'ytd-compact-video-renderer',
      'ytd-video-renderer'
    ];

    const cards = document.querySelectorAll(selectors.join(','));

    cards.forEach(card => {
      if (card.querySelector('.yutu-pip-btn')) return;

      const link = card.querySelector('a[href*="/watch?v="]');
      if (!link) return;

      const videoId = this.getVideoId(link.href);
      if (!videoId) return;

      const btn = document.createElement('button');
      btn.className = 'yutu-pip-btn';
      btn.innerHTML = `
        <svg height="12" viewBox="0 0 24 24" width="12" fill="currentColor">
          <path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2zm0 16.01H3V4.98h18v14.03z"/>
        </svg>
        PiP
      `;
      btn.title = 'Abrir en Picture-in-Picture';

      btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.openPiPPlayer(videoId);
      };

      let container = card.querySelector('#details') ||
                      card.querySelector('.yt-lockup-metadata-view-model') ||
                      card.querySelector('#meta') ||
                      card.querySelector('ytd-thumbnail');

      if (container) {
        const style = window.getComputedStyle(container);
        if (style.position === 'static') {
          container.style.position = 'relative';
        }
        container.appendChild(btn);
      }
    });
  }

  getVideoId(url) {
    try {
      const u = new URL(url, window.location.origin);
      return u.searchParams.get('v');
    } catch(e) {
      console.error('Error parsing URL:', e);
      return null;
    }
  }

  async openPiPPlayer(videoId) {
    try {
      // Si ya hay una ventana PiP abierta, cerrarla
      if (this.currentPiPWindow && !this.currentPiPWindow.closed) {
        this.currentPiPWindow.close();
      }

      // Abrir nueva ventana PiP
      const pipWindow = await window.documentPictureInPicture.requestWindow({
        width: 1280,
        height: 720,
        disallowReturnToOpener: false
      });

      this.currentPiPWindow = pipWindow;

      // Estilos para la ventana PiP
      const style = pipWindow.document.createElement('style');
      style.textContent = `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background: #000;
          display: flex;
          flex-direction: column;
          height: 100vh;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .pip-header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .pip-title {
          font-size: 14px;
          font-weight: 600;
        }

        .pip-close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background 0.2s;
        }

        .pip-close:hover {
          background: rgba(255,255,255,0.3);
        }

        .pip-player {
          flex: 1;
          position: relative;
          background: #000;
        }

        iframe {
          width: 100%;
          height: 100%;
          border: none;
        }
      `;
      pipWindow.document.head.appendChild(style);

      // Estructura HTML
      const header = pipWindow.document.createElement('div');
      header.className = 'pip-header';

      const title = pipWindow.document.createElement('div');
      title.className = 'pip-title';
      title.textContent = '🚀 Yutu Labs Player';

      const closeBtn = pipWindow.document.createElement('button');
      closeBtn.className = 'pip-close';
      closeBtn.textContent = '× Cerrar';
      closeBtn.onclick = () => pipWindow.close();

      header.appendChild(title);
      header.appendChild(closeBtn);

      const playerContainer = pipWindow.document.createElement('div');
      playerContainer.className = 'pip-player';

      const iframe = pipWindow.document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0`;
      iframe.title = 'YouTube video player';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;

      playerContainer.appendChild(iframe);
      pipWindow.document.body.appendChild(header);
      pipWindow.document.body.appendChild(playerContainer);

      // Eventos
      pipWindow.addEventListener('pagehide', () => {
        console.log('PiP window cerrada');
        this.currentPiPWindow = null;
      });

      // Focus en el iframe para permitir controles de teclado
      pipWindow.addEventListener('load', () => {
        iframe.focus();
      });

    } catch (error) {
      console.error('Error al abrir PiP:', error);

      // Fallback: mensaje al usuario
      if (error.name === 'NotAllowedError') {
        alert('Por favor, permite ventanas emergentes para Yutu Labs.');
      } else {
        alert('Error al abrir el reproductor. Verifica que estés usando Chrome 116+');
      }
    }
  }

  cleanup() {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.currentPiPWindow && !this.currentPiPWindow.closed) {
      this.currentPiPWindow.close();
    }
  }
}

// Inicialización
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new YutuPiPManager());
} else {
  new YutuPiPManager();
}

// Cleanup al cerrar la página
window.addEventListener('beforeunload', () => {
  if (window.yutuPiPManager) {
    window.yutuPiPManager.cleanup();
  }
});
```

**Archivo**: `content/content-pip.css`

```css
/* Botón PiP */
.yutu-pip-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1000;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  opacity: 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

ytd-rich-item-renderer:hover .yutu-pip-btn,
ytd-grid-video-renderer:hover .yutu-pip-btn,
ytd-compact-video-renderer:hover .yutu-pip-btn,
ytd-video-renderer:hover .yutu-pip-btn {
  opacity: 1;
}

.yutu-pip-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.yutu-pip-btn:active {
  transform: scale(0.95);
}
```

---

## 📋 Checklist de Implementación - Fase 1

- [ ] Crear archivo `content/content-pip.js` con código de PiP
- [ ] Crear archivo `content/content-pip.css` con estilos de botón
- [ ] Modificar `scripts/build.mjs` para incluir nuevos archivos
- [ ] Modificar `manifest.json` para cargar `content-pip.js` en vez de `content.js`
- [ ] Probar en Chrome 116+ en diferentes vistas de YouTube:
  - [ ] Home feed
  - [ ] Resultados de búsqueda
  - [ ] Página de canal
  - [ ] Sidebar de recomendaciones
- [ ] Implementar fallback para navegadores sin soporte
- [ ] Agregar mensaje de error amigable
- [ ] Probar cierre de ventana PiP y limpieza de recursos
- [ ] Actualizar README.md con nueva funcionalidad
- [ ] Actualizar CLAUDE.md con arquitectura PiP

---

## 🔗 Referencias y Fuentes

### Document Picture-in-Picture API
- [Official Chrome Documentation](https://developer.chrome.com/docs/web-platform/document-picture-in-picture)
- [MDN Web Docs - Document PiP API](https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API)
- [Chrome Samples - Picture-in-Picture](https://googlechrome.github.io/samples/picture-in-picture/)
- [LogRocket Tutorial - Using Chrome's Document PiP in React](https://blog.logrocket.com/using-chrome-document-picture-in-picture-api-react/)

### YouTube Player API
- [YouTube IFrame Player API Reference](https://developers.google.com/youtube/iframe_api_reference)
- [YouTube Player Parameters](https://developers.google.com/youtube/player_parameters)
- [Tutorialzine - Control YouTube Player with JavaScript](https://tutorialzine.com/2015/08/how-to-control-youtubes-video-player-with-javascript)

### Miniplayer Manipulation
- [GitHub - ytd-miniplayer userscript](https://github.com/twjmy/ytd-miniplayer)
- [YouTube WideScreen Polymer script](https://greasyfork.org/en/scripts/409893-youtube-widescreen-new-design-polymer-usw-v-58/code)

### Chrome Extensions
- [Tweaks for YouTube](https://chrome.google.com/webstore/detail/tweaks-for-youtube/ogkoifddpkoabehfemkolflcjhklmkge)

---

## 📝 Conclusiones

1. **La Opción A (Document PiP) es la más viable** para implementación inmediata con alta estabilidad.

2. **La Opción B (Miniplayer nativo) no es viable** debido a la falta de API y la necesidad de navegación previa.

3. **La Opción C (Player nativo directo) es prometedora** pero requiere investigación adicional significativa.

4. **Estrategia Recomendada**: Implementar Fase 1 (PiP) primero para tener una solución funcional, luego investigar Fase 2 (Player nativo) como mejora futura.

5. **Trade-off aceptable**: Aunque PiP no es exactamente "inline/acordeón", ofrece una experiencia superior al tener que navegar a una nueva página, cumpliendo parcialmente con la UX deseada.
