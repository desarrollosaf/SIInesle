import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { CatalogosService, CatalogoItem } from '../../service/catalogos.service';
import {
  IniciativasService, ImportarIniciativaFila, ImportarIniciativasResultado,
} from '../../service/iniciativas.service';
import {
  dividirValoresMultiples, descargarCsv, normalizarEncabezado, normalizarTexto, parseCsv, parsearFechaImportacion,
} from '../../shared/csv.util';

interface CampoImportacion {
  key: string;
  label: string;
  required?: boolean;
  multi?: boolean;
  aliases: string[];
}

const CAMPOS: CampoImportacion[] = [
  { key: 'numero', label: 'Número de iniciativa', required: true, aliases: ['numero', 'no de iniciativa', 'num', 'no iniciativa', 'numero de iniciativa'] },
  { key: 'fecha_presentacion', label: 'Fecha de presentación', required: true, aliases: ['fecha de presentacion', 'fecha'] },
  { key: 'titulo', label: 'Título', required: true, aliases: ['titulo', 'titulo de la iniciativa'] },
  { key: 'promotores', label: 'Persona legisladora o promovente', required: true, multi: true, aliases: ['persona legisladora', 'promovente', 'diputada o autor', 'diputada/o autor', 'autor', 'iniciante'] },
  { key: 'partidos', label: 'Grupo parlamentario/partido', multi: true, aliases: ['grupo partid', 'grupo partido', 'partido', 'grupo parlamentario', 'grupo'] },
  { key: 'legislatura', label: 'Legislatura', aliases: ['legislatura'] },
  { key: 'temas', label: 'Tema', multi: true, aliases: ['tema', 'temas'] },
  { key: 'subtema', label: 'Subtema', aliases: ['subtema'] },
  { key: 'resumen', label: 'Resumen técnico', aliases: ['resumen', 'resumen tecnico'] },
  { key: 'comisiones', label: 'Comisión turnada', multi: true, aliases: ['comision turnada', 'comisiones', 'comision'] },
  { key: 'estatus', label: 'Estatus', aliases: ['estatus', 'estado', 'situacion'] },
  { key: 'enlace', label: 'Enlace al documento', aliases: ['enlace', 'link', 'url', 'liga'] },
  { key: 'palabras_clave', label: 'Palabras clave', aliases: ['palabras clave', 'keywords', 'etiquetas'] },
  { key: 'problema', label: 'Problema público', aliases: ['problema publico que atiende', 'problema publico', 'problema'] },
  { key: 'objetivo', label: 'Objetivo', aliases: ['objetivo de la iniciativa', 'objetivo'] },
  { key: 'resumen_general', label: 'Resumen general del análisis', aliases: ['resumen general', 'analisis general'] },
  { key: 'beneficios', label: 'Beneficios esperados', aliases: ['beneficios esperados', 'beneficios'] },
  { key: 'riesgos', label: 'Riesgos o efectos no deseados', aliases: ['riesgos o efectos no deseados', 'riesgos'] },
  { key: 'nivel_viabilidad_tecnica', label: 'Viabilidad técnica', aliases: ['viabilidad tecnica'] },
  { key: 'nivel_viabilidad_juridica', label: 'Viabilidad jurídica', aliases: ['viabilidad juridica'] },
  { key: 'que_funcionaria', label: 'Qué funcionaría', aliases: ['que funcionaria', 'que funciono'] },
  { key: 'que_podria_fracasar', label: 'Qué podría fracasar', aliases: ['que podria fracasar', 'que no funciono'] },
  { key: 'recomendacion', label: 'Recomendación final', aliases: ['recomendacion final', 'recomendacion'] },
];

interface FilaAnalizada extends ImportarIniciativaFila {
  linea: number;
  errores: string[];
  advertencias: string[];
  estado: 'correcta' | 'advertencia' | 'error';
}

@Component({
  selector: 'app-import-masivo',
  imports: [CommonModule, FormsModule],
  templateUrl: './import-masivo.html',
  styleUrl: './import-masivo.scss',
})
export class ImportMasivo implements OnInit {
  campos = CAMPOS;

  arrastrando = signal(false);
  nombreArchivo = signal('');
  encabezados = signal<string[]>([]);
  filasCrudas = signal<string[][]>([]);
  mapeo = signal<Record<string, number>>({});
  filas = signal<FilaAnalizada[]>([]);
  importando = signal(false);

  separador = 'auto' as 'auto' | 'comma' | 'none';
  siExiste = 'omitir' as 'omitir' | 'actualizar';
  agregarCatalogos = true;

  estatusCatalogo = signal<CatalogoItem[]>([]);
  legislaturasCatalogo = signal<CatalogoItem[]>([]);

  total = computed(() => this.filas().length);
  validas = computed(() => this.filas().filter((f) => f.estado !== 'error').length);
  conAdvertencia = computed(() => this.filas().filter((f) => f.estado === 'advertencia').length);
  conError = computed(() => this.filas().filter((f) => f.estado === 'error').length);
  primeras25 = computed(() => this.filas().slice(0, 25));

  constructor(
    private readonly catalogosService: CatalogosService,
    private readonly iniciativasService: IniciativasService,
  ) {}

  ngOnInit(): void {
    this.catalogosService.obtenerTodos('estatus').subscribe((v) => this.estatusCatalogo.set(v));
    this.catalogosService.obtenerTodos('legislaturas').subscribe((v) => this.legislaturasCatalogo.set(v));
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.arrastrando.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) this.manejarArchivo(file);
  }

  onSeleccionarArchivo(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.manejarArchivo(file);
  }

  private manejarArchivo(file: File): void {
    if (!/\.csv$/i.test(file.name) && file.type !== 'text/csv') {
      Swal.fire('Archivo no válido', 'El archivo debe tener extensión .csv.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result));
      if (rows.length < 2) {
        Swal.fire('Archivo vacío', 'El archivo no contiene filas de datos.', 'error');
        return;
      }
      this.nombreArchivo.set(file.name);
      this.encabezados.set(rows[0].map((h) => String(h).trim()));
      this.filasCrudas.set(rows.slice(1));
      this.autoMapear();
      this.analizar();
    };
    reader.onerror = () => Swal.fire('Error', 'No fue posible leer el archivo.', 'error');
    reader.readAsText(file, 'utf-8');
  }

  descartar(): void {
    this.nombreArchivo.set('');
    this.encabezados.set([]);
    this.filasCrudas.set([]);
    this.mapeo.set({});
    this.filas.set([]);
  }

  valorMapeo(key: string): number | '' {
    return this.mapeo()[key] ?? '';
  }

  ejemplo(key: string): string {
    const idx = this.mapeo()[key];
    if (idx === undefined) return '';
    return String(this.filasCrudas()[0]?.[idx] ?? '').trim();
  }

  onCambiarMapeo(key: string, valor: string): void {
    const actual = { ...this.mapeo() };
    if (valor === '') delete actual[key];
    else actual[key] = Number(valor);
    this.mapeo.set(actual);
    this.analizar();
  }

  private autoMapear(): void {
    const heads = this.encabezados().map(normalizarEncabezado);
    const usados = new Set<number>();
    const mapa: Record<string, number> = {};

    CAMPOS.forEach((campo) => {
      const candidatos = [normalizarEncabezado(campo.label), ...campo.aliases.map(normalizarEncabezado)];
      let idx = heads.findIndex((h, i) => !usados.has(i) && candidatos.includes(h));
      if (idx < 0) idx = heads.findIndex((h, i) => !usados.has(i) && h && candidatos.some((c) => h.startsWith(c) || c.startsWith(h)));
      if (idx >= 0) { mapa[campo.key] = idx; usados.add(idx); }
    });

    this.mapeo.set(mapa);
  }

  private inferirLegislatura(fecha: string): string {
    const anio = Number(fecha.slice(0, 4));
    if (!anio) return '';
    const encontrada = this.legislaturasCatalogo().find((l) => {
      const m = l.nombre.match(/(\d{4})\s*[-–]\s*(\d{4})/);
      return m && anio >= Number(m[1]) && anio <= Number(m[2]);
    });
    return encontrada?.nombre ?? '';
  }

  private esUrlValida(valor: string): boolean {
    try {
      const u = new URL(valor);
      return ['http:', 'https:'].includes(u.protocol);
    } catch {
      return false;
    }
  }

  analizar(): void {
    const mapeo = this.mapeo();
    const rows = this.filasCrudas();
    if (!rows.length) { this.filas.set([]); return; }

    const celda = (row: string[], key: string) => (mapeo[key] === undefined ? '' : String(row[mapeo[key]] ?? '').trim());
    const permitirComas = this.separador === 'comma';
    const sinSeparar = this.separador === 'none';
    const dividir = (valor: string) => (sinSeparar ? [valor].filter(Boolean) : dividirValoresMultiples(valor, permitirComas));

    const numerosVistos = new Map<string, number>();
    const estatusValidos = new Set(this.estatusCatalogo().map((e) => normalizarTexto(e.nombre)));

    const resultado: FilaAnalizada[] = rows.map((row, i) => {
      const linea = i + 2;
      const errores: string[] = [];
      const advertencias: string[] = [];

      const numero = celda(row, 'numero').replace(/\s/g, '');
      const titulo = celda(row, 'titulo');
      const fecha = parsearFechaImportacion(celda(row, 'fecha_presentacion'));
      const promotores = dividir(celda(row, 'promotores'));
      const partidos = dividir(celda(row, 'partidos'));
      const temas = dividir(celda(row, 'temas'));
      const comisiones = dividir(celda(row, 'comisiones'));
      let legislatura = celda(row, 'legislatura');
      const estatus = celda(row, 'estatus');
      const enlace = celda(row, 'enlace');
      const nivelTecnico = this.extraerNivel(celda(row, 'nivel_viabilidad_tecnica'));
      const nivelJuridico = this.extraerNivel(celda(row, 'nivel_viabilidad_juridica'));

      if (!numero || !/^\d+$/.test(numero)) errores.push('Número vacío o no numérico.');
      if (!titulo || titulo.length < 10) errores.push('Título con menos de 10 caracteres.');
      if (!fecha) errores.push('Fecha de presentación ilegible.');
      if (!promotores.length) errores.push('Sin persona legisladora o promovente.');

      if (!legislatura && fecha) {
        legislatura = this.inferirLegislatura(fecha);
        if (!legislatura) advertencias.push('No fue posible inferir la legislatura.');
      } else if (!legislatura) {
        advertencias.push('Sin legislatura.');
      }
      if (!partidos.length) advertencias.push('Sin grupo parlamentario.');
      if (!temas.length) advertencias.push('Sin tema.');
      if (!comisiones.length) advertencias.push('Sin comisión turnada.');
      if (estatus && !estatusValidos.has(normalizarTexto(estatus))) advertencias.push('Estatus fuera del catálogo (se creará uno nuevo).');
      if (enlace && !this.esUrlValida(enlace)) advertencias.push('Enlace mal formado.');

      if (numero) {
        const previo = numerosVistos.get(numero);
        if (previo) advertencias.push(`El número ${numero} se repite en la fila ${previo}.`);
        else numerosVistos.set(numero, linea);
      }

      const estado: FilaAnalizada['estado'] = errores.length ? 'error' : advertencias.length ? 'advertencia' : 'correcta';

      return {
        linea, numero, fecha_presentacion: fecha, titulo, promotores, partidos, temas, comisiones,
        legislatura: legislatura || undefined,
        subtema: celda(row, 'subtema') || undefined,
        resumen: celda(row, 'resumen') || undefined,
        estatus: estatus || undefined,
        enlace: enlace || undefined,
        palabras_clave: celda(row, 'palabras_clave') || undefined,
        problema: celda(row, 'problema') || undefined,
        objetivo: celda(row, 'objetivo') || undefined,
        resumen_general: celda(row, 'resumen_general') || undefined,
        beneficios: celda(row, 'beneficios') || undefined,
        riesgos: celda(row, 'riesgos') || undefined,
        nivel_viabilidad_tecnica: nivelTecnico || undefined,
        nivel_viabilidad_juridica: nivelJuridico || undefined,
        que_funcionaria: celda(row, 'que_funcionaria') || undefined,
        que_podria_fracasar: celda(row, 'que_podria_fracasar') || undefined,
        recomendacion: celda(row, 'recomendacion') || undefined,
        errores, advertencias, estado,
      };
    });

    this.filas.set(resultado);
  }

  private extraerNivel(texto: string): string {
    const t = normalizarTexto(texto);
    const nivel = ['alta', 'media', 'baja'].find((l) => t.startsWith(l));
    return nivel ? nivel.charAt(0).toUpperCase() + nivel.slice(1) : '';
  }

  descargarPlantilla(): void {
    const encabezados = CAMPOS.map((c) => c.label);
    const ejemplo = [
      '1314', '2026-01-15', 'Iniciativa de ejemplo para la plantilla de carga masiva',
      'DIP. NOMBRE APELLIDO', 'morena', 'LXIII (2024-2027)', 'Educación', 'Subtema de ejemplo',
      'Resumen técnico de ejemplo con al menos ochenta caracteres para cumplir la validación mínima requerida.',
      'Educación, Cultura, Ciencia y Tecnología', 'En estudio', 'https://legislacion.congresoedomex.gob.mx/',
      'educacion, reforma, ejemplo', '', '', '', '', '', '', '', '', '', '',
    ];
    descargarCsv('plantilla_iniciativas_inesle.csv', [encabezados, ejemplo]);
  }

  descargarIncidencias(): void {
    const filas = this.filas().filter((f) => f.errores.length || f.advertencias.length);
    const encabezados = ['Fila', 'Número', 'Tipo', 'Detalle'];
    const cuerpo = filas.flatMap((f) => [
      ...f.errores.map((e) => [String(f.linea), f.numero, 'Error', e]),
      ...f.advertencias.map((a) => [String(f.linea), f.numero, 'Advertencia', a]),
    ]);
    descargarCsv('incidencias_carga_masiva.csv', [encabezados, ...cuerpo]);
  }

  importar(): void {
    const filasImportables = this.filas().filter((f) => f.estado !== 'error');
    if (!filasImportables.length) {
      Swal.fire('Nada que importar', 'No hay filas válidas para importar.', 'warning');
      return;
    }

    Swal.fire({
      icon: 'question',
      title: `¿Importar ${filasImportables.length} iniciativa(s)?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, importar',
      cancelButtonText: 'Cancelar',
    }).then((r) => {
      if (!r.isConfirmed) return;

      this.importando.set(true);

      const payloadFilas: ImportarIniciativaFila[] = filasImportables.map((f) => {
        const { linea: _l, errores: _e, advertencias: _a, estado: _s, ...resto } = f;
        return resto;
      });

      this.iniciativasService.importar({
        filas: payloadFilas,
        agregarCatalogos: this.agregarCatalogos,
        siExiste: this.siExiste,
        nombreArchivo: this.nombreArchivo(),
      }).subscribe({
        next: (res: ImportarIniciativasResultado) => {
          this.importando.set(false);
          this.descartar();
          Swal.fire({
            icon: 'success',
            title: 'Carga masiva completada',
            html: `${res.creadas} alta(s), ${res.actualizadas} actualización(es), ${res.omitidas} omitida(s).`,
          });
        },
        error: (err) => {
          this.importando.set(false);
          Swal.fire('Error', err.error?.message ?? 'No se pudo completar la importación.', 'error');
        },
      });
    });
  }
}
