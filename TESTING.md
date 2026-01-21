# Guía de Pruebas - Yutu Labs

## Pre-requisitos

1. **Chrome 116+** instalado
2. Extensión construida (`npm run build`)
3. Carpeta `dist/` generada

## Instalación para Testing

### Paso 1: Cargar la Extensión

1. Abre Chrome y navega a `chrome://extensions/`
2. Activa el **"Modo de desarrollador"** (toggle en esquina superior derecha)
3. Haz clic en **"Cargar extensión sin empaquetar"** (Load unpacked)
4. Selecciona la carpeta `dist/` del proyecto

Deberías ver la extensión "Yutu Labs" cargada con versión 1.0.0.

### Paso 2: Verificar Instalación

1. El icono de Yutu Labs debe aparecer en la barra de herramientas
2. En la consola de `chrome://extensions/`, verifica que no haya errores
3. Haz clic en el ícono para ver el popup (opcional)

---

## Escenarios de Prueba

### ✅ Test 1: Botón PiP en Home Feed

**Objetivo**: Verificar que el botón PiP aparece en miniaturas del feed principal

1. Navega a `https://www.youtube.com`
2. Haz hover sobre una miniatura de video
3. **Esperado**: Debe aparecer un botón "PiP" con gradiente morado en la esquina superior derecha
4. **Verificar**:
   - El botón tiene animación de fade-in
   - El botón tiene icono de Picture-in-Picture
   - El hover sobre el botón muestra efecto de scale

---

### ✅ Test 2: Abrir Ventana PiP

**Objetivo**: Verificar que la ventana PiP se abre correctamente

1. Desde el home feed, haz hover sobre un video
2. Haz clic en el botón "PiP"
3. **Esperado**:
   - Se abre una ventana flotante separada
   - La ventana tiene header con gradiente morado
   - El header muestra "🚀 Yutu Labs Player"
   - Hay un botón "× Cerrar" en el header
   - El video comienza a reproducirse automáticamente
4. **Verificar en consola** (F12 en la página de YouTube):
   ```
   🚀 Yutu Labs: Initializing...
   🎬 Opening PiP for video: [VIDEO_ID]
   ```

---

### ✅ Test 3: Navegación con PiP Activo

**Objetivo**: Verificar que el video sigue reproduciéndose mientras navegas

1. Con la ventana PiP abierta y reproduciendo
2. Navega a otra sección de YouTube (ej: Subscriptions, Trending)
3. **Esperado**:
   - La ventana PiP permanece visible "siempre encima"
   - El video continúa reproduciéndose
   - El audio sigue funcionando
4. Prueba también navegando a otra pestaña/sitio web
5. **Esperado**: La ventana PiP sigue visible sobre todas las ventanas

---

### ✅ Test 4: Cerrar Ventana PiP

**Objetivo**: Verificar que el cierre funciona correctamente

**Método 1 - Botón de cierre**:
1. Haz clic en el botón "× Cerrar" en el header
2. **Esperado**: La ventana se cierra inmediatamente

**Método 2 - Botón X de la ventana**:
1. Haz clic en la X nativa de la ventana PiP
2. **Esperado**: La ventana se cierra

**Verificar en consola**:
```
📭 PiP window closed
```

---

### ✅ Test 5: Múltiples Videos

**Objetivo**: Verificar que abrir un nuevo video cierra el anterior

1. Abre un video en PiP
2. Sin cerrar la ventana PiP, haz clic en el botón PiP de otro video
3. **Esperado**:
   - La ventana PiP anterior se cierra automáticamente
   - Se abre una nueva ventana con el segundo video
   - Solo hay una ventana PiP abierta a la vez

---

### ✅ Test 6: Diferentes Layouts de YouTube

**Objetivo**: Verificar que el botón aparece en todas las vistas

**Test 6.1 - Home Feed**:
1. Navega a `https://www.youtube.com`
2. **Esperado**: Botones PiP en grid de videos

**Test 6.2 - Búsqueda**:
1. Busca cualquier término (ej: "javascript tutorial")
2. Haz hover sobre resultados
3. **Esperado**: Botones PiP en resultados de búsqueda

**Test 6.3 - Sidebar**:
1. Abre cualquier video de YouTube
2. Haz scroll en el sidebar de recomendaciones
3. **Esperado**: Botones PiP en videos relacionados del sidebar

**Test 6.4 - Canal**:
1. Navega a cualquier canal de YouTube
2. Ve a la pestaña "Videos"
3. **Esperado**: Botones PiP en grid de videos del canal

---

### ✅ Test 7: Redimensionar Ventana PiP

**Objetivo**: Verificar que la ventana es redimensionable

1. Abre un video en PiP
2. Arrastra las esquinas/bordes de la ventana PiP
3. **Esperado**:
   - La ventana se puede redimensionar
   - El video mantiene proporciones (responsive)
   - Los controles siguen funcionando

---

### ⚠️ Test 8: Navegación SPA de YouTube

**Objetivo**: Verificar que los botones se re-inyectan en navegación SPA

1. Estando en el home, haz clic en "Trending"
2. Espera a que cargue el contenido
3. **Esperado**: Los botones PiP aparecen en los nuevos videos
4. Navega a "Subscriptions"
5. **Esperado**: Los botones se inyectan nuevamente

**Nota**: YouTube usa SPA (Single Page Application), por lo que escucha el evento `yt-navigate-finish`.

---

## Tests de Errores

### ❌ Test 9: Navegador No Soportado

**Objetivo**: Verificar manejo de navegadores sin Document PiP API

**Simulación**:
1. Abre la consola de YouTube (F12)
2. Ejecuta: `delete window.documentPictureInPicture`
3. Recarga la página
4. **Esperado en consola**:
   ```
   🚀 Yutu Labs: Initializing...
   ⚠️ Document Picture-in-Picture not supported. Chrome 116+ required.
   ```
5. **Esperado**: No aparecen botones PiP

---

### ❌ Test 10: Permisos de Ventanas Emergentes

**Objetivo**: Verificar mensaje cuando se bloquean popups

1. Bloquea ventanas emergentes en `chrome://settings/content/popups`
2. Agrega `youtube.com` a la lista de bloqueados
3. Haz clic en botón PiP
4. **Esperado**: Alert con mensaje:
   ```
   ⚠️ Yutu Labs necesita permiso para abrir ventanas emergentes.

   Por favor, permite las ventanas emergentes en la configuración de Chrome.
   ```

---

## Verificaciones de Rendimiento

### ⚡ Test 11: Memory Leaks

**Objetivo**: Verificar que no hay fugas de memoria

1. Abre Chrome Task Manager (`Shift + Esc`)
2. Encuentra el proceso de la extensión "Yutu Labs"
3. Anota el uso de memoria inicial
4. Abre/cierra ventanas PiP 10 veces
5. Anota el uso de memoria final
6. **Esperado**: El uso de memoria no debe crecer significativamente (< 10MB)

---

### ⚡ Test 12: MutationObserver Performance

**Objetivo**: Verificar que el observer no causa lag

1. Navega rápidamente entre secciones de YouTube (Home → Trending → Subscriptions)
2. Haz scroll rápido en feeds largos
3. **Esperado**:
   - No hay lag perceptible
   - Los botones aparecen suavemente
   - No hay bloqueos de UI

---

## Debugging

### Herramientas de Debug

**Console Logs**:
- `🚀 Yutu Labs: Initializing...` - Extensión cargada
- `🎬 Opening PiP for video: [ID]` - Abriendo PiP
- `📭 PiP window closed` - Ventana cerrada

**Chrome DevTools**:
1. En la página de YouTube: F12 → Console (ver logs de content script)
2. En `chrome://extensions/`: Click en "Inspect service worker" (ver logs de background)

**Verificar Injection**:
```javascript
// En consola de YouTube
console.log(window.yutuPiPManager);
// Debe mostrar el objeto YutuPiPManager
```

---

## Checklist de Release

Antes de publicar o hacer push:

- [ ] `npm run build` sin errores
- [ ] Test 1-6 pasan exitosamente
- [ ] No hay errores en consola de Chrome
- [ ] Versión en manifest.json actualizada
- [ ] README.md actualizado con cambios
- [ ] CLAUDE.md refleja arquitectura actual
- [ ] `.gitignore` excluye `dist/` y `node_modules/`
- [ ] Build funciona en Chrome 116+

---

## Problemas Comunes

### Problema: "Video unavailable" en ventana PiP

**Causa**: No debería ocurrir con Document PiP API
**Solución**: Verifica que estás usando Chrome 116+. Si persiste, reporta en GitHub.

---

### Problema: Botones no aparecen

**Causas posibles**:
1. YouTube cambió su estructura HTML
2. Selectores desactualizados
3. Extensión no cargó correctamente

**Debug**:
```javascript
// En consola de YouTube
document.querySelectorAll('ytd-rich-item-renderer').length
// Debe ser > 0 si estás en el home
```

---

### Problema: Ventana PiP no se abre

**Causas posibles**:
1. Chrome < 116
2. Ventanas emergentes bloqueadas
3. Error de permisos

**Debug**:
1. Verifica versión de Chrome: `chrome://version/`
2. Verifica permisos de popup: `chrome://settings/content/popups`
3. Revisa consola para errores específicos

---

## Métricas de Éxito

Una implementación exitosa debe cumplir:

- ✅ Botones PiP visibles en 4+ tipos de layouts
- ✅ Ventana PiP se abre en < 1 segundo
- ✅ Video reproduce sin errores "Video unavailable"
- ✅ Ventana permanece "always-on-top"
- ✅ Cierre de ventana limpia recursos correctamente
- ✅ No hay memory leaks después de 10+ aperturas
- ✅ Funciona en Chrome 116+ (versiones actuales)

---

## Próximos Pasos

Si todos los tests pasan:
1. Hacer commit de los cambios
2. Actualizar versión en `manifest.json` y `package.json`
3. Crear tag de release
4. Opcionalmente: Preparar para publicación en Chrome Web Store
