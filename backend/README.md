# Backend SIInesle

API en NestJS + Sequelize (MariaDB) para el Sistema de Iniciativas del INESLE.

## Puesta en marcha

```bash
npm install
cp .env.example .env
npm run migration:run
npm run seed:run
npm run start:dev
```

La API queda disponible en `http://localhost:3001/api`.
