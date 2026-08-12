# Bitácora del proyecto — Sistema de Gestión de Gimnasio (Práctica 1, AyD1)

> Documento de referencia completo: contexto del proyecto, decisiones tomadas, estado actual del frontend, lecciones aprendidas y guía paso a paso para continuar. Pensado para que cualquiera del equipo (o cualquier IA que retome esta conversación) tenga todo el panorama sin tener que releer el chat completo.

---

## 1. Contexto general del proyecto

**Curso:** Análisis y Diseño de Sistemas 1, CUNOC-USAC, segundo semestre 2026.
**Entrega:** lunes 17 de agosto de 2026. Componentes a entregar: código fuente, manual técnico, manual de usuario.
**Equipo:** 4 personas.
- **Backend:** Diego (líder técnico, definió arquitectura, CI/CD, y está construyendo `iam`, `directory`, `membership`, `access`, `classes`, `notification`, y ahora `reports`/`dashboard`) y Kevin (construyendo `billing`, `training`, `nutrition`).
- **Frontend:** Miguel (construyó el flujo base: `auth`, layouts, router, dashboard esqueleto) y **fer** (tú, la persona con quien he trabajado en este chat — construiste `members`, `employees`, `trainers`).

**Repos:**
- Backend: `ayd-practica1-backend` (Diego Maldonado, GitHub)
- Frontend: `ayd-practica1-frontend` (mismo owner)

**Ramas del frontend:** `main` (producción, dispara deploy automático a EC2 en cada merge), `stage` (integración, donde se juntan los features antes de ir a `main`), y ramas `feature/*` por persona/módulo (ejemplo: `feature/directory-members`, que ya se subió y tuvo su PR hacia `stage`).

**Infraestructura compartida (EC2):**
- IP: `18.227.211.214`
- Frontend: `http://18.227.211.214:5173`
- Backend: `http://18.227.211.214:8080`
- CI/CD: cada merge a `main` publica automáticamente.

---

## 2. El sistema que se está construyendo

Un sistema de gestión de gimnasio con estos roles: **Administrador**, **Recepcionista**, **Entrenador**, **Socio**. Módulos funcionales según el enunciado:

1. **Administración de socios y membresías** — altas, planes (Básico/Premium/Élite), estados (Activa/Congelada/Vencida/Cancelada).
2. **Gestión de personal** — empleados, entrenadores (especialidades, carga máxima de socios, asignación/transferencia de cartera).
3. **Clases grupales** — inscripción, cupo, lista de espera con prioridad por plan.
4. **Check-in / control de acceso** — asistencia, pases de invitado.
5. **Módulo de nutrición** — registro de comidas, meta calórica (pendiente, lo hace Kevin en backend).
6. **Entrenamiento personal** — rutinas, progreso físico (pendiente, Kevin).
7. **Pagos y promociones** — billing (pendiente, Kevin).
8. **Reportes y dashboard** — (pendiente, Diego).
9. **Autenticación** — login, 2FA por correo, recuperación de contraseña (listo, lo hizo Miguel).

Los tres planes de membresía (Básico/Premium/Élite) y sus beneficios, los estados de membresía, y las reglas de negocio completas están documentadas en el PDF del enunciado (`Practica_1_AyD1_-_Sistema_de_Gestión_de_Gimnasio.pdf`) y en `04-Base-de-Datos.md`.

---

## 3. Documentos de referencia que existen y para qué sirve cada uno

Todos viven en las raíces de ambos repos o fueron compartidos por el equipo. **Un asistente que retome este proyecto debe revisarlos en este orden antes de tocar código:**

| Archivo | Contenido | Cuándo consultarlo |
|---|---|---|
| `Practica_1_AyD1_-_Sistema_de_Gestión_de_Gimnasio.pdf` | Enunciado oficial de la práctica, reglas de negocio completas por rol | Para entender el *qué* y el *por qué* de cualquier regla de validación |
| `01-Refinamiento-Arquitectura.md` | Estructura de paquetes backend y frontend, convenciones de código, checklist de archivos base del frontend (`api/client.ts`, `AuthContext`, etc.) | Antes de crear cualquier archivo nuevo, para seguir la convención |
| `02-Modulos.md` | Los 10 módulos del backend, dependencias entre ellos, matriz de trazabilidad, reparto sugerido de trabajo | Para saber qué módulo depende de cuál y decidir el orden de construcción |
| `03-API-REST.md` | Índice de endpoints por módulo (aunque **no siempre coincide 100% con la implementación real** — ver sección 6) | Como punto de partida, nunca como fuente única de verdad |
| `04-Base-de-Datos.md` | Modelo de datos explicado en prosa | Para entender relaciones entre entidades |
| `schema.sql` | DDL real de PostgreSQL: todas las tablas, columnas, constraints (`CHECK`), enums | **Fuente de verdad para nombres de columnas y valores válidos de enum** (ej. especialidades de entrenador, estados de empleado) |
| `data.sql` | Datos semilla: catálogos (planes, ejercicios, alimentos, promociones) y el usuario admin bootstrap | Para saber qué datos ya existen sin tener que crearlos |
| `FRONTEND_BACKEND_OVERVIEW.md` / `FRONTEND_BACKEND_OVERVIEW_1.md` | Guía en prosa de la estructura del backend, pensada para quien hace frontend | Para orientarse la primera vez, nivel introductorio |
| `EXPLICACION.MD` | Estructura básica del proyecto frontend (Vite + React + TS) tal como lo dejó Miguel al inicio | Contexto histórico, ya superado por el código real |
| `RESUMEN_CAMBIOS.md` | Resumen de lo que Miguel agregó (auth, rutas, layouts, dashboard) | Contexto histórico |
| **`Fitness-App_postman_collection.json`** | Colección de Postman con **requests reales, bodies reales, respuestas guardadas y test scripts** contra el backend | **ESTA es la fuente de verdad más confiable para contratos de API** — ver sección 6 |
| `MemberController.java` (y controllers equivalentes) | Código real del backend | Cuando hay duda sobre qué parámetros acepta un endpoint o qué rol lo protege |

---

## 4. Stack técnico exacto (confirmado, no asumido)

### Backend
- Java + Spring Boot 4.1.0, Spring Security, Spring Data JPA, Hibernate 7.4.1
- PostgreSQL 17 (contenedor `fitness_postgres`)
- JWT para autenticación, roles `ADMIN`, `RECEPTIONIST`, `TRAINER`, `MEMBER`
- Documentación viva en Swagger: `http://localhost:8080/swagger-ui.html`
- **Naming strategy SNAKE_CASE configurada en `application.yml`** — todo el JSON real (requests y responses) usa `snake_case`. Ver sección 6, es importante.
- Arranca con `docker compose up -d --wait` (Postgres + backend en contenedores) o con `mvn spring-boot:run` si solo Postgres está en Docker.
- Base URL: `http://localhost:8080/api/v1`

### Frontend
- React 19 + TypeScript + Vite 8
- **MUI v5** (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`) — sistema de diseño principal
- **`ag-grid-react` v36.1.0 + `ag-grid-community` v36.1.0** (alineadas exactamente, ver sección 7) — para todas las tablas de datos grandes/paginadas
- **`@tanstack/react-query`** — toda llamada a la API pasa por un hook de react-query (`useQuery`/`useMutation`), nunca `fetch` o `axios` directo en un componente
- **`react-hook-form` + `yup` + `@hookform/resolvers`** — todos los formularios
- **`axios`** — cliente HTTP, instancia única en `src/api/client.ts`
- **`notistack`** — toda notificación de éxito/error, nunca `alert()`
- **`react-router-dom` v7** — con `createBrowserRouter` y rutas anidadas
- Alias de import: **`@/`** apunta a `src/` (configurado en `tsconfig.app.json` y `vite.config.ts`)
- Theme en `src/theme.ts`: color primario morado `#aa3bff`, `borderRadius: 8`

---

## 5. Cómo levantar todo el ambiente, paso a paso

### 5.1 Backend
```bash
cd ayd-practica1-backend
# necesitas un .env con las credenciales de Postgres, JWT_SECRET, y
# opcionalmente MAIL_USERNAME/MAIL_PASSWORD para que el 2FA mande correos reales
docker compose up -d --wait
docker ps   # confirma que fitness_postgres Y fitness_backend estén "Up", no "Restarting"
```
Si `fitness_backend` queda en loop de reinicio, revisa los logs:
```bash
docker logs fitness_backend --tail 100
```
Causa más común: contraseña de Postgres desincronizada entre el `.env` actual y la que se usó la primera vez que se creó el volumen. Solución:
```bash
docker compose down -v   # borra el volumen, se recrea desde cero con el .env actual
docker compose up -d --wait
```

**Usuario admin de arranque (ya activado por el equipo):** `admin` / `Admin123*`.

### 5.2 Frontend
```bash
cd ayd-practica1-frontend
npm install
```
Crea `.env` en la raíz (no viene en el repo, cada quien lo crea local):
```
VITE_API_BASE_URL=http://localhost:8080
```
(Sin `/api/v1` al final — el cliente axios ya lo agrega.)
```bash
npm run dev
```
App en `http://localhost:5173`.

### 5.3 Probar el backend sin frontend (Postman)
1. Importa `Fitness-App_postman_collection.json` en Postman.
2. Corre **Auth → Login** primero — el script post-response guarda el `access_token` automáticamente en una variable de colección; el resto de peticiones ya lo usan solas.
3. Explora cualquier módulo desde su carpeta antes de programar la pantalla — así conoces la forma real de los datos antes de escribir `types.ts`.

---

## 6. LECCIÓN CRÍTICA: cómo verificar contratos de API (léase antes de crear cualquier `types.ts` nuevo)

Este fue el error más costoso de todo el proceso y **no debe repetirse**:

**El "Example Value" del panel de Swagger UI NO es confiable para nombres de campo.** Ese panel genera el JSON de ejemplo leyendo los campos de la clase Java por reflexión (`memberId`, `documentType`, camelCase), **sin pasar por el serializador Jackson real**, que sí aplica la estrategia `SNAKE_CASE` configurada en `application.yml`. Confiar en ese panel llevó a re-escribir `types.ts` completo en camelCase por error, cuando el backend real siempre respondió en `snake_case`.

**Procedimiento correcto y obligatorio para cualquier endpoint nuevo, en este orden:**

1. Busca el request correspondiente en `Fitness-App_postman_collection.json` (usando `grep`/`python -c "import json..."` sobre el archivo, no a simple vista si es grande).
2. Lee el **`body` real** del request (`request.body.raw`) — eso es el contrato de entrada real, probado.
3. Lee los **test scripts** (`event[].script.exec` donde `listen === "test"`) — casi siempre hacen `pm.expect(body.campo_exacto)`, y eso confirma el nombre real de cada campo de la respuesta.
4. Si hay **respuestas guardadas** (`response[].body`), son oro puro: son ejecuciones reales contra el backend, no ejemplos.
5. Si algo no está cubierto ni en el body ni en los tests, **no lo inventes** — dispara la petición tú mismo en Postman/Swagger con "Execute"/"Send" real (no solo mires el schema) y confirma, o revisa el `.java` del controller/DTO si está disponible.
6. Cruza contra `schema.sql` para nombres de columnas y valores de `CHECK`/enum — es la fuente de verdad definitiva para qué valores son válidos (ejemplo: las especialidades de entrenador son exactamente `WEIGHT_LOSS, MUSCLE_GAIN, REHABILITATION, FUNCTIONAL, CARDIO`, confirmado ahí, no en los ejemplos parciales de Postman).

**Regla de oro:** Postman con datos reales > código del controller/DTO Java > `schema.sql` > documentación en markdown > Swagger "Example Value" (el menos confiable de todos).

---

## 7. Otro problema resuelto que vale la pena documentar: versiones de `ag-grid`

Al instalar `ag-grid-community` suelto (sin fijar versión) quedaron **dos versiones distintas conviviendo**: `ag-grid-community@36.1.0` (top-level) y `ag-grid-community@32.3.9` (anidada dentro de `ag-grid-react@32.3.9`, que ya venía en el `package.json` original). Esto producía el error de React `Element type is invalid: ... got: object`.

**Solución aplicada:** desinstalar ambos paquetes y reinstalarlos fijando la **misma versión exacta** para los dos:
```bash
npm uninstall ag-grid-community ag-grid-react
npm install ag-grid-community@36.1.0 ag-grid-react@36.1.0
```
No se puede bajar a la v32 porque su peer dependency pide React 16/17/18, y el proyecto usa **React 19** (soporte oficial de AG Grid a React 19 llegó en su v33+).

**Cambio de API importante en AG Grid v33+:** ya no se usa `import "ag-grid-community/styles/ag-theme-material.css"` + `className="ag-theme-material"`. Ahora es la **Theming API**:
```tsx
import { ModuleRegistry, AllCommunityModule, themeMaterial } from "ag-grid-community";
ModuleRegistry.registerModules([AllCommunityModule]); // obligatorio desde v31+, o AgGridReact no renderiza nada

<AgGridReact theme={themeMaterial} ... />
```
Este patrón ya quedó establecido y debe copiarse igual en cualquier pantalla nueva que use ag-grid (por ejemplo, la futura tabla de `classes`).

**Nota aparte resuelta:** `import AddIcon from "@mui/icons-material/Add"` causó el mismo error de "object" en un componente — se quitó el ícono como solución rápida. Pendiente investigar si es un choque de versión entre `@mui/icons-material` y `@mui/material`, no bloqueante.

---

## 8. Estado actual del frontend, módulo por módulo

### ✅ `auth` (Miguel) — completo y funcionando
- `src/auth/` — `AuthContext`, `ProtectedRoute.tsx` (soporta `allowedRoles?: Role[]`), `PublicOnlyRoute`, `useAuth`, `permissions.ts` (`hasAnyRole`)
- `src/modules/auth/` — Login, VerifyCode (2FA), ForgotPassword, ResetPassword
- `src/api/client.ts` — instancia axios (`apiClient`), maneja token en `localStorage`, interceptor que redirige a `/login` en 401 real de sesión
- `src/api/types.tsx` — `Page<T>` (paginación estándar), `ErrorResponse`, `getErrorResponse`/`getErrorMessage`/`getErrorCode` — **todo en snake_case, confirmado correcto**
- `src/router.tsx`, `src/layouts/AppLayout.tsx`, `src/layouts/PublicLayout.tsx`

### ✅ `members` / directory (fer) — completo, ya con PR mergeado a `stage`
Carpeta `src/modules/members/`:
- `types.ts` — `Member`, `PersonDTO` (anidado), `CreateMemberDTO`, `UpdateMemberDTO`, `MemberListParams`
- `services.ts` — `getMembers`, `getMemberById`, `createMember`, `updateMember`, `updateMemberStatus`
- `hooks.ts` — `useMembers`, `useMember`, `useCreateMember`, `useUpdateMember`, `useUpdateMemberStatus`
- `pages/MembersListPage.tsx` — listado con ag-grid, búsqueda, filtro por estado, paginación
- `pages/MemberFormPage.tsx` — alta y edición (mismo componente, detecta `:memberId` en la URL)
- `pages/MemberDetailPage.tsx` — ficha completa, botón dar de baja/reactivar

**Endpoints usados:** `GET/POST /members`, `GET/PUT /members/{id}`, `PATCH /members/{id}/status`.
**Pendiente de confirmar:** valores válidos exactos de `gender` (se usó `M/F/OTHER` sin confirmación 100% en `schema.sql`), y si el ciclo `ACTIVE ↔ WITHDRAWN` vía `PATCH /status` acepta ambas direcciones sin restricción.

### ✅ `employees` (fer) — completo, construido, pendiente probar a fondo y subir a git
Carpeta `src/modules/employees/`: mismo patrón que `members` (`types.ts`, `services.ts`, `hooks.ts`, `pages/EmployeesListPage.tsx`, `EmployeeFormPage.tsx`, `EmployeeDetailPage.tsx`).
- El alta de empleado (`POST /employees`) sirve para los 3 puestos (`ADMIN`, `RECEPTIONIST`, `TRAINER`); si el puesto es `TRAINER`, el formulario muestra campos extra (`max_member_load`, `bio`) y el backend automáticamente crea también el perfil de entrenador (`trainer_id` viene en la respuesta).
- Estados: `ACTIVE | SUSPENDED | TERMINATED` (confirmado en `schema.sql`).

**Pendiente de confirmar:** si `/employees` de verdad está restringido solo a `ADMIN` en `SecurityConfig.java` (se asumió por lo que dice `FRONTEND_BACKEND_OVERVIEW.md`, no se verificó línea por línea en el Java).

### ✅ `trainers` (fer) — completo en lo básico, con una parte pendiente
Carpeta `src/modules/trainers/`: `types.ts`, `services.ts`, `hooks.ts`, `pages/TrainersListPage.tsx` (filtro por especialidad), `pages/TrainerDetailPage.tsx` (edición inline de carga máxima y especialidades vía `Autocomplete`).
- Especialidades confirmadas en `schema.sql`: `WEIGHT_LOSS, MUSCLE_GAIN, REHABILITATION, FUNCTIONAL, CARDIO`.
- `PUT /trainers/{id}/specialties` **reemplaza** la lista completa, no la agrega — confirmado con test scripts de Postman.

**Pendiente / no construido todavía:**
- Pantalla de **"Transferir cartera"** (`POST /trainers/{id}/member-transfers`) — reasignar todos los socios de un entrenador a otro. Es una pantalla más compleja (necesita elegir entrenador destino y mostrar impacto), se dejó pendiente a propósito.
- Campos `bio`, `active`, `employee_id` en el tipo `Trainer` están marcados como "sin confirmar" — no aparecieron en los test scripts revisados, falta ejecutar `GET /trainers/{id}` en Postman y verificar.
- Endpoints de asignación de entrenador a un socio (`POST/GET /members/{id}/trainer`) — vistos en la colección de Postman pero **no construidos todavía en el frontend**. Estos conceptualmente podrían vivir en `trainers` o en `members`, hay que decidirlo con el equipo.

### ⏳ No empezado todavía (backend ya listo, frontend pendiente)
- **`membership`** — planes de membresía, contratación, congelar/renovar/cancelar. Depende de `members` (ya existe). Buen siguiente candidato.
- **`access`** — check-in/check-out, pases de invitado. No depende de nada más que `members`.
- **`classes`** — cartelera de clases grupales, inscripción, lista de espera con prioridad por plan. Depende de `trainers` (ya existe) y `membership` (para validar el beneficio del plan).
- **`notification`** — centro de notificaciones, solo 2 endpoints, módulo chico.

### ⏳ Backend todavía no listo (esperar antes de construir frontend)
- `billing` (Kevin) — pagos, promociones.
- `training` (Kevin) — rutinas, progreso físico.
- `nutrition` (Kevin) — registro de comidas, meta calórica.
- `reports` / `dashboard` (Diego) — reportes y panel principal con gráficas. Depende de que los demás módulos tengan datos reales.

---

## 9. Convenciones establecidas (seguir igual en todo módulo nuevo)

1. **Estructura de carpeta por módulo**, siempre bajo `src/modules/<nombre>/`:
   ```
   types.ts       -> interfaces TS, DTOs, enums, confirmados contra Postman/schema.sql
   services.ts    -> funciones async que llaman apiClient.get/post/put/patch, sin lógica de UI
   hooks.ts       -> useQuery/useMutation envolviendo services.ts, con notistack en onSuccess/onError
   pages/         -> un archivo .tsx por pantalla completa (ListPage, FormPage, DetailPage)
   components/    -> piezas reutilizables dentro del módulo, si aplica
   ```
2. **Imports con alias `@/`**, nunca rutas relativas largas (`../../..`).
3. **Named exports** para páginas y componentes (`export function XPage()`), no `export default`, para combinar con el estilo de Miguel.
4. **Todo el JSON en `snake_case`** — confirmado en toda la app, no solo en `members`.
5. **`person` siempre anidado** en los DTOs de `member`/`employee`, nunca aplanado.
6. **Paginación:** siempre usar el `Page<T>` compartido de `src/api/types.tsx`, nunca redefinir una envoltura de paginación propia por módulo.
7. **Errores:** siempre `getErrorMessage(error)` de `src/api/types.tsx` dentro del `onError` de las mutations — nunca mensajes de error hardcodeados ni `error.message` genérico de axios.
8. **Rutas protegidas por rol:** envolver el bloque de rutas del módulo con
   ```tsx
   { element: <ProtectedRoute allowedRoles={["ADMIN", "RECEPTIONIST"]} />, children: [...] }
   ```
   dentro del árbol ya autenticado (`<ProtectedRoute />` sin roles → `<AppLayout />` → aquí).
9. **Tablas grandes/paginadas:** `ag-grid-react` con el patrón de theming ya establecido (sección 7). Tablas cortas o de solo lectura dentro de un detalle: `MUI Table` normal.
10. **Formularios:** `react-hook-form` + `yup` + `Controller` de MUI, nunca `useState` suelto por campo.
11. **Toda mutación** muestra un snackbar de éxito/error vía `notistack`, nunca `alert()`.
12. **Git:** nunca commitear directo a `stage` ni a `main`. Rama `feature/<módulo>` desde `stage` actualizado, PR de vuelta a `stage` (nunca a `main` directo), pedir review antes de mergear.

---

## 10. Instrucciones para quien continúe este proceso (persona o IA)

Si estás retomando este proyecto sin haber visto la conversación completa, sigue este procedimiento exacto para cada módulo nuevo que se pida construir:

### Paso 1 — Entender el módulo antes de escribir código
- Lee la sección correspondiente en `02-Modulos.md` (qué hace, de qué depende) y en el PDF del enunciado (reglas de negocio).
- Revisa `04-Base-de-Datos.md` y `schema.sql` para las tablas involucradas: columnas exactas, `CHECK` constraints (esos son tus enums de TypeScript), foreign keys (esas son tus relaciones anidadas o no en el DTO).

### Paso 2 — Confirmar el contrato real de la API (NO SALTARSE ESTO)
- Busca en `Fitness-App_postman_collection.json` los requests del módulo (usa Python/`grep`, el archivo es demasiado grande para leer a simple vista).
- Extrae `request.body.raw` de cada request relevante (alta, actualización).
- Extrae los `event[].script.exec` (tests) de cada uno — ahí están los nombres de campo reales de la respuesta.
- Si algo no está cubierto, pide a la persona que ejecute la petición en Postman/Swagger con datos reales (no el "Example Value" del schema) y comparta el resultado.
- **Nunca asumas camelCase ni snake_case sin evidencia — este proyecto ya demostró que Swagger engaña en esto.**

### Paso 3 — Construir en el orden ya establecido
1. `types.ts` (con comentarios `// Confirmado con...` citando la fuente exacta de cada campo, igual que se hizo en `members`)
2. `services.ts`
3. `hooks.ts`
4. Pantallas (`pages/`), reusando componentes ya escritos en otros módulos si aplica (por ejemplo, un futuro `MemberPicker` reutilizable para `classes`/`access` que ya necesitan buscar un socio)
5. Rutas en `router.tsx`, con el `allowedRoles` correcto según el enunciado/`SecurityConfig.java`

### Paso 4 — Verificar antes de dar por terminado
- Probar el flujo completo en el navegador con datos reales (crear varios registros de prueba vía Postman si hace falta para poblar listados).
- Correr `npm run lint` y `npm run build` antes de cualquier commit.
- Señalar explícitamente a la persona cualquier suposición que quedó sin confirmar al 100% (como se hizo con `gender` o los campos de `Trainer`), en vez de darla por buena silenciosamente.

### Paso 5 — Git
- Confirmar en qué rama está la persona (`git status`) antes de cualquier cosa.
- Nueva rama desde `stage` actualizado: `git checkout stage && git pull && git checkout -b feature/<nombre-del-módulo>`.
- Commits con mensajes descriptivos en español o inglés consistente con el resto del equipo.
- Push y PR hacia `stage`, nunca hacia `main`.

### Filosofía general a mantener
- **No adivinar cuando se puede verificar.** Este proyecto ya tuvo un incidente real donde una suposición sin verificar (el ejemplo de Swagger) causó reescribir código de más — la lección quedó documentada en la sección 6 y no debe repetirse.
- **Explicar el porqué, no solo el qué**, sobre todo si quien pregunta está aprendiendo (la persona de este chat es estudiante y ha pedido explicaciones detalladas de cada paso, no solo comandos).
- **Ir despacio y en pasos verificables** cuando se trata de infraestructura (Docker, variables de entorno, versiones de paquetes) — en este proyecto varios errores (contraseña de Postgres desincronizada, versiones de `ag-grid` mezcladas) se resolvieron pidiendo evidencia (`docker ps`, `npm ls`, logs) antes de aplicar arreglos, en vez de adivinar a la primera.
- **Repartir el trabajo pensando en dependencias de negocio, no en quién "hizo primero" su parte** — el criterio usado fue: qué módulo no depende de nada más (arrancar por ahí) y qué puede avanzar en paralelo sin bloquear a nadie, porque el backend ya expone todos los endpoints necesarios de una vez.

---

## 11. Checklist rápido de lo que falta para la entrega (17 de agosto)

- [ ] Confirmar restricción de rol real en `/employees` contra `SecurityConfig.java`
- [ ] Completar tipo `Trainer` (bio, active, employee_id) con evidencia real de Postman
- [ ] Construir pantalla de transferencia de cartera de entrenador
- [ ] Construir pantalla(s) de asignación de entrenador a socio (`/members/{id}/trainer`)
- [ ] Módulo `membership` (planes, contratación, congelar/renovar/cancelar)
- [ ] Módulo `access` (check-in/check-out, pases de invitado)
- [ ] Módulo `classes` (cartelera, inscripción, lista de espera)
- [ ] Módulo `notification`
- [ ] Esperar y construir `billing`, `training`, `nutrition` cuando Kevin los suba a `main`
- [ ] Esperar y construir `reports`/`dashboard` cuando Diego los suba
- [ ] Manual técnico
- [ ] Manual de usuario
- [ ] Revisión final de estilos/UX de todas las pantallas para que se vean consistentes (mismo theme, mismos patrones de tabla/formulario/detalle)
