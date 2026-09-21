import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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

  private onPageShow = (e: PageTransitionEvent) => {
    if (e.persisted) this.auth.verificarBfcache();
  };

  ngOnInit() {
    window.addEventListener('pageshow', this.onPageShow);
    if (this.auth.isLoggedIn()) this.inactividad.iniciar();
  }

  ngOnDestroy() {
    window.removeEventListener('pageshow', this.onPageShow);
    this.inactividad.detener();
  }
}
