# Chrome Web Store: textos del listing

Textos listos para copiar al Developer Dashboard. Los campos del store van en ingles; las notas en espanol.
Los limites son los del dashboard (verificar al subir, pueden cambiar).

## Item

| Campo | Valor | Limite |
|-------|-------|--------|
| Name | `Yush: Calm Video Feed & Floating Player` (igual a `manifest.json` `name`) | 75 |
| Summary | `Open videos in floating windows with speed controls and auto-close. Quiet your feed: blur old videos, hide Shorts.` | 132 (igual a `manifest.json` `description`) |
| Category | Productivity | |
| Language | English | |
| Privacy policy URL | https://github.com/dPeluChe/yush/blob/main/docs/STORE/PRIVACY_POLICY.md | |
| Homepage / support URL | https://github.com/dPeluChe/yush | |
| Developer / publisher site | https://dpeluche.dev (peluche) | |

## Detailed description

```text
Hush the algorithm. Watch YouTube without leaving the page you are on.

Yush adds a small button to every video card on YouTube (Home, Search, sidebar and Shorts). One click opens the video in its own floating window, parked in the corner of your screen, while you keep browsing.

WHAT YOU GET
- One-click floating player: opens in a compact 854x480 window in the bottom-right corner. Move and resize it freely.
- Speed controls: 1x, 1.15x, 1.25x, 1.5x and 2x buttons, plus Alt/Option + 1..5 shortcuts. Also available on regular watch pages and Shorts.
- Close on finish: the floating window closes itself when the video ends.
- Distraction-free viewing: hide the description, recommendations, header, action buttons and merch shelf, separately for the floating window and for regular watch pages.
- Calm Home feed: optionally blur (or hide) old videos that YouTube resurfaces as reminders. Blurred cards clear on hover. You can also remove the Shorts shelf from Home.
- Works beyond YouTube: a "View" button appears next to YouTube and Vimeo links in Google results and on websites you choose to enable.
- Button position picker: if YouTube changes its layout, point at the thumbnail area with the visual picker and the button follows.

PRIVATE BY DESIGN
No accounts, no analytics, no servers. Your preferences stay in your browser. Extra websites are optional and added one at a time, only when you ask for them.

HOW TO USE
1. Install the extension and open YouTube.
2. Click the Yush icon on any video thumbnail.
3. Use the toolbar popup to tune speed, hidden elements and extra websites.

Made by peluche (https://dpeluche.dev). Not affiliated with or endorsed by YouTube or Google.
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
| Screenshots | 1280x800, PNG 24 bits sin alfa, 1 a 5 | 4 listas en `screenshots/`; falta la 5 (Selector y Sites) |
| Small promo tile | 440x280 | Pendiente (opcional) |

Capturas listas (subir en este orden):

1. `screenshots/1-floating-window.png`: ventana flotante con los controles de velocidad.
2. `screenshots/2-open-button.png`: boton en cada tarjeta del Home.
3. `screenshots/3-calm-feed.png`: filtro de videos viejos (miniatura difuminada, canal y fecha legibles).
4. `screenshots/4-settings-feed.png`: popup, pestanas Settings y Feed.

Pendiente: `5-selector-sites.png` con las pestanas Selector y Sites (recapturar despues del ajuste del boton "Pick element on page" de v1.6.1; las capturas actuales muestran el boton viejo).

Cada imagen es una composicion con titulo sobre el degradado de marca; los originales no se versionan.

## Antes de subir

```bash
npm run package   # genera builds/yush-v<version>.zip
```

Subir el `.zip`, no la carpeta. Verificar que la version del manifest sea mayor que la ya publicada.
