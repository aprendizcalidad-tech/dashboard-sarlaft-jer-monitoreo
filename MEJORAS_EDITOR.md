# Mejoras del editor — versión actualizada

Esta actualización mantiene Firebase Authentication únicamente para la identidad y conserva Google Sheets + Google Apps Script como origen de datos.

## Cambios incluidos

- Comic Sans MS queda como tipografía predeterminada para el dashboard y el informe.
- Selector de tipografía con Comic Sans MS, Arial, Calibri, Georgia, Times New Roman, Verdana y Trebuchet MS.
- Control de tamaño de letra para el texto seleccionado (8–48 px mediante selector y pasos de + / −).
- Ajuste automático de tamaño en páginas narrativas: portada, actividades, narrativas, cierre y páginas nuevas de texto.
- Las páginas de texto aprovechan la altura disponible y mantienen el contenido dentro del flujo normal de la página.
- Barra lateral izquierda con controles de edición para evitar saturar la cabecera.
- Cabecera más simple con año, selector múltiple de meses, consultar, descargar PDF y sesión.
- Menú de meses con posición calculada respecto al viewport para evitar que quede cortado por los bordes.
- Deshacer y rehacer mediante botones; atajos Ctrl+Z / Ctrl+Y (Cmd en Mac).
- Botón para eliminar cuadros de texto insertados, activado al seleccionar uno.
- Al exportar a PDF se eliminan los contornos de selección y se ocultan los controles del editor.
- La exportación comprueba desbordamientos de texto; si un texto no cabe ni al tamaño mínimo, avisa para dividirlo en varias páginas.

## Archivos modificados

- `index.html`: barra superior simplificada y herramientas añadidas a la barra lateral.
- `css/styles.css`: tipografía, layout, sidebar, responsividad y menú de meses.
- `js/editor.js`: historial, tipografía, selección/borrado de cuadros y ajuste automático del texto.
- `js/local-store.js`: preferencias de tipografía y estilos por elemento.
- `js/month-filter.js`: posicionamiento del menú de meses dentro de los límites de la ventana.
- `js/app.js`: exportación PDF sin selección visual ni recorte del área de trabajo.
- `README.md`: instrucciones de uso actualizadas.

## Pruebas realizadas

- Sintaxis de todos los archivos JavaScript.
- Sintaxis de `apps-script/Code.gs` validada copiándolo temporalmente a un archivo `.js` para comprobar parsing.
- Referencias locales de CSS, scripts e imágenes.
- Coincidencia de los IDs que consulta JavaScript con los elementos del HTML.
- Parsing de las reglas CSS y lectura estructural del HTML.

La conexión de Firebase y el endpoint real de Apps Script dependen de las credenciales y URL de despliegue de JER; no se pueden verificar sin esos valores configurados.
