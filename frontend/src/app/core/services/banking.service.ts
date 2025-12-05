import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Customer,
  Account,
  Loan,
  LoanSummary,
  Transaction,
  DashboardSummary
} from '../models';

@Injectable({ providedIn: 'root' })
export class BankingService {
  private readonly http = inject(HttpClient);

  // Customer endpoints
  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>('/customers');
  }

  getCustomer(id: number): Observable<Customer> {
    return this.http.get<Customer>(`/customers/${id}`);
  }

  // Account endpoints
  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>('/accounts');
  }

  getCustomerAccounts(customerId: number): Observable<Account[]> {
    return this.http.get<Account[]>(`/accounts/${customerId}`);
  }

  // Loan endpoints
  getLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>('/loans');
  }

  getCustomerLoans(customerId: number): Observable<Loan[]> {
    return this.http.get<Loan[]>(`/loans/customer/${customerId}`);
  }

  getLoanSummary(): Observable<LoanSummary> {
    return this.http.get<LoanSummary>('/loans/summary');
  }

  // Transaction endpoints
  getTransactions(): Observable<Transaction[]> {
    return this.http.get<Transaction[]>('/transactions');
  }

  getAccountTransactions(accountId: string): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(`/transactions/${accountId}`);
  }

  // Dashboard
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>('/dashboard/summary');
  }
}
