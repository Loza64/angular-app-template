# Documentación Técnica — angular-app-template (Frontend Angular)

## Tabla de contenidos

- [1. Resumen del proyecto](#1-resumen-del-proyecto)
- [2. Stack tecnológico](#2-stack-tecnológico)
- [3. Arquitectura general](#3-arquitectura-general)
- [4. Estructura de carpetas](#4-estructura-de-carpetas)
- [5. Capa SDK (cliente HTTP genérico)](#5-capa-sdk-cliente-http-genérico)
- [6. Núcleo de la aplicación (core/)](#6-núcleo-de-la-aplicación-core)
- [7. Módulos de dominio (features/)](#7-módulos-de-dominio-features)
- [8. Enrutamiento](#8-enrutamiento)
- [9. Configuración de entornos](#9-configuración-de-entornos)
- [10. Flujos clave](#10-flujos-clave)
- [11. Convenciones y decisiones de diseño](#11-convenciones-y-decisiones-de-diseño)
- [12. Glosario de archivos fuente relevantes](#12-glosario-de-archivos-fuente-relevantes)
- [13. Ejemplos de uso](#13-ejemplos-de-uso)
- [14. Calidad de código: ESLint y convención de commits](#14-calidad-de-código-eslint-y-convención-de-commits)
- [15. Personalización de colores del tema](#15-personalización-de-colores-del-tema)

---

## 1. Resumen del proyecto

angular-app-template es una aplicación frontend construida con Angular (standalone components, sin NgModules) que implementa un panel de administración con autenticación por token, y CRUD de tres entidades relacionadas entre sí: **Usuarios**, **Roles** y **Permisos**. La aplicación sigue una arquitectura por "features" (módulos de dominio) apoyada en una capa "core" con utilidades transversales y un mini-SDK HTTP genérico reutilizable para cualquier entidad.

El estado remoto (datos del servidor) se gestiona con **TanStack Query** (Angular Query), mientras que el estado local de UI se maneja con **Signals** nativos de Angular (`signal`, `computed`, `effect`). No se usa NgRx ni otros gestores de estado adicionales.

### 1.1 Características principales

- Autenticación basada en JWT con access token y refresh token, y renovación automática transparente ante respuestas 401.
- Guards de ruta para proteger el panel (`authGuard`) y para bloquear el acceso a login/signup si ya hay sesión (`guestGuard`).
- CRUD genérico reutilizable (`Service<Entity>` + composables `injectCrud` / `injectFindAll` / `injectInfiniteFindAll`) para no repetir lógica HTTP en cada feature.
- Módulos de dominio: Usuarios, Roles y Permisos, con listados paginados, búsqueda, alta/edición en modal, borrado lógico y restauración.
- Componentes UI compartidos: tabla genérica con columnas configurables, modal, selector remoto con búsqueda (`select-api`) e iconos (FontAwesome).
- Manejo centralizado de caché de queries: al crear/editar/eliminar/restaurar se invalidan o actualizan las queries relacionadas automáticamente.

---

## 2. Stack tecnológico

| Categoría | Tecnología | Uso en el proyecto |
|---|---|---|
| Framework | Angular (standalone, zoneless) | `provideZonelessChangeDetection()`; todos los componentes son standalone, sin NgModules. |
| Lenguaje | TypeScript | Tipado estricto en modelos, servicios y componentes. |
| Estado remoto | `@tanstack/angular-query-experimental` | Cache, refetch, mutaciones e invalidación de datos del servidor (`injectQuery`, `injectMutation`, `injectInfiniteQuery`). |
| Estado local | Angular Signals | `signal` / `computed` / `effect` para estado de UI y derivaciones reactivas. |
| HTTP | `@angular/common/http` | `HttpClient` con interceptor funcional (`authInterceptor`) y `HttpContext` para banderas por-petición. |
| Formularios | `@angular/forms` (Reactive Forms) | `FormBuilder`, `FormGroup`, `Validators` y validadores cruzados personalizados. |
| Enrutamiento | `@angular/router` | Rutas con lazy loading (`loadComponent`) y guards funcionales. |
| Select remoto | `@ng-select/ng-select` | Combo con búsqueda server-side, usado dentro de `SelectApi`. |
| Iconografía | `@fortawesome/angular-fontawesome` | Componente `Icon` con un mapa cerrado de iconos permitidos (`IconName`). |
| Reactividad | RxJS | Observables para login/refresh token; interoperabilidad con Signals vía `toSignal` / `takeUntilDestroyed`. |

Bootstrapping de la aplicación (`main.ts` / `app.config.ts`):

```ts
bootstrapApplication(App, appConfig)

providers:
  - provideZonelessChangeDetection()
  - provideRouter(routes)
  - provideHttpClient(withInterceptors([authInterceptor]))
  - provideTanStackQuery(new QueryClient({
      defaultOptions: { queries: { staleTime: 5 min, refetchOnWindowFocus: false } }
    }))
```

---

## 3. Arquitectura general

El código fuente se organiza en tres grandes bloques dentro de `src/app`:

- **`sdk/`** — Cliente HTTP genérico y contratos (modelos base, parámetros, respuestas) para hablar con la API REST.
- **`core/`** — Infraestructura transversal de la aplicación: guards, interceptor de autenticación, servicio de almacenamiento de tokens, composables de datos (CRUD/listados) y componentes de UI compartidos.
- **`features/`** — Módulos de dominio (`auth`, `users`, `roles`, `permissions`, `dashboard`), cada uno con sus propios `models`, `services`, `pages` y `components`.

### 3.1 Diagrama de capas

```
┌───────────────────────────────────────────────────────────┐
│                        features/*                          │
│   auth · users · roles · permissions · dashboard            │
│   (pages, componentes de formulario, servicios de entidad)  │
└───────────────────────────┬─────────────────────────────────┘
                             │ usa
┌───────────────────────────▼─────────────────────────────────┐
│                          core/*                              │
│  guards · interceptors · composables (CRUD/listados)         │
│  shared/components (table, modal, select-api, icon)          │
└───────────────────────────┬─────────────────────────────────┘
                             │ usa
┌───────────────────────────▼─────────────────────────────────┐
│                           sdk/*                              │
│   Service<Entity>  ·  AbstractService  ·  modelos de         │
│   respuesta (BaseResponse, PaginationResponse, Session)      │
└───────────────────────────┬─────────────────────────────────┘
                             │ HTTP
                        API REST (backend)
```

Esta separación permite que cada entidad (`User`, `Role`, `Permission`) defina un servicio muy pequeño —que solo declara su endpoint— heredando todo el comportamiento CRUD de `Service<Entity>`, y que las páginas de listado reutilicen los mismos composables e idénticos componentes de tabla/modal.

---

## 4. Estructura de carpetas

```
src/
├── environments/
│   ├── environment.ts                 # producción
│   └── environment.development.ts     # desarrollo
├── index.html
├── main.ts                            # bootstrap de la app
├── styles.css                         # estilos globales
└── app/
    ├── app.ts / app.html / app.css    # componente raíz
    ├── app.config.ts                  # providers globales
    ├── app.routes.ts                  # árbol de rutas
    │
    ├── sdk/
    │   ├── service.ts                 # cliente HTTP genérico
    │   ├── abstract-service.ts        # contrato CRUD
    │   ├── params-service.model.ts    # tipos de parámetros
    │   ├── entities/base-entity.model.ts
    │   └── responses/                 # Base/Pagination/Session
    │
    ├── core/
    │   ├── guards/                    # auth-guard, guest-guard
    │   ├── interceptors/              # auth-interceptor (refresh)
    │   ├── http/http-context.ts       # tokens de contexto HTTP
    │   ├── services/sdk-settings.ts   # tokens en localStorage
    │   ├── composables/               # injectCrud/FindAll/Infinite
    │   └── shared/
    │       ├── components/            # table, modal, select-api, icon
    │       └── styles/                # auth.css, crud.css
    │
    └── features/
        ├── auth/                      # login, signup, AuthService
        ├── users/                     # listado y form. de usuarios
        ├── roles/                     # listado y form. de roles
        ├── permissions/               # listado y form. de permisos
        └── dashboard/                 # shell del panel (sidebar)
```

---

## 5. Capa SDK (cliente HTTP genérico)

El SDK es el punto único de acceso a la API REST. Está pensado para que cualquier entidad que extienda `BaseEntity` obtenga, heredando de `Service<Entity>`, un CRUD completo sin escribir código HTTP adicional.

### 5.1 BaseEntity

Contrato mínimo que debe cumplir toda entidad del dominio:

```ts
interface BaseEntity {
  readonly id?: string | number;
  name?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly deletedAt?: string;   // presencia = registro eliminado lógicamente
}
```

### 5.2 Service&lt;Entity&gt;

Clase concreta (`sdk/service.ts`) que implementa `AbstractService<Entity>`. Se instancia indicando el `endpoint` (p. ej. `"users"`) y construye internamente la URL base como `{origin}/{initPath}/{endpoint}`, con `origin` tomado por defecto de `environment.apiOrigin` e `initPath` por defecto `"api"`.

| Método | Verbo HTTP | Descripción |
|---|---|---|
| `findAll(params)` | GET | Lista paginada de la entidad; admite query params (búsqueda, paginación, filtros) y endpoint alternativo. |
| `findById(params)` | GET | Obtiene un registro por id. |
| `findBy(params)` | GET | Obtiene un registro por una ruta/subpath arbitraria (`path`). |
| `create(params)` | POST | Crea un registro; el payload puede ser la entidad o `FormData`. |
| `update(params)` | PUT | Actualiza (parcial) un registro existente por id. |
| `delete(params)` | DELETE | Elimina (lógicamente, según backend) un registro por id. |
| `restore(params)` | PATCH | Restaura un registro eliminado: `PATCH` a `{endpoint}/{id}/restore`. |

Cada método construye sus opciones de petición (`buildOptions`) a partir de un `ServiceConfig` opcional: `headers`, `params` y un `HttpContext` donde se inyectan callbacks `onUnauthorized` / `onForbidden` específicos de esa llamada. Estos callbacks son leídos más adelante por el interceptor de autenticación.

### 5.3 Modelos de respuesta

| Modelo | Forma | Uso |
|---|---|---|
| `BaseResponse<T>` | alias de `T` | Respuesta simple para `findById`/`findBy`/`create`/`update`. |
| `PaginationResponse<T>` | `{ data: T[]; pagination: { total, page, pageSize, nextCursor, pageCount } }` | Respuesta de `findAll`; alimenta las tablas y el scroll infinito. |
| `SessionResponse` | `{ token, refreshToken, data: User }` | Respuesta de login/signup en el módulo de autenticación. |

### 5.4 Parámetros de operación (`params-service.model.ts`)

Define, mediante composición de interfaces (`RequestMeta`, `QueryParams`, `IdParam`, `PathParam`, `PayloadParam`), el shape exacto que espera cada método del servicio: `FindAllParams`, `FindByIdParams`, `FindByParams`, `CreateParams<Entity>`, `UpdateParams<Entity>`, `DeleteParams` y `RestoreParams`. Todas incorporan, de forma opcional, `onUnauthorized` y `onForbidden` para personalizar el manejo de errores de autorización en esa llamada puntual.

---

## 6. Núcleo de la aplicación (core/)

### 6.1 Autenticación y sesión

#### 6.1.1 SdkSettingsService

Encapsula el acceso a `localStorage` para el `token` y el `refreshToken` (get/set/remove), con manejo defensivo de errores (try/catch con `console.warn`) por si el almacenamiento no está disponible.

#### 6.1.2 authInterceptor (interceptor funcional)

Interceptor HTTP funcional registrado globalmente en `app.config.ts`. Su comportamiento:

- Añade automáticamente el header `Authorization: Bearer <token>` a toda petición saliente si existe un token almacenado.
- Si la respuesta es 401 y la petición no es ya un reintento post-refresh (bandera de contexto `IS_RETRY_AFTER_REFRESH`), dispara el flujo de renovación de sesión.
- El flujo de renovación llama a `POST /api/auth/refresh` con el `refreshToken` guardado; usa una promesa compartida (`refreshPromise`) para que múltiples peticiones 401 simultáneas no disparen refrescos duplicados.
- Si el refresco es exitoso, guarda el nuevo `token`/`refreshToken`, reintenta la petición original con el header actualizado y la marca como `IS_RETRY_AFTER_REFRESH`.
- Si el refresco falla, limpia el `token` y `refreshToken`, y ejecuta el callback `onUnauthorized` de la petición (si se definió) o navega a `/login` por defecto.
- Si la respuesta es 403, ejecuta `onForbidden` (si se definió) o muestra una advertencia por consola.

#### 6.1.3 HttpContext tokens (`http-context.ts`)

Se definen tres `HttpContextToken` usados para pasar información entre la llamada del servicio y el interceptor sin acoplar la firma de los métodos HTTP:

```ts
ON_UNAUTHORIZED         // callback opcional a ejecutar en un 401 sin refresco posible
ON_FORBIDDEN            // callback opcional a ejecutar en un 403
IS_RETRY_AFTER_REFRESH  // evita loops infinitos de refresco
```

#### 6.1.4 Guards de ruta

| Guard | Regla | Rutas protegidas |
|---|---|---|
| `authGuard` | Permite el acceso solo si existe un token; en caso contrario redirige a `/login`. | `/dashboard` y sus rutas hijas (`users`, `roles`, `permissions`). |
| `guestGuard` | Permite el acceso solo si NO existe token (usuario anónimo); en caso contrario redirige a `/dashboard`. | `/login` y `/signup`. |

### 6.2 Composables de datos (`core/composables`)

Son funciones "inject*" (equivalentes a hooks) construidas sobre TanStack Query que encapsulan patrones repetitivos de acceso a datos, reutilizadas por todas las páginas de listado y formularios.

#### 6.2.1 injectFindAll

Envuelve `injectQuery` para listar una entidad paginada. Construye una `queryKey` estable combinando la clave base, el endpoint (si se sobreescribe) y una serialización JSON de los `queryParams` reactivos, de modo que cualquier cambio en filtros/página dispare automáticamente un nuevo fetch. Expone además helpers para mutar la caché local sin refetch:

- `addItemInCache(item)` — inserta un elemento al inicio de la lista cacheada, evitando duplicados.
- `updateItemInCache(id, updater)` — reemplaza un elemento por id aplicando una función de actualización.
- `removeItemInCache(id)` — elimina un elemento de la caché por id.
- `emptyCache()` — restablece la caché de esa query a un estado vacío.

#### 6.2.2 injectInfiniteFindAll

Variante para scroll infinito basada en `injectInfiniteQuery`, con la misma estrategia de `queryKey` y helpers de caché equivalentes pero operando sobre una estructura de páginas (`{ pages, pageParams }`). Recibe `getNextPageParam` e `initialPageParam` para definir la estrategia de paginación (cursor u offset) del backend.

#### 6.2.3 injectCrud

Agrupa las mutaciones de creación, actualización, eliminación y restauración de una entidad, más dos queries individuales (`findById`, `findBy`), todo apuntando al mismo `Service<Entity>`. Cada mutación invalida automáticamente (`queryClient.invalidateQueries`) la `queryKey` asociada al terminar con éxito, de modo que los listados se refrescan solos tras cualquier operación de escritura. También propaga de forma centralizada los callbacks `onUnauthorized` / `onForbidden` configurados a nivel de `injectCrud` a cada llamada individual.

Expone: `create`, `update`, `delete`, `restore` (funciones async), sus banderas de carga (`isCreating`, `isUpdating`, `isDeleting`, `isRestoring`), sus errores (`createError`, `updateError`, `deleteError`, `restoreError`) y las queries `findById` / `findBy`.

### 6.3 Componentes UI compartidos (`core/shared/components`)

| Componente | Selector | Responsabilidad |
|---|---|---|
| `Table<T>` | `app-table` | Tabla genérica dirigida por configuración: recibe `columns` (`TableColumn<T>[]`), `data`, estado de carga, paginación y permite celdas custom vía la directiva estructural `TableCellDirective` (`[appTableCell]`). |
| `Modal` | `app-modal` | Ventana modal reutilizable, controlada por input `open` y ancho configurable (`widthPx`); emite `closed` al hacer click en el backdrop. |
| `SelectApi<T>` | `app-select-api` | Select con búsqueda remota (basado en `ng-select`) que consume cualquier `Service<T>` vía `injectFindAll`, con debounce de 400 ms sobre el término de búsqueda y comparación de opciones por id. |
| `Icon` | `app-icon` | Wrapper de FontAwesome con un catálogo cerrado de iconos permitidos (`IconName`), evitando el uso de iconos arbitrarios fuera de ese conjunto. |

#### 6.3.1 TableColumn&lt;T&gt; y TableCellDirective

Cada columna se define con `title` (encabezado visible), `key` (identificador único, usado también para localizar plantillas custom), `dataIndex` opcional (propiedad de la entidad a leer) y `render` opcional (función para derivar el texto mostrado a partir del valor, el registro completo y el índice de fila). La directiva `TableCellDirective` permite proyectar contenido HTML custom por columna dentro de `<app-table>` usando `*appTableCell="'key'"`.

#### 6.3.2 SelectApi&lt;T&gt; — detalle de comportamiento

- La carga de opciones es perezosa: solo se activa la query (`loaded`) al abrir el desplegable (evento `open`), evitando peticiones innecesarias.
- El término de búsqueda pasa por un `Subject` con `debounceTime(400)` y `distinctUntilChanged()` antes de aplicarse a los `queryParams`.
- Admite selección simple o múltiple (input `multiple`) y renderizado de opción configurable vía `renderOption`.
- Compara igualdad de opciones por `id` (`compareById`), no por referencia, para que el valor preseleccionado en edición coincida con las opciones cargadas de la API.

---

## 7. Módulos de dominio (features/)

### 7.1 Auth (autenticación)

Rutas públicas: `/login` y `/signup`, ambas protegidas por `guestGuard` (inaccesibles si ya hay sesión).

**AuthService**

- `currentUser: signal<User | null>` — perfil del usuario autenticado, expuesto a toda la app (por ejemplo, al `DashboardComponent`).
- `isAuthenticated`: computed a partir de la existencia de token en `SdkSettingsService`.
- `login(username, password)` / `signup(payload)` — devuelven un `Observable<SessionResponse>`; al resolver, guardan `token` y `refreshToken`, actualizan `currentUser` y sincronizan la caché de TanStack Query bajo la clave `SESSION_QUERY_KEY`.
- `profile()` — obtiene el perfil desde `GET /api/auth/profile`; se ejecuta automáticamente vía una `injectQuery` interna (`profileQuery`) cuando existe un token, con retry deshabilitado.
- `logout()` — limpia tokens, resetea `currentUser` y elimina del cliente de queries la entrada de sesión (`removeQueries`).

**LoginPage / SignupPage**

Formularios reactivos (`ReactiveFormsModule`) con validación nativa de Angular. El signup añade un validador a nivel de grupo (`passwordsMatchValidator`) que compara `password` y `confirmPassword`. Ambos usan `injectMutation` para ejecutar la petición, navegan a `/dashboard` en caso de éxito y muestran en pantalla el mensaje de error devuelto por el backend (o uno genérico) en caso de fallo.

### 7.2 Users (usuarios)

Modelo `User` extiende `BaseEntity` con `username`, `surname`, `email`, `blocked` y `role: Role` (relación con el módulo de Roles).

**UserService**

Servicio trivial: extiende `Service<User>` apuntando al endpoint `"users"`. Toda la lógica CRUD la hereda del SDK.

**UsersList (página)**

- Estado de UI en signals: `search`, `page`, `pageSize` (fijo en 10), `deleted` (para alternar entre activos y eliminados).
- `queryParams` computado combina página, tamaño, búsqueda y filtro de eliminados, y se pasa a `injectFindAll` para obtener el listado paginado en tiempo real.
- Columnas de tabla: Usuario, Nombre (concatenación de `name` + `surname`), Email, Rol (nombre del rol o "—"), Estado y Acciones.
- `injectCrud` gestiona alta, edición, borrado lógico (`delete`, con confirmación vía `confirm()`) y restauración (`restore`) de usuarios, invalidando el listado automáticamente.
- El alta/edición se realiza dentro de un `Modal`, reutilizando el mismo componente `UserForm` tanto para crear (`editingId = null`) como para editar (`editingId = id`).

**UserForm (componente)**

- Recibe `userId` como input (`null` = creación, `id` = edición) y emite `saved` / `cancelled`.
- Campos: `username`, `name`, `surname`, `email`, `password`, `blocked`, `role` (seleccionado vía `SelectApi` contra `RoleService`).
- La contraseña es obligatoria solo al crear (un `effect()` añade/quita el validador `Validators.required` dinámicamente según haya o no `userId`).
- En modo edición, precarga los datos del usuario vía `crud.findById` y hace `patchValue` del formulario cuando llegan.
- Al enviar, arma el payload (sin incluir `password` si se está editando y no se cambió) y llama a `crud.create` o `crud.update` según corresponda.

### 7.3 Roles

Modelo `Role` extiende `BaseEntity` con `active: boolean` y `permissions: Permission[]` (relación muchos-a-muchos con Permisos).

**RoleService**

Extiende `Service<Role>` apuntando al endpoint `"roles"`.

**RolesList (página)**

Misma estructura que `UsersList`: búsqueda, paginación, filtro de eliminados, columnas (Nombre, cantidad de Permisos asignados, Estado, Acciones) y CRUD completo (crear, editar, borrado lógico, restaurar) vía `injectCrud`.

**RoleForm (componente)**

- Campos: `name` (mínimo 2 caracteres), `active`, `permissions` (multi-selección vía `SelectApi` contra `PermissionService`, con `multiple = true`).
- `renderPermission` construye la etiqueta visible de cada permiso: usa su `title` si existe, o compone "MÉTODO /ruta" en mayúsculas como fallback.
- En edición, precarga `name`, `active` y `permissions` del rol; al guardar, envía solo los `id` de los permisos seleccionados.

### 7.4 Permissions (permisos)

Modelo `Permission` extiende `BaseEntity` con `path`, `method` y `title`. Representa, típicamente, un endpoint protegido del backend (método + ruta) al que se le puede dar un título legible desde la UI.

**PermissionService**

Extiende `Service<Permission>` apuntando al endpoint `"permissions"`.

**PermissionsList (página)**

A diferencia de Users y Roles, no expone alta ni borrado lógico desde la UI: los permisos son generados por el backend (a partir de los endpoints existentes) y solo se pueden editar (renombrar su `title`) o buscar/paginar. Columnas: Título (con fallback "N/A"), Método, Ruta y Acciones.

**PermissionForm (componente)**

Formulario mínimo: un único campo `title`. Solo permite `update` (no `create`) sobre el permiso recibido por input; usa `injectCrud` pero únicamente su mutación de actualización.

### 7.5 Dashboard

Shell del panel autenticado, montado en la ruta `/dashboard` y protegido por `authGuard`. Contiene el layout general (sidebar + contenido) y aloja como rutas hijas a Users, Roles y Permissions mediante `<router-outlet>`.

- `menu`: lista estática (`DASHBOARD_MENU`) con las secciones Usuarios, Roles y Permisos, cada una con su `label`, `route` e `icon`.
- `currentUser` expone el perfil activo (delegado en `AuthService.currentUser`) para mostrarlo en la interfaz.
- `sidebarOpen` (signal) controla la visibilidad del menú lateral en vistas móviles, con `toggleSidebar` / `closeSidebar`.
- `pageTitle` se recalcula de forma reactiva (`computed` + `toSignal` sobre los eventos de `NavigationEnd` del Router) buscando en el menú la entrada cuya `route` esté contenida en la URL actual.
- `logout()` cierra sesión vía `AuthService.logout()` y redirige a `/login`.

---

## 8. Enrutamiento

Definido en `app.routes.ts`; todas las páginas usan carga perezosa (`loadComponent`) para dividir el bundle por ruta.

| Ruta | Guard | Componente | Notas |
|---|---|---|---|
| `/login` | `guestGuard` | `LoginPage` | Redirige a `/dashboard` si ya hay sesión. |
| `/signup` | `guestGuard` | `SignupPage` | Redirige a `/dashboard` si ya hay sesión. |
| `/dashboard` | `authGuard` | `DashboardComponent` | Redirige a `/login` si no hay sesión. Contiene rutas hijas. |
| `/dashboard` (índice) | — | `redirectTo "users"` | Ruta vacía dentro del dashboard. |
| `/dashboard/users` | heredado | `UsersList` | |
| `/dashboard/roles` | heredado | `RolesList` | |
| `/dashboard/permissions` | heredado | `PermissionsList` | |
| `/` (raíz) | — | `redirectTo "dashboard"` | |
| `**` (wildcard) | — | `redirectTo "dashboard"` | Cualquier ruta no reconocida cae al dashboard. |

---

## 9. Configuración de entornos

| Archivo | production | apiOrigin | Uso |
|---|---|---|---|
| `environment.ts` | `true` | `''` (vacío) | Build de producción; se asume que el frontend y la API comparten origen (rutas relativas `/api/...`). |
| `environment.development.ts` | `false` | `'http://localhost:3000'` | Desarrollo local; la API corre en un puerto distinto al del dev server de Angular. |

`apiOrigin` es consumido por `Service` (SDK), por `AuthService` y por el interceptor de autenticación para construir las URLs absolutas de cada petición (`${origin}/api/...`).

---

## 10. Flujos clave

### 10.1 Flujo de inicio de sesión

1. El usuario completa el formulario en `LoginPage` y este valida los campos con Reactive Forms.
2. Al enviar, se dispara `loginMutation`, que llama a `AuthService.login(username, password)`.
3. `AuthService` hace `POST /api/auth/login`; si responde con éxito, guarda `token` y `refreshToken` en `SdkSettingsService` (localStorage), actualiza `currentUser` y sincroniza la caché de la query de sesión.
4. La mutación redirige automáticamente a `/dashboard`.
5. Si el backend responde con error, se muestra en pantalla el mensaje recibido (o un mensaje genérico).

### 10.2 Renovación automática de sesión (refresh token)

1. Cualquier petición HTTP sale con `Authorization: Bearer <token>` gracias al `authInterceptor`.
2. Si el backend responde 401 y la petición aún no es un reintento post-refresh, el interceptor llama a `POST /api/auth/refresh` con el `refreshToken` almacenado.
3. Mientras el refresco está en curso, cualquier otra petición que reciba un 401 reutiliza la misma promesa en curso (no se disparan refrescos en paralelo).
4. Si el refresco tiene éxito: se actualizan `token`/`refreshToken` y se reintenta automáticamente la petición original con el nuevo token.
5. Si el refresco falla: se limpian los tokens y se redirige a `/login` (o se ejecuta el callback `onUnauthorized` específico de esa llamada, si se definió).

### 10.3 Flujo CRUD típico (ejemplo: Usuarios)

1. `UsersList` invoca `injectFindAll` con los `queryParams` reactivos (página, tamaño, búsqueda, filtro de eliminados); TanStack Query gestiona el fetch, cache y refetch automático ante cambios de esos parámetros.
2. Al pulsar "Nuevo" o el ícono de edición, se abre un `Modal` que renderiza `UserForm` (con `userId = null` o con el id del registro).
3. `UserForm`, si recibe un `userId`, precarga los datos vía `crud.findById` y llena el formulario con `patchValue`.
4. Al guardar, `UserForm` llama a `crud.create` o `crud.update`, que ejecutan la petición HTTP a través de `Service<User>` e invalidan automáticamente la query `"users"` al terminar con éxito.
5. La invalidación provoca que `UsersList` vuelva a pedir datos frescos al backend automáticamente, sin código adicional de sincronización manual.
6. Eliminar y restaurar siguen el mismo patrón: se pide confirmación (para eliminar) y se invoca `crud.delete` / `crud.restore`, que también invalidan la query de listado.

---

## 11. Convenciones y decisiones de diseño

- Componentes 100% standalone: no existen NgModules; cada componente declara sus propios imports.
- Zoneless change detection: la app no depende de Zone.js (`provideZonelessChangeDetection`), por lo que la reactividad se apoya exclusivamente en Signals y en `OnPush` como estrategia de detección de cambios en todos los componentes.
- Separación estricta entre estado remoto (TanStack Query) y estado de UI (Signals): las páginas de listado no guardan copias manuales de los datos del servidor, siempre leen a través de las queries.
- Reutilización máxima vía genéricos: `Service<Entity>`, `Table<T>`, `SelectApi<T>`, `injectCrud`/`injectFindAll`/`injectInfiniteFindAll` operan sobre cualquier tipo que extienda `BaseEntity`, evitando duplicar lógica entre Users, Roles y Permissions.
- Invalidación de caché centralizada en los composables (no en las páginas ni formularios), asegurando que toda mutación exitosa refresque automáticamente los listados relacionados.
- Manejo de errores de autorización desacoplado del componente: los callbacks `onUnauthorized` / `onForbidden` viajan como metadatos de la petición (`HttpContext`) y se resuelven dentro del interceptor.
- Catálogo cerrado de iconos (`IconName`): evita el uso de nombres de icono arbitrarios y hace explícito el conjunto de iconos disponible en toda la aplicación.
- Comentarios y mensajes de usuario en español, consistente con el público objetivo de la aplicación (panel de administración en español).

---

## 12. Glosario de archivos fuente relevantes

| Archivo | Rol |
|---|---|
| `app/sdk/service.ts` | Cliente HTTP genérico (CRUD) reutilizado por todas las entidades. |
| `app/core/interceptors/auth-interceptor.ts` | Adjunta el token, maneja 401 (refresh) y 403 (forbidden). |
| `app/core/guards/auth-guard.ts` / `guest-guard.ts` | Protección de rutas según estado de sesión. |
| `app/core/composables/inject-crud.ts` | Mutaciones create/update/delete/restore + invalidación de caché. |
| `app/core/composables/inject-find-all.ts` | Listado paginado reactivo + helpers de caché local. |
| `app/core/composables/inject-infinite-find-all.ts` | Listado con scroll infinito. |
| `app/core/shared/components/table/table.ts` | Tabla genérica configurable por columnas. |
| `app/core/shared/components/select-api/select-api.ts` | Select remoto con búsqueda y debounce. |
| `app/features/auth/services/auth.ts` | Login, signup, perfil y logout; estado de sesión global. |
| `app/features/*/services/*.ts` | Servicios de entidad (users, roles, permissions), cada uno extiende `Service<T>`. |
| `app/features/dashboard/dashboard.component.ts` | Shell del panel: sidebar, título dinámico, logout. |
| `app/app.routes.ts` | Árbol de rutas y asignación de guards. |
| `app/app.config.ts` | Providers globales de la aplicación. |

---

## 13. Ejemplos de uso

Esta sección muestra, con código, cómo se conectan entre sí las piezas descritas arriba: un servicio de entidad nuevo, los composables de datos y los componentes compartidos.

### 13.1 Crear un servicio de entidad nuevo

Para exponer el CRUD de una entidad nueva contra la API basta con extender `Service<Entity>` indicando su `endpoint`. Todo el comportamiento (GET/POST/PUT/DELETE/PATCH restore) se hereda automáticamente.

```ts
// models/product.model.ts
import { BaseEntity } from '../../../sdk/entities/base-entity.model';

export interface Product extends BaseEntity {
  sku: string;
  price: number;
  stock: number;
}
```

```ts
// services/product.ts
import { Injectable } from '@angular/core';
import { Service } from '../../../sdk/service';
import { Product } from '../models/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService extends Service<Product> {
  constructor() {
    super({ endpoint: 'products' });
  }
}
```

Con esto ya se puede hacer, por ejemplo:

```ts
const productService = inject(ProductService);

await productService.findAll({ config: { params: { page: 1, pageSize: 10 } } });
await productService.findById({ id: 42 });
await productService.create({ payload: { sku: 'ABC-1', price: 19.99, stock: 100 } });
await productService.update({ id: 42, payload: { stock: 80 } });
await productService.delete({ id: 42 });
await productService.restore({ id: 42 });
```

### 13.2 Listado paginado con `injectFindAll`

Patrón usado en `UsersList`, `RolesList` y `PermissionsList`: estado de filtros en signals, `queryParams` computado y `injectFindAll` reaccionando a esos cambios.

```ts
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { injectFindAll } from '../../../core/composables/inject-find-all';
import { ProductService } from '../services/product';
import { Product } from '../models/product.model';

@Component({
  selector: 'app-products-list',
  standalone: true,
  templateUrl: './products-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsList {
  private productService = inject(ProductService);

  protected search = signal('');
  protected page = signal(1);
  protected pageSize = 10;

  private queryParams = computed(() => ({
    page: this.page(),
    pageSize: this.pageSize,
    ...(this.search() ? { search: this.search() } : {}),
  }));

  protected productsQuery = injectFindAll<Product>({
    service: signal(this.productService),
    queryKey: signal(['products']),
    queryParams: this.queryParams,
  });

  protected products = computed(() => this.productsQuery.data()?.data ?? []);
  protected loading = this.productsQuery.isLoading;

  onSearch(value: string): void {
    this.search.set(value);
    this.page.set(1); // vuelve a la primera página al buscar
  }

  goToPage(page: number): void {
    this.page.set(page);
  }
}
```

### 13.3 Operaciones de escritura con `injectCrud`

`injectCrud` agrupa `create`/`update`/`delete`/`restore` e invalida automáticamente la query de listado (`queryKey: 'products'`) al terminar con éxito.

```ts
protected crud = injectCrud<Product>(signal(this.productService), { queryKey: 'products' });

protected saving = computed(() => this.crud.isCreating() || this.crud.isUpdating());

async remove(product: Product): Promise<void> {
  if (!confirm(`¿Eliminar el producto "${product.name}"?`)) return;
  await this.crud.delete({ id: product.id! });
  // no hace falta refrescar manualmente: injectCrud invalida la query 'products'
}

async restore(product: Product): Promise<void> {
  await this.crud.restore({ id: product.id! });
}
```

Uso típico dentro de un formulario (crear o editar según haya `id`):

```ts
protected form = this.fb.group({
  sku: ['', Validators.required],
  price: [0, [Validators.required, Validators.min(0)]],
  stock: [0, Validators.required],
});

protected crud = injectCrud<Product>(signal(this.productService), { queryKey: 'products' });

// Precarga de datos en modo edición
protected editQuery = this.crud.findById(computed(() => ({ id: this.productId() ?? '' })));

constructor() {
  effect(() => {
    const product = this.editQuery.data();
    if (product && this.productId() !== null) {
      this.form.patchValue(product);
    }
  });
}

submit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const id = this.productId();
  const request = id
    ? this.crud.update({ id, payload: this.form.value })
    : this.crud.create({ payload: this.form.value as Product });

  request.then(() => this.saved.emit());
}
```

### 13.4 Scroll infinito con `injectInfiniteFindAll`

Alternativa a `injectFindAll` cuando se quiere cargar más resultados "a demanda" (por ejemplo, en un dropdown o un feed) en vez de paginar por número de página.

```ts
protected productsQuery = injectInfiniteFindAll<Product>({
  service: signal(this.productService),
  queryKey: signal(['products', 'infinite']),
  queryParams: computed(() => ({ search: this.search() })),
  initialPageParam: { page: 1 },
  getNextPageParam: (lastPage, _pages, lastPageParam) => {
    const nextPage = (lastPageParam.page as number) + 1;
    return nextPage <= lastPage.pagination.pageCount ? { page: nextPage } : undefined;
  },
});

protected products = computed(() =>
  this.productsQuery.data()?.pages.flatMap((page) => page.data) ?? [],
);

loadMore(): void {
  this.productsQuery.fetchNextPage();
}
```

### 13.5 Componente `Table<T>` en un template

```html
<!-- products-list.html -->
<app-table
  [columns]="columns"
  [data]="products()"
  [loading]="loading()"
  [pagination]="pagination()"
  (pageChange)="goToPage($event)"
>
  <!-- Celda custom para la columna 'actions' -->
  <ng-template appTableCell="actions" let-record>
    <app-icon name="edit" (click)="openEdit(record)" />
    <app-icon name="trash" (click)="remove(record)" />
  </ng-template>
</app-table>
```

```ts
protected columns: TableColumn<Product>[] = [
  { title: 'SKU', dataIndex: 'sku', key: 'sku' },
  { title: 'Precio', key: 'price', render: (_, record) => `$${record.price.toFixed(2)}` },
  { title: 'Stock', dataIndex: 'stock', key: 'stock' },
  { title: '', key: 'actions', width: '90px' },
];
```

### 13.6 Componente `Modal` + formulario reutilizable

```html
<!-- products-list.html -->
<button (click)="openCreate()">Nuevo producto</button>

<app-modal [open]="modalOpen()" title="Producto" (closed)="closeModal()">
  <app-product-form
    [productId]="editingId()"
    (saved)="onFormSaved()"
    (cancelled)="closeModal()"
  />
</app-modal>
```

```ts
protected modalOpen = signal(false);
protected editingId = signal<string | number | null>(null);

openCreate(): void {
  this.editingId.set(null);
  this.modalOpen.set(true);
}

openEdit(product: Product): void {
  this.editingId.set(product.id!);
  this.modalOpen.set(true);
}

closeModal(): void {
  this.modalOpen.set(false);
  this.editingId.set(null);
}

onFormSaved(): void {
  this.closeModal();
}
```

### 13.7 Componente `SelectApi<T>` (select remoto con búsqueda)

Selección simple de una entidad relacionada, cargando opciones desde su propio servicio:

```html
<app-select-api
  [service]="categoryService"
  [queryKey]="['categories']"
  [querySearch]="buildSearch"
  placeholder="Selecciona una categoría..."
  [(value)]="selectedCategory"
/>
```

```ts
protected categoryService = inject(CategoryService);
protected selectedCategory = signal<Category | null>(null);

buildSearch = (term: string) => (term ? { search: term } : {});
```

Selección múltiple (equivalente al selector de permisos en `RoleForm`):

```html
<app-select-api
  [service]="permissionService"
  [queryKey]="['permissions']"
  [multiple]="true"
  [renderOption]="renderPermission"
  [(value)]="selectedPermissions"
/>
```

```ts
renderPermission = (item: Permission): string =>
  item.title ?? `${item.method.toUpperCase()} ${item.path}`;
```

### 13.8 Petición autenticada con callbacks personalizados

Cualquier llamada al SDK puede sobreescribir el manejo por defecto de 401/403 pasando `onUnauthorized` / `onForbidden`, útil por ejemplo en una acción puntual dentro de un modal donde no se quiere redirigir automáticamente:

```ts
await this.productService.delete({
  id: product.id!,
  onForbidden: () => this.formError.set('No tienes permiso para eliminar este producto.'),
});
```
---

## 14. Calidad de código: ESLint y convención de commits

El proyecto usa **ESLint** (`eslint.config.js`, flat config) con `typescript-eslint` y `angular-eslint`, más **Husky** y **commitlint** para garantizar que nada roto ni con mensajes de commit inconsistentes llegue al repositorio.

### Scripts disponibles

```bash
pnpm lint       # revisa src/**/*.{ts,html} sin modificar nada
pnpm lint:fix   # revisa y corrige automáticamente lo que se pueda
```

### Qué pasa al hacer `git commit`

1. **Hook `pre-commit`** (`.husky/pre-commit`): ejecuta `pnpm lint:fix`.
   - Si ESLint corrige algo automáticamente (comillas, orden de imports, etc.), esos cambios se vuelven a agregar al commit en curso.
   - Si queda **algún error que no se pudo corregir solo** (variable sin usar, `any` explícito no permitido, código inaccesible, problemas de accesibilidad en plantillas, etc.), el script termina con código distinto de cero y **el commit se cancela**. Hay que corregir el error señalado en la terminal, volver a `git add` y reintentar.
2. **Hook `commit-msg`** (`.husky/commit-msg`): corre `commitlint` sobre el mensaje del commit y exige el formato de **Conventional Commits**:

   ```
   <tipo>(<scope opcional>): <descripción>
   ```

   Tipos permitidos (configurados en `commitlint.config.js`): `feat`, `fix`, `update`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

   Ejemplos válidos:
   ```
   feat: agrega selector de colores por tema
   fix(auth): corrige deadlock del refresh token
   update: sube versión de tanstack query
   ```

   Un mensaje como `git commit -m "cambios varios"` es **rechazado** porque no trae un tipo reconocido.

### Primera vez en una copia nueva del repo

Los hooks de Husky se instalan solos gracias al script `"prepare": "husky"` de `package.json`, que corre automáticamente después de `pnpm install`. No hace falta ningún paso manual adicional.

---

## 15. Personalización de colores del tema

Ruta: **Panel → Apariencia** (`/dashboard/settings`).

### Cómo funciona

- El tema base sigue funcionando igual que antes: `ThemeService` (`core/services/theme.ts`) guarda si el modo activo es `light` u `dark` en el atributo `data-theme` del `<html>` y en `localStorage` (`theme`).
- `ThemeColorsService` (`core/services/theme-colors.ts`) es nuevo: guarda **una paleta de colores base por modo** (claro y oscuro por separado) en `localStorage` bajo la clave `theme-colors`, y aplica las variables CSS del tema (`--primary`, `--bg`, `--surface`, `--text`, etc.) sobre `<html>` cada vez que cambian los colores o el modo activo.
- El usuario solo elige **8 colores "base"** por modo (primario, fondo, superficie, texto, barra lateral, peligro, éxito, advertencia) — el resto de variantes (hover, versiones "soft", bordes, texto apagado, colores de `ng-select`, etc.) se **calculan automáticamente** a partir de esos 8 colores (`core/shared/models/theme-palette.model.ts` + `core/shared/utils/color.util.ts`), para que la pantalla sea simple y no haya que configurar veinte campos a mano.

### La vista de personalización (`features/settings/pages/settings-page.*`)

- Dos pestañas, **Modo claro** / **Modo oscuro**, editables de forma independiente (no hace falta estar en modo oscuro para poder editar su paleta).
- Cada color se elige con un selector visual nativo (círculo de color, `<input type="color">`) **o** escribiendo el código hexadecimal directamente; ambos quedan sincronizados (`core/shared/components/color-field/`).
- Panel de **vista previa en vivo** que muestra una réplica en miniatura del panel (barra lateral, tarjeta, badges, botones) ya pintada con la paleta que se está editando, sin afectar el resto de la aplicación hasta que se decide aplicarla.
- Botón **"Restablecer modo claro/oscuro"** (vuelve solo la pestaña activa a los valores originales) y **"Restablecer todo"**.
- Botón **"Usar este modo ahora"**, visible cuando la pestaña que se edita no es el tema activo, para cambiar el tema activo de la app a esa paleta con un clic.
- Todo se guarda automáticamente en `localStorage`: al recargar la página o volver más tarde, los colores personalizados siguen ahí.
