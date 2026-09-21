import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IniciativasService, Iniciativa } from '../../service/iniciativas.service';

@Component({
  selector: 'app-pendientes',
  imports: [CommonModule, RouterModule],
  templateUrl: './pendientes.html',
  styleUrl: './pendientes.scss',
})
export class Pendientes implements OnInit {
  loading = signal(false);
  pendientes = signal<Iniciativa[]>([]);
  total = signal(0);
  completadas = computed(() => this.total() - this.pendientes().length);
  porcentaje = computed(() => this.total() ? Math.round((this.completadas() / this.total()) * 100) : 0);

  constructor(private readonly iniciativasService: IniciativasService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.iniciativasService.obtenerTodas().subscribe((todas) => this.total.set(todas.length));
    this.iniciativasService.obtenerPendientes().subscribe({
      next: (data) => { this.pendientes.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
