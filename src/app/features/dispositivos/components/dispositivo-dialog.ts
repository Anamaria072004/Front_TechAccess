import { ChangeDetectorRef, Component, OnInit, inject, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';

import { UsersService } from '@features/users/services/users.service';
import { Usuario } from '@features/users/models/users.model';

type UsuarioSearchValue = string | Usuario | null;

@Component({
  selector: 'app-add-dispositivo-modal',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatIconModule
  ],
  templateUrl: './dispositivo-dialog.html',
  styleUrls: ['./dispositivo-dialog.scss']
})
export class AddDispositivoModalComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private dialogRef = inject(MatDialogRef<AddDispositivoModalComponent>);
  private usersService = inject(UsersService);
  public data = inject(MAT_DIALOG_DATA);

  @ViewChild(MatAutocompleteTrigger) autoTrigger!: MatAutocompleteTrigger;
  
  usuarios: Usuario[] = [];
  filteredUsuarios: Usuario[] = [];
  isEditMode: boolean = false;
  datosCargados: boolean = false;
  private panelAbierto: boolean = false;

  usuarioSearchControl = new FormControl<UsuarioSearchValue>('');

  deviceForm: FormGroup = this.fb.group({
    usuario: [null as Usuario | null, [Validators.required]],
    tipoDispositivo: ['', [Validators.required, Validators.minLength(3)]],
    marca: ['', [Validators.required]],
    color: ['', [Validators.required]]
  });

  ngOnInit(): void {
    this.isEditMode = !!this.data;
    
    this.usuarioSearchControl.valueChanges.subscribe(searchValue => {
      if (typeof searchValue === 'string') {
        const term = searchValue.trim();
        
        if (term.length > 0) {
          this.filtrarUsuarios(term);
          if (this.panelAbierto && this.autoTrigger) {
            this.autoTrigger.openPanel();
          }
        } else {
          this.filteredUsuarios = [];
          if (this.autoTrigger) this.autoTrigger.closePanel();
        }
      }
    });

    this.cargarUsuarios();
  }

  ngAfterViewInit(): void {
    if (this.isEditMode && this.datosCargados && this.data) {
      this.cargarDatosEnFormulario();
    }
  }

  onInputFocus(): void {
    this.panelAbierto = true;
    const currentValue = this.usuarioSearchControl.value;
    
    // Si ya hay texto, filtramos, si no, mantenemos la lista vacía 
    if (typeof currentValue === 'string' && currentValue.trim().length > 0) {
      this.filtrarUsuarios(currentValue);
    } else {
      this.filteredUsuarios = [];
    }
  }

  onInputBlur(): void {
    setTimeout(() => {
      this.panelAbierto = false;
    }, 200);
  }

  cargarUsuarios(): void {
    this.usersService.getAll().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data;
        this.filteredUsuarios = [];
        this.datosCargados = true;

        if (this.isEditMode) {
          this.cargarDatosEnFormulario();
        }
      },
      error: (err) => console.error('Error al obtener usuarios', err)
    });
  }

  cargarDatosEnFormulario(): void {
    if (!this.data) return;

    let usuarioEncontrado: Usuario | undefined = undefined;
    const usuarioId = this.data.usuarioId || this.data.usuario?.id || this.data.userId || this.data.user?.id;

    if (usuarioId && this.usuarios.length > 0) {
      usuarioEncontrado = this.usuarios.find(u => u.id === usuarioId);
    }

    if (usuarioEncontrado) {
      this.deviceForm.patchValue({ usuario: usuarioEncontrado });
      this.usuarioSearchControl.setValue(usuarioEncontrado, { emitEvent: false });
    }

    this.deviceForm.patchValue({
      tipoDispositivo: this.data.tipoDispositivo || this.data.tipo_dispositivo || '',
      marca: this.data.marca || '',
      color: this.data.color || ''
    });

    this.cdr.detectChanges();
  }

  filtrarUsuarios(searchValue: string): void {
    const search = searchValue.toLowerCase();
    this.filteredUsuarios = this.usuarios.filter(user => {
      const doc = user.docNumber?.toString().toLowerCase() || '';
      const name = user.name?.toLowerCase() || '';
      const lastName = user.lastName?.toLowerCase() || '';
      return doc.includes(search) || name.includes(search) || lastName.includes(search);
    });
  }

  onUsuarioSelected(event: any): void {
    const usuario = event.option.value;
    this.deviceForm.patchValue({ usuario: usuario });
    this.usuarioSearchControl.setValue(usuario, { emitEvent: false });
    this.panelAbierto = false;
  }

  displayUsuarioFn(usuario: UsuarioSearchValue): string {
    if (!usuario || typeof usuario === 'string') return usuario || '';
    return `${usuario.docNumber} - ${usuario.name} ${usuario.lastName}`.trim();
  }

  save(): void {
    if (this.deviceForm.valid) {
      const result = this.isEditMode
        ? { ...this.deviceForm.value, id: this.data.id }
        : this.deviceForm.value;
      this.dialogRef.close(result);
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}