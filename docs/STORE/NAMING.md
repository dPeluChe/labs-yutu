# Naming: propuesta

El nombre actual, "Yutu Labs", es provisional. Esta decision conviene tomarla **antes de la primera publicacion**: despues de publicar, cambiar el nombre implica reescribir el listing y las capturas, y pierde la reputacion acumulada en la tienda.

## Por que cambiarlo

- **Riesgo de rechazo.** "Yutu" se parece a YouTube. La politica de la Chrome Web Store prohibe nombres e iconos que puedan confundirse con una marca ajena, y el titulo propuesto antes ("... Floating YouTube Player") pone YouTube en el nombre, un patron que suele marcarse. Lo seguro es un nombre neutro y mencionar YouTube solo en la descripcion.
- **Alcance mayor que YouTube.** La extension tambien abre Vimeo y ya no es solo un reproductor: oculta distracciones y calma el feed.

## Criterios

1. No contiene "YouTube" ni variantes parecidas.
2. Corto, facil de decir y de escribir.
3. Sugiere lo que hace (ventana flotante, calma) sin describir la plataforma.
4. Libre en la tienda (busqueda del nombre exacto) y como handle o subdominio de dpeluche.dev.

## Candidatos

| Nombre | Titulo del listing | Por que |
|--------|--------------------|---------|
| **Perch** (recomendado) | Perch - Floating Video Player & Calm Feed | El video se "posa" en la esquina. Una palabra, encaja con el icono (ventana en la esquina) |
| Nook | Nook - Floating Video Player & Calm Feed | Un rincon tranquilo para el video |
| Hush | Hush - Calm Video Feed & Floating Player | Enfatiza el filtro de ruido del feed |
| Cornerview | Cornerview - Floating Video Player | Descriptivo, menos memorable |
| Floatly | Floatly - Floating Video Player | Directo, pero muy generico |

Antes de decidir hay que buscar cada nombre en la Chrome Web Store (puede haber extensiones con el mismo nombre) y comprobar el dominio o subdominio.

## Que cambia al renombrar

| Donde | Cambio |
|-------|--------|
| `manifest.json` | `name` (y `description` si cambia el mensaje) |
| `popup/popup.html` | `<title>` y `<h1>` |
| `docs/STORE/LISTING.md` | Name, descripcion, single purpose, URLs |
| `docs/STORE/PRIVACY_POLICY.md` | Titulo y nombre en el texto |
| `README.md`, `README.es.md`, `CLAUDE.md`, `CHANGELOG.md` | Titulo y menciones |
| `package.json`, `scripts/package.mjs` | `name` y nombre del zip (`yutu-labs-v<version>.zip`) |
| Repositorio de GitHub | Renombrar es opcional; GitHub redirige las URLs viejas |

**No se renombra** el prefijo interno `yutu-` (clases CSS, atributos `data-yutu-*`, claves `yutuSettings`): el usuario no lo ve y cambiarlo borraria los ajustes guardados.

## Siguiente paso

Elegir un nombre. Con el nombre elegido, el renombrado es un solo PR con la tabla anterior.
