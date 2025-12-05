import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { BankingService } from '../../core/services';
import { Account, Customer, Transaction } from '../../core/models';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe],
  template: `
    <div class="fade-in">
      <div class="page-header d-flex justify-content-between align-items-start">
        <div>
          <h1>Account Management</h1>
          <p class="subtitle">View and manage customer accounts</p>
        </div>
        <button class="btn btn-primary">
          <i class="bi bi-plus-lg me-2"></i>New Account
        </button>
      </div>

      <!-- Account Summary Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-4">
          <div class="card bg-primary text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="text-white-50">Total Balance</h6>
                  <h2 class="mb-0">{{ totalBalance() | currency }}</h2>
                </div>
                <div class="opacity-50">
                  <i class="bi bi-wallet2 fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card bg-success text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="text-white-50">Active Accounts</h6>
                  <h2 class="mb-0">{{ accounts().length }}</h2>
                </div>
                <div class="opacity-50">
                  <i class="bi bi-credit-card fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card bg-info text-white">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <h6 class="text-white-50">Customers</h6>
                  <h2 class="mb-0">{{ customers().length }}</h2>
                </div>
                <div class="opacity-50">
                  <i class="bi bi-people fs-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Accounts List -->
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">All Accounts</h5>
              <div class="input-group input-group-sm" style="width: 200px;">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control" placeholder="Search..." [(ngModel)]="searchTerm">
              </div>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Account ID</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th class="text-end">Balance</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (account of filteredAccounts(); track account.id) {
                      <tr [class.table-primary]="selectedAccount()?.id === account.id"
                          (click)="selectAccount(account)"
                          style="cursor: pointer;">
                        <td>
                          <span class="badge bg-light text-dark font-monospace">{{ account.id }}</span>
                        </td>
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="avatar-sm bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-2"
                                 style="width: 32px; height: 32px; font-size: 0.75rem;">
                              {{ getCustomerInitials(account.customerId) }}
                            </div>
                            <div>
                              <div class="fw-medium">{{ getCustomerName(account.customerId) }}</div>
                              <small class="text-muted">{{ getCustomerEmail(account.customerId) }}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge" [ngClass]="getAccountTypeBadge(account.type)">
                            <i class="bi me-1" [ngClass]="getAccountTypeIcon(account.type)"></i>
                            {{ account.type }}
                          </span>
                        </td>
                        <td class="text-end fw-bold">{{ account.balance | currency }}</td>
                        <td>
                          <span class="badge bg-success-subtle text-success">
                            <i class="bi bi-check-circle me-1"></i>{{ account.status }}
                          </span>
                        </td>
                        <td>
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" title="View Details" (click)="selectAccount(account); $event.stopPropagation()">
                              <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-outline-secondary" title="Transfer">
                              <i class="bi bi-arrow-left-right"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="6" class="text-center py-4 text-muted">
                          No accounts found
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Account Details Sidebar -->
        <div class="col-lg-4">
          @if (selectedAccount()) {
            <div class="card sticky-top" style="top: 80px;">
              <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Account Details</h5>
              </div>
              <div class="card-body">
                <div class="text-center mb-4">
                  <div class="avatar-lg bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                       style="width: 64px; height: 64px; font-size: 1.5rem;">
                    {{ getCustomerInitials(selectedAccount()!.customerId) }}
                  </div>
                  <h5 class="mb-1">{{ getCustomerName(selectedAccount()!.customerId) }}</h5>
                  <p class="text-muted mb-0">{{ selectedAccount()!.type }} Account</p>
                </div>

                <div class="bg-light rounded p-3 mb-4 text-center">
                  <small class="text-muted d-block">Current Balance</small>
                  <h2 class="mb-0 text-primary">{{ selectedAccount()!.balance | currency }}</h2>
                </div>

                <ul class="list-unstyled">
                  <li class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Account ID</span>
                    <span class="fw-medium font-monospace">{{ selectedAccount()!.id }}</span>
                  </li>
                  <li class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Type</span>
                    <span class="fw-medium">{{ selectedAccount()!.type }}</span>
                  </li>
                  <li class="d-flex justify-content-between py-2 border-bottom">
                    <span class="text-muted">Currency</span>
                    <span class="fw-medium">{{ selectedAccount()!.currency }}</span>
                  </li>
                  <li class="d-flex justify-content-between py-2">
                    <span class="text-muted">Status</span>
                    <span class="badge bg-success">{{ selectedAccount()!.status }}</span>
                  </li>
                </ul>

                <div class="d-grid gap-2 mt-4">
                  <button class="btn btn-primary">
                    <i class="bi bi-arrow-left-right me-2"></i>Transfer Funds
                  </button>
                  <button class="btn btn-outline-secondary">
                    <i class="bi bi-file-earmark-text me-2"></i>View Statements
                  </button>
                </div>
              </div>
            </div>
          } @else {
            <div class="card">
              <div class="card-body text-center py-5 text-muted">
                <i class="bi bi-hand-index-thumb fs-1 mb-3 d-block"></i>
                <p class="mb-0">Select an account to view details</p>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-sm, .avatar-lg {
      font-weight: 600;
    }

    tr.table-primary {
      background-color: rgba(13, 110, 253, 0.1) !important;
    }
  `]
})
export class AccountsComponent implements OnInit {
  private readonly bankingService = inject(BankingService);

  accounts = signal<Account[]>([]);
  customers = signal<Customer[]>([]);
  selectedAccount = signal<Account | null>(null);
  searchTerm = '';

  totalBalance = computed(() => 
    this.accounts().reduce((sum, acc) => sum + acc.balance, 0)
  );

  filteredAccounts = computed(() => {
    if (!this.searchTerm) return this.accounts();

    const term = this.searchTerm.toLowerCase();
    return this.accounts().filter(acc =>
      acc.id.toLowerCase().includes(term) ||
      acc.type.toLowerCase().includes(term) ||
      this.getCustomerName(acc.customerId).toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadAccounts();
    this.loadCustomers();
  }

  private loadAccounts(): void {
    this.bankingService.getAccounts().subscribe({
      next: (data) => this.accounts.set(data),
      error: (err) => console.error('Failed to load accounts:', err)
    });
  }

  private loadCustomers(): void {
    this.bankingService.getCustomers().subscribe({
      next: (data) => this.customers.set(data),
      error: (err) => console.error('Failed to load customers:', err)
    });
  }

  selectAccount(account: Account): void {
    this.selectedAccount.set(account);
  }

  getCustomerName(customerId: number): string {
    return this.customers().find(c => c.id === customerId)?.name || 'Unknown';
  }

  getCustomerEmail(customerId: number): string {
    return this.customers().find(c => c.id === customerId)?.email || '';
  }

  getCustomerInitials(customerId: number): string {
    const name = this.getCustomerName(customerId);
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  }

  getAccountTypeBadge(type: string): string {
    const badges: Record<string, string> = {
      'Checking': 'bg-primary-subtle text-primary',
      'Savings': 'bg-success-subtle text-success',
      'Investment': 'bg-warning-subtle text-warning',
      'Business': 'bg-info-subtle text-info'
    };
    return badges[type] || 'bg-secondary-subtle text-secondary';
  }

  getAccountTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      'Checking': 'bi-credit-card',
      'Savings': 'bi-piggy-bank',
      'Investment': 'bi-graph-up',
      'Business': 'bi-building'
    };
    return icons[type] || 'bi-wallet';
  }
}
