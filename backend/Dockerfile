# Etapa de compilación
FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Etapa de producción
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# sequelize-cli lee la configuración y las migraciones del disco en tiempo de
# ejecución: nest build no las compila ni las copia a dist/.
COPY --from=build /app/database ./database
COPY --from=build /app/.sequelizerc ./.sequelizerc

RUN mkdir -p /app/storage

EXPOSE 3001

# Aplica las migraciones pendientes (idempotente: sequelize-cli lleva su
# propio registro en SequelizeMeta) y luego arranca. La siembra de catálogos
# NO se corre aquí a propósito: es un paso consciente único, ver README.
CMD ["sh", "-c", "npx sequelize-cli db:migrate && node dist/main.js"]
