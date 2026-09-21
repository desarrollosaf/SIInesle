/**
 * En el directorio corporativo compartido (saf) no todos los registros tienen
 * el campo "name" capturado; sin este resguardo, el alta en auditoría truena
 * con una violación NOT NULL para esos usuarios.
 */
export function usuarioDesdeRequest(req: any): { rfc: string; nombre: string } {
  const rfc = req.user?.rfc ?? 'DESCONOCIDO';
  const nombre = req.user?.name || rfc;
  return { rfc, nombre };
}
