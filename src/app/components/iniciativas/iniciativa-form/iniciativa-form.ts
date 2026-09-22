import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { IniciativasService, IniciativaPayload } from '../../../service/iniciativas.service';
import { CatalogosService, CatalogoItem, TipoCatalogo } from '../../../service/catalogos.service';
import { ComparativasService, Comparativa } from '../../../service/comparativas.service';

function minSeleccion(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const valor = (control.value ?? []) as unknown[];
    return valor.length >= min ? null : { minSeleccion: { min } };
  };
}

function palabrasClaveMinimas(min: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const distintas = new Set(
      String(control.value ?? '').split(',').map((k) => k.trim().toLowerCase()).filter(Boolean),
    );
    return distintas.size >= min ? null : { palabrasClave: { min } };
  };
}

function fechaNoFutura(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const hoy = new Date().toISOString().slice(0, 10);
  return control.value <= hoy ? null : { fechaFutura: true };
}

function urlValida(control: AbstractControl): ValidationErrors | null {
  const valor = String(control.value ?? '').trim();
  if (!valor) return null;
  try {
    const u = new URL(valor);
    return ['http:', 'https:'].includes(u.protocol) ? null : { url: true };
  } catch {
    return { url: true };
  }
}

const CAMPOS_FICHA_TECNICA = [
  'numero', 'fecha_presentacion', 'legislatura_id', 'titulo',
  'legislador_ids', 'partido_ids', 'tema_ids', 'subtema',
  'comision_ids', 'estatus_id', 'resumen', 'palabras_clave',
];

const CAMPOS_ANALISIS_INTEGRAL = [
  'problema', 'objetivo', 'resumen_general', 'beneficios', 'riesgos',
  'nivel_viabilidad_tecnica', 'justificacion_tecnica',
  'nivel_viabilidad_juridica', 'justificacion_juridica',
  'que_funcionaria', 'que_podria_fracasar', 'recomendacion',
];

type CampoPicker = 'legislador_ids' | 'partido_ids' | 'tema_ids' | 'comision_ids';

const PICKERS: Record<CampoPicker, { tipo: TipoCatalogo; pregunta: string }> = {
  legislador_ids: { tipo: 'legisladores', pregunta: 'Nombre de la persona legisladora o promovente:' },
  partido_ids: { tipo: 'partidos', pregunta: 'Nombre del grupo parlamentario o partido:' },
  tema_ids: { tipo: 'temas', pregunta: 'Nombre del tema:' },
  comision_ids: { tipo: 'comisiones', pregunta: 'Nombre de la comisión:' },
};

@Component({
  selector: 'app-iniciativa-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule, NgSelectModule],
  templateUrl: './iniciativa-form.html',
  styleUrl: './iniciativa-form.scss',
})
export class IniciativaForm implements OnInit {
  form: FormGroup;
  loading = signal(false);
  guardando = signal(false);
  iniciativaId = signal<number | null>(null);
  pasoActual = signal<1 | 2 | 3>(1);
  private comparativasEliminadas: number[] = [];

  legisladores = signal<CatalogoItem[]>([]);
  partidos = signal<CatalogoItem[]>([]);
  temas = signal<CatalogoItem[]>([]);
  legislaturas = signal<CatalogoItem[]>([]);
  comisiones = signal<CatalogoItem[]>([]);
  estatus = signal<CatalogoItem[]>([]);

  seleccionActual: Record<CampoPicker, number | null> = {
    legislador_ids: null, partido_ids: null, tema_ids: null, comision_ids: null,
  };

  get comparativas(): FormArray {
    return this.form.get('comparativas') as FormArray;
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly iniciativasService: IniciativasService,
    private readonly catalogosService: CatalogosService,
    private readonly comparativasService: ComparativasService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      numero: ['', [Validators.required, Validators.maxLength(12), Validators.pattern(/^\d+$/)]],
      fecha_presentacion: ['', [Validators.required, fechaNoFutura]],
      legislatura_id: [null, Validators.required],
      titulo: ['', [Validators.required, Validators.minLength(20)]],
      subtema: ['', [Validators.required, Validators.minLength(5)]],
      legislador_ids: [[], minSeleccion(1)],
      partido_ids: [[], minSeleccion(1)],
      tema_ids: [[], minSeleccion(1)],
      comision_ids: [[], minSeleccion(1)],
      estatus_id: [null, Validators.required],
      enlace: ['', urlValida],
      resumen: ['', [Validators.required, Validators.minLength(80)]],
      palabras_clave: ['', [Validators.required, palabrasClaveMinimas(3)]],
      problema: ['', [Validators.required, Validators.minLength(60)]],
      objetivo: ['', [Validators.required, Validators.minLength(40)]],
      resumen_general: ['', [Validators.required, Validators.minLength(80)]],
      beneficios: ['', [Validators.required, Validators.minLength(30)]],
      riesgos: ['', [Validators.required, Validators.minLength(30)]],
      nivel_viabilidad_tecnica: [null, Validators.required],
      justificacion_tecnica: ['', [Validators.required, Validators.minLength(30)]],
      nivel_viabilidad_juridica: [null, Validators.required],
      justificacion_juridica: ['', [Validators.required, Validators.minLength(30)]],
      que_funcionaria: ['', [Validators.required, Validators.minLength(30)]],
      que_podria_fracasar: ['', [Validators.required, Validators.minLength(30)]],
      recomendacion: ['', [Validators.required, Validators.minLength(40)]],
      comparativas: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.cargarCatalogos();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.iniciativaId.set(+id);
      this.cargarIniciativa(+id);
    }
  }

  private cargarCatalogos(): void {
    this.loading.set(true);
    forkJoin({
      legisladores: this.catalogosService.obtenerTodos('legisladores'),
      partidos: this.catalogosService.obtenerTodos('partidos'),
      temas: this.catalogosService.obtenerTodos('temas'),
      legislaturas: this.catalogosService.obtenerTodos('legislaturas'),
      comisiones: this.catalogosService.obtenerTodos('comisiones'),
      estatus: this.catalogosService.obtenerTodos('estatus'),
    }).pipe(finalize(() => this.loading.set(false))).subscribe(({ legisladores, partidos, temas, legislaturas, comisiones, estatus }) => {
      this.legisladores.set(legisladores);
      this.partidos.set(partidos);
      this.temas.set(temas);
      this.legislaturas.set(legislaturas);
      this.comisiones.set(comisiones);
      this.estatus.set(estatus);
    });
  }

  private cargarIniciativa(id: number): void {
    this.loading.set(true);
    this.iniciativasService.obtenerPorId(id).pipe(finalize(() => this.loading.set(false))).subscribe((r) => {
      this.form.patchValue({
        numero: r.numero,
        fecha_presentacion: r.fecha_presentacion?.slice(0, 10),
        legislatura_id: r.legislatura_id,
        titulo: r.titulo,
        subtema: r.subtema,
        legislador_ids: (r.legisladores ?? []).map((x) => x.id),
        partido_ids: (r.partidos ?? []).map((x) => x.id),
        tema_ids: (r.temas ?? []).map((x) => x.id),
        comision_ids: (r.comisiones ?? []).map((x) => x.id),
        estatus_id: r.estatus_id,
        enlace: r.enlace,
        resumen: r.resumen,
        palabras_clave: r.palabras_clave,
        problema: r.problema,
        objetivo: r.objetivo,
        resumen_general: r.resumen_general,
        beneficios: r.beneficios,
        riesgos: r.riesgos,
        nivel_viabilidad_tecnica: r.nivel_viabilidad_tecnica,
        justificacion_tecnica: r.justificacion_tecnica,
        nivel_viabilidad_juridica: r.nivel_viabilidad_juridica,
        justificacion_juridica: r.justificacion_juridica,
        que_funcionaria: r.que_funcionaria,
        que_podria_fracasar: r.que_podria_fracasar,
        recomendacion: r.recomendacion,
      });

      this.comparativasService.obtenerTodas().subscribe((todas) => {
        todas.filter((c) => c.iniciativa_id === id).forEach((c) => this.agregarComparativa(c));
      });
    });
  }

  agregarComparativa(valores: Partial<Comparativa> = {}): void {
    this.comparativas.push(this.fb.group({
      id: [valores.id ?? null],
      pais: [valores.pais ?? '', Validators.required],
      estado_region: [valores.estado_region ?? ''],
      anio: [valores.anio ?? null, Validators.required],
      nombre_ley: [valores.nombre_ley ?? '', Validators.required],
      tema: [valores.tema ?? ''],
      resumen: [valores.resumen ?? ''],
      impacto: [valores.impacto ?? ''],
      que_funciono: [valores.que_funciono ?? ''],
      que_no_funciono: [valores.que_no_funciono ?? ''],
      relevancia_edomex: [valores.relevancia_edomex ?? ''],
    }));
  }

  quitarComparativa(index: number): void {
    const id = this.comparativas.at(index).get('id')?.value;
    if (id) this.comparativasEliminadas.push(id);
    this.comparativas.removeAt(index);
  }

  cancelar(): void {
    this.router.navigate(['/iniciativas']);
  }

  invalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && (control.touched || control.dirty);
  }

  private camposCompletos(campos: string[]): number {
    return campos.filter((campo) => this.form.get(campo)?.valid).length;
  }

  progresoPorcentaje(): number {
    const total = CAMPOS_FICHA_TECNICA.length + CAMPOS_ANALISIS_INTEGRAL.length;
    const completos = this.camposCompletos(CAMPOS_FICHA_TECNICA) + this.camposCompletos(CAMPOS_ANALISIS_INTEGRAL);
    return Math.round((completos / total) * 100);
  }

  conteoFichaTecnica(): string {
    return `${this.camposCompletos(CAMPOS_FICHA_TECNICA)} de ${CAMPOS_FICHA_TECNICA.length}`;
  }

  conteoAnalisisIntegral(): string {
    return `${this.camposCompletos(CAMPOS_ANALISIS_INTEGRAL)} de ${CAMPOS_ANALISIS_INTEGRAL.length}`;
  }

  pasoCompleto(paso: 1 | 2): boolean {
    const campos = paso === 1 ? CAMPOS_FICHA_TECNICA : CAMPOS_ANALISIS_INTEGRAL;
    return this.camposCompletos(campos) === campos.length;
  }

  irAPaso(paso: 1 | 2 | 3): void {
    this.pasoActual.set(paso);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  siguientePaso(): void {
    const campos = this.pasoActual() === 1 ? CAMPOS_FICHA_TECNICA : CAMPOS_ANALISIS_INTEGRAL;
    const invalidos = campos.filter((campo) => this.form.get(campo)?.invalid);

    if (invalidos.length) {
      invalidos.forEach((campo) => this.form.get(campo)?.markAsTouched());
      Swal.fire('Complete la etapa', 'Revise los campos obligatorios marcados en rojo antes de continuar.', 'warning');
      return;
    }

    this.irAPaso((this.pasoActual() + 1) as 1 | 2 | 3);
  }

  anteriorPaso(): void {
    if (this.pasoActual() > 1) this.irAPaso((this.pasoActual() - 1) as 1 | 2 | 3);
  }

  nombreCatalogo(lista: CatalogoItem[], id: number | null): string {
    return lista.find((item) => item.id === id)?.nombre ?? '';
  }

  resumenSeleccion(campo: CampoPicker): string {
    const nombres = this.chipsDe(campo).map((item) => item.nombre);
    return nombres.length ? nombres.join(', ') : 'Ninguno';
  }

  private catalogoDe(campo: CampoPicker): CatalogoItem[] {
    switch (campo) {
      case 'legislador_ids': return this.legisladores();
      case 'partido_ids': return this.partidos();
      case 'tema_ids': return this.temas();
      case 'comision_ids': return this.comisiones();
    }
  }

  private setCatalogo(campo: CampoPicker, items: CatalogoItem[]): void {
    const ordenados = [...items].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    switch (campo) {
      case 'legislador_ids': this.legisladores.set(ordenados); break;
      case 'partido_ids': this.partidos.set(ordenados); break;
      case 'tema_ids': this.temas.set(ordenados); break;
      case 'comision_ids': this.comisiones.set(ordenados); break;
    }
  }

  opcionesPendientes(campo: CampoPicker): CatalogoItem[] {
    const seleccionados: number[] = this.form.value[campo] ?? [];
    return this.catalogoDe(campo).filter((item) => !seleccionados.includes(item.id));
  }

  chipsDe(campo: CampoPicker): CatalogoItem[] {
    const seleccionados: number[] = this.form.value[campo] ?? [];
    const catalogo = this.catalogoDe(campo);
    return seleccionados
      .map((id) => catalogo.find((item) => item.id === id))
      .filter((item): item is CatalogoItem => !!item);
  }

  agregarSeleccion(campo: CampoPicker): void {
    const id = this.seleccionActual[campo];
    if (id == null) return;

    const control = this.form.get(campo)!;
    const actuales: number[] = control.value ?? [];
    if (!actuales.includes(id)) control.setValue([...actuales, id]);
    control.markAsTouched();
    this.seleccionActual[campo] = null;
  }

  quitarSeleccion(campo: CampoPicker, id: number): void {
    const control = this.form.get(campo)!;
    const actuales: number[] = control.value ?? [];
    control.setValue(actuales.filter((x) => x !== id));
    control.markAsTouched();
  }

  darDeAlta(campo: CampoPicker): void {
    const picker = PICKERS[campo];
    Swal.fire({
      title: picker.pregunta,
      input: 'text',
      inputPlaceholder: 'Escriba el nombre completo',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      inputValidator: (valor) => (!valor || valor.trim().length < 2 ? 'Escriba un nombre de al menos 2 caracteres.' : undefined),
    }).then((res) => {
      if (!res.isConfirmed || !res.value) return;

      this.catalogosService.crear(picker.tipo, res.value.trim()).subscribe({
        next: (nuevo) => {
          this.setCatalogo(campo, [...this.catalogoDe(campo), nuevo]);
          const control = this.form.get(campo)!;
          const actuales: number[] = control.value ?? [];
          control.setValue([...actuales, nuevo.id]);
          control.markAsTouched();
        },
        error: (err) => Swal.fire('Error', err.error?.message ?? 'No se pudo dar de alta el valor.', 'error'),
      });
    });
  }

  onSubmit(): void {
    const invalidosFicha = CAMPOS_FICHA_TECNICA.filter((campo) => this.form.get(campo)?.invalid);
    const invalidosAnalisis = CAMPOS_ANALISIS_INTEGRAL.filter((campo) => this.form.get(campo)?.invalid);

    if (invalidosFicha.length || invalidosAnalisis.length) {
      [...invalidosFicha, ...invalidosAnalisis].forEach((campo) => this.form.get(campo)?.markAsTouched());
      this.irAPaso(invalidosFicha.length ? 1 : 2);
      Swal.fire('Formulario incompleto', 'Revise los campos obligatorios marcados en rojo.', 'warning');
      return;
    }

    const { comparativas, ...resto } = this.form.value;
    const payload: IniciativaPayload = resto;

    this.guardando.set(true);
    const id = this.iniciativaId();
    const peticion = id
      ? this.iniciativasService.actualizar(id, payload)
      : this.iniciativasService.crear(payload);

    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: (iniciativa) => this.guardarComparativas(iniciativa.id, comparativas),
      error: (err) => Swal.fire('Error', err.error?.message ?? 'No se pudo guardar la iniciativa.', 'error'),
    });
  }

  private guardarComparativas(iniciativaId: number, comparativas: any[]): void {
    const operaciones = [
      ...this.comparativasEliminadas.map((id) => this.comparativasService.eliminar(id)),
      ...comparativas.map((c) => {
        const { id, ...datos } = c;
        return id
          ? this.comparativasService.actualizar(id, datos)
          : this.comparativasService.crear({ ...datos, iniciativa_id: iniciativaId });
      }),
    ];

    const despues = () => {
      Swal.fire({ icon: 'success', title: 'Iniciativa guardada', timer: 1800, showConfirmButton: false });
      this.router.navigate(['/iniciativas']);
    };

    if (!operaciones.length) { despues(); return; }
    forkJoin(operaciones).subscribe({ next: despues, error: despues });
  }
}
