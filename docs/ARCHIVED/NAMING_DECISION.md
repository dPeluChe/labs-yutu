> **ARCHIVED**: 2026-10-02
> The naming is settled (Yush). This is the decision record: why the product was renamed and which names were discarded. Do not reopen unless the name changes.

---

# Naming: decision record

**Nombre elegido: Yush** (antes "Yutu Labs"). Viene de "YouTube" + "hush". Eslogan: "Hush the algorithm". Titulo del listing: `Yush: Calm Video Feed & Floating Player`.

## Por que se cambio

- "Yutu" se parece demasiado a YouTube. La politica de la Chrome Web Store prohibe nombres e iconos que puedan confundirse con una marca ajena, y poner YouTube en el nombre del item suele marcarse. YouTube se menciona solo en la descripcion.
- La extension ya no es solo un reproductor flotante: tambien abre Vimeo, oculta distracciones y calma el feed.

## Por que Yush

- Corto, facil de escribir y sin otra extension con ese nombre en la tienda (busqueda de octubre de 2026).
- Conserva la idea de bajar el ruido del feed sin caer en la familia "Hush" ya ocupada.
- Buscar "yush" en la tienda llevaria a esta extension; en GitHub solo hay proyectos personales sin relacion.

Contras conocidos: la conexion con YouTube y hush solo se entiende si se explica (el subtitulo del listing lo hace), la pronunciacion es ambigua, y queda ligado a YouTube si algun dia se amplia a otras plataformas.

## Que se descarto (octubre de 2026)

| Nombre | Motivo |
|--------|--------|
| Hush | 10 o mas extensiones con ese nombre, dos de YouTube: Hush Feed (filtro por duracion, vistas, fecha y palabras clave) y Hush - Clean Video (oculta controles del reproductor) |
| Perch, Nook | Varias extensiones con el mismo nombre (dashboard de agentes, new tabs) |
| Quell, Lull, Shush | Ya existen en la tienda; Quell y Shush en el mismo tema de silenciar ruido |
| Lowkey | Casi igual a "Lownkey", extension de YouTube |
| Stillpane, Quietpane | Ya son productos (herramienta para Claude Code, new tab de Chrome) |
| Muffle | Libre en la tienda, pero suena a herramienta de audio. Era el segundo candidato |
| Calmpane, Glance | Libres, pero blandos o genericos |

## Estado de la verificacion

- Busqueda de "Yush" en el buscador de la Chrome Web Store: sin resultados (octubre de 2026). Nombre confirmado.
- Dominio: se decidio no comprar ninguno por ahora (`yush.so` parece libre; `yush.com` y `yush.app` estan a la venta).
- Repositorio de GitHub renombrado de `labs-yutu` a `yush`; GitHub redirige las URLs viejas. Carpeta local renombrada a `yush`.
- Pendiente: busqueda de marca (USPTO y EUIPO) para "Yush", opcional antes de publicar.

## Que se mantiene con el nombre viejo

El prefijo `yutu-` (clases CSS), los atributos `data-yutu-*`, el parametro `yutu_popup` y la clave `yutuSettings` son internos y se quedan: cambiarlos borraria los ajustes guardados de quien ya tenga la extension y no aportan nada al usuario. Los documentos de `docs/ARCHIVED/` y `docs/TASK_COMPLETED/` conservan el nombre de su epoca.
