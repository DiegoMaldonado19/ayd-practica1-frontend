FROM node:24-alpine AS build
WORKDIR /app

# Copy manifests first so `npm ci` stays cached until dependencies change.
COPY package.json package-lock.json ./

# No --omit=dev here: vite and typescript are devDependencies and the build needs them.
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --spider -q http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
