import { Component, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Auth } from '../../../auth/services/auth';

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
  @Input() dataSource: any[] = [];
  @Input() columns: any[] = [];
  @Input() loading: boolean = false;

  @Output() onEdit = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();
  @Output() onView = new EventEmitter<any>();

  private auth = inject(Auth);

  isCurrentUserVigilante = computed(() => this.auth.isVigilante());

  esVisitante(element: any): boolean {
    return element.roles?.some((r: any) => r.name?.toUpperCase() === 'VISITANTE') ?? false;
  }

  get displayedColumns(): string[] {
    return this.columns.map(c => c.key);
  }
}