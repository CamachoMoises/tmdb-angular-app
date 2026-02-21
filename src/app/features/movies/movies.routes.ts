import { Routes } from '@angular/router';

export const MOVIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/search/search').then(m => m.Search)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/detail/detail').then(m => m.Detail)
  }
];