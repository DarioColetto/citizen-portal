import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { debounceTime, distinctUntilChanged, switchMap, Subject } from 'rxjs';
import { TramiteService } from '../../../core/services/tramite.service';
import { Tramite } from '../../../core/models/tramite.model';
import { dniValidator } from '../../../core/validators/tramite.validators';

@Component({
  selector: 'app-tramite-status',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <div class="status-page">
      <div class="hero">
        <mat-icon class="hero-icon">account_balance</mat-icon>
        <h1>Consulta de trámites</h1>
        <p>Ingresá tu DNI para ver el estado de tus trámites</p>
      </div>

      <div class="search-box">
        <mat-form-field appearance="outline" class="dni-field">
          <mat-label>DNI</mat-label>
          <input matInput [formControl]="dniControl" placeholder="Ej: 28456789" />
          <mat-icon matSuffix>search</mat-icon>
          @if (dniControl.hasError('invalidDni')) {
            <mat-error>DNI inválido</mat-error>
          }
        </mat-form-field>
        <button
          mat-raised-button
          color="primary"
          (click)="search()"
          [disabled]="dniControl.invalid || loading()"
        >
          Consultar
        </button>
      </div>

      @if (loading()) {
        <div class="loading-center">
          <mat-spinner diameter="48" />
        </div>
      }

      @if (tramites().length > 0 && !loading()) {
        <div class="results">
          <h3>Trámites encontrados ({{ tramites().length }})</h3>
          @for (t of tramites(); track t.id) {
            <mat-card class="tramite-card">
              <mat-card-header>
                <mat-card-title>#{{ t.id }} — {{ t.title }}</mat-card-title>
                <mat-chip [class]="'status-' + t.status">{{ statusLabel(t.status) }}</mat-chip>
              </mat-card-header>
              <mat-card-content>
                <p><strong>Tipo:</strong> {{ t.type }}</p>
                <p><strong>Iniciado:</strong> {{ t.createdAt | date: 'dd/MM/yyyy' }}</p>
                <p><strong>Última actualización:</strong> {{ t.updatedAt | date: 'dd/MM/yyyy' }}</p>
                @if (t.notes) {
                  <p><strong>Observaciones:</strong> {{ t.notes }}</p>
                }
              </mat-card-content>
            </mat-card>
          }
        </div>
      }

      @if (searched() && tramites().length === 0 && !loading()) {
        <div class="no-results">
          <mat-icon>search_off</mat-icon>
          <p>No se encontraron trámites para el DNI ingresado</p>
        </div>
      }

      <div class="login-prompt">
        <p>¿Querés iniciar un nuevo trámite? <a routerLink="/">Ingresá con tu cuenta</a></p>
      </div>
    </div>
  `,
  styles: [
    `
      .status-page {
        max-width: 720px;
        margin: 0 auto;
        padding: 40px 24px;
      }
      .hero {
        text-align: center;
        margin-bottom: 40px;
      }
      .hero-icon {
        font-size: 64px;
        width: 64px;
        height: 64px;
        color: #0d47a1;
      }
      h1 {
        color: #0d47a1;
        margin: 16px 0 8px;
      }
      .hero p {
        color: #666;
      }
      .search-box {
        display: flex;
        gap: 16px;
        align-items: flex-start;
        margin-bottom: 32px;
      }
      .dni-field {
        flex: 1;
      }
      .loading-center {
        display: flex;
        justify-content: center;
        padding: 32px;
      }
      .results h3 {
        color: #333;
        margin-bottom: 16px;
      }
      .tramite-card {
        margin-bottom: 16px;
      }
      mat-card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .no-results {
        text-align: center;
        color: #999;
        padding: 48px;
      }
      .no-results mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
      }
      .login-prompt {
        text-align: center;
        margin-top: 40px;
        color: #666;
      }
      .login-prompt a {
        color: #0d47a1;
        text-decoration: none;
        font-weight: 500;
      }
      .status-pending {
        background: #fff3e0 !important;
        color: #e65100 !important;
      }
      .status-in-review {
        background: #e3f2fd !important;
        color: #1565c0 !important;
      }
      .status-approved {
        background: #e8f5e9 !important;
        color: #2e7d32 !important;
      }
      .status-rejected {
        background: #ffebee !important;
        color: #c62828 !important;
      }
    `,
  ],
})
export class TramiteStatusComponent {
  private tramiteService = inject(TramiteService);
  tramites = signal<Tramite[]>([]);
  loading = signal(false);
  searched = signal(false);

  dniControl = new FormControl('', [Validators.required, dniValidator()]);

  search(): void {
    if (this.dniControl.invalid) return;
    this.loading.set(true);
    this.searched.set(false);
    this.tramiteService.getByDni(this.dniControl.value!).subscribe({
      next: tramites => {
        this.tramites.set(tramites);
        this.searched.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.searched.set(true);
      },
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
