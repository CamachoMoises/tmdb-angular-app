import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'movies',
    pathMatch: 'full'
  },
  {
    path: 'movies',
    loadChildren: () =>
      import('./features/movies/movies.routes').then(m => m.MOVIES_ROUTES)
  },
  {
    path: '**',
    redirectTo: 'movies'
  }
];