import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ComparativasService, Comparativa } from '../../service/comparativas.service';

@Component({
  selector: 'app-comparativas',
  imports: [CommonModule, RouterModule],
  templateUrl: './comparativas.html',
  styleUrl: './comparativas.scss',
})
export class Comparativas implements OnInit {
  loading = signal(false);
  comparativas = signal<Comparativa[]>([]);

  constructor(private readonly comparativasService: ComparativasService) {}

  ngOnInit(): void {
    this.loading.set(true);
    this.comparativasService.obtenerTodas().subscribe({
      next: (data) => { this.comparativas.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
