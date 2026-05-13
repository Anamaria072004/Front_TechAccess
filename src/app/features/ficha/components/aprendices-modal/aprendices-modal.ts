import { Component, Inject, OnInit, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
  styleUrl: './aprendices-modal.scss'
})
export class AprendicesModalComponent implements OnInit {
  private fichaService = inject(FichaService);
  aprendices: any[] = [];
  loading = true;

  constructor(@Inject(MAT_DIALOG_DATA) public data: { fichaId: number, numficha: string }) {}

  ngOnInit(): void {
    this.cargarAprendices();
  }

  cargarAprendices(): void {
    this.fichaService.getAprendices(this.data.fichaId).subscribe({
      next: (res: any) => {
        // Ajusta según si tu API devuelve res o res.data
        this.aprendices = res.data || res;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}