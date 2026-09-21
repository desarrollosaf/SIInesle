import { Routes } from '@angular/router';
import { Iniciativas } from './iniciativas';
import { IniciativaForm } from './iniciativa-form/iniciativa-form';

export default [
  {
    path: '',
    component: Iniciativas,
    title: 'Consulta de iniciativas',
  },
  {
    path: 'crear',
    component: IniciativaForm,
    title: 'Nueva iniciativa',
  },
  {
    path: 'editar/:id',
    component: IniciativaForm,
    title: 'Editar iniciativa',
  },
] as Routes;
