import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" [opened]="sidenavOpen()" class="sidenav">
        <div class="sidenav-header">
          <mat-icon>account_balance</mat-icon>
          <span>Portal Ciudadano</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active-link">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Mis trámites</span>
          </a>
          <a mat-list-item routerLink="/tramites/nuevo" routerLinkActive="active-link">
            <mat-icon matListItemIcon>add_circle</mat-icon>
            <span matListItemTitle>Nuevo trámite</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenavOpen.set(!sidenavOpen())">
            <mat-icon>menu</mat-icon>
          </button>
          <span>Portal Ciudadano</span>
          <span class="spacer"></span>
          <span class="username">{{ username() }}</span>
          <button mat-icon-button (click)="logout()" title="Cerrar sesión">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>
        <main class="content">
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .sidenav-container {
        height: 100vh;
      }
      .sidenav {
        width: 256px;
        background: linear-gradient(175deg, #1565c0 0%, #0d47a1 55%, #1a237e 100%);
        color: white;
        border-right: none;
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
      }
      .sidenav-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 28px 20px 24px;
        font-size: 1rem;
        font-weight: 600;
        letter-spacing: 0.3px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
      }
      .sidenav-header mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
        color: white;
      }
      mat-nav-list a {
        color: white !important;
        border-left: 3px solid transparent;
        transition: background 0.15s ease;
        margin: 2px 8px;
        border-radius: 6px;
      }
      mat-nav-list a mat-icon {
        color: white !important;
      }
      mat-nav-list a:hover {
        background: rgba(255, 255, 255, 0.1) !important;
      }
      .active-link {
        background: rgba(255, 255, 255, 0.15) !important;
        border-left: 3px solid white !important;
      }
      .spacer {
        flex: 1;
      }
      .username {
        margin-right: 4px;
        font-size: 0.875rem;
        opacity: 0.9;
      }
      .content {
        padding: 28px;
      }
    `,
  ],
})
export class MainLayoutComponent {
  private keycloak = inject(Keycloak);
  sidenavOpen = signal(true);
  username = signal('');

  constructor() {
    this.keycloak
      .loadUserProfile()
      .then(profile => {
        this.username.set(profile.firstName ?? profile.username ?? '');
      })
      .catch(() => {});
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin + '/consulta' });
  }
}
