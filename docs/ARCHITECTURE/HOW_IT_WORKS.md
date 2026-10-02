# Como funciona

Extension Chrome Manifest V3, JavaScript sin framework, empaquetada con esbuild. Este documento explica las piezas y, sobre todo, **que partes dependen del marcado de YouTube** (lo primero que se rompe cuando YouTube cambia su diseno).

## Piezas

| Pieza | Archivos | Responsabilidad |
|-------|----------|-----------------|
| Service worker | `background/background.js` | Abre y cierra la ventana flotante, guarda su id en `chrome.storage.session`, registra el content script de los sitios externos |
| Content script de YouTube | `content/youtube-content.js` (entrada) | Botones en tarjetas, controles de velocidad, selector visual, filtro de videos viejos |
| Ocultador | `content/hider.js` | CSS de ocultado segun el contexto (ventana flotante, pagina de reproduccion, Home) |
| Sitios externos | `content/external-content.js` | Boton "View" en Google y en los dominios que el usuario activa |
| Popup | `popup/popup.js` y modulos | Pestanas Settings, Feed, Selector, Sites |

El manager (`content/content.js`) observa el DOM de `ytd-page-manager` y, con un debounce de 150 ms, vuelve a inyectar botones y avisa a los suscriptores (controles de velocidad, filtro de viejos).

## Flujos

**Abrir el video.** El boton de la tarjeta llama a `messaging.js`, que envia `openFloatingWindow` al service worker. Este cierra la ventana anterior, calcula la esquina inferior derecha con `system.display` y crea un popup de 854x480 con `autoplay=1&yutu_popup=true`. El parametro `yutu_popup` hace que los content scripts sepan que estan dentro de la ventana flotante.

**Ajustes.** Todo vive en `chrome.storage.local` bajo la clave `yutuSettings`. Quien escribe (popup o selector visual) solo guarda; los content scripts reaccionan con `subscribeSettings()` (`content/config.js`), un unico listener de `chrome.storage.onChanged` que entrega los ajustes ya mezclados con los valores por defecto. No hay mensajes entre popup y paginas para aplicar ajustes.

**Contextos de ocultado.** `hider.js` decide segun donde corre:
- ventana flotante: banderas `hideReels`, `hideSidebar`, `hideDescription`, `hideHeader`, `hideActions`, `hideMerchShelf`, mas una barra de titulo propia;
- pagina de reproduccion normal: las mismas banderas dentro de `watchPage`, con el CSS limitado por `html[data-yutu-watch]` (solo `/watch`);
- Home: `hideHomeShorts`, limitado por `html[data-yutu-home]` (solo `/`).

**Filtro de videos viejos.** `old-video-filter.js` recorre las tarjetas del Home, lee la fecha relativa con `video-age.js` (ingles y espanol) y marca la tarjeta con `data-yutu-old="blur|hide"` si supera el umbral. La hoja `content.css` hace el resto: difumina la miniatura, atenua el titulo y deja canal y fecha sin tocar; al pasar el mouse todo vuelve. El Home se detecta por la ruta (`/`), no por atributos de YouTube.

## Esquema de ajustes (`yutuSettings`)

| Clave | Tipo | Defecto | Uso |
|-------|------|---------|-----|
| `hideReels`, `hideSidebar`, `hideDescription`, `hideHeader`, `hideActions`, `hideMerchShelf` | booleano | `true` | Ocultado en la ventana flotante |
| `watchPage` | objeto con las mismas banderas | todo `false` | Ocultado en paginas de reproduccion normales |
| `hideHomeShorts` | booleano | `false` | Oculta el bloque de Shorts del Home |
| `oldVideoFilter` | `{ enabled, months, mode }` | `false`, `6`, `blur` | Filtro de videos viejos (`mode`: `blur` u `hide`) |
| `closeOnFinish` | booleano | `true` | Cerrar la ventana al terminar el video |
| `customButtonSelector` | texto | vacio | Selector CSS donde colocar el boton |
| `externalSites` | `{ enabled, domains }` | `false`, `[]` | Sitios extra con boton "View" |

Los valores por defecto y la mezcla con lo guardado estan en `content/config.js`.

## Dependencias del marcado de YouTube

Cuando algo deja de funcionar tras un cambio de YouTube, el arreglo casi siempre esta en uno de estos archivos:

| Que | Donde | Se rompe cuando |
|-----|-------|-----------------|
| Tarjetas de video | `content/selectors.js` (`CARD_SELECTORS`) | YouTube renombra el componente de la tarjeta |
| Donde va cada boton | `content/button-factory.js` (`THUMB_SELECTORS`, `META_SELECTORS`) | Cambia la estructura de miniatura o metadata (la pestana Selector es el parche del usuario) |
| Elementos a ocultar | `content/selectors.js` (`HIDER_SELECTORS`) | Cambian ids o componentes de descripcion, sidebar, header |
| Bloque de Shorts del Home | `content/selectors.js` (`HOME_SHORTS_SELECTORS`, usa `:has()`) | Cambia el componente del lockup de Shorts |
| Fecha de la tarjeta | `content/old-video-filter.js` (`DATE_CANDIDATES`) | Cambian las clases de la fila de metadata |
| Blur de miniatura y titulo | `content/content.css` (`[data-yutu-old]`) | Cambian `yt-thumbnail-view-model` o el titulo del lockup |
| Controles de velocidad | `content/speed-anchor.js` | Cambia el contenedor donde se montan |

Los tests de `test/` fijan el comportamiento con marcado representativo; si YouTube cambia, conviene actualizar primero el marcado de prueba con un ejemplo real y despues el selector.

## Decisiones que no se ven en el codigo

- **Ventana nativa, no iframe.** YouTube bloquea cualquier embed (error 153), asi que se abre `youtube.com/watch` en un popup. Historia en `docs/ARCHIVED/ERROR_153_DEBUGGING.md` y `docs/ARCHIVED/ATTEMPTS_AND_ALTERNATIVES.md`.
- **Id de ventana en `storage.session`.** El service worker MV3 se suspende a los ~30 s y perderia el id en memoria.
- **Permisos de sitios externos bajo demanda.** Se piden por dominio con `chrome.permissions.request` y el content script se registra dinamicamente.
