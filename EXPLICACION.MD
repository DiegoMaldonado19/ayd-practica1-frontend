# Explicación del frontend

Este proyecto es un frontend hecho con React, TypeScript y Vite. Sirve como base para construir la interfaz del sistema y conectarla con el backend que ya está trabajando en paralelo.

## 1. Qué es este proyecto

El frontend está pensado para mostrar la interfaz de usuario, recibir entradas del usuario y comunicarse con la API del backend. En este momento el proyecto viene con una estructura básica de Vite, pero ya está listo para que ustedes comiencen a construir pantallas, componentes y lógica de negocio.

## 2. Estructura del proyecto

La estructura principal es la siguiente:

- package.json: contiene la configuración del proyecto, dependencias y scripts.
- vite.config.ts: configuración de Vite, el servidor de desarrollo y el build.
- tsconfig.json y archivos de TypeScript: configuran el compilador de TypeScript.
- index.html: archivo HTML principal donde se monta la aplicación.
- src/: carpeta donde vive todo el código de la interfaz.
  - main.tsx: punto de entrada de la aplicación.
  - App.tsx: componente principal que se muestra en pantalla.
  - App.css: estilos del componente principal.
  - index.css: estilos globales.
  - assets/: archivos estáticos como imágenes o iconos.

## 3. Cómo funciona la aplicación

El flujo básico es este:

1. El navegador carga el archivo index.html.
2. El archivo main.tsx inicializa React y renderiza el componente App.
3. App.tsx es el componente principal de la interfaz.
4. Desde ahí se pueden crear más componentes, pantallas y lógica para mostrar información al usuario.

En otras palabras, React toma el componente principal y lo convierte en la interfaz visual que ves en el navegador.

## 4. Archivos más importantes

### package.json

Aquí están los comandos que se usan para trabajar con el proyecto:

- npm run dev: inicia el servidor de desarrollo.
- npm run build: compila la aplicación para producción.
- npm run preview: sirve la versión compilada localmente.
- npm run lint: revisa el código con ESLint.

### src/main.tsx

Es el punto de entrada. Aquí se monta la aplicación en el elemento root del HTML.

### src/App.tsx

Aquí está el componente principal actual. Más adelante, este archivo se puede reemplazar o dividir en varios componentes más pequeños para organizar mejor el proyecto.

### src/App.css y src/index.css

Aquí van los estilos. El CSS se puede organizar por componentes o de forma global, según lo que prefieran.

## 5. Cómo ejecutar el frontend

### Opción 1: usando npm

Primero instala las dependencias:

```bash
npm install
```

Luego inicia el servidor:

```bash
npm run dev
```

Por defecto, Vite normalmente queda disponible en:

- http://localhost:5173

### Opción 2: usando Docker Compose

Este repositorio también incluye un archivo de Docker Compose. Puedes levantar el frontend con:

```bash
docker compose up
```

Esto monta el proyecto y expone el frontend en el puerto 5173.

## 6. Cómo trabajar en el proyecto

Para que el desarrollo sea más claro, conviene seguir esta forma de trabajo:

1. Crear componentes pequeños y reutilizables.
2. Separar la lógica de negocio en archivos distintos si crece mucho.
3. Mantener los estilos organizados.
4. Cuando se conecte con el backend, usar una carpeta para servicios o peticiones HTTP.

Por ejemplo, una estructura más organizada para adelante podría ser:

```text
src/
  components/
  pages/
  services/
  hooks/
  styles/
  App.tsx
  main.tsx
```

## 7. Cómo se conecta con el backend

El backend ya está enviando cambios, y el frontend deberá consumir sus endpoints. En este proyecto todavía no se ve esa conexión implementada de forma formal, pero el punto donde normalmente se integra es en un archivo de servicios dentro de src/.

Por ejemplo, más adelante podrían crear algo como:

- src/services/api.ts
- src/services/auth.ts
- src/services/user.ts

Y desde los componentes llamar esas funciones para obtener o enviar datos.

## 8. Recomendación para empezar

Un buen punto de partida es:

1. Entender cómo funciona App.tsx y main.tsx.
2. Crear una primera pantalla simple.
3. Separar el contenido en componentes.
4. Luego integrar llamadas al backend.

## 9. Resumen rápido

- React + TypeScript + Vite = base del frontend.
- El punto de entrada es src/main.tsx.
- La interfaz principal está en src/App.tsx.
- Para correrlo se usa npm run dev o Docker Compose.
- El proyecto está listo para crecer hacia pantallas reales y conexión con el backend.

Si quieren, el siguiente paso ideal es empezar a diseñar la primera pantalla de la práctica y dejar el proyecto listo para conectar con la API del backend.
