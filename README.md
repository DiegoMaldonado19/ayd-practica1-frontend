# Fitness App — Frontend

SPA del Sistema de Gestión de Gimnasio (Práctica 1, Análisis y Diseño de Sistemas 1 — USAC CUNOC).
React + TypeScript + Vite, consumiendo el backend Spring Boot de `Backend/Fitness-App` en
`/api/v1`.

**13 módulos de negocio, 52 rutas, 4 roles.** El manual técnico del sistema completo está en
[`Backend/Fitness-App/Docs/Manual-Tecnico.md`](../../Backend/Fitness-App/Docs/Manual-Tecnico.md).

---

## Tecnologías

Versiones resueltas de `package-lock.json`, no los rangos de `package.json`.

| Componente | Versión | Para qué |
|---|---|---|
| React | **19.2.8** | Interfaz. React Compiler habilitado vía Babel |
| TypeScript | **6.0.3** | Tipado. `types.ts` de cada módulo copia los DTOs del backend |
| Vite | **8.2.1** | Servidor de desarrollo y build |
| MUI (Material UI) | **5.18.0** | Componentes. `@mui/lab` para `LoadingButton` |
| Emotion | **11.14** | Motor de estilos de MUI (`sx`) |
| React Router | **7.18.2** | Enrutamiento y guardas por rol |
| TanStack Query | **5.101.4** | Consultas, mutaciones y caché de la API |
| Axios | **1.19.0** | Cliente HTTP con interceptores de token y de 401 |
| React Hook Form | **7.85.0** | Formularios |
| Yup + `@hookform/resolvers` | **1.7.1** / **5.8.0** | Esquemas de validación |
| AG Grid | **36.1.0** | Tablas de listados (socios, empleados, visitas, clases) |
| MUI X Date Pickers | **7.29.4** | Selectores de fecha, con adaptador dayjs y locale `es` |
| dayjs | **1.11.21** | Fechas |
| notistack | **3.0.2** | Notificaciones tipo *snackbar* |
| ESLint | **10.8.1** | Linter, con `typescript-eslint` 8.67 |
| Node.js | **24** en CI | Requiere **20.19+ o 22+** como mínimo |

> Con Node anterior a 20.19, `npm run lint` falla con `TypeError: util.styleText is not a function`:
> ESLint 10 usa una API de `node:util` que no existe en versiones viejas. Verifica con `node -v` y
> actualiza (`nvm install 24 && nvm use 24`).

---

## Desarrollo local

El backend tiene que estar arriba primero: sin él, solo carga la pantalla de login.

```bash
# 1. En Backend/Fitness-App
docker compose up -d --wait          # API en :8080

# 2. Aquí
npm ci
cp .env.example .env.local
npm run dev                          # SPA en :5173
```

Entra con `admin` / `Admin123*` (el administrador sembrado por el backend).

### Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | Raíz del backend, **sin** `/api/v1` (el cliente lo agrega). Ej: `http://localhost:8080` |
| `VITE_USE_POLLING` | Solo para Docker/WSL: fuerza al watcher de Vite a hacer polling. Vacío en local |

### CORS: los dos valores tienen que casar

El SPA y la API viven en **puertos distintos**, así que toda llamada cruza origen. No hay proxy: el
navegador va directo a `:8080`. Si no coinciden, el navegador bloquea la respuesta:

| Repositorio | Variable | Local | En la EC2 |
|---|---|---|---|
| Frontend | `VITE_API_BASE_URL` | `http://localhost:8080` | `http://18.227.211.214:8080` |
| Backend | `CORS_ALLOWED_ORIGINS` | `http://localhost:5173` | `http://18.227.211.214:5173` |

### Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo de Vite |
| `npm run build` | `tsc -b && vite build` — type-check y build de producción |
| `npm run lint` | ESLint sobre todo el proyecto |
| `npm run preview` | Sirve el build de producción localmente |

CI corre `npm ci`, `npm run lint` y `npm run build` en cada push, así que los tres tienen que pasar
antes de abrir un PR.

---

## Gitflow

Idéntico al del backend. Tres niveles de rama, sin commits directos a las dos protegidas:

```
                    PR                     PR
rama de trabajo  ──────▶   stage   ───────────▶   main
(sale de stage)          (integración)          (producción)
```

1. **`main`** — lo desplegado. Solo entra por PR desde `stage`.
2. **`stage`** — integración. Solo entra por PR desde una rama de trabajo.
3. **Ramas de trabajo** — se crean **desde `stage`**, nunca desde `main`.

Nombres tal como aparecen en el historial: `feature/<tema>` (`feature/billing`, `feature/classes`,
`feature/directory-members`) y `dmaldonado/<tema>` (`dmaldonado/final-audit`).

```bash
git checkout stage && git pull origin stage
git checkout -b feature/<tema>
# ...trabajo...
git push -u origin feature/<tema>     # abre PR contra stage
```

| Rama | `build` (lint + tsc + vite) | `docker-push` | `deploy` |
|---|:--:|:--:|:--:|
| rama de trabajo | sí | no | no |
| `stage` | sí | no | no |
| `main` | sí | sí | sí |

---

## Estructura

Arquitectura **por feature**: cada módulo de negocio es autocontenido y sigue siempre el mismo
contrato interno. Lo transversal vive fuera de `src/modules/`.

```
src/
├── main.tsx                  punto de entrada; carga las fuentes de @fontsource/roboto
├── App.tsx                   providers: React Query, tema MUI, notistack, AuthProvider, router
├── router.tsx                las 52 rutas y sus guardas por rol
├── theme.ts                  tema de MUI
│
├── api/
│   ├── client.ts             instancia de axios: baseURL, Bearer token, manejo de 401
│   └── types.ts              Page<T>, ErrorResponse, getErrorMessage(), getErrorCode()
│
├── auth/
│   ├── AuthContext.tsx       sesión (usuario, token), setSession(), logout()
│   ├── useAuth.ts            hook de acceso a la sesión
│   ├── ProtectedRoute.tsx    ProtectedRoute (requiere sesión + roles) y PublicOnlyRoute
│   └── permissions.ts        ROLES, ROLE_LABEL, hasAnyRole(), MODULE_ACCESS, canAccessModule()
│
├── layouts/                  AppLayout (barra + Sidebar + UserMenu), PublicLayout
├── components/               AppDatePicker, SimpleBarChart, TrendLineChart
│
└── modules/                  13 módulos de negocio
    ├── auth            login, verificación 2FA, recuperación, seguridad de la cuenta, perfil
    ├── dashboard       panel por rol: AdminPanel, ReceptionistPanel, TrainerPanel, MemberPanel
    ├── members         alta, edición, detalle y estado de socios
    ├── employees       alta, edición, detalle y estado de empleados
    ├── trainers        listado, carga máxima, especialidades, transferencia de cartera
    ├── membership      planes y beneficios, contratación, congelamiento, renovación, cancelación
    ├── billing         pagos, confirmación, anulación, comprobantes, promociones
    ├── access          check-in / check-out y pases de invitado
    ├── classes         cartelera, clases, sesiones, inscripción, lista de espera, asistencia
    ├── training        asignaciones, rutinas, mediciones de progreso, notas, alertas, ejercicios
    ├── nutrition       catálogo de alimentos, registro de comidas, meta calórica, resumen
    ├── reports         los 9 reportes y su exportación a CSV/XLSX/PDF/PNG
    └── notifications   campana e inbox
```

### Contrato interno de un módulo

Siempre los mismos archivos, en el mismo orden de dependencia:

```
services.ts   → llamadas HTTP con apiClient. Una función por endpoint, sin lógica
hooks.ts      → useQuery / useMutation sobre services.ts. Aquí viven los snackbars
                y las invalidaciones de caché
types.ts      → copia literal de los DTOs del backend, en snake_case
*Schema.ts    → esquemas de Yup (cuando el módulo tiene formularios)
pages/        → una pantalla por ruta
components/   → componentes propios del módulo
```

Una pantalla nunca llama a `apiClient` directamente: pasa por `hooks.ts`, que pasa por
`services.ts`. Así el manejo de error y la invalidación de caché quedan en un solo lugar por
operación.

---

## Convenciones

- **Idioma**: código, nombres de archivo, componentes y comentarios en inglés. Los textos de la
  interfaz y la documentación, en español.
- **Alias `@/`** apunta a `src/`. Los imports entre módulos siempre lo usan; dentro de un módulo se
  permite el relativo (`./types`).
- **`types.ts` copia el DTO del backend tal cual**, en `snake_case`. No se renombra a camelCase: lo
  que se ve en el tipo es lo que viaja por la red, y eso hace que un desajuste salte al leer.
- **Las guardas de ruta son cosméticas.** `ProtectedRoute` y `MODULE_ACCESS` deciden qué se muestra;
  **quien prohíbe de verdad es el backend**, que responde 403 por rol y valida además la propiedad
  de la fila. Ocultar un botón es UX, no seguridad — pero **una pantalla nunca debe montar una
  consulta que su rol no puede hacer**: eso produce un 403 silencioso. Para eso los hooks
  compartidos aceptan `enabled` (ver `useClassSessionEnrollments`, `useMembers`).
- **Responsividad con breakpoints de MUI** (`sx={{ px: { xs: 2, md: 4 } }}`, props `xs`/`sm`/`md` de
  `Grid`). No hay CSS propio más allá de `index.css`, ni media queries a mano.
- **Los errores del backend se muestran con `getErrorMessage(error, fallback)`** de `@/api/types`,
  que extrae el `message` del `ErrorResponse`. Nunca un texto genérico si el servidor explicó el
  motivo.
- **Formularios**: React Hook Form + resolver de Yup, con el esquema en `<algo>FormSchema.ts`.

---

## Dependencias

| Dependencia | Rol |
|---|---|
| **react / react-dom** | Base de la interfaz |
| **react-router-dom** | Las 52 rutas, layouts anidados y guardas por rol |
| **@tanstack/react-query** | Estado del servidor: caché, invalidación, `isPending` de cada mutación |
| **axios** | Cliente HTTP. Un interceptor agrega el Bearer; otro limpia la sesión ante un 401 con token |
| **@mui/material + @mui/icons-material + @mui/lab** | Todo el sistema de componentes |
| **@emotion/react + @emotion/styled** | Motor de estilos que MUI 5 requiere |
| **@mui/x-date-pickers + dayjs** | Selectores de fecha en español |
| **ag-grid-community + ag-grid-react** | Tablas con paginación y filtros de los listados grandes |
| **react-hook-form + @hookform/resolvers + yup** | Formularios y validación |
| **notistack** | Snackbars de éxito y error de las mutaciones |
| **@fontsource/roboto** | Fuente servida localmente, sin pedirla a Google |
| **babel-plugin-react-compiler** | React Compiler: memoización automática en build |

---

## Autenticación

1. **Login** (`POST /auth/login`):
   - `200` → sesión inmediata (`access_token` + perfil).
   - `202` → la cuenta tiene doble factor; se navega a `/verify-code` con el `challenge_id`, el
     canal y el destino enmascarado **en el estado de la ruta**, nunca en la URL ni en
     `localStorage`.
2. **Verificación** (`POST /auth/challenges/{id}/verifications`): canjea el código de 6 dígitos por
   la sesión. Llegar a esa pantalla sin reto activo redirige a `/login`.
3. **Recuperación** (`POST /auth/password-recoveries` → `POST /auth/password-resets`).

`AuthContext` guarda **solo el token** en `localStorage` (`fitness_app.access_token`). Al montar la
aplicación, si hay token, llama a `GET /auth/me` para recuperar el perfil; si venció, lo descarta en
silencio y cae a `/login`.

El perfil incluye `member_id` cuando la cuenta es de un socio — lo emiten el login, el canje del
reto y `/auth/me`. Las pantallas "mías" (`/nutrition/me`, `/training/me`, `/payments/me`) se apoyan
en él.

El interceptor de `api/client.ts` limpia el token y redirige a `/login` ante un `401` **que ocurrió
con un token ya adjunto** (sesión vencida). Un `401` en un endpoint público —credenciales malas en
el login— no dispara el redirect: se muestra como error del formulario.

---

## Despliegue

`docker-push` y `deploy` solo corren en `main`. El paso de despliegue entra por SSH a la EC2, hace
`git pull`, **escribe el `.env` del servidor** con `VITE_API_BASE_URL=http://<SERVER_HOST>:8080`,
levanta compose y verifica con un `curl` a `:5173`.

Secretos que consume: `EC2_SSH_KEY`, `SERVER_USER`, `SERVER_HOST`, `REPO_PATH` y `DOCKER_HUB_TOKEN`.

> El contenedor sirve el **servidor de desarrollo de Vite**, no un build estático detrás de nginx.
> Es una decisión consciente y está explicada en el Manual Técnico, sección 8.
