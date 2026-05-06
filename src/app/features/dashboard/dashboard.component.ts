import { Component, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { DatePipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { TramiteService } from '../../core/services/tramite.service';
import { Tramite } from '../../core/models/tramite.model';
import Keycloak from 'keycloak-js';

@Component({
  selector: 'app-dashboard',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
  ],
  template: `
    <div class="dashboard-header">
      <div>
        <h2>Mis trámites</h2>
        <p class="subtitle">Bienvenido, {{ username() }}</p>
      </div>
      <a mat-raised-button color="primary" routerLink="/tramites/nuevo">
        <mat-icon>add</mat-icon> Nuevo trámite
      </a>
    </div>

    <div class="stats">
      @for (stat of stats(); track stat.label) {
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-content">
              <div class="stat-value" [style.color]="stat.color">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </mat-card-content>
        </mat-card>
      }
    </div>

    <mat-form-field appearance="outline" class="search-field">
      <mat-label>Buscar trámite</mat-label>
      <input matInput [formControl]="searchControl" placeholder="Título, tipo..." />
      <mat-icon matSuffix>search</mat-icon>
    </mat-form-field>

    @if (tramites().length > 0) {
      <table mat-table [dataSource]="tramites()" class="mat-elevation-z1">
        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td mat-cell *matCellDef="let t">{{ t.id }}</td>
        </ng-container>
        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Título</th>
          <td mat-cell *matCellDef="let t">{{ t.title }}</td>
        </ng-container>
        <ng-container matColumnDef="type">
          <th mat-header-cell *matHeaderCellDef>Tipo</th>
          <td mat-cell *matCellDef="let t">{{ t.type }}</td>
        </ng-container>
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let t">
            <mat-chip [class]="'status-' + t.status">{{ statusLabel(t.status) }}</mat-chip>
          </td>
        </ng-container>
        <ng-container matColumnDef="date">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let t">{{ t.createdAt | date: 'dd/MM/yyyy' }}</td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="columns"></tr>
        <tr mat-row *matRowDef="let row; columns: columns"></tr>
      </table>
    } @else {
      <div class="empty-state">
        <mat-icon>inbox</mat-icon>
        <p>No tenés trámites iniciados aún</p>
        <a mat-raised-button color="primary" routerLink="/tramites/nuevo">Iniciar primer trámite</a>
      </div>
    }
  `,
  styles: [
    `
      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 28px;
      }
      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: #0d47a1;
        letter-spacing: -0.3px;
      }
      .subtitle {
        color: #5f6368;
        margin: 4px 0 0;
        font-size: 0.875rem;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
        gap: 16px;
        margin-bottom: 28px;
      }
      .stat-card {
        text-align: center;
        transition:
          box-shadow 0.2s ease,
          transform 0.2s ease;
        cursor: default;
      }
      .stat-card:hover {
        box-shadow: 0 6px 16px rgba(13, 71, 161, 0.12);
        transform: translateY(-2px);
      }
      .stat-content {
        padding: 12px 0 8px;
      }
      .stat-value {
        font-size: 2.25rem;
        font-weight: 700;
        line-height: 1;
      }
      .stat-label {
        color: #5f6368;
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.6px;
        margin-top: 8px;
      }
      .search-field {
        width: 100%;
        margin-bottom: 16px;
      }
      table {
        width: 100%;
      }
      .empty-state {
        text-align: center;
        padding: 64px;
        color: #9aa0a6;
      }
      .empty-state mat-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  private tramiteService = inject(TramiteService);
  private keycloak = inject(Keycloak);

  tramites = signal<Tramite[]>([]);
  stats = signal<{ label: string; value: number; color: string }[]>([]);
  username = signal('');
  columns = ['id', 'title', 'type', 'status', 'date'];
  searchControl = new FormControl('');

  ngOnInit(): void {
    this.keycloak
      .loadUserProfile()
      .then(p => this.username.set(p.firstName ?? ''))
      .catch(() => {});
    this.loadTramites();

    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap(q => this.tramiteService.getAll(q ?? ''))
      )
      .subscribe(t => this.tramites.set(t));
  }

  loadTramites(): void {
    this.tramiteService.getAll().subscribe(tramites => {
      this.tramites.set(tramites);
      this.stats.set([
        { label: 'Total', value: tramites.length, color: '#0d47a1' },
        {
          label: 'Pendientes',
          value: tramites.filter(t => t.status === 'pending').length,
          color: '#e65100',
        },
        {
          label: 'En revisión',
          value: tramites.filter(t => t.status === 'in-review').length,
          color: '#1565c0',
        },
        {
          label: 'Aprobados',
          value: tramites.filter(t => t.status === 'approved').length,
          color: '#2e7d32',
        },
      ]);
    });
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      'in-review': 'En revisión',
      approved: 'Aprobado',
      rejected: 'Rechazado',
    };
    return labels[status] ?? status;
  }
}
