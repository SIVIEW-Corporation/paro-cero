---
name: color-system-protocol
description: >
  Define la aplicación estricta de la paleta de colores "Technical Marine & Industrial Amber" para el portal de gestión. Aplica la regla 60-30-10, restricciones de accesibilidad WCAG y la arquitectura semántica de UI.
  Trigger: Cuando se diseñen nuevas pantallas, se refactoricen componentes UI (botones, tarjetas, tablas) o se apliquen clases utilitarias de color en Tailwind CSS.
license: Apache-2.0
metadata:
  author: Purple-Code-sh
  version: '1.0'
---

# Protocolo de Sistema de Color: Jerarquía y Semántica UI

## When to Use

Use this skill when:

- Construyendo o estructurando el layout principal de una pantalla (Dashboards, Tablas).
- Creando componentes interactivos que requieran feedback visual (Botones, Badges de estado, Alertas).
- Diseñando campos de formulario (Inputs, Selects, Password fields) — la apariencia debe ser inset/sunken.
- Tomando decisiones sobre jerarquía visual para guiar la atención del usuario.

---

## Critical Patterns

La paleta no es decorativa, es funcional. Debes seguir estas reglas para evitar la fatiga visual del operador y mantener la accesibilidad.

### Pattern 1: La Regla 60-30-10 (Jerarquía Estructural)

El sistema visual debe dividirse matemáticamente para evitar el ruido cognitivo:

- **60% Fondo (Background):** Usa `shBackground` (`#F8FAFC`) y blanco puro para las superficies/tarjetas. Es el lienzo de la aplicación.
- **30% Estructura Primaria (Technical Marine):** Usa la familia `shPrimary` (principalmente `shPrimary-800` y `shPrimary-900`) para barras laterales, headers, bordes gruesos y acciones estándar. Absorbe la luz y da seriedad corporativa.
- **10% Acento (Industrial Amber):** Usa `shAccent-500` ÚNICAMENTE para el punto de atención principal de la pantalla. No abuses de él.

```tsx
// Ejemplo de aplicación 60-30-10 en un layout base
<div className="min-h-screen bg-shBackground text-shNeutral-900"> {/* 60% */}
  <aside className="w-64 bg-shPrimary-900 text-white"> {/* 30% */}
    <nav>Navegación del Portal</nav>
  </aside>
  <main className="p-8">
    <header className="flex justify-between">
      <h1 className="text-shPrimary-800">Panel de Control</h1>
      <Button intent="accent">Crear Orden de Mantenimiento</Button> {/* 10% */}
    </header>
  </main>
</div>
```

### Pattern 2: Restricciones de Accesibilidad del Color de Marca (Amber)

El color de marca (`#F59E0B`) tiene una alta luminancia. Poner texto blanco sobre él viola las normativas WCAG 2.1 de accesibilidad. El amarillo no significa "Éxito", significa "Acción/Marca".

```tsx
// ❌ INCORRECTO: Texto blanco sobre ámbar es ilegible.
<button className="bg-shAccent-500 text-white">Guardar</button>
// ❌ INCORRECTO: Usar ámbar para indicar que una máquina funciona.
<Badge color="accent">Máquina Operativa</Badge>

// ✅ CORRECTO: Texto oscuro sobre ámbar.
<button className="bg-shAccent-500 text-shForeground hover:bg-shAccent-600">Guardar</button>
// ✅ CORRECTO: Usar Success (Emerald) para estados positivos.
<Badge color="success">Máquina Operativa</Badge>
```

### Pattern 3: Semántica de Tonos (50, 100, 700, 800)

Nunca uses colores base (500/600) para fondos grandes. Usa la escala de grises y pasteles para superficies y deja los tonos fuertes para interacción.

- **Tonos 50/100:** Fondos de componentes secundarios (ej. `bg-shPrimary-50`).
- **Tonos 500/600/700:** Fondos sólidos de botones y Badges activos.
- **Tonos 800/900:** Textos de alta legibilidad y contenedores estructurales pesados.

### Pattern 4: Estilo de Campos de Formulario (Inset / Sunken)

Los inputs de formulario deben tener una apariencia **hundida (inset)** para transmitir solidez y tactilidad industrial. NUNCA uses inputs planos con `bg-transparent`.

- **Fondo del input:** `bg-shNeutral-50` (gris muy claro, nunca transparente).
- **Sombra interna:** `shadow-inner shadow-shNeutral-900` (efecto de profundidad).
- **Separador izquierdo:** `border-l border-shNeutral-200` (línea divisoria entre icono y texto).
- **Borde del contenedor:** `border-shNeutral-300` (definición exterior).
- **Labels:** `text-shNeutral-700` (font-medium, 12px).
- **Iconos por defecto:** `text-shNeutral-600`.
- **Placeholder:** `text-shNeutral-600`.
- **Focus:** `border-shPrimary-500` + `ring-shPrimary-500/15`.
- **Error:** `border-shDanger-500`, icono `text-shDanger-500`, mensaje `text-shDanger-700`.

---

## Decision Tree

```text
¿El elemento es la única acción crítica o el CTA principal de la pantalla? → Usa "accent" (shAccent-500)
¿El elemento indica la navegación principal o una acción estándar?        → Usa "primary" (shPrimary-800)
¿El elemento alerta sobre una falla técnica o acción destructiva?         → Usa "danger" (shDanger-700)
¿El elemento confirma que la máquina está en línea o un guardado?         → Usa "success" (shSuccess-700)
¿El elemento es texto descriptivo o un contenedor sin interacción?        → Usa "neutral" (shNeutral-500 a 900)
Otherwise                                                                 → Usa "neutral" (shNeutral-100)
```

---

## Code Examples

### Example 1: Badges de Estado Semánticos

Los estados de maquinaria deben usar tonos 50 para el fondo y 700/800 para el texto y bordes. Esto garantiza legibilidad en tablas de datos densas.

```tsx
// Estado: Operativo
<span className="bg-shSuccess-50 text-shSuccess-800 border border-shSuccess-200 px-2 py-1 rounded-md">
  En Línea
</span>

// Estado: Falla Crítica
<span className="bg-shDanger-50 text-shDanger-800 border border-shDanger-200 px-2 py-1 rounded-md">
  Mantenimiento Requerido
</span>
```

### Example 2: Uso del Botón Refactorizado

Implementación del componente Button utilizando la semántica correcta del sistema.

```tsx
// Acción principal de marca (El 10% del diseño)
<Button intent="accent" variant="primary">Registrar Máquina</Button>

// Acciones estándar de formulario (El 30% del diseño)
<Button intent="primary" variant="secondary">Filtrar Datos</Button>
<Button intent="neutral" variant="ghost">Cancelar</Button>
```

### Example 3: Campo de Formulario con Estilo Inset

Implementación correcta de un input con apariencia hundida, icono y estados.

```tsx
<div className='group'>
  <label
    htmlFor='email'
    className='text-shNeutral-700 group-focus-within:text-shPrimary-700 mb-1.5 block text-xs font-medium transition-colors duration-300'
  >
    Correo electrónico
  </label>
  <div className='flex items-center overflow-hidden rounded-lg border border-shNeutral-300 bg-white transition-all focus-within:border-shPrimary-500 focus-within:ring-2 focus-within:ring-shPrimary-500/15'>
    <div className='text-shNeutral-600 group-focus-within:text-shPrimary-700 flex w-12 shrink-0 items-center justify-center transition-colors'>
      <Mail size={16} />
    </div>
    <input
      id='email'
      type='email'
      placeholder='ejemplo@winba.com'
      className='text-shNeutral-900 placeholder:text-shNeutral-600 shadow-shNeutral-900! border-shNeutral-200! bg-shNeutral-50! flex-1 rounded-none! rounded-l-md! border-0! border-l! py-2.5 pr-4 shadow-inner! ring-0! outline-none!'
    />
  </div>
</div>
```

---

## Resources

- **Tailwind Config**: Ver `src/app/globals.css` (o equivalente) para la declaración de variables `@theme inline`.
- **Componentes Base**: Ver `src/global-components/Button.tsx` para la implementación de la matriz de colores.
