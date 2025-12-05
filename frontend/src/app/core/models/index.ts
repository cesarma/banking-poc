// Customer Models
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  accountType: string;
  joinDate: string;
}

// Account Models
export interface Account {
  id: string;
  customerId: number;
  type: string;
  balance: number;
  currency: string;
  status: string;
}

// Loan Models
export interface Loan {
  id: string;
  customerId: number;
  type: string;
  principal: number;
  interestRate: number;
  termMonths: number;
  monthlyPayment: number;
  remainingBalance: number;
  status: string;
  startDate: string;
}

export interface LoanSummary {
  totalLoans: number;
  totalPrincipal: number;
  totalRemaining: number;
  byType: Record<string, { count: number; total: number; remaining: number }>;
  averageInterestRate: string;
}

// Transaction Models
export interface Transaction {
  id: string;
  accountId: string;
  type: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}

// Investment Models
export interface Investment {
  id: string;
  customerId: number;
  symbol: string;
  shares: number;
  avgCost: number;
  purchaseDate: string;
}

export interface PortfolioHolding extends Investment {
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: string;
  companyName: string;
  error?: string;
}

export interface PortfolioSummary {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: string;
}

export interface Portfolio {
  holdings: PortfolioHolding[];
  summary: PortfolioSummary;
}

// Stock Models
export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  peRatio?: number;
  eps?: number;
  dividend?: number;
  error?: string;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  error?: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

// Dashboard Models
export interface DashboardSummary {
  totalCustomers: number;
  totalAccounts: number;
  totalDeposits: number;
  totalLoans: number;
  totalLoanValue: number;
  recentTransactions: Transaction[];
}
