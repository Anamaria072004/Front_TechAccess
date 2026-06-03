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
  /**
   * Traduce el nombre del color en texto a un código HEX para el CSS
   */
  obtenerHexColor(nombreColor: string): string {
    if (!nombreColor) return '#e0e0e0'; // Color gris claro por defecto si es nulo

    // Diccionario de colores (llave: texto exacto o en minúsculas -> valor: código Hexadecimal)
    const mapaColores: { [key: string]: string } = {
      'gris oscuro': '#4A4A4A',
      'gris plata': '#c5c3c3',
      'rojo': '#f50c08',
      'rojo oscuro': '#ad0707',
      'azul': '#0471cf',
      'azul oscuro' : '#0a045e',
      'blanco': '#FFFFFF',
      'negro': '#1A1A1A',
      'verde': '#059e0d',
      'marron': '#534816',
      'naranja': '#ff8400'
    };

    // Limpiamos el texto (quitamos espacios de más y lo pasamos a minúsculas)
    const colorNormalizado = nombreColor.toLowerCase().trim();

    // Si el color existe en el diccionario lo devuelve, si no, usa el gris por defecto
    return mapaColores[colorNormalizado] || 'Otros';
  }
}
