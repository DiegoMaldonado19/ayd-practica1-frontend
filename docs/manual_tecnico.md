# Manual Técnico — Sistema de Gestión de Gimnasio (Frontend)

> **Ámbito de este documento:** solo el **frontend** del Sistema de Gestión de Gimnasio
> (Práctica 1, Análisis y Diseño de Sistemas 1 — USAC CUNOC).
> El backend (Spring Boot) cuenta con su propia documentación y queda **fuera del alcance** de este manual.

---

## Tabla de contenidos

1. [Introducción y alcance](#1-introducción-y-alcance)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Configuración del entorno](#3-configuración-del-entorno)
4. [Arquitectura y estructura del proyecto](#4-arquitectura-y-estructura-del-proyecto)
5. [Autenticación y autorización](#5-autenticación-y-autorización)
6. [Capa de datos (cliente HTTP y hooks)](#6-capa-de-datos-cliente-http-y-hooks)
7. [Validación de formularios](#7-validación-de-formularios)
8. [Componentes compartidos](#8-componentes-compartidos)
9. [Detalle técnico por módulo](#9-detalle-técnico-por-módulo)
10. [Enums y etiquetas en español](#10-enums-y-etiquetas-en-español)
11. [Guía de despliegue](#11-guía-de-despliegue)
12. [Capturas de pantalla (referencias)](#12-capturas-de-pantalla-referencias)

---

## 1. Introducción y alcance

Este documento describe la implementación del **frontend** del Sistema de Gestión de Gimnasio.
La aplicación es una **SPA (Single Page Application)** que consume una API REST (`/api/v1`) expuesta
por el backend Spring Boot.

El documento cubre:

- Stack de tecnologías y configuración del entorno.
- Arquitectura general y organización de carpetas.
- Mecanismo de autenticación, sesión y control de acceso por rol.
- Patrón de desarrollo por módulo (servicios, hooks, páginas, componentes).
- Detalle técnico de cada módulo con sus endpoints, páginas, componentes y validaciones.
- Enumeraciones y etiquetas en español usadas en la interfaz.
- Guía de despliegue y build de producción.

---

## 2. Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| **React** | 19.x | Librería de interfaz de usuario |
| **TypeScript** | ~6.0 | Tipado estático |
| **Vite** | 8.x | Servidor de desarrollo y build |
| **Material UI (MUI)** | 5.x | Biblioteca de componentes de interfaz (`@mui/material`, `@mui/icons-material`, `@mui/lab`) |
| **MUI X Date Pickers** | 7.x | Selectores de fecha (`DatePicker`) |
| **React Router DOM** | 7.x | Enrutamiento y guardas de ruta |
| **TanStack Query** | 5.x | Consultas y mutaciones HTTP (cache) |
| **Axios** | 1.x | Cliente HTTP |
| **React Hook Form** | 7.x | Gestión de formularios |
| **Yup** | 1.x | Esquemas de validación |
| **@hookform/resolvers** | 5.x | Puente entre React Hook Form y Yup |
| **AG-Grid (Community)** | 36.x | Tablas de datos (`ag-grid-react`, `ag-grid-community`) |
| **notistack** | 3.x | Notificaciones tipo *snackbar* |
| **dayjs** | 1.x | Manejo de fechas (locale `es`) |
| **TipTap** | 3.x | Editor de texto enriquecido (en dependencias) |
| **react-number-format** | 5.x | Formato de números (en dependencias) |

---

## 3. Configuración del entorno

### 3.1 Variables de entorno

La única variable de entorno es `VITE_API_BASE_URL`, definida en `.env` (o `.env.local`):

```
VITE_API_BASE_URL=http://localhost:8080
```

> **Importante:** el valor es la **raíz** del backend, **sin** `/api/v1`. El cliente HTTP
> (`src/api/client.ts`) agrega el prefijo `/api/v1` automáticamente.

### 3.2 Requisitos

- **Node.js 20.19+ o 22+** (el pipeline de CI usa Node 24). Con versiones anteriores, `npm run lint`
  falla con `TypeError: util.styleText is not a function`, porque ESLint 10 depende de una API de
  `node:util` inexistente en versiones viejas.
- El **backend** corriendo en `http://localhost:8080` para que los flujos de autenticación y datos
  funcionen contra datos reales.

### 3.3 Scripts

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias |
| `npm run dev` | Levanta el servidor de desarrollo de Vite |
| `npm run build` | `tsc -b && vite build` — type-checking + build de producción |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run preview` | Sirve el build de producción localmente |

### 3.4 Aliases de importación

El alias `@` resuelve a `src/` (configurado en `vite.config.ts`):

```ts
// vite.config.ts
resolve: {
  alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
},
```

Ejemplo: `import { theme } from "@/theme";`

---

## 4. Arquitectura y estructura del proyecto

### 4.1 Flujo de arranque

El punto de entrada es `src/main.tsx`:

1. Carga las fuentes Roboto (`@fontsource/roboto`).
2. Monta `App` en el elemento `#root`.

`src/App.tsx` envuelve la aplicación en una pila de *providers*:

```
QueryClientProvider (React Query)
 └─ ThemeProvider (MUI, tema de la app)
     └─ CssBaseline
         └─ LocalizationProvider (dayjs, locale es)
             └─ SnackbarProvider (notistack, top-center, max 3)
                 └─ AuthProvider (sesión)
                     └─ RouterProvider (router)
```

Configuración global de React Query:

```ts
new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});
```

### 4.2 Estructura de carpetas

```
src/
├── main.tsx                 # Punto de entrada
├── App.tsx                  # Providers globales + RouterProvider
├── router.tsx               # Árbol de rutas y guardas por rol
├── theme.ts                 # Tema de MUI (color primario #aa3bff)
├── index.css                # CSS global
│
├── api/
│   ├── client.ts            # Instancia axios + interceptor de token y 401
│   └── types.ts             # ErrorResponse, Page<T>, getErrorMessage()
│
├── auth/
│   ├── auth-context.ts      # Contexto de sesión (tipo)
│   ├── AuthContext.tsx      # Proveedor: estado de sesión, login/logout
│   ├── ProtectedRoute.tsx   # Guardas ProtectedRoute / PublicOnlyRoute
│   ├── permissions.ts       # Roles, MODULE_ACCESS, canAccessModule()
│   └── useAuth.ts           # Hook para consumir el contexto
│
├── components/              # Componentes compartidos (AppDatePicker, gráficas)
├── hooks/
│   └── useOwnMemberId.ts    # Resuelve el member_id propio de un socio
│
├── layouts/
│   ├── AppLayout.tsx        # Barra superior + sidebar + área de páginas
│   ├── Sidebar.tsx          # Menú lateral colapsable con navegación por rol
│   ├── PublicLayout.tsx     # Layout centrado para pantallas públicas
│   └── UserMenu.tsx         # Menú de usuario (perfil, seguridad, logout)
│
└── modules/                 # Módulos de negocio
    ├── auth/                # Login, verificación 2FA, recuperación, seguridad, perfil
    ├── dashboard/           # Paneles por rol
    ├── members/             # Socios
    ├── employees/           # Personal
    ├── trainers/            # Entrenadores
    ├── membership/          # Planes y contratos (membresías)
    ├── access/              # Visitas (check-in/out) y pases de invitado
    ├── classes/             # Clases y sesiones
    ├── billing/             # Pagos y promociones
    ├── training/            # Entrenamiento (asignaciones, rutinas, alertas)
    ├── nutrition/           # Nutrición (alimentos, comidas, metas)
    ├── reports/             # Reportes
    └── notifications/       # Bandeja de notificaciones
```

### 4.3 Patrón por módulo

Cada módulo de negocio sigue la misma forma interna:

```
modules/<modulo>/
├── pages/          # Una pantalla por ruta
├── components/     # Componentes propios del módulo
├── services.ts     # Llamadas HTTP (axios)
├── types.ts        # DTOs y tipos (copia de los contratos del backend)
├── hooks.ts        # Mutaciones y consultas de React Query
└── <nombre>Schema.ts  # Esquema Yup del formulario (cuando aplica)
```

> **Nota:** por la regla de lint `react-refresh/only-export-components`, un archivo que exporta
> componentes no puede exportar constantes o funciones. Por eso los labels/enums viven en archivos
> `.ts` (o `.tsx` cuando las columnas contienen JSX) separados de los componentes.

### 4.4 Enrutamiento (`src/router.tsx`)

- Rutas públicas (`PublicOnlyRoute` + `PublicLayout`): `/login`, `/verify-code`,
  `/forgot-password`, `/reset-password`. Si ya hay sesión, redirigen a `/`.
- Rutas protegidas (`ProtectedRoute` + `AppLayout`): el resto de la aplicación.
- `ProtectedRoute` acepta `allowedRoles` para restringir una rama a ciertos roles; si el rol no
  alcanza, redirige a `/`.
- Ruta comodín `*` redirige a `/`.

Tabla de rutas principales:

| Ruta | Página | Acceso |
|---|---|---|
| `/` y `/dashboard` | DashboardPage | Sesión |
| `/account/profile` | MyProfilePage | Todos los roles |
| `/account/security` | SecuritySettingsPage | Todos los roles |
| `/members` | MembersListPage | ADMIN, RECEPTIONIST |
| `/members/new` | MemberFormPage | ADMIN, RECEPTIONIST |
| `/members/:id` | MemberDetailPage | ADMIN, RECEPTIONIST |
| `/members/:id/edit` | MemberFormPage | ADMIN, RECEPTIONIST |
| `/employees` | EmployeesListPage | ADMIN |
| `/employees/new` | EmployeeFormPage | ADMIN |
| `/employees/:id` | EmployeeDetailPage | ADMIN |
| `/employees/:id/edit` | EmployeeFormPage | ADMIN |
| `/trainers` | TrainersListPage | ADMIN, RECEPTIONIST |
| `/trainers/:id` | TrainerDetailPage | ADMIN, RECEPTIONIST |
| `/membership-plans` | MembershipPlansListPage | ADMIN |
| `/membership-plans/new` | MembershipPlanFormPage | ADMIN |
| `/membership-plans/:id/edit` | MembershipPlanFormPage | ADMIN |
| `/memberships` | MembershipsListPage | ADMIN, RECEPTIONIST |
| `/memberships/:id` | MembershipDetailPage | ADMIN, RECEPTIONIST |
| `/access/visits` | VisitsPage | ADMIN, RECEPTIONIST |
| `/access/guest-passes` | GuestPassesPage | ADMIN, RECEPTIONIST |
| `/classes` | ClassesListPage | ADMIN, RECEPTIONIST |
| `/classes/new` | ClassFormPage | ADMIN |
| `/classes/:id` | ClassDetailPage | ADMIN, RECEPTIONIST |
| `/classes/:id/edit` | ClassFormPage | ADMIN |
| `/classes/:id/sessions/:sessionId` | ClassSessionDetailPage | ADMIN, RECEPTIONIST |
| `/payments` | PaymentsPage | ADMIN, RECEPTIONIST |
| `/payments/new` | PaymentFormPage | ADMIN, RECEPTIONIST |
| `/payments/me` | PaymentHistoryPage | MEMBER |
| `/promotions` | PromotionsPage | ADMIN |
| `/promotions/new` | PromotionFormPage | ADMIN |
| `/promotions/:id/edit` | PromotionFormPage | ADMIN |
| `/notifications` | NotificationsPage | Todos los roles |
| `/training` | TrainingHomePage (redirige por rol) | ADMIN, TRAINER, MEMBER |
| `/training/assignments` | AssignmentsPage | ADMIN |
| `/training/my-members` | MyMembersPage | TRAINER |
| `/training/exercises` | ExercisesPage | ADMIN, TRAINER |
| `/training/members/:id` | MemberTrainingPage | ADMIN, TRAINER |
| `/training/alerts` | AlertsPage | ADMIN, TRAINER |
| `/training/me` | MyTrainingPage | MEMBER |
| `/nutrition` | NutritionHomePage (redirige por rol) | ADMIN, TRAINER, MEMBER |
| `/nutrition/foods` | FoodsPage | ADMIN, TRAINER, MEMBER |
| `/nutrition/me` | MyNutritionPage | MEMBER |
| `/nutrition/members/:id` | MemberNutritionPage | ADMIN, TRAINER |
| `/reports` | ReportsPage | ADMIN |

> **Nota sobre la ocultación de la interfaz:** la ocultación de menús y la redirección por rol es
> **cosmética**. El backend es quien prohíbe de verdad cada endpoint según el rol.

---

## 5. Autenticación y autorización

### 5.1 Persistencia de sesión (`src/api/client.ts`)

- El `access_token` se guarda en `localStorage` con la llave **`fitness_app.access_token`**.
- Helpers: `getAccessToken()`, `setAccessToken(token)`, `clearAccessToken()`.
- El `apiClient` (axios) usa `baseURL = ${VITE_API_BASE_URL}/api/v1`.

**Interceptor de petición:** agrega `Authorization: Bearer <token>` a cada request cuando hay token.

**Interceptor de respuesta (401):** si una petición falla con `401` **y** la petición llevaba un token
(sesión vencida), se limpia el token y se fuerza `window.location.href = "/login"`. Un `401` en un
endpoint público (p. ej. credenciales inválidas en el login) **no** dispara la redirección: se maneja
como error del formulario.

### 5.2 Restauración de sesión (`src/auth/AuthContext.tsx`)

- Estado inicial: `loading` si hay token en `localStorage`, si no `unauthenticated`.
- Al montar: si hay token, llama `GET /auth/me`:
  - Éxito → `user = perfil`, `status = "authenticated"`.
  - Error → `clearAccessToken()`, `status = "unauthenticated"`.
- `setSession(response)` guarda el token y el perfil del login exitoso.
- `updateUser(partial)` actualiza el usuario en memoria (usado tras cambiar 2FA).
- `logout()` llama `POST /auth/logout` (sin bloquear si falla, el server es stateless) y limpia el token.

### 5.3 Guardas de ruta (`src/auth/ProtectedRoute.tsx`)

- `ProtectedRoute`: muestra `CircularProgress` mientras restaura; redirige a `/login` si no hay sesión;
  si se define `allowedRoles` y el rol del usuario no está en la lista, redirige a `/`.
- `PublicOnlyRoute`: redirige a `/` si ya hay sesión; si no, renderiza las rutas hijas.

### 5.4 Roles y módulos (`src/auth/permissions.ts`)

Roles y etiquetas:

| Rol | `ROLE_LABEL` |
|---|---|
| `ADMIN` | Administrador |
| `RECEPTIONIST` | Recepcionista |
| `TRAINER` | Entrenador |
| `MEMBER` | Socio |

Mapa `MODULE_ACCESS` (módulo → roles permitidos):

| Módulo | Roles |
|---|---|
| `dashboard` | Todos |
| `members` | ADMIN, RECEPTIONIST |
| `employees` | ADMIN |
| `trainers` | ADMIN, RECEPTIONIST |
| `membershipPlans` | ADMIN |
| `memberships` | ADMIN, RECEPTIONIST |
| `billing` | ADMIN, RECEPTIONIST |
| `access` | ADMIN, RECEPTIONIST |
| `classes` | Todos |
| `training` | ADMIN, TRAINER, MEMBER |
| `nutrition` | ADMIN, TRAINER, MEMBER |
| `notifications` | Todos |
| `reports` | ADMIN |

La `Sidebar` muestra los ítems según `canAccessModule(user.role, module)` o `hasAnyRole` cuando un
ítem declara `roles` específicos. El grupo "Entrenamiento" filtra sus hijos por rol:
Asignaciones (ADMIN), Mis socios (TRAINER), Ejercicios (ADMIN/TRAINER),
Alertas de entrenador (ADMIN/TRAINER), Mi entrenamiento (MEMBER).

### 5.5 Servicios de autenticación (`src/modules/auth/services.ts`)

| Método | Endpoint | Función |
|---|---|---|
| POST | `/auth/login` | Iniciar sesión (`{ username, password }`) |
| POST | `/auth/challenges/{challengeId}/verifications` | Verificar código 2FA (`{ code }`) |
| POST | `/auth/password-recoveries` | Solicitar código de recuperación (`{ username }`) |
| POST | `/auth/password-resets` | Restablecer contraseña (`{ challenge_id, code, new_password }`) |
| POST | `/auth/logout` | Cerrar sesión |
| GET | `/auth/me` | Perfil del usuario actual |
| PUT | `/users/me/password` | Cambiar contraseña propia |
| PATCH | `/users/me/two-factor` | Activar/desactivar doble factor + canal |
| POST | `/users` | Crear usuario (socios/empleados) |
| GET | `/users` | Listar usuarios (detección de cuenta existente) |

### 5.6 Flujo de doble factor (2FA)

1. `POST /auth/login` responde una unión discriminada:
   - Éxito (`access_token` + `user`) → sesión inmediata.
   - Reto (`challenge_id`, `channel`, `masked_destination`) → navega a `/verify-code` con el reto en
     `location.state` (nunca en la URL ni en `localStorage`).
2. `VerifyCodePage` valida el código de 6 dígitos y canjea el reto por la sesión.
   Si se llega sin reto activo, redirige a `/login`.

---

## 6. Capa de datos (cliente HTTP y hooks)

### 6.1 Tipos de paginación y errores (`src/api/types.ts`)

Envelope de paginación:

```ts
interface Page<T> {
  content: T[];
  page: { size: number; number: number; total_elements: number; total_pages: number };
}
```

Forma de error del backend:

```ts
interface ErrorResponse {
  error_code: string;
  message: string;
  suggested_action?: string;
  timestamp: string;
  path: string;
  field_errors?: Record<string, string>;
  trace_id?: string;
}
```

Helpers:

- `getErrorMessage(error, fallback)` → `message` y, si hay `field_errors`, el primero como
  `"message (firstFieldError)"`.
- `getErrorCode(error)` → `error_code` para mapeos específicos.

### 6.2 Patrón de hooks (React Query)

Cada módulo expone hooks tipados con su `queryKey`. Ejemplos:

```ts
// members/hooks.ts
export function useMembers(params) {
  return useQuery({ queryKey: ["members", params], queryFn: () => getMembers(params) });
}
export function useCreateMember() {
  return useMutation({ mutationFn: createMember, onSuccess: () => { enqueueSnackbar("Socio creado correctamente"); queryClient.invalidateQueries({ queryKey: ["members"] }); } });
}
```

Patrones transversales:

- `retry: false` y `refetchOnWindowFocus: false` globales.
- Las mutaciones invalidan las consultas relacionadas con `invalidateQueries`.
- Las consultas condicionales usan `enabled` (p. ej. `usePromotion(isEdit ? Number(id) : undefined)`).
- Los errores específicos se traducen con `getErrorCode(error)` comparando `error_code`
  (p. ej. `DOCUMENT_ALREADY_REGISTERED`, `MEMBERSHIP_ALREADY_ACTIVE`, `TRAINER_CAPACITY_EXCEEDED`).

---

## 7. Validación de formularios

Todos los formularios usan **react-hook-form** + **yupResolver**. Reglas comunes:

| Concepto | Regla |
|---|---|
| DPI | exactamente 13 dígitos |
| Pasaporte | 6 o 9 dígitos |
| NIT | 8 o 9 dígitos |
| Teléfono (GT) | exactamente 8 dígitos, formato `####-####` |
| Correo | formato email válido |
| Edad mínima socio | 14 años |
| Edad mínima empleado | 18 años al momento de contratación |
| Contraseña | 8–72 caracteres; alfanumérica; mínimo 1 letra y 1 número (creación de cuenta) |
| Código 2FA / recuperación | exactamente 6 dígitos |
| Fechas | ISO `YYYY-MM-DD`; `AppDatePicker` controla min/max |

Los `schemas` de cada módulo viven en archivos separados (p. ej. `memberFormSchema.ts`,
`employeeFormSchema.ts`, `classFormSchema.ts`, `paymentFormSchema.ts`, `promotionFormSchema.ts`).

---

## 8. Componentes compartidos

### 8.1 `AppDatePicker` (`src/components/AppDatePicker.tsx`)

Wrapper de MUI X `DatePicker` con contrato de valor ISO string (`YYYY-MM-DD`):

```ts
interface AppDatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  size?: "small" | "medium";
  fullWidth?: boolean;
  minDate?: string;
  maxDate?: string;
  sx?: SxProps<Theme>;
  InputProps?: TextFieldProps["InputProps"];
}
```

### 8.2 Gráficas SVG (`src/components/`)

- **`SimpleBarChart`**: gráfica de barras (un solo color, `primary.main`). Props:
  `bars: { label; value }[]`, `color?`, `valueFormatter?`, `height?` (default 200). Vacío → "No hay
  datos para mostrar."
- **`TrendLineChart`**: gráfica de línea con área. Props: `points: { label; value }[]`, `color?`,
  `valueFormatter?`, `height?`. Requiere ≥ 2 puntos, si no → "No hay suficientes datos para mostrar
  la tendencia."
- **`MeasurementChart`** (`src/modules/training/components/`): evolución de peso del socio. Requiere
  ≥ 2 mediciones.

### 8.3 Componentes por módulo

Cada módulo tiene componentes reutilizables (form fields tipados, chips de estado, columnas
AG-Grid, autocompletes, barras de filtros y paginación). Se detallan en la sección 9.

---

## 9. Detalle técnico por módulo

> Todos los endpoints usan el prefijo `${VITE_API_BASE_URL}/api/v1` y el header
> `Authorization: Bearer <token>`.

---

### 9.1 Auth / Seguridad / Perfil (`src/modules/auth`)

#### Pantallas

| Pantalla | Descripción |
|---|---|
| `LoginPage` | Formulario usuario/contraseña. En éxito → sesión o reto 2FA. |
| `VerifyCodePage` | Verifica el código de 6 dígitos del reto 2FA. |
| `ForgotPasswordPage` | Solicita recuperación con el usuario. |
| `ResetPasswordPage` | Ingresa código + nueva contraseña + confirmación. |
| `SecuritySettingsPage` | Dos secciones: "Verificación en dos pasos" (switch + canal EMAIL/SMS) y "Cambiar contraseña". |
| `MyProfilePage` | Perfil del usuario (solo lectura) + sección "Mi membresía" para MEMBER. |

#### Validaciones (`schemas.ts`)

| Campo | Regla |
|---|---|
| `login.username` | requerido |
| `login.password` | requerido |
| `code` (verificación/recuperación) | exactamente 6 dígitos |
| `new_password` | 8–72 caracteres |
| `confirm_password` | debe coincidir con `new_password` |
| 2FA `channel` | `EMAIL` \| `SMS` |

#### Detalles relevantes

- `MyProfilePage` muestra: nombre, chip de rol, usuario, correo, estado de cuenta, último inicio de
  sesión (locale `es-GT`). Para MEMBER muestra además "Mi membresía" con plan, período de
  facturación, precio, fecha de fin y días restantes, usando `GET /members/{memberId}/memberships`.
- `useOwnMemberId` (`src/hooks/useOwnMemberId.ts`): fallback que resuelve el `member_id` propio de un
  MEMBER sondeando `GET /payments?page=0&size=1` y luego `GET /routines?page=0&size=1`
  (el backend auto-resuelve "self" y devuelve `member_id` en `content[0]`). Usado por `MyNutritionPage`.

---

### 9.2 Dashboard (`src/modules/dashboard`)

`DashboardPage` saluda al usuario y renderiza un panel según su rol:

| Rol | Panel | Contenido |
|---|---|---|
| ADMIN | `AdminPanel` | 4 StatTiles (Socios activos, Membresías por vencer 5 días, Entrenadores, Alertas pendientes), lista "Próximas a vencer", gráficas "Ingresos netos (últimos 6 meses)" y "Socios activos por plan", accesos rápidos. |
| RECEPTIONIST | `ReceptionistPanel` | 3 StatTiles (Quién está dentro, Membresías por vencer, Pases de invitado hoy), gráfica "Visitas de los últimos 7 días", accesos rápidos. |
| TRAINER | `TrainerPanel` | 2 StatTiles (Mis socios asignados, Mis alertas pendientes) + accesos rápidos. Sin gráficas. |
| MEMBER | `MemberPanel` | 3 tarjetas (Mi membresía, Mi rutina, Mi nutrición hoy) + gráficas "Mi peso" y "Calorías (últimos 7 días)" + accesos rápidos. |

`StatTile` es un componente compartido (Paper clickeable con icono, valor y opción `linkTo`).

Hooks del dashboard: `useVisits`, `useGuestPasses`, `useMembers`, `useMemberships`, `useTrainers`,
`useTrainerAlerts`, `useTrainerAssignments`, `useReportRows`, `useMemberMembershipHistory`,
`useRoutines`, `useDailySummary`, `useMemberMeasurements`, `useSummaryTrend`.

Endpoints consultados: `GET /visits`, `GET /guest-passes`, `GET /members`, `GET /memberships`,
`GET /trainers`, `GET /trainer-alerts`, `GET /trainer-assignments`, `GET /reports/revenue`,
`GET /reports/member-distribution`, `GET /members/{id}/memberships`, `GET /routines`,
`GET /members/{id}/nutrition-summary`, `GET /members/{id}/measurements`.

---

### 9.3 Members — Socios (`src/modules/members`)

#### Listado (`MembersListPage`)

- **AG-Grid** (`themeMaterial`), `rowSelection="single"`, altura 540, paginación server-side de 20.
- Columnas: Código, Nombre (flex), Documento, Correo, Ingreso, Estado (Chip).
- Filtros: "Buscar por nombre o documento" (server-side `search`) y "Estado"
  (Todos/Activo/Inactivo/Retirado → `"" | ACTIVE | INACTIVE | WITHDRAWN`).
- Paginación custom: botones "Anterior"/"Siguiente" + texto
  `"{total} socios · página {n} de {m}"`.
- Clic en fila → `/members/{id}`. Botón "Nuevo socio" → `/members/new`.

#### Formulario (`MemberFormPage`)

Título "Registrar nuevo socio" / "Editar socio". Secciones:

1. **Identificación**: `document_type` (DPI/Pasaporte/NIT) y `document_number` (validación según tipo).
2. **Información personal**: `first_name`, `last_name`, `gender` (Masculino/Femenino/Otro),
   `birth_date` (≥ 14 años, ≤ 120), `email` (obligatorio si se crea cuenta), `phone`
   (8 dígitos, formato `####-####`), `address`.
3. **Acceso al sistema** (`MemberAccountAccessFields`): si el socio ya tiene cuenta, muestra aviso y no
   permite modificar credenciales. Si no, permite `username`, botón "Generar contraseña alfanumérica",
   `password` (con toggle mostrar/ocultar) y `confirm_password`. Rol fijo `MEMBER`.
4. **Contacto de emergencia**: `emergency_contact_name`, `emergency_contact_phone` (8 dígitos).
5. **Notas adicionales**: `notes` (multilínea).

Flujo de guardado:

- Crear: `POST /members` → si hay `username`+`password`, `POST /users` con rol `MEMBER`.
- Editar: `PUT /members/{id}` → misma creación de cuenta solo si no existe.
- Errores mapeados: `DOCUMENT_ALREADY_REGISTERED` → "Ya existe un socio con ese número de documento";
  `VALIDATION_ERROR` → "Por favor revisa los datos ingresados".

#### Detalle (`MemberDetailPage`)

- Botones: **Editar** (`/members/{id}/edit`), **Cambiar estado** (menú: Reactivar/Suspender/Dar de baja
  según estado actual, `PATCH /members/{id}/status`).
- Tarjeta **"Membresía contratada"** (`MemberMembershipCard`): plan, período, precio, fechas, días
  restantes y beneficios (clases grupales, entrenador personal).
- Paneles: **Datos personales**, **Contacto de emergencia**, **Notas** (si existen).

Endpoints: `GET /members`, `GET /members/{id}`, `POST /members`, `PUT /members/{id}`,
`PATCH /members/{id}/status`, `GET /members/{id}/memberships`, `GET /users`, `POST /users`.

---

### 9.4 Employees — Personal (`src/modules/employees`)

#### Listado (`EmployeesListPage`, ADMIN)

- AG-Grid, paginación server-side de 20.
- Columnas: Código, Nombre, Puesto (Administrador/Recepcionista/Entrenador), Contratado, Estado (Chip JSX).
- Filtros: "Buscar" (server-side) y "Puesto" (`"" | ADMIN | RECEPTIONIST | TRAINER`).
- Clic en fila → `/employees/{id}`.

#### Formulario (`EmployeeFormPage`, ADMIN)

Secciones: Identificación, Información personal, Acceso al sistema (usuario/contraseña; rol =
`values.position`), Información laboral (`position` — deshabilitado en edición —, `hired_on`,
y si es TRAINER: `max_member_load` máx 200 y `bio` máx 500).

Validaciones clave (`employeeFormSchema.ts`): documento por tipo; `birth_date` 18–120 años;
`hired_on` requerido, no futuro y ≥ 18 años después del nacimiento; `email` requerido si hay usuario;
contraseña alfanumérica 8+ con 1 letra y 1 número.

Flujo: crear `POST /employees` (+ `POST /users` si hay cuenta); editar `PUT /employees/{id}`
(solo `person` + `hired_on`). Estados: `ACTIVE | SUSPENDED | TERMINATED`.

#### Detalle (`EmployeeDetailPage`, ADMIN)

- Botones: "Ver perfil de entrenador" (si `trainer_id`), "Editar", "Cambiar estado"
  (Reincorporar/Suspender/Dar de baja).
- Panel "Datos del empleado" con los campos del empleado.

Endpoints: `GET /employees`, `GET /employees/{id}`, `POST /employees`, `PUT /employees/{id}`,
`PATCH /employees/{id}/status`, `GET /users`, `POST /users`.

---

### 9.5 Trainers — Entrenadores (`src/modules/trainers`)

#### Listado (`TrainersListPage`, ADMIN/RECEPTIONIST)

- AG-Grid: Nombre, Carga máxima, Especialidades (Chips JSX).
- Filtro: "Especialidad" (5 opciones). No hay botón de alta (se crean vía empleados).

#### Detalle (`TrainerDetailPage`)

- Sección **"Carga máxima de socios"**: edita `max_member_load` y `bio` → `PUT /trainers/{id}`.
- Sección **"Especialidades"**: Autocomplete múltiple (5 especialidades) → `PUT /trainers/{id}/specialties`.
- Sección **"Información de contacto"** (solo lectura).
- Botón **"Transferir cartera"** → `TransferDialog`.

#### `TransferDialog` (transferencia de cartera)

- Cierra cada asignación vigente con motivo `TRAINER_LEFT`, abre una nueva sobre el destino y notifica
  a cada socio. El historial se apila, no se reescribe. Si el destino no tiene capacidad, la operación
  se rechaza sin cambios parciales (atómica).
- Select "Entrenador destino" (activos, excluye al actual) → `POST /trainers/{id}/member-transfers`
  con `{ to_trainer_id }`.

Endpoints: `GET /trainers`, `GET /trainers/{id}`, `PUT /trainers/{id}`, `PUT /trainers/{id}/specialties`,
`POST /trainers/{id}/member-transfers`.

---

### 9.6 Membership — Planes y contratos (`src/modules/membership`)

#### Planes (`MembershipPlansListPage`, ADMIN)

- AG-Grid: Código, Nombre, Precio, Periodo, Nivel (tier), Clases grupales, Entrenador personal,
  Estado (Chip), Acciones (Activar/Desactivar → `PATCH /membership-plans/{id}/status { active }`).
- Clic en fila → `/membership-plans/{id}/edit`.

#### Formulario de plan (`MembershipPlanFormPage`, ADMIN)

- Sección "Identidad del plan": `code` (inmutable en edición), `tier` (entero positivo, inmutable),
  `billing_period` (MONTHLY/QUARTERLY/SEMIANNUAL/ANNUAL), `name`, `price` (> 0), `description`.
- Sección "Beneficios": switch `includes_group_classes`, `weekly_class_limit` (1–7; vacío = ilimitadas;
  forzado a `null` si no incluye clases), switch `includes_personal_trainer`.
- Crear: `POST /membership-plans`; editar: `PUT /membership-plans/{id}` (sin `code`/`tier`).

#### Contratos (`MembershipsListPage`, ADMIN/RECEPTIONIST)

- AG-Grid: ID, Socio, Plan, Estado, Inicio, Vence, Días restantes, Precio pagado.
- Filtros: Estado, Plan, "Vence en (días)" (`expiring_in_days`).
- Botón **"Contratar membresía"** (ADMIN) → `ContractDialog`:
  `MemberSelect` (búsqueda de socio; bloqueado si está de baja), plan activo, `start_date`
  (≥ hoy), notas → `POST /memberships { member_id, membership_plan_id, start_date?, notes? }`.

#### Detalle (`MembershipDetailPage`)

Acciones según estado (`canManage` = ADMIN o RECEPTIONIST):

| Acción | Condición | Endpoint |
|---|---|---|
| Ver socio | canManage | — (navega a `/members/{id}`) |
| Congelar | ACTIVE | `POST /memberships/{id}/freezes` |
| Reactivar | FROZEN | `POST /memberships/{id}/reactivations` |
| Renovar | ACTIVE o EXPIRED sin otro contrato vigente | `POST /memberships/{id}/renewals` |
| Cambiar plan | igual que Renovar | `POST /memberships/{id}/plan-changes` |
| Cancelar | status ≠ CANCELLED | `POST /memberships/{id}/cancellations` |

- `FreezeDialog`: motivo (Viaje/Lesión/Otro), detalle, fecha estimada de reactivación (≥ hoy, respeta
  tope de días del ciclo). Errores: `FREEZE_LIMIT_REACHED`, `MEMBERSHIP_FROZEN`, `MEMBERSHIP_EXPIRED`/`CANCELLED`.
- Sección "Congelamientos": chips de uso del ciclo + historial con estado "En curso"/"Reactivada el".
- Sección "Datos del contrato": plan, beneficios, precio, fechas, días restantes, notas, y si está
  cancelada: fecha y motivo.

Endpoints: `GET /membership-plans`, `GET /membership-plans/{id}`, `POST /membership-plans`,
`PUT /membership-plans/{id}`, `PATCH /membership-plans/{id}/status`, `GET /memberships`,
`GET /memberships/{id}`, `POST /memberships`, `GET /members/{id}/memberships`,
`GET /memberships/{id}/freezes`, `POST /memberships/{id}/freezes`,
`POST /memberships/{id}/reactivations`, `POST /memberships/{id}/renewals`,
`POST /memberships/{id}/plan-changes`, `POST /memberships/{id}/cancellations`.

---

### 9.7 Access — Control de acceso (`src/modules/access`)

`AccessNavTabs` muestra dos pestañas: "Socios (check-in/check-out)" y "Invitados / pases de un día".

#### Visitas (`VisitsPage`)

- Tabs internos: "En instalaciones" (`open: true`) / "Historial" (`open: false`).
- AG-Grid (paginación 15): Socio, Canal (Recepción/Autoservicio), Check-in, Check-out
  ("En instalaciones" si está abierta), Minutos dentro, Acciones (botón **Check-out** si no salió).
- **Registrar Check-in**: dialog con `MemberPicker` (socios ACTIVOS) → `POST /visits { member_id }`.
- Check-out → `POST /visits/{visitId}/check-out`.

#### Pases de invitado (`GuestPassesPage`)

- AG-Grid: Invitado, Documento, Tipo de Pase (Día de Prueba/Pase Pagado/Invitado de Socio), Anfitrión, Check-in.
- **Registrar Pase**: dialog con `document_type`, `document_number` (según tipo), `first_name`,
  `last_name`, `email`, `phone` (8 dígitos), `pass_type`
  (FREE_TRIAL / PAID_DAY_PASS / MEMBER_GUEST), y `host_member_id` solo si `MEMBER_GUEST` → `POST /guest-passes`.

> **Nota:** el tipo `PAID_DAY_PASS` se crea a través del módulo billing (concepto `GUEST_PASS`), no
> desde este formulario.

Endpoints: `GET /visits`, `POST /visits`, `POST /visits/{id}/check-out`, `GET /guest-passes`,
`POST /guest-passes`.

---

### 9.8 Classes — Clases (`src/modules/classes`)

#### Cartelera (`ClassesListPage`)

- Lista **sesiones** (instancias) con filtros: Disciplina (10), Clase base (activas), Desde (hoy),
  Hasta (hoy + 14 días).
- AG-Grid: Clase, Disciplina, Fecha, Horario (`start - end`), Cupo (`seats/max`), Estado
  (color por estado), Acceso (Chip Disponible/Lleno).
- Clic en fila → `/classes/{group_class_id}`. Botón "Nueva clase" → `/classes/new`.

#### Formulario (`ClassFormPage`, ADMIN)

- Campos: `code` (≤ 30), `name` (≤ 100), `discipline` (10 opciones), `difficulty_level`
  (Principiante/Intermedio/Avanzado), `trainer_id` (requerido), `weekday` (7 opciones),
  `start_time` (formato HH:mm), `duration_minutes` (30–180), `max_capacity` (1–50).
- Crear: `POST /group-classes`; editar: `PUT /group-classes/{id}`.

#### Detalle (`ClassDetailPage`)

- Panel de información (9 campos) + botones "Modificar clase" y "Volver al listado".
- **Generar sesiones**: rangos "Desde"/"Hasta" (ambos requeridos, desde ≥ hoy, desde ≤ hasta) →
  `POST /group-classes/{id}/sessions { from, to }`.
- Lista "Sesiones programadas" (cards clicables → `/classes/{id}/sessions/{sessionId}`).

#### Detalle de sesión (`ClassSessionDetailPage`)

- Panel de información de la sesión.
- **Acciones**: seleccionar socio (ACTIVO) e "Inscribir a la sesión"
  (`POST /class-sessions/{id}/enrollments { member_id }`) o "Agregar a lista de espera"
  (`POST /class-sessions/{id}/waitlist-entries { member_id }`). Valida duplicados en ambas listas.
- Columnas "Inscritos" y "Lista de espera" con estado de cada registro.

Endpoints: `GET /group-classes`, `GET /group-classes/{id}`, `POST /group-classes`,
`PUT /group-classes/{id}`, `POST /group-classes/{id}/sessions`, `GET /class-sessions`,
`GET /class-sessions/{id}`, `POST /class-sessions/{id}/enrollments`,
`GET /class-sessions/{id}/enrollments`, `POST /class-sessions/{id}/waitlist-entries`,
`GET /class-sessions/{id}/waitlist-entries`, `GET /members` (socios ACTIVOS).

---

### 9.9 Billing — Pagos y promociones (`src/modules/billing`)

#### Pagos (`PaymentsPage`, ADMIN/RECEPTIONIST)

- Tabla `PaymentsTable` (compartida): ID, Socio (o "Invitado"), Concepto, Método, Estado (Chip),
  Monto original, Descuento, Total pagado. Filtros `PaymentsFiltersBar` (Buscar, Estado, Método)
  y paginación `ListPagination` — todos **client-side** sobre 200 filas cargadas (12 por página).

#### Formulario de pago (`PaymentFormPage`, ADMIN/RECEPTIONIST)

- Alerta informativa: "No hay pasarela de pago para el metodo de pago tarjeta".
- Campos: **Socio** (autocomplete; deshabilitado si `GUEST_PASS`), **Membresía** (autocomplete de las
  membresías del socio; al seleccionar fija el monto al precio del plan), **Promoción** (autocomplete
  por código/nombre), **Concepto** (Membresía / Pase de día), **Método de pago** (Efectivo /
  Tarjeta débito), **Monto** (deshabilitado en MEMBERSHIP; libre en GUEST_PASS).
- Panel **PriceBreakdown**: Monto original, Descuento (`{promotion.code}`), Total a pagar.
- Campos de invitado (`GuestPassFields`, solo `GUEST_PASS`): nombre, apellido, tipo/número de
  documento (validación por tipo), email (opcional), teléfono (opcional, 8 dígitos).

Lógica de descuento (`computeDiscount`):

```
PERCENTAGE → discount = gross × value / 100; net = max(gross − discount, 0)
FIXED_AMOUNT → discount = min(value, gross); net = max(gross − discount, 0)
```

Flujo `GUEST_PASS`: (1) crea el invitado `POST /guest-passes` con `pass_type: "PAID_DAY_PASS"`;
(2) arma el pago con `guest_pass_id`, `member_id: null` y `membership_id: null`; (3) crea el pago.
Navega a `/access/guest-passes` (GUEST_PASS) o `/payments` (MEMBERSHIP).

#### Historial de pagos (`PaymentHistoryPage`, MEMBER)

- `PaymentsTable` con columna "Comprobante" (botón **Recibo**).
- Dialog "Comprobante de pago": carga `GET /payments/{id}/receipt` y muestra Serie, Número, Emitido,
  Total pagado. Botones "Cerrar" e "Imprimir" (`window.print()`).

#### Promociones (`PromotionsPage`, ADMIN)

- MUI Table: ID, Código, Nombre, Descuento (`%` o `Q`), Vigencia, Estado (Chip Activa/Inactiva).
- Filtros client-side (Buscar + Estado) y paginación 12/página. Sin acciones por fila.

#### Formulario de promoción (`PromotionFormPage`, ADMIN)

- Campos: `code` (requerido), `name` (requerido), `description` (multilínea), `discount_type`
  (PERCENTAGE/FIXED_AMOUNT), `discount_value` (≥ 0, requerido), `max_uses`, `valid_from`
  (≥ hoy), `valid_to` (≥ `valid_from`), `max_uses_per_member`.
- Crear: `POST /promotions`; editar: `PUT /promotions/{id}`.

Endpoints: `GET /payments`, `POST /payments`, `GET /payments/{id}`, `POST /payments/{id}/confirmations`,
`POST /payments/{id}/voids`, `GET /payments/{id}/receipt`, `GET /promotions`, `GET /promotions/{id}`,
`POST /promotions`, `PUT /promotions/{id}`, `PATCH /promotions/{id}/status`, `POST /guest-passes`.

> Hooks `useTogglePromotionStatus`, `useConfirmPayment` y `useVoidPayment` existen en `hooks.ts`
> pero **no están conectados a ninguna pantalla** en el momento de esta documentación.

---

### 9.10 Training — Entrenamiento (`src/modules/training`)

#### Home (`TrainingHomePage`)

Redirige por rol: ADMIN → `/training/assignments`; TRAINER → `/training/my-members`;
MEMBER → `/training/me`.

#### Asignaciones (`AssignmentsPage`, ADMIN)

- AG-Grid: ID del socio, ID del entrenador, Inicio, Fin, Motivo de cierre, Acciones ("Cerrar" solo en
  asignaciones abiertas).
- "Asignar entrenador" → `AssignTrainerDialog` (`TrainingMemberPicker` + `TrainerPicker`) →
  `POST /trainer-assignments { member_id, trainer_id }`.
- "Cerrar asignación" → `DELETE /trainer-assignments/{id}` con `{ end_reason }`.
- Errores: `TRAINER_CAPACITY_EXCEEDED`, `TRAINER_ALREADY_ASSIGNED`, `PLAN_BENEFIT_NOT_INCLUDED`.

#### Mis socios (`MyMembersPage`, TRAINER)

- AG-Grid: Socio (nombre resuelto), Asignado desde. Backend filtra por el entrenador autenticado.
- Clic → `/training/members/{id}`.

#### Catálogo de ejercicios (`ExercisesPage`, ADMIN/TRAINER)

- AG-Grid: Código, Nombre, Grupo muscular (8), Activo (Sí/No), Acciones (Editar; Desactivar solo ADMIN).
- Dialog formulario: Código (req), Nombre (req), Grupo muscular (default FULL_BODY), Descripción,
  URL de video.
- CRUD: `POST /exercises`, `PUT /exercises/{id}`, `DELETE /exercises/{id}` (desactivar).

#### Entrenamiento del socio (`MemberTrainingPage`, ADMIN/TRAINER)

`canEdit = role === "TRAINER"` (ADMIN ve read-only). Tres secciones:

1. **Rutinas**: `RoutineEditorDialog` — nombre (req), objetivo, fecha de fin (≥ mañana), filas de
   ejercicio (ejercicio activo, día, series, repeticiones, descanso, orden, notas). Crear
   `POST /routines`; editar `PUT /routines/{id}` (reemplazo completo); estados `DRAFT | PUBLISHED |
   ARCHIVED` vía `PATCH /routines/{id}/status`.
   Error `TRAINER_SCOPE_VIOLATION` → "No tienes asignado a este socio".
2. **Mediciones de progreso**: `MeasurementFormDialog` — fecha (req, único), peso (req), % grasa,
   cintura, brazo, pierna, notas. `POST /members/{id}/measurements` y `PUT /measurements/{id}`.
   Error `MEASUREMENT_DUPLICATE_DATE`.
3. **Observaciones**: `NoteFormDialog` — tipo (Nutrición/Entrenamiento/General), contenido (req),
   fecha de referencia. `POST /members/{id}/notes`.

#### Alertas (`AlertsPage`, ADMIN/TRAINER)

- TRAINER: botón "Escalar alerta" (`CreateAlertDialog` → `POST /trainer-alerts`).
- ADMIN: botón "Resolver"/"Descartar" sobre alertas PENDING → `PATCH /trainer-alerts/{id}/status`.
- Tipos: REASSIGNMENT / SPECIAL_ATTENTION. Estados: PENDING / RESOLVED / DISMISSED.

#### Mi entrenamiento (`MyTrainingPage`, MEMBER)

- Secciones: Mi entrenador (`GET /members/{id}/trainer`), Mi rutina (publicada o primera),
  Mi progreso (mediciones + gráfica), Observaciones de mi entrenador.

Endpoints: `GET/POST /trainer-assignments`, `DELETE /trainer-assignments/{id}`,
`GET/POST/PUT/DELETE /exercises`, `GET/POST/PUT /routines`, `PATCH /routines/{id}/status`,
`GET/POST /members/{id}/measurements`, `PUT /measurements/{id}`,
`GET/POST /members/{id}/notes`, `GET /members/{id}/trainer`, `GET/POST /trainer-alerts`,
`PATCH /trainer-alerts/{id}/status`.

---

### 9.11 Nutrition — Nutrición (`src/modules/nutrition`)

#### Home (`NutritionHomePage`)

MEMBER → `/nutrition/me`; otros roles → `/nutrition/foods`.

#### Catálogo de alimentos (`FoodsPage`)

- AG-Grid: Código, Nombre, Categoría (9), Porción (`{serving} {unit}`), Calorías, Activo, Acciones.
- "Nuevo alimento" y "Desactivar" **solo ADMIN**. Todos pueden editar.
- Dialog: Código (req), Nombre (req), Categoría, Porción (default 100), Unidad, Calorías (req),
  Proteína (req), Carbohidratos (req), Grasa (req).
- CRUD: `POST /foods`, `PUT /foods/{id}`, `DELETE /foods/{id}`.
- Errores `FOOD_IN_USE` al editar un alimento consumido o al desactivarlo.

#### Mi nutrición (`MyNutritionPage`, MEMBER)

`memberId = user.member_id ?? useOwnMemberId()`.

- "Resumen de hoy": 4 tiles (Calorías, Proteína, Carbohidratos, Grasa) + chip de estado calórico
  (Por debajo/Dentro/Por encima de la meta). Botón "Definir meta" → `NutritionGoalDialog`
  (`PUT /members/{id}/nutrition-goal`; tipo de meta, calorías, tolerancia %, peso objetivo).
- "Comidas de hoy": `MealFormDialog` (fecha — solo hoy en edición —, tiempo de comida, ítems con
  `FoodPicker` + cantidad, notas). CRUD: `POST /meals`, `PUT /meals/{id}`, `DELETE /meals/{id}`.
- "Últimos 7 días": tendencia de calorías.
- Errores: `MEMBERSHIP_NOT_ACTIVE`, `VALIDATION_ERROR` (mismo alimento repetido),
  `MEAL_EDIT_WINDOW_CLOSED` (solo mismo día).

#### Nutrición del socio (`MemberNutritionPage`, ADMIN/TRAINER)

- Igual resumen + tendencia; el botón de meta solo lo ve TRAINER (ADMIN read-only).

> **Detalle de implementación:** el filtro de miembros de `GET /meals` se envía como **`memberId`**
> (camelCase) porque el backend liga el nombre literal del parámetro Java; enviar `member_id` no
> filtra nada. `GET /members/{id}/nutrition-summary` es polimórfico: `?date=` devuelve un objeto diario;
> `?from=&to=` devuelve un arreglo por día.

Endpoints: `GET/POST/PUT/DELETE /foods`, `GET/POST/PUT/DELETE /meals`,
`GET/PUT /members/{id}/nutrition-goal`, `GET /members/{id}/nutrition-summary`.

---

### 9.12 Reports — Reportes (`src/modules/reports`, ADMIN)

- Selector de reporte (9 definiciones en `REPORT_DEFINITIONS`) y filtros dinámicos según el reporte.
- `ReportFilters` renderiza solo los filtros requeridos: rango de fechas, agrupar por
  (Sin agrupar/Semana/Mes), plan, entrenador, clase, socio (`MemberPicker`), estado, vence en días,
  tipo de pase, límite.
- `ReportResultsTable`: AG-Grid dinámico (columnas derivadas de la primera fila) con etiquetas
  españolas (`FIELD_LABEL`), formateo de booleanos (Sí/No) y valores nulos ("—").
- Exportación: `EXPORT_FORMATS = ["CSV","XLSX","PDF","PNG"]` (JSON excluido). Cada formato descarga
  un blob vía `GET /reports/{path}?format=...` con `responseType: "blob"`; el nombre del archivo se
  toma del header `Content-Disposition` (fallback `{path}.{format}`).

| Clave | Reporte | Filtros |
|---|---|---|
| `revenue` | Ingresos | fecha, agrupar, plan |
| `memberships` | Membresías por vencer | estado, días |
| `member-distribution` | Distribución de socios | — |
| `class-attendance` | Asistencia a clases | fecha, clase, entrenador |
| `class-demand` | Demanda de clases | fecha |
| `trainer-load` | Carga de entrenadores | — |
| `member-progress` | Progreso de un socio | socio, fecha |
| `guest-passes` | Uso de pases de invitado | fecha, tipo de pase |
| `nutrition-adherence` | Adherencia nutricional | fecha, límite |

Endpoints: `GET /reports/{path}` (JSON y descarga de archivos), `GET /membership-plans`,
`GET /trainers`, `GET /group-classes`, `GET /members`.

---

### 9.13 Notifications — Notificaciones (`src/modules/notifications`)

No existen `hooks.ts`/`services.ts`/`types.ts`: los componentes llaman `apiClient` directamente.

#### `NotificationBell` (AppBar, todos los roles)

- Campana con **Badge de no leídas** (`status !== "READ"`). Al abrir carga `GET /notifications?page=0&size=30`.
- Menú con pestañas "No leídas"/"Leídas" y chips de rango (Hoy/Semana/Todo).
- Clic en fila → la marca como leída (`PATCH /notifications/{id}/status { status: "READ" }`) y abre
  un dialog con el detalle (título, tipo, estado, mensaje, canal).
- Normaliza `snake_case`/`camelCase` del backend.

#### `NotificationsPage` (`/notifications`, todos los roles)

- Chip resumen de pendientes + tiles: Total, Enviadas, Leídas, Fallidas.
- Filtros client-side (Todas/Enviadas/Leídas/Fallidas/Pendientes).
- Filas con icono de estado, título, chips de tipo/estado, mensaje, fecha (`es-GT`) y canal, y acción
  "Marcar como leída".

Tipos (`notificationTypeLabels`): SESSION_RESCHEDULED, CLASS_CANCELLED, WAITLIST_PROMOTED,
MEMBERSHIP_EXPIRING, CHECK_IN.
Estados (`notificationStatusLabels`): PENDING, SENT, FAILED, READ.
Canales: IN_APP, EMAIL.

Endpoints: `GET /notifications`, `PATCH /notifications/{id}/status`.

---

## 10. Enums y etiquetas en español

### 10.1 Socios (members)

- Estado: `ACTIVE` → Activo (success), `INACTIVE` → Inactivo (default), `WITHDRAWN` → Retirado (error).
  Acciones del menú: Reactivar / Suspender / Dar de baja.
- Género: `M` → Masculino, `F` → Femenino, `OTHER` → Otro.
- Tipo de documento: DPI, Pasaporte, NIT.

### 10.2 Personal (employees)

- Estado: `ACTIVE` → Activo, `SUSPENDED` → Suspendido, `TERMINATED` → Terminado.
- Puesto: `ADMIN` → Administrador, `RECEPTIONIST` → Recepcionista, `TRAINER` → Entrenador.

### 10.3 Entrenadores (trainers)

- Especialidad: `WEIGHT_LOSS` → Pérdida de peso, `MUSCLE_GAIN` → Ganancia muscular,
  `REHABILITATION` → Rehabilitación, `FUNCTIONAL` → Funcional, `CARDIO` → Cardio.

### 10.4 Membresías (membership)

- Estado de contrato: `ACTIVE` → Activa (success), `FROZEN` → Congelada (warning/info),
  `EXPIRED` → Vencida (warning), `CANCELLED` → Cancelada (error/default).
- Período de facturación: `MONTHLY` → Mensual, `QUARTERLY` → Trimestral,
  `SEMIANNUAL` → Semestral, `ANNUAL` → Anual.
- Motivo de congelamiento: `TRAVEL` → Viaje, `INJURY` → Lesión, `OTHER` → Otro.
- Motivo de cancelación: `COST` → Costo, `OTHER` → Otro.

### 10.5 Acceso (access)

- Canal de visita: `FRONT_DESK` → Recepción, `SELF_SERVICE` → Autoservicio.
- Tipo de pase: `FREE_TRIAL` → Día de Prueba, `PAID_DAY_PASS` → Pase Pagado,
  `MEMBER_GUEST` → Invitado de Socio.

### 10.6 Clases (classes)

- Disciplina (10): `YOGA` Yoga, `CROSSFIT` CrossFit, `PILATES` Pilates, `HIIT` HIIT, `CARDIO` Cardio,
  `STRENGTH` Fuerza, `FUNCTIONAL` Funcional, `BOXING` Boxeo, `SPINNING` Spinning,
  `MEDITATION` Meditación.
- Nivel: `BEGINNER` → Principiante, `INTERMEDIATE` → Intermedio, `ADVANCED` → Avanzado.
- Día: `MONDAY` Lunes … `SUNDAY` Domingo.
- Estado de sesión: `SCHEDULED` → Programada, `CANCELLED` → Cancelada, `COMPLETED` → Completada,
  `FULL` → Llena.
- Estado de inscripción/espera: `ENROLLED` → Inscrito, `CANCELLED` → Cancelado, `WAITING` → En espera,
  `NOTIFIED` → Notificado, `CONFIRMED` → Confirmado.

### 10.7 Pagos (billing)

- Estado: `REGISTERED` → Registrado (warning), `CONFIRMED` → Confirmado (success),
  `VOIDED` → Anulado (error).
- Concepto: `OTHER` → Otro, `MEMBERSHIP` → Membresía, `GUEST_PASS` → Pase de día.
- Método: `CASH` → Efectivo, `DEBIT_CARD` → Tarjeta débito.
- Tipo de descuento: `PERCENTAGE` → Porcentaje, `FIXED_AMOUNT` → Monto fijo.

### 10.8 Entrenamiento (training)

- Grupo muscular: `CHEST` Pecho, `BACK` Espalda, `LEGS` Piernas, `SHOULDERS` Hombros, `ARMS` Brazos,
  `CORE` Core, `CARDIO` Cardio, `FULL_BODY` Cuerpo completo.
- Estado de rutina: `DRAFT` → Borrador (warning), `PUBLISHED` → Publicada (success),
  `ARCHIVED` → Archivada (default).
- Tipo de observación: `NUTRITION` → Nutrición, `TRAINING` → Entrenamiento, `GENERAL` → General.
- Tipo de alerta: `REASSIGNMENT` → Reasignación, `SPECIAL_ATTENTION` → Atención especial.
- Estado de alerta: `PENDING` → Pendiente (warning), `RESOLVED` → Resuelta (success),
  `DISMISSED` → Descartada (default).
- Motivo de cierre de asignación: `REASSIGNMENT` → Reasignación, `TRAINER_LEFT` → Entrenador dado de
  baja, `PLAN_DOWNGRADE` → Cambio de plan, `MEMBER_REQUEST` → Solicitud del socio.

### 10.9 Nutrición (nutrition)

- Categoría de alimento: `PROTEIN` Proteína, `CARBOHYDRATE` Carbohidrato, `FAT` Grasa,
  `VEGETABLE` Vegetal, `FRUIT` Fruta, `DAIRY` Lácteo, `BEVERAGE` Bebida, `PREPARED` Preparado,
  `OTHER` Otro.
- Unidad: `GRAM` gramos, `MILLILITER` mililitros, `UNIT` unidad.
- Tipo de comida: `BREAKFAST` Desayuno, `LUNCH` Almuerzo, `DINNER` Cena, `SNACK` Merienda / snack.
- Tipo de meta: `WEIGHT_LOSS` Pérdida de peso, `MUSCLE_GAIN` Ganancia muscular, `MAINTENANCE` Mantenimiento.
- Estado calórico: `UNDER` Por debajo de la meta (info), `ACCEPTABLE` Dentro del rango (success),
  `OVER` Por encima de la meta (warning).

---

## 11. Guía de despliegue

1. **Instalar dependencias:**

   ```bash
   npm install
   ```

2. **Configurar entorno:** copiar `.env.example` a `.env.local` y ajustar `VITE_API_BASE_URL`.

3. **Verificar lint y build:**

   ```bash
   npm run lint
   npm run build
   ```

4. **Servir el build de producción:**

   ```bash
   npm run preview
   ```

   O servir la carpeta `dist/` con cualquier servidor estático (Nginx, `npx serve dist`, etc.).
   Como la app usa `createBrowserRouter`, el servidor debe reescribir las rutas desconocidas al
   `index.html` (SPA fallback).

### Consideraciones de rendimiento

- El build emite un único `index.js` de ~2.5 MB (gzip ~750 kB). El warning de Vite sobre chunks
  mayores a 500 kB es esperado; si se requiere, se puede activar *code splitting* con `import()`
  dinámico por módulo.
- El listado de pagos usa cargas de hasta 200 filas y filtra/pagina **client-side**; para volúmenes
  grandes convendría pasar a paginación server-side.

---

## 12. Capturas de pantalla (referencias)

Este manual referencia capturas de pantalla que se colocan en `src/docs/img/`.
Los placeholders usan el formato:

```md
![Descripción](img/nombre-del-archivo.png)
```

Lista de capturas referenciadas en este manual técnico:

- `img/estructura-proyecto.png` — estructura de carpetas.
- `img/login.png` — pantalla de inicio de sesión.
- `img/verify-code.png` — verificación en dos pasos.
- `img/dashboard-admin.png` — panel del administrador.
- `img/reports.png` — pantalla de reportes con exportación.

*(Si una captura aún no existe, la imagen no se mostrará hasta que se coloque el archivo en
`src/docs/img/`.)*