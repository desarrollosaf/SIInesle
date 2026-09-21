import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IniciativasService, EstadisticasIniciativas, Iniciativa } from '../../service/iniciativas.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  loading = signal(false);
  stats = signal<EstadisticasIniciativas | null>(null);
  recientes = signal<Iniciativa[]>([]);

  constructor(private readonly iniciativasService: IniciativasService) {}

  ngOnInit(): void {
    this.cargarEstadisticas();
    this.cargarRecientes();
  }

  cargarEstadisticas(): void {
    this.loading.set(true);
    this.iniciativasService.obtenerEstadisticas().subscribe({
      next: (data) => { this.stats.set(data); this.loading.set(false); },
      error: (err) => { console.error(err); this.loading.set(false); },
    });
  }

  cargarRecientes(): void {
    this.iniciativasService.obtenerTodas().subscribe({
      next: (data) => this.recientes.set(data.slice(0, 5)),
      error: (err) => console.error(err),
    });
  }

  porcentaje(valor: number): number {
    const total = this.stats()?.total ?? 0;
    return total ? Math.round((valor / total) * 100) : 0;
  }

  anchoBarra(total: number): number {
    const max = this.stats()?.total ?? 0;
    return max ? Math.max(2, Math.round((total / max) * 100)) : 0;
  }

  claseEstatus(nombre: string | undefined): string {
    switch (nombre) {
      case 'Aprobada': return 'bg-success-subtle text-success-emphasis';
      case 'Precluida': return 'bg-secondary-subtle text-secondary-emphasis';
      case 'Desechada': return 'bg-danger-subtle text-danger-emphasis';
      case 'Borrador': return 'bg-warning-subtle text-warning-emphasis';
      default: return 'bg-info-subtle text-info-emphasis';
    }
  }
}
