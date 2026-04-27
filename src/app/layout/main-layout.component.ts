import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-main-layout',
  standalone: true,
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
        width: 240px;
        background: #0d47a1;
        color: white;
      }
      .sidenav-header {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 24px 16px;
        font-size: 1rem;
        font-weight: 600;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      }
      .spacer {
        flex: 1;
      }
      .username {
        margin-right: 8px;
        font-size: 0.9rem;
      }
      .content {
        padding: 24px;
      }
      .active-link {
        background: rgba(255, 255, 255, 0.15) !important;
      }
      mat-nav-list a {
        color: white;
      }
    `,
  ],
})
export class MainLayoutComponent {
  private keycloak = inject(KeycloakService);
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
    this.keycloak.logout(window.location.origin + '/consulta');
  }
}
