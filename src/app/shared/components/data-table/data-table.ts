import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ViewChild,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginator, MatPaginatorModule, MatPaginatorIntl } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  providers: [MatPaginatorIntl],
  templateUrl: './data-table.html',
  styleUrls: ['./data-table.scss']
})
export class DataTableComponent implements OnChanges {
  @Input() dataSource: any[] = [];
  @Input() columns: any[] = [];
  @Input() loading: boolean = false;
  @Input() pageSize: number = 5;
  @Input() showEdit: boolean = true;
  @Input() showDelete: boolean = true;
  
  // ✅ ELIMINA esta línea: @Input() isVigilante: boolean = false;
  
  private _isVigilante: boolean = false;

  @Input()
  set isVigilante(value: boolean) {
    this._isVigilante = value;
    console.log('🔥 isVigilante setter llamado con:', value);
  }

  get isVigilante(): boolean {
    return this._isVigilante;
  }

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onView = new EventEmitter<any>();

  private intl = inject(MatPaginatorIntl);
  private cdr = inject(ChangeDetectorRef);
  internalDataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator) {
    if (paginator) {
      setTimeout(() => {
        this.internalDataSource.paginator = paginator;
        this.cdr.markForCheck();
      });
    }
  }

  constructor() {
    this.setupSpanishPaginator();
  }

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataSource']) {
      this.internalDataSource.data = this.dataSource || [];
    }
    
    // DEBUG: Ver qué valores están llegando
    console.log('=== DATATABLE DEBUG ===');
    console.log('showDelete:', this.showDelete);
    console.log('isVigilante:', this.isVigilante);
    console.log('¿Mostrar eliminar?', this.showDelete && !this.isVigilante);
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