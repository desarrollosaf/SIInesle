import { Routes } from '@angular/router';
import { ImportMasivo } from './import-masivo';

export default [
  {
    path: '',
    component: ImportMasivo,
    title: 'Carga masiva CSV',
  },
] as Routes;
