import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  computed, 
  inject, 
  ViewChild, 
  AfterViewInit, 
  OnChanges, 
  SimpleChanges 
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { 
  MatPaginator, 
  MatPaginatorModule, 
  MatPaginatorIntl 
} from '@angular/material/paginator'; // Importación esencial para el paginador
import { Auth } from '../../../auth/services/auth';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule // Debe estar aquí para que @ViewChild(MatPaginator) funcione
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements AfterViewInit, OnChanges {
  @Input() dataSource: any[] = [];
  @Input() columns: any[] = [];
  @Input() loading: boolean = false;

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onView = new EventEmitter<any>();

  // Inyección de servicios
  private auth = inject(Auth);
  private intl = inject(MatPaginatorIntl); // Inyección moderna preferida

  // Lógica de permisos
  isCurrentUserVigilante = computed(() => this.auth.isVigilante());

  // Configuración de la tabla
  internalDataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    this.setupSpanishPaginator();
  }

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  esVisitante(element: any): boolean {
    return element.roles?.some((r: any) => r.name?.toUpperCase() === 'VISITANTE') ?? false;
  }

  // Detecta cambios en la data que viene del padre
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource'] && this.dataSource) {
      this.internalDataSource.data = this.dataSource;
      this.assignPaginator();
    }
  }

  // Se ejecuta después de que la vista carga (necesario para el paginador)
  ngAfterViewInit(): void {
    this.assignPaginator();
  }

  private assignPaginator(): void {
    if (this.paginator) {
      this.internalDataSource.paginator = this.paginator;
    }
  }

  private setupSpanishPaginator(): void {
    this.intl.itemsPerPageLabel = 'Registros por página:';
    this.intl.nextPageLabel = 'Siguiente';
    this.intl.previousPageLabel = 'Anterior';
    this.intl.firstPageLabel = 'Primera página';
    this.intl.lastPageLabel = 'Última página';

    this.intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
      if (length === 0 || pageSize === 0) return `0 de ${length}`;
      length = Math.max(length, 0);
      const startIndex = page * pageSize;
      const endIndex = startIndex < length ? 
        Math.min(startIndex + pageSize, length) : 
        startIndex + pageSize;
      return `${startIndex + 1} - ${endIndex} de ${length}`;
    };

    this.intl.changes.next();
  }
}