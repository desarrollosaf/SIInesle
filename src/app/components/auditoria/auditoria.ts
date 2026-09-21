import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditoriaService, RegistroAuditoria } from '../../service/auditoria.service';

@Component({
  selector: 'app-auditoria',
  imports: [CommonModule],
  templateUrl: './auditoria.html',
  styleUrl: './auditoria.scss',
})
export class Auditoria implements OnInit {
  loading = signal(false);
  registros = signal<RegistroAuditoria[]>([]);

  constructor(private readonly auditoriaService: AuditoriaService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.auditoriaService.obtenerTodas().subscribe({
      next: (data) => { this.registros.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
