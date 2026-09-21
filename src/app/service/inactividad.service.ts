import { Injectable, inject, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

const INACTIVIDAD_MS = 3 * 60 * 60 * 1000; // 3 horas
const STORAGE_KEY    = 'ini_last_activity';
const EVENTOS        = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

@Injectable({ providedIn: 'root' })
export class InactividadService {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private zone   = inject(NgZone);

  private handler  = () => this.registrarActividad();
  private intervalo?: ReturnType<typeof setInterval>;

  iniciar(): void {
    this.registrarActividad();

    this.zone.runOutsideAngular(() => {
      EVENTOS.forEach(e => document.addEventListener(e, this.handler, { passive: true }));

      this.intervalo = setInterval(() => {
        const ultima = Number(localStorage.getItem(STORAGE_KEY) ?? 0);
        if (Date.now() - ultima > INACTIVIDAD_MS) {
          this.zone.run(() => this.cerrarPorInactividad());
        }
      }, 60_000); // revisa cada minuto
    });
  }

  detener(): void {
    EVENTOS.forEach(e => document.removeEventListener(e, this.handler));
    if (this.intervalo) clearInterval(this.intervalo);
    localStorage.removeItem(STORAGE_KEY);
  }

  private registrarActividad(): void {
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  }

  private cerrarPorInactividad(): void {
    this.detener();
    this.auth.clearSession();
    this.auth.usuario.set(null);
    this.router.navigate(['/login'], { queryParams: { razon: 'inactividad' } });
  }
}
