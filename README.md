# Sistema de Iniciativas · INESLE

Sistema de captura y consulta de iniciativas legislativas para el Instituto de
Estudios Legislativos (INESLE), construido replicando la estructura técnica de
`SIAdministracion` (Angular + NestJS + Sequelize/MariaDB) y el alcance
funcional definido en `Mockup_Sistema_INESLE_Iniciativas_V9.html`.

## Estructura

```
SIInesle/
├── src/                # Frontend Angular 21 (standalone components)
├── backend/            # API NestJS 11 + Sequelize (MariaDB)
│   ├── src/
│   │   ├── auth/           # Login corporativo (RFC) contra la BD compartida "saf"
│   │   ├── catalogos/      # CRUD genérico de los 6 catálogos del sistema
│   │   ├── iniciativas/    # Entidad principal + relaciones muchos-a-muchos + carga masiva
│   │   ├── comparativas/   # Antecedentes comparados de cada iniciativa
│   │   ├── auditoria/      # Bitácora de altas/cambios
│   │   └── models/         # Modelos Sequelize (incluye users_safs/s_usuario/s_users)
│   └── database/
│       ├── migrations/     # 14 migraciones (catálogos, iniciativas, pivotes, comparativas, auditoría)
│       └── seeders/        # Catálogos base tomados del mockup
├── DockerFile, nginx.conf          # Imagen de producción del frontend
├── backend/Dockerfile              # Imagen de producción del backend
├── docker-compose.yml              # Entorno de desarrollo (hot-reload)
└── docker-compose.prod.yml         # Build de producción
```

## Puesta en marcha

Hay dos formas de correr el proyecto en desarrollo: con Docker (no requiere
tener Node instalado) o de forma nativa con `npm`. Ambas se conectan al mismo
MariaDB que ya opera en el equipo — el sistema no levanta un contenedor de
base de datos.

### Opción A — Docker

```bash
cp backend/.env.example backend/.env
docker compose up
docker compose exec backend npm run seed:run   # solo la primera vez
```

Levanta frontend (`http://localhost:4201`) y backend (`http://localhost:3001/api`)
con hot-reload, montando el código como volumen. Las migraciones se aplican
solas al arrancar el backend.

> El `backend/.env` que uses con Docker debe tener `DB_HOST=host.docker.internal`
> y `SAF_DB_HOST=host.docker.internal` (ya es el valor por defecto de
> `.env.example`) para que el contenedor alcance el MariaDB de este equipo.
> `docker-compose.yml` ya fuerza ese valor aunque tu `.env` diga otra cosa.

### Opción B — Nativa (npm)

```bash
# Backend
cd backend
npm install
cp .env.example .env    # y cambia DB_HOST/SAF_DB_HOST a "localhost"
npm run migration:run
npm run seed:run
npm run start:dev

# Frontend, en otra terminal
cd ..
npm install
npm start                # ng serve, puerto 4201
```

En ambos casos se requieren dos bases de datos MariaDB:

- `iniciativas_inesle` — datos propios del sistema (se crea con las migraciones).
- `saf` — base de identidad corporativa compartida con los demás sistemas
  internos (`users_safs`, `s_usuario`, `s_users`), usada solo para autenticar
  por RFC. Debe existir previamente.

> Los puertos (4201 / 3001) se eligieron distintos a los de `SIAdministracion`
> (4200 / 3000) para poder correr ambos proyectos al mismo tiempo.

## Despliegue de producción

```bash
cp backend/.env.example backend/.env   # y captura las credenciales reales del servidor
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec backend npm run seed:run   # solo la primera vez
```

- El frontend se compila y se sirve con nginx (`DockerFile` + `nginx.conf`),
  con `--base-href /iniciativas/` — ajusta ese valor en
  `docker-compose.prod.yml` si se publica bajo otra ruta.
- El backend compila a JS puro, aplica las migraciones pendientes al arrancar
  y expone la API. La siembra de catálogos **no** se automatiza: es un paso
  consciente único (ver arriba).
- El frontend compilado llama al backend en la ruta relativa
  `/iniciativas/backend/` (`src/environments/environment.prod.ts`), asumiendo
  que un proxy externo (fuera de estos contenedores) enruta esa ruta al
  contenedor del backend — el mismo patrón que usan los demás sistemas
  internos. Si se publica sin ese proxy, cambia `endpoint` por el origen real
  del backend (por ejemplo `http://mi-servidor:3033/`) y ajusta `CORS_ORIGIN`
  en `backend/.env` para que coincida.
- `docker-compose.prod.yml` trae `extra_hosts: host.docker.internal:host-gateway`
  como valor por defecto (el MariaDB vive en el mismo servidor). Si vive en
  otro servidor, reemplázalo por su hostname real apuntando a su IP, y usa
  ese hostname como `DB_HOST`/`SAF_DB_HOST` en `backend/.env`.

Verificado de punta a punta con `docker compose build` + `up`, incluyendo un
inicio de sesión real contra la base `saf` corriendo dentro de los contenedores.

## Qué incluye este sistema

- Autenticación por RFC/contraseña reutilizando el patrón corporativo (JWT en
  cookie httpOnly, guard de rutas, interceptor de sesión expirada).
- Shell de la app (sidebar, header, layout) con la navegación completa del
  mockup y la misma paleta institucional guinda/dorado.
- CRUD real contra MariaDB para: Iniciativas (con promoventes, partidos,
  temas y comisiones como relaciones muchos-a-muchos), Catálogos (6 catálogos
  administrables), Comparativas y Auditoría.
- Validaciones de captura con la misma longitud mínima y reglas que define el
  mockup (título, resumen, palabras clave, justificaciones, etc.), en
  frontend y backend.
- Carga masiva desde CSV: detección de delimitador, mapeo automático de
  columnas por alias, clasificación de filas en correcta/advertencia/error,
  plantilla y reporte de incidencias descargables, y alta automática de
  catálogos nuevos.
- Auditoría real por usuario: cada alta, edición y baja de iniciativas y
  catálogos, y cada carga masiva, queda registrada con el RFC de quien la hizo.
- Dashboard con estadísticas reales (total, en estudio, aprobadas, pendientes,
  distribución por estatus).
- Guía de usuario con el detalle operativo de cada pantalla.
- 14 migraciones + seeder de catálogos base, y Dockerfiles/compose de
  desarrollo y producción, todo verificado de punta a punta.

## Qué queda pendiente de una siguiente iteración

- **Portal público**: una vista de consulta ciudadana sin autenticación, que
  muestre solo la información no confidencial de las iniciativas, descrita en
  el mockup pero aún no construida.
- **Exportar resultados de la consulta** a CSV desde
  `Consulta de iniciativas`.
- **Guardar borrador con validación parcial**: hoy registrar una iniciativa
  exige completar todos los campos obligatorios, incluso con estatus
  "Borrador"; no existe el atajo del mockup que solo pide número, fecha,
  título y un promovente.
- **Contador de uso por valor de catálogo y restauración a valores base** en
  la pantalla de Catálogos.
