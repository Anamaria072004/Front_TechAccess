import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button'; 
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { RegAccesoService } from '../../services/reg-acceso.service';
import { Acceso } from '../../models/reg-acceso.model';
import { Usuario } from '@features/users/models/users.model';
import { HttpErrorResponse } from '@angular/common/http';

import { DispositivoService } from '@features/dispositivos/services/dispositivo.service';
import { forkJoin, of, from } from 'rxjs';
import { catchError, map, switchMap, toArray } from 'rxjs/operators';
import { VehiculoService } from '@features/vehiculo/services/vehiculo.service';
import { FichaService } from '@features/ficha/services/ficha.service';

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
    MatDividerModule
  ],
  templateUrl: './reg-acceso-dialog.html',
  styleUrls: ['./reg-acceso-dialog.scss']
})
export class RegAccesoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RegAccesoDialogComponent>);
  private regAccesoService = inject(RegAccesoService);
  private cdr = inject(ChangeDetectorRef);

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

  ngOnInit(): void {
    this.accesoForm = this.fb.group({
      documento: ['', [Validators.required, Validators.pattern(/^[0-9]+$/)]],
      observacion: ['']
    });
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

    // Primero cargar dispositivos y vehículos
    forkJoin({
      dispositivos: this.dispositivoService.getAll().pipe(catchError(() => of({ data: [] }))),
      vehiculos: this.vehiculoService.getAll().pipe(catchError(() => of({ data: [] }))),
      fichas: this.fichaService.getAll().pipe(catchError(() => of({ data: [] })))
    }).subscribe({
      next: (resultados) => {
        // Procesar dispositivos
        const todosDispositivos = resultados.dispositivos.data || resultados.dispositivos || [];
        this.dispositivosUsuario = todosDispositivos.filter((d: any) => 
          d.usuarioId === usuarioId || d.usuario?.id === usuarioId
        );

        // Procesar vehículos
        const todosVehiculos = resultados.vehiculos.data || resultados.vehiculos || [];
        this.vehiculosUsuario = todosVehiculos.filter((v: any) => 
          v.usuarioId === usuarioId || v.usuario?.id === usuarioId
        );

        // Procesar fichas - obtener todas y verificar una por una
        const todasFichas = resultados.fichas.data || resultados.fichas || [];
        
        if (todasFichas.length === 0) {
          this.fichasUsuario = [];
          this.cargandoInfoAdicional = false;
          this.cdr.detectChanges();
          return;
        }

        // Para cada ficha, verificar si el usuario es aprendiz
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
            console.log('Fichas del usuario encontradas:', this.fichasUsuario.length);
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

  private limpiarInfoAdicional(): void {
    this.dispositivosUsuario = [];
    this.vehiculosUsuario = [];
    this.fichasUsuario = [];
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