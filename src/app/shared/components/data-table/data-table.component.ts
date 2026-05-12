import { Component, Input, Output, EventEmitter, ViewChild, OnChanges, SimpleChanges, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator'; // Importa MatPaginatorIntl

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatButtonModule, 
    MatIconModule, 
    MatProgressSpinnerModule,
    MatPaginatorModule 
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnChanges, AfterViewInit {
  @Input() dataSource: any[] = []; 
  @Input() columns: any[] = [];    
  @Input() loading: boolean = false;

  @Output() onEdit = new EventEmitter<any>();   
  @Output() onDelete = new EventEmitter<any>(); 

  internalDataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Inyectamos MatPaginatorIntl en el constructor para modificarlo directamente
  constructor(private intl: MatPaginatorIntl) {
    this.setupSpanishPaginator();
  }

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource'] && this.dataSource) {
      this.internalDataSource.data = this.dataSource;
      if (this.paginator) {
        this.internalDataSource.paginator = this.paginator;
      }
    }
  }

  ngAfterViewInit(): void {
    this.internalDataSource.paginator = this.paginator;
  }

  private setupSpanishPaginator() {
    this.intl.itemsPerPageLabel = 'Registros por página:';
    this.intl.nextPageLabel = 'Siguiente';
    this.intl.previousPageLabel = 'Anterior';
    this.intl.firstPageLabel = 'Primera página';
    this.intl.lastPageLabel = 'Última página';

    this.intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 1 || pageSize === 0) return `1 de ${length}`;
      length = Math.max(length,0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? 
        Math.min(startIndex + pageSize, length) : 
        startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} de ${length}`;
    };

    // Notificar al componente que los textos cambiaron
    this.intl.changes.next();
  }
}