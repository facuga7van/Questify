# Pendientes UI/UX — Perfil y Editor de Avatar

Fecha: 2026-01-02  
Objetivo: seguir mejorando la pantalla de `Profile` y la experiencia de edición del avatar (sin cambiar funcionalidades).

## Problemas/pendientes detectados

- **Responsive**
  - Ajustar padding/espaciados para pantallas chicas (evitar overflow y “apretado”).
  - Revisar tamaños de tipografías y botones para mobile (touch targets).
  - Validar que el editor no quede “alto” o cortado cuando la ventana sea pequeña.

- **Contador/indicadores de selección**
  - Mostrar **índice actual y total** para:
    - Pelo frontal (ej: `3 / 18`)
    - Color frontal (ej: `10 / 24`)
    - Pelo trasero (ej: `7 / 22`)
    - Color trasero (ej: `5 / 24`)
  - Ideal: además del texto, un indicador sutil (barra/pips) opcional.

- **Unificar estilo de botones (“Guardar” = “Cerrar”)**
  - El botón **Guardar cambios** debe verse con el **mismo lenguaje visual** que el botón **Cerrar** del header (misma familia de estilos: bordes, sombra, color, hover/active).
  - Revisar `CharSel.css` para que el botón de guardar reutilice clases (o tokens) y no sea un estilo “aparte”.

- **UX del editor**
  - Agregar “feedback” más claro cuando se cambia algo (ej: pequeño “Cambios sin guardar”).
  - Agregar botón secundario “Revertir” (volver al estado previo al abrir el editor) si se decide mantener el editor abierto.
  - Mejorar accesibilidad: navegación con teclado y `aria-label` ya están, pero falta:
    - Orden de tab coherente
    - Estados focus visibles consistentes con el resto de la app

## Tareas sugeridas (próxima iteración)

1. Implementar contadores por fila en `CharSelector` (UI + cálculo de totales).
2. Reestilizar el botón de guardar para que sea consistente con el botón de `Cerrar`.
3. Hacer una pasada de responsive (640px / 480px) y ajustar layout/espaciado.


