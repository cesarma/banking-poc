import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { BankingService } from '../../core/services';
import { Loan, LoanSummary, Customer } from '../../core/models';

@Component({
  selector: 'app-loans',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, PercentPipe, BaseChartDirective],
  template: `
    <div class="fade-in">
      <div class="page-header d-flex justify-content-between align-items-start">
        <div>
          <h1>Loan Management</h1>
          <p class="subtitle">Track and manage all loan portfolios</p>
        </div>
        <button class="btn btn-primary">
          <i class="bi bi-plus-lg me-2"></i>New Loan
        </button>
      </div>

      <!-- Summary Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-6 col-xl-3">
          <div class="card border-start border-primary border-4">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <div class="bg-primary bg-opacity-10 rounded-circle p-3">
                    <i class="bi bi-file-earmark-text text-primary fs-4"></i>
                  </div>
                </div>
                <div>
                  <h6 class="text-muted mb-1">Total Loans</h6>
                  <h3 class="mb-0">{{ loanSummary()?.totalLoans }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card border-start border-success border-4">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <div class="bg-success bg-opacity-10 rounded-circle p-3">
                    <i class="bi bi-currency-dollar text-success fs-4"></i>
                  </div>
                </div>
                <div>
                  <h6 class="text-muted mb-1">Total Principal</h6>
                  <h3 class="mb-0">{{ loanSummary()?.totalPrincipal | currency:'USD':'symbol':'1.0-0' }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card border-start border-warning border-4">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <div class="bg-warning bg-opacity-10 rounded-circle p-3">
                    <i class="bi bi-hourglass-split text-warning fs-4"></i>
                  </div>
                </div>
                <div>
                  <h6 class="text-muted mb-1">Outstanding</h6>
                  <h3 class="mb-0">{{ loanSummary()?.totalRemaining | currency:'USD':'symbol':'1.0-0' }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card border-start border-info border-4">
            <div class="card-body">
              <div class="d-flex align-items-center">
                <div class="flex-shrink-0 me-3">
                  <div class="bg-info bg-opacity-10 rounded-circle p-3">
                    <i class="bi bi-percent text-info fs-4"></i>
                  </div>
                </div>
                <div>
                  <h6 class="text-muted mb-1">Avg Interest</h6>
                  <h3 class="mb-0">{{ loanSummary()?.averageInterestRate }}%</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts and Analysis -->
      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Loan Distribution by Type</h5>
            </div>
            <div class="card-body">
              <div class="chart-container" style="height: 300px;">
                <canvas baseChart
                        [data]="loanDistributionData()"
                        [type]="'bar'"
                        [options]="barChartOptions">
                </canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h5 class="mb-0">Loan Type Breakdown</h5>
            </div>
            <div class="card-body">
              @if (loanSummary()?.byType) {
                <div class="loan-breakdown">
                  @for (type of loanTypes(); track type) {
                    <div class="breakdown-item mb-3">
                      <div class="d-flex justify-content-between mb-1">
                        <span class="fw-medium">{{ type }}</span>
                        <span class="text-muted">{{ loanSummary()!.byType[type].count }} loans</span>
                      </div>
                      <div class="progress" style="height: 8px;">
                        <div class="progress-bar" 
                             [style.width.%]="getTypePercentage(type)"
                             [style.backgroundColor]="getTypeColor(type)">
                        </div>
                      </div>
                      <small class="text-muted">
                        {{ loanSummary()!.byType[type].remaining | currency:'USD':'symbol':'1.0-0' }} remaining
                      </small>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Loans Table -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">All Loans</h5>
          <div class="d-flex gap-2">
            <select class="form-select form-select-sm" [(ngModel)]="filterType" style="width: auto;">
              <option value="">All Types</option>
              @for (type of loanTypes(); track type) {
                <option [value]="type">{{ type }}</option>
              }
            </select>
            <div class="input-group input-group-sm" style="width: 200px;">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control" placeholder="Search..." [(ngModel)]="searchTerm">
            </div>
          </div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Loan ID</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Principal</th>
                  <th>Interest</th>
                  <th>Monthly</th>
                  <th>Remaining</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (loan of filteredLoans(); track loan.id) {
                  <tr>
                    <td>
                      <span class="badge bg-light text-dark font-monospace">{{ loan.id }}</span>
                    </td>
                    <td>
                      <div class="d-flex align-items-center">
                        <div class="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                             style="width: 32px; height: 32px; font-size: 0.75rem;">
                          {{ getCustomerInitials(loan.customerId) }}
                        </div>
                        {{ getCustomerName(loan.customerId) }}
                      </div>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getLoanTypeBadgeClass(loan.type)">
                        {{ loan.type }}
                      </span>
                    </td>
                    <td class="fw-medium">{{ loan.principal | currency }}</td>
                    <td>{{ loan.interestRate }}%</td>
                    <td>{{ loan.monthlyPayment | currency }}</td>
                    <td>
                      <div>
                        {{ loan.remainingBalance | currency }}
                        <div class="progress mt-1" style="height: 4px;">
                          <div class="progress-bar bg-success" 
                               [style.width.%]="getPaidPercentage(loan)">
                          </div>
                        </div>
                        <small class="text-muted">{{ getPaidPercentage(loan) | number:'1.0-0' }}% paid</small>
                      </div>
                    </td>
                    <td>
                      <span class="badge bg-success-subtle text-success">{{ loan.status }}</span>
                    </td>
                    <td>
                      <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-secondary" title="View Details">
                          <i class="bi bi-eye"></i>
                        </button>
                        <button class="btn btn-outline-secondary" title="Edit">
                          <i class="bi bi-pencil"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="9" class="text-center py-4 text-muted">
                      <i class="bi bi-inbox fs-1 d-block mb-2"></i>
                      No loans found
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-sm {
      font-weight: 600;
    }

    .loan-breakdown .progress {
      border-radius: 4px;
    }
  `]
})
export class LoansComponent implements OnInit {
  private readonly bankingService = inject(BankingService);

  loans = signal<Loan[]>([]);
  loanSummary = signal<LoanSummary | null>(null);
  customers = signal<Customer[]>([]);

  filterType = '';
  searchTerm = '';

  private readonly typeColors: Record<string, string> = {
    'Mortgage': '#0d6efd',
    'Auto': '#198754',
    'Personal': '#ffc107',
    'Business': '#dc3545',
    'Student': '#6610f2',
    'HELOC': '#0dcaf0'
  };

  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value) => '$' + (Number(value) / 1000).toFixed(0) + 'k' }
      }
    }
  };

  loanTypes = computed(() => {
    const summary = this.loanSummary();
    return summary?.byType ? Object.keys(summary.byType) : [];
  });

  loanDistributionData = computed(() => {
    const summary = this.loanSummary();
    if (!summary?.byType) return { labels: [], datasets: [] };

    const types = Object.keys(summary.byType);
    return {
      labels: types,
      datasets: [{
        label: 'Total Principal',
        data: types.map(t => summary.byType[t].total),
        backgroundColor: types.map(t => this.typeColors[t] || '#6c757d'),
        borderRadius: 6
      }, {
        label: 'Remaining Balance',
        data: types.map(t => summary.byType[t].remaining),
        backgroundColor: types.map(t => this.typeColors[t] + '80' || '#6c757d80'),
        borderRadius: 6
      }]
    };
  });

  filteredLoans = computed(() => {
    let result = this.loans();

    if (this.filterType) {
      result = result.filter(l => l.type === this.filterType);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(l =>
        l.id.toLowerCase().includes(term) ||
        l.type.toLowerCase().includes(term) ||
        this.getCustomerName(l.customerId).toLowerCase().includes(term)
      );
    }

    return result;
  });

  ngOnInit(): void {
    this.loadLoans();
    this.loadLoanSummary();
    this.loadCustomers();
  }

  private loadLoans(): void {
    this.bankingService.getLoans().subscribe({
      next: (data) => this.loans.set(data),
      error: (err) => console.error('Failed to load loans:', err)
    });
  }

  private loadLoanSummary(): void {
    this.bankingService.getLoanSummary().subscribe({
      next: (data) => this.loanSummary.set(data),
      error: (err) => console.error('Failed to load loan summary:', err)
    });
  }

  private loadCustomers(): void {
    this.bankingService.getCustomers().subscribe({
      next: (data) => this.customers.set(data),
      error: (err) => console.error('Failed to load customers:', err)
    });
  }

  getCustomerName(customerId: number): string {
    return this.customers().find(c => c.id === customerId)?.name || 'Unknown';
  }

  getCustomerInitials(customerId: number): string {
    const name = this.getCustomerName(customerId);
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  }

  getLoanTypeBadgeClass(type: string): string {
    const classes: Record<string, string> = {
      'Mortgage': 'bg-primary-subtle text-primary',
      'Auto': 'bg-success-subtle text-success',
      'Personal': 'bg-warning-subtle text-warning',
      'Business': 'bg-danger-subtle text-danger',
      'Student': 'bg-info-subtle text-info',
      'HELOC': 'bg-secondary-subtle text-secondary'
    };
    return classes[type] || 'bg-light text-dark';
  }

  getPaidPercentage(loan: Loan): number {
    return ((loan.principal - loan.remainingBalance) / loan.principal) * 100;
  }

  getTypePercentage(type: string): number {
    const summary = this.loanSummary();
    if (!summary?.byType) return 0;
    return (summary.byType[type].total / summary.totalPrincipal) * 100;
  }

  getTypeColor(type: string): string {
    return this.typeColors[type] || '#6c757d';
  }
}
