import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule, CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Subject, interval, takeUntil } from 'rxjs';

import { StockService } from '../../core/services';
import { StockQuote, MarketIndex, HistoricalData, StockSearchResult } from '../../core/models';

@Component({
  selector: 'app-market',
  standalone: true,
  imports: [CommonModule, FormsModule, CurrencyPipe, DecimalPipe, BaseChartDirective],
  template: `
    <div class="fade-in">
      <div class="page-header d-flex justify-content-between align-items-start">
        <div>
          <h1>Market Data</h1>
          <p class="subtitle">Real-time stock market information powered by Yahoo Finance</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="badge bg-success">
            <i class="bi bi-broadcast me-1"></i>Live Data
          </span>
          <span class="text-muted small">Last updated: {{ lastUpdated() | date:'shortTime' }}</span>
        </div>
      </div>

      <!-- Market Indices -->
      <div class="row g-3 mb-4">
        @for (index of marketIndices(); track index.symbol) {
          <div class="col-md-6 col-xl-3">
            <div class="card h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 class="text-muted mb-1">{{ index.name || index.symbol }}</h6>
                    <h3 class="mb-0">{{ index.price | number:'1.2-2' }}</h3>
                  </div>
                  <div class="text-end">
                    <span class="badge fs-6" 
                          [class.bg-success]="index.change >= 0" 
                          [class.bg-danger]="index.change < 0">
                      {{ index.change >= 0 ? '+' : '' }}{{ index.change | number:'1.2-2' }}
                    </span>
                    <div class="small mt-1" 
                         [class.text-success]="index.changePercent >= 0"
                         [class.text-danger]="index.changePercent < 0">
                      {{ index.changePercent >= 0 ? '+' : '' }}{{ index.changePercent | number:'1.2-2' }}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        } @empty {
          <div class="col-12">
            <div class="card">
              <div class="card-body text-center">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Loading market indices...
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Search and Chart -->
      <div class="row g-4 mb-4">
        <div class="col-lg-4">
          <div class="card h-100">
            <div class="card-header">
              <h5 class="mb-0">Stock Search</h5>
            </div>
            <div class="card-body">
              <div class="input-group mb-3">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input type="text" 
                       class="form-control" 
                       placeholder="Search stocks (e.g., AAPL, MSFT)"
                       [(ngModel)]="searchQuery"
                       (input)="onSearchInput()">
              </div>

              @if (searchResults().length) {
                <div class="list-group list-group-flush">
                  @for (result of searchResults(); track result.symbol) {
                    <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            (click)="selectSymbol(result.symbol)">
                      <div>
                        <span class="fw-bold">{{ result.symbol }}</span>
                        <small class="text-muted d-block text-truncate" style="max-width: 180px;">{{ result.name }}</small>
                      </div>
                      <span class="badge bg-light text-dark">{{ result.exchange }}</span>
                    </button>
                  }
                </div>
              }

              <hr class="my-3">

              <h6 class="text-muted mb-3">Quick Access</h6>
              <div class="d-flex flex-wrap gap-2">
                @for (symbol of quickAccessSymbols; track symbol) {
                  <button class="btn btn-sm" 
                          [class.btn-primary]="selectedSymbol() === symbol"
                          [class.btn-outline-secondary]="selectedSymbol() !== symbol"
                          (click)="selectSymbol(symbol)">
                    {{ symbol }}
                  </button>
                }
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-8">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0">{{ selectedQuote()?.symbol || 'Select a Stock' }}</h5>
                @if (selectedQuote()) {
                  <small class="text-muted">{{ selectedQuote()?.name }}</small>
                }
              </div>
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
              @if (selectedQuote()) {
                <div class="row mb-3">
                  <div class="col-6 col-md-3">
                    <div class="text-muted small">Price</div>
                    <div class="h4 mb-0">{{ selectedQuote()!.price | currency }}</div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="text-muted small">Change</div>
                    <div class="h5 mb-0" 
                         [class.text-success]="(selectedQuote()!.change ?? 0) >= 0"
                         [class.text-danger]="(selectedQuote()!.change ?? 0) < 0">
                      {{ (selectedQuote()!.change ?? 0) >= 0 ? '+' : '' }}{{ selectedQuote()!.change | number:'1.2-2' }}
                      ({{ selectedQuote()!.changePercent | number:'1.2-2' }}%)
                    </div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="text-muted small">Volume</div>
                    <div class="fw-medium">{{ selectedQuote()!.volume | number }}</div>
                  </div>
                  <div class="col-6 col-md-3">
                    <div class="text-muted small">Market Cap</div>
                    <div class="fw-medium">{{ formatMarketCap(selectedQuote()!.marketCap) }}</div>
                  </div>
                </div>
              }

              <div class="chart-container" style="height: 300px;">
                <canvas baseChart
                        [data]="chartData()"
                        [type]="'line'"
                        [options]="lineChartOptions">
                </canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stock Quotes Table -->
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Watchlist</h5>
          <button class="btn btn-sm btn-outline-primary" (click)="refreshQuotes()">
            <i class="bi bi-arrow-clockwise me-1"></i>Refresh
          </button>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th class="text-end">Price</th>
                  <th class="text-end">Change</th>
                  <th class="text-end">Volume</th>
                  <th class="text-end">Day Range</th>
                  <th class="text-end">52W Range</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                @for (quote of stockQuotes(); track quote.symbol) {
                  <tr [class.table-active]="selectedSymbol() === quote.symbol">
                    <td>
                      <span class="badge bg-dark font-monospace fs-6">{{ quote.symbol }}</span>
                    </td>
                    <td>
                      <span class="text-truncate d-block" style="max-width: 150px;">{{ quote.name }}</span>
                    </td>
                    <td class="text-end fw-bold">{{ quote.price | currency }}</td>
                    <td class="text-end">
                      <span [class.text-success]="quote.change >= 0" [class.text-danger]="quote.change < 0">
                        {{ quote.change >= 0 ? '+' : '' }}{{ quote.change | number:'1.2-2' }}
                        <br>
                        <small>({{ quote.changePercent | number:'1.2-2' }}%)</small>
                      </span>
                    </td>
                    <td class="text-end">{{ quote.volume | number:'1.0-0' }}</td>
                    <td class="text-end">
                      <small>{{ quote.low | currency }} - {{ quote.high | currency }}</small>
                    </td>
                    <td class="text-end">
                      <small>{{ quote.fiftyTwoWeekLow | currency }} - {{ quote.fiftyTwoWeekHigh | currency }}</small>
                    </td>
                    <td>
                      <button class="btn btn-sm btn-outline-primary" (click)="selectSymbol(quote.symbol)">
                        <i class="bi bi-graph-up"></i>
                      </button>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="8" class="text-center py-4">
                      <div class="spinner-border spinner-border-sm me-2"></div>
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
  `,
  styles: [`
    .table-active {
      background-color: rgba(13, 110, 253, 0.08) !important;
    }
  `]
})
export class MarketComponent implements OnInit, OnDestroy {
  private readonly stockService = inject(StockService);
  private readonly destroy$ = new Subject<void>();

  marketIndices = signal<MarketIndex[]>([]);
  stockQuotes = signal<StockQuote[]>([]);
  searchResults = signal<StockSearchResult[]>([]);
  selectedQuote = signal<StockQuote | null>(null);
  historicalData = signal<HistoricalData[]>([]);
  selectedSymbol = signal<string>('AAPL');
  selectedPeriod = signal<string>('1mo');
  lastUpdated = signal<Date>(new Date());

  searchQuery = '';
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;

  quickAccessSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META', 'JPM'];

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
    plugins: { legend: { display: false } },
    scales: {
      x: { display: true, grid: { display: false } },
      y: { display: true, ticks: { callback: (value) => '$' + value } }
    },
    elements: {
      point: { radius: 0 },
      line: { tension: 0.4 }
    }
  };

  chartData = computed(() => {
    const data = this.historicalData();
    if (!data.length) return { labels: [], datasets: [] };

    const isPositive = data.length > 1 && data[data.length - 1].close >= data[0].close;

    return {
      labels: data.map(d => new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
      datasets: [{
        data: data.map(d => d.close),
        borderColor: isPositive ? '#198754' : '#dc3545',
        backgroundColor: isPositive ? 'rgba(25, 135, 84, 0.1)' : 'rgba(220, 53, 69, 0.1)',
        fill: true,
        borderWidth: 2
      }]
    };
  });

  ngOnInit(): void {
    this.loadMarketIndices();
    this.loadStockQuotes();
    this.loadSelectedStock();

    // Auto-refresh every 60 seconds
    interval(60000)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.refreshQuotes());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMarketIndices(): void {
    this.stockService.getMarketSummary().subscribe({
      next: (data) => {
        this.marketIndices.set(data);
        this.lastUpdated.set(new Date());
      },
      error: (err) => console.error('Failed to load market indices:', err)
    });
  }

  private loadStockQuotes(): void {
    this.stockService.getQuotes().subscribe({
      next: (data) => this.stockQuotes.set(data),
      error: (err) => console.error('Failed to load stock quotes:', err)
    });
  }

  private loadSelectedStock(): void {
    this.stockService.getQuote(this.selectedSymbol()).subscribe({
      next: (data) => this.selectedQuote.set(data),
      error: (err) => console.error('Failed to load stock quote:', err)
    });

    this.stockService.getHistorical(this.selectedSymbol(), this.selectedPeriod()).subscribe({
      next: (data) => this.historicalData.set(data),
      error: (err) => console.error('Failed to load historical data:', err)
    });
  }

  selectSymbol(symbol: string): void {
    this.selectedSymbol.set(symbol);
    this.searchResults.set([]);
    this.searchQuery = '';
    this.loadSelectedStock();
  }

  changePeriod(period: string): void {
    this.selectedPeriod.set(period);
    this.stockService.getHistorical(this.selectedSymbol(), period).subscribe({
      next: (data) => this.historicalData.set(data),
      error: (err) => console.error('Failed to load historical data:', err)
    });
  }

  onSearchInput(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    if (this.searchQuery.length < 2) {
      this.searchResults.set([]);
      return;
    }

    this.searchTimeout = setTimeout(() => {
      this.stockService.searchStocks(this.searchQuery).subscribe({
        next: (data) => this.searchResults.set(data),
        error: (err) => console.error('Failed to search stocks:', err)
      });
    }, 300);
  }

  refreshQuotes(): void {
    this.loadMarketIndices();
    this.loadStockQuotes();
    if (this.selectedSymbol()) {
      this.loadSelectedStock();
    }
  }

  formatMarketCap(marketCap: number): string {
    if (!marketCap) return 'N/A';
    if (marketCap >= 1e12) return (marketCap / 1e12).toFixed(2) + 'T';
    if (marketCap >= 1e9) return (marketCap / 1e9).toFixed(2) + 'B';
    if (marketCap >= 1e6) return (marketCap / 1e6).toFixed(2) + 'M';
    return marketCap.toString();
  }
}
