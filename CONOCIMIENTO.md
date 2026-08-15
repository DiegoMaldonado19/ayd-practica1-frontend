# CONOCIMIENTO — Práctica1 Frontend

> Documento consolidado con todo el conocimiento, decisiones, estructura y seguimiento del proyecto `ayd-practica1-frontend`.

## 1. Resumen general

Este repositorio es el frontend del Sistema de Gestión de Gimnasio construido para la Práctica 1 de Análisis y Diseño de Sistemas 1 (CUNOC-USAC). Está hecho con React 19, TypeScript y Vite, con MUI como sistema de diseño y varias librerías para soporte de formularios, peticiones, tablas y manejo de estado.

El objetivo de este documento es consolidar toda la información presente en otros `.md` del proyecto (`EXPLICACION.MD`, `RESUMEN_CAMBIOS.md`, `BITACORA-PROYECTO-FRONTEND.md`, `README.md`) y añadir seguimiento, decisiones y pendientes.

---

## 2. Archivos fuente combinados

Se han consolidado y referenciado los siguientes documentos originales del repositorio:

- `EXPLICACION.MD` (explicación del frontend y flujo básico)
- `RESUMEN_CAMBIOS.md` (cambios recientes: auth, layouts, rutas, dashboard esqueleto)

## 13. Entradas recientes (commits importantes)

Las siguientes entradas reflejan los commits más relevantes registrados en el repositorio. Cada entrada resume el commit, su autor, fecha y el impacto / acciones recomendadas. Copiar estas entradas al registro de cambios al commitear es obligatorio.

- `65f79aa` 2026-08-13 — Byron Torres — Merge pull request #12 from DiegoMaldonado19/feature/membership
  - Impacto: Integración del feature `membership` en `stage`.
  - Acciones: Revisar `src/modules/membership` (si existe) y actualizar `types.ts` confirmando campos con Postman/schema.

- `c10271f` 2026-08-13 — Byron Torres — Merge branch 'stage' into feature/membership
  - Impacto: Actualizaciones sincronizadas desde `stage`.

- `26e0633` 2026-08-13 — Byron Torres — feature: fix message in hooks
  - Impacto: Correcciones en hooks; revisar `src/modules/*/hooks.ts` para mensajes y manejo de errores.

- `86e0a8b` 2026-08-13 — Byron Torres — feature: membership and fix trainer and employees and members
  - Impacto: Cambios funcionales en `membership` y ajustes en `trainers`, `employees`, `members`.
  - Acciones: Ejecutar `npm run lint` y `npm run build` localmente, revisar `TrainerDetailPage` y páginas afectadas.

- `ea77bbf` / `951f9fb` 2026-08-13 — Miguel Quemé — merges relacionados con `auth`
  - Impacto: Integración de cambios del módulo `auth`.

- `e941585` 2026-08-13 — OkKid-A — Fix: lint.
  - Impacto: Ajustes de lint; confirmar que `npm run lint` ahora pasa.

- `7b43897` 2026-08-13 — OkKid-A — Feat: added 2FA functionality in login.
  - Impacto: 2FA en login añadido; revisar flujos en `src/modules/auth/pages/VerifyCodePage.tsx` y `LoginPage.tsx`.

- `c963eb7` 2026-08-12 — Byron Torres — Merge pull request #10 feature/employees
- `bac1ea2` 2026-08-12 — Byron Torres — fix: a problem about lint
- `b3816cf` 2026-08-12 — Byron Torres — fix: merge and add features in TrainerDetailPage
  - Impacto: Cambios en `employees` y `TrainerDetailPage`; es probable que se hayan corregido advertencias/errores de lint.

- `bf11ef4` 2026-08-12 — Byron Torres — feature: add module employee and trainer and improve navigation
  - Impacto: Nuevos módulos `employees` y `trainers` añadidos o extendidos. Revisar `src/modules/employees` y `src/modules/trainers`.

- `02523d9` / `1a4b420` / `2a0fc05` 2026-08-10 — integraciones y routing/login básicos añadidos por OkKid-A y Miguel
  - Impacto: Base del routing y login; confirmar que flujo de auth inicia correctamente y que `npm run dev` sirve la app.

- `cafd1b9` 2026-08-11 — Byron Torres — remove: some files
  - Impacto: Se eliminaron archivos — revisar cambios en la PR correspondiente para confirmar que no se borró documentación crítica.

- `9ced7a6` 2026-08-10 — Byron Torres — fix:  problem with lint y built
  - Impacto: Corrección para pasar lint/build previamente fallidos.

- `8f83bf9` 2026-08-10 — Byron Torres — Add: module members list, new, details, edit, unsubscribe, subscribe, etc
  - Impacto: Módulo `members` añadido; revisar endpoints y tipos con Postman.


Proceso requerido tras cada commit importante:

1. Ejecutar `npm run lint` y `npm run build` localmente.
2. Añadir una entrada en el registro de cambios (sección 14) copiando la plantilla.
3. Si aparecen errores de lint o build, corregirlos antes de pushear y documentar la corrección.

## 14. Política obligatoria: lint, build y registro de cambios

- **Siempre** ejecutar `npm run lint` y `npm run build` antes de crear un commit que vaya a compartir (push/PR). Los comandos obligatorios locales son:

```bash
npm run lint
npm run build
```

- Si `npm run lint` reporta errores (no solo warnings), deben corregirse antes de commitear. El equipo sigue la configuración de ESLint incluida en el repositorio (`eslint.config.js`) como fuente de verdad. Cualquier excepción a una regla debe registrarse explícitamente en este archivo `CONOCIMIENTO.md` y aprobarse por review.

- `npm run build` debe completarse sin errores. Si el build falla por problemas de tipos o compilación, corregirlos localmente y documentar los cambios en el registro de cambios abajo.

- Motivación y efecto: la pipeline CI del proyecto revisa lint y build; fallos en estos puntos bloquean merges a `stage`/`main`. Evitar sorpresas en CI comprobando localmente.

## 15. Registro obligatorio de cambios en `CONOCIMIENTO.md`

TODO: cada cambio relevante (feature, bugfix, ajuste de lint, corrección de build, refactor) debe quedar registrado en este archivo bajo el formato que aparece a continuación. Una IA o cualquier integrante del equipo **debe** usar exclusivamente la sección de registro de este archivo para conocer el historial y el estado de las tareas.

- Fecha: 2026-08-13
- Autor: fer
- Tipo: bugfix
- Descripción breve: Se añadieron validaciones específicas para pases de invitado y para límites razonables de clases por semana; además se corrigió la visualización del toast para que muestre el mensaje real del backend en planes de membresía y se agregara ayuda visual para editar filas.
- Archivos modificados: src/modules/access/pages/GuestPassesPage.tsx, src/modules/membership/pages/MembershipPlanFormPage.tsx, src/modules/membership/pages/MembershipPlansListPages.tsx, src/modules/membership/hooks.ts, src/modules/membership/services.ts
- Comprobaciones locales realizadas:
  - `npm run lint`: OK
  - `npm run build`: no ejecutado en esta sesión, no requerido para este ajuste puntual
- Notas adicionales: La validación local “Un plan sin clases grupales no puede tener límite semanal” se eliminó del flujo de creación porque estaba reemplazando el mensaje del backend. El sistema ahora deja que el servidor responda con su error real, y se mantiene una validación lógica local de máximo 7 clases por semana.

- Fecha: 2026-08-13
- Autor: fer
- Tipo: feature
- Descripción breve: Se inició el módulo de clases con tipos, servicios, hooks y una primera vista de cartelera basada en el contrato de Postman para group-classes y class-sessions.
- Archivos modificados: src/modules/classes/types.ts, src/modules/classes/services.ts, src/modules/classes/hooks.ts, src/modules/classes/pages/ClassesListPage.tsx, src/router.tsx
- Comprobaciones locales realizadas:
  - `npm run lint`: pendiente de validación
  - `npm run build`: pendiente de validación
- Notas adicionales: La vista deja la base de la cartelera y filtro por disciplina/clase; la funcionalidad completa de inscripción y espera queda pendiente del backend y del resto del flujo de UI.

Plantilla a copiar cada vez que se haga un cambio:

```
- Fecha: YYYY-MM-DD
- Autor: Nombre (o usuario)
- Tipo: feature | bugfix | lint-fix | build-fix | docs | refactor
- Descripción breve: Qué se hizo y por qué
- Archivos modificados: lista de rutas relativas
- Comprobaciones locales realizadas:
  - `npm run lint`: OK / errores corregidos (describir)
  - `npm run build`: OK / falló (describir)
- Notas adicionales: (ej. se dejó TODO, se necesita confirmación del backend)
```

Ejemplo real (obligatorio al commitear cambios que afectan reglas de lint/build):

```
- Fecha: 2026-08-12
- Autor: fer
- Tipo: lint-fix
- Descripción breve: Ajustados imports y reglas para pasar ESLint en `src/modules/employees`.
- Archivos modificados: src/modules/employees/*, eslint.config.js
- Comprobaciones locales realizadas:
  - `npm run lint`: OK (antes: 12 errores, ahora: 0)
  - `npm run build`: OK
- Notas adicionales: ninguna
```

- Fecha: 2026-08-14
- Autor: fer
- Tipo: decision | docs
- Descripción breve: Decisión y justificación sobre el flujo de `guest_pass` (pases de invitado) en el frontend.
- Detalle:
  - Se añadió soporte en el formulario de cobro (`PaymentFormPage`) para crear un `guest_pass` automáticamente cuando el `concept` es `GUEST_PASS`. El flujo implementado hace: crear `guest_pass` (`POST /guest-passes`) con los datos del invitado, y luego crear el `payment` referenciando `guest_pass_id`.
  - Añadidas validaciones de frontend para los campos del invitado (document_type, document_number, email, phone) siguiendo las mismas reglas que `MemberFormPage` (DPI: 13 dígitos, Passport: 6 o 9, NIT: 8 o 9, teléfono 8 dígitos). Se aplica formateo del teléfono al estilo `####-####`.
  - Al detectar que el pago corresponde a un `guest_pass`, el formulario muestra una confirmación (Snackbar) con acción `Registrar ingreso` que lleva a la lista de `Guest Passes` (`/access/guest-passes`) para que la recepcionista pueda continuar manualmente el proceso de acceso.

- Motivo para no implementar check-in/check-out automático para invitados:
  - El enunciado de la práctica solicita que la recepcionista pueda registrar pases de día/prueba (capturar nombre, documento y fecha) y limitar su uso por persona, pero no obliga a implementar un flujo automático de check-in/check-out para `guest_pass` distinto del de socios.
  - La colección Postman del backend expone `POST /guest-passes` y endpoints de `visits` (`POST /visits` y `/visits/{id}/check-out`) que usan `member_id`. No existe en Postman un endpoint que permita explícitamente hacer check-in/check-out usando `guest_pass_id`.
  - Para respetar el contrato del backend y no romper reglas de negocio, se decidió NO implementar un checkout de invitados no soportado por la API. En su lugar se dejó una UX mínima (Snackbar -> lista de `guest-passes`) que facilita la acción manual por la recepcionista.

- Archivos modificados (implementación y validaciones):
  - `src/modules/billing/pages/PaymentFormPage.tsx`
  - `src/modules/billing/services.ts` (mejoras de tipado / normalización)
  - `src/modules/notifications/components/NotificationBell.tsx` (ajuste menor en catch)

- Comprobaciones locales realizadas:
  - `npm run lint`: OK (warnings menores por `react-hook-form` `watch()` que no son errores).
  - `npm run build`: OK (proyecto compila y genera `dist`).

- Notas adicionales / recomendaciones futuras:
  - Si el backend añade soporte para check-in/check-out con `guest_pass_id` (o un endpoint `POST /guest-passes/{id}/check-in`), se puede extender el `onSuccess` del flujo de pago para hacer check-in automáticamente.
  - Mantener la validación del frontend pero delegar las reglas finales al backend (por ejemplo límite de pases gratuitos por persona). Registrar en servidor cualquier rechazo y mostrar el `error_code` al usuario en el `Snackbar`.
  - Antes de cambiar la UX (por ejemplo, redirección automática tras pago), confirmar la API con el equipo backend y documentarlo aquí.


## 16. Reglas concretas respecto a ESLint y estilo

- Seguir la configuración en `eslint.config.js` del proyecto. No deshabilitar reglas globales sin documentarlo en este archivo.
- Preferir la corrección del código (refactor pequeño) antes que añadir `// eslint-disable` en archivos. Si se añade `// eslint-disable`, incluir una nota en el registro explicando la razón y el TODO para removerlo.
- Antes de enviar una PR, ejecutar `npm run lint` y `npm run build`. En la descripción de la PR pegar la entrada de registro (plantilla) o referenciar la sección añadida aquí con fecha.

## 17. Anexos

- Notas de buenas prácticas sobre roles y rutas, y sobre verificación de contratos de API (ver sección 6).


---

*Documento generado automáticamente a partir de los `.md` existentes del repositorio y de la bitácora interna.*
- `employees` — completo; revisar roles y permisos.
- `trainers` — básico completo; pantalla de transferencia pendiente.
- `membership`, `classes`, `access`, `notification` — pendientes de construir.
- `billing`, `training`, `nutrition`, `reports` — esperadas desde backend (trabajo de Kevin/Diego).

---

## 8. Problemas resueltos y lecciones

- Versionado de `ag-grid` — requerir versiones parejas `ag-grid-react` y `ag-grid-community` v36.
- Swagger example inconsistente con `snake_case`.
- Conflictos de versiones en `@mui/icons-material` causaron errores al importar íconos.

---

## 9. Checklist de tareas pendientes (priorizado)

- [ ] Confirmar campos y permisos exactos de endpoints revisando Postman/Java (`/employees`, `/trainers`).
- [ ] Completar `Trainer` types y `TrainerDetailPage` con campos faltantes.
- [ ] Implementar pantalla de transferencia de cartera de entrenador.
- [ ] Construir módulo `membership` (planes, contratación, congelar/renovar/cancelar).
- [ ] Construir `access` (check-in/check-out).
- [ ] Implementar `classes` (inscripción, lista de espera).
- [ ] Preparar manual técnico y manual de usuario para entrega.

---

## 10. Cómo levantar localmente (resumen rápido)

```bash
# frontend
npm install
cp .env.example .env.local
# en .env.local poner VITE_API_BASE_URL=http://localhost:8080
npm run dev

# backend (desde repo backend)
docker compose up -d --wait
```

---

## 11. Referencias y archivos útiles

- README: `README.md`
- Postman collection: `Fitness-App_postman_collection.json` (importar en Postman)
- SQL schema: `schema.sql` (ver valores de enums y constraints)

---

## 12. Seguimiento (último estado)

- Fecha última actualización: 2026-08-12
- Cambio principal reciente: consolidación de rutas y auth, integración inicial de `members`, `employees` y `trainers`.

---

## 13. Anexos

- Notas de buenas prácticas sobre roles y rutas, y sobre verificación de contratos de API (ver sección 6).


---

*Documento generado automáticamente a partir de los `.md` existentes del repositorio y de la bitácora interna.*
