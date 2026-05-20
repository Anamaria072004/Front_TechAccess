import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { RegAccesoService } from '../../services/reg-acceso.service';
import { Acceso } from '../../models/reg-acceso.model';
import { Usuario } from '@features/users/models/users.model';
import { HttpErrorResponse } from '@angular/common/http';

import { DispositivoService } from '@features/dispositivos/services/dispositivo.service';
import { forkJoin, of, from } from 'rxjs';
import { catchError, map, switchMap, toArray } from 'rxjs/operators';
import { VehiculoService } from '@features/vehiculo/services/vehiculo.service';
import { FichaService } from '@features/ficha/services/ficha.service';

// Interface para los datos que puede recibir el diálogo
export interface RegAccesoDialogData {
  documento?: string | null;
}

@Component({
  selector: 'app-reg-acceso-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatCheckboxModule
  ],
  templateUrl: './reg-acceso-dialog.html',
  styleUrls: ['./reg-acceso-dialog.scss']
})
export class RegAccesoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RegAccesoDialogComponent>);
  private regAccesoService = inject(RegAccesoService);
  private cdr = inject(ChangeDetectorRef);

  // Datos recibidos al abrir el diálogo (documento escaneado)
  public data: RegAccesoDialogData = inject(MAT_DIALOG_DATA);

  private dispositivoService = inject(DispositivoService);
  private vehiculoService = inject(VehiculoService);
  private fichaService = inject(FichaService);

  accesoForm!: FormGroup;
  buscando = false;
  guardando = false;
  usuarioEncontrado: Usuario | null = null;
  errorMessage = '';

  dispositivosUsuario: any[] = [];
  vehiculosUsuario: any[] = [];
  fichasUsuario: any[] = [];
  cargandoInfoAdicional = false;

  // Items seleccionados
  vehiculosSeleccionados: any[] = [];
  dispositivosSeleccionados: any[] = [];

  // Indica si el diálogo fue abierto con un documento escaneado
  modoEscaneo = false;

  ngOnInit(): void {
    this.accesoForm = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      observacion: ['']
    });

    // Si se recibió un documento escaneado, precargarlo y buscar automáticamente
    if (this.data?.documento) {
      this.modoEscaneo = true;
      this.accesoForm.patchValue({ documento: this.data.documento });
      // Buscar usuario automáticamente después de un pequeño delay para que Angular renderice
      setTimeout(() => {
        this.buscarUsuario();
      }, 300);
    }
  }

  buscarUsuario(): void {
    const documentoRaw = this.accesoForm.get('documento')?.value;
    if (!documentoRaw || this.accesoForm.get('documento')?.invalid) return;

    const documento = String(documentoRaw).trim();
    this.buscando = true;
    this.usuarioEncontrado = null;
    this.errorMessage = '';
    this.limpiarInfoAdicional();
    this.cdr.detectChanges();

    this.regAccesoService.buscarUsuarioPorDocumento(documento).subscribe({
      next: (usuario: Usuario) => {
        if (usuario && usuario.id) {
          this.usuarioEncontrado = usuario;
          this.cargarInfoAdicionalUsuario(usuario.id, usuario.docNumber);
        } else {
          this.errorMessage = 'Usuario no registrado en el sistema.';
        }
        this.buscando = false;
        this.cdr.detectChanges();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 400) {
          this.errorMessage = 'El servidor rechazó el formato. Ingrese un número de documento válido sin letras.';
        } else if (err.status === 404) {
          this.errorMessage = `El documento N° ${documento} no se encuentra registrado.`;
        } else {
          this.errorMessage = 'No se pudo conectar con el servidor de bases de datos.';
        }
        this.buscando = false;
        this.cdr.detectChanges();
      }
    });
  }

  private cargarInfoAdicionalUsuario(usuarioId: number, docNumber?: string): void {
    this.cargandoInfoAdicional = true;
    this.cdr.detectChanges();

    forkJoin({
      dispositivos: this.dispositivoService.getAll().pipe(catchError(() => of({ data: [] }))),
      vehiculos: this.vehiculoService.getAll().pipe(catchError(() => of({ data: [] }))),
      fichas: this.fichaService.getAll().pipe(catchError(() => of({ data: [] })))
    }).subscribe({
      next: (resultados) => {
        const todosDispositivos = resultados.dispositivos.data || resultados.dispositivos || [];
        this.dispositivosUsuario = todosDispositivos.filter((d: any) => 
          d.usuarioId === usuarioId || d.usuario?.id === usuarioId
        );

        const todosVehiculos = resultados.vehiculos.data || resultados.vehiculos || [];
        this.vehiculosUsuario = todosVehiculos.filter((v: any) => 
          v.usuarioId === usuarioId || v.usuario?.id === usuarioId
        );

        const todasFichas = resultados.fichas.data || resultados.fichas || [];
        
        if (todasFichas.length === 0) {
          this.fichasUsuario = [];
          this.cargandoInfoAdicional = false;
          this.cdr.detectChanges();
          return;
        }

        from(todasFichas).pipe(
          switchMap((ficha: any) => 
            this.fichaService.getAprendices(ficha.id).pipe(
              map((aprendices: any) => {
                const aprendicesArray = aprendices.data || aprendices || [];
                const esAprendiz = aprendicesArray.some((a: any) => 
                  a.id === usuarioId || a.docNumber === docNumber
                );
                return esAprendiz ? ficha : null;
              }),
              catchError(() => of(null))
            )
          ),
          toArray(),
          map((resultados: any[]) => resultados.filter((f: any) => f !== null))
        ).subscribe({
          next: (fichasDelUsuario) => {
            this.fichasUsuario = fichasDelUsuario;
            this.cargandoInfoAdicional = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error verificando fichas:', err);
            this.fichasUsuario = [];
            this.cargandoInfoAdicional = false;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }

  // ========== SELECCIÓN DE VEHÍCULOS ==========
  onVehiculoToggle(vehiculo: any, checked: boolean): void {
    if (checked) {
      this.vehiculosSeleccionados.push(vehiculo);
    } else {
      this.vehiculosSeleccionados = this.vehiculosSeleccionados.filter(v => v.id !== vehiculo.id);
    }
    this.actualizarObservacion();
  }

  isVehiculoSeleccionado(vehiculo: any): boolean {
    return this.vehiculosSeleccionados.some(v => v.id === vehiculo.id);
  }

  // ========== SELECCIÓN DE DISPOSITIVOS ==========
  onDispositivoToggle(dispositivo: any, checked: boolean): void {
    if (checked) {
      this.dispositivosSeleccionados.push(dispositivo);
    } else {
      this.dispositivosSeleccionados = this.dispositivosSeleccionados.filter(d => d.id !== dispositivo.id);
    }
    this.actualizarObservacion();
  }

  isDispositivoSeleccionado(dispositivo: any): boolean {
    return this.dispositivosSeleccionados.some(d => d.id === dispositivo.id);
  }

  // ========== ACTUALIZAR OBSERVACIÓN ==========
  private actualizarObservacion(): void {
    const partes: string[] = [];
    
    if (this.vehiculosSeleccionados.length > 0) {
      const vehiculosTexto = this.vehiculosSeleccionados.map(v => 
        ` ${v.placa} (${v.marca})`
      ).join(', ');
      partes.push(vehiculosTexto);
    }
    
    if (this.dispositivosSeleccionados.length > 0) {
      const dispositivosTexto = this.dispositivosSeleccionados.map(d => 
        ` ${d.tipoDispositivo} ${d.marca}`
      ).join(', ');
      partes.push(dispositivosTexto);
    }

    const observacionActual = this.accesoForm.get('observacion')?.value || '';
    const baseObservacion = observacionActual
      .split(' | ')
      .filter((p: string) => 
        !p.includes('') && !p.includes('💻')
      )
      .join(' | ');

    const nuevaObservacion = [
      baseObservacion,
      ...partes
    ].filter(p => p.trim() !== '').join(' | ');

    this.accesoForm.patchValue({ observacion: nuevaObservacion });
  }

  private limpiarInfoAdicional(): void {
    this.dispositivosUsuario = [];
    this.vehiculosUsuario = [];
    this.fichasUsuario = [];
    this.vehiculosSeleccionados = [];
    this.dispositivosSeleccionados = [];
    this.cargandoInfoAdicional = false;
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }

  guardar(): void {
    if (this.accesoForm.invalid || !this.usuarioEncontrado) return;

    this.guardando = true;
    this.errorMessage = '';
    
    const payload = {
      usuarioId: this.usuarioEncontrado.id,
      observacion: this.accesoForm.get('observacion')?.value || 'Acceso manual'
    };

    this.regAccesoService.crearAcceso(payload).subscribe({
      next: (nuevoAcceso: Acceso) => {
        this.guardando = false;
        this.dialogRef.close(nuevoAcceso);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al guardar el acceso:', err);
        this.errorMessage = 'No se pudo registrar el acceso en el sistema.';
        this.guardando = false;
      }
    });
  }
}