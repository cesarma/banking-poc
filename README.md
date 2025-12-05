# FinanceHub - Banking Dashboard POC

A modern banking dashboard proof-of-concept built with Angular 19 and Node.js, featuring real-time stock market data from Yahoo Finance.

![Angular](https://img.shields.io/badge/Angular-19-red)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-purple)

## Features

### 🏦 Banking Features
- **Dashboard** - Overview of all financial data with charts and statistics
- **Account Management** - View and manage customer accounts
- **Loan Management** - Track loans with detailed breakdowns by type
- **Transaction History** - Recent transaction tracking

### 📈 Investment & Market Features
- **Real-time Stock Quotes** - Live data from Yahoo Finance API
- **Portfolio Tracking** - Real-time portfolio valuation with gain/loss calculations
- **Historical Charts** - Interactive price charts with multiple time periods
- **Market Indices** - S&P 500, Dow Jones, NASDAQ, Russell 2000
- **Stock Search** - Search any stock symbol
- **Trending Stocks** - View trending stocks

## Tech Stack

### Frontend
- **Angular 19** - Latest Angular with standalone components
- **Signals** - Reactive state management with Angular signals
- **Bootstrap 5.3** - Responsive UI framework
- **Chart.js / ng2-charts** - Data visualization
- **TypeScript** - Type-safe development
- **SCSS** - Styled components

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **yahoo-finance2** - Real-time stock market data
- **CORS** - Cross-origin resource sharing

## Project Structure

```
banking-poc/
├── backend/
│   ├── package.json
│   └── server.js          # Express server with all endpoints
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/
│   │   │   │   ├── models/       # TypeScript interfaces
│   │   │   │   ├── services/     # Banking & Stock services
│   │   │   │   └── interceptors/ # HTTP interceptors
│   │   │   ├── features/
│   │   │   │   ├── dashboard/    # Main dashboard
│   │   │   │   ├── accounts/     # Account management
│   │   │   │   ├── loans/        # Loan management
│   │   │   │   ├── investments/  # Portfolio tracking
│   │   │   │   └── market/       # Market data
│   │   │   ├── app.component.ts
│   │   │   └── app.routes.ts
│   │   ├── environments/
│   │   └── styles.scss
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js 20+ 
- npm 10+

### Installation

1. **Clone or download the project**

2. **Install Backend Dependencies**
```bash
cd banking-poc/backend
npm install  or npm install --legacy-peer-deps
```

3. **Install Frontend Dependencies**
```bash
cd banking-poc/frontend
npm install  or npm install --legacy-peer-deps
```

### Running the Application

1. **Start the Backend Server**
```bash
cd backend
npm start
```
The API will be available at `http://localhost:3000`

2. **Start the Frontend Development Server**
```bash
cd frontend
npm start
```
The application will be available at `http://localhost:4200`

## API Endpoints

### Banking Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| GET | `/api/accounts` | Get all accounts |
| GET | `/api/accounts/:customerId` | Get customer accounts |
| GET | `/api/loans` | Get all loans |
| GET | `/api/loans/summary` | Get loan summary |
| GET | `/api/transactions` | Get all transactions |
| GET | `/api/dashboard/summary` | Get dashboard data |

### Stock Market Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stocks/quotes` | Get multiple stock quotes |
| GET | `/api/stocks/quote/:symbol` | Get single stock quote |
| GET | `/api/stocks/historical/:symbol` | Get historical data |
| GET | `/api/stocks/market-summary` | Get major indices |
| GET | `/api/stocks/trending` | Get trending stocks |
| GET | `/api/stocks/search?query=` | Search stocks |
| GET | `/api/portfolio/:customerId` | Get portfolio with real-time prices |

## Screenshots

The application includes:
- 📊 Interactive dashboard with charts
- 💰 Account management with balance tracking
- 📋 Loan portfolio with type breakdown
- 📈 Real-time stock market data
- 💼 Investment portfolio with gain/loss tracking

## Angular Best Practices Used

- ✅ Standalone components (no NgModules)
- ✅ Signals for reactive state management
- ✅ Lazy-loaded routes
- ✅ Type-safe models with interfaces
- ✅ Service injection with `inject()`
- ✅ Computed signals for derived state
- ✅ OnPush change detection ready
- ✅ Proper TypeScript strict mode

## License

This is a proof-of-concept project for educational purposes.

## Acknowledgments

- Stock data provided by [Yahoo Finance](https://finance.yahoo.com/)
- UI components from [Bootstrap](https://getbootstrap.com/)
- Icons from [Bootstrap Icons](https://icons.getbootstrap.com/)
