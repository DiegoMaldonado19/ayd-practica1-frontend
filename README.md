# Fitness App — Frontend

Frontend del Sistema de Gestión de Gimnasio (Práctica 1, Análisis y Diseño de Sistemas 1 — USAC CUNOC).
React 19 + TypeScript + Vite, consumiendo el backend Spring Boot en `Backend/Fitness-App` a través de
`/api/v1`.

## Stack

- **React 19** + **TypeScript** + **Vite** (con React Compiler habilitado).
- **MUI (Material UI)** — componentes de interfaz, `@mui/lab` para `LoadingButton`.
- **React Router (`react-router-dom` v7)** — enrutamiento y guardas de ruta.
- **TanStack Query (`@tanstack/react-query`)** — llamadas HTTP como mutaciones/consultas.
- **Axios** — cliente HTTP.
- **React Hook Form + Yup (`@hookform/resolvers`)** — formularios y validación.
- **notistack** — notificaciones tipo *snackbar*.

## Requisitos

- **Node.js 20.19+ o 22+** (el pipeline de CI usa Node 24). Con una versión anterior, `npm run lint`
  falla con `TypeError: util.styleText is not a function`, porque ESLint 10 depende de una API de
  `node:util` que no existe en versiones viejas de Node. Verifica tu versión con `node -v` y actualiza
  (por ejemplo con `nvm install 24 && nvm use 24`) si es necesario.
- El backend (`Backend/Fitness-App`) corriendo en `http://localhost:8080` para que los flujos de
  autenticación funcionen contra datos reales.

## Configuración

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Copiar las variables de entorno:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Descripción |
   |---|---|
   | `VITE_API_BASE_URL` | Raíz del backend, **sin** `/api/v1` (el cliente HTTP lo agrega). Ej: `http://localhost:8080`. |

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Levanta el servidor de desarrollo de Vite. |
| `npm run build` | `tsc -b && vite build` — type-checking y build de producción. |
| `npm run lint` | ESLint sobre todo el proyecto. |
| `npm run preview` | Sirve el build de producción localmente. |

## Estructura del proyecto

```
src/
├── main.tsx                 # Punto de entrada; carga las fuentes de @fontsource/roboto
├── App.tsx                  # Providers: React Query, tema de MUI, notistack, AuthProvider, router
├── router.tsx                # Árbol de rutas de toda la aplicación
├── theme.ts                  # Tema de MUI
│
├── api/
│   ├── client.ts              # Instancia de axios: base URL, interceptor de Bearer token, manejo de 401
│   └── types.ts               # ErrorResponse, Page<T> y helpers para traducir errores del backend
│
├── auth/
│   ├── AuthContext.tsx         # Sesión (usuario, estado), setSession(), logout()
│   ├── ProtectedRoute.tsx      # Guardas de ruta: ProtectedRoute (requiere sesión) y PublicOnlyRoute
│   └── permissions.ts          # Enum de roles y qué módulo puede ver cada rol
│
├── layouts/
│   ├── PublicLayout.tsx        # Layout centrado para las pantallas públicas (login, recuperación)
│   └── AppLayout.tsx           # Layout con barra superior para las pantallas autenticadas
│
└── modules/
    ├── auth/                   # Módulo de autenticación (detalle abajo)
    └── dashboard/               # Panel placeholder; el panel real se construye por rol más adelante
```

Cada módulo de negocio (`auth`, y los que sigan: `members`, `memberships`, `billing`, etc.) sigue la
misma forma interna: `pages/` (una pantalla por ruta), `components/` (propios del módulo), `services.ts`
(llamadas HTTP), `types.ts` (copia literal de los DTO del backend) y, cuando aplica, `schemas.ts`
(validación) y `hooks.ts` (mutaciones/consultas de React Query).

## Rutas

| Ruta | Página | Layout | Acceso |
|---|---|---|---|
| `/login` | `LoginPage` | `PublicLayout` | Solo sin sesión (`PublicOnlyRoute`) |
| `/verify-code` | `VerifyCodePage` | `PublicLayout` | Solo sin sesión. Requiere `challenge_id` en el estado de navegación (llegar por otra vía redirige a `/login`) |
| `/forgot-password` | `ForgotPasswordPage` | `PublicLayout` | Solo sin sesión |
| `/reset-password` | `ResetPasswordPage` | `PublicLayout` | Solo sin sesión. Requiere estado de navegación con el reto de recuperación (si no, redirige a `/forgot-password`) |
| `/` | `DashboardPage` | `AppLayout` | Requiere sesión (`ProtectedRoute`) |
| `*` | — | — | Redirige a `/` |

`ProtectedRoute` acepta opcionalmente `allowedRoles` para restringir una rama de rutas a ciertos roles;
si el rol no alcanza, redirige a `/`. La ocultación en la interfaz es solo cosmética: **el backend es
quien prohíbe de verdad** cada endpoint según el rol.

## Módulo de autenticación (`src/modules/auth`)

Implementado contra los endpoints reales de `iam` (`/auth/*`, `/users/me/*`):

1. **Login** (`POST /auth/login` con `{ username, password }`):
   - `200` → sesión inmediata (`access_token` + perfil del usuario).
   - `202` → el usuario tiene doble factor activo; se navega a `/verify-code` con el `challenge_id`,
     el canal y el destino enmascarado en el estado de la ruta (nunca en la URL ni en `localStorage`,
     para no dejar rastro de un reto vigente).
2. **Verificación de código** (`POST /auth/challenges/{id}/verifications`): canjea el código de 6 dígitos
   por la sesión. Si se llega a la pantalla sin un reto activo, redirige a `/login`.
3. **Recuperar contraseña** (`POST /auth/password-recoveries`): pide el usuario, envía un código y pasa
   a `/reset-password` con el reto de recuperación.
4. **Restablecer contraseña** (`POST /auth/password-resets`): canjea el código junto con la nueva
   contraseña (con confirmación en el formulario) y regresa a `/login`.

`AuthContext` guarda únicamente el `access_token` en `localStorage`. Al montar la aplicación, si hay un
token, se llama a `GET /auth/me` para recuperar el perfil; si el token ya venció, se descarta en
silencio y el usuario cae a `/login`. El interceptor de `axios` en `api/client.ts` limpia el token y
redirige a `/login` ante cualquier `401` que ocurra **con un token ya adjunto** (sesión vencida) — un
`401` en un endpoint público (por ejemplo, credenciales inválidas en el login) no dispara ese redirect:
se deja como error del formulario.

Pendiente, fuera del alcance de esta primera pasada: pantalla de ajustes para cambiar la contraseña
propia (`PUT /users/me/password`) y activar/desactivar el doble factor (`PATCH /users/me/two-factor`).
Los servicios ya existen en `modules/auth/services.ts`; falta la pantalla que los use.
