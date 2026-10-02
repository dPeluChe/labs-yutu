# Guia de desarrollo

Pasos que no se deducen leyendo el repo. Requisitos: Node 18 o superior y Chrome.

## Compilar y cargar

```bash
npm install        # solo la primera vez
npm run build      # genera dist/ (limpia la carpeta antes)
npm run watch      # reconstruye al guardar, con sourcemaps
```

Chrome solo carga `dist/`, nunca la raiz: el `manifest.json` de la raiz apunta a archivos que solo existen despues del build.

1. Abre `chrome://extensions` y activa el modo de desarrollador.
2. "Cargar descomprimida" y elige la carpeta `dist/`.
3. Despues de cada build pulsa "Recargar" en la extension **y refresca la pestana de YouTube**. Las pestanas abiertas conservan el script anterior hasta que se recargan.

## Calidad

```bash
npm run lint       # eslint + stylelint
npm test           # node:test + jsdom
npm run check      # lint + tests + build (lo que debe pasar antes de un PR)
```

Los tests usan jsdom con marcado de YouTube de ejemplo. No hay forma de ejecutar la extension completa en CI, asi que despues de un cambio visual se prueba a mano en YouTube.

## Depurar

- **Content script:** consola de la pagina de YouTube; los mensajes llevan el prefijo "Yush".
- **Service worker:** `chrome://extensions`, "Inspect service worker".
- **Popup:** clic derecho sobre el popup, "Inspeccionar".
- **Atributos de depuracion en las tarjetas:** `data-yutu-injected` (botones puestos), `data-yutu-age` (meses medidos) y `data-yutu-old` (efecto aplicado). Si una tarjeta no tiene ninguno, el script correspondiente no esta corriendo en esa pagina.

## Iconos

El vector de referencia es `icons/icon.svg`. Los PNG de 16, 48 y 128 px se regeneran con `npm run icons` (script sin dependencias); no se editan a mano.

## Publicar una version

1. Sube la version en `manifest.json` y `package.json` (deben coincidir; `npm run package` falla si no).
2. Anota los cambios en `CHANGELOG.md`.
3. `npm run package` genera `builds/yush-v<version>.zip` listo para el Developer Dashboard.
4. Los textos del listing estan en `docs/STORE/LISTING.md`.

## Flujo de trabajo

Todo cambio va en una rama con PR y squash merge a `main`. La configuracion de `/ship` esta en `CLAUDE.md`.
