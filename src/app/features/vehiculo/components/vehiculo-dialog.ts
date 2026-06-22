import { Component, Inject, OnInit, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { UsersService } from '@features/users/services/users.service';
import { map, startWith } from 'rxjs/operators';

export interface Usuario {
  id: number;
  name: string;
  lastName: string;
  docNumber: string | number;
  email?: string;
  telephone?: string;
} 

@Component({
  selector: 'app-vehiculo-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  templateUrl: './vehiculo-dialog.html',
  styleUrls: ['./vehiculo-dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddVehiculoModalComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddVehiculoModalComponent>);
  private usersService = inject(UsersService);
  private cdr = inject(ChangeDetectorRef);

  isEdit = false;
  vehiForm: FormGroup;
  
  usuarios: Usuario[] = [];
  usuarioSearchControl = new FormControl<string | Usuario | null>('');
  filteredUsuarios: Usuario[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.isEdit = !!data;
    
    this.vehiForm = this.fb.group({
      placa: [data?.placa || '', [Validators.required, Validators.maxLength(20)]],
      tipoVehiculo: [data?.tipoVehiculo || 'Automóvil', Validators.required],
      marca: [data?.marca || '', Validators.required],
      color: [data?.color || '', Validators.required],
      modelo: [data?.modelo || '', Validators.required],
      usuarioId: [data?.usuario || null, Validators.required],
    });

    if (this.isEdit && data?.usuario) {
      this.usuarioSearchControl.setValue(data.usuario);
    }
  }

  ngOnInit() {
    this.usersService.getAll().subscribe((res) => {
      this.usuarios = res.data || res;
      
      this.setupFiltroUsuarios();
      this.cdr.markForCheck();
    });
  }

  private setupFiltroUsuarios() {
    this.usuarioSearchControl.valueChanges
      .pipe(
        startWith(''),
        map(value => {
          if (typeof value === 'string') return value;
          return value ? `${value.name} ${value.lastName}` : '';
        }),
        map(name => name ? this._filter(name) : this.usuarios.slice())
      )
      .subscribe(filtered => {
        this.filteredUsuarios = filtered;
        this.cdr.markForCheck();
      });
  }

  private _filter(value: string): Usuario[] {
    const filterValue = value.toLowerCase();
    return this.usuarios.filter((user: Usuario) => 
      user.name?.toLowerCase().includes(filterValue) ||
      user.lastName?.toLowerCase().includes(filterValue) ||
      user.docNumber?.toString().toLowerCase().includes(filterValue)
    );
  }

  onUsuarioSelected(event: MatAutocompleteSelectedEvent): void {
    const user = event.option.value as Usuario;
    this.vehiForm.get('usuarioId')?.setValue(user);
    this.cdr.markForCheck();
  }

  displayUsuarioFn(user: Usuario | null): string {
    return user ? `${user.name} ${user.lastName}` : '';
  }

  onInputFocus(): void {}
  onInputBlur(): void {
    if (!this.usuarioSearchControl.value) {
      this.vehiForm.get('usuarioId')?.setValue(null);
      this.cdr.markForCheck();
    }
  }

  save() {
    if (this.vehiForm.invalid) return;

    const rawValue = this.vehiForm.value;
    
    const payload = {
      ...rawValue,
      usuarioId: rawValue.usuarioId?.id
    };

    this.dialogRef.close(payload);
  }

  close() {
    this.dialogRef.close();
  }
}