import { Component, Inject, OnInit, inject, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { FichaService } from '../../services/ficha.service';

@Component({
  selector: 'app-aprendices-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatTableModule, MatIconModule],
  templateUrl: './aprendices-modal.html',
  styleUrl: './aprendices-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AprendicesModalComponent implements OnInit {
  private fichaService = inject(FichaService);
  private dialogRef = inject(MatDialogRef<AprendicesModalComponent>);
  private cdr = inject(ChangeDetectorRef);
  
  aprendices: any[] = [];
  loading = true;
  displayedColumns = ['nombre', 'docType', 'documento', 'email', 'telefono'];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { fichaId: number, numficha: string }) {}

  ngOnInit(): void {
    this.cargarAprendices();
  }

  cargarAprendices(): void {
    this.fichaService.getAprendices(this.data.fichaId).subscribe({
      next: (res: any) => {
        this.aprendices = res.data || res;
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.aprendices = [];
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
