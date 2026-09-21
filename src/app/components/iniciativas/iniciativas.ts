import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import Swal from 'sweetalert2';

import {
  themeQuartz,
  ModuleRegistry,
  AllCommunityModule,
  GridApi,
  ColDef,
} from 'ag-grid-community';

import { IniciativasService, Iniciativa } from '../../service/iniciativas.service';
import { AG_GRID_LOCALE_ES } from '../../shared/ag-grid-locale.es';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-iniciativas',
  imports: [CommonModule, FormsModule, RouterModule, AgGridAngular],
  templateUrl: './iniciativas.html',
  styleUrl: './iniciativas.scss',
})
export class Iniciativas implements OnInit {
  loading = signal(false);
  rowData = signal<Iniciativa[]>([]);
  totalCount = computed(() => this.rowData().length);

  theme = themeQuartz;
  localeText = AG_GRID_LOCALE_ES;
  private gridApi!: GridApi;

  columnDefs: ColDef[] = [
    { field: 'numero', headerName: 'Número', width: 110 },
    { field: 'titulo', headerName: 'Título de la iniciativa', flex: 3 },
    {
      field: 'estatus',
      headerName: 'Estatus',
      width: 140,
      valueGetter: (p: any) => p.data?.estatus?.nombre ?? 'Sin estatus',
    },
    {
      field: 'legislatura',
      headerName: 'Legislatura',
      width: 170,
      valueGetter: (p: any) => p.data?.legislatura?.nombre ?? '—',
    },
    { field: 'fecha_presentacion', headerName: 'Fecha', width: 130 },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 220,
      sortable: false,
      filter: false,
      cellRenderer: () => `
        <div class="act-cell">
          <button type="button" class="act-btn act-btn-ver" data-action="ver" title="Ver"><i class="bi bi-eye"></i><span>Ver</span></button>
          <button type="button" class="act-btn act-btn-editar" data-action="editar" title="Editar"><i class="bi bi-pencil-square"></i><span>Editar</span></button>
          <button type="button" class="act-btn act-btn-eliminar" data-action="eliminar" title="Eliminar"><i class="bi bi-trash"></i><span>Eliminar</span></button>
        </div>
      `,
    },
  ];

  defaultColDef = { sortable: true, filter: true, resizable: true };

  constructor(
    private readonly iniciativasService: IniciativasService,
    private readonly router: Router,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading.set(true);
    this.iniciativasService.obtenerTodas().subscribe({
      next: (data) => { this.rowData.set(data); this.loading.set(false); },
      error: (err) => { console.error(err); this.loading.set(false); },
    });
  }

  onSearch(value: string) {
    this.gridApi?.setGridOption('quickFilterText', value);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
  }

  onCellClicked(event: any): void {
    if (event.colDef?.field !== 'acciones') return;
    const action = event.event.target.closest('[data-action]')?.getAttribute('data-action');

    if (action === 'ver') this.ver(event.data);
    if (action === 'editar') this.editar(event.data);
    if (action === 'eliminar') this.eliminar(event.data);
  }

  ver(row: Iniciativa): void {
    Swal.fire({
      title: `Iniciativa ${row.numero}`,
      html: `
        <div class="text-start small">
          <p><strong>Título:</strong> ${row.titulo}</p>
          <p><strong>Estatus:</strong> ${row.estatus?.nombre ?? 'Sin estatus'}</p>
          <p><strong>Resumen:</strong> ${row.resumen ?? 'Sin captura'}</p>
        </div>
      `,
      confirmButtonText: 'Cerrar',
    });
  }

  editar(row: Iniciativa): void {
    this.router.navigate(['/iniciativas/editar', row.id]);
  }

  eliminar(row: Iniciativa): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Eliminar iniciativa?',
      text: `Se eliminará la iniciativa ${row.numero} y su análisis. Esta acción no se puede deshacer.`,
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.iniciativasService.eliminar(row.id).subscribe({
        next: () => {
          Swal.fire({ icon: 'success', title: 'Iniciativa eliminada', timer: 2000, showConfirmButton: false });
          this.cargar();
        },
        error: (err) => Swal.fire('Error', err.error?.message ?? 'No se pudo eliminar la iniciativa.', 'error'),
      });
    });
  }
}
