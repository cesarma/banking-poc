import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';

import { StockService } from '../../core/services';
import { Portfolio, PortfolioHolding, HistoricalData } from '../../core/models';

@Component({
  selector: 'app-investments',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DatePipe, DecimalPipe, BaseChartDirective],
  template: `
    <div class="fade-in">
      <div class="page-header">
        <h1>Investment Portfolio</h1>
        <p class="subtitle">Track your investments with real-time market data</p>
      </div>

      @if (isLoading()) {
        <div class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2 text-muted">Loading portfolio data...</p>
        </div>
      } @else {
        <!-- Portfolio Summary Cards -->
        <div class="row g-4 mb-4">
          <div class="col-md-6 col-xl-3">
            <div class="card bg-gradient text-white" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div class="card-body">
                <h6 class="text-white-50 mb-2">Portfolio Value</h6>
                <h2 class="mb-0">{{ portfolio()?.summary?.totalValue | currency }}</h2>
                <small class="text-white-50">Real-time valuation</small>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-xl-3">
            <div class="card bg-gradient text-white" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
              <div class="card-body">
                <h6 class="text-white-50 mb-2">Total Cost Basis</h6>
                <h2 class="mb-0">{{ portfolio()?.summary?.totalCost | currency }}</h2>
                <small class="text-white-50">Original investment</small>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-xl-3">
            <div class="card" [ngClass]="(portfolio()?.summary?.totalGainLoss ?? 0) >= 0 ? 'bg-success' : 'bg-danger'" 
                 style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
              <div class="card-body text-white">
                <h6 class="text-white-50 mb-2">Total Gain/Loss</h6>
                <h2 class="mb-0">
                  {{ (portfolio()?.summary?.totalGainLoss ?? 0) >= 0 ? '+' : '' }}{{ portfolio()?.summary?.totalGainLoss | currency }}
                </h2>
                <small class="text-white-50">
                  {{ (portfolio()?.summary?.totalGainLoss ?? 0) >= 0 ? '+' : '' }}{{ portfolio()?.summary?.totalGainLossPercent }}%
                </small>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-xl-3">
            <div class="card bg-gradient text-white" style="background: linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%);">
              <div class="card-body">
                <h6 class="text-white-50 mb-2">Holdings</h6>
                <h2 class="mb-0">{{ portfolio()?.holdings?.length ?? 0 }}</h2>
                <small class="text-white-50">Different stocks</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="row g-4 mb-4">
          <div class="col-lg-8">
            <div class="card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">{{ selectedStock() }} Performance</h5>
                <div class="btn-group btn-group-sm">
                  @for (period of periods; track period.value) {
                    <button class="btn" 
                            [class.btn-primary]="selectedPeriod() === period.value"
                            [class.btn-outline-primary]="selectedPeriod() !== period.value"
                            (click)="changePeriod(period.value)">
                      {{ period.label }}
                    </button>
                  }
                </div>
              </div>
              <div class="card-body">
                <div class="chart-container" style="height: 300px;">
                  <canvas baseChart
                          [data]="priceChartData()"
                          [type]="'line'"
                          [options]="lineChartOptions">
                  </canvas>
                </div>
              </div>
            </div>
          </div>

          <div class="col-lg-4">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">Portfolio Allocation</h5>
              </div>
              <div class="card-body">
                <div class="chart-container" style="height: 300px;">
                  <canvas baseChart
                          [data]="allocationChartData()"
                          [type]="'doughnut'"
                          [options]="doughnutChartOptions">
                  </canvas>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Holdings Table -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Portfolio Holdings</h5>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead class="table-light">
                  <tr>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th class="text-end">Shares</th>
                    <th class="text-end">Avg Cost</th>
                    <th class="text-end">Current Price</th>
                    <th class="text-end">Total Value</th>
                    <th class="text-end">Gain/Loss</th>
                    <th>Chart</th>
                  </tr>
                </thead>
                <tbody>
                  @for (holding of portfolio()?.holdings; track holding.symbol) {
                    <tr [class.table-active]="selectedStock() === holding.symbol"
                        style="cursor: pointer;"
                        (click)="selectStock(holding.symbol)">
                      <td>
                        <span class="badge bg-dark font-monospace fs-6">{{ holding.symbol }}</span>
                      </td>
                      <td>
                        <div class="fw-medium">{{ holding.companyName }}</div>
                        <small class="text-muted">Purchased: {{ holding.purchaseDate | date:'MMM d, y' }}</small>
                      </td>
                      <td class="text-end fw-medium">{{ holding.shares | number }}</td>
                      <td class="text-end">{{ holding.avgCost | currency }}</td>
                      <td class="text-end fw-medium">{{ holding.currentPrice | currency }}</td>
                      <td class="text-end fw-bold">{{ holding.totalValue | currency }}</td>
                      <td class="text-end">
                        <div [class.text-success]="holding.gainLoss >= 0" [class.text-danger]="holding.gainLoss < 0">
                          <span class="fw-bold">
                            {{ holding.gainLoss >= 0 ? '+' : '' }}{{ holding.gainLoss | currency }}
                          </span>
                          <br>
                          <small>
                            {{ holding.gainLoss >= 0 ? '+' : '' }}{{ holding.gainLossPercent }}%
                          </small>
                        </div>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary" (click)="selectStock(holding.symbol); $event.stopPropagation()">
                          <i class="bi bi-graph-up"></i>
                        </button>
                      </td>
                    </tr>
                  } @empty {
                    <tr>
                      <td colspan="8" class="text-center py-4 text-muted">
                        <i class="bi bi-briefcase fs-1 d-block mb-2"></i>
                        No holdings found
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .table tbody tr:hover {
      background-color: rgba(13, 110, 253, 0.04);
    }

    .table-active {
      background-color: rgba(13, 110, 253, 0.08) !important;
    }
  `]
})
export class InvestmentsComponent implements OnInit {
  private readonly stockService = inject(StockService);

  portfolio = signal<Portfolio | null>(null);
  historicalData = signal<HistoricalData[]>([]);
  selectedStock = signal<string>('AAPL');
  selectedPeriod = signal<string>('1mo');
  isLoading = signal<boolean>(true);

  periods = [
    { value: '1w', label: '1W' },
    { value: '1mo', label: '1M' },
    { value: '3mo', label: '3M' },
    { value: '6mo', label: '6M' },
    { value: '1y', label: '1Y' }
  ];

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: {
        display: true,
        grid: { display: false }
      },
      y: {
        display: true,
        ticks: {
          callback: (value) => '$' + value
        }
      }
    },
    elements: {
      point: { radius: 0 },
      line: { tension: 0.4 }
    }
  };

  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: { usePointStyle: true }
      }
    }
  };

  priceChartData = computed(() => {
    const data = this.historicalData();
    if (!data.length) return { labels: [], datasets: [] };

    return {
      labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        data: data.map(d => d.close),
        borderColor: '#0d6efd',
        backgroundColor: 'rgba(13, 110, 253, 0.1)',
        fill: true,
        borderWidth: 2
      }]
    };
  });

  allocationChartData = computed(() => {
    const holdings = this.portfolio()?.holdings;
    if (!holdings?.length) return { labels: [], datasets: [] };

    const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6610f2', '#0dcaf0', '#fd7e14', '#20c997'];

    return {
      labels: holdings.map(h => h.symbol),
      datasets: [{
        data: holdings.map(h => h.totalValue),
        backgroundColor: holdings.map((_, i) => colors[i % colors.length]),
        borderWidth: 0
      }]
    };
  });

  ngOnInit(): void {
    this.loadPortfolio();
    this.loadHistoricalData();
  }

  private loadPortfolio(): void {
    this.isLoading.set(true);
    // Using customer ID 3 which has investments
    this.stockService.getPortfolio(3).subscribe({
      next: (data) => {
        this.portfolio.set(data);
        this.isLoading.set(false);
        // Select first stock if available
        if (data.holdings?.length && !data.holdings.find(h => h.symbol === this.selectedStock())) {
          this.selectedStock.set(data.holdings[0].symbol);
          this.loadHistoricalData();
        }
      },
      error: (err) => {
        console.error('Failed to load portfolio:', err);
        this.isLoading.set(false);
      }
    });
  }

  private loadHistoricalData(): void {
    this.stockService.getHistorical(this.selectedStock(), this.selectedPeriod()).subscribe({
      next: (data) => this.historicalData.set(data),
      error: (err) => console.error('Failed to load historical data:', err)
    });
  }

  selectStock(symbol: string): void {
    this.selectedStock.set(symbol);
    this.loadHistoricalData();
  }

  changePeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.loadHistoricalData();
  }
}
