import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-container">
      <!-- Sidebar -->
      <nav class="sidebar bg-dark text-white" [class.show]="isSidebarOpen">
        <div class="sidebar-header p-3 border-bottom border-secondary">
          <div class="d-flex align-items-center">
            <i class="bi bi-bank fs-3 text-primary me-2"></i>
            <div>
              <h5 class="mb-0 fw-bold">FinanceHub</h5>
              <small class="text-muted">Banking Dashboard</small>
            </div>
          </div>
        </div>

        <div class="sidebar-nav p-3">
          <ul class="nav flex-column">
            <li class="nav-item mb-2">
              <a class="nav-link text-white rounded" routerLink="/dashboard" routerLinkActive="active bg-primary">
                <i class="bi bi-grid-1x2 me-2"></i>
                Dashboard
              </a>
            </li>
            <li class="nav-item mb-2">
              <a class="nav-link text-white rounded" routerLink="/accounts" routerLinkActive="active bg-primary">
                <i class="bi bi-wallet2 me-2"></i>
                Accounts
              </a>
            </li>
            <li class="nav-item mb-2">
              <a class="nav-link text-white rounded" routerLink="/loans" routerLinkActive="active bg-primary">
                <i class="bi bi-cash-stack me-2"></i>
                Loans
              </a>
            </li>
            <li class="nav-item mb-2">
              <a class="nav-link text-white rounded" routerLink="/investments" routerLinkActive="active bg-primary">
                <i class="bi bi-graph-up-arrow me-2"></i>
                Investments
              </a>
            </li>
            <li class="nav-item mb-2">
              <a class="nav-link text-white rounded" routerLink="/market" routerLinkActive="active bg-primary">
                <i class="bi bi-bar-chart-line me-2"></i>
                Market Data
              </a>
            </li>
          </ul>

          <hr class="my-4 border-secondary">

          <div class="market-widget p-3 bg-secondary bg-opacity-25 rounded">
            <h6 class="text-muted mb-2">
              <i class="bi bi-broadcast me-1"></i>
              Quick Stats
            </h6>
            <div class="d-flex justify-content-between small">
              <span class="text-muted">Last Updated</span>
              <span class="text-success">Live</span>
            </div>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Top Header -->
        <header class="top-header bg-white shadow-sm px-4 py-3 d-flex align-items-center justify-content-between">
          <button class="btn btn-link text-dark d-lg-none" (click)="toggleSidebar()">
            <i class="bi bi-list fs-4"></i>
          </button>

          <div class="d-flex align-items-center">
            <div class="input-group input-group-sm me-3" style="width: 250px;">
              <span class="input-group-text bg-light border-0">
                <i class="bi bi-search"></i>
              </span>
              <input type="text" class="form-control bg-light border-0" placeholder="Search...">
            </div>
          </div>

          <div class="d-flex align-items-center">
            <button class="btn btn-link text-dark position-relative me-3">
              <i class="bi bi-bell fs-5"></i>
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </button>
            <div class="dropdown">
              <button class="btn btn-link text-dark dropdown-toggle d-flex align-items-center" 
                      type="button" data-bs-toggle="dropdown">
                <div class="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-2" 
                     style="width: 36px; height: 36px;">
                  <span class="fw-bold">JD</span>
                </div>
                <span class="d-none d-md-inline">John Doe</span>
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#"><i class="bi bi-person me-2"></i>Profile</a></li>
                <li><a class="dropdown-item" href="#"><i class="bi bi-gear me-2"></i>Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#"><i class="bi bi-box-arrow-right me-2"></i>Sign Out</a></li>
              </ul>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="content-area p-4">
          <router-outlet />
        </main>
      </div>

      <!-- Overlay for mobile -->
      @if (isSidebarOpen) {
        <div class="sidebar-overlay d-lg-none" (click)="toggleSidebar()"></div>
      }
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: var(--sidebar-width);
      min-height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 1040;
      transition: transform 0.3s ease;

      .nav-link {
        padding: 0.75rem 1rem;
        transition: all 0.2s ease;

        &:hover:not(.active) {
          background: rgba(255, 255, 255, 0.1);
        }

        &.active {
          font-weight: 500;
        }
      }
    }

    .main-content {
      flex: 1;
      margin-left: var(--sidebar-width);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .top-header {
      position: sticky;
      top: 0;
      z-index: 1020;
    }

    .content-area {
      flex: 1;
      background-color: #f8f9fa;
    }

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1030;
    }

    @media (max-width: 991.98px) {
      .sidebar {
        transform: translateX(-100%);

        &.show {
          transform: translateX(0);
        }
      }

      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class AppComponent {
  isSidebarOpen = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
