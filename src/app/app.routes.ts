import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './layout/main-layout.component';

export const routes: Routes = [
  // Ruta pública: consulta de estado de trámite por DNI (sin login)
  {
    path: 'consulta',
    loadComponent: () =>
      import('./features/tramite/status/tramite-status.component').then(
        m => m.TramiteStatusComponent
      ),
  },
  // Área autenticada
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'tramites/nuevo',
        loadComponent: () =>
          import('./features/tramite/new/tramite-new.component').then(m => m.TramiteNewComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
