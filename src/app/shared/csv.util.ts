export function detectDelimiter(text: string): string {
  const line = text.split(/\r?\n/)[0] || '';
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0, '|': 0 };
  let inQuotes = false;
  for (const c of line) {
    if (c === '"') inQuotes = !inQuotes;
    else if (!inQuotes && c in counts) counts[c]++;
  }
  const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  return best && best[1] ? best[0] : ',';
}

export function parseCsv(text: string): string[][] {
  const clean = String(text).replace(/^﻿/, '');
  const delimiter = detectDelimiter(clean);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const c = clean[i];
    if (inQuotes) {
      if (c === '"') {
        if (clean[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === delimiter) {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      rows.push(row);
      row = [];
    } else if (c !== '\r') {
      field += c;
    }
  }
  row.push(field);
  rows.push(row);

  return rows.filter((r) => r.some((v) => String(v).trim() !== ''));
}

export function normalizarTexto(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

export function normalizarEncabezado(value: unknown): string {
  return normalizarTexto(value).replace(/[^a-z0-9ñ ]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function dividirValoresMultiples(value: unknown, separadorComas: boolean): string[] {
  let partes = String(value ?? '').split(/\r?\n|;|\|/);
  if (separadorComas) partes = partes.flatMap((v) => v.split(/,| y (?=[A-ZÁÉÍÓÚÑ])/));
  return [...new Set(partes.map((v) => v.trim()).filter(Boolean))];
}

export function parsearFechaImportacion(raw: unknown): string {
  const v = String(raw ?? '').trim();
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);

  const m = v.match(/^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? '20' + m[3] : m[3];
    return `${y}-${String(m[2]).padStart(2, '0')}-${String(m[1]).padStart(2, '0')}`;
  }

  if (/^\d{5}$/.test(v)) {
    return new Date(Date.UTC(1899, 11, 30) + Number(v) * 86400000).toISOString().slice(0, 10);
  }

  const d = new Date(v);
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
}

export function descargarCsv(nombreArchivo: string, filas: string[][]): void {
  const csv = '﻿' + filas
    .map((fila) => fila.map((v) => '"' + String(v ?? '').replaceAll('"', '""') + '"').join(','))
    .join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(a.href);
}
