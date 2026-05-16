import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../core/services/auth'; // Ajusta la ruta según tu estructura

@Component({
  selector: 'app-page-not-found',
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './page-not-found.html',
  styleUrl: './page-not-found.scss',
})
export class PageNotFound {
  private authService = inject(Auth);
  private router = inject(Router);
  
  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }
  
  goBack(): void {
    if (this.isAuthenticated) {
      this.router.navigate(['/inicio']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
