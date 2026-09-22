import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicoService, IniciativaPublica } from '../../service/publico.service';
import { normalizarTexto } from '../../shared/csv.util';

type Orden = 'recent' | 'old' | 'number' | 'title';

interface Filtros {
  q: string;
  tema: string;
  estatus: string;
  anio: string;
  partido: string;
  legislador: string;
  legislatura: string;
  comision: string;
}

const FILTROS_VACIOS: Filtros = {
  q: '', tema: '', estatus: '', anio: '', partido: '', legislador: '', legislatura: '', comision: '',
};

const PAGINA = 6;

@Component({
  selector: 'app-publico',
  imports: [CommonModule, FormsModule],
  templateUrl: './publico.html',
  styleUrl: './publico.scss',
})
export class Publico implements OnInit {
  cargando = signal(false);
  registros = signal<IniciativaPublica[]>([]);
  filtros = signal<Filtros>({ ...FILTROS_VACIOS });
  orden = signal<Orden>('recent');
  visibles = signal(PAGINA);
  detalle = signal<IniciativaPublica | null>(null);
  errorBusqueda = signal(false);

  total = computed(() => this.registros().length);

  temasDisponibles = computed(() => this.valoresUnicos((r) => r.temas));
  estatusDisponibles = computed(() => this.valoresUnicos((r) => [r.estatus].filter((x): x is string => !!x)));
  partidosDisponibles = computed(() => this.valoresUnicos((r) => r.partidos));
  legisladoresDisponibles = computed(() => this.valoresUnicos((r) => r.legisladores));
  legislaturasDisponibles = computed(() => this.valoresUnicos((r) => [r.legislatura].filter((x): x is string => !!x)));
  comisionesDisponibles = computed(() => this.valoresUnicos((r) => r.comisiones));
  aniosDisponibles = computed(() => {
    const anios = new Set(this.registros().map((r) => (r.fecha_presentacion || '').slice(0, 4)).filter(Boolean));
    return [...anios].sort((a, b) => b.localeCompare(a));
  });

  temasDestacados = computed(() => {
    const conteo = new Map<string, number>();
    this.registros().forEach((r) => r.temas.forEach((t) => conteo.set(t, (conteo.get(t) ?? 0) + 1)));
    return [...conteo.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es')).slice(0, 5);
  });

  ultimaActualizacion = computed(() => {
    const fechas = this.registros().map((r) => r.fecha_presentacion).filter(Boolean).sort();
    return fechas.length ? fechas[fechas.length - 1] : null;
  });

  resultados = computed(() => {
    const f = this.filtros();
    const q = normalizarTexto(f.q);

    const filtrados = this.registros().filter((r) => {
      const texto = normalizarTexto([
        r.numero, r.titulo, r.resumen, r.legisladores.join(' '), r.partidos.join(' '),
        r.temas.join(' '), r.subtema, r.palabras_clave, r.legislatura, r.comisiones.join(' '),
      ].join(' '));

      return (!q || texto.includes(q))
        && (!f.tema || r.temas.some((t) => normalizarTexto(t).includes(normalizarTexto(f.tema))))
        && (!f.estatus || r.estatus === f.estatus)
        && (!f.anio || (r.fecha_presentacion || '').startsWith(f.anio))
        && (!f.partido || r.partidos.some((p) => normalizarTexto(p).includes(normalizarTexto(f.partido))))
        && (!f.legislador || r.legisladores.some((l) => normalizarTexto(l).includes(normalizarTexto(f.legislador))))
        && (!f.legislatura || r.legislatura === f.legislatura)
        && (!f.comision || r.comisiones.some((c) => normalizarTexto(c).includes(normalizarTexto(f.comision))));
    });

    return this.ordenar(filtrados);
  });

  mostrados = computed(() => this.resultados().slice(0, this.visibles()));
  restantes = computed(() => this.resultados().length - this.mostrados().length);

  filtrosActivos = computed(() => {
    const f = this.filtros();
    const activos: { etiqueta: string; valor: string; limpiar: () => void }[] = [];
    if (f.q) activos.push({ etiqueta: 'Texto', valor: f.q, limpiar: () => this.actualizarFiltro('q', '') });
    if (f.partido) activos.push({ etiqueta: 'Grupo', valor: f.partido, limpiar: () => this.actualizarFiltro('partido', '') });
    if (f.legislador) activos.push({ etiqueta: 'Promovente', valor: f.legislador, limpiar: () => this.actualizarFiltro('legislador', '') });
    if (f.legislatura) activos.push({ etiqueta: 'Legislatura', valor: f.legislatura, limpiar: () => this.actualizarFiltro('legislatura', '') });
    if (f.comision) activos.push({ etiqueta: 'Comisión', valor: f.comision, limpiar: () => this.actualizarFiltro('comision', '') });
    if (f.tema) activos.push({ etiqueta: 'Tema', valor: f.tema, limpiar: () => this.actualizarFiltro('tema', '') });
    if (f.estatus) activos.push({ etiqueta: 'Estatus', valor: f.estatus, limpiar: () => this.actualizarFiltro('estatus', '') });
    if (f.anio) activos.push({ etiqueta: 'Año', valor: f.anio, limpiar: () => this.actualizarFiltro('anio', '') });
    return activos;
  });

  constructor(private readonly publicoService: PublicoService) {}

  ngOnInit(): void {
    this.cargando.set(true);
    this.publicoService.obtenerIniciativas().subscribe({
      next: (data) => { this.registros.set(data); this.cargando.set(false); },
      error: () => this.cargando.set(false),
    });
  }

  private valoresUnicos(extraer: (r: IniciativaPublica) => string[]): string[] {
    const valores = new Set<string>();
    this.registros().forEach((r) => extraer(r).forEach((v) => v && valores.add(v)));
    return [...valores].sort((a, b) => a.localeCompare(b, 'es'));
  }

  private ordenar(lista: IniciativaPublica[]): IniciativaPublica[] {
    const copia = [...lista];
    switch (this.orden()) {
      case 'old': return copia.sort((a, b) => a.fecha_presentacion.localeCompare(b.fecha_presentacion));
      case 'number': return copia.sort((a, b) => Number(b.numero) - Number(a.numero));
      case 'title': return copia.sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
      default: return copia.sort((a, b) => b.fecha_presentacion.localeCompare(a.fecha_presentacion));
    }
  }

  actualizarFiltro<K extends keyof Filtros>(campo: K, valor: Filtros[K]): void {
    this.filtros.update((f) => ({ ...f, [campo]: valor }));
    this.visibles.set(PAGINA);
  }

  buscar(): void {
    if (this.filtros().q.trim().length === 1) {
      this.errorBusqueda.set(true);
      return;
    }
    this.errorBusqueda.set(false);
  }

  alternarTema(tema: string): void {
    this.actualizarFiltro('tema', this.filtros().tema === tema ? '' : tema);
  }

  limpiarFiltros(): void {
    this.filtros.set({ ...FILTROS_VACIOS });
    this.errorBusqueda.set(false);
    this.visibles.set(PAGINA);
  }

  verMas(): void {
    this.visibles.update((v) => v + PAGINA);
  }

  promoventeCorto(r: IniciativaPublica): string {
    if (!r.legisladores.length) return 'Sin promovente';
    return r.legisladores.length > 1
      ? `${r.legisladores[0]} y ${r.legisladores.length - 1} más`
      : r.legisladores[0];
  }

  claseEstatus(nombre: string | null): string {
    switch (nombre) {
      case 'Aprobada': return 'bg-success-subtle text-success-emphasis';
      case 'Precluida': return 'bg-secondary-subtle text-secondary-emphasis';
      case 'Desechada': return 'bg-danger-subtle text-danger-emphasis';
      default: return 'bg-info-subtle text-info-emphasis';
    }
  }

  abrirDetalle(registro: IniciativaPublica): void {
    this.detalle.set(registro);
  }

  cerrarDetalle(): void {
    this.detalle.set(null);
  }
}
