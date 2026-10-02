# Yutu Labs

[English](./README.md)

Una extensión de Chrome que abre videos de YouTube y Vimeo en una ventana flotante pequeña, añade controles de velocidad y calma tu feed de YouTube. Creada por [peluche](https://dpeluche.dev).

> El nombre es provisional. La propuesta de naming está en [docs/STORE/NAMING.md](./docs/STORE/NAMING.md).

## Qué hace

- **Reproductor flotante.** Un botón en cada tarjeta de video (Home, búsqueda, barra lateral, Shorts) abre el video en su propia ventana, en la esquina inferior derecha de tu pantalla. Puedes moverla y cambiarle el tamaño.
- **Controles de velocidad.** Presets de 1x, 1.15x, 1.25x, 1.5x y 2x, con atajos Alt/Option + 1 a 5. Funcionan en la ventana flotante, en las páginas de reproducción normales y en Shorts.
- **Cerrar al terminar.** La ventana flotante se cierra sola cuando acaba el video.
- **Ocultar distracciones.** Oculta la descripción, las recomendaciones, el header, los botones de like y más, el merch y los Shorts, con ajustes separados para la ventana flotante y para las páginas de reproducción normales.
- **Home más tranquilo.** Opcionalmente difumina los videos viejos que YouTube vuelve a mostrar como recordatorios. La miniatura se difumina y el título se atenúa, pero el canal y la fecha se siguen leyendo, así ves de quién es y de hace cuánto de un vistazo. Al pasar el mouse el efecto desaparece. También puedes ocultar esas tarjetas por completo, o quitar el bloque de Shorts del Home.
- **Enlaces fuera de YouTube.** Aparece un botón "View" junto a los enlaces de YouTube y Vimeo en los resultados de Google y en los sitios que tú actives.
- **Selector de posición del botón.** Si YouTube cambia su diseño, señalas el lugar correcto en la página y el botón lo sigue.

## Instalación

Cuando esté publicada, se instala desde la Chrome Web Store. Mientras tanto, se compila desde el código y se carga la carpeta `dist/` generada como extensión sin empaquetar. Los pasos están en la [guía de desarrollo](./docs/GUIDES/DEVELOPMENT.md).

## Uso del popup

El popup de la barra de herramientas tiene cuatro pestañas.

- **Settings:** velocidad de reproducción de la pestaña activa, "cerrar al terminar" y las opciones de ocultar (ventana flotante / página de reproducción).
- **Feed:** ocultar el bloque de Shorts y filtrar videos viejos en el Home. Tras guardar, un botón recarga la pestaña de YouTube.
- **Selector:** elige dónde va el botón de abrir, con un selector CSS o señalando un elemento en la página.
- **Sites:** sitios donde debe aparecer el botón "View". Cada uno se solicita solo cuando lo añades.

## Cómo funciona

Un content script recorre las tarjetas de video que YouTube dibuja, añade el botón de abrir y vigila la página para detectar tarjetas nuevas mientras haces scroll o navegas. Al pulsar el botón, pide al service worker de la extensión que abra el video en una ventana popup con el reproductor oficial de YouTube. El filtro del Home lee la fecha relativa de cada tarjeta ("hace 3 meses", "3 months ago") y marca las viejas para que una hoja de estilos las difumine. Todas las preferencias se guardan localmente en el navegador.

Los detalles técnicos, incluido el esquema de ajustes y qué partes dependen del marcado de YouTube, están en [docs/ARCHITECTURE/HOW_IT_WORKS.md](./docs/ARCHITECTURE/HOW_IT_WORKS.md).

## Privacidad

Sin cuentas, sin analítica, sin servidores. Las preferencias se quedan en tu navegador y los sitios extra se solicitan uno a uno. Consulta la [política de privacidad](./docs/STORE/PRIVACY_POLICY.md).

## Solución de problemas

- **La ventana no se abre.** Recarga la extensión, refresca la pestaña de YouTube y comprueba que cargaste la carpeta `dist/` y no la raíz del repositorio. La consola del service worker muestra los errores de la ventana.
- **No aparecen botones en las tarjetas.** Refresca la pestaña de YouTube después de recargar la extensión. Si YouTube cambió su diseño, usa la pestaña Selector para apuntar el botón al lugar correcto.
- **El filtro del Home no hace nada.** Refresca la pestaña de YouTube y comprueba que el filtro esté activado en la pestaña Feed. Las fechas solo se leen si YouTube está en inglés o español.

## Documentación

El índice es [docs/README.md](./docs/README.md). Lo principal:

- [Cómo funciona](./docs/ARCHITECTURE/HOW_IT_WORKS.md)
- [Guía de desarrollo](./docs/GUIDES/DEVELOPMENT.md)
- [Listing de la Chrome Web Store y naming](./docs/STORE/LISTING.md)
- [Changelog](./CHANGELOG.md)
- [Backlog](./docs/TASK_TODO.md)

## Créditos

Creado por [peluche](https://dpeluche.dev) · [dpeluche.dev](https://dpeluche.dev). Sin afiliación ni respaldo de YouTube o Google.
