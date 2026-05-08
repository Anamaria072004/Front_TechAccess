import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {
  // Nombres de Inputs sincronizados con tu HTML de @if/@else
  @Input() dataSource: any[] = []; 
  @Input() columns: any[] = [];    
  @Input() loading: boolean = false;

  // Nombres de Outputs sincronizados
  @Output() onEdit = new EventEmitter<any>();   
  @Output() onDelete = new EventEmitter<any>(); 

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }
}