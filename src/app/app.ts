import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { AuthService } from './service/auth.service';
import { InactividadService } from './service/inactividad.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  auth        = inject(AuthService);
  inactividad = inject(InactividadService);
  private router = inject(Router);

  // El portal público tiene su propio layout (sin sidebar ni header
  // administrativos) aunque quien lo visite tenga una sesión iniciada.
  esVistaPublica = signal(this.router.url.startsWith('/consulta'));

  private onPageShow = (e: PageTransitionEvent) => {
    if (e.persisted) this.auth.verificarBfcache();
  };

  ngOnInit() {
    window.addEventListener('pageshow', this.onPageShow);
    if (this.auth.isLoggedIn()) this.inactividad.iniciar();

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      this.esVistaPublica.set((e as NavigationEnd).urlAfterRedirects.startsWith('/consulta'));
    });
  }

  ngOnDestroy() {
    window.removeEventListener('pageshow', this.onPageShow);
    this.inactividad.detener();
  }
}
