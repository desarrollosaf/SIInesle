import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Login } from './components/login/login';
import { authGuard } from './guards/auth.guard';
import { publicGuard } from './guards/public.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    canActivate: [publicGuard],
    title: 'Iniciar Sesión',
  },
  {
    path: '',
    component: Dashboard,
    canActivate: [authGuard],
    title: 'Resumen operativo - Sistema de Iniciativas INESLE',
  },
  {
    path: 'iniciativas',
    canActivate: [authGuard],
    loadChildren: () => import('./components/iniciativas/iniciativas.route'),
  },
  {
    path: 'import-masivo',
    canActivate: [authGuard],
    loadChildren: () => import('./components/import-masivo/import-masivo.route'),
  },
  {
    path: 'pendientes',
    canActivate: [authGuard],
    loadChildren: () => import('./components/pendientes/pendientes.route'),
  },
  {
    path: 'comparativas',
    canActivate: [authGuard],
    loadChildren: () => import('./components/comparativas/comparativas.route'),
  },
  {
    path: 'catalogos',
    canActivate: [authGuard],
    loadChildren: () => import('./components/catalogos/catalogos.route'),
  },
  {
    path: 'auditoria',
    canActivate: [authGuard],
    loadChildren: () => import('./components/auditoria/auditoria.route'),
  },
  {
    path: 'ayuda',
    canActivate: [authGuard],
    loadChildren: () => import('./components/ayuda/ayuda.route'),
  },
  {
    // Sin authGuard a propósito: es el portal de consulta ciudadana.
    path: 'consulta',
    loadChildren: () => import('./components/publico/publico.route'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
