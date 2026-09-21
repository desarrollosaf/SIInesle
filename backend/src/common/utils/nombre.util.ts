/**
 * Builds a full name from separate fields.
 *
 * Some records in s_usuario have the complete name stored in `Nombre`
 * (e.g. "RAMIREZ BARRETO DOMINIC IVAN") while A_Paterno / A_Materno also
 * hold the last names, causing duplicates when concatenated naively.
 * This function detects that case by checking whether Nombre already starts
 * with A_Paterno and returns Nombre as-is if so.
 */
export function buildNombreCompleto(
  nombre: string | null | undefined,
  aPaterno: string | null | undefined,
  aMaterno: string | null | undefined,
): string {
  const n = (nombre ?? '').trim();
  const p = (aPaterno ?? '').trim();
  const m = (aMaterno ?? '').trim();

  if (p && n.toUpperCase().startsWith(p.toUpperCase() + ' ')) {
    return n;
  }

  return [n, p, m].filter(Boolean).join(' ');
}
