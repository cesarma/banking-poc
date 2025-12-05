import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent)
  },
  {
    path: 'accounts',
    loadComponent: () => import('./features/accounts/accounts.component')
      .then(m => m.AccountsComponent)
  },
  {
    path: 'loans',
    loadComponent: () => import('./features/loans/loans.component')
      .then(m => m.LoansComponent)
  },
  {
    path: 'investments',
    loadComponent: () => import('./features/investments/investments.component')
      .then(m => m.InvestmentsComponent)
  },
  {
    path: 'market',
    loadComponent: () => import('./features/market/market.component')
      .then(m => m.MarketComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
