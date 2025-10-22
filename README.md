# Daxa

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.1.5.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Angular Feature-Sliced Architecture (DDD + Clean Architecture Inspired)

Este proyecto está construido con **Angular Standalone Components** siguiendo una arquitectura **Feature-Sliced** inspirada en **Domain-Driven Design (DDD)** y **Clean Architecture**.

## Principios Clave

- **Estructura por features**, no por tipo de archivo.
- Cada feature es **autónoma** (domain + data-access + ui + container).
- **Separación por capas** internas, respetando dependencias unidireccionales.
- **Signals** para el estado local, **computed()** para estado derivado.
- **Standalone Components** y **ChangeDetection.OnPush** en toda la app.
- **Lazy loading** por feature y **lazy components** cuando aplica.
- **Sin NgModules** — Angular Standalone moderno (>= v17).
- **Control flow nativo**: `@if`, `@for`, `@switch`.
- **SSR-ready**: compatible con Angular Universal e hidratación.

## Capas y Responsabilidades

| Capa | Descripción | Depende de |
|------|--------------|------------|
| **domain/** | Modelos, tipos y validaciones puras (sin Angular). | Ninguna |
| **data-access/** | Servicios HTTP, persistencia local, mappers DTO→dominio. | domain |
| **ui/** | Componentes presentacionales sin lógica de negocio. | domain |
| **feature.component.ts** | Contenedor: orquesta estado, API y UI. | domain, data-access, ui |
| **core/** | Servicios globales, interceptores, stores singleton. | — |
| **shared/** | Componentes, pipes y directivas reutilizables. | — |

**Nunca:**
- features → features (acoplamiento cruzado)
- data-access → ui
- ui → data-access

## ⚙️ Convenciones Técnicas

- **Estado local:** `signal()`, `computed()`; no se usa `NgRx` salvo casos extremos.
- **Inputs/Outputs modernos:** `input()`, `output()`.
- **Detección de cambios:** `ChangeDetectionStrategy.OnPush` en todos los componentes.
- **Estilos:** SCSS modular; clases con bindings (`[class.active]="…"`) en lugar de `ngClass`.
- **Control flow:** nativo (`@if`, `@for`, `@switch`).
- **Testing:**
    - `domain/`: funciones puras
    - `data-access/`: HttpTestingController
    - `ui/`: Test Harness o shallow testing

## Ejemplo de Feature

```ts
// features/dashboard/feature.component.ts
import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { DashboardApi } from './data-access/dashboard.api';

@Component({
  selector: 'app-dashboard-feature',
  template: `
    <section>
      <h1 class="text-xl font-semibold">Dashboard</h1>
      @if (status() === 'loading') { <p>Cargando…</p> }
      @if (status() === 'ready') {
        <app-stats-card [stats]="stats()"></app-stats-card>
      }
      @if (status() === 'error') { <p>Error al cargar datos.</p> }
    </section>
  `,
})
export class DashboardFeature {
  #api = inject(DashboardApi);
  #data = signal<{ total: number } | null>(null);
  status = signal<'idle'|'loading'|'ready'|'error'>('idle');

  stats = computed(() => this.#data() ?? { total: 0 });

  constructor() {
    this.load();
  }

  load() {
    this.status.set('loading');
    this.#api.getOverview().subscribe({
      next: d => { this.#data.set(d); this.status.set('ready'); },
      error: () => this.status.set('error'),
    });
  }
}