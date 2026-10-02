# Chrome Web Store: textos del listing

Textos listos para copiar al Developer Dashboard. Los campos del store van en ingles; las notas en espanol.
Los limites son los del dashboard (verificar al subir, pueden cambiar).

## Item

| Campo | Valor | Limite |
|-------|-------|--------|
| Name | `Yutu Labs - Floating YouTube Player` | 75 |
| Summary | `Open YouTube videos in floating windows. Speed controls, auto-close, and distraction-free viewing.` | 132 (igual a `manifest.json` `description`) |
| Category | Productivity | |
| Language | English | |
| Privacy policy URL | https://github.com/dPeluChe/labs-yutu/blob/main/docs/STORE/PRIVACY_POLICY.md | |
| Homepage / support URL | https://github.com/dPeluChe/labs-yutu | |

## Detailed description

```text
Watch YouTube without leaving the page you are on.

Yutu Labs adds a small button to every video card on YouTube (Home, Search, sidebar and Shorts). One click opens the video in its own floating window, parked in the corner of your screen, while you keep browsing.

WHAT YOU GET
- One-click floating player: opens in a compact 854x480 window in the bottom-right corner. Move and resize it freely.
- Speed controls: 1x, 1.25x, 1.5x and 2x buttons, plus Alt/Option + 1..4 shortcuts. Also available on regular watch pages and Shorts.
- Close on finish: the floating window closes itself when the video ends.
- Distraction-free window: hide the description, recommendations, header, action buttons and merch shelf inside the floating window.
- Works beyond YouTube: a "View" button appears next to YouTube and Vimeo links in Google results and on websites you choose to enable.
- Button position picker: if YouTube changes its layout, point at the thumbnail area with the visual picker and the button follows.

PRIVATE BY DESIGN
No accounts, no analytics, no servers. Your preferences stay in your browser. Extra websites are optional and added one at a time, only when you ask for them.

HOW TO USE
1. Install the extension and open YouTube.
2. Click the Yutu icon on any video thumbnail.
3. Use the toolbar popup to tune speed, hidden elements and extra websites.

Not affiliated with or endorsed by YouTube or Google.
```

## Single purpose

```text
Open YouTube and Vimeo videos in a small floating window with playback speed controls, without leaving the current page.
```

## Permission justifications

| Permission | Justification (pegar tal cual) |
|------------|--------------------------------|
| `storage` | Saves the user's preferences (hidden elements, close-on-finish, custom button selector, enabled websites) locally. |
| `system.display` | Reads the screen work area to place the floating window in the bottom-right corner. |
| `scripting` | Registers the link-button content script only on the websites the user explicitly adds in the popup. |
| Host `*://*.youtube.com/*` | Adds the open button to video cards and controls playback speed on YouTube pages and in the floating window. |
| Host `*://*.google.com/*` | Adds a "View" button next to YouTube links in Google search results. |
| Optional hosts (`http://*/*`, `https://*/*`) | Requested per site via `chrome.permissions.request` only when the user adds a website in the popup. Never requested at install. |
| Remote code | No. All code ships in the package. |

## Privacy practices tab

- Data collected: **none** (leave every data type unchecked).
- Certify all three: not sold to third parties, not used for unrelated purposes, not used for creditworthiness or lending.
- Remote code: **No**.

## Graficos

| Asset | Tamano | Estado |
|-------|--------|--------|
| Icon | 128x128 | Listo: `icons/icon128.png` |
| Screenshots | 1280x800 (o 640x400), 1 a 5 | Pendiente |
| Small promo tile | 440x280 | Pendiente (opcional) |

Capturas sugeridas, en orden:
1. Home de YouTube con el icono visible sobre las miniaturas.
2. Ventana flotante abierta en la esquina con los controles de velocidad.
3. Popup de la extension (pestana de ocultar elementos).
4. Resultados de Google con el boton "View".
5. Selector visual de posicion del boton.

## Antes de subir

```bash
npm run package   # genera builds/yutu-labs-v<version>.zip
```

Subir el `.zip`, no la carpeta. Verificar que la version del manifest sea mayor que la ya publicada.
