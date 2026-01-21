# Reporte Técnico: Intentos de Reproducción y Alternativas

Este documento detalla los enfoques técnicos probados para lograr la reproducción de video "in-page" en YouTube mediante una extensión, los errores encontrados y las posibles alternativas viables.

## Objetivo
Permitir al usuario ver un video de YouTube sin salir de la página actual (feed/home), abriéndolo en una vista previa o reproductor inline.

## Historial de Intentos

### 1. Iframe Modal (Enfoque Inicial)
*   **Método:** Inyección de un `div` overlay con un `iframe` apuntando a `youtube.com/embed/{VIDEO_ID}`.
*   **Resultado:** Error "Video unavailable" (Código 152/153).
*   **Causa Probable:** YouTube detecta que se está embebiendo un video dentro de su propio dominio (`youtube.com`) pero en un contexto de iframe no autorizado, bloqueándolo para evitar "recursive embedding" o comportamientos anómalos.

### 2. Parámetro de Origen
*   **Método:** Agregar `?origin=${window.location.origin}` al src del iframe.
*   **Resultado:** Mismo error.
*   **Causa:** El origen `https://www.youtube.com` coincidiendo con el referer parece ser parte del criterio de bloqueo.

### 3. Dominio No-Cookie & Referrer Policy
*   **Método:** Usar `youtube-nocookie.com` y `referrerpolicy="no-referrer"`.
*   **Resultado:** Error en consola: `embedder.identity.missing.referrer`.
*   **Análisis:** YouTube requiere un referer válido para ciertos embeds (para analíticas y control de derechos), pero al mismo tiempo bloquea si el referer es el propio YouTube. Es un callejón sin salida.

### 4. Proxy Local (Extension Resource)
*   **Método:** Crear un archivo `player.html` dentro de la extensión y cargarlo en el iframe (`src="chrome-extension://.../player.html"`).
*   **Teoría:** Esto cambia el `origin` del embed a la extensión, simulando ser una página externa.
*   **Resultado:** Error `requestStorageAccessFor: Permission denied`. El video sigue sin cargar.
*   **Análisis:** Las políticas de seguridad modernas (especialmente en Chrome) restringen severamente el acceso al almacenamiento y cookies de terceros dentro de iframes, especialmente si el contexto (YouTube) y el embed (YouTube) tienen conflictos de sesión.

### 5. Direct Embed con Política Estricta
*   **Método:** Usar `referrerpolicy="strict-origin-when-cross-origin"` con el player estándar.
*   **Resultado:** Bloqueo persistente.

---

## Alternativas Viables a Explorar

Dado que el enfoque de "Iframe dentro de YouTube" está fuertemente protegido/bloqueado por la plataforma, sugerimos explorar estas vías:

### A. Picture-in-Picture (PiP) Nativo del Documento
En lugar de crear un reproductor personalizado, usar la API de **Document Picture-in-Picture** (disponible en Chrome modernos).
*   **Cómo funciona:** Se abre una ventana flotante (siempre encima) que puede contener HTML arbitrario.
*   **Ventaja:** Es una ventana independiente del navegador, no un iframe, por lo que tiene su propio contexto y no sufre las restricciones de embedding de la misma página.

### B. Manipulación del "Miniplayer" Nativo
YouTube ya tiene una funcionalidad de "Miniplayer" (tecla `i`).
*   **Cómo funciona:** La extensión detecta el clic en nuestro botón "Play" y simula programáticamente la activación del Miniplayer nativo de YouTube con el video seleccionado.
*   **Ventaja:** Usa el reproductor oficial, 100% compatible y sin errores.
*   **Desventaja:** Limitado al diseño y posición que YouTube permite para su Miniplayer.

### C. Inyección de Elemento `<video>` (Hack)
En lugar de un iframe, intentar inyectar un tag `<video>` directo o reutilizar componentes de Polymer de YouTube (`<ytd-player>`).
*   **Cómo funciona:** Mover el nodo del reproductor existente o instanciar uno nuevo usando la API interna de YouTube (`window.yt.player`).
*   **Ventaja:** No hay iframe, es el mismo contexto.
*   **Desventaja:** Muy complejo técnicamente, requiere ingeniería inversa del framework de YouTube (Polymer/Lit) y es frágil ante actualizaciones de la página.

### D. Redirección a "Youtube.com/watch" en un Modal (Fetch)
Hacer un `fetch` de la página del video, extraer el stream de video directo (mp4 url) y ponerlo en un tag `<video>` nativo de HTML5.
*   **Ventaja:** Bypass total del player de YouTube.
*   **Desventaja:** **Viola los Términos de Servicio de YouTube** (no usar su player). No recomendado para publicación en la Store.

## Recomendación
La opción **B (Miniplayer Nativo)** es la más segura y estable.
La opción **A (Document PiP)** es la más moderna y "cool", permitiendo una ventana flotante real fuera del navegador.
