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

## 🏗️ Arquitectura: Feature-Sliced + Clean Architecture

Este proyecto está construido con **Angular 20 Standalone Components** siguiendo una arquitectura **Feature-Sliced** inspirada en **Domain-Driven Design (DDD)** y **Clean Architecture**.

## ✅ Principios Clave

- ✅ **Estructura por features** (bounded contexts), no por tipo de archivo
- ✅ **Separación por capas** internas: `domain/` → `data-access/` → `ui/`
- ✅ **Facades** como punto de entrada único a cada feature
- ✅ **Signals** para estado local (`signal()`, `computed()`)
- ✅ **Standalone Components** y **Zoneless** (`provideZonelessChangeDetection`)
- ✅ **Lazy loading** por feature con `loadChildren`
- ✅ **Control flow nativo**: `@if`, `@for`, `@switch`
- ✅ **SSR-ready**: compatible con Angular Universal

## 📂 Estructura de un Feature (Bounded Context)

```
src/app/features/{feature}/
├── domain/                           ← Modelos, interfaces, tipos puros
│   ├── models/
│   │   ├── {entity}.model.ts
│   │   └── index.ts
│   └── interfaces/                   (opcional)
│       └── {interface}.interface.ts
│
├── data-access/                      ← Lógica de negocio y acceso a datos
│   ├── api/
│   │   └── {feature}.api.ts          ← Servicios HTTP (backend)
│   ├── services/
│   │   └── {service}.service.ts      ← Lógica de negocio / integraciones
│   ├── stores/
│   │   └── {feature}.store.ts        ← Estado local (signals)
│   └── facades/
│       └── {feature}.facade.ts       ← ⚠️ PUNTO DE ENTRADA ÚNICO
│
├── ui/
│   ├── components/                   ← Componentes presentacionales
│   ├── pages/                        ← Smart components (contenedores)
│   └── widgets/                      (opcional)
│
├── feature.component.ts              ← Shell del feature (router-outlet)
└── routes.ts                         ← Rutas lazy del feature
```

## 🎯 Capas y Responsabilidades

| Capa | Responsabilidad | Puede depender de | NO puede depender de |
|------|----------------|-------------------|----------------------|
| **domain/** | Modelos, tipos, validaciones puras | Ninguna | Angular, servicios |
| **data-access/** | API calls, stores, facades, lógica de negocio | `domain/` | `ui/` |
| **ui/** | Componentes presentacionales | `domain/` | `data-access/` |
| **facade** | Orquesta stores, APIs y expone interfaz simple | `domain/`, `data-access/` | `ui/` |

### ⚠️ Reglas de Dependencia

```
✅ PERMITIDO:
ui/ → domain/
data-access/ → domain/
facade → stores, api, services
components → facade

❌ PROHIBIDO:
ui/ → data-access/  (usar facade)
features/ → features/ (acoplamiento cruzado)
domain/ → Angular imports
```

## 📦 Estructura del Proyecto

```
src/app/
├── core/                             ← Servicios singleton globales
│   ├── auth/
│   │   ├── auth.facade.ts           ✅ Facade de autenticación
│   │   ├── auth.guard.ts
│   │   └── auth.providers.ts
│   ├── user/
│   │   ├── user.store.ts            ✅ Store global de usuario
│   │   └── user-sync.service.ts
│   ├── services/
│   │   └── toggle.service.ts        ✅ Servicios globales
│   └── customizer-settings/
│
├── shared/                           ← Componentes reutilizables
│   ├── ui/
│   │   ├── layout/                  ✅ Header, Footer, Sidebar
│   │   └── breadcrumbs/
│   └── data-access/
│       ├── breadcrumb/
│       └── charts/
│
├── features/                         ← Bounded Contexts
│   ├── billing/                     ✅ EJEMPLO COMPLETO (ver abajo)
│   ├── patients/                    ✅ Con facade
│   ├── dashboard/                   ✅ Con facade
│   ├── profile/                     ✅ Con facade
│   ├── calendar/
│   ├── invoice/
│   ├── settings/
│   └── authentication/
│
├── layouts/                          ← Shells de layouts
│   ├── app-shell/
│   └── auth-shell/
│
└── pages/                            ← Páginas standalone
    ├── errors/
    ├── faq-page/
    └── notifications-page/
```

## 🚀 Ejemplo Real: Feature `billing` (Culqi Integration)

### Estructura Completa

```
src/app/features/billing/
├── domain/
│   └── models/
│       ├── plan.model.ts             ← Plan, PlanId, PlanLimits
│       ├── subscription.model.ts     ← ActiveSubscription, CheckoutState
│       ├── payment.model.ts          ← CulqiToken, CardData, PaymentRequest
│       └── index.ts
│
├── data-access/
│   ├── api/
│   │   ├── payments.api.ts           ← POST /payments/charge
│   │   └── subscriptions.api.ts      ← GET/POST subscriptions
│   ├── services/
│   │   ├── plans.service.ts          ← Lógica de planes (hardcoded)
│   │   └── culqi-integration.service.ts  ← SDK de Culqi
│   ├── stores/
│   │   ├── billing.store.ts          ← Estado: activeSubscription, selectedPlan
│   │   └── checkout.store.ts         ← Estado del checkout (idle/paying/success/error)
│   └── facades/
│       └── billing.facade.ts         ⚠️ PUNTO DE ENTRADA ÚNICO
│
├── ui/
│   ├── components/
│   │   ├── plan-card/                ← Presentacional
│   │   ├── checkout-form/            ← Formulario de pago
│   │   └── payment-status/           ← Feedback success/error
│   └── pages/
│       ├── pricing-page.component.ts ← Lista de planes
│       └── checkout-page.component.ts ← Flujo de pago
│
├── feature.component.ts
└── routes.ts
```

### Uso del Facade

```typescript
// checkout-page.component.ts
@Component({ /* ... */ })
export class CheckoutPageComponent {
  private readonly billing = inject(BillingFacade);

  selectedPlan = this.billing.selectedPlan;         // Signal
  checkoutStatus = this.billing.checkoutStatus;     // Signal
  plans = this.billing.plans;                       // Signal

  async onPayment(cardData: CardData): Promise<void> {
    const token = await this.culqi.generateToken(cardData);
    await this.billing.initiatePayment(token);      // Facade method
  }
}
```

## 🎭 Facades: Punto de Entrada Único

Los **facades** orquestan la lógica de cada feature y exponen una interfaz limpia:

```typescript
@Injectable({ providedIn: 'root' })
export class BillingFacade {
  private readonly plansService = inject(BillingPlansService);
  private readonly billingStore = inject(BillingStore);
  private readonly checkoutStore = inject(CheckoutStore);
  private readonly paymentsApi = inject(PaymentsApi);

  // Signals (read-only)
  readonly plans = this.plansService.plans;
  readonly selectedPlan = computed(() => /* ... */);
  readonly checkoutStatus = this.checkoutStore.status;

  // Actions (métodos públicos)
  selectPlan(planId: PlanId): void { /* ... */ }
  async initiatePayment(token: CulqiToken): Promise<void> { /* ... */ }
  cancelCheckout(): void { /* ... */ }
}
```

## ⚙️ Convenciones Técnicas

- **Naming:** `kebab-case` para archivos, `PascalCase` para clases
- **State management:** `signal()` + `computed()` (no NgRx)
- **Inputs/Outputs:** `input()`, `output()` (APIs modernas)
- **HTTP:** Todos los calls en `data-access/api/*.api.ts`
- **Lazy loading:** Todas las rutas principales con `loadChildren`
- **Estilos:** SCSS modular, `:host` para encapsulación

## 📚 Bounded Contexts Implementados

| Feature | Domain | Facade | API Services | Status |
|---------|--------|--------|--------------|--------|
| **billing** | ✅ | ✅ | ✅ (Culqi + Backend) | Completo |
| **patients** | ✅ | ✅ | ⚠️ Parcial | En progreso |
| **dashboard** | ⚠️ | ✅ | ⚠️ Parcial | En progreso |
| **profile** | ⚠️ | ✅ | ✅ (UserSync) | En progreso |
| **calendar** | ✅ Modelos | ✅ Señales compartidas | ✅ GET/POST/DELETE eventos | Completo |
| invoice | ❌ | ❌ | ❌ | Pendiente |
| settings | ❌ | ❌ | ✅ (UserSync) | Pendiente |

## 🔧 Próximos Pasos

1. ✅ Completar facades faltantes (calendar, invoice, settings)
2. ✅ Mover servicios de widgets a `data-access/services/`
3. ✅ Implementar tests para facades
4. ✅ Documentar integraciones (Culqi, Auth0)

## 🧩 Features destacados

### 👥 Gestión de Pacientes
- Tabla conectada al endpoint `GET /api/v1/profiles/patients/{nutritionist_id}`.
- Avatares sincronizados con `GET /api/v1/profiles/{user_id}/picture`, con `blob:` URLs cacheadas y fallbacks locales.
- Búsqueda por nombre o `user_id`, filtros en memoria y acciones de overview/delete alineadas con el diseño.
- Campos renderizados: nombre completo, edad, altura, peso, género, objetivo y estado de perfil.

### 🗓️ Calendario conectado a backend
- Servicios `CalendarEventsApiService` y `CalendarEventsService` que consumen `GET/POST/DELETE /api/v1/nutritionists/{nutritionist_id}/calendar-events`.
- El calendario grande (FullCalendar) y el panel “Working Schedule” se sincronizan mediante signals, mostrando los eventos desde la carga inicial.
- Creación y eliminación de eventos con feedback, resaltado de días con citas y lista lateral sincronizada.
- Horarios introducidos en formato Perú (UTC-5) y enviados automáticamente en UTC con precisión `HH:mm:ss.SSSZ`.
- Representación visual consistente (color badges/clases) tanto en el calendario mensual como en la lista lateral.
