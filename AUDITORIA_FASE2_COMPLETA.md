# 🏗️ Auditoría Arquitectónica Global - FASE 2 Completa

**Fecha:** 2025-12-02  
**Angular Version:** 20.3.13  
**Estado:** Post FASE 1, 2.1 y 2.2

---

## 1. 🧾 Resumen Ejecutivo

- ✅ **Estado general:** Arquitectura sólida con cumplimiento alto de reglas modernas de Angular 17+
- ✅ **Cumplimiento de reglas:** ~85% - Excelente progreso en FASE 1 y 2
- ⚠️ **Riesgos actuales:** 
  - Uso de `ChangeDetectorRef.detectChanges()` en componentes con blobs/imágenes (4 componentes)
  - Duplicación de lógica de carga de pacientes entre dashboard widgets y página de lista
  - Effects en componentes que podrían moverse a stores/servicios
- 🎯 **Oportunidades principales:**
  - Centralizar estado de pacientes en un store único
  - Migrar blobs de imágenes a signals centralizados para habilitar OnPush
  - Refactorizar effects de componentes a stores/servicios
  - Agregar OnPush a componentes seguros que aún no lo tienen

---

## 2. 🧱 Estado de Cumplimiento de Reglas (.cursor/rules/cursor.md)

| Categoría | Estado | Comentario |
|-----------|--------|------------|
| **TypeScript Strict** | ✅ Cumplido | No se detectaron usos de `any` problemáticos |
| **Standalone Components** | ✅ Cumplido | Todos los componentes son standalone, sin `standalone: true` explícito |
| **Signals para Estado** | ⚠️ Parcial | `ToggleService` y `CustomizerSettingsService` migrados. Pendiente: stores de pacientes, kanban, calendar |
| **input()/output()** | ✅ Cumplido | No se encontraron `@Input()` o `@Output()` decorators |
| **Control Flow Nativo** | ✅ Cumplido | No se encontraron `*ngIf`, `*ngFor`, `*ngSwitch` |
| **ngClass/ngStyle** | ✅ Cumplido | Todos los casos migrados a bindings nativos `[class.*]` |
| **OnPush** | ⚠️ Parcial | 16 componentes con OnPush, ~30+ sin OnPush (muchos justificados por CDR/blobs) |
| **Host Bindings** | ✅ Cumplido | No se encontraron `@HostListener` o `@HostBinding` |
| **inject() Function** | ⚠️ Parcial | Mayoría usa `inject()`, algunos constructores con inyección (CreatePatient, EditPatient) |
| **providedIn: 'root'** | ✅ Cumplido | Todos los servicios usan `providedIn: 'root'` |
| **NgOptimizedImage** | ✅ Cumplido | Uso correcto en componentes estáticos |
| **Lazy Loading** | ✅ Cumplido | Todas las features usan lazy loading |
| **Signal mutate()** | ✅ Cumplido | No se encontraron usos de `.mutate()` |

---

## 3. 📊 Componentes Sensibles y Estado Actual

### 3.1 PatientsListComponent (Widget Dashboard)

**Archivo:** `src/app/features/dashboard/ui/widgets/patients-list/patients-list.component.ts`

- **ChangeDetectionStrategy:** Default (sin OnPush)
- **Signals/Observables:** 
  - `isLoading = signal(false)`
  - Usa `MatTableDataSource` (Observable interno)
- **ChangeDetectorRef:** ✅ SÍ - `cdr.detectChanges()` en 3 lugares:
  - `finalize()` del observable de carga
  - `next()` del observable de carga
  - `loadProfilePictures()` después de actualizar avatarUrl
- **Blobs:** ✅ SÍ - `PatientPictureApiService` retorna blob URLs (`URL.createObjectURL`)
- **Candidato a refactor Fase 3:** ✅ SÍ
  - **Razón:** Duplica lógica de carga con página de lista. Blobs requieren CDR. Podría usar store centralizado de pacientes con signals de avatares.

---

### 3.2 TotalPatientsComponent

**Archivo:** `src/app/features/dashboard/ui/widgets/patients-overview/total-patients/total-patients.component.ts`

- **ChangeDetectionStrategy:** Default (sin OnPush)
- **Signals/Observables:**
  - `patientsSignal = signal<PatientWithAvatar[]>([])`
  - `loadingSignal = signal(false)`
  - `totalPatients = computed(() => this.patientsSignal().length)`
  - `recentPatients = computed(() => this.patientsSignal().slice(0, 5))`
- **ChangeDetectorRef:** ✅ SÍ - `cdr.detectChanges()` en:
  - `loadPatients()` después de setear signals
  - `updatePatientAvatar()` después de actualizar signal
- **Blobs:** ✅ SÍ - Carga avatares vía `PatientPictureApiService` (blob URLs)
- **Candidato a refactor Fase 3:** ✅ SÍ
  - **Razón:** Duplica carga de pacientes. Blobs requieren CDR. Podría usar store centralizado.

---

### 3.3 CompletedProfilesComponent

**Archivo:** `src/app/features/dashboard/ui/widgets/patients-overview/completed-profiles/completed-profiles.component.ts`

- **ChangeDetectionStrategy:** Default (sin OnPush)
- **Signals/Observables:**
  - `patientsSignal = signal<Patient[]>([])`
  - `loadingSignal = signal(false)`
  - `completedProfiles = computed(() => ...)`
  - `completionPercentage = computed(() => ...)`
- **ChangeDetectorRef:** ✅ SÍ - `cdr.detectChanges()` en `loadPatients()`
- **Blobs:** ❌ NO
- **Candidato a refactor Fase 3:** ✅ SÍ
  - **Razón:** Duplica carga de pacientes. Podría usar store centralizado y habilitar OnPush fácilmente.

---

### 3.4 KanbanListComponent

**Archivo:** `src/app/features/dashboard/ui/widgets/kanban/kanban-list.component.ts`

- **ChangeDetectionStrategy:** ✅ OnPush
- **Signals/Observables:**
  - `tasks = signal<KanbanTask[]>([])`
  - `isLoading = signal(false)`
  - `formattedTasks = computed(() => ...)`
- **ChangeDetectorRef:** ❌ NO
- **Blobs:** ❌ NO
- **Candidato a refactor Fase 3:** ⚠️ Parcial
  - **Razón:** Ya está bien estructurado con signals y OnPush. Podría beneficiarse de un store centralizado de kanban si se comparte estado con la página completa.

---

### 3.5 WorkingScheduleComponent

**Archivo:** `src/app/features/calendar/ui/component/working-schedule/working-schedule.component.ts`

- **ChangeDetectionStrategy:** ✅ OnPush
- **Signals/Observables:**
  - `mode = input<"full" | "compact">("full")`
  - `events = this.calendarService.events` (signal del servicio)
  - `selectedDateSignal = signal<Date>(...)`
  - Múltiples `computed()` para derivar estado
- **ChangeDetectorRef:** ❌ NO
- **Blobs:** ❌ NO
- **Candidato a refactor Fase 3:** ❌ NO
  - **Razón:** Ya está bien estructurado con signals, OnPush, y usa el servicio centralizado de calendar.

---

### 3.6 CalendarComponent

**Archivo:** `src/app/features/calendar/ui/pages/calendar.component.ts`

- **ChangeDetectionStrategy:** Default (sin OnPush)
- **Signals/Observables:**
  - `events = this.calendarService.events` (signal)
  - Effect para sincronizar eventos con FullCalendar
- **ChangeDetectorRef:** ❌ NO
- **Blobs:** ❌ NO
- **Candidato a refactor Fase 3:** ⚠️ Parcial
  - **Razón:** Usa FullCalendar (librería externa) que puede requerir Default CD. Podría evaluarse OnPush si FullCalendar funciona bien con signals.

---

### 3.7 PatientsListComponent (Página)

**Archivo:** `src/app/features/patients/ui/pages/list/patients-list.component.ts`

- **ChangeDetectionStrategy:** Default (sin OnPush)
- **Signals/Observables:**
  - `isLoadingPatients = false` (variable, no signal)
  - `MatTableDataSource` (Observable interno)
- **ChangeDetectorRef:** ❌ NO (aunque podría necesitarlo para blobs)
- **Blobs:** ✅ SÍ - Carga avatares vía `PatientPictureApiService`
- **Candidato a refactor Fase 3:** ✅ SÍ
  - **Razón:** Duplica lógica con widget. Blobs requieren manejo especial. Podría usar store centralizado.

---

### 3.8 CreatePatientComponent / EditPatientComponent

**Archivos:** `create-patient.component.ts`, `edit-patient.component.ts`

- **ChangeDetectionStrategy:** Default (sin OnPush)
- **Signals/Observables:** Formularios reactivos complejos
- **ChangeDetectorRef:** ❌ NO
- **Blobs:** ❌ NO (aunque tienen FileUploadModule)
- **Candidato a refactor Fase 3:** ❌ NO
  - **Razón:** Formularios complejos con ngx-editor, FileUpload. OnPush podría romper validaciones dinámicas.

---

## 4. 🧬 Blobs, Imágenes y ChangeDetectorRef

### 4.1 Componentes que usan Blobs

| Componente | Dónde se crean | Dónde se liberan | CDR usado | Riesgo | Propuesta |
|------------|----------------|------------------|-----------|--------|-----------|
| **PatientPictureApiService** | `getProfilePicture()` → `URL.createObjectURL(blob)` | `setCache()` → `URL.revokeObjectURL(previous)` | N/A (servicio) | Medio | ✅ OK - Servicio centralizado con cache |
| **PatientsListComponent (widget)** | Indirecto vía `PatientPictureApiService` | Indirecto vía servicio | ✅ SÍ (3 lugares) | Alto | Mover avatares a store signal `avatarUrlsByUserId` |
| **TotalPatientsComponent** | Indirecto vía `PatientPictureApiService` | Indirecto vía servicio | ✅ SÍ (2 lugares) | Alto | Mover avatares a store signal `avatarUrlsByUserId` |
| **PatientsListComponent (página)** | Indirecto vía `PatientPictureApiService` | Indirecto vía servicio | ❌ NO (pero debería) | Medio | Mover avatares a store signal `avatarUrlsByUserId` |
| **UserStore** | `setPhotoUrl()` puede recibir blob URL | `setPhotoUrl()` → `URL.revokeObjectURL()` | N/A | Bajo | ✅ OK - Store centralizado |

### 4.2 Componentes que usan ChangeDetectorRef

| Componente | Dónde se llama | Razón | Riesgo | Propuesta |
|------------|----------------|-------|--------|-----------|
| **PatientsListComponent (widget)** | `loadPatients()` finalize, next, `loadProfilePictures()` | Blobs de avatares | Alto | Mover a store signal, habilitar OnPush |
| **TotalPatientsComponent** | `loadPatients()` next/error, `updatePatientAvatar()` | Blobs de avatares | Alto | Mover a store signal, habilitar OnPush |
| **CompletedProfilesComponent** | `loadPatients()` next/error | Signals no detectados (sin OnPush) | Medio | Habilitar OnPush, remover CDR |
| **AppComponent** | No encontrado | - | - | - |

### 4.3 Propuesta de Mejora: Store de Avatares

**Diseño propuesto:**

```typescript
@Injectable({ providedIn: 'root' })
export class PatientAvatarStore {
  private readonly avatarUrlsSig = signal<Map<string, string | null>>(new Map());
  private readonly loadingSig = signal<Set<string>>(new Set());
  
  readonly avatarUrl = (userId: string) => computed(() => this.avatarUrlsSig().get(userId) ?? null);
  readonly isLoading = (userId: string) => computed(() => this.loadingSig().has(userId));
  
  loadAvatar(userId: string): void {
    // Lógica de carga con PatientPictureApiService
    // Actualiza signals, no requiere CDR
  }
}
```

**Beneficios:**
- Elimina necesidad de CDR en componentes
- Permite OnPush en todos los componentes que usan avatares
- Centraliza lógica de cache y liberación de blobs
- Reduce duplicación de código

**Clasificación:** Refactor Moderado (2-3 días)

---

## 5. 🧍‍♂️ Estado de Pacientes y Flujo de Datos

### 5.1 Dónde se cargan pacientes actualmente

1. **PatientsListComponent (página):**
   - `loadPatients()` → `patientsApi.getPatientsByNutritionist(userId)`
   - Almacena en `MatTableDataSource`
   - Carga avatares individualmente

2. **PatientsListComponent (widget dashboard):**
   - `loadPatients()` → `patientsApi.getPatientsByNutritionist(userId)`
   - Almacena en `MatTableDataSource`
   - Carga avatares individualmente
   - Usa effect para observar `userId()`

3. **TotalPatientsComponent:**
   - `loadPatients()` → `patientsApi.getPatientsByNutritionist(userId)`
   - Almacena en `patientsSignal`
   - Carga avatares de primeros 5 pacientes
   - Usa effect para observar `userId()`

4. **CompletedProfilesComponent:**
   - `loadPatients()` → `patientsApi.getPatientsByNutritionist(userId)`
   - Almacena en `patientsSignal`
   - No carga avatares
   - Usa effect para observar `userId()`

### 5.2 Duplicación detectada

- ✅ **Misma API:** Todos usan `patientsApi.getPatientsByNutritionist(userId)`
- ✅ **Misma lógica de effect:** Todos observan `userStore.userId()` con effect
- ✅ **Misma lógica de carga de avatares:** `PatientPictureApiService` (pero duplicada en cada componente)
- ⚠️ **Diferentes estructuras de datos:** `MatTableDataSource` vs `signal<Patient[]>`

### 5.3 Propuesta de Diseño: PatientsStore

```typescript
@Injectable({ providedIn: 'root' })
export class PatientsStore {
  private readonly patientsSig = signal<Patient[]>([]);
  private readonly loadingSig = signal(false);
  private readonly errorSig = signal<string | null>(null);
  private lastLoadedUserId: string | null = null;
  
  // Signals públicos
  readonly patients = this.patientsSig.asReadonly();
  readonly loading = this.loadingSig.asReadonly();
  readonly error = this.errorSig.asReadonly();
  
  // Computed derivados
  readonly totalPatients = computed(() => this.patientsSig().length);
  readonly completedProfiles = computed(() => 
    this.patientsSig().filter(p => p.user_profile_completed === true).length
  );
  readonly completionPercentage = computed(() => {
    const total = this.totalPatients();
    return total === 0 ? 0 : Math.round((this.completedProfiles() / total) * 100);
  });
  readonly recentPatients = computed(() => this.patientsSig().slice(0, 5));
  
  // Métodos
  loadPatients(userId: string, options?: { force?: boolean }): void {
    // Lógica de carga centralizada
  }
  
  // Effect en constructor que observa userId
  constructor() {
    effect(() => {
      const userId = inject(UserStore).userId();
      if (userId && userId !== this.lastLoadedUserId) {
        this.loadPatients(userId);
      }
    });
  }
}
```

### 5.4 Componentes que usarían el store

| Componente | Qué usaría del store |
|------------|----------------------|
| **PatientsListComponent (página)** | `patients()`, `loading()`, `loadPatients()` |
| **PatientsListComponent (widget)** | `patients()`, `loading()`, `recentPatients()` |
| **TotalPatientsComponent** | `totalPatients()`, `recentPatients()`, `loading()` |
| **CompletedProfilesComponent** | `completedProfiles()`, `totalPatients()`, `completionPercentage()`, `loading()` |

**Clasificación:** Refactor Moderado-Complejo (3-5 días)

---

## 6. ⚙️ Effects y Bootstraps

### 6.1 Effects importantes detectados

| Ubicación | Propósito | Clasificación | Comentario |
|-----------|-----------|---------------|------------|
| **DashboardBootstrapService** | Carga inicial de eventos de calendario cuando usuario autenticado | ✅ OK tal cual | Bien estructurado, evita loops con flags |
| **HeaderComponent** | Carga foto de perfil si userId disponible y no hay foto | ⚠️ Mejorable | Podría moverse a UserSyncService |
| **PatientsListComponent (widget)** | Observa `userId()` y recarga pacientes | ⚠️ Mejorable | Debería moverse a PatientsStore |
| **TotalPatientsComponent** | Observa `userId()` y recarga pacientes | ⚠️ Mejorable | Debería moverse a PatientsStore |
| **CompletedProfilesComponent** | Observa `userId()` y recarga pacientes | ⚠️ Mejorable | Debería moverse a PatientsStore |
| **KanbanListComponent** | Observa `userId()` y recarga tareas | ⚠️ Mejorable | Podría moverse a KanbanTasksService |
| **WorkingScheduleComponent** | Sincroniza eventos con calendario Material | ✅ OK tal cual | Lógica de UI, apropiado en componente |
| **CalendarComponent** | Sincroniza eventos con FullCalendar | ✅ OK tal cual | Lógica de UI con librería externa |
| **AddTaskDialogComponent** | Reacciona a cambios en `open()` signal | ✅ OK tal cual | Lógica de UI del diálogo |
| **CustomizerSettingsService** | Sincroniza signals de tema con `document.body.classList` | ✅ OK tal cual | Efectos de DOM, apropiado en servicio |
| **AccountSettingsComponent** | (Revisar implementación) | ⚠️ Revisar | - |
| **WelcomeComponent** | (Revisar implementación) | ⚠️ Revisar | - |
| **MacroTargetsComponent** | (Revisar implementación) | ⚠️ Revisar | - |

### 6.2 Análisis de riesgos

**Effects con riesgo de loops:**
- ❌ Ninguno detectado - Todos usan flags o condiciones que previenen loops

**Effects que deberían moverse a stores/servicios:**
- ✅ `PatientsListComponent`, `TotalPatientsComponent`, `CompletedProfilesComponent` → `PatientsStore`
- ✅ `KanbanListComponent` → `KanbanTasksService` (ya tiene servicio, solo mover effect)

**Effects apropiados en componentes:**
- ✅ `WorkingScheduleComponent`, `CalendarComponent` - Lógica de UI con librerías externas
- ✅ `AddTaskDialogComponent` - Lógica de UI del diálogo
- ✅ `CustomizerSettingsService` - Efectos de DOM globales

---

## 7. 🚦 Mapa de OnPush vs Default (Actualizado)

### 7.1 Componentes CON OnPush (16 encontrados)

1. `AppComponent` (app.ts)
2. `DashboardPage`
3. `FooterComponent`
4. `BreadcrumbsComponent`
5. `TermsConditionsComponent`
6. `PrivacyPolicyComponent`
7. `AgeCardComponent`
8. `HeightCardComponent`
9. `WeightCardComponent`
10. `DailyCalorieTargetComponent`
11. `TimelineComponent`
12. `KanbanListComponent`
13. `KanbanBoardComponent`
14. `WorkingScheduleComponent`
15. `ProfileInformationComponent`
16. `WelcomeComponent`

### 7.2 Componentes SIN OnPush - Candidatos a OnPush

| Componente | Candidato | Motivo |
|------------|-----------|--------|
| **PatientsListComponent (widget)** | ⚠️ Después de refactor | Actualmente usa CDR para blobs. Con store de avatares → SÍ |
| **TotalPatientsComponent** | ⚠️ Después de refactor | Actualmente usa CDR para blobs. Con store de avatares → SÍ |
| **CompletedProfilesComponent** | ✅ SÍ | Ya usa signals, solo necesita remover CDR |
| **PatientsListComponent (página)** | ⚠️ Después de refactor | Actualmente sin CDR pero usa blobs. Con store → SÍ |
| **CalendarComponent** | ⚠️ Evaluar | Usa FullCalendar, probar si funciona con OnPush |
| **ProjectsRoadmapComponent** | ⚠️ Evaluar | Usa ApexCharts, probar si funciona con OnPush |

### 7.3 Componentes SIN OnPush - NO candidatos (justificados)

| Componente | Motivo |
|------------|--------|
| **CreatePatientComponent** | Formulario complejo con ngx-editor, FileUpload, validaciones dinámicas |
| **EditPatientComponent** | Formulario complejo con ngx-editor, FileUpload, validaciones dinámicas |
| **AccountSettingsComponent** | Formulario complejo, posiblemente con validaciones dinámicas |
| **Otros componentes de formularios** | Validaciones dinámicas, cambios de estado complejos |

---

## 8. 🧪 Estado de Testing

### 8.1 Archivos .spec.ts encontrados (9 archivos)

1. `app.spec.ts`
2. `customizer-settings.service.spec.ts`
3. `weekly-calories-burned.service.spec.ts`
4. `weekly-caloric-progress.service.spec.ts`
5. `macro-targets.service.spec.ts`
6. `daily-calorie-distribution.service.spec.ts`
7. `avg-exercise-time.service.spec.ts`
8. `avg-calories-burned.service.spec.ts`
9. `projects-roadmap.service.spec.ts`

### 8.2 Configuración de testing

**Detectado en package.json:**
- Script `"test": "ng test"` presente
- Probablemente usa Karma/Jasmine (estándar Angular)

**Estado:** Configuración básica presente, pero cobertura limitada (solo servicios de widgets)

### 8.3 Recomendación de tests iniciales

**Nivel sugerido:** Servicios y Stores (más estables que componentes)

**Top 5 candidatos para tests unitarios:**

1. **CustomizerSettingsService** (prioridad alta)
   - **Qué probar:** Signals de tema, persistencia en localStorage, effects de DOM
   - **Razón:** Servicio crítico, lógica compleja, usado en toda la app

2. **ToggleService** (prioridad alta)
   - **Qué probar:** Signal de toggle, método `toggle()`
   - **Razón:** Servicio simple pero crítico, usado en layout

3. **UserStore** (prioridad alta)
   - **Qué probar:** Signals de perfil, computed de userId, persistencia
   - **Razón:** Store central, usado en múltiples componentes

4. **PatientsApiService** (prioridad media)
   - **Qué probar:** Llamadas HTTP, manejo de errores
   - **Razón:** API crítica, usado en múltiples lugares

5. **PatientPictureApiService** (prioridad media)
   - **Qué probar:** Cache de blobs, creación/liberación de URLs, manejo de errores
   - **Razón:** Lógica compleja de blobs, usado en múltiples componentes

**Estrategia:**
1. Empezar con servicios/stores (más estables)
2. Luego componentes simples (Footer, Breadcrumbs)
3. Finalmente componentes complejos (formularios, widgets)

---

## 9. 🎯 Plan Propuesto para FASE 3

### 9.1 FASE 3.1: Blobs + CDR + Widgets de Pacientes (Prioridad Alta)

**Alcance:**
- Crear `PatientAvatarStore` para centralizar avatares
- Migrar `PatientsListComponent` (widget), `TotalPatientsComponent`, `CompletedProfilesComponent` a usar el store
- Eliminar `ChangeDetectorRef` de estos componentes
- Habilitar `OnPush` en `CompletedProfilesComponent` (inmediato) y otros (después de migración)

**Riesgo:** Medio  
**Beneficio:** Alto - Elimina CDR, habilita OnPush, reduce duplicación  
**Tiempo estimado:** 2-3 días

---

### 9.2 FASE 3.2: Store de Pacientes (Prioridad Alta)

**Alcance:**
- Crear `PatientsStore` con signals y computed derivados
- Migrar todos los componentes que cargan pacientes al store
- Mover effects de carga de pacientes al store
- Unificar lógica de carga/filtrado/contadores

**Riesgo:** Medio-Alto  
**Beneficio:** Muy Alto - Elimina duplicación masiva, centraliza estado, facilita cache  
**Tiempo estimado:** 3-5 días

---

### 9.3 FASE 3.3: Otros Refactors (Prioridad Media)

**Alcance:**
- Mover effect de `KanbanListComponent` a `KanbanTasksService`
- Mover effect de `HeaderComponent` (foto de perfil) a `UserSyncService`
- Evaluar OnPush en `CalendarComponent` y `ProjectsRoadmapComponent`
- Revisar y optimizar effects en `AccountSettingsComponent`, `WelcomeComponent`, `MacroTargetsComponent`

**Riesgo:** Bajo-Medio  
**Beneficio:** Medio - Mejora organización, reduce efectos en componentes  
**Tiempo estimado:** 2-3 días

---

### 9.4 FASE 3.4: Testing Inicial (Prioridad Media)

**Alcance:**
- Tests unitarios para `CustomizerSettingsService`
- Tests unitarios para `ToggleService`
- Tests unitarios para `UserStore`
- Tests unitarios para `PatientsApiService` y `PatientPictureApiService`

**Riesgo:** Bajo  
**Beneficio:** Alto - Establece base de testing, mejora confiabilidad  
**Tiempo estimado:** 2-3 días

---

## 10. 📋 Checklist de Violaciones Restantes

### 10.1 Violaciones Menores

- ⚠️ Algunos componentes usan constructor injection en vez de `inject()`:
  - `CreatePatientComponent`
  - `EditPatientComponent`
  - `TotalPatientsComponent` (parcial - algunos servicios con inject, otros en constructor)
  - `CompletedProfilesComponent` (parcial)

### 10.2 Oportunidades de Mejora

- ✅ No hay violaciones críticas de reglas
- ⚠️ Duplicación de lógica de carga de pacientes (a resolver en Fase 3.2)
- ⚠️ Uso de CDR justificado pero mejorable (a resolver en Fase 3.1)
- ⚠️ Effects en componentes que podrían estar en stores (a resolver en Fase 3.3)

---

## 11. 🎉 Logros de FASE 1 y 2

- ✅ 100% standalone components
- ✅ 0 usos de `@Input()` / `@Output()`
- ✅ 0 usos de `*ngIf` / `*ngFor` / `*ngSwitch`
- ✅ 0 usos de `ngClass` / `ngStyle`
- ✅ 0 usos de `@HostListener` / `@HostBinding`
- ✅ 0 usos de `.mutate()` en signals
- ✅ `ToggleService` y `CustomizerSettingsService` migrados a Signals
- ✅ 16 componentes con OnPush
- ✅ Lazy loading en todas las features
- ✅ `providedIn: 'root'` en todos los servicios

---

**Fin del Informe**

