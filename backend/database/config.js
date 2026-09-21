require('dotenv').config();

// sequelize-cli corre este archivo por su cuenta (no pasa por src/main.ts),
// así que aquí también hay que cargar el .env y leer las mismas variables
// que usa el backend, o las migraciones apuntarían a un host distinto al
// que usa la aplicación (p. ej. "localhost" dentro de un contenedor Docker,
// donde eso no es el equipo anfitrión sino el propio contenedor).
const base = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'iniciativas_inesle',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  dialect: 'mariadb',
  dialectOptions: {
    charset: 'utf8mb4',
  },
};

module.exports = {
  development: base,
  production: base,
};
