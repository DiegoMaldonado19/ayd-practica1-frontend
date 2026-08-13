FROM node:24-alpine
WORKDIR /app

# Copy manifests first so `npm ci` stays cached until dependencies change.
COPY package.json package-lock.json ./

RUN npm ci

COPY . .

EXPOSE 5173

HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
    CMD wget --spider -q http://127.0.0.1:5173/ || exit 1

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
