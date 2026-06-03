import { Component, inject, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-registro-manual-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="manual-dialog-container">
      <div class="manual-dialog-header">
        <br>
        <h2>Registro Manual de Acceso</h2>
        <p>Ingrese el número de documento del usuario</p>
      
      </div>

      <div class="manual-dialog-content">
        <form [formGroup]="manualForm" (submit)="confirmar(); $event.preventDefault()">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Número de Documento</mat-label>
            <input 
              #documentoInput
              matInput 
              type="text" 
              formControlName="documento"
              placeholder="Ej: 1234567890"
              autocomplete="off"
              (keyup.enter)="confirmar()"
            >
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error *ngIf="manualForm.get('documento')?.hasError('required') && manualForm.get('documento')?.touched">
              El documento es requerido
            </mat-error>
            <mat-error *ngIf="manualForm.get('documento')?.hasError('pattern') && manualForm.get('documento')?.touched">
              Solo números permitidos
            </mat-error>
          </mat-form-field>
        </form>
      </div>

      <div class="manual-dialog-actions">
        <button mat-button (click)="cancelar()" type="button">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button 
          mat-flat-button 
          color="primary" 
          (click)="confirmar()"
          [disabled]="manualForm.invalid"
          type="button"
        >
          <mat-icon>login</mat-icon>
          Registrar Acceso
        </button>
      </div>
    </div>
  `,
  styles: [`
    .manual-dialog-container {
      padding: 0;
      max-width: 100%;
    }

    .manual-dialog-header {
      text-align: center;
      padding: 24px 24px 16px;
      background: linear-gradient(135deg, #1a3a8f 0%, #0f2a6e 100%);
      margin: -24px -24px 0 -24px;
      border-radius: 8px 8px 0 0;
    }

    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      margin-bottom: 12px;
    }

    .manual-dialog-header mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: white;
    }

    .manual-dialog-header h2 {
      margin: 0 0 8px;
      color: white;
      font-size: 1.3rem;
      font-weight: 600;
    }

    .manual-dialog-header p {
      margin: 0;
      color: rgba(255, 255, 255, 0.85);
      font-size: 0.85rem;
    }

    .manual-dialog-content {
      padding: 24px;
    }

    .full-width {
      width: 100%;
    }

    .manual-dialog-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px 24px;
      border-top: 1px solid #e8edf8;
    }

    .manual-dialog-actions button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 20px;
      height: 44px;
    }

    .manual-dialog-actions button[mat-flat-button] {
      background: #1a3a8f !important;
      color: white !important;
    }

    ::ng-deep .mat-mdc-form-field-prefix {
      margin-right: 8px;
    }

    ::ng-deep .mat-mdc-form-field-prefix mat-icon {
      color: #94a3b8;
    }

    /* Forzar que el input sea editable */
    ::ng-deep .mat-mdc-input-element {
      background: white !important;
      color: #1e293b !important;
    }
  `]
})
export class RegistroManualDialogComponent implements AfterViewInit {
  @ViewChild('documentoInput') documentoInput!: ElementRef<HTMLInputElement>;
  
  private dialogRef = inject(MatDialogRef<RegistroManualDialogComponent>);
  private fb = inject(FormBuilder);

  manualForm: FormGroup;

  constructor() {
    this.manualForm = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]]
    });
  }

  ngAfterViewInit(): void {
    // Enfocar el input automáticamente cuando se abre el diálogo
    setTimeout(() => {
      if (this.documentoInput?.nativeElement) {
        this.documentoInput.nativeElement.focus();
      }
    }, 100);
  }

  confirmar(): void {
    if (this.manualForm.valid) {
      const documento = this.manualForm.get('documento')?.value;
      this.dialogRef.close({ documento: documento });
    } else {
      // Marcar el campo como touched para mostrar errores
      this.manualForm.markAllAsTouched();
    }
  }

  cancelar(): void {
    this.dialogRef.close(null);
  }
}