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
- `BITACORA-PROYECTO-FRONTEND.md` (bitácora detallada: contexto, stack, convenciones, checklist)
- `README.md` (instrucciones de arranque, estructura, scripts, rutas)

Los contenidos completos de dichos archivos se han integrado en las secciones relevantes de este `CONOCIMIENTO.md`.

---

## 3. Stack técnico (resumen)

- React 19 + TypeScript + Vite
- MUI v5 (`@mui/material`, `@mui/icons-material`, `@mui/x-date-pickers`)
- ag-grid (community + react) v36.x
- @tanstack/react-query
- react-hook-form + yup + @hookform/resolvers
- axios (instancia central en `src/api/client.ts`)
- notistack (snackbars)
- react-router-dom v7

---

## 4. Estructura de carpetas (resumen)

- `src/`
  - `main.tsx` — punto de entrada
  - `App.tsx` — providers (React Query, Theme, Auth, Notistack)
  - `router.tsx` — definición de rutas y protecciones
  - `theme.ts` — tema MUI
  - `api/` — `client.ts`, `types.ts`
  - `auth/` — `AuthContext.tsx`, `ProtectedRoute.tsx`, `useAuth.ts`, `permissions.ts`
  - `layouts/` — `AppLayout.tsx`, `PublicLayout.tsx`, `Sidebar.tsx`, `UserMenu.tsx`
  - `modules/` — módulos por dominio: `auth`, `dashboard`, `members`, `employees`, `trainers`, `...`

---

## 5. Convenciones de desarrollo (obligatorias)

- JSON en snake_case (el backend serializa en snake_case).
- Estructura por módulo: `types.ts`, `services.ts`, `hooks.ts`, `pages/`, `components/`.
- Import alias `@/` apunta a `src/`.
- Named exports preferidos (no default exports) para componentes/páginas.
- React Query para llamadas a la API (hooks en `hooks.ts`).
- react-hook-form + yup para validación de formularios.
- ag-grid v36 para tablas grandes (registrar módulos y usar Theming API).
- notistack para notificaciones.

---

## 6. Contratos de API y regla de oro

Antes de crear `types.ts` o consumir un endpoint:

1. Revisar `Fitness-App_postman_collection.json` para requests/respuestas reales.
2. Usar `response.body` y `event[].script.exec` en Postman para confirmar nombres reales de campos.
3. Verificar `schema.sql` para enums/constraints.
4. Nunca confiar en el "Example Value" de Swagger.

---

## 7. Estado actual (resumen por módulo)

- `auth` — completo y funcionando.
- `members` — completo, mergeado a `stage`.
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

- Bitácora: `BITACORA-PROYECTO-FRONTEND.md`
- Explicación: `EXPLICACION.MD`
- Resumen: `RESUMEN_CAMBIOS.md`
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
