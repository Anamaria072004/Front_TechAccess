import { Component, OnInit, inject, ChangeDetectorRef, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, catchError, of } from 'rxjs';

import { RegAccesoDialogComponent } from './components/reg-acceso-dialog/reg-acceso-dialog';
import { RegAccesoService } from './services/reg-acceso.service';
import { Acceso } from './models/reg-acceso.model';
import { DataTableComponent } from '@shared/components/data-table/data-table';

interface UltimoRegistro {
  tipo: string;
  usuario: string;
  hora: string;
}

@Component({
  selector: 'app-reg-acceso',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    DataTableComponent
  ],
  templateUrl: './reg-acceso.html',
  styleUrls: ['./reg-acceso.scss']
})
export class RegAccesoComponent implements OnInit {
  @ViewChild('codigoInput') codigoInput!: ElementRef<HTMLInputElement>;

  accesosRecientes: any[] = [];
  codigoBarras: string = '';
  isLoading: boolean = false;
  isLoadingTable: boolean = false;
  tableError: string | null = null;
  mostrarTabla: boolean = false;
  registroExitoso: boolean = false;
  dialogAbierto: boolean = false;
  ultimoRegistro: UltimoRegistro | null = null;

  // Control de foco para lectura continua
  private mantenerFoco = true;
  private focoTimeout: any;

  tableColumns = [
    { key: 'usuarioNombre', label: 'Usuario', type: 'text' },
    { key: 'documento', label: 'Documento', type: 'text' },
    { key: 'horaFecha', label: 'Fecha/Hora', type: 'date' },
    { key: 'tipoAcceso', label: 'Tipo', type: 'text' },
    { key: 'observacion', label: 'Observación', type: 'text' }
  ];

  private cdr = inject(ChangeDetectorRef);

  constructor(
    private regAccesoService: RegAccesoService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.cargarHistorial();
    setTimeout(() => this.enfocarInput(), 500);
  }

  ngOnDestroy(): void {
    if (this.focoTimeout) {
      clearTimeout(this.focoTimeout);
    }
  }

  // ─── MANEJO DEL FOCO PARA LECTOR CONTINUO ───────

  onInputFocus(): void {
    this.mantenerFoco = true;
  }

  onInputBlur(): void {
    this.focoTimeout = setTimeout(() => {
      if (this.mantenerFoco && !this.isLoading && !this.dialogAbierto) {
        this.enfocarInput();
      }
    }, 250);
  }

  private enfocarInput(): void {
    if (this.codigoInput?.nativeElement && !this.isLoading && !this.dialogAbierto) {
      this.codigoInput.nativeElement.focus();
      this.cdr.detectChanges();
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
    const isDialog = !!target.closest('mat-dialog-container');
    
    if (!isInput && !isDialog && !this.isLoading && !this.dialogAbierto) {
      if (event.key.length === 1 || event.key === 'Enter') {
        this.enfocarInput();
      }
    }
  }

  // ─── PROCESAMIENTO DEL CÓDIGO DE BARRAS ─────────
  // AHORA: Abre el diálogo con el documento precargado en lugar de registrar directamente

  procesarCodigoBarras(): void {
    const documento = this.codigoBarras.trim();
    if (!documento) {
      this.enfocarInput();
      return;
    }

    // Validar que solo contenga números
    if (!/^\d+$/.test(documento)) {
      this.snackBar.open('El documento debe contener solo números.', 'Cerrar', { duration: 3000 });
      this.codigoBarras = '';
      this.enfocarInput();
      return;
    }

    this.isLoading = true;
    this.mantenerFoco = false;
    this.cdr.detectChanges();

    // Abrir el diálogo de registro pasando el documento escaneado
    this.abrirDialogoConDocumento(documento);
  }

  // ─── DIÁLOGO DE REGISTRO MANUAL / POR ESCANEO ───

  abrirDialogo(): void {
    // Abrir diálogo vacío (modo manual)
    this.abrirDialogoConDocumento(null);
  }

  private abrirDialogoConDocumento(documentoEscaneado: string | null): void {
    this.dialogAbierto = true;
    this.mantenerFoco = false;

    const dialogRef = this.dialog.open(RegAccesoDialogComponent, {
      width: '500px',
      data: { documento: documentoEscaneado } // Pasar documento escaneado al diálogo
    });

    dialogRef.afterClosed().subscribe(result => {
      this.dialogAbierto = false;
      this.mantenerFoco = true;
      this.isLoading = false;
      
      if (result) {
        const tipo = result.accion ? 'Entrada' : 'Salida';
        const usuarioName = result.usuario ? `${result.usuario.name} ${result.usuario.lastName}` : 'Usuario';
        
        // Mostrar banner del último registro
        this.ultimoRegistro = {
          tipo: tipo,
          usuario: usuarioName,
          hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };

        this.registroExitoso = true;
        this.snackBar.open(
          `✅ ${tipo} registrada: ${usuarioName}`, 
          'Cerrar', 
          { duration: 3000, panelClass: 'snackbar-success' }
        );

        this.cargarHistorial();

        setTimeout(() => {
          this.registroExitoso = false;
          this.cdr.detectChanges();
        }, 2000);
      }
      
      // Limpiar input y volver a enfocar para siguiente lectura
      this.codigoBarras = '';
      setTimeout(() => this.enfocarInput(), 300);
    });
  }

  // ─── CARGAR HISTORIAL ───────────────────────────

  cargarHistorial(): void {
    this.isLoadingTable = true;
    this.mostrarTabla = false;
    this.tableError = null;

    this.regAccesoService.obtenerAccesos().pipe(
      finalize(() => {
        this.isLoadingTable = false;
        this.mostrarTabla = true;
        this.cdr.detectChanges();
      }),
      catchError((err: any) => {
        console.error('[RegAcceso] Error:', err);
        this.tableError = 'Error al cargar los registros.';
        this.snackBar.open('Error al cargar el historial', 'Cerrar', { duration: 4000 });
        return of([]);
      })
    ).subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
          this.accesosRecientes = [];
          return;
        }

        this.accesosRecientes = data.map(acceso => ({
          ...acceso,
          usuarioNombre: acceso.usuario 
            ? `${acceso.usuario.name} ${acceso.usuario.lastName}` 
            : `Usuario ${acceso.usuarioId}`,
          documento: acceso.usuario?.docNumber || '-',
          tipoAcceso: this.getTipoAccesoLabel(acceso.accion),
          horaFecha: acceso.horaFecha
        }));
      }
    });
  }

  getTipoAccesoLabel(accion: boolean): string {
    return accion ? 'Entrada' : 'Salida';
  }
}