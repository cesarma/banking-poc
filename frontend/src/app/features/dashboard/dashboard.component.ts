import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';

import { BankingService, StockService } from '../../core/services';
import { DashboardSummary, LoanSummary, MarketIndex, StockQuote } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, DatePipe, BaseChartDirective],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h1>Dashboard</h1>
        <p class="subtitle">Welcome back! Here's your financial overview</p>
      </div>

      <!-- Market Indices Ticker -->
      <div class="card mb-4">
        <div class="card-body py-2">
          <div class="d-flex flex-wrap justify-content-around">
            @for (index of marketIndices(); track index.symbol) {
              <div class="market-ticker px-3 py-2 text-center">
                <small class="text-muted d-block">{{ index.name }}</small>
                <span class="fw-bold">{{ index.price | number:'1.2-2' }}</span>
                <span class="ms-2 small" [class.stock-up]="index.change >= 0" [class.stock-down]="index.change < 0">
                  {{ index.change >= 0 ? '+' : '' }}{{ index.change | number:'1.2-2' }}
                  ({{ index.changePercent | number:'1.2-2' }}%)
                </span>
              </div>
            } @empty {
              <div class="text-muted">Loading market data...</div>
            }
          </div>
        </div>
      </div>

      <!-- Stat Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-6 col-xl-3">
          <div class="card stat-card bg-primary text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <p class="stat-label mb-1">Total Deposits</p>
                  <h3 class="stat-value">{{ dashboardData()?.totalDeposits | currency }}</h3>
                  <small class="opacity-75">
                    <i class="bi bi-arrow-up"></i> +12.5% from last month
                  </small>
                </div>
                <div class="stat-icon bg-white bg-opacity-25">
                  <i class="bi bi-wallet2 text-white"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card stat-card bg-success text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <p class="stat-label mb-1">Total Customers</p>
                  <h3 class="stat-value">{{ dashboardData()?.totalCustomers | number }}</h3>
                  <small class="opacity-75">
                    <i class="bi bi-arrow-up"></i> +3 new this week
                  </small>
                </div>
                <div class="stat-icon bg-white bg-opacity-25">
                  <i class="bi bi-people text-white"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card stat-card bg-warning text-dark h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <p class="stat-label mb-1">Active Loans</p>
                  <h3 class="stat-value">{{ loanSummary()?.totalLoans | number }}</h3>
                  <small class="opacity-75">
                    {{ loanSummary()?.totalRemaining | currency }} outstanding
                  </small>
                </div>
                <div class="stat-icon bg-dark bg-opacity-10">
                  <i class="bi bi-cash-stack text-dark"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-md-6 col-xl-3">
          <div class="card stat-card bg-info text-white h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between">
                <div>
                  <p class="stat-label mb-1">Avg Interest Rate</p>
                  <h3 class="stat-value">{{ loanSummary()?.averageInterestRate }}%</h3>
                  <small class="opacity-75">
                    Across all loan types
                  </small>
                </div>
                <div class="stat-icon bg-white bg-opacity-25">
                  <i class="bi bi-percent text-white"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Loan Distribution by Type</h5>
              <span class="badge bg-primary">{{ loanSummary()?.totalLoans }} Loans</span>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas baseChart
                        [data]="loanChartData()"
                        [type]="'bar'"
                        [options]="barChartOptions">
                </canvas>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">Loan Type Breakdown</h5>
            </div>
            <div class="card-body">
              <div class="chart-container">
                <canvas baseChart
                        [data]="loanPieData()"
                        [type]="'doughnut'"
                        [options]="pieChartOptions">
                </canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row -->
      <div class="row g-4">
        <!-- Recent Transactions -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Recent Transactions</h5>
              <a href="#" class="text-primary text-decoration-none small">View All</a>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Description</th>
                      <th>Category</th>
                      <th class="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (txn of dashboardData()?.recentTransactions; track txn.id) {
                      <tr>
                        <td>
                          <div class="d-flex align-items-center">
                            <div class="icon-box rounded me-3" 
                                 [class.bg-success-subtle]="txn.amount > 0"
                                 [class.bg-danger-subtle]="txn.amount < 0">
                              <i class="bi" 
                                 [class.bi-arrow-down-left]="txn.amount > 0"
                                 [class.bi-arrow-up-right]="txn.amount < 0"
                                 [class.text-success]="txn.amount > 0"
                                 [class.text-danger]="txn.amount < 0">
                              </i>
                            </div>
                            <div>
                              <div class="fw-medium">{{ txn.description }}</div>
                              <small class="text-muted">{{ txn.date | date:'MMM d, y' }}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge bg-light text-dark">{{ txn.category }}</span>
                        </td>
                        <td class="text-end fw-medium"
                            [class.text-success]="txn.amount > 0"
                            [class.text-danger]="txn.amount < 0">
                          {{ txn.amount | currency }}
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Stocks -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Market Watch</h5>
              <a routerLink="/market" class="text-primary text-decoration-none small">View More</a>
            </div>
            <div class="card-body p-0">
              <div class="table-responsive">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th>Symbol</th>
                      <th>Price</th>
                      <th class="text-end">Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (stock of topStocks(); track stock.symbol) {
                      <tr>
                        <td>
                          <div>
                            <div class="fw-bold">{{ stock.symbol }}</div>
                            <small class="text-muted text-truncate d-block" style="max-width: 150px;">
                              {{ stock.name }}
                            </small>
                          </div>
                        </td>
                        <td class="fw-medium">{{ stock.price | currency }}</td>
                        <td class="text-end">
                          <span [class.stock-up]="stock.change >= 0" [class.stock-down]="stock.change < 0">
                            {{ stock.change >= 0 ? '+' : '' }}{{ stock.change | number:'1.2-2' }}
                            <br>
                            <small>({{ stock.changePercent | number:'1.2-2' }}%)</small>
                          </span>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="3" class="text-center text-muted py-4">
                          Loading stock data...
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .market-ticker {
      min-width: 150px;
    }

    .icon-box {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .chart-container {
      position: relative;
      height: 280px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  private readonly bankingService = inject(BankingService);
  private readonly stockService = inject(StockService);

  // Signals for reactive state
  dashboardData = signal<DashboardSummary | null>(null);
  loanSummary = signal<LoanSummary | null>(null);
  marketIndices = signal<MarketIndex[]>([]);
  topStocks = signal<StockQuote[]>([]);

  // Chart configurations
  barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => '$' + (Number(value) / 1000).toFixed(0) + 'k'
        }
      }
    }
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true }
      }
    }
  };

  // Computed chart data
  loanChartData = computed(() => {
    const summary = this.loanSummary();
    if (!summary?.byType) return { labels: [], datasets: [] };

    const types = Object.keys(summary.byType);
    return {
      labels: types,
      datasets: [{
        data: types.map(t => summary.byType[t].total),
        backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6610f2', '#0dcaf0', '#fd7e14', '#20c997'],
        borderRadius: 6
      }]
    };
  });

  loanPieData = computed(() => {
    const summary = this.loanSummary();
    if (!summary?.byType) return { labels: [], datasets: [] };

    const types = Object.keys(summary.byType);
    return {
      labels: types,
      datasets: [{
        data: types.map(t => summary.byType[t].count),
        backgroundColor: ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6610f2', '#0dcaf0', '#fd7e14', '#20c997']
      }]
    };
  });

  ngOnInit(): void {
    this.loadDashboardData();
    this.loadLoanSummary();
    this.loadMarketData();
    this.loadTopStocks();
  }

  private loadDashboardData(): void {
    this.bankingService.getDashboardSummary().subscribe({
      next: (data) => this.dashboardData.set(data),
      error: (err) => console.error('Failed to load dashboard:', err)
    });
  }

  private loadLoanSummary(): void {
    this.bankingService.getLoanSummary().subscribe({
      next: (data) => this.loanSummary.set(data),
      error: (err) => console.error('Failed to load loan summary:', err)
    });
  }

  private loadMarketData(): void {
    this.stockService.getMarketSummary().subscribe({
      next: (data) => this.marketIndices.set(data),
      error: (err) => console.error('Failed to load market data:', err)
    });
  }

  private loadTopStocks(): void {
    this.stockService.getQuotes(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA']).subscribe({
      next: (data) => this.topStocks.set(data),
      error: (err) => console.error('Failed to load stocks:', err)
    });
  }
}
