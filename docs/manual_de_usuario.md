# Manual de Usuario — Sistema de Gestión de Gimnasio (Frontend)

> **Ámbito de este documento:** solo el **frontend** del Sistema de Gestión de Gimnasio
> (Práctica 1, Análisis y Diseño de Sistemas 1 — USAC CUNOC).
> El backend cuenta con su propia documentación y queda **fuera del alcance** de este manual.

---

## Tabla de contenidos

1. [Introducción](#1-introducción)
2. [Acceso al sistema](#2-acceso-al-sistema)
3. [Interfaz general](#3-interfaz-general)
4. [Mi perfil y seguridad](#4-mi-perfil-y-seguridad)
5. [Guía por rol: Administrador](#5-guía-por-rol-administrador)
6. [Guía por rol: Recepcionista](#6-guía-por-rol-recepcionista)
7. [Guía por rol: Entrenador](#7-guía-por-rol-entrenador)
8. [Guía por rol: Socio](#8-guía-por-rol-socio)
9. [Preguntas frecuentes y solución de problemas](#9-preguntas-frecuentes-y-solución-de-problemas)
10. [Capturas de pantalla (referencias)](#10-capturas-de-pantalla-referencias)

---

## 1. Introducción

El **Sistema de Gestión de Gimnasio** es una aplicación web que permite administrar socios, personal,
entrenadores, planes y contratos de membresía, control de acceso (visitas y pases de invitado), clases,
pagos y promociones, entrenamiento, nutrición, reportes y notificaciones.

La aplicación reconoce **cuatro roles** de usuario, cada uno con acceso a un conjunto de funciones:

| Rol | Qué puede hacer (resumen) |
|---|---|
| **Administrador** | Administra todo: socios, personal, entrenadores, planes, membresías, pagos, promociones, clases, reportes, entrenamiento y nutrición. |
| **Recepcionista** | Control de acceso (check-in/out y pases de invitado), socios, membresías, clases, pagos y entrenadores. |
| **Entrenador** | Sus socios asignados, ejercicios, rutinas, mediciones, observaciones, alertas y nutrición de sus socios. |
| **Socio** | Su membresía, su entrenamiento, su nutrición, sus pagos y su perfil. |

---

## 2. Acceso al sistema

### 2.1 Iniciar sesión

1. Abre la aplicación en el navegador. Verás la pantalla de **Iniciar sesión**.
2. Escribe tu **Usuario** y tu **Contraseña**.
3. Pulsa el botón **Ingresar**.

![Inicio de sesión](img/login.png)

- Si tus credenciales son correctas y tu cuenta **no** tiene doble factor activado, entrarás
  directamente al sistema.
- Si tu cuenta tiene el **doble factor** activado, se te pedirá un código (paso siguiente).

> 📸 **Captura de pantalla:** `src/docs/img/login.png`

### 2.2 Verificación en dos pasos (2FA)

1. Después de ingresar tus credenciales, el sistema envía un **código de 6 dígitos** a tu correo o SMS.
2. La pantalla muestra a dónde se envió el código (por ejemplo, `j***@mail.com`).
3. Escribe el código y pulsa el botón para continuar.

![Verificación en dos pasos](img/verify-code.png)

- Si no recibes el código, usa el enlace **"Vuelve a iniciar sesión"** para solicitar uno nuevo.

> 📸 **Captura de pantalla:** `src/docs/img/verify-code.png`

### 2.3 Recuperar contraseña

1. En la pantalla de inicio de sesión, pulsa **"¿Olvidaste tu contraseña?"**.
2. Escribe tu **usuario** y pulsa **Enviar código**.
3. Recibirás un código de 6 dígitos.
4. En la pantalla de **Restablecer contraseña** ingresa el código, tu **nueva contraseña** y su
   **confirmación**, y pulsa **Restablecer contraseña**.
5. Vuelve a la pantalla de inicio de sesión e ingresa con tu nueva contraseña.

> **Requisitos de contraseña:** de 8 a 72 caracteres.

![Recuperación de contraseña](img/forgot-password.png)

> 📸 **Captura de pantalla:** `src/docs/img/forgot-password.png`

---

## 3. Interfaz general

Después de iniciar sesión verás el área principal del sistema:

- **Menú lateral (sidebar):** contiene los accesos a los módulos. El contenido depende de tu rol.
  - Puedes **colapsar** el menú con el botón de doble flecha en la parte inferior (se muestra solo
    el icono de cada opción).
  - En pantallas pequeñas (móvil/tablet) el menú se abre con el botón de hamburguesa de la barra superior.
- **Barra superior:** a la derecha muestra la **campana de notificaciones** y tu **menú de usuario**
  (avatar con tus iniciales).
- **Área de contenido:** la pantalla activa.

![Interfaz general](img/app-layout.png)

> 📸 **Captura de pantalla:** `src/docs/img/app-layout.png`

### 3.1 Menú de usuario

Pulsa tu avatar (arriba a la derecha) para ver:

- **Mi perfil** → tu información personal.
- **Preferencias** → seguridad de la cuenta (cambiar contraseña, doble factor).
- **Cerrar sesión** → sales del sistema.

### 3.2 Notificaciones

- La campana muestra el número de **notificaciones sin leer**.
- Al pulsarla se abre un panel con pestañas **No leídas** / **Leídas** y filtros de rango
  (**Hoy** / **Semana** / **Todo**).
- Al hacer clic en una notificación se abre su detalle y se marca como leída.
- La pantalla completa de notificaciones está en **Notificaciones** (ruta `/notifications`).

![Notificaciones](img/notifications.png)

> 📸 **Captura de pantalla:** `src/docs/img/notifications.png`

---

## 4. Mi perfil y seguridad

### 4.1 Mi perfil

Ruta: **Mi perfil** (menú de usuario).

- Muestra tu nombre, rol, usuario, correo, estado de la cuenta y último inicio de sesión.
- Si eres **Socio**, muestra además la sección **"Mi membresía"**: plan contratado, período de
  facturación, precio, fecha de fin y días restantes.

![Mi perfil](img/my-profile.png)

> 📸 **Captura de pantalla:** `src/docs/img/my-profile.png`

### 4.2 Seguridad de la cuenta

Ruta: **Preferencias** (menú de usuario) o enlace "Ir a Seguridad" del perfil.

**Verificación en dos pasos:**

1. Activa el interruptor **Activado**.
2. Elige el **Canal**: *Correo electrónico* o *SMS*.
3. Pulsa **Guardar preferencia**.

**Cambiar contraseña:**

1. Escribe tu **contraseña actual**.
2. Escribe la **nueva contraseña** y su **confirmación** (8 a 72 caracteres).
3. Pulsa **Guardar contraseña**.

![Seguridad de la cuenta](img/account-security.png)

> 📸 **Captura de pantalla:** `src/docs/img/account-security.png`

---

## 5. Guía por rol: Administrador

El administrador ve el menú completo: Socios, Personal, Entrenadores, Planes, Membresías, Acceso,
Clases, Pagos, Promociones, Nutrición, Entrenamiento y Reportes.

### 5.1 Panel de control

El panel muestra:

- **Indicadores:** socios activos, membresías por vencer (5 días), entrenadores y alertas pendientes.
- **Lista** "Próximas a vencer" (membresías).
- **Gráficas:** "Ingresos netos (últimos 6 meses)" y "Socios activos por plan".
- **Accesos rápidos:** Nuevo socio, Nuevo empleado, Asignar entrenador, Planes de membresía,
  Catálogo de ejercicios y Ver reportes.

![Dashboard administrador](img/dashboard-admin.png)

> 📸 **Captura de pantalla:** `src/docs/img/dashboard-admin.png`

### 5.2 Socios

**Listado (módulo "Socios"):**

- Busca por **nombre o documento** y filtra por **estado** (Activo / Inactivo / Retirado).
- Haz clic en una fila para ver el detalle del socio.

![Listado de socios](img/members-list.png)

> 📸 **Captura de pantalla:** `src/docs/img/members-list.png`

**Registrar un nuevo socio:**

1. Pulsa **Nuevo socio**.
2. Completa **Identificación**: tipo y número de documento (el sistema valida el formato).
3. Completa **Información personal**: nombre, apellido, género, fecha de nacimiento, correo,
   teléfono (formato `####-####`) y dirección.
4. (Opcional) **Acceso al sistema**: si quieres que el socio tenga cuenta, escribe un nombre de
   usuario y una contraseña (o usa el botón **Generar contraseña alfanumérica**).
5. Completa **Contacto de emergencia** y **Notas** si corresponde.
6. Pulsa **Guardar cambios**.

![Formulario de socio](img/member-form.png)

> 📸 **Captura de pantalla:** `src/docs/img/member-form.png`

**Ver / editar un socio:**

- En el detalle puedes pulsar **Editar** para modificar sus datos, y **Cambiar estado** para
  **Reactivar** (Activo), **Suspender** (Inactivo) o **Dar de baja** (Retirado).
- El panel **"Membresía contratada"** muestra el plan vigente del socio.

![Detalle de socio](img/member-detail.png)

> 📸 **Captura de pantalla:** `src/docs/img/member-detail.png`

### 5.3 Personal (empleados)

**Listado (módulo "Personal"):** busca por texto y filtra por **puesto**
(Administrador / Recepcionista / Entrenador).

**Registrar empleado:**

1. Pulsa **Nuevo empleado**.
2. Completa **Identificación** e **Información personal** (nombre, género, nacimiento, correo,
   teléfono, dirección).
3. **Acceso al sistema:** crea el usuario del empleado (usuario + contraseña).
4. En **Información laboral** elige el **puesto** y la **fecha de contratación**. Si el puesto es
   *Entrenador*, define la **carga máxima de socios** y la **biografía**.
5. Pulsa **Guardar cambios**.

**Ver / editar:** en el detalle puedes pulsar **Editar**, **Cambiar estado**
(Reincorporar / Suspender / Dar de baja) y **Ver perfil de entrenador** (si es entrenador).

![Formulario de empleado](img/employee-form.png)

> 📸 **Captura de pantalla:** `src/docs/img/employee-form.png`

### 5.4 Entrenadores

**Listado (módulo "Entrenadores"):** filtra por **especialidad** (Pérdida de peso, Ganancia muscular,
Rehabilitación, Funcional, Cardio). Haz clic en una fila para ver el detalle.

**Detalle del entrenador:**

- **Carga máxima de socios:** modifica la carga y la biografía y pulsa **Guardar**.
- **Especialidades:** agrega o quita especialidades y pulsa **Guardar especialidades**.
- **Transferir cartera:** reasigna todos los socios del entrenador a otro entrenador activo.
  - Elige el **entrenador destino** y pulsa **Transferir cartera**.
  - Cada socio recibe una notificación; el historial no se reescribe. Si el destino no tiene
    capacidad, la operación se rechaza sin cambios parciales.

![Detalle de entrenador](img/trainer-detail.png)

> 📸 **Captura de pantalla:** `src/docs/img/trainer-detail.png`

### 5.5 Planes de membresía

**Listado (módulo "Planes"):**

- Haz clic en un plan para editarlo.
- Usa **Activar** / **Desactivar** en cada fila para habilitar o deshabilitar el plan.

**Nuevo plan:**

1. Pulsa **Nuevo plan**.
2. En **Identidad del plan**: código, nivel (tier), periodicidad (Mensual/Trimestral/Semestral/Anual),
   nombre, precio y descripción. En edición, el **código** y el **nivel** no se pueden modificar.
3. En **Beneficios**: activa *clases grupales* (y define el límite semanal, vacío = ilimitadas) y
   *entrenador personal*.
4. Pulsa **Guardar**.

![Formulario de plan](img/plan-form.png)

> 📸 **Captura de pantalla:** `src/docs/img/plan-form.png`

### 5.6 Membresías (contratos)

**Listado (módulo "Membresías"):**

- Filtra por **estado**, **plan** y **"Vence en (días)"**.
- Haz clic en una fila para ver el detalle del contrato.

**Contratar membresía:**

1. Pulsa **Contratar membresía**.
2. Busca y selecciona el **socio** (no debe tener contrato vigente o congelado, ni estar dado de baja).
3. Elige el **plan** y, si quieres, la **fecha de inicio** (vacía = hoy) y **notas**.
4. Pulsa **Contratar**.

**Detalle del contrato — acciones según el estado:**

| Acción | Cuándo | Qué hace |
|---|---|---|
| **Congelar** | Contrato Activo | Pausa el contrato por un período (motivo + fecha estimada de reactivación). |
| **Reactivar** | Contrato Congelado | Lo reactiva y recalcula la fecha de vencimiento sumando el tiempo congelado. |
| **Renovar** | Activo, o Vencido sin otro contrato vigente | Crea un contrato nuevo encadenado al actual (mismo plan). |
| **Cambiar plan** | Igual que Renovar | Crea un contrato nuevo con otro plan a partir de hoy (sin prorrateo). |
| **Cancelar** | Cualquier estado ≠ Cancelado | Cancela el contrato de forma definitiva (no se puede reactivar ni renovar). |

La sección **"Congelamientos"** muestra cuántos usos de congelamiento quedan en el ciclo y el historial
de cada congelamiento.

![Detalle de membresía](img/membership-detail.png)

> 📸 **Captura de pantalla:** `src/docs/img/membership-detail.png`

### 5.7 Control de acceso

**Visitas (check-in / check-out):**

1. Pulsa **Registrar Check-in**.
2. Busca y selecciona el **socio** (activo) y confirma.
3. Cuando el socio salga, pulsa **Check-out** en su fila.
4. Usa las pestañas **En instalaciones** / **Historial** para ver quién está dentro o el historial.

![Visitas](img/visits.png)

> 📸 **Captura de pantalla:** `src/docs/img/visits.png`

**Pases de invitado:**

1. Pulsa **Registrar Pase**.
2. Completa los datos del invitado (documento, nombre, correo, teléfono).
3. Elige el **tipo de pase**: *Día de Prueba (Gratuito)* o *Invitado de Socio* (para este último
   debes indicar el **socio anfitrión**).
4. Pulsa el botón de registro.
   - *Nota:* el pase **pagado** se registra desde el módulo de **Pagos** (concepto "Pase de día").

![Pases de invitado](img/guest-passes.png)

> 📸 **Captura de pantalla:** `src/docs/img/guest-passes.png`

### 5.8 Clases

**Cartelera (módulo "Clases"):**

- Filtra por **disciplina**, **clase base** y rango de **fechas**.
- Haz clic en una fila para ver el detalle de la clase.

**Nueva clase:**

1. Pulsa **Nueva clase**.
2. Completa: código, nombre, disciplina, nivel, entrenador, día de la semana, hora de inicio,
   duración (30–180 min) y cupo (1–50).
3. Pulsa **Crear clase**.

![Formulario de clase](img/class-form.png)

> 📸 **Captura de pantalla:** `src/docs/img/class-form.png`

**Detalle de clase — generar sesiones:**

1. Elige el rango **Desde** / **Hasta**.
2. Pulsa **Generar sesiones**. El sistema crea una sesión por cada fecha del rango según el día de la
   semana programado.
3. En la lista **"Sesiones programadas"** haz clic en una sesión para administrarla.

**Detalle de sesión — inscribir socios:**

1. Selecciona un **socio**.
2. Pulsa **Inscribir a la sesión** o **Agregar a lista de espera**.
3. Las columnas **Inscritos** y **Lista de espera** muestran el estado de cada registro.

![Detalle de sesión](img/class-session.png)

> 📸 **Captura de pantalla:** `src/docs/img/class-session.png`

### 5.9 Pagos

**Listado (módulo "Pagos"):**

- Filtra por texto (**socio, concepto, folio**), **estado** (Registrado / Confirmado / Anulado) y
  **método** (Efectivo / Tarjeta débito).
- Columnas: ID, Socio, Concepto, Método, Estado, Monto original, Descuento y Total pagado.

![Listado de pagos](img/payments-list.png)

> 📸 **Captura de pantalla:** `src/docs/img/payments-list.png`

**Registrar un pago:**

1. Pulsa **Nuevo pago**.
2. Elige el **concepto**:
   - **Membresía:** selecciona el **socio** y su **membresía**; el monto se toma del precio del plan
     (no editable). Opcionalmente aplica una **promoción**.
   - **Pase de día:** ingresa el **monto** y los datos del **invitado** (documento, nombre, correo,
     teléfono).
3. Elige el **método de pago**.
4. Revisa el **desglose** (Monto original, Descuento, Total a pagar) y pulsa **Guardar pago**.

> Nota: la aplicación muestra un aviso indicando que **no hay pasarela de pago** para tarjeta; el
> cobro con tarjeta queda registrado como referencia.

![Registrar pago](img/payment-form.png)

> 📸 **Captura de pantalla:** `src/docs/img/payment-form.png`

### 5.10 Promociones

**Listado (módulo "Promociones"):** busca por **código o nombre** y filtra por estado
(Activas / Inactivas).

**Nueva promoción:**

1. Pulsa **Nueva promoción**.
2. Completa: código, nombre, descripción (opcional), **tipo de descuento**
   (Porcentaje o Monto fijo), **valor del descuento**, máx. usos (opcional), **vigencia**
   (desde ≥ hoy; hasta ≥ desde) y máx. por socio (opcional).
3. Pulsa **Guardar**.

![Formulario de promoción](img/promotion-form.png)

> 📸 **Captura de pantalla:** `src/docs/img/promotion-form.png`

### 5.11 Entrenamiento

**Asignaciones (módulo "Entrenamiento" → "Asignaciones"):**

- Filtra por estado (Todas / Activas / Cerradas).
- **Asignar entrenador:** busca el socio y el entrenador, y confirma. El plan del socio debe incluir
  el beneficio de entrenador personal y el entrenador debe tener capacidad.
- **Cerrar asignación:** elige el motivo (Reasignación, Entrenador dado de baja, Cambio de plan,
  Solicitud del socio).

**Catálogo de ejercicios:** crea, edita y desactiva ejercicios (código, nombre, grupo muscular,
descripción, URL de video).

**Entrenamiento de un socio:** selecciona un socio desde Mis socios / Asignaciones para ver:
- **Rutinas** (solo lectura para ADMIN): crea el entrenador desde su panel.
- **Mediciones de progreso** y **Observaciones del entrenador**.

**Alertas de entrenador:** resuelve o descarta las alertas pendientes.

### 5.12 Nutrición

**Catálogo de alimentos:** consulta y crea alimentos (código, nombre, categoría, porción, calorías,
proteína, carbohidratos, grasa). La desactivación está restringida al administrador.

**Nutrición de un socio:** selecciona un socio para ver su resumen calórico del día y la tendencia de
los últimos 7 días (solo lectura para ADMIN; el entrenador define las metas).

### 5.13 Reportes

Ruta: **Reportes**.

1. Selecciona el **reporte**:
   - Ingresos · Membresías por vencer · Distribución de socios · Asistencia a clases ·
     Demanda de clases · Carga de entrenadores · Progreso de un socio · Uso de pases de invitado ·
     Adherencia nutricional.
2. Configura los **filtros** que aparecen (rango de fechas, agrupar por, plan, entrenador, clase,
   socio, estado, vence en días, tipo de pase, límite).
3. La tabla de resultados se genera automáticamente.
4. Pulsa **Exportar CSV / XLSX / PDF / PNG** para descargar el reporte en el formato elegido.

![Reportes](img/reports.png)

> 📸 **Captura de pantalla:** `src/docs/img/reports.png`

---

## 6. Guía por rol: Recepcionista

El recepcionista ve: Socios, Entrenadores, Membresías, Acceso, Clases, Pagos y Nutrición/Entrenamiento
(según visibilidad del menú).

### 6.1 Panel de control

- **Indicadores:** quién está dentro, membresías por vencer (5 días) y pases de invitado hoy.
- **Gráfica:** visitas de los últimos 7 días.
- **Accesos rápidos:** Check-in/check-out, Registrar pase de invitado, Nuevo socio, Ver membresías.

![Dashboard recepcionista](img/dashboard-receptionist.png)

> 📸 **Captura de pantalla:** `src/docs/img/dashboard-receptionist.png`

### 6.2 Control de acceso

- **Visitas:** registra el **check-in** del socio y el **check-out** cuando sale.
  *(Ver pasos en la sección 5.7.)*
- **Pases de invitado:** registra pases de día de prueba o de invitado de socio.
  *(Ver pasos en la sección 5.7.)*

### 6.3 Socios

- Consulta el **listado** y el **detalle** de socios.
- No puede modificar el estado de un socio ni sus datos (el administrador sí).

### 6.4 Membresías

- Consulta el **listado** y el **detalle** de contratos (congelar, reactivar, renovar, cambiar plan
  y cancelar están disponibles para el recepcionista en el detalle, igual que el administrador).
- La **contratación** de membresías es exclusiva del administrador.

### 6.5 Clases

- Consulta la **cartelera**, el **detalle** de clases y el **detalle de sesiones**, donde puede
  **inscribir socios** y agregarlos a la **lista de espera**.

### 6.6 Pagos

- Consulta el **listado de pagos** y registra **nuevos pagos** (membresía o pase de día).
  *(Ver pasos en la sección 5.9.)*

---

## 7. Guía por rol: Entrenador

El entrenador ve: Nutrición, Entrenamiento (Mis socios, Ejercicios, Alertas de entrenador) y Clases.

### 7.1 Panel de control

- **Indicadores:** mis socios asignados y mis alertas pendientes.
- **Accesos rápidos:** Mis socios, Catálogo de ejercicios, Alertas.

![Dashboard entrenador](img/dashboard-trainer.png)

> 📸 **Captura de pantalla:** `src/docs/img/dashboard-trainer.png`

### 7.2 Mis socios

Ruta: **Entrenamiento → Mis socios**.

- Muestra los socios que tienes asignados.
- Haz clic en un socio para abrir su **entrenamiento**:
  - **Rutinas:** crea una **Nueva rutina** (nombre, objetivo, fecha de fin, ejercicios con día,
    series, repeticiones, descanso, orden y notas). Puedes **Editar**, **Publicar** (borrador) o
    **Archivar** una rutina.
  - **Mediciones de progreso:** registra **mediciones** (fecha, peso, % grasa, cintura, brazo, pierna,
    notas) y **corrige** las existentes.
  - **Observaciones:** agrega notas (Nutrición / Entrenamiento / General) con fecha de referencia.

![Entrenamiento del socio](img/member-training.png)

> 📸 **Captura de pantalla:** `src/docs/img/member-training.png`

### 7.3 Catálogo de ejercicios

Ruta: **Entrenamiento → Ejercicios**.

- Crea y edita ejercicios (código, nombre, grupo muscular, descripción, URL de video).
- Filtra por **grupo muscular**.

### 7.4 Alertas de entrenador

Ruta: **Entrenamiento → Alertas de entrenador**.

- **Escalar alerta al administrador:** elige el socio, el tipo (Reasignación / Atención especial) y
  la descripción, y pulsa **Enviar alerta**.
- Puedes filtrar por estado (Todas / Pendiente / Resuelta / Descartada).

### 7.5 Nutrición de socios

Ruta: **Nutrición → (seleccionar socio)**.

- Define o ajusta la **meta calórica** del socio (tipo de meta, calorías diarias, tolerancia %,
  peso objetivo) y consulta el resumen del día y la tendencia de 7 días.

### 7.6 Clases

- Consulta la **cartelera** de clases y el **detalle de sesiones** (lectura).

---

## 8. Guía por rol: Socio

El socio ve: Inicio, Nutrición, Entrenamiento (Mi entrenamiento) y Mis pagos.

### 8.1 Inicio (panel del socio)

- **Mi membresía:** plan contratado y días restantes.
- **Mi rutina:** la rutina publicada por tu entrenador.
- **Mi nutrición hoy:** calorías consumidas y comidas registradas.
- **Gráficas:** "Mi peso" (evolución) y "Calorías (últimos 7 días)".
- **Accesos rápidos:** Ver mi entrenamiento, Ver mi nutrición, Seguridad de mi cuenta.

![Dashboard socio](img/dashboard-member.png)

> 📸 **Captura de pantalla:** `src/docs/img/dashboard-member.png`

### 8.2 Mi entrenamiento

Ruta: **Entrenamiento → Mi entrenamiento**.

- **Mi entrenador:** quién te entrena.
- **Mi rutina:** los ejercicios por día (series × repeticiones).
- **Mi progreso:** tu peso registrado y su evolución.
- **Observaciones de mi entrenador:** las notas que te dejó.

### 8.3 Mi nutrición

Ruta: **Nutrición → Mi nutrición**.

- **Resumen de hoy:** calorías, proteína, carbohidratos y grasa, con indicador de si estás por
  debajo, dentro o por encima de tu meta.
- **Definir meta:** establece tu meta calórica (tipo de meta, calorías, tolerancia %, peso objetivo).
- **Comidas de hoy:** registra, edita o elimina comidas (fecha, tiempo de comida, alimentos con
  cantidad, notas).
  - Solo puedes editar/eliminar comidas **del mismo día**.
- **Últimos 7 días:** tendencia de calorías.

![Mi nutrición](img/my-nutrition.png)

> 📸 **Captura de pantalla:** `src/docs/img/my-nutrition.png`

### 8.4 Mis pagos

Ruta: **Mis pagos**.

- Muestra tu historial de pagos con concepto, método, estado, montos y descuento.
- Filtra por texto (**concepto, folio**) y **estado**.
- Pulsa **Recibo** para ver el **comprobante de pago** (serie, número, fecha de emisión y total) y
  luego **Imprimir** para imprimirlo.

![Mis pagos](img/my-payments.png)

> 📸 **Captura de pantalla:** `src/docs/img/my-payments.png`

---

## 9. Preguntas frecuentes y solución de problemas

### 9.1 "Mi sesión expiró" o me saca al inicio de sesión

El sistema detecta un token vencido y te redirige a **Iniciar sesión**. Vuelve a ingresar tus
credenciales.

### 9.2 No puedo registrarme un socio porque "ya existe un socio con ese documento"

El número de documento (DPI/Pasaporte/NIT) es único en el sistema. Verifica que no exista otro socio
con ese documento.

### 9.3 El correo es obligatorio pero no quiero crear cuenta

Si llenas los campos de **usuario/contraseña** (crear cuenta de acceso), el correo pasa a ser
obligatorio. Si solo quieres registrar el socio sin cuenta, deja los campos de acceso vacíos.

### 9.4 No puedo asignar un entrenador

El plan del socio debe incluir el beneficio de **entrenador personal**, y el entrenador debe tener
**capacidad disponible**. El sistema mostrará el motivo del error.

### 9.5 No puedo congelar / reactivar / renovar una membresía

Cada acción tiene condiciones:

- **Congelar:** el contrato debe estar **Activo** y no haber agotado los congelamientos del ciclo.
- **Reactivar:** el contrato debe estar **Congelado**.
- **Renovar / Cambiar plan:** el contrato debe estar **Activo**, o **Vencido** y sin otro contrato
  vigente.

### 9.6 El pago con tarjeta no procesa

La aplicación **no tiene pasarela de pago**. El método "Tarjeta débito" se registra como referencia;
el cobro real se gestiona fuera del sistema.

### 9.7 No puedo editar una comida registrada

Las comidas solo se pueden editar o eliminar **el mismo día** en que se registraron.

### 9.8 No veo algunos menús

Cada rol ve solo los módulos que le corresponden. Si crees que falta un permiso, contacta al
administrador.

### 9.9 No encuentro el pase de invitado pagado

Los pases de invitado **pagados** (Pase Pagado) se registran desde el módulo **Pagos** con el
concepto **Pase de día**, no desde el formulario de pases de invitado.

### 9.10 El reporte sale vacío

Revisa los filtros (fechas, socio, plan, etc.). Si el reporte requiere un socio (por ejemplo,
"Progreso de un socio"), selecciónalo antes de exportar.

---

## 10. Capturas de pantalla (referencias)

Todas las capturas de pantalla de este manual se colocan en la carpeta **`src/docs/img/`**.
Para que una captura aparezca, coloca el archivo con el mismo nombre que aparece en cada referencia.

Lista de imágenes usadas en este manual:

| Archivo esperado | Pantalla |
|---|---|
| `img/login.png` | Inicio de sesión |
| `img/verify-code.png` | Verificación en dos pasos |
| `img/forgot-password.png` | Recuperación de contraseña |
| `img/app-layout.png` | Interfaz general |
| `img/notifications.png` | Notificaciones |
| `img/my-profile.png` | Mi perfil |
| `img/account-security.png` | Seguridad de la cuenta |
| `img/dashboard-admin.png` | Dashboard administrador |
| `img/dashboard-receptionist.png` | Dashboard recepcionista |
| `img/dashboard-trainer.png` | Dashboard entrenador |
| `img/dashboard-member.png` | Dashboard socio |
| `img/members-list.png` | Listado de socios |
| `img/member-form.png` | Formulario de socio |
| `img/member-detail.png` | Detalle de socio |
| `img/employee-form.png` | Formulario de empleado |
| `img/trainer-detail.png` | Detalle de entrenador |
| `img/plan-form.png` | Formulario de plan |
| `img/membership-detail.png` | Detalle de membresía |
| `img/visits.png` | Visitas (check-in/out) |
| `img/guest-passes.png` | Pases de invitado |
| `img/class-form.png` | Formulario de clase |
| `img/class-session.png` | Detalle de sesión |
| `img/payments-list.png` | Listado de pagos |
| `img/payment-form.png` | Registrar pago |
| `img/promotion-form.png` | Formulario de promoción |
| `img/reports.png` | Reportes |
| `img/member-training.png` | Entrenamiento del socio |
| `img/my-nutrition.png` | Mi nutrición |
| `img/my-payments.png` | Mis pagos |