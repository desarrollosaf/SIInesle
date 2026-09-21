import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { CatalogosService, CatalogoItem, TipoCatalogo } from '../../service/catalogos.service';

interface CatalogoMeta {
  tipo: TipoCatalogo;
  titulo: string;
  descripcion: string;
  placeholder: string;
}

const CATALOGOS: CatalogoMeta[] = [
  { tipo: 'legisladores', titulo: 'Personas legisladoras y promoventes', descripcion: 'Diputadas, diputados, grupos y otros promoventes con facultad de iniciativa.', placeholder: 'DIP. NOMBRE COMPLETO' },
  { tipo: 'partidos', titulo: 'Grupos parlamentarios y partidos', descripcion: 'Grupos parlamentarios, órganos legislativos y otros tipos de promovente.', placeholder: 'Ej. morena' },
  { tipo: 'temas', titulo: 'Temas', descripcion: 'Clasificación temática de las iniciativas.', placeholder: 'Ej. Salud pública' },
  { tipo: 'legislaturas', titulo: 'Legislaturas', descripcion: 'Periodos legislativos disponibles.', placeholder: 'Ej. LXIII (2024-2027)' },
  { tipo: 'comisiones', titulo: 'Comisiones', descripcion: 'Comisiones a las que puede turnarse una iniciativa.', placeholder: 'Ej. Finanzas Públicas' },
  { tipo: 'estatus', titulo: 'Estatus', descripcion: 'Situación procesal de la iniciativa.', placeholder: 'Ej. Turnada' },
];

@Component({
  selector: 'app-catalogos',
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogos.html',
  styleUrl: './catalogos.scss',
})
export class Catalogos implements OnInit {
  catalogos = CATALOGOS;
  conteos = signal<Record<string, number>>({});

  catalogoActivo = signal<CatalogoMeta | null>(null);
  items = signal<CatalogoItem[]>([]);
  nuevoValor = '';
  error = signal('');

  constructor(private readonly catalogosService: CatalogosService) {}

  ngOnInit(): void {
    this.catalogos.forEach((c) => {
      this.catalogosService.obtenerTodos(c.tipo).subscribe((items) => {
        this.conteos.update((prev) => ({ ...prev, [c.tipo]: items.length }));
      });
    });
  }

  administrar(meta: CatalogoMeta): void {
    this.catalogoActivo.set(meta);
    this.error.set('');
    this.nuevoValor = '';
    this.cargarItems();
  }

  cerrar(): void {
    this.catalogoActivo.set(null);
  }

  private cargarItems(): void {
    const meta = this.catalogoActivo();
    if (!meta) return;
    this.catalogosService.obtenerTodos(meta.tipo).subscribe((items) => {
      this.items.set(items);
      this.conteos.update((prev) => ({ ...prev, [meta.tipo]: items.length }));
    });
  }

  agregar(): void {
    const meta = this.catalogoActivo();
    if (!meta) return;
    const valor = this.nuevoValor.trim();
    if (valor.length < 2) { this.error.set('Escriba un valor de al menos 2 caracteres.'); return; }

    this.catalogosService.crear(meta.tipo, valor).subscribe({
      next: () => { this.nuevoValor = ''; this.error.set(''); this.cargarItems(); },
      error: (err) => this.error.set(err.error?.message ?? 'No se pudo agregar el valor.'),
    });
  }

  editar(item: CatalogoItem): void {
    const meta = this.catalogoActivo();
    if (!meta) return;

    Swal.fire({
      title: 'Editar valor',
      input: 'text',
      inputValue: item.nombre,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (!result.isConfirmed || !result.value?.trim()) return;
      this.catalogosService.actualizar(meta.tipo, item.id, { nombre: result.value.trim() }).subscribe({
        next: () => this.cargarItems(),
        error: (err) => Swal.fire('Error', err.error?.message ?? 'No se pudo actualizar el valor.', 'error'),
      });
    });
  }

  eliminar(item: CatalogoItem): void {
    const meta = this.catalogoActivo();
    if (!meta) return;

    Swal.fire({
      icon: 'warning',
      title: `¿Eliminar "${item.nombre}"?`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.catalogosService.eliminar(meta.tipo, item.id).subscribe({
        next: () => this.cargarItems(),
        error: (err) => Swal.fire('Error', err.error?.message ?? 'No se pudo eliminar el valor.', 'error'),
      });
    });
  }
}
