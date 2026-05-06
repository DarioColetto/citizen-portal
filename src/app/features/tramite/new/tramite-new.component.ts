import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ToastrService } from 'ngx-toastr';
import { NgxImageCompressService } from 'ngx-image-compress';
import { TramiteService } from '../../../core/services/tramite.service';
import { PdfService } from '../../../core/services/pdf.service';
import { dniValidator, emailMatchValidator } from '../../../core/validators/tramite.validators';

@Component({
  selector: 'app-tramite-new',
  imports: [
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
  ],
  template: `
    <div class="form-container">
      <h2>Iniciar nuevo trámite</h2>

      <mat-stepper linear #stepper>
        <!-- Step 1: Datos personales -->
        <mat-step [stepControl]="personalGroup" label="Datos personales">
          <form [formGroup]="personalGroup">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput formControlName="applicantName" />
              @if (personalGroup.get('applicantName')?.hasError('required')) {
                <mat-error>Requerido</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>DNI</mat-label>
              <input matInput formControlName="applicantDni" />
              @if (personalGroup.get('applicantDni')?.hasError('invalidDni')) {
                <mat-error>DNI inválido (7-8 dígitos)</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput formControlName="applicantEmail" type="email" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Confirmar email</mat-label>
              <input matInput formControlName="confirmEmail" type="email" />
              @if (personalGroup.hasError('emailMismatch')) {
                <mat-error>Los emails no coinciden</mat-error>
              }
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Domicilio</mat-label>
              <input matInput formControlName="address" />
            </mat-form-field>
            <div class="step-actions">
              <button
                mat-raised-button
                color="primary"
                matStepperNext
                [disabled]="personalGroup.invalid"
              >
                Siguiente
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 2: Tipo de trámite -->
        <mat-step [stepControl]="tramiteGroup" label="Tipo de trámite">
          <form [formGroup]="tramiteGroup">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Tipo de trámite</mat-label>
              <mat-select formControlName="type">
                <mat-option value="habilitacion">Habilitación comercial</mat-option>
                <mat-option value="subsidio">Subsidio social</mat-option>
                <mat-option value="certificado">Certificado de residencia</mat-option>
                <mat-option value="reclamo">Reclamo</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Título del trámite</mat-label>
              <input matInput formControlName="title" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Descripción</mat-label>
              <textarea
                matInput
                formControlName="description"
                rows="4"
                placeholder="Describí detalladamente el trámite que querés iniciar..."
              ></textarea>
              @if (tramiteGroup.get('description')?.hasError('minlength')) {
                <mat-error>Mínimo 20 caracteres</mat-error>
              }
            </mat-form-field>
            <div class="step-actions">
              <button mat-button matStepperPrevious>Anterior</button>
              <button
                mat-raised-button
                color="primary"
                matStepperNext
                [disabled]="tramiteGroup.invalid"
              >
                Siguiente
              </button>
            </div>
          </form>
        </mat-step>

        <!-- Step 3: Documentos adjuntos (FormArray) -->
        <mat-step label="Documentos">
          <form [formGroup]="documentsGroup">
            <p class="hint">Adjuntá los documentos requeridos (máx. 5 MB por archivo)</p>
            <div formArrayName="documents">
              @for (doc of documentsArray.controls; track $index) {
                <mat-card class="doc-card" [formGroupName]="$index">
                  <mat-card-content>
                    <div class="doc-row">
                      <mat-form-field appearance="outline" class="doc-name">
                        <mat-label>Nombre del documento</mat-label>
                        <input matInput formControlName="name" />
                      </mat-form-field>
                      <button
                        mat-icon-button
                        color="warn"
                        type="button"
                        (click)="removeDocument($index)"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </div>
                    <button mat-stroked-button type="button" (click)="uploadDocument($index)">
                      <mat-icon>attach_file</mat-icon> Seleccionar archivo
                    </button>
                    @if (doc.get('base64')?.value) {
                      <span class="file-ok"><mat-icon>check_circle</mat-icon> Archivo cargado</span>
                    }
                  </mat-card-content>
                </mat-card>
              }
            </div>
            @if (documentsArray.length < 5) {
              <button mat-stroked-button type="button" (click)="addDocument()">
                <mat-icon>add</mat-icon> Agregar documento
              </button>
            }
            <div class="step-actions">
              <button mat-button matStepperPrevious>Anterior</button>
              <button mat-raised-button color="primary" matStepperNext>Siguiente</button>
            </div>
          </form>
        </mat-step>

        <!-- Step 4: Confirmación -->
        <mat-step label="Confirmar">
          <div class="summary">
            <h3>Resumen del trámite</h3>
            <p><strong>Solicitante:</strong> {{ personalGroup.get('applicantName')?.value }}</p>
            <p><strong>DNI:</strong> {{ personalGroup.get('applicantDni')?.value }}</p>
            <p><strong>Email:</strong> {{ personalGroup.get('applicantEmail')?.value }}</p>
            <p><strong>Tipo:</strong> {{ tramiteGroup.get('type')?.value }}</p>
            <p><strong>Título:</strong> {{ tramiteGroup.get('title')?.value }}</p>
            <p><strong>Documentos adjuntos:</strong> {{ documentsArray.length }}</p>
          </div>
          <div class="step-actions">
            <button mat-button matStepperPrevious>Anterior</button>
            <button mat-raised-button color="primary" (click)="onSubmit()" [disabled]="loading()">
              {{ loading() ? 'Enviando...' : 'Enviar trámite' }}
            </button>
          </div>
        </mat-step>
      </mat-stepper>
    </div>
  `,
  styles: [
    `
      .form-container {
        max-width: 720px;
        margin: 0 auto;
      }
      h2 {
        color: #0d47a1;
        margin-bottom: 24px;
      }
      .full-width {
        width: 100%;
        display: block;
        margin-bottom: 8px;
      }
      .step-actions {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
        margin-top: 16px;
      }
      .doc-card {
        margin-bottom: 12px;
      }
      .doc-row {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .doc-name {
        flex: 1;
      }
      .file-ok {
        color: #2e7d32;
        display: flex;
        align-items: center;
        gap: 4px;
        margin-top: 8px;
      }
      .hint {
        color: #666;
        font-size: 0.9rem;
        margin-bottom: 16px;
      }
      .summary p {
        margin: 6px 0;
      }
    `,
  ],
})
export class TramiteNewComponent {
  private fb = inject(FormBuilder);
  private tramiteService = inject(TramiteService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private imageCompress = inject(NgxImageCompressService);
  private pdfService = inject(PdfService);

  loading = signal(false);

  personalGroup = this.fb.group(
    {
      applicantName: ['', Validators.required],
      applicantDni: ['', [Validators.required, dniValidator()]],
      applicantEmail: ['', [Validators.required, Validators.email]],
      confirmEmail: ['', Validators.required],
      address: ['', Validators.required],
    },
    { validators: emailMatchValidator('applicantEmail', 'confirmEmail') }
  );

  tramiteGroup = this.fb.group({
    type: ['', Validators.required],
    title: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(20)]],
  });

  documentsGroup = this.fb.group({
    documents: this.fb.array([]),
  });

  get documentsArray(): FormArray {
    return this.documentsGroup.get('documents') as FormArray;
  }

  addDocument(): void {
    this.documentsArray.push(
      this.fb.group({ name: ['', Validators.required], base64: [''], size: [0], type: [''] })
    );
  }

  removeDocument(index: number): void {
    this.documentsArray.removeAt(index);
  }

  async uploadDocument(index: number): Promise<void> {
    const result = await this.imageCompress.uploadFile();
    const compressed = await this.imageCompress.compressFile(
      result.image,
      result.orientation,
      70,
      70
    );
    this.documentsArray.at(index).patchValue({
      base64: compressed,
      size: compressed.length,
      type: 'image',
    });
  }

  onSubmit(): void {
    if (this.personalGroup.invalid || this.tramiteGroup.invalid) return;
    this.loading.set(true);

    const payload = {
      ...this.personalGroup.value,
      ...this.tramiteGroup.value,
      documents: this.documentsArray.value,
    } as any;

    delete payload.confirmEmail;

    this.tramiteService.create(payload).subscribe({
      next: tramite => {
        this.generateReceipt(tramite.id);
        this.toastr.success(
          'Trámite iniciado correctamente. Guardá el número para el seguimiento.'
        );
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.toastr.error('Error al enviar el trámite. Intentá nuevamente.');
        this.loading.set(false);
      },
    });
  }

  generateReceipt(id: number): void {
    const docDef = {
      content: [
        { text: 'Comprobante de trámite', style: 'header' },
        { text: `Número de trámite: #${id}`, style: 'subheader', margin: [0, 8, 0, 16] },
        {
          table: {
            widths: ['*', '*'],
            body: [
              ['Solicitante', this.personalGroup.get('applicantName')?.value],
              ['DNI', this.personalGroup.get('applicantDni')?.value],
              ['Email', this.personalGroup.get('applicantEmail')?.value],
              ['Tipo', this.tramiteGroup.get('type')?.value],
              ['Título', this.tramiteGroup.get('title')?.value],
              ['Estado', 'Pendiente de revisión'],
              ['Fecha', new Date().toLocaleDateString('es-AR')],
            ],
          },
        },
        {
          text: 'Conservá este comprobante para el seguimiento de tu trámite.',
          margin: [0, 16, 0, 0],
          italics: true,
          color: '#666',
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, margin: [0, 0, 0, 8] },
        subheader: { fontSize: 13, bold: true, color: '#0d47a1' },
      },
    };

    this.pdfService.download(docDef, `tramite-${id}.pdf`).catch(() => {});
  }
}
