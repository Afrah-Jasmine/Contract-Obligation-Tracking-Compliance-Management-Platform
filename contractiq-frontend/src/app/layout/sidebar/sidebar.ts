import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: 'grid' },
    { label: 'Contracts', route: '/contracts', icon: 'file-text' },
    { label: 'Obligations', route: '/obligations', icon: 'check-square' },
    { label: 'Renewals', route: '/renewals', icon: 'refresh-cw' },
    { label: 'Compliance', route: '/compliance', icon: 'shield-check' },
    { label: 'Notifications', route: '/notifications', icon: 'bell' },
    { label: 'Reports', route: '/reports', icon: 'bar-chart-2' },
    { label: 'Audit History', route: '/audit-history', icon: 'history' },
  ];

  constructor(public authService: AuthService) {}
}