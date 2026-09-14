import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../services/auth';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css'
})
export class Layout {

  sidebarOpen = true;

  constructor(public authService: AuthService) {}

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  get userRole(): string {
    return this.authService.getUserRole() ?? 'USER';
  }

  get isAdministrator(): boolean {
    return this.userRole === 'ADMINISTRATOR';
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}