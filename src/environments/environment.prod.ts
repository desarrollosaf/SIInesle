// Asume un proxy externo (fuera de estos contenedores) que publica el
// frontend en /iniciativas/ y reenvía /iniciativas/backend/ al contenedor
// del backend, igual que en los demás sistemas internos. Si este proyecto
// se publica sin ese proxy, cambia "endpoint" por el origen real del
// backend, p. ej. 'http://mi-servidor:3033/'.
export const enviroment = {
  production: true,
  endpoint: '/iniciativas/backend/',
};
