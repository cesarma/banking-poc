import express from 'express';
import cors from 'cors';
import yahooFinance from 'yahoo-finance2';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ============================================
// DUMMY BANKING DATA
// ============================================

const customers = [
  { id: 1, name: 'John Smith', email: 'john.smith@email.com', phone: '555-0101', accountType: 'Premium', joinDate: '2020-03-15' },
  { id: 2, name: 'Sarah Johnson', email: 'sarah.j@email.com', phone: '555-0102', accountType: 'Standard', joinDate: '2021-07-22' },
  { id: 3, name: 'Michael Brown', email: 'mbrown@email.com', phone: '555-0103', accountType: 'Premium', joinDate: '2019-11-08' },
  { id: 4, name: 'Emily Davis', email: 'emily.d@email.com', phone: '555-0104', accountType: 'Business', joinDate: '2022-01-30' },
  { id: 5, name: 'Robert Wilson', email: 'rwilson@email.com', phone: '555-0105', accountType: 'Standard', joinDate: '2023-04-12' },
];

const accounts = [
  { id: 'ACC001', customerId: 1, type: 'Checking', balance: 15420.50, currency: 'USD', status: 'Active' },
  { id: 'ACC002', customerId: 1, type: 'Savings', balance: 45000.00, currency: 'USD', status: 'Active' },
  { id: 'ACC003', customerId: 2, type: 'Checking', balance: 8750.25, currency: 'USD', status: 'Active' },
  { id: 'ACC004', customerId: 3, type: 'Investment', balance: 125000.00, currency: 'USD', status: 'Active' },
  { id: 'ACC005', customerId: 4, type: 'Business', balance: 89500.75, currency: 'USD', status: 'Active' },
  { id: 'ACC006', customerId: 5, type: 'Checking', balance: 3200.00, currency: 'USD', status: 'Active' },
];

const loans = [
  { id: 'LN001', customerId: 1, type: 'Mortgage', principal: 350000, interestRate: 6.5, termMonths: 360, monthlyPayment: 2212.24, remainingBalance: 325000, status: 'Active', startDate: '2022-06-01' },
  { id: 'LN002', customerId: 1, type: 'Auto', principal: 35000, interestRate: 5.9, termMonths: 60, monthlyPayment: 675.32, remainingBalance: 22000, status: 'Active', startDate: '2023-01-15' },
  { id: 'LN003', customerId: 2, type: 'Personal', principal: 15000, interestRate: 9.5, termMonths: 36, monthlyPayment: 480.65, remainingBalance: 8500, status: 'Active', startDate: '2023-08-01' },
  { id: 'LN004', customerId: 3, type: 'Mortgage', principal: 525000, interestRate: 6.25, termMonths: 360, monthlyPayment: 3232.89, remainingBalance: 498000, status: 'Active', startDate: '2023-03-01' },
  { id: 'LN005', customerId: 4, type: 'Business', principal: 150000, interestRate: 7.5, termMonths: 84, monthlyPayment: 2318.45, remainingBalance: 125000, status: 'Active', startDate: '2022-11-01' },
  { id: 'LN006', customerId: 5, type: 'Student', principal: 45000, interestRate: 4.5, termMonths: 120, monthlyPayment: 466.08, remainingBalance: 42000, status: 'Active', startDate: '2023-09-01' },
  { id: 'LN007', customerId: 2, type: 'Auto', principal: 28000, interestRate: 6.2, termMonths: 48, monthlyPayment: 660.12, remainingBalance: 18500, status: 'Active', startDate: '2023-05-15' },
  { id: 'LN008', customerId: 3, type: 'HELOC', principal: 75000, interestRate: 8.0, termMonths: 180, monthlyPayment: 716.74, remainingBalance: 68000, status: 'Active', startDate: '2022-08-01' },
];

const transactions = [
  { id: 'TXN001', accountId: 'ACC001', type: 'Deposit', amount: 5000, date: '2024-01-15', description: 'Payroll Deposit', category: 'Income' },
  { id: 'TXN002', accountId: 'ACC001', type: 'Withdrawal', amount: -1200, date: '2024-01-16', description: 'Rent Payment', category: 'Housing' },
  { id: 'TXN003', accountId: 'ACC001', type: 'Withdrawal', amount: -85.50, date: '2024-01-17', description: 'Grocery Store', category: 'Food' },
  { id: 'TXN004', accountId: 'ACC002', type: 'Transfer', amount: 2000, date: '2024-01-18', description: 'Savings Transfer', category: 'Transfer' },
  { id: 'TXN005', accountId: 'ACC003', type: 'Deposit', amount: 3500, date: '2024-01-15', description: 'Payroll Deposit', category: 'Income' },
  { id: 'TXN006', accountId: 'ACC003', type: 'Withdrawal', amount: -450, date: '2024-01-19', description: 'Utility Bills', category: 'Utilities' },
  { id: 'TXN007', accountId: 'ACC004', type: 'Deposit', amount: 10000, date: '2024-01-20', description: 'Investment Return', category: 'Investment' },
  { id: 'TXN008', accountId: 'ACC005', type: 'Deposit', amount: 25000, date: '2024-01-21', description: 'Client Payment', category: 'Business' },
  { id: 'TXN009', accountId: 'ACC001', type: 'Withdrawal', amount: -2212.24, date: '2024-01-22', description: 'Mortgage Payment', category: 'Loan' },
  { id: 'TXN010', accountId: 'ACC001', type: 'Withdrawal', amount: -675.32, date: '2024-01-22', description: 'Auto Loan Payment', category: 'Loan' },
];

const investmentPortfolio = [
  { id: 'INV001', customerId: 3, symbol: 'AAPL', shares: 150, avgCost: 145.50, purchaseDate: '2023-01-15' },
  { id: 'INV002', customerId: 3, symbol: 'MSFT', shares: 100, avgCost: 280.00, purchaseDate: '2023-02-20' },
  { id: 'INV003', customerId: 3, symbol: 'GOOGL', shares: 50, avgCost: 125.00, purchaseDate: '2023-03-10' },
  { id: 'INV004', customerId: 3, symbol: 'AMZN', shares: 75, avgCost: 135.00, purchaseDate: '2023-04-05' },
  { id: 'INV005', customerId: 3, symbol: 'NVDA', shares: 80, avgCost: 450.00, purchaseDate: '2023-05-15' },
  { id: 'INV006', customerId: 3, symbol: 'TSLA', shares: 60, avgCost: 220.00, purchaseDate: '2023-06-01' },
  { id: 'INV007', customerId: 4, symbol: 'JPM', shares: 200, avgCost: 145.00, purchaseDate: '2023-01-20' },
  { id: 'INV008', customerId: 4, symbol: 'V', shares: 120, avgCost: 235.00, purchaseDate: '2023-03-15' },
];

// ============================================
// BANKING ENDPOINTS
// ============================================

app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.get('/api/customers/:id', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json(customer);
});

app.get('/api/accounts', (req, res) => {
  res.json(accounts);
});

app.get('/api/accounts/:customerId', (req, res) => {
  const customerAccounts = accounts.filter(a => a.customerId === parseInt(req.params.customerId));
  res.json(customerAccounts);
});

app.get('/api/loans', (req, res) => {
  res.json(loans);
});

app.get('/api/loans/customer/:customerId', (req, res) => {
  const customerLoans = loans.filter(l => l.customerId === parseInt(req.params.customerId));
  res.json(customerLoans);
});

app.get('/api/loans/summary', (req, res) => {
  const summary = {
    totalLoans: loans.length,
    totalPrincipal: loans.reduce((sum, l) => sum + l.principal, 0),
    totalRemaining: loans.reduce((sum, l) => sum + l.remainingBalance, 0),
    byType: loans.reduce((acc, l) => {
      if (!acc[l.type]) acc[l.type] = { count: 0, total: 0, remaining: 0 };
      acc[l.type].count++;
      acc[l.type].total += l.principal;
      acc[l.type].remaining += l.remainingBalance;
      return acc;
    }, {}),
    averageInterestRate: (loans.reduce((sum, l) => sum + l.interestRate, 0) / loans.length).toFixed(2)
  };
  res.json(summary);
});

app.get('/api/transactions', (req, res) => {
  res.json(transactions);
});

app.get('/api/transactions/:accountId', (req, res) => {
  const accountTransactions = transactions.filter(t => t.accountId === req.params.accountId);
  res.json(accountTransactions);
});

app.get('/api/investments', (req, res) => {
  res.json(investmentPortfolio);
});

app.get('/api/dashboard/summary', (req, res) => {
  const summary = {
    totalCustomers: customers.length,
    totalAccounts: accounts.length,
    totalDeposits: accounts.reduce((sum, a) => sum + a.balance, 0),
    totalLoans: loans.length,
    totalLoanValue: loans.reduce((sum, l) => sum + l.remainingBalance, 0),
    recentTransactions: transactions.slice(-5).reverse()
  };
  res.json(summary);
});

// ============================================
// STOCK MARKET ENDPOINTS (Yahoo Finance)
// ============================================

const defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'JPM', 'V', 'META', 'BRK-B'];

app.get('/api/stocks/quotes', async (req, res) => {
  try {
    const symbols = req.query.symbols ? req.query.symbols.split(',') : defaultSymbols;
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          return {
            symbol: quote.symbol,
            name: quote.shortName || quote.longName,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent,
            volume: quote.regularMarketVolume,
            marketCap: quote.marketCap,
            high: quote.regularMarketDayHigh,
            low: quote.regularMarketDayLow,
            open: quote.regularMarketOpen,
            previousClose: quote.regularMarketPreviousClose,
            fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: quote.fiftyTwoWeekLow
          };
        } catch (err) {
          return { symbol, error: 'Failed to fetch quote' };
        }
      })
    );
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock quotes', details: error.message });
  }
});

app.get('/api/stocks/quote/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = await yahooFinance.quote(symbol);
    res.json({
      symbol: quote.symbol,
      name: quote.shortName || quote.longName,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: quote.marketCap,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      open: quote.regularMarketOpen,
      previousClose: quote.regularMarketPreviousClose,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      peRatio: quote.trailingPE,
      eps: quote.epsTrailingTwelveMonths,
      dividend: quote.dividendYield
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock quote', details: error.message });
  }
});

app.get('/api/stocks/historical/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const period = req.query.period || '1mo';
    
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '1w': startDate.setDate(endDate.getDate() - 7); break;
      case '1mo': startDate.setMonth(endDate.getMonth() - 1); break;
      case '3mo': startDate.setMonth(endDate.getMonth() - 3); break;
      case '6mo': startDate.setMonth(endDate.getMonth() - 6); break;
      case '1y': startDate.setFullYear(endDate.getFullYear() - 1); break;
      case '5y': startDate.setFullYear(endDate.getFullYear() - 5); break;
      default: startDate.setMonth(endDate.getMonth() - 1);
    }

    const historical = await yahooFinance.historical(symbol, {
      period1: startDate,
      period2: endDate,
      interval: period === '1w' ? '1d' : period === '5y' ? '1wk' : '1d'
    });

    res.json(historical.map(h => ({
      date: h.date,
      open: h.open,
      high: h.high,
      low: h.low,
      close: h.close,
      volume: h.volume
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data', details: error.message });
  }
});

app.get('/api/stocks/market-summary', async (req, res) => {
  try {
    const indices = ['^GSPC', '^DJI', '^IXIC', '^RUT'];
    const quotes = await Promise.all(
      indices.map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          return {
            symbol: quote.symbol,
            name: quote.shortName,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent
          };
        } catch (err) {
          return { symbol, error: 'Failed to fetch' };
        }
      })
    );
    res.json(quotes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch market summary', details: error.message });
  }
});

app.get('/api/stocks/trending', async (req, res) => {
  try {
    const trending = await yahooFinance.trendingSymbols('US', { count: 10 });
    const symbols = trending.quotes.map(q => q.symbol);
    
    const quotes = await Promise.all(
      symbols.slice(0, 10).map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          return {
            symbol: quote.symbol,
            name: quote.shortName || quote.longName,
            price: quote.regularMarketPrice,
            change: quote.regularMarketChange,
            changePercent: quote.regularMarketChangePercent
          };
        } catch (err) {
          return null;
        }
      })
    );
    
    res.json(quotes.filter(q => q !== null));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trending stocks', details: error.message });
  }
});

// Portfolio valuation with real-time prices
app.get('/api/portfolio/:customerId', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const customerInvestments = investmentPortfolio.filter(i => i.customerId === customerId);
    
    const portfolioWithPrices = await Promise.all(
      customerInvestments.map(async (inv) => {
        try {
          const quote = await yahooFinance.quote(inv.symbol);
          const currentPrice = quote.regularMarketPrice;
          const totalValue = currentPrice * inv.shares;
          const totalCost = inv.avgCost * inv.shares;
          const gainLoss = totalValue - totalCost;
          const gainLossPercent = ((totalValue - totalCost) / totalCost) * 100;
          
          return {
            ...inv,
            currentPrice,
            totalValue,
            totalCost,
            gainLoss,
            gainLossPercent: gainLossPercent.toFixed(2),
            companyName: quote.shortName || quote.longName
          };
        } catch (err) {
          return { ...inv, error: 'Failed to fetch price' };
        }
      })
    );
    
    const totalPortfolioValue = portfolioWithPrices.reduce((sum, p) => sum + (p.totalValue || 0), 0);
    const totalCost = portfolioWithPrices.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    
    res.json({
      holdings: portfolioWithPrices,
      summary: {
        totalValue: totalPortfolioValue,
        totalCost,
        totalGainLoss: totalPortfolioValue - totalCost,
        totalGainLossPercent: (((totalPortfolioValue - totalCost) / totalCost) * 100).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch portfolio', details: error.message });
  }
});

// Search stocks
app.get('/api/stocks/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ error: 'Query parameter required' });
    
    const results = await yahooFinance.search(query);
    res.json(results.quotes.slice(0, 10).map(q => ({
      symbol: q.symbol,
      name: q.shortname || q.longname,
      type: q.quoteType,
      exchange: q.exchange
    })));
  } catch (error) {
    res.status(500).json({ error: 'Failed to search stocks', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🏦 Banking API Server running on http://localhost:${PORT}`);
  console.log(`📈 Stock market data powered by Yahoo Finance`);
});
