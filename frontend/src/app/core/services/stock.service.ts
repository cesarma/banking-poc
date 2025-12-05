import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  StockQuote,
  HistoricalData,
  MarketIndex,
  Portfolio,
  StockSearchResult,
  Investment
} from '../models';

@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly http = inject(HttpClient);

  // Stock quotes
  getQuotes(symbols?: string[]): Observable<StockQuote[]> {
    const params = symbols ? new HttpParams().set('symbols', symbols.join(',')) : {};
    return this.http.get<StockQuote[]>('/stocks/quotes', { params });
  }

  getQuote(symbol: string): Observable<StockQuote> {
    return this.http.get<StockQuote>(`/stocks/quote/${symbol}`);
  }

  // Historical data
  getHistorical(symbol: string, period: string = '1mo'): Observable<HistoricalData[]> {
    const params = new HttpParams().set('period', period);
    return this.http.get<HistoricalData[]>(`/stocks/historical/${symbol}`, { params });
  }

  // Market summary (major indices)
  getMarketSummary(): Observable<MarketIndex[]> {
    return this.http.get<MarketIndex[]>('/stocks/market-summary');
  }

  // Trending stocks
  getTrendingStocks(): Observable<StockQuote[]> {
    return this.http.get<StockQuote[]>('/stocks/trending');
  }

  // Portfolio with real-time prices
  getPortfolio(customerId: number): Observable<Portfolio> {
    return this.http.get<Portfolio>(`/portfolio/${customerId}`);
  }

  // Investments
  getInvestments(): Observable<Investment[]> {
    return this.http.get<Investment[]>('/investments');
  }

  // Search
  searchStocks(query: string): Observable<StockSearchResult[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<StockSearchResult[]>('/stocks/search', { params });
  }
}
